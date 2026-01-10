# 카드 프리뷰 시스템

> 공격 카드 드래그 시 데미지 프리뷰를 표시하는 시스템

---

## 개요

| 항목 | 설명 |
|------|------|
| 활성화 조건 | 공격 카드 드래그 + 적 영역 호버 |
| HP 바 프리뷰 | 예상 감소량을 주황색 영역으로 표시 (투명도 40%) |
| HP 텍스트 | 예상 HP로 변경 (색상 유지) |
| 데미지 숫자 | HP 바 위에 "-8" 형태로 표시 |
| 데미지 계산 | 적 방어력 고려한 실제 HP 데미지 |

---

## 구현 상세

### 1. 프리뷰 데미지 계산

**파일**: `BattleScreen.tsx:48-67`

```typescript
// 프리뷰 데미지 계산 (공격 카드 + 적 영역 호버 시)
const previewDamage = useMemo(() => {
  if (
    !dragState.isDragging ||
    !dragState.card ||
    dragState.card.type !== 'attack' ||
    dragState.currentZone !== 'enemy' ||
    !enemy
  ) {
    return 0;
  }

  // 카드 효과 계산
  const effects = getCardEffects(dragState.card, player);

  // 적 방어력을 고려한 실제 HP 데미지
  const actualDamage = Math.max(0, effects.damageToEnemy - enemy.block);

  return actualDamage;
}, [dragState.isDragging, dragState.card, dragState.currentZone, enemy, player]);
```

**데미지 공식**:
```
actualDamage = max(0, cardDamage - enemy.block)
```

---

### 2. 드래그 상태 관리

**파일**: `useDrag.ts`

```typescript
interface DragState {
  isDragging: boolean;
  card: Card | null;
  cardIndex: number;
  position: { x: number; y: number };
  currentZone: DropZone;  // 현재 호버 중인 드롭 존
}
```

- `currentZone`: 마우스가 현재 위치한 드롭 영역
- 실시간 영역 감지로 프리뷰 활성화/비활성화

---

### 3. HP 바 프리뷰 UI

**파일**: `HPBar.tsx`

#### Props
```typescript
interface HPBarProps {
  current: number;
  max: number;
  showText?: boolean;
  color?: 'red' | 'green';
  previewDamage?: number;  // 예상 데미지 (프리뷰용)
}
```

#### 프리뷰 계산
```typescript
// 프리뷰 후 남을 HP 계산
const afterDamageHp = Math.max(0, current - previewDamage);
const afterDamagePercentage = (afterDamageHp / max) * 100;

// 프리뷰 데미지 영역 (깎일 부분)
const previewPercentage = hpPercentage - afterDamagePercentage;
```

#### UI 구성

| 요소 | 설명 |
|------|------|
| 프리뷰 영역 | 주황색 (`bg-orange-500 opacity-40`) |
| HP 텍스트 | 예상 HP 표시 (흰색 유지) |
| 데미지 숫자 | HP 바 위에 "-N" 표시 (`text-orange-400`) |

#### 프리뷰 영역
```tsx
{/* 프리뷰 데미지 영역 (주황색) */}
{previewDamage > 0 && (
  <div
    className="absolute h-full bg-orange-500 opacity-40"
    style={{
      left: `${afterDamagePercentage}%`,
      width: `${previewPercentage}%`,
    }}
  />
)}
```

#### HP 텍스트 프리뷰
```tsx
{/* 프리뷰 시 예상 HP, 색상은 흰색 유지 */}
{previewDamage > 0 ? afterDamageHp : current} / {max}
```

#### 데미지 숫자 애니메이션
```typescript
// 데미지 숫자 등장
initial={{ opacity: 0, y: 5 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 5 }}
```

---

### 4. EnemyCard 연동

**파일**: `EnemyCard.tsx`

```typescript
interface EnemyCardProps {
  enemy: Enemy;
  isAttacking?: boolean;
  isHit?: boolean;
  previewDamage?: number;  // 예상 데미지 (프리뷰용)
}
```

`previewDamage` prop을 HPBar 컴포넌트에 전달:
```tsx
<HPBar
  current={enemy.hp}
  max={enemy.maxHp}
  color="red"
  previewDamage={previewDamage}
/>
```

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `dev/proto/src/components/screens/BattleScreen.tsx` | 프리뷰 데미지 계산 로직 |
| `dev/proto/src/hooks/useDrag.ts` | 드래그 상태 및 currentZone 관리 |
| `dev/proto/src/components/common/HPBar.tsx` | 프리뷰 UI 렌더링 |
| `dev/proto/src/components/battle/EnemyCard.tsx` | previewDamage prop 전달 |

---

## 다음 작업 제안

- [ ] 방어 카드 프리뷰 (플레이어 방어력 증가 표시)
- [ ] 버프/디버프 프리뷰
- [ ] 카드 효과 툴팁
