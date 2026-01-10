import { motion, AnimatePresence } from 'framer-motion';

interface HPBarProps {
  current: number;
  max: number;
  showText?: boolean;
  color?: 'red' | 'green';
  previewDamage?: number;  // 예상 데미지 (프리뷰용)
}

export function HPBar({
  current,
  max,
  showText = true,
  color = 'red',
  previewDamage = 0,
}: HPBarProps) {
  const hpPercentage = Math.max(0, Math.min(100, (current / max) * 100));

  // 프리뷰 후 남을 HP 계산
  const afterDamageHp = Math.max(0, current - previewDamage);
  const afterDamagePercentage = Math.max(0, Math.min(100, (afterDamageHp / max) * 100));

  // 프리뷰 데미지 영역 (깎일 부분)
  const previewPercentage = hpPercentage - afterDamagePercentage;

  const barColors = {
    red: 'bg-red-500',
    green: 'bg-green-500',
  };

  return (
    <div className="w-full relative">
      {/* 데미지 숫자 표시 */}
      <AnimatePresence>
        {previewDamage > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-orange-400 font-bold text-sm"
          >
            -{previewDamage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-6 bg-gray-700 rounded-sm overflow-hidden">
        {/* 프리뷰 후 남을 HP (기본 색상) */}
        <div
          className={`absolute h-full ${barColors[color]} transition-all duration-300`}
          style={{ width: `${afterDamagePercentage}%` }}
        />

        {/* 프리뷰 데미지 영역 (주황색) */}
        {previewDamage > 0 && (
          <div
            className="absolute h-full bg-orange-500 opacity-40"
            style={{
              left: `${afterDamagePercentage}%`,
              width: `${previewPercentage}%`,
            }}
          />
        )}

        {/* HP 텍스트 */}
        {showText && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow-md">
            {previewDamage > 0 ? afterDamageHp : current} / {max}
          </div>
        )}
      </div>
    </div>
  );
}
