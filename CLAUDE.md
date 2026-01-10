# CLAUDE.md

## User Preferences & Context

### 1. Language Guidelines (언어 지침)
- **All Responses in Korean:** 모든 답변, 문서, 코드 주석, 설명은 반드시 **한국어(Korean)**로 작성해야 합니다.
- **Terminology:** 기술 용어는 한국 현업에서 통용되는 표준 용어를 사용하며, 필요 시 괄호 안에 영문을 병기합니다 (예: 의존성 주입(Dependency Injection)).

### 2. Documentation Standards
- 앞으로 생성하는 모든 문서는 한국어 문법과 자연스러운 표현을 따릅니다.
- 명확하고 간결한 문체를 사용합니다.

--

## Git Commit Convention
커밋 메시지 제안 시 다음 규칙을 따른다:
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등 (비즈니스 로직 변경 없음)
- `refactor`: 코드 리팩토링
- **Format:** `[태그] 설명` (예: `feat: 사용자 로그인 API 구현`)

---

## Incremental Planning Guidelines (점진적 계획 지침)
에이전트는 대화 시 다음 원칙을 따라 점진적으로 계획을 세웁니다:

### 1. 단계별 확인 (Step-by-Step Confirmation)
- 한 번에 모든 것을 계획하지 않고, 각 단계마다 사용자의 확인을 받습니다.
- 다음 단계로 진행하기 전에 현재 단계의 방향성이 맞는지 확인합니다.

### 2. 작은 단위 분할 (Small Unit Decomposition)
- 큰 작업은 작은 단위로 나누어 하나씩 완료합니다.
- 각 단위 작업이 완료될 때마다 진행 상황을 공유합니다.

### 3. 피드백 반영 (Feedback Integration)
- 사용자의 피드백을 적극적으로 수용하여 계획을 발전시킵니다.
- 계획은 고정된 것이 아니라 대화를 통해 점진적으로 개선됩니다.

---

## Agent System (에이전트 시스템)

### 필수 규칙: PA 에이전트 활용
**모든 사용자 요청은 PA(Personal Assistant) 에이전트를 통해 처리합니다.**

1. **요청 접수 시**: PA 에이전트 문서(`.claude/agents/PA.md`)를 먼저 읽습니다
2. **에이전트 라우팅**: PA가 적절한 전문 에이전트를 선택합니다
3. **작업 실행**: 선택된 에이전트의 워크플로우를 따릅니다

### 참조 문서
- `.claude/agents/PA.md`: 메인 에이전트
- `.claude/agents/AGENT_SYSTEM.md`: 에이전트 시스템 아키텍처

---

## Session Recovery (세션 복구 시스템)

### 필수: 세션 자동 저장
**다음 시점에 반드시 세션을 저장해야 합니다:**

#### 저장 트리거 (필수 실행)
1. **AskUserQuestion 응답 직후** → 사용자 선택/결정 저장
2. **TODO 항목 완료 시** → 진행 상태 저장
3. **주요 파일 수정 완료 시** → 작업 컨텍스트 저장

#### 저장 실행 방법
저장 시점에 **반드시** Write 도구로 파일 저장:

```
경로: .claude/sessions/agents/[에이전트명]/current.json
```

에이전트명 예시: `PA`, `ui-ux-manager`, `content-manager`, `project-pd`

#### 저장 형식
```json
{
  "workInProgress": {
    "currentTask": "현재 작업 설명",
    "agent": "에이전트명",
    "progress": "진행률 (예: 50%)",
    "updatedAt": "2026-01-10T12:30:00"
  },
  "decisions": [
    { "topic": "결정 주제", "decision": "결정 내용", "reason": "이유" }
  ],
  "todos": {
    "completed": ["완료된 작업1", "완료된 작업2"],
    "pending": ["대기 중 작업1", "대기 중 작업2"]
  },
  "context": {
    "activeFiles": ["작업 중인 파일 경로"]
  }
}
```

### 세션 복구 안내
- PA 에이전트가 첫 요청 시 `.claude/sessions/latest.md` 확인
- 24시간 이내 세션이 있으면 복구 안내
- 사용자가 "예", "이어서", "복구" 응답 시 세션 복구

### 참조
- `.claude/sessions/README.md`: 시스템 상세 문서
- `.claude/sessions/agents/`: 에이전트별 세션 파일

---

## Document Auto-Update (문서 자동 업데이트)

### 필수: 문서 업데이트 규칙
**에이전트 작업 시 담당 문서를 반드시 업데이트합니다.**

#### 업데이트 트리거 (필수 실행)
1. **작업 완료 시** → 담당 문서에 결과 반영
2. **중요 결정 시** → 관련 문서에 결정 내용 반영
3. **사용자 "문서 업데이트" 요청 시** → 즉시 실행

#### 업데이트 절차
```
1. .claude/agents/docs-mapping.md 확인 → 담당 문서 파악
2. 해당 문서 수정 (내용 추가/변경)
3. 01. docs/changelog.md에 변경 이력 추가
```

#### 변경 로그 형식
```markdown
## [날짜] - [에이전트명]

### 변경 내용
- [문서명]: [변경 설명]

### 관련 결정
- [결정 내용]
```

#### 명령어
- `문서 업데이트`: 담당 문서 업데이트 실행
- `문서 목록`: 담당 문서 목록 확인
- `변경 로그`: 최근 변경 이력 확인

### 하이브리드 업데이트 규칙

문서 업데이트는 토큰 효율을 위해 하이브리드 방식으로 진행합니다.

#### 평소 (저개입)
- 문서 수정 시 조용히 진행
- 변경 내역을 내부적으로 추적
- 불필요한 알림 최소화

#### 작업 완료 시 (자동 제안)
1. `.claude/docs/dependency-map.md` 참조
2. 변경된 문서의 연관 문서 파악
3. "연관 문서 N개 발견. 업데이트할까요?" 형태로 제안
4. 사용자 승인 시 일괄 처리

#### 주기적 (TODO 완료 시)
- 미처리 연관 문서 체크리스트 표시
- 사용자 선택에 따라 처리
- `changelog.md` 자동 업데이트

### Git Hook 기반 자동 감지

커밋 시 pre-commit hook이 문서 의존성을 자동으로 체크합니다.

```
git commit -m "docs: 문서 수정"
    ↓
pre-commit hook 실행
    ↓
변경된 .md 파일의 연관 문서 확인
    ↓
[연관 문서 미포함] → 경고 표시
[changelog.md 미포함] → 필수 경고 표시
    ↓
--no-verify로 강제 커밋 가능
```

#### Hook 위치
- `.git/hooks/pre-commit`

#### 동작
- 스테이징된 .md 파일 감지
- `dependency-map.md` 참조하여 연관 문서 확인
- 미포함 연관 문서 경고 표시
- `changelog.md` 필수 체크

### 참조
- `.claude/agents/docs-mapping.md`: 에이전트-문서 매핑
- `.claude/docs/dependency-map.md`: 문서 의존성 맵
- `.git/hooks/pre-commit`: Git hook 스크립트
- `01. docs/changelog.md`: 변경 로그