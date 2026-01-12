#requires -Version 7.0
<#
  claude-figma-connect.ps1
  - Moves to project directory
  - Verifies bun installed
  - (Optional) bun install
  - (Optional) bun run build:win
  - Starts WebSocket server via `bun socket`
  - Verifies server via http://localhost:3055/status
#>

[CmdletBinding()]
param(
  # Run `bun install` before starting the server
  [switch]$Install,

  # Run Windows build before starting the server (bun run build:win)
  [switch]$BuildWin,

  # If server already responds on /status, exit successfully without starting a new one
  [switch]$SkipIfRunning,

  # Override project directory if needed
  [string]$ProjectDir = (Join-Path $HOME "Documents/Backup/Projects/Tools/claude-talk-to-figma-mcp"),

  # Status endpoint from README
  [string]$StatusUrl = "http://localhost:3055/status"
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message, [int]$Code = 1) {
  Write-Error $Message
  exit $Code
}

function Test-ServerStatus([string]$Url) {
  try {
    # Keep it lightweight and quick
    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
    return ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300)
  } catch {
    return $false
  }
}

# 1) Validate project dir
if (-not (Test-Path -LiteralPath $ProjectDir)) {
  Fail "Project directory not found: $ProjectDir"
}

# 2) Ensure bun exists
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
  Fail "bun not found in PATH. Install Bun first (https://bun.sh) and restart pwsh."
}

# 3) Optional: if server already running, skip
if ($SkipIfRunning -and (Test-ServerStatus $StatusUrl)) {
  Write-Host "✅ Server already running: $StatusUrl"
  exit 0
}

# 4) cd into project
Set-Location -LiteralPath $ProjectDir

# 5) Validate package.json exists
$pkgPath = Join-Path $ProjectDir "package.json"
if (-not (Test-Path -LiteralPath $pkgPath)) {
  Fail "package.json not found in: $ProjectDir"
}

# 6) Validate scripts: socket (required), build:win (optional if -BuildWin)
try {
  $pkg = Get-Content -LiteralPath $pkgPath -Raw | ConvertFrom-Json
} catch {
  Fail "Failed to parse package.json as JSON: $pkgPath"
}

$scripts = $pkg.scripts
if ($null -eq $scripts -or -not ($scripts.PSObject.Properties.Name -contains "socket")) {
  Write-Host "❌ Script 'socket' not found in package.json scripts."
  Write-Host "README expects you to start server with: bun socket (== bun run socket)."
  Write-Host "Available scripts:"
  if ($scripts) {
    $scripts.PSObject.Properties.Name | Sort-Object | ForEach-Object { Write-Host (" - " + $_) }
  } else {
    Write-Host " (no scripts found)"
  }
  exit 2
}

if ($BuildWin -and -not ($scripts.PSObject.Properties.Name -contains "build:win")) {
  Write-Host "❌ -BuildWin requested, but script 'build:win' not found in package.json."
  Write-Host "Available scripts:"
  $scripts.PSObject.Properties.Name | Sort-Object | ForEach-Object { Write-Host (" - " + $_) }
  exit 3
}

# 7) Optional install
if ($Install) {
  Write-Host "Running: bun install"
  bun install
}

# 8) Optional Windows build (README mentions Windows build: bun run build:win)
if ($BuildWin) {
  Write-Host "Running: bun run build:win"
  bun run build:win
}

# 9) Start server (README: Start server: bun socket; verify at /status)
Write-Host "Starting WebSocket server: bun socket"
Write-Host "Verify: $StatusUrl"
Write-Host "Press Ctrl+C to stop."
bun socket

# If bun socket exits, report it
Write-Host "Server process exited."
