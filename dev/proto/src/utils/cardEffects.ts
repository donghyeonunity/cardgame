import type {
  Card,
  CardEffect,
  ConditionalEffect,
  Player,
} from '../types';
import { getBuffEventEffects } from './buffSystem';

// 조건 체크 함수
export function checkCondition(
  condition: ConditionalEffect['condition'],
  conditionValue: string | number,
  player: Player
): boolean {
  switch (condition) {
    case 'buff_active':
      return player.activeBuffs.some(buff => buff.buffId === conditionValue);

    case 'hp_below':
      if (typeof conditionValue !== 'number') return false;
      return player.hp < conditionValue;

    case 'energy_above':
      if (typeof conditionValue !== 'number') return false;
      return player.energy > conditionValue;

    default:
      return false;
  }
}

// 효과 수집 (카드 기본 효과 + 조건부 효과 + 버프 이벤트 효과)
export function collectCardEffects(card: Card, player: Player): CardEffect[] {
  const effectsToApply: CardEffect[] = [];

  // 1. 카드 기본 효과 추가
  if (card.effects) {
    effectsToApply.push(...card.effects);
  }

  // 2. 조건부 효과 체크 및 추가
  if (card.conditionalEffects) {
    for (const conditional of card.conditionalEffects) {
      if (checkCondition(conditional.condition, conditional.conditionValue, player)) {
        effectsToApply.push(conditional.effect);
      }
    }
  }

  // 3. 공격 카드일 경우 버프 이벤트 효과 추가 (on_attack)
  if (card.type === 'attack') {
    for (const buff of player.activeBuffs) {
      const buffEffects = getBuffEventEffects(buff.buffId, 'on_attack');
      effectsToApply.push(...buffEffects);
    }
  }

  // 4. 방어 카드일 경우 버프 이벤트 효과 추가 (on_defend)
  if (card.type === 'skill' && card.block && card.block > 0) {
    for (const buff of player.activeBuffs) {
      const buffEffects = getBuffEventEffects(buff.buffId, 'on_defend');
      effectsToApply.push(...buffEffects);
    }
  }

  return effectsToApply;
}

// 효과 결과 계산 (상태 변경 없이 결과만 반환)
export interface EffectResult {
  damageToEnemy: number;
  blockToPlayer: number;
  drawCards: number;
  energyChange: number;
  buffsToApply: string[];
}

export function calculateEffectResults(effects: CardEffect[]): EffectResult {
  const result: EffectResult = {
    damageToEnemy: 0,
    blockToPlayer: 0,
    drawCards: 0,
    energyChange: 0,
    buffsToApply: [],
  };

  for (const effect of effects) {
    switch (effect.type) {
      case 'damage':
        if (effect.target === 'enemy') {
          result.damageToEnemy += effect.value;
        }
        break;

      case 'block':
        if (effect.target === 'self') {
          result.blockToPlayer += effect.value;
        }
        break;

      case 'draw':
        result.drawCards += effect.value;
        break;

      case 'energy':
        result.energyChange += effect.value;
        break;

      case 'apply_buff':
        if (effect.buffId) {
          result.buffsToApply.push(effect.buffId);
        }
        break;
    }
  }

  return result;
}

// 카드 사용 시 전체 효과 처리 (효과 수집 + 결과 계산)
export function processCardPlay(card: Card, player: Player): EffectResult {
  const effects = collectCardEffects(card, player);
  return calculateEffectResults(effects);
}

// 레거시 카드 지원 (damage/block 필드만 있는 기존 카드)
export function getLegacyCardEffects(card: Card): EffectResult {
  return {
    damageToEnemy: card.damage ?? 0,
    blockToPlayer: card.block ?? 0,
    drawCards: 0,
    energyChange: 0,
    buffsToApply: [],
  };
}

// 카드 효과 처리 (레거시 + 새 시스템 통합)
export function getCardEffects(card: Card, player: Player): EffectResult {
  // 새로운 effects 배열이 있으면 새 시스템 사용
  if (card.effects && card.effects.length > 0) {
    return processCardPlay(card, player);
  }

  // 없으면 레거시 필드 사용
  return getLegacyCardEffects(card);
}
