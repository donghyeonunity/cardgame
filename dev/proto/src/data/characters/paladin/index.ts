import type { ClassDefinition } from '../warrior';
import { PALADIN_CARD_DEFINITIONS, PALADIN_CARD_POOL } from './cards';
import { PALADIN_BUFF_DEFINITIONS, PALADIN_BUFF_EVENT_EFFECTS } from './buffs';

export const PALADIN_CLASS: ClassDefinition = {
  id: 'paladin',
  name: '팔라딘',
  description: '공격하면서 더 단단해지는 수호자. 오라를 활용한 공방 동시 수행.',
  baseClass: 'warrior',        // 전사에서 전직
  advancementRound: 3,         // 라운드 3 클리어 후 전직 가능
  starterDeck: [],             // 전직 클래스는 빈 시작 덱
  advancementCards: ['aura_of_devotion'],  // 전직 시 자동 획득
  cardPool: [
    // 기본 전사 카드 포함
    'strike', 'defend', 'bash',
    // 팔라딘 전용 카드 추가
    ...PALADIN_CARD_POOL,
  ],
};

export {
  PALADIN_CARD_DEFINITIONS,
  PALADIN_CARD_POOL,
  PALADIN_BUFF_DEFINITIONS,
  PALADIN_BUFF_EVENT_EFFECTS,
};
