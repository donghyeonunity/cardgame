# 세션 복구 시스템

## 개요

세션 종료 시 작업 상태를 자동 저장하고, 새 세션 시작 시 복구 안내를 제공하는 시스템입니다.

---

## 시스템 구성

### 파일 구조

```
.claude/sessions/
├── README.md                            # 이 문서
├── latest.json                          # 머지된 최신 상태
├── latest.md                            # 사람이 읽기 쉬운 요약
├── session-YYYY-MM-DDTHH-mm-ss.json     # 머지된 백업 (최대 5개)
│
└── agents/                              # 에이전트별 세션
    ├── ui-ux-manager/
    │   ├── current.json                 # 현재 상태
    │   └── save-*.json                  # 백업 (최대 5개)
    ├── content-manager/
    │   └── ...
    └── project-pd/
        └── ...
```

### 관련 파일

| 파일 | 역할 |
|------|------|
| `.claude/events/on-session-save.ps1` | Stop 훅에서 실행되는 저장 스크립트 |
| `.claude/settings.json` | 훅 설정 (Stop 이벤트에 스크립트 연결) |
| `CLAUDE.md` | 세션 저장 규칙 정의 |
| `.claude/agents/PA.md` | 세션 복구 안내 워크플로우 |

---

## 동작 흐름

### 저장 흐름

```
[대화 중]
Claude: 중요 결정/작업 완료 시
    ↓
agents/[에이전트명]/current.json 저장
    ↓
[세션 종료 - Stop 훅]
on-session-save.ps1 실행
    ↓
1. 에이전트별 current.json → save-[timestamp].json 백업
2. 모든 current.json 머지 → latest.json
3. latest.json → latest.md 변환
4. latest.json → session-[timestamp].json 백업
5. 오래된 파일 정리 (각 5개 유지)
```

### 복구 흐름

```
[새 세션 시작]
PA 에이전트: 첫 요청 시 latest.md 확인
    ↓
[24시간 이내 세션 존재]
복구 안내 메시지 표시
    ↓
사용자: "예" / "이어서" → latest.json 로드, 컨텍스트 복원
사용자: "아니오" / 다른 요청 → 새 세션 시작
```

---

## 사용자 명령어

| 명령어 | 설명 |
|--------|------|
| `세션 복구` | 이전 세션 복구 |
| `세션 저장` | 현재 상태 수동 저장 |
| `세션 목록` | 저장된 세션 확인 |
| `세션 삭제` | 모든 세션 삭제 |

---

## 설정 변경

### 백업 개수 변경

`on-session-save.ps1` 상단의 설정 변경:

```powershell
$MaxSavesPerAgent = 5    # 에이전트별 백업 개수
$MaxMergedSessions = 5   # 전체 머지 백업 개수
```

### 저장 시점 변경

`CLAUDE.md`의 "Session Recovery" 섹션에서 저장 시점 규칙 수정:

```markdown
#### 저장 시점
1. 중요 결정 직후
   - 기술/아키텍처 선택
   - 사용자와 합의한 사항
   - 설계 방향 결정
2. 작업 단계 완료 시
   - TODO 항목 완료
   - 파일 수정/생성 완료
```

### 복구 안내 방식 변경

`PA.md`의 "세션 복구 체크" 워크플로우 수정

---

## 데이터 형식

### current.json / latest.json

```json
{
  "metadata": {
    "mergedAt": "2026-01-10 16:45:00",
    "projectPath": "C:\\Users\\...\\cardgame"
  },
  "workInProgress": {
    "currentTask": "UI 컴포넌트 설계",
    "agent": "ui-ux-manager",
    "progress": "70%",
    "updatedAt": "2026-01-10T16:40:00"
  },
  "decisions": [
    {
      "topic": "상태 관리",
      "decision": "Zustand 사용",
      "reason": "가볍고 보일러플레이트 적음"
    }
  ],
  "todos": {
    "completed": ["프로젝트 구조 설정"],
    "pending": ["카드 시스템 구현"]
  },
  "context": {
    "activeFiles": ["src/components/Card.tsx"],
    "activeAgents": ["ui-ux-manager"]
  }
}
```

---

## 문제 해결

### 세션이 저장되지 않음

1. `.claude/sessions/agents/` 폴더 존재 확인
2. 에이전트가 `current.json`을 저장하는지 확인
3. `settings.json`의 Stop 훅 설정 확인

### 복구 안내가 표시되지 않음

1. `latest.md` 파일 존재 확인
2. 파일 수정 시간이 24시간 이내인지 확인
3. PA.md의 세션 복구 체크 워크플로우 확인

### 스크립트 오류

```powershell
# 직접 테스트
pwsh -NoProfile -File .claude/events/on-session-save.ps1
```

---

## 시스템 비활성화

세션 복구 시스템을 비활성화하려면:

1. `settings.json`에서 `on-session-save.ps1` 훅 제거
2. `PA.md`에서 세션 복구 체크 워크플로우 제거
3. `CLAUDE.md`에서 Session Recovery 섹션 제거

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-01-10 | 초기 구현 |
