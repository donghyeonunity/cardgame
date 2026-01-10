import type { Card } from '../../../types';

// 전사 기본 카드 정의
export const WARRIOR_CARD_DEFINITIONS: Record<string, Omit<Card, 'id'>> = {
  strike: {
    name: '타격',
    type: 'attack',
    cost: 1,
    rarity: 'basic',
    classRequired: 'warrior',
    damage: 6,
    effects: [
      { type: 'damage', value: 6, target: 'enemy' }
    ],
    description: '6 데미지를 준다.',
  },
  defend: {
    name: '방어',
    type: 'skill',
    cost: 1,
    rarity: 'basic',
    classRequired: 'warrior',
    block: 5,
    effects: [
      { type: 'block', value: 5, target: 'self' }
    ],
    description: '5 방어도를 얻는다.',
  },
  bash: {
    name: '강타',
    type: 'attack',
    cost: 2,
    rarity: 'basic',
    classRequired: 'warrior',
    damage: 10,
    effects: [
      { type: 'damage', value: 10, target: 'enemy' }
    ],
    description: '10 데미지를 준다.',
  },
};

// 전사 시작 덱 구성
export const WARRIOR_STARTER_DECK = [
  'strike', 'strike', 'strike', 'strike',
  'defend', 'defend',
  'bash',
];
