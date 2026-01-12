# 문서 변경 로그

프로젝트 문서의 변경 이력을 기록합니다.

---

## 2026-01-12 - 피의 제단 구현 완료

### 변경 내용

#### 피의 제단 시스템 (Blood Altar)
- **계약 카드 시스템**: 기존 "3개 중 1개" → "다중 선택 (0~3개)"
- 계약 카드 3종 구현
  - 피의 재물 (💰): +80 골드, HP -10
  - 피의 힘 (⚔️): 최대 HP +10, 저주 카드 + 몬스터 공격력 +25%
  - 피의 유물 (💎): 피의 유물 장신구, 몬스터 HP +20%
- **히든 보상**: 3개 모두 선택 시 최대 에너지 +1
- **저주 카드**: 피의 빚 (0코스트, 소멸, HP -3)

#### UI/UX 개선
- 계약 카드 호버 시 획득 아이템 미리보기
- "속삭임" 애니메이션: 불투명도 펄스 + 빨간 글로우 + 미세한 떨림
- 순차 등장 애니메이션: 타이틀 → 부제목 → 계약 카드 → 선택 정보 → 버튼
- "제단에 바친다" 버튼: 선택 수에 따라 텍스트 떨림 강도 증가
- 장신구 TopBar 표시: 좌측 아이콘 + 호버 툴팁
- 마을 시설 타이틀: "🏠 [지역명] 마을" 형태

### 관련 코드 변경
- `dev/proto/src/data/facilities.ts`: 피의 제단 보상 데이터
- `dev/proto/src/data/accessories.ts`: 피의 유물 장신구
- `dev/proto/src/data/cards.ts`: 저주 카드 (피의 빚)
- `dev/proto/src/stores/gameStore.ts`: 피의 제단 상태 관리
- `dev/proto/src/components/screens/BattleScreen.tsx`: 피의 제단 UI
- `dev/proto/src/components/ui/TopBar.tsx`: 장신구 표시 UI

### 문서 업데이트
- `village-system.md`: 피의 제단 섹션 전면 개편, 구현 현황 업데이트

---

## 2026-01-11 - 마을 테마 적용 및 버그 수정

### 변경 내용

#### 동료 시스템 테마 변경 (잊혀진 숲)
- 동료 이름을 동물/정령 컨셉으로 변경
  - 숲의 정령 → **이끼 요정** (🧚)
  - 떠돌이 검사 → **야생 늑대** (🐺)
  - 수상한 상인 → **숲 올빼미** (🦉)
- description에서 트리거 텍스트 중복 제거
  - "턴 시작 시 HP 2 회복" → "HP 2 회복"

#### 시설 이름 변경
- 계약의 제단 → **정령의 샘** (🌊)
- 설명: "숲의 정령과 유대를 맺습니다"
- UI 텍스트: "유대를 맺을 정령 선택"
- 색상: amber → cyan (물/샘 테마)

#### 저주 카드 시스템
- `Card.tsx`: curse 카드 타입 스타일 추가
  - 색상: `border-purple-500 bg-purple-900`
  - 라벨: "저주"

#### 버그 수정
- `gameStore.ts`: playCard 함수 const → let 변경
  - "Assignment to constant variable" 에러 수정
  - 카드 드래그 앤 드롭 정상 작동
- `BattleScreen.tsx`: 미사용 TavernCompanionSelection 컴포넌트 제거

### 관련 코드 변경
- `dev/proto/src/data/companions.ts`: 동료 이름/이모지 변경
- `dev/proto/src/data/facilities.ts`: 시설 이름 변경
- `dev/proto/src/components/common/Card.tsx`: curse 타입 추가
- `dev/proto/src/stores/gameStore.ts`: 버그 수정
- `dev/proto/src/components/screens/BattleScreen.tsx`: UI 텍스트 변경

---

## 2026-01-11 - 마을 시스템 구현 (장신구, 시설, 선술집)

### 변경 내용

#### 마을 자동 진입 시스템
- 라운드 4(마을)에서 행선지 선택 없이 자동 진입
- 마을 진입 연출 화면 추가 (🏘️ 아이콘, 페이드인 애니메이션)
- `showDestinationSelection`에서 마을 라운드 감지 로직 추가

