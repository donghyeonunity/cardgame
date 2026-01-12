import type { Region } from '../types';

// 지역 정의
export const REGIONS: Record<string, Region> = {
  forgotten_dungeon: {
    id: 'forgotten_dungeon',
    name: '잊혀진 숲',
    description: '안개에 뒤덮인 고대의 숲. 슬라임과 고블린이 서식한다.',
    totalRounds: 7,
    bossKey: 'dark_knight',
  },
  // 추후 확장용 지역들
  // cursed_forest: {
  //   id: 'cursed_forest',
  //   name: '저주받은 숲',
  //   description: '독안개가 자욱한 숲. 거미와 망령이 출몰한다.',
  //   totalRounds: 7,
  //   bossKey: 'forest_witch',
  // },
};

// 기본 시작 지역
export const DEFAULT_REGION_ID = 'forgotten_dungeon';

// 지역 조회
export function getRegion(regionId: string): Region {
  return REGIONS[regionId] ?? REGIONS[DEFAULT_REGION_ID];
}
