import type { Variants, Transition, Easing } from 'framer-motion';

// 애니메이션 타이밍 상수
export const ANIMATION_TIMING = {
  CARD_STAGGER: 0.08,       // 카드 간 딜레이 (초)
  DISCARD_DURATION: 0.3,    // 버림 애니메이션 시간
  DRAW_DURATION: 0.2,       // 드로우 애니메이션 시간
} as const;

// Spring 설정
export const SPRING_CONFIG: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

// ============================================
// 버림 애니메이션 (Discard Animations)
// ============================================

// A: 오른쪽으로 날아감 (기본)
export const discardFlyRight = {
  x: 300,
  y: -50,
  rotate: 15,
  opacity: 0,
  transition: { duration: ANIMATION_TIMING.DISCARD_DURATION, ease: 'easeIn' as Easing },
};

// B: 아래로 떨어짐
export const discardFallDown = {
  x: 50,
  y: 200,
  rotate: 25,
  opacity: 0,
  transition: { duration: 0.4, ease: 'easeIn' as Easing },
};

// C: 위로 날아감
export const discardFlyUp = {
  x: 0,
  y: -200,
  rotate: -10,
  opacity: 0,
  scale: 0.5,
  transition: { duration: 0.35, ease: 'easeOut' as Easing },
};

// ============================================
// 드로우 애니메이션 (Draw Animations)
// ============================================

// A: 왼쪽 아래에서 등장 (기본)
export const drawFromDeck = {
  initial: {
    x: -250,
    y: 150,
    rotate: -15,
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
  },
};

// B: 위에서 떨어짐
export const drawFromTop = {
  initial: {
    x: 0,
    y: -200,
    rotate: 0,
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
  },
};

// C: 중앙에서 팝업
export const drawPopup = {
  initial: {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 0,
    scale: 0,
  },
  animate: {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
  },
};

// ============================================
// 손패 상태 (In Hand State)
// ============================================

export const inHandState = {
  x: 0,
  y: 0,
  opacity: 1,
  scale: 1,
};

// ============================================
// Framer Motion Variants (조합된 variants)
// ============================================

export interface CardAnimationConfig {
  discard: typeof discardFlyRight;
  draw: typeof drawFromDeck;
}

// 현재 사용할 애니메이션 설정
export const currentConfig: CardAnimationConfig = {
  discard: discardFlyRight,
  draw: drawFromDeck,
};

// 카드 variants 생성 함수
export function createCardVariants(config: CardAnimationConfig = currentConfig): Variants {
  return {
    // 손패에 있을 때 (기본 상태)
    inHand: inHandState,

    // 버림패로 이동 (exit 애니메이션)
    exit: config.discard,

    // 덱에서 드로우 (initial 상태)
    initial: config.draw.initial,

    // 손패로 들어옴 (animate 상태)
    animate: {
      ...config.draw.animate,
      transition: {
        ...SPRING_CONFIG,
        duration: ANIMATION_TIMING.DRAW_DURATION,
      },
    },
  };
}

// 기본 카드 variants
export const cardVariants = createCardVariants();
