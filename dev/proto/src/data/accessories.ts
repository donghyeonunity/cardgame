import type { Accessory } from '../types';

// 잊혀진 숲 장신구 (3개 - 마을에서 1개 선택)
export const FORGOTTEN_FOREST_ACCESSORIES: Accessory[] = [
  {
    id: 'mossy_amulet',
    name: '이끼 낀 부적',
    description: '턴 시작 시 방어력 +2',
    emoji: '🧿',
    regionId: 'forgotten_dungeon',
    effect: {
      type: 'on_turn_start',
      stat: 'block',
      value: 2,
    },
  },
  {
    id: 'forest_blessing',
    name: '숲의 가호',
    description: '최대 HP +10',
    emoji: '🌿',
    regionId: 'forgotten_dungeon',
    effect: {
      type: 'stat_boost',
      stat: 'maxHp',
      value: 10,
    },
  },
  {
    id: 'hunters_eye',
    name: '사냥꾼의 눈',
    description: '공격 카드 데미지 +1',
    emoji: '👁️',
    regionId: 'forgotten_dungeon',
    effect: {
      type: 'passive',
      stat: 'damage',
      value: 1,
    },
  },
];

// 피의 제단 장신구 (피의 유물 선택 시 획득)
export const BLOOD_ALTAR_ACCESSORIES: Accessory[] = [
  {
    id: 'blood_relic',
    name: '피의 유물',
    description: '전투 시작 시 모든 적에게 약화 1 부여',
    emoji: '💎',
    regionId: 'blood_altar',
    effect: {
      type: 'on_turn_start',  // 전투 시작 시 효과로 처리
      stat: 'damage',
      value: -25,  // weak 효과와 동일 (25% 감소)
    },
  },
];

// 지역별 장신구 맵
export const REGION_ACCESSORIES: Record<string, Accessory[]> = {
  forgotten_dungeon: FORGOTTEN_FOREST_ACCESSORIES,
};

// 장신구 ID로 조회 (지역 장신구 + 피의 제단 장신구 모두 검색)
export function getAccessoryById(id: string): Accessory | undefined {
  // 지역 장신구 검색
  for (const accessories of Object.values(REGION_ACCESSORIES)) {
    const found = accessories.find(a => a.id === id);
    if (found) return found;
  }
  // 피의 제단 장신구 검색
  const bloodAltarAccessory = BLOOD_ALTAR_ACCESSORIES.find(a => a.id === id);
  if (bloodAltarAccessory) return bloodAltarAccessory;

  return undefined;
}

// 지역별 장신구 조회
export function getRegionAccessories(regionId: string): Accessory[] {
  return REGION_ACCESSORIES[regionId] ?? [];
}
