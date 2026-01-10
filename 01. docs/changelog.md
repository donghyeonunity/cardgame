# 문서 변경 로그

프로젝트 문서의 변경 이력을 기록합니다.

---

## 2026-01-10 - Git Hook 기반 문서 의존성 자동 체크

### 변경 내용
- `.git/hooks/pre-commit`: Git pre-commit hook 스크립트 추가
  - 커밋 시 변경된 .md 파일의 연관 문서 자동 체크
  - changelog.md 필수 포함 여부 검증
  - 미포함 연관 문서 경고 표시
- `CLAUDE.md`: Git Hook 기반 자동 감지 섹션 추가

### 관련 결정
- **자동 감지 방식**: Git hook으로 커밋 시점에 의존성 체크
- **경고 수준**: 차단 없이 경고만 표시, `--no-verify`로 우회 가능

---

## 2026-01-10 - 하이브리드 문서 업데이트 시스템 구축

### 변경 내용
- `.claude/docs/dependency-map.md`: 문서 의존성 맵 신규 생성
  - 전직 시스템, 콘텐츠, 프로젝트, UI/UX 문서 간 연관 관계 정의
  - 공통 규칙 (모든 변경 시 changelog.md 필수 업데이트)
- `CLAUDE.md`: 하이브리드 업데이트 규칙 추가
  - 평소 (저개입), 작업 완료 시 (자동 제안), 주기적 (TODO 완료 시) 워크플로우
- `PA.md`: 문서 업데이트 워크플로우 섹션 추가
  - dependency-map.md 기반 연관 문서 파악 및 제안 절차
- `docs-mapping.md`: 연관 문서 관리 섹션 추가
  - dependency-map.md 참조 및 업데이트 절차

### 관련 결정
- **토큰 최적화**: 전체 문서 대신 의존성 맵만 로드하여 연관 관계 파악
- **하이브리드 방식**: 평소에는 조용히, 작업 완료 시 제안, 주기적 체크리스트

---

## 2026-01-10 - 전직 시스템 재설계

### 변경 내용
- `class-advancement.md`: 전직 시스템 전면 재설계
  - 전직 전용 카드 → 공통 카드 기반으로 변경
  - 카드 공유 구조 도입 (하나의 카드가 여러 전직에 기여)
  - 다중 전직 조건 충족 시 선택권 부여
- `class-advancement-decision.md`: 의사결정 과정 문서 신규 생성
  - 문제 인식 및 해결 방향 탐색 기록
  - 최종 선택 이유 문서화

### 관련 결정
- **문제**: 원하는 전직 카드가 안 뜨면 리스타트하는 지루함
- **해결**: 공통 카드가 여러 전직에 기여 → 어떤 카드든 전직에 도움
- **차별점**: 조건 동시 충족 시 플레이어 선택권 부여

---

## 2026-01-10 - 카드 프리뷰 시스템 문서화

### 변경 내용
- `systems/card-preview.md`: 카드 프리뷰 시스템 문서 생성 및 업데이트
  - 프리뷰 영역: 깜빡임 제거, 고정 투명도 40%
  - HP 텍스트: 예상 HP 표시 (색상 흰색 유지)
  - 데미지 숫자: HP 바 위에 "-N" 표시

### 관련 결정
- 프리뷰 UI는 은은하게 표시 (투명도 40%, 애니메이션 없음)
- HP 텍스트 색상은 기존 흰색 유지

---

## 2026-01-10 - 프로토타입 핵심 기능 구현 완료

### 변경 내용

#### 5라운드 시스템
- `types/index.ts`: `RunState` 인터페이스 추가
- `data/enemies.ts`: 5종 적 데이터 추가 (슬라임, 고블린, 오크, 해골, 암흑기사)
- `stores/gameStore.ts`: `startRun()`, `startNextRound()` 액션 추가
- `components/screens/BattleScreen.tsx`: 라운드 표시 UI, 런 클리어 화면 추가

#### 전직 힌트 시스템
- `utils/advancementSystem.ts`: 전직 진행도 계산 함수
- `components/common/AdvancementHint.tsx`: 힌트 UI 컴포넌트
- `components/screens/RewardScreen.tsx`: 보상 카드에 힌트 통합

#### 문서 정리
- `paladin.md`: 전직 시스템 문서 링크 수정
- `advancement-hint.md`: 관련 문서 링크 수정
- `scope-board.md`: 구현 완료 항목 체크

### 관련 결정
- 전사 시작 덱은 순수 전사 카드만 포함 (`createWarriorStarterDeck` 사용)
- HP는 라운드 간 지속, 에너지/방어력은 리셋

---

## 2026-01-10 - 프로젝트 문서 재검토

### 변경 내용
- `01. one-pager.md`: 기술 스택 변경 반영 (Unity → React + TypeScript), 플랫폼 변경 (PC → 웹)
- `02. scope-board.md`: 구현 완료 항목 체크리스트 업데이트
- `03. milestone.md`: Unity 용어를 React 용어로 변환, 1주차 검증 기준 완료 체크
- `04. production-pipeline.md`: 빌드 프로세스를 웹 개발 프로세스로 변경
- `05. tech-stack.md`: 버전 정보 최신화 (React 19, Vite 7, Zustand 5, Immer 11, Framer Motion 12)

### 관련 결정
- 프로토타입은 웹 기반 React로 진행, Unity 본개발은 프로토타입 검증 후 결정

---

## 2026-01-10 - PA (세션 복구 시스템 완료)

### 변경 내용
- `CLAUDE.md`: Session Recovery 섹션 추가, Document Auto-Update 섹션 추가
- `PA.md`: 세션 복구 체크 워크플로우 추가, 문서 명령어 추가
- `.claude/sessions/README.md`: 세션 복구 시스템 유지보수 문서 생성
- `.claude/events/on-session-save.ps1`: 세션 저장 스크립트 생성
- `.claude/settings.json`: Stop 훅에 세션 저장 스크립트 등록

### 관련 결정
- 저장 구조: 에이전트별 폴더 분리 (동시성 처리 용이)
- 백업 정책: 에이전트별 5개, 전체 머지 5개 유지
- 저장 트리거: AskUserQuestion 응답, TODO 완료, 파일 수정 시
- 복구 트리거: PA 에이전트가 첫 요청 시 자동 체크

---

## 2026-01-10 - PA

### 변경 내용
- `docs-mapping.md`: 에이전트-문서 매핑 시스템 생성
- `changelog.md`: 변경 로그 파일 생성

### 관련 결정
- 에이전트 작업 완료 시 담당 문서 자동 업데이트 시스템 도입
- 모든 문서 변경은 이 로그에 기록

---

<!-- 새 변경 사항은 위에 추가 -->
