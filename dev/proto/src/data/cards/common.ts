import type { Card } from '../../types';

// 공통 카드 정의 (전직 시스템용)
// 각 카드는 advancesTo로 어떤 전직에 기여하는지 표시

export const COMMON_CARD_DEFINITIONS: Record<string, Omit<Card, 'id'>> = {
  // === 공통 카드 (3전직 모두 인정) ===
  battlefield_will: {
    name: '전장의 의지',
    type: 'skill',
    cost: 1,
    rarity: 'common',
    advancesTo: ['paladin', 'berserker', 'swordmaster'],
    damage: 5,
    block: 5,
    effects: [
      { type: 'block', value: 5, target: 'self' },
      { type: 'damage', value: 5, target: 'enemy' },
    ],
    description: '5 방어. 5 데미지.',
  },

  // === 공유 카드 (2전직 인정) ===
  iron_will: {
    name: '강철 의지',
    type: 'skill',
    cost: 1,
    rarity: 'common',
    advancesTo: ['paladin', 'berserker'],
    block: 8,
    effects: [
      { type: 'block', value: 8, target: 'self' },
    ],
    description: '8 방어.',
  },

  flash_slash: {
    name: '일섬',
    type: 'attack',
    cost: 2,
    rarity: 'common',
    advancesTo: ['berserker', 'swordmaster'],
    damage: 12,
    effects: [
      { type: 'damage', value: 12, target: 'enemy' },
    ],
    description: '12 데미지.',
  },

  counter: {
    name: '응수',
    type: 'skill',
    cost: 1,
    rarity: 'common',
    advancesTo: ['paladin', 'swordmaster'],
    block: 4,
    damage: 4,
    effects: [
      { type: 'block', value: 4, target: 'self' },
      { type: 'damage', value: 4, target: 'enemy' },
    ],
    description: '4 방어. 4 데미지.',
  },

  // === 전용 카드 (1전직만 인정) ===
  holy_focus: {
    name: '신성한 집중',
    type: 'skill',
    cost: 1,
    rarity: 'common',
    advancesTo: ['paladin'],
    effects: [
      { type: 'draw', value: 1, target: 'self' },
      { type: 'apply_buff', value: 1, buffId: 'next_attack_bonus', target: 'self' },
    ],
    description: '카드 1장 드로우. 다음 공격 +2 데미지.',
  },

  blood_price: {
    name: '피의 대가',
    type: 'attack',
    cost: 1,
    rarity: 'common',
    advancesTo: ['berserker'],
    damage: 8,
    effects: [
      { type: 'damage', value: 8, target: 'enemy' },
      { type: 'damage', value: 3, target: 'self' },  // HP 손실
    ],
    description: '8 데미지. HP 3 손실.',
  },

  chain_slash: {
    name: '연환참',
    type: 'attack',
    cost: 1,
    rarity: 'common',
    advancesTo: ['swordmaster'],
    damage: 9,  // 3 x 3
    effects: [
      { type: 'damage', value: 3, target: 'enemy' },
      { type: 'damage', value: 3, target: 'enemy' },
      { type: 'damage', value: 3, target: 'enemy' },
    ],
    description: '3 데미지를 3회.',
  },
};

// 공통 카드 키 목록 (보상 풀)
export const COMMON_CARD_POOL = Object.keys(COMMON_CARD_DEFINITIONS);
