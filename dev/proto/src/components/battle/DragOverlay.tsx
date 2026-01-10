import type { Card as CardType } from '../../types';
import { Card } from '../common/Card';

interface DragOverlayProps {
  card: CardType | null;
  position: { x: number; y: number };
  isDragging: boolean;
}

export function DragOverlay({ card, position, isDragging }: DragOverlayProps) {
  if (!isDragging || !card) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x - 64, // 카드 너비의 절반 (w-32 = 128px)
        top: position.y - 88,  // 카드 높이의 절반 (h-44 = 176px)
        transform: 'scale(1.1)',
      }}
    >
      <Card card={card} />
    </div>
  );
}
