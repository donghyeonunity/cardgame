import { motion, AnimatePresence } from 'framer-motion';
import type { AdvancementHintInfo, MultiAdvancementHint } from '../../utils/advancementSystem';

interface AdvancementHintProps {
  hints: MultiAdvancementHint;
  showTooltip?: boolean;  // 부모에서 제어
}

export function AdvancementHint({ hints, showTooltip = false }: AdvancementHintProps) {
  if (!hints.hints || hints.hints.length === 0) return null;

  // 전직 트리거되는 클래스들
  const triggers = hints.hints.filter(h => h.willAdvanceOnSelect);

  // 기여하는 모든 클래스
  const allContributions = hints.hints;

  // 트리거 없으면 기본 상태에서는 아무것도 표시하지 않음
  if (triggers.length === 0 && !showTooltip) return null;

  return (
    <motion.div
      className="mt-2 text-center relative w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* 기본 표시: 전직 트리거만 */}
      {triggers.length > 0 && (
        <div className="flex items-center justify-center gap-1">
          {triggers.map(t => (
            <span
              key={t.targetClass}
              className="text-lg"
              style={{ filter: `drop-shadow(0 0 4px ${t.color})` }}
            >
              {t.icon}
            </span>
          ))}
          <span className="text-sm font-bold text-yellow-400 ml-1">
            전직!
          </span>
        </div>
      )}

      {/* 카드 호버 시 툴팁: 기여 클래스 목록 */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50"
          >
            <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
              <div className="text-xs text-gray-400 mb-1">전직 기여:</div>
              {allContributions.map(hint => (
                <div
                  key={hint.targetClass}
                  className="flex items-center gap-2 text-sm"
                >
                  <span>{hint.icon}</span>
                  <span style={{ color: hint.color }}>{hint.className}</span>
                  <span className="text-gray-500 text-xs">
                    {hint.currentCount}/{hint.requiredCount}
                  </span>
                  {hint.willAdvanceOnSelect && (
                    <span className="text-yellow-400 text-xs font-bold">전직!</span>
                  )}
                </div>
              ))}
            </div>
            {/* 툴팁 화살표 */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 border-l border-t border-gray-600 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 하위 호환용 (단일 힌트)
interface SingleHintProps {
  hint: AdvancementHintInfo;
}

export function SingleAdvancementHint({ hint }: SingleHintProps) {
  return (
    <AdvancementHint
      hints={{ hints: [hint] }}
    />
  );
}
