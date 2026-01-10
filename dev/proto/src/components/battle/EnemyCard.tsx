import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { Enemy } from '../../types';
import { HPBar } from '../common/HPBar';
import {
  enemyAttackAnimation,
  hitReactAnimation,
  shieldShakeAnimation,
  blockNumberAnimation,
  COMBAT_TIMING,
} from '../../animations';

interface EnemyCardProps {
  enemy: Enemy;
  isAttacking?: boolean;
  isHit?: boolean;
  previewDamage?: number;  // 예상 데미지 (프리뷰용)
}

export function EnemyCard({
  enemy,
  isAttacking = false,
  isHit = false,
  previewDamage = 0,
}: EnemyCardProps) {
  const cardControls = useAnimationControls();
  const shieldControls = useAnimationControls();
  const blockNumberControls = useAnimationControls();
  const prevBlock = useRef(enemy.block);

  const intentIcons = {
    attack: '⚔️',
    defend: '🛡️',
    buff: '✨',
  };

  const intentLabels = {
    attack: '공격',
    defend: '방어',
    buff: '강화',
  };

  // 공격 애니메이션
  useEffect(() => {
    if (isAttacking) {
      cardControls.start(enemyAttackAnimation);
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

  // 방패 흔들림 애니메이션 (방어력 변화 시)
  useEffect(() => {
    if (prevBlock.current > 0 && enemy.block < prevBlock.current) {
      const hitDelay = (COMBAT_TIMING.PEEK_DURATION + COMBAT_TIMING.HIT_DURATION) * 1000;
      const timer = setTimeout(() => {
        shieldControls.start(shieldShakeAnimation);
        blockNumberControls.start(blockNumberAnimation);
      }, hitDelay);
      prevBlock.current = enemy.block;
      return () => clearTimeout(timer);
    }
    prevBlock.current = enemy.block;
  }, [enemy.block, shieldControls, blockNumberControls]);

  return (
    <motion.div
      className="w-48 flex flex-col items-center"
      animate={cardControls}
    >
      {/* 다음 액션 표시 */}
      <div className="mb-2 px-3 py-1 bg-gray-800 rounded-lg text-sm">
        <span className="mr-1">{intentIcons[enemy.intent.type]}</span>
        <span className="text-gray-300">{intentLabels[enemy.intent.type]}</span>
        <span className="ml-1 text-yellow-400 font-bold">{enemy.intent.value}</span>
      </div>

      {/* 상단: 방패 + HP 바 */}
      <div className="w-full flex items-center gap-2 mb-1">
        {/* 방패 아이콘 + 방어력 수치 */}
        <motion.div
          className="relative flex-shrink-0"
          animate={shieldControls}
        >
          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold
              ${enemy.block > 0
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}
          >
            {enemy.block > 0 ? (
              <motion.span animate={blockNumberControls}>{enemy.block}</motion.span>
            ) : (
              <span className="text-xl">🛡️</span>
            )}
          </div>
          {/* 방어력이 있을 때 방패 아이콘 오버레이 */}
          {enemy.block > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-xs">
              🛡️
            </div>
          )}
        </motion.div>

        {/* HP 바 */}
        <div className="flex-1">
          <HPBar
            current={enemy.hp}
            max={enemy.maxHp}
            color="red"
            previewDamage={previewDamage}
          />
        </div>
      </div>

      {/* 카드 본체 */}
      <div className="w-full rounded-lg border-2 border-purple-500 bg-gray-800 overflow-hidden">
        {/* 적 이름 */}
        <div className="py-2 text-center text-white font-bold border-b border-gray-700 bg-gray-750">
          {enemy.name}
        </div>

        {/* 적 이미지 영역 */}
        <div className="flex items-center justify-center py-10 text-6xl bg-gray-850">
          👾
        </div>
      </div>
    </motion.div>
  );
}
