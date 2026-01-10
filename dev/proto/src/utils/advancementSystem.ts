import type { Card, CharacterClass, Player } from '../types';
import { ADVANCEMENT_DEFINITIONS, AVAILABLE_ADVANCEMENTS, canAdvanceFrom } from '../data/advancement';

// 클래스별 아이콘
export const CLASS_ICONS: Record<CharacterClass, string> = {
  warrior: '🧑‍⚔️',
  paladin: '⚔️',
  berserker: '🔥',
  swordmaster: '⚔️',
};

// 클래스별 색상
export const CLASS_COLORS: Record<CharacterClass, string> = {
  warrior: '#888888',
  paladin: '#FFD700',
  berserker: '#FF4444',
  swordmaster: '#4488FF',
};

// 클래스 한글명
export const CLASS_NAMES: Record<CharacterClass, string> = {
  warrior: '전사',
  paladin: '팔라딘',
  berserker: '버서커',
  swordmaster: '검사',
};

// 전직 힌트 정보 타입
export interface AdvancementHintInfo {
  targetClass: CharacterClass;
  icon: string;
  color: string;
  className: string;
  currentCount: number;
  requiredCount: number;
  willAdvanceOnSelect: boolean;
}

// 다중 전직 힌트 (카드 하나가 여러 전직에 기여할 수 있음)
export interface MultiAdvancementHint {
  hints: AdvancementHintInfo[];
}

// 덱에서 특정 전직에 기여하는 카드 수 카운트 (advancesTo 기반)
export function countAdvancementCards(deck: Card[], targetClass: CharacterClass): number {
  return deck.filter(card => {
    return card.advancesTo?.includes(targetClass) ?? false;
  }).length;
}

// 전직 조건 충족 여부 체크
export function canAdvanceToClass(
  currentClass: CharacterClass,
  targetClass: CharacterClass,
  deck: Card[]
): boolean {
  // 전사만 전직 가능
  if (!canAdvanceFrom(currentClass)) return false;

  // 이미 해당 클래스면 전직 불가
  if (currentClass === targetClass) return false;

  const definition = ADVANCEMENT_DEFINITIONS[targetClass];
  if (!definition || definition.requiredCards === 0) return false;

  const cardCount = countAdvancementCards(deck, targetClass);
  return cardCount >= definition.requiredCards;
}

// 전직 가능한 클래스 목록 반환 (다중 전직 지원)
export function getAvailableAdvancements(
  currentClass: CharacterClass,
  deck: Card[]
): CharacterClass[] {
  if (!canAdvanceFrom(currentClass)) return [];

  return AVAILABLE_ADVANCEMENTS.filter(targetClass =>
    canAdvanceToClass(currentClass, targetClass, deck)
  );
}

// 전직 처리
export function processClassAdvancement(
  player: Player,
  targetClass: CharacterClass
): Player {
  return {
    ...player,
    characterClass: targetClass,
  };
}

// 전직 진행도 계산 (단일 전직)
export function getAdvancementProgress(
  deck: Card[],
  card: Card,
  playerClass: CharacterClass
): AdvancementHintInfo | null {
  // advancesTo가 없으면 null (전직에 기여 안함)
  if (!card.advancesTo || card.advancesTo.length === 0) return null;

  // 전사만 전직 가능
  if (!canAdvanceFrom(playerClass)) return null;

  // 첫 번째 전직만 반환 (단일 힌트)
  const targetClass = card.advancesTo[0];

  const currentCount = countAdvancementCards(deck, targetClass);
  const definition = ADVANCEMENT_DEFINITIONS[targetClass];
  const requiredCount = definition?.requiredCards ?? 3;

  return {
    targetClass,
    icon: CLASS_ICONS[targetClass],
    color: CLASS_COLORS[targetClass],
    className: CLASS_NAMES[targetClass],
    currentCount,
    requiredCount,
    willAdvanceOnSelect: currentCount + 1 >= requiredCount,
  };
}

// 다중 전직 진행도 계산 (카드가 여러 전직에 기여하는 경우)
export function getMultiAdvancementProgress(
  deck: Card[],
  card: Card,
  playerClass: CharacterClass
): MultiAdvancementHint | null {
  // advancesTo가 없으면 null
  if (!card.advancesTo || card.advancesTo.length === 0) return null;

  // 전사만 전직 가능
  if (!canAdvanceFrom(playerClass)) return null;

  const hints: AdvancementHintInfo[] = [];

  for (const targetClass of card.advancesTo) {
    // 이미 해당 클래스면 스킵
    if (playerClass === targetClass) continue;

    const currentCount = countAdvancementCards(deck, targetClass);
    const definition = ADVANCEMENT_DEFINITIONS[targetClass];
    const requiredCount = definition?.requiredCards ?? 3;

    hints.push({
      targetClass,
      icon: CLASS_ICONS[targetClass],
      color: CLASS_COLORS[targetClass],
      className: CLASS_NAMES[targetClass],
      currentCount,
      requiredCount,
      willAdvanceOnSelect: currentCount + 1 >= requiredCount,
    });
  }

  if (hints.length === 0) return null;

  return { hints };
}

// 전직 정보 가져오기
export function getAdvancementDefinition(targetClass: CharacterClass) {
  return ADVANCEMENT_DEFINITIONS[targetClass];
}
