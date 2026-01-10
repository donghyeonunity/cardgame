import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { Card } from '../common/Card';
import { AdvancementHint } from '../common/AdvancementHint';
import { getMultiAdvancementProgress, CLASS_NAMES, CLASS_ICONS, CLASS_COLORS } from '../../utils/advancementSystem';
import { ADVANCEMENT_DEFINITIONS } from '../../data/advancement';
import type { CharacterClass } from '../../types';

export function RewardScreen() {
  const { player, reward, battle, selectRewardCard, skipReward, confirmAdvancement, selectAdvancement } = useGameStore();
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  // 현재 전체 덱 (deck + hand + discard)
  const fullDeck = [...battle.deck, ...battle.hand, ...battle.discard];

  if (!reward) return null;

  const isClassAdvancement = battle.phase === 'class_advancement';
  const hasAdvancementOptions = reward.advancementOptions && reward.advancementOptions.length > 0;
  const targetClass = reward.targetAdvancement;

  const handleCardSelect = (cardId: string) => {
    if (isClassAdvancement) {
      confirmAdvancement(cardId);
    } else {
      selectRewardCard(cardId);
    }
  };

  const handleAdvancementSelect = (targetClass: CharacterClass) => {
    selectAdvancement(targetClass);
  };

  // 다중 전직 선택 화면
  if (isClassAdvancement && hasAdvancementOptions) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            전직 선택!
          </h1>
          <p className="text-xl text-yellow-200">
            여러 전직 조건을 충족했습니다
          </p>
          <p className="text-gray-400 mt-2">
            원하는 클래스를 선택하세요
          </p>
        </motion.div>

        {/* 전직 선택지 */}
        <div className="flex gap-6 mb-8">
          {reward.advancementOptions!.map((classId, index) => {
            const definition = ADVANCEMENT_DEFINITIONS[classId];
            return (
              <motion.div
                key={classId}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAdvancementSelect(classId)}
                className="cursor-pointer"
              >
                <div
                  className="w-48 p-6 rounded-xl border-2 hover:scale-105 transition-transform"
                  style={{
                    borderColor: CLASS_COLORS[classId],
                    backgroundColor: `${CLASS_COLORS[classId]}20`,
                  }}
                >
                  <div className="text-center">
                    <span className="text-4xl">{CLASS_ICONS[classId]}</span>
                    <h3
                      className="text-xl font-bold mt-2"
                      style={{ color: CLASS_COLORS[classId] }}
                    >
                      {CLASS_NAMES[classId]}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      {definition.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-3 italic">
                      {definition.auraDescription}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      {/* 제목 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        {isClassAdvancement && targetClass ? (
          <>
            <h1 className="text-4xl font-bold mb-2" style={{ color: CLASS_COLORS[targetClass] }}>
              {CLASS_ICONS[targetClass]} 전직!
            </h1>
            <p className="text-xl" style={{ color: CLASS_COLORS[targetClass] }}>
              {CLASS_NAMES[targetClass]}(으)로 각성합니다
            </p>
            <p className="text-gray-400 mt-2">
              보너스 카드를 선택하세요
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-green-400 mb-2">
              승리!
            </h1>
            <p className="text-gray-400">
              보상 카드를 선택하세요
            </p>
          </>
        )}
      </motion.div>

      {/* 카드 선택지 */}
      <div className="flex gap-8 mb-8">
        {reward.cards.map((card, index) => {
          // 전직 힌트 계산 (일반 보상 화면에서만)
          const hints = !isClassAdvancement
            ? getMultiAdvancementProgress(fullDeck, card, player.characterClass)
            : null;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 50, rotate: -10 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleCardSelect(card.id)}
              onMouseEnter={() => setHoveredCardIndex(index)}
              onMouseLeave={() => setHoveredCardIndex(null)}
              className="cursor-pointer transform hover:scale-110 hover:-translate-y-4 transition-transform w-32"
            >
              <Card card={card} />
              {/* 전직 힌트 표시 */}
              {hints && <AdvancementHint hints={hints} showTooltip={hoveredCardIndex === index} />}
            </motion.div>
          );
        })}
      </div>

      {/* 스킵 버튼 (전직 보상이 아닐 때만) */}
      {!isClassAdvancement && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={skipReward}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          건너뛰기
        </motion.button>
      )}

      {/* 전직 안내 (전직 화면일 때) */}
      {isClassAdvancement && targetClass && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center text-sm text-gray-500"
        >
          <p>{CLASS_NAMES[targetClass]} 전직 조건을 달성했습니다!</p>
          <p>선택한 카드가 덱에 추가됩니다.</p>
        </motion.div>
      )}
    </div>
  );
}
