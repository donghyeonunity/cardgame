import type { Card, CharacterClass } from '../types';
import { WARRIOR_CARD_DEFINITIONS, WARRIOR_STARTER_DECK } from './characters/warrior';
import { PALADIN_CARD_DEFINITIONS } from './characters/paladin';
import { COMMON_CARD_DEFINITIONS, COMMON_CARD_POOL } from './cards/common';
import { ADVANCEMENT_EXCLUSIVE_CARDS } from './advancement';

// 모든 카드 정의 통합 (캐릭터별 카드 + 공통 카드 병합)
export const CARD_DEFINITIONS: Record<string, Omit<Card, 'id'>> = {
  ...WARRIOR_CARD_DEFINITIONS,
  ...PALADIN_CARD_DEFINITIONS,
  ...COMMON_CARD_DEFINITIONS,
};

// 카드 인스턴스 생성 함수
let cardIdCounter = 0;
export function createCard(cardKey: string): Card {
  const definition = CARD_DEFINITIONS[cardKey];
  if (!definition) {
    throw new Error(`Unknown card: ${cardKey}`);
  }
  return {
    ...definition,
    id: `card_${cardIdCounter++}`,
  };
}

// 카드 ID 카운터 리셋 (테스트용)
export function resetCardIdCounter(): void {
  cardIdCounter = 0;
}

// 전사 시작 덱 생성
export function createWarriorStarterDeck(): Card[] {
  return WARRIOR_STARTER_DECK.map(cardKey => createCard(cardKey));
}

// 클래스별 시작 덱 생성
export function createStarterDeck(characterClass: CharacterClass): Card[] {
  switch (characterClass) {
    case 'warrior':
      return createWarriorStarterDeck();
    case 'paladin':
      // 팔라딘은 전직 클래스이므로 시작 덱 없음
      return [];
    default:
      return createWarriorStarterDeck();
  }
}

// 테스트용 팔라딘 덱 생성 (전사 카드 + 팔라딘 카드 전체)
export function createPaladinTestDeck(): Card[] {
  return [
    // 전사 기본 카드
    createCard('strike'),
    createCard('strike'),
    createCard('defend'),
    createCard('defend'),
    // 팔라딘 카드 전체
    createCard('aura_of_devotion'),  // 헌신의 오라
    createCard('holy_strike'),        // 신성한 일격
    createCard('holy_strike'),        // 신성한 일격
    createCard('shield_of_purification'), // 정화의 방패
  ];
}

// 전직 테스트용 덱 (전사 시작 + 팔라딘 카드 1장)
// 보상에서 팔라딘 카드 1장 선택 시 전직 조건 달성
export function createAdvancementTestDeck(): Card[] {
  return [
    // 전사 기본 카드
    createCard('strike'),
    createCard('strike'),
    createCard('strike'),
    createCard('defend'),
    createCard('defend'),
    createCard('bash'),
    // 팔라딘 카드 1장 (전직까지 1장 필요)
    createCard('holy_strike'),
  ];
}

// 보상 카드 풀에서 랜덤 카드 생성
export function createRewardCards(count: number = 3): Card[] {
  const pool = [...COMMON_CARD_POOL];
  const result: Card[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const cardKey = pool.splice(randomIndex, 1)[0];
    result.push(createCard(cardKey));
  }

  return result;
}

// 전직 보상 카드 생성 (해당 클래스 전용 카드)
export function createAdvancementRewardCards(targetClass: CharacterClass): Card[] {
  const exclusiveCardKeys = ADVANCEMENT_EXCLUSIVE_CARDS[targetClass] || [];
  return exclusiveCardKeys
    .filter(key => CARD_DEFINITIONS[key]) // 정의된 카드만
    .map(key => createCard(key));
}

// 공통 카드 풀 export
export { COMMON_CARD_POOL };
