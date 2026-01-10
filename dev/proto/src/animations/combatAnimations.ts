// 전투 애니메이션 정의

// 타이밍 상수
export const COMBAT_TIMING = {
  PEEK_DURATION: 0.1,      // 뒤로 빠지는 시간
  HIT_DURATION: 0.15,      // 앞으로 치는 시간
  RETURN_DURATION: 0.15,   // 원위치 복귀 시간
  SHAKE_DURATION: 0.3,     // 흔들림 시간
  SHIELD_SHAKE: 0.2,       // 방패 흔들림 시간
} as const;

// Peek & Hit 애니메이션 (공격자)
// 유저: 오른쪽으로 공격 (뒤로 → 앞으로 → 원위치)
export const playerAttackAnimation = {
  x: [0, -20, 30, 0],
  transition: {
    duration: COMBAT_TIMING.PEEK_DURATION + COMBAT_TIMING.HIT_DURATION + COMBAT_TIMING.RETURN_DURATION,
    times: [0, 0.25, 0.6, 1],
    ease: 'easeOut' as const,
  },
};

// 적: 왼쪽으로 공격 (뒤로 → 앞으로 → 원위치)
export const enemyAttackAnimation = {
  x: [0, 20, -30, 0],
  transition: {
    duration: COMBAT_TIMING.PEEK_DURATION + COMBAT_TIMING.HIT_DURATION + COMBAT_TIMING.RETURN_DURATION,
    times: [0, 0.25, 0.6, 1],
    ease: 'easeOut' as const,
  },
};

// 피격 흔들림 애니메이션
export const hitReactAnimation = {
  x: [0, -10, 10, -5, 0],
  transition: {
    duration: COMBAT_TIMING.SHAKE_DURATION,
    times: [0, 0.2, 0.5, 0.8, 1],
    ease: 'easeOut' as const,
  },
};

// 방패 흔들림 애니메이션 (방어력 감소 시)
export const shieldShakeAnimation = {
  rotate: [0, -15, 15, -10, 0],
  scale: [1, 1.1, 1],
  transition: {
    duration: COMBAT_TIMING.SHIELD_SHAKE,
    times: [0, 0.2, 0.5, 0.8, 1],
    ease: 'easeOut' as const,
  },
};

// 방어력 숫자 애니메이션 (변경 시)
export const blockNumberAnimation = {
  scale: [1, 1.3, 1],
  transition: {
    duration: 0.2,
    times: [0, 0.5, 1],
    ease: 'easeOut' as const,
  },
};

// 전체 애니메이션 시간
export const TOTAL_ATTACK_DURATION =
  COMBAT_TIMING.PEEK_DURATION +
  COMBAT_TIMING.HIT_DURATION +
  COMBAT_TIMING.RETURN_DURATION;
