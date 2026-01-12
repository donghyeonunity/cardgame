import type { DestinationOption, DestinationType } from '../types';
import { getRandomEnemyKey } from './enemies';

// 행선지 ID 카운터
let destinationIdCounter = 0;

// 행선지 생성 설정
const DESTINATION_CONFIG = {
  eliteChance: 0.25,     // 엘리트 등장 확률 25%
  restChance: 0.20,      // 휴식 등장 확률 20%
  shopChance: 0.15,      // 상점 등장 확률 15%
  eventChance: 0.15,     // 이벤트 등장 확률 15%
  eliteMinRound: 2,      // 엘리트 최소 등장 라운드
  shopMinRound: 2,       // 상점 최소 등장 라운드
  restHealPercent: 30,   // 휴식 시 회복량 (최대 HP의 %)
};

// 선택지 개수 결정 (라운드별, 7라운드 기준)
export function getDestinationCount(round: number, totalRounds: number = 7): number {
  // 마지막 라운드 (보스): 1개 고정
  if (round >= totalRounds) return 1;
  // 라운드 3, 5: 3개 선택지
  if (round === 3 || round === 5) return 3;
  // 나머지: 2개 선택지
  return 2;
}

// 일반 몬스터 행선지 생성
function createNormalDestination(round: number, excludeEnemies: string[] = []): DestinationOption {
  const enemyKey = getRandomEnemyKey(round, excludeEnemies);
  return {
    id: `dest_${destinationIdCounter++}`,
    type: 'normal',
    enemyKey,
  };
}

// 엘리트 몬스터 행선지 생성
function createEliteDestination(round: number, excludeEnemies: string[] = []): DestinationOption {
  const enemyKey = getRandomEnemyKey(round, excludeEnemies);
  return {
    id: `dest_${destinationIdCounter++}`,
    type: 'elite',
    enemyKey,
  };
}

// 휴식 행선지 생성
function createRestDestination(): DestinationOption {
  return {
    id: `dest_${destinationIdCounter++}`,
    type: 'rest',
    healPercent: DESTINATION_CONFIG.restHealPercent,
  };
}

// 상점 행선지 생성
function createShopDestination(): DestinationOption {
  return {
    id: `dest_${destinationIdCounter++}`,
    type: 'shop',
  };
}

// 이벤트 행선지 생성
function createEventDestination(): DestinationOption {
  return {
    id: `dest_${destinationIdCounter++}`,
    type: 'event',
  };
}

// 보스 행선지 생성 (마지막 라운드)
function createBossDestination(bossKey: string = 'dark_knight'): DestinationOption {
  return {
    id: `dest_${destinationIdCounter++}`,
    type: 'elite',  // 보스는 엘리트로 표시
    enemyKey: bossKey,
  };
}

// 행선지 타입 결정 (확률 기반)
function decideDestinationType(round: number, totalRounds: number, existingTypes: DestinationType[]): DestinationType {
  // 보스 라운드
  if (round >= totalRounds) return 'elite';

  // 이미 있는 타입 체크 (각 타입은 한 번만)
  const hasElite = existingTypes.includes('elite');
  const hasRest = existingTypes.includes('rest');
  const hasShop = existingTypes.includes('shop');
  const hasEvent = existingTypes.includes('event');

  // 가능한 타입과 확률
  const candidates: { type: DestinationType; chance: number }[] = [];

  if (!hasElite && round >= DESTINATION_CONFIG.eliteMinRound) {
    candidates.push({ type: 'elite', chance: DESTINATION_CONFIG.eliteChance });
  }
  if (!hasRest) {
    candidates.push({ type: 'rest', chance: DESTINATION_CONFIG.restChance });
  }
  if (!hasShop && round >= DESTINATION_CONFIG.shopMinRound) {
    candidates.push({ type: 'shop', chance: DESTINATION_CONFIG.shopChance });
  }
  if (!hasEvent) {
    candidates.push({ type: 'event', chance: DESTINATION_CONFIG.eventChance });
  }

  // 확률 기반 선택
  const roll = Math.random();
  let cumulative = 0;

  for (const candidate of candidates) {
    cumulative += candidate.chance;
    if (roll < cumulative) {
      return candidate.type;
    }
  }

  return 'normal';
}

// 라운드에 맞는 행선지 선택지 생성
export function generateDestinationOptions(
  round: number,
  totalRounds: number = 7,
  bossKey: string = 'dark_knight'
): DestinationOption[] {
  const count = getDestinationCount(round, totalRounds);
  const destinations: DestinationOption[] = [];
  const usedTypes: DestinationType[] = [];
  const usedEnemies: string[] = []; // 중복 방지용

  // 보스 라운드 (마지막 라운드)
  if (round >= totalRounds) {
    return [createBossDestination(bossKey)];
  }

  // 첫 번째 행선지는 항상 일반 몬스터
  const firstDestination = createNormalDestination(round, usedEnemies);
  destinations.push(firstDestination);
  usedTypes.push('normal');
  if (firstDestination.enemyKey) {
    usedEnemies.push(firstDestination.enemyKey);
  }

  // 나머지 행선지 생성
  for (let i = 1; i < count; i++) {
    const destinationType = decideDestinationType(round, totalRounds, usedTypes);
    usedTypes.push(destinationType);

    let destination: DestinationOption;
    switch (destinationType) {
      case 'elite':
        destination = createEliteDestination(round, usedEnemies);
        break;
      case 'rest':
        destination = createRestDestination();
        break;
      case 'shop':
        destination = createShopDestination();
        break;
      case 'event':
        destination = createEventDestination();
        break;
      default:
        destination = createNormalDestination(round, usedEnemies);
    }

    // 사용된 적 추적
    if (destination.enemyKey) {
      usedEnemies.push(destination.enemyKey);
    }

    destinations.push(destination);
  }

  return destinations;
}

// 행선지 ID 카운터 리셋 (테스트용)
export function resetDestinationIdCounter(): void {
  destinationIdCounter = 0;
}
