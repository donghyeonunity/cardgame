import type {
  Buff,
  ActiveBuff,
  BuffEventType,
  BuffEventEffect,
  CardEffect,
  Player,
} from '../types';
import { PALADIN_BUFF_DEFINITIONS, PALADIN_BUFF_EVENT_EFFECTS } from '../data/characters/paladin';

// 모든 버프 정의 통합
const ALL_BUFF_DEFINITIONS: Record<string, Buff> = {
  ...PALADIN_BUFF_DEFINITIONS,
};

// 모든 버프 이벤트 효과 통합
const ALL_BUFF_EVENT_EFFECTS: Record<string, BuffEventEffect[]> = {
  ...PALADIN_BUFF_EVENT_EFFECTS,
};

// 버프 정의 조회
export function getBuffDefinition(buffId: string): Buff | undefined {
  return ALL_BUFF_DEFINITIONS[buffId];
}

// 버프 이벤트 효과 조회
export function getBuffEventEffects(buffId: string, event: BuffEventType): CardEffect[] {
  const effects = ALL_BUFF_EVENT_EFFECTS[buffId];
  if (!effects) return [];

  return effects
    .filter(e => e.event === event)
    .map(e => e.effect);
}

// 버프 적용 (플레이어에게 버프 추가)
export function applyBuff(player: Player, buffId: string): Player {
  const buffDef = getBuffDefinition(buffId);
  if (!buffDef) {
    console.warn(`Unknown buff: ${buffId}`);
    return player;
  }

  // 이미 같은 버프가 있는지 확인
  const existingIndex = player.activeBuffs.findIndex(b => b.buffId === buffId);

  if (existingIndex >= 0) {
    // 스택 가능한 버프면 스택 증가
    if (buffDef.stackable) {
      const updatedBuffs = [...player.activeBuffs];
      updatedBuffs[existingIndex] = {
        ...updatedBuffs[existingIndex],
        stacks: updatedBuffs[existingIndex].stacks + 1,
      };
      return { ...player, activeBuffs: updatedBuffs };
    }
    // 스택 불가능하면 그대로 반환
    return player;
  }

  // 새 버프 추가
  const newBuff: ActiveBuff = {
    buffId,
    stacks: 1,
    remainingDuration: buffDef.duration,
  };

  return {
    ...player,
    activeBuffs: [...player.activeBuffs, newBuff],
  };
}

// 버프 제거
export function removeBuff(player: Player, buffId: string): Player {
  return {
    ...player,
    activeBuffs: player.activeBuffs.filter(b => b.buffId !== buffId),
  };
}

// 버프 스택 감소
export function decreaseBuffStacks(player: Player, buffId: string, amount: number = 1): Player {
  const updatedBuffs = player.activeBuffs
    .map(buff => {
      if (buff.buffId !== buffId) return buff;
      const newStacks = buff.stacks - amount;
      if (newStacks <= 0) return null;
      return { ...buff, stacks: newStacks };
    })
    .filter((buff): buff is ActiveBuff => buff !== null);

  return { ...player, activeBuffs: updatedBuffs };
}

// 턴 시작 시 버프 효과 처리 결과
export interface TurnStartBuffResult {
  blockGained: number;
  damageDealt: number;
  cardsDrawn: number;
  energyGained: number;
}

// 턴 시작 시 버프 효과 수집
export function collectTurnStartBuffEffects(player: Player): TurnStartBuffResult {
  const result: TurnStartBuffResult = {
    blockGained: 0,
    damageDealt: 0,
    cardsDrawn: 0,
    energyGained: 0,
  };

  for (const buff of player.activeBuffs) {
    const effects = getBuffEventEffects(buff.buffId, 'turn_start');

    for (const effect of effects) {
      const value = effect.value * buff.stacks;

      switch (effect.type) {
        case 'block':
          result.blockGained += value;
          break;
        case 'damage':
          result.damageDealt += value;
          break;
        case 'draw':
          result.cardsDrawn += value;
          break;
        case 'energy':
          result.energyGained += value;
          break;
      }
    }
  }

  return result;
}

// 턴 종료 시 버프 지속시간 감소
export function processBuffDurations(player: Player): Player {
  const updatedBuffs = player.activeBuffs
    .map(buff => {
      // 'combat' 지속시간은 감소하지 않음
      if (buff.remainingDuration === 'combat') {
        return buff;
      }

      const newDuration = buff.remainingDuration - 1;
      if (newDuration <= 0) {
        return null; // 버프 만료
      }

      return { ...buff, remainingDuration: newDuration };
    })
    .filter((buff): buff is ActiveBuff => buff !== null);

  return { ...player, activeBuffs: updatedBuffs };
}

// 전투 종료 시 모든 버프 제거
export function clearAllBuffs(player: Player): Player {
  return { ...player, activeBuffs: [] };
}

// 특정 버프가 활성화되어 있는지 확인
export function hasActiveBuff(player: Player, buffId: string): boolean {
  return player.activeBuffs.some(b => b.buffId === buffId);
}

// 특정 버프의 스택 수 조회
export function getBuffStacks(player: Player, buffId: string): number {
  const buff = player.activeBuffs.find(b => b.buffId === buffId);
  return buff?.stacks ?? 0;
}
