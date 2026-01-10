import type { Card } from '../../../types';

// 팔라딘 고유 카드 정의 (3장)
export const PALADIN_CARD_DEFINITIONS: Record<string, Omit<Card, 'id'>> = {
  aura_of_devotion: {
    name: '헌신의 오라',
    type: 'power',
    cost: 1,
    rarity: 'special',
    classRequired: 'paladin',
    effects: [
      { type: 'apply_buff', value: 1, buffId: 'aura_of_devotion', target: 'self' }
    ],
    description: '(파워) 매 턴 시작 시 2 방어. 공격 카드 사용 시 +1 데미지.',
  },

  holy_strike: {
    name: '신성한 일격',
    type: 'attack',
    cost: 1,
    rarity: 'common',
    classRequired: 'paladin',
    damage: 8,
    effects: [
      { type: 'damage', value: 8, target: 'enemy' }
    ],
    conditionalEffects: [
      {
        condition: 'buff_active',
        conditionValue: 'aura_of_devotion',
        effect: { type: 'block', value: 3, target: 'self' }
      }
    ],
    description: '8 데미지. 오라 활성화 시 3 방어.',
  },

  shield_of_purification: {
    name: '정화의 방패',
    type: 'skill',
    cost: 2,
    rarity: 'common',
    classRequired: 'paladin',
    block: 12,
    effects: [
      { type: 'block', value: 12, target: 'self' }
    ],
    conditionalEffects: [
      {
        condition: 'buff_active',
        conditionValue: 'aura_of_devotion',
        effect: { type: 'draw', value: 1, target: 'self' }
      }
    ],
    description: '12 방어. 오라 활성화 시 다음 턴 드로우 +1.',
  },
};

// 팔라딘 카드 풀 (보상에서 등장 가능한 카드)
export const PALADIN_CARD_POOL = ['holy_strike', 'shield_of_purification'];
