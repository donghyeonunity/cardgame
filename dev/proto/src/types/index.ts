// 카드 타입 정의

export type CardType = 'attack' | 'skill' | 'power';
export type CharacterClass = 'warrior' | 'paladin' | 'berserker' | 'swordmaster';
export type CardRarity = 'basic' | 'common' | 'rare' | 'special';

// 카드 효과 타입
export interface CardEffect {
  type: 'damage' | 'block' | 'draw' | 'energy' | 'apply_buff';
  value: number;
  target?: 'self' | 'enemy';
  buffId?: string;  // apply_buff일 때 사용
}

// 조건부 효과
export type ConditionType = 'buff_active' | 'hp_below' | 'energy_above';

export interface ConditionalEffect {
  condition: ConditionType;
  conditionValue: string | number;  // 버프 ID 또는 수치
  effect: CardEffect;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number;        // 에너지 비용
  rarity?: CardRarity;
  classRequired?: CharacterClass;  // 클래스 전용 카드 (해당 클래스만 사용 가능)
  advancesTo?: CharacterClass[];   // 전직 기여 (이 카드가 어떤 전직에 인정되는지)
  // 레거시 필드 (기존 호환성)
  damage?: number;
  block?: number;
  // 새로운 효과 시스템
  effects?: CardEffect[];
  conditionalEffects?: ConditionalEffect[];
  description: string;
}

// 버프 정의
export type BuffType = 'power' | 'debuff' | 'temporary';
export type BuffDuration = number | 'combat';  // 턴 수 또는 전투 종료까지

export interface Buff {
  id: string;
  name: string;
  type: BuffType;
  duration: BuffDuration;
  stackable: boolean;
  description: string;
}

// 활성 버프 인스턴스
export interface ActiveBuff {
  buffId: string;
  stacks: number;
  remainingDuration: BuffDuration;
}

// 버프 이벤트 효과
export type BuffEventType = 'turn_start' | 'on_attack' | 'on_defend' | 'turn_end';

export interface BuffEventEffect {
  event: BuffEventType;
  effect: CardEffect;
}

// 플레이어 상태
export interface Player {
  hp: number;
  maxHp: number;
  block: number;       // 현재 방어력 (턴 시작 시 리셋)
  energy: number;
  maxEnergy: number;
  characterClass: CharacterClass;
  activeBuffs: ActiveBuff[];
}

// 적 상태
export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  intent: EnemyIntent;  // 다음 행동 의도
}

// 적 의도 (다음 턴에 할 행동)
export interface EnemyIntent {
  type: 'attack' | 'defend' | 'buff';
  value: number;
}

// 전투 상태
export type BattlePhase =
  | 'player_turn'
  | 'enemy_turn'
  | 'victory'
  | 'defeat'
  | 'reward'           // 보상 선택
  | 'class_advancement'; // 전직 이벤트

// 애니메이션 페이즈
export type AnimationPhase = 'idle' | 'discarding' | 'drawing';

// 전투 애니메이션 상태
export interface CombatAnimation {
  playerAttacking: boolean;   // 플레이어가 공격 중
  enemyAttacking: boolean;    // 적이 공격 중
  playerHit: boolean;         // 플레이어가 피격됨
  enemyHit: boolean;          // 적이 피격됨
  shieldHit: boolean;         // 방패가 타격됨
}

export interface BattleState {
  phase: BattlePhase;
  animationPhase: AnimationPhase;  // 카드 애니메이션 상태
  combatAnimation: CombatAnimation;  // 전투 애니메이션 상태
  turn: number;
  deck: Card[];        // 드로우 덱
  hand: Card[];        // 현재 손패
  discard: Card[];     // 버린 카드 더미
}

// 드래그 상태
export type DropZone = 'enemy' | 'battlefield' | 'hand' | null;

export interface DragState {
  isDragging: boolean;
  draggedCard: Card | null;
  dragPosition: { x: number; y: number };
  originalCardIndex: number;
}

// 보상 상태
export interface RewardState {
  cards: Card[];           // 선택 가능한 보상 카드들
  isAdvancementReward: boolean;  // 전직 보상 여부
  advancementOptions?: CharacterClass[];  // 선택 가능한 전직 목록 (다중 전직 시)
  targetAdvancement?: CharacterClass;     // 선택된 전직 클래스
}

// 런 상태
export interface RunState {
  round: number;           // 현재 라운드 (1-5)
  totalRounds: number;     // 총 라운드 수
  isComplete: boolean;     // 런 클리어 여부
}

// 전체 게임 상태
export interface GameState {
  player: Player;
  enemy: Enemy | null;
  battle: BattleState;
  reward: RewardState | null;  // 보상 선택 중일 때
  run: RunState;           // 런 진행 상태
}
