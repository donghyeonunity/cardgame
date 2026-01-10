# 전직 힌트 시스템 (Advancement Hint)

## 개요

보상 카드 선택 시 전직 관련 정보를 표시하여 플레이어가 전략적 선택을 할 수 있도록 유도하는 시스템

---

## 핵심 규칙

| 항목 | 내용 |
|------|------|
| **표시 위치** | 보상 카드 아래 중앙 |
| **기본 표시** | 전직 트리거 시에만 아이콘 + "전직!" |
| **툴팁 표시** | 카드 호버 시 기여 클래스 목록 |
| **다중 전직** | 하나의 카드가 여러 전직에 기여 가능 |

---

## UI 표시

### 기본 상태 (전직 트리거 없음)

```
┌─────────────┐
│  카드 내용   │
│             │
└─────────────┘
     (없음)      ← 트리거 없으면 힌트 표시 안함
```

### 전직 트리거 시 (단일)

```
┌─────────────┐
│  카드 내용   │
│             │
└─────────────┘
  ⚔️ 전직!      ← 해당 클래스 아이콘 + 전직 텍스트
```

### 전직 트리거 시 (다중)

```
┌─────────────┐
│  카드 내용   │
│             │
└─────────────┘
 ⚔️🔥 전직!     ← 여러 클래스 동시 트리거 가능
```

### 카드 호버 시 (툴팁)

```
┌─────────────┐
│  카드 내용   │  ← 마우스 호버
│             │
└─────────────┘
  ⚔️🔥 전직!
┌──────────────┐
│ 전직 기여:     │
│ ⚔️ 팔라딘 2/3 │  ← 현재 진행도 / 필요 카드 수
│ 🔥 버서커 1/3 │
│ ⚔️ 검사   1/3 │
└──────────────┘
```

---

## 카드-전직 기여 시스템

### 카드 분류

| 분류 | 기여 전직 수 | 예시 |
|------|:-----------:|------|
| 공통 카드 | 3개 | 전장의 의지 (팔라딘, 버서커, 검사) |
| 공유 카드 | 2개 | 강철 의지 (팔라딘, 버서커) |
| 전용 카드 | 1개 | 신성한 집중 (팔라딘) |

### 카드 데이터 구조

```typescript
interface Card {
  // ...
  advancesTo?: CharacterClass[];  // 이 카드가 기여하는 전직 목록
}

// 예시
const card = {
  name: '전장의 의지',
  advancesTo: ['paladin', 'berserker', 'swordmaster'],  // 3전직 모두 기여
};
```

---

## 클래스별 표시

| 클래스 | 아이콘 | 색상 | 필요 카드 |
|--------|:------:|------|:---------:|
| 팔라딘 | ⚔️ | 금색 (#FFD700) | 3장 |
| 버서커 | 🔥 | 빨간색 (#FF4444) | 3장 |
| 검사 | ⚔️ | 파란색 (#4488FF) | 3장 |

---

## 데이터 구조

### 단일 힌트 정보

```typescript
interface AdvancementHintInfo {
  targetClass: CharacterClass;  // 전직 대상 클래스
  icon: string;                  // 클래스 아이콘
  color: string;                 // 클래스 색상
  className: string;             // 클래스 한글명
  currentCount: number;          // 현재 보유 카드 수
  requiredCount: number;         // 필요한 카드 수
  willAdvanceOnSelect: boolean;  // 선택 시 전직 여부
}
```

### 다중 힌트 정보

```typescript
interface MultiAdvancementHint {
  hints: AdvancementHintInfo[];  // 카드가 기여하는 모든 전직 정보
}
```

### 진행도 계산

```typescript
function getMultiAdvancementProgress(
  deck: Card[],
  card: Card,
  playerClass: CharacterClass
): MultiAdvancementHint | null {
  // advancesTo가 없으면 null
  if (!card.advancesTo || card.advancesTo.length === 0) return null;

  // 전사만 전직 가능
  if (playerClass !== 'warrior') return null;

  const hints: AdvancementHintInfo[] = [];

  for (const targetClass of card.advancesTo) {
    const currentCount = countAdvancementCards(deck, targetClass);
    const requiredCount = ADVANCEMENT_DEFINITIONS[targetClass].requiredCards;

    hints.push({
      targetClass,
      icon: CLASS_ICONS[targetClass],
      color: CLASS_COLORS[targetClass],
      className: CLASS_NAMES[targetClass],
      currentCount,
      requiredCount,
      willAdvanceOnSelect: currentCount + 1 >= requiredCount,
    });
  }

  return { hints };
}
```

---

## UI 컴포넌트 구조

```
RewardScreen
├── hoveredCardIndex (호버 상태 관리)
├── 현재 덱 정보 (battle.deck + hand + discard)
│
└── Card Wrapper (w-32, 호버 이벤트)
    ├── Card (보상 카드)
    └── AdvancementHint (w-full)
        ├── 전직 트리거 표시 (아이콘 + "전직!")
        └── 툴팁 (카드 호버 시)
            ├── "전직 기여:" 헤더
            └── 각 클래스별 진행도
```

---

## 관련 문서

- [전직 시스템](./class-advancement.md)
- [전직 결정 기록](./decisions/class-advancement-decision.md)

---

## 구현 체크리스트

- [x] `advancementSystem.ts` - 다중 힌트 계산 함수 (`getMultiAdvancementProgress`)
- [x] `AdvancementHint.tsx` - 힌트 + 툴팁 UI 컴포넌트
- [x] `RewardScreen.tsx` - 카드 호버 상태 관리 및 힌트 통합
- [x] 전직 트리거 표시 (아이콘 + "전직!")
- [x] 카드 호버 시 툴팁 표시
- [x] 다중 전직 트리거 지원

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-01-10 | 최초 작성 - 점진적 공개 방식 채택 |
| 2026-01-10 | 단순화 - 카드 목록 제거, 진행도와 전직 메시지만 표시 |
| 2026-01-10 | 전직 시스템 재설계 - advancesTo 기반 다중 전직 지원 |
| 2026-01-10 | UI 개선 - 트리거만 기본 표시, 카드 호버 시 툴팁으로 상세 정보 |
| 2026-01-10 | 툴팁 즉시 표시 - 애니메이션 딜레이 제거 |
