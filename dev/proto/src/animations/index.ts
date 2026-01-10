// 카드 애니메이션 설정
// 다른 애니메이션으로 교체하려면 이 파일에서 import를 변경하세요

export {
  // 현재 사용 중인 애니메이션
  cardVariants,
  currentConfig,
  createCardVariants,

  // 타이밍 설정
  ANIMATION_TIMING,
  SPRING_CONFIG,

  // 버림 애니메이션 옵션들
  discardFlyRight,
  discardFallDown,
  discardFlyUp,

  // 드로우 애니메이션 옵션들
  drawFromDeck,
  drawFromTop,
  drawPopup,

  // 타입
  type CardAnimationConfig,
} from './cardAnimations';

// 전투 애니메이션
export {
  COMBAT_TIMING,
  TOTAL_ATTACK_DURATION,
  playerAttackAnimation,
  enemyAttackAnimation,
  hitReactAnimation,
  shieldShakeAnimation,
  blockNumberAnimation,
} from './combatAnimations';