#### 장신구 시스템 (Accessory)
- `data/accessories.ts`: 잊혀진 숲 장신구 3종 정의
  - 이끼 낀 부적 (턴 시작 방어 +2)
  - 숲의 가호 (최대 HP +10)
  - 사냥꾼의 눈 (공격 +1)
- `selectAccessory` 액션: 장신구 획득 + stat_boost 즉시 적용
- 장신구 선택 UI: 팝업 형태로 표시

#### 시설 시스템 (Facility)
- `data/facilities.ts`: 공통 시설(선술집) + 잊혀진 숲 전용(피의 제단)
- `selectFacility` 액션: 시설별 다음 페이즈 라우팅
- 시설 선택 UI: 행선지 선택과 동일한 스타일 (전투 화면 내)

#### 선술집 동료 시스템 (Companion)
- `data/companions.ts`: 동료 3종 정의
  - 숲의 정령 (턴 시작 HP +2)
  - 떠돌이 검사 (턴 종료 적 3 데미지)
  - 수상한 상인 (턴 시작 카드 1장 드로우)
- `data/cards/common.ts`: 동료 연계 카드 3종 추가
  - 자연의 축복 (6 방어, 에너지 +1)
  - 연속 베기 (5 데미지 x 2회)
  - 행운의 주사위 (카드 2장 드로우)
- `selectCompanion` 액션: 동료 획득 + 연계 카드 덱에 추가
- 동료 선택 UI: 팝업 형태로 표시

### 마을 플로우

```
라운드 3 전투 완료 → 보상 선택 → 마을 자동 진입
    ↓
마을 진입 연출 (2.5초)
    ↓
장신구 선택 (팝업)
    ↓
시설 선택 (전투 화면 내)
    ↓
선술집: 동료 선택 (팝업) → 연계 카드 획득
피의 제단: (미구현)
    ↓
행선지 선택 (라운드 5)
```

### 관련 코드 변경
- `dev/proto/src/types/index.ts`: BattlePhase 마을 관련 추가
- `dev/proto/src/data/accessories.ts` (신규)
- `dev/proto/src/data/companions.ts` (신규)
- `dev/proto/src/data/facilities.ts` (신규)
- `dev/proto/src/data/cards/common.ts`: 동료 연계 카드 추가
- `dev/proto/src/stores/gameStore.ts`: 마을 관련 액션 추가
- `dev/proto/src/components/screens/BattleScreen.tsx`: 마을 UI 컴포넌트 추가

### 문서 업데이트
- `village-system.md`: 구현 현황 업데이트, 동료 연계 카드 섹션 추가

---

## 2026-01-11 - 행선지 시스템 및 지역 시스템 구현

### 변경 내용

#### 용어 변경 (Node → Destination)
- "노드(Node)"를 "행선지(Destination)"로 전체 리네이밍
  - `selectNode` → `selectDestination`
  - `showNodeSelection` → `showDestinationSelection`
  - `nodeOptions` → `destinationOptions`
  - `NodeType` → `DestinationType`
  - `NodeOption` → `DestinationOption`
  - `node_selection` → `destination_selection`
  - `nodes.ts` → `destinations.ts`

#### 지역 시스템 신규 추가
- `types/index.ts`: `Region` 인터페이스 추가
- `data/regions.ts`: 지역 데이터 파일 신규 생성
  - "잊혀진 숲" 지역 정의 (7라운드, 암흑 기사 보스)
- `stores/gameStore.ts`: `RunState`에 `regionId` 추가

#### 라운드 구조 변경 (10 → 7 라운드)
- 총 라운드 수를 10에서 7로 축소
- 라운드 4: 마을 (중간 지점)
- 라운드 7: 보스 전투

#### RoundProgress UI 개선
- 마을 아이콘(🏘️) 및 보스 아이콘(☠️) 추가
- passed/locked 원 크기 축소 (`w-3 h-3`)
- current 원 크기 유지 (`w-5 h-5`)
- TopBar에서 라운드 표시 제거

