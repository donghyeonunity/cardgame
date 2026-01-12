import type { Facility, BloodAltarReward } from '../types';

// 공통 시설
export const COMMON_FACILITIES: Facility[] = [
  {
    id: 'tavern',
    type: 'tavern',
    name: '정령의 샘',
    description: '숲의 정령과 유대를 맺습니다',
    emoji: '🌊',
  },
];

// 잊혀진 숲 전용 시설
export const FORGOTTEN_FOREST_FACILITIES: Facility[] = [
  {
    id: 'blood_altar',
    type: 'blood_altar',
    name: '피의 제단',
    description: '즉각적인 보상을 얻지만, 남은 몬스터가 강해집니다',
    emoji: '🩸',
    regionExclusive: 'forgotten_dungeon',
  },
];

// 지역별 시설 (공통 + 지역 전용)
export const REGION_FACILITIES: Record<string, Facility[]> = {
  forgotten_dungeon: [...COMMON_FACILITIES, ...FORGOTTEN_FOREST_FACILITIES],
};

// 피의 제단 보상 선택지 (다중 선택 가능)
export const BLOOD_ALTAR_REWARDS: BloodAltarReward[] = [
  {
    id: 'blood_wealth',
    type: 'gold',
    name: '피의 재물',
    description: '"부를 갈망하는가?"',
    emoji: '💰',
    // 보상
    goldReward: 80,
    // 패널티
    penalty: {
      hpCost: 10,
    },
    rewardText: '+80 골드',
    penaltyText: 'HP -10',
  },
  {
    id: 'blood_power',
    type: 'maxHp',
    name: '피의 힘',
    description: '"강해지길 원하는가?"',
    emoji: '⚔️',
    // 보상
    maxHpReward: 10,
    // 패널티
    penalty: {
      curseCard: true,
      monsterAttackBuff: 0.25,
    },
    rewardText: '최대 HP +10',
    penaltyText: '저주 카드 + 몬스터 공격력 +25%',
  },
  {
    id: 'blood_relic',
    type: 'accessory',
    name: '피의 유물',
    description: '"힘을 빌리고 싶은가?"',
    emoji: '💎',
    // 보상
    accessoryId: 'blood_relic',
    // 패널티
    penalty: {
      monsterHpBuff: 0.2,
    },
    rewardText: '피의 유물 획득',
    penaltyText: '몬스터 HP +20%',
  },
];

// 히든 보상 (3개 모두 선택 시)
export const BLOOD_ALTAR_HIDDEN_REWARD = {
  maxEnergyBonus: 1,
  message: '제단이 그대의 헌신에 응답한다...',
};

// 피의 제단 몬스터 강화 비율 (레거시, 개별 비율로 대체)
export const BLOOD_ALTAR_MONSTER_BUFF = 0.2;  // 20% 강화

// 시설 ID로 조회
export function getFacilityById(id: string): Facility | undefined {
  for (const facilities of Object.values(REGION_FACILITIES)) {
    const found = facilities.find(f => f.id === id);
    if (found) return found;
  }
  return undefined;
}

// 지역별 시설 조회
export function getRegionFacilities(regionId: string): Facility[] {
  return REGION_FACILITIES[regionId] ?? COMMON_FACILITIES;
}

// 피의 제단 보상 조회
export function getBloodAltarRewards(): BloodAltarReward[] {
  return BLOOD_ALTAR_REWARDS;
}
