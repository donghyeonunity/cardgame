// 카드 타입 정의

export type CardType = 'attack' | 'skill' | 'power' | 'curse';
export type CharacterClass = 'warrior' | 'paladin' | 'berserker' | 'swordmaster';
export type CardRarity = 'basic' | 'common' | 'rare' | 'special' | 'curse';

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

// 패시브 효과 (저주 카드 등)
export interface PassiveCardEffect {
  trigger: 'turn_start' | 'turn_end' | 'draw' | 'in_hand';
  type: 'damage' | 'heal' | 'energy';
  value: number;
  target: 'self' | 'enemy';
}

export interface Card {
  id: string;
  cardKey?: string;    // 카드 정의 키 (예: 'battlefield_will', 'strike')
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
  // 저주 카드 관련
  exhaust?: boolean;               // 사용 시 소모 (제거)
  passiveEffect?: PassiveCardEffect;  // 패시브 효과 (손에 있을 때 발동)
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
  gold: number;        // 보유 골드
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
  goldReward: number;   // 처치 시 골드 보상
}

// 적 의도 (다음 턴에 할 행동)
export interface EnemyIntent {
  type: 'attack' | 'defend' | 'buff';
  value: number;
}

// 행선지 타입 (라운드 선택 시스템)
export type DestinationType = 'normal' | 'elite' | 'rest' | 'shop' | 'event' | 'village';

export interface DestinationOption {
  id: string;
  type: DestinationType;
  enemyKey?: string;      // 몬스터 행선지일 경우
  healPercent?: number;   // 휴식 행선지일 경우
}

// ===== 마을 시스템 =====

// 장신구 효과 타입
export type AccessoryEffectType =
  | 'stat_boost'      // 스탯 증가 (최대 HP 등)
  | 'on_turn_start'   // 턴 시작 시 효과
  | 'on_turn_end'     // 턴 종료 시 효과
  | 'on_card_play'    // 카드 사용 시 효과
  | 'on_kill'         // 적 처치 시 효과
  | 'passive';        // 상시 적용

export interface AccessoryEffect {
  type: AccessoryEffectType;
  stat?: 'maxHp' | 'damage' | 'block' | 'energy';
  value: number;
}

export interface Accessory {
  id: string;
  name: string;
  description: string;
  emoji: string;
  regionId: string;       // 획득 가능한 지역
  effect: AccessoryEffect;
}

// 동료 효과 타입
export interface CompanionEffect {
  type: 'damage' | 'heal' | 'block' | 'buff' | 'draw';
  value: number;
  target: 'player' | 'enemy';
  trigger: 'turn_start' | 'turn_end';
}

export interface Companion {
  id: string;
  name: string;
  description: string;
  emoji: string;
  turnEffect: CompanionEffect;
  linkedCardId: string;   // 동료 선택 시 획득하는 카드
}

// 시설 타입
export type FacilityType = 'tavern' | 'blood_altar' | 'rest' | 'shop';

export interface Facility {
  id: string;
  type: FacilityType;
  name: string;
  description: string;
  emoji: string;
  regionExclusive?: string;  // 특정 지역 전용
}

// 피의 제단 보상 타입
export type BloodAltarRewardType = 'gold' | 'maxHp' | 'accessory';

export interface BloodAltarPenalty {
  hpCost?: number;           // 즉시 HP 손실
  goldCost?: number;         // 즉시 골드 손실
  curseCard?: boolean;       // 저주 카드 획득
  monsterHpBuff?: number;    // 몬스터 HP 강화 비율 (0.2 = 20%)
  monsterAttackBuff?: number; // 몬스터 공격력 강화 비율
}

export interface BloodAltarReward {
  id: string;
  type: BloodAltarRewardType;
  name: string;
  description: string;
  emoji: string;
  // 보상
  goldReward?: number;       // 골드 보상
  maxHpReward?: number;      // 최대 HP 증가
  accessoryId?: string;      // 장신구 보상
  // 패널티
  penalty: BloodAltarPenalty;
  // UI 표시용
  rewardText: string;        // 보상 설명
  penaltyText: string;       // 패널티 설명
}

// 전투 상태
export type BattlePhase =
  | 'player_turn'
  | 'enemy_turn'
  | 'victory'
  | 'defeat'
  | 'reward'           // 보상 선택
  | 'class_advancement' // 전직 이벤트
  | 'destination_selection'  // 행선지 선택
  // 마을 시스템
  | 'village_entrance'       // 마을 - 진입 연출
  | 'village_accessory'      // 마을 - 장신구 선택
  | 'village_facility'       // 마을 - 시설 선택
  | 'tavern_companion'       // 선술집 - 동료 선택
  | 'blood_altar_reward';    // 피의 제단 - 보상 선택

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
  isEliteReward?: boolean;       // 엘리트 보상 여부 (희귀 카드 확률)
  advancementOptions?: CharacterClass[];  // 선택 가능한 전직 목록 (다중 전직 시)
  targetAdvancement?: CharacterClass;     // 선택된 전직 클래스
}

// 지역 정의 (월드의 한 구역)
export interface Region {
  id: string;
  name: string;
  description: string;
  totalRounds: number;     // 해당 지역의 라운드 수
  bossKey: string;         // 보스 적 키
}

// 런 상태
export interface RunState {
  regionId: string;        // 현재 지역 ID
  round: number;           // 현재 라운드 (1-7)
  totalRounds: number;     // 총 라운드 수
  isComplete: boolean;     // 런 클리어 여부
  selectedDestinationType?: DestinationType;  // 선택한 행선지 타입 (보상 차등용)
  // 마을 시스템
  accessories: Accessory[];       // 획득한 장신구 목록
  companions: Companion[];        // 동료 목록
  // 피의 제단 시스템
  bloodAltarActivated: boolean;   // 피의 제단 활성화 여부
  monsterBuffPercent: number;     // 몬스터 강화 비율 (레거시, 미사용)
  monsterHpBuffPercent: number;   // 몬스터 HP 강화 비율 (0.2 = 20%)
  monsterAttackBuffPercent: number; // 몬스터 공격력 강화 비율
}

// 전체 게임 상태
export interface GameState {
  player: Player;
  enemy: Enemy | null;
  battle: BattleState;
  reward: RewardState | null;  // 보상 선택 중일 때
  run: RunState;           // 런 진행 상태
  destinationOptions: DestinationOption[];  // 행선지 선택지 목록
}
