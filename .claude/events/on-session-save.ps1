# Claude Code Hook - 세션 저장
# Stop 훅: 에이전트별 백업 → 머지 → latest.json/md → 정리

$ErrorActionPreference = "SilentlyContinue"

#region 설정
$SessionDir = Join-Path $PSScriptRoot "..\sessions"
$AgentsDir = Join-Path $SessionDir "agents"
$MaxSavesPerAgent = 5
$MaxMergedSessions = 5
#endregion

#region 헬퍼 함수
function Get-PropValue {
    param($Obj, [string]$Name)
    if ($null -eq $Obj) { return $null }

    # Hashtable 지원
    if ($Obj -is [hashtable]) {
        if ($Obj.ContainsKey($Name)) { return $Obj[$Name] }
        return $null
    }

    # PSCustomObject 지원
    $p = $Obj.PSObject.Properties[$Name]
    if ($null -eq $p) { return $null }
    return $p.Value
}

function Write-AtomicFile {
    param([string]$Path, [string]$Content)
    $tempPath = "$Path.tmp"
    [System.IO.File]::WriteAllText($tempPath, $Content, [System.Text.Encoding]::UTF8)
    Move-Item -Path $tempPath -Destination $Path -Force
}

function Backup-AgentCurrentFiles {
    param([string]$AgentsDir, [int]$MaxSaves)

    Get-ChildItem -Path $AgentsDir -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        $agentDir = $_.FullName
        $currentFile = Join-Path $agentDir "current.json"

        if (Test-Path $currentFile) {
            $timestamp = (Get-Date).ToString("yyyy-MM-ddTHH-mm-ss")
            $backupFile = Join-Path $agentDir "save-$timestamp.json"
            Copy-Item -Path $currentFile -Destination $backupFile -Force

            $saves = Get-ChildItem -Path $agentDir -Filter "save-*.json" |
                Sort-Object LastWriteTime -Descending
            if ($saves.Count -gt $MaxSaves) {
                $saves | Select-Object -Skip $MaxSaves | ForEach-Object {
                    Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
}

function Merge-AgentSessions {
    param([string]$AgentsDir)

    $merged = @{
        metadata = @{
            mergedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            projectPath = (Get-Location).Path
        }
        workInProgress = $null
        decisions = @()
        todos = @{ completed = @(); pending = @() }
        context = @{ activeFiles = @(); activeAgents = @() }
    }

    $latestTimestamp = $null

    Get-ChildItem -Path $AgentsDir -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        $agentName = $_.Name
        $currentFile = Join-Path $_.FullName "current.json"

        if (Test-Path $currentFile) {
            try {
                $data = Get-Content $currentFile -Raw -Encoding UTF8 | ConvertFrom-Json
                $merged.context.activeAgents += $agentName

                $wip = Get-PropValue $data "workInProgress"
                if ($wip) {
                    $ts = Get-PropValue $wip "updatedAt"
                    if ($ts -and (!$latestTimestamp -or $ts -gt $latestTimestamp)) {
                        $latestTimestamp = $ts
                        $merged.workInProgress = $wip
                    }
                }

                $decisions = Get-PropValue $data "decisions"
                if ($decisions) { $merged.decisions += $decisions }

                $todos = Get-PropValue $data "todos"
                if ($todos) {
                    $c = Get-PropValue $todos "completed"
                    $p = Get-PropValue $todos "pending"
                    if ($c) { $merged.todos.completed += $c }
                    if ($p) { $merged.todos.pending += $p }
                }

                $ctx = Get-PropValue $data "context"
                if ($ctx) {
                    $files = Get-PropValue $ctx "activeFiles"
                    if ($files) { $merged.context.activeFiles += $files }
                }
            } catch {}
        }
    }

    $merged.context.activeFiles = @($merged.context.activeFiles | Select-Object -Unique)
    $merged.context.activeAgents = @($merged.context.activeAgents | Select-Object -Unique)

    $seen = @{}
    $merged.decisions = @($merged.decisions | Where-Object {
        $topic = Get-PropValue $_ "topic"
        if ($topic -and !$seen[$topic]) { $seen[$topic] = $true; $true } else { $false }
    })

    return $merged
}

function ConvertTo-SessionMarkdown {
    param([object]$Data)

    $meta = Get-PropValue $Data "metadata"
    $savedAt = if ($meta) { Get-PropValue $meta "mergedAt" } else { (Get-Date).ToString("yyyy-MM-dd HH:mm:ss") }

    $md = "# 이전 세션 요약`n`n**저장 시간:** $savedAt`n"

    $wip = Get-PropValue $Data "workInProgress"
    if ($wip) {
        $task = Get-PropValue $wip "currentTask"
        $agent = Get-PropValue $wip "agent"
        $progress = Get-PropValue $wip "progress"
        $md += "`n## 진행 중인 작업`n"
        if ($task) { $md += "- **현재 작업:** $task`n" }
        if ($agent) { $md += "- **담당 에이전트:** $agent`n" }
        if ($progress) { $md += "- **진행률:** $progress`n" }
    }

    $decisions = Get-PropValue $Data "decisions"
    if ($decisions -and $decisions.Count -gt 0) {
        $md += "`n## 주요 결정사항`n"
        $i = 1
        foreach ($d in $decisions) {
            $topic = Get-PropValue $d "topic"
            $decision = Get-PropValue $d "decision"
            $reason = Get-PropValue $d "reason"
            $reasonStr = if ($reason) { " ($reason)" } else { "" }
            $md += "$i. **$topic**: $decision$reasonStr`n"
            $i++
        }
    }

    $todos = Get-PropValue $Data "todos"
    if ($todos) {
        $completed = Get-PropValue $todos "completed"
        $pending = Get-PropValue $todos "pending"
        if (($completed -and $completed.Count -gt 0) -or ($pending -and $pending.Count -gt 0)) {
            $md += "`n## TODO 현황`n"
            if ($completed) {
                foreach ($t in $completed) {
                    $task = if ($t -is [string]) { $t } else { Get-PropValue $t "task" }
                    $md += "- [x] $task`n"
                }
            }
            if ($pending) {
                foreach ($t in $pending) {
                    $task = if ($t -is [string]) { $t } else { Get-PropValue $t "task" }
                    $md += "- [ ] $task`n"
                }
            }
        }
    }

    $ctx = Get-PropValue $Data "context"
    if ($ctx) {
        $files = Get-PropValue $ctx "activeFiles"
        $agents = Get-PropValue $ctx "activeAgents"
        if (($files -and $files.Count -gt 0) -or ($agents -and $agents.Count -gt 0)) {
            $md += "`n## 활성 컨텍스트`n"
            if ($files -and $files.Count -gt 0) {
                $md += "- **작업 파일:** ``$($files -join '``, ``')```n"
            }
            if ($agents -and $agents.Count -gt 0) {
                $md += "- **활성 에이전트:** $($agents -join ', ')`n"
            }
        }
    }

    $md += "`n---`n*이 세션을 이어서 진행하시겠습니까?*`n"
    return $md
}

function Remove-OldMergedSessions {
    param([string]$Dir, [int]$Keep)
    $files = Get-ChildItem -Path $Dir -Filter "session-*.json" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending
    if ($files.Count -gt $Keep) {
        $files | Select-Object -Skip $Keep | ForEach-Object {
            Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
        }
    }
}
#endregion

#region 메인
try {
    if (-not (Test-Path $SessionDir)) { exit 0 }
    if (-not (Test-Path $AgentsDir)) { exit 0 }

    $agentDirs = Get-ChildItem -Path $AgentsDir -Directory -ErrorAction SilentlyContinue
    if (-not $agentDirs -or $agentDirs.Count -eq 0) { exit 0 }

    # 0. latest.md 보존 체크 - 수동 저장된 내용이 더 최신이면 덮어쓰기 생략
    $latestMd = Join-Path $SessionDir "latest.md"
    if (Test-Path $latestMd) {
        $latestMdTime = (Get-Item $latestMd).LastWriteTime
        $newerAgentFile = Get-ChildItem -Path $AgentsDir -Recurse -Filter "current.json" -ErrorAction SilentlyContinue |
            Where-Object { $_.LastWriteTime -gt $latestMdTime }
        if (-not $newerAgentFile) {
            # latest.md가 모든 current.json보다 최신 → 수동 저장 보존
            exit 0
        }
    }

    # 1. 에이전트별 백업
    Backup-AgentCurrentFiles -AgentsDir $AgentsDir -MaxSaves $MaxSavesPerAgent

    # 2. 머지
    $merged = Merge-AgentSessions -AgentsDir $AgentsDir

    # 3. latest.json
    $latestJson = Join-Path $SessionDir "latest.json"
    $jsonContent = $merged | ConvertTo-Json -Depth 10
    Write-AtomicFile -Path $latestJson -Content $jsonContent

    # 4. latest.md
    $latestMd = Join-Path $SessionDir "latest.md"
    $mdContent = ConvertTo-SessionMarkdown -Data $merged
    Write-AtomicFile -Path $latestMd -Content $mdContent

    # 5. 전체 백업
    $timestamp = (Get-Date).ToString("yyyy-MM-ddTHH-mm-ss")
    $backupPath = Join-Path $SessionDir "session-$timestamp.json"
    Copy-Item -Path $latestJson -Destination $backupPath -Force -ErrorAction SilentlyContinue

    # 6. 정리
    Remove-OldMergedSessions -Dir $SessionDir -Keep $MaxMergedSessions

    exit 0
} catch {
    exit 0
}
#endregion