#### 중복 행선지 방지
- `generateDestinationOptions()`에서 사용된 적 추적
- 같은 적이 동시에 여러 행선지에 표시되지 않도록 개선

### 관련 문서 생성/업데이트
- `01. docs/.../systems/destination-system.md`: 행선지 시스템 문서 신규 생성
- `01. docs/.../systems/region-system.md`: 지역 시스템 문서 신규 생성
- `01. docs/.../screen.md`: RoundProgress, 행선지 선택 화면 섹션 추가

### 관련 코드 변경
- `dev/proto/src/types/index.ts`
- `dev/proto/src/data/destinations.ts`
- `dev/proto/src/data/regions.ts` (신규)
- `dev/proto/src/stores/gameStore.ts`
- `dev/proto/src/components/screens/BattleScreen.tsx`
- `dev/proto/src/components/ui/TopBar.tsx`

---

## 2026-01-11 - 팔라딘 오라 시스템 확장 및 전직 후 보상 풀 분리

### 변경 내용

#### 오라 시스템 변경
- 오라 지속 시간: 전투 종료까지 → **3턴**
- 오라 중첩 가능: 여러 오라 동시 활성화

#### 오라 카드 2종 추가
| 카드명 | 효과 |
|--------|------|
| 정의의 오라 | 3턴간 공격 카드 +2 데미지 |
| 수호의 오라 | 3턴간 턴 시작 +4 방어 |

#### 전직 후 보상 카드 풀 분리
- 전사: 공통 카드 풀
- 팔라딘: 팔라딘 전용 카드 풀 (정의의 오라, 수호의 오라, 신성한 일격, 정화의 방패)

### 관련 문서 업데이트
- `cards.md`: 오라 시스템 섹션 추가, 카드 목록 업데이트
- `paladin.md`: 오라 시스템 섹션 추가
- `01. docs/contents/class-advancement.md`: **신규 생성** - 전직 시스템 및 보상 풀 문서화
- `02. proto/02. battle-scene/systems/class-advancement.md`: 오라 시스템, 전직 후 보상 풀 섹션 추가
- `02. proto/02. battle-scene/systems/advancement-hint.md`: 전직 후 힌트 동작 섹션 추가

### 관련 코드 변경
- `dev/proto/src/data/characters/paladin/buffs.ts`
- `dev/proto/src/data/characters/paladin/cards.ts`
- `dev/proto/src/data/cards.ts`
- `dev/proto/src/stores/gameStore.ts`

---

## 2026-01-11 - 골드 시스템 및 처치 애니메이션 구현

### 변경 내용

#### 골드 시스템
- `types/index.ts`: `Player.gold`, `Enemy.goldReward` 타입 추가
- `data/enemies.ts`: 몬스터별 골드 보상 값 설정
  - 슬라임 10G, 고블린 15G, 오크 20G, 해골 25G, 보스 50G
- `stores/gameStore.ts`: 골드 초기화 및 획득 로직 추가

#### 상단 바 UI
- `components/ui/TopBar.tsx`: 신규 생성
  - 라운드 정보, 현재 적 이름, 골드 표시
  - 골드 획득 시 펄스 효과

#### 처치 애니메이션
- `animations/combatAnimations.ts`: 사망 애니메이션 추가 (페이드아웃 + 축소)
- `components/effects/GoldDrop.tsx`: 신규 생성
  - 동전 3~5개 흩뿌림 효과 (획득량에 따라 개수 변동)
  - 사망 애니메이션 70% 시점에 동전 등장
- `components/screens/BattleScreen.tsx`: 애니메이션 통합

### 관련 결정
- 골드 보상은 난이도에 따라 차등 지급 (10~50G)
- 동전 개수는 획득량 기준 (10~20G: 3개, 21~40G: 4개, 41+G: 5개)
- 사망 애니메이션과 동전 드랍이 자연스럽게 연결되도록 타이밍 조절 (70%)

### 문서 업데이트
- `01. docs/02. proto/02. battle-scene/animation.md`: 사망 애니메이션, 골드 드랍 애니메이션 섹션 추가
- `.claude/agents/docs-mapping.md`: animation.md 매핑 추가

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
