import type { Enemy, EnemyIntent } from '../types';

// 적 정의
export interface EnemyDefinition {
  name: string;
  hp: number;
  // 의도 패턴 (순환)
  intentPattern: EnemyIntent[];
}

export const ENEMY_DEFINITIONS: Record<string, EnemyDefinition> = {
  // 라운드 1: 슬라임
  slime: {
    name: '슬라임',
    hp: 30,
    intentPattern: [
      { type: 'attack', value: 6 },
      { type: 'attack', value: 6 },
      { type: 'defend', value: 5 },
    ],
  },
  // 라운드 2: 고블린
  goblin: {
    name: '고블린',
    hp: 35,
    intentPattern: [
      { type: 'attack', value: 7 },
      { type: 'attack', value: 8 },
      { type: 'defend', value: 4 },
    ],
  },
  // 라운드 3: 오크
  orc: {
    name: '오크',
    hp: 45,
    intentPattern: [
      { type: 'attack', value: 10 },
      { type: 'buff', value: 2 },
      { type: 'attack', value: 12 },
    ],
  },
  // 라운드 4: 해골
  skeleton: {
    name: '해골 전사',
    hp: 40,
    intentPattern: [
      { type: 'attack', value: 8 },
      { type: 'attack', value: 8 },
      { type: 'defend', value: 6 },
      { type: 'attack', value: 10 },
    ],
  },
  // 라운드 5: 보스
  dark_knight: {
    name: '암흑 기사',
    hp: 80,
    intentPattern: [
      { type: 'attack', value: 8 },
      { type: 'defend', value: 10 },
      { type: 'attack', value: 15 },
      { type: 'buff', value: 3 },
    ],
  },
};

// 라운드별 적 키
export const ROUND_ENEMIES: string[] = [
  'slime',     // 라운드 1
  'goblin',    // 라운드 2
  'orc',       // 라운드 3
  'skeleton',  // 라운드 4
  'dark_knight', // 라운드 5 (보스)
];

// 적 인스턴스 생성
let enemyIdCounter = 0;
export function createEnemy(enemyKey: string): Enemy {
  const definition = ENEMY_DEFINITIONS[enemyKey];
  if (!definition) {
    throw new Error(`Unknown enemy: ${enemyKey}`);
  }
  return {
    id: `enemy_${enemyIdCounter++}`,
    name: definition.name,
    hp: definition.hp,
    maxHp: definition.hp,
    block: 0,
    intent: definition.intentPattern[0],
  };
}

// 적 다음 의도 가져오기
export function getNextIntent(enemyKey: string, turnIndex: number): EnemyIntent {
  const definition = ENEMY_DEFINITIONS[enemyKey];
  if (!definition) {
    return { type: 'attack', value: 5 };
  }
  const patternIndex = turnIndex % definition.intentPattern.length;
  return definition.intentPattern[patternIndex];
}
