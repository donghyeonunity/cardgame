import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { HPBar } from '../common/HPBar';
import {
  playerAttackAnimation,
  hitReactAnimation,
  shieldShakeAnimation,
  blockNumberAnimation,
  COMBAT_TIMING,
} from '../../animations';

interface CharacterCardProps {
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  attack?: number;
  emoji: string;
  isPlayer?: boolean;
  isAttacking?: boolean;
  isHit?: boolean;
  isShieldHit?: boolean;
}

export function CharacterCard({
  name,
  hp,
  maxHp,
  block,
  emoji,
  isPlayer = false,
  isAttacking = false,
  isHit = false,
  isShieldHit = false,
}: CharacterCardProps) {
  const cardControls = useAnimationControls();
  const shieldControls = useAnimationControls();
  const blockNumberControls = useAnimationControls();
  const prevBlock = useRef(block);

  // 공격 애니메이션
  useEffect(() => {
    if (isAttacking) {
      cardControls.start(playerAttackAnimation);
    }
  }, [isAttacking, cardControls]);

  // 피격 애니메이션 (공격자가 도달하는 시점에 시작)
  useEffect(() => {
    if (isHit) {
      const hitDelay = (COMBAT_TIMING.PEEK_DURATION + COMBAT_TIMING.HIT_DURATION) * 1000;
      const timer = setTimeout(() => {
        cardControls.start(hitReactAnimation);
      }, hitDelay);
      return () => clearTimeout(timer);
    }
  }, [isHit, cardControls]);

  // 방패 흔들림 애니메이션 (공격자가 도달하는 시점에 시작)
  useEffect(() => {
    if (isShieldHit && prevBlock.current > 0) {
      const hitDelay = (COMBAT_TIMING.PEEK_DURATION + COMBAT_TIMING.HIT_DURATION) * 1000;
      const timer = setTimeout(() => {
        shieldControls.start(shieldShakeAnimation);
        blockNumberControls.start(blockNumberAnimation);
      }, hitDelay);
      prevBlock.current = block;
      return () => clearTimeout(timer);
    }
    prevBlock.current = block;
  }, [isShieldHit, block, shieldControls, blockNumberControls]);

  return (
    <motion.div
      className="w-48 flex flex-col"
      animate={cardControls}
    >
      {/* 상단: 방패 + HP 바 */}
      <div className="flex items-center gap-2 mb-1">
        {/* 방패 아이콘 + 방어력 수치 */}
        <motion.div
          className="relative flex-shrink-0"
          animate={shieldControls}
        >
          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold
              ${block > 0
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}
          >
            {block > 0 ? (
              <motion.span animate={blockNumberControls}>{block}</motion.span>
            ) : (
              <span className="text-xl">🛡️</span>
            )}
          </div>
          {/* 방어력이 있을 때 방패 아이콘 오버레이 */}
          {block > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-xs">
              🛡️
            </div>
          )}
        </motion.div>

        {/* HP 바 */}
        <div className="flex-1">
          <HPBar
            current={hp}
            max={maxHp}
            color={isPlayer ? 'green' : 'red'}
          />
        </div>
      </div>

      {/* 카드 본체 */}
      <div className="rounded-lg border border-gray-700 bg-gray-800 overflow-hidden">
        {/* 카드 이름 */}
        <div className="py-2 text-center text-white font-bold border-b border-gray-700 bg-gray-750">
          {name}
        </div>

        {/* 캐릭터 이미지 영역 */}
        <div className="flex items-center justify-center py-10 text-6xl bg-gray-850">
          {emoji}
        </div>
      </div>
    </motion.div>
  );
}
