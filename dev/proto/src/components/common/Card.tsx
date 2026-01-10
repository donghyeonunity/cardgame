import type { Card as CardType } from '../../types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  isDragging?: boolean; // 이 카드가 드래그 중인지
}

export function Card({ card, onClick, onDragStart, disabled, isDragging }: CardProps) {
  const typeColors = {
    attack: 'border-red-500 bg-red-900',
    skill: 'border-blue-500 bg-blue-900',
    power: 'border-yellow-500 bg-yellow-900',
  };

  const typeLabels = {
    attack: '공격',
    skill: '스킬',
    power: '파워',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseDown={handleMouseDown}
      className={`
        relative w-32 h-44 rounded-lg border-2 p-2
        flex flex-col transition-all select-none
        ${typeColors[card.type]}
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:scale-105 hover:-translate-y-2 cursor-grab active:cursor-grabbing'
        }
        ${isDragging ? 'opacity-0' : ''}
      `}
    >
      {/* 에너지 비용 */}
      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center text-lg">
        {card.cost}
      </div>

      {/* 카드 이름 */}
      <div className="text-white font-bold text-center mt-4 mb-1">
        {card.name}
      </div>

      {/* 카드 타입 */}
      <div className="text-xs text-gray-400 text-center mb-2">
        {typeLabels[card.type]}
      </div>

      {/* 카드 효과 */}
      <div className="flex-1 flex items-center justify-center">
        {card.damage && (
          <span className="text-2xl font-bold text-red-400">
            {card.damage}
          </span>
        )}
        {card.block && (
          <span className="text-2xl font-bold text-blue-400">
            {card.block}
          </span>
        )}
      </div>

      {/* 설명 */}
      <div className="text-xs text-gray-300 text-center">
        {card.description}
      </div>
    </div>
  );
}
