import type { CharacterClass } from '../../../types';
import { WARRIOR_CARD_DEFINITIONS, WARRIOR_STARTER_DECK } from './cards';

export interface ClassDefinition {
  id: CharacterClass;
  name: string;
  description: string;
  baseClass?: CharacterClass;  // 전직 전 클래스 (없으면 기본 클래스)
  advancementRound?: number;   // 전직 가능 라운드
  starterDeck: string[];       // 시작 덱 카드 키
  advancementCards: string[];  // 전직 시 자동 획득 카드
  cardPool: string[];          // 보상 카드 풀
}

export const WARRIOR_CLASS: ClassDefinition = {
  id: 'warrior',
  name: '전사',
  description: '기본 공격과 방어로 싸우는 정석적인 전투 스타일',
  starterDeck: WARRIOR_STARTER_DECK,
  advancementCards: [],
  cardPool: ['strike', 'defend', 'bash'],
};

export { WARRIOR_CARD_DEFINITIONS, WARRIOR_STARTER_DECK };
