import { useState, useCallback, useEffect } from 'react';
import type { Card, DropZone } from '../types';

interface DragState {
  isDragging: boolean;
  card: Card | null;
  cardIndex: number;
  position: { x: number; y: number };
  currentZone: DropZone;  // 현재 호버 중인 드롭 존
}

interface DropZoneRefs {
  enemy: React.RefObject<HTMLDivElement | null>;
  battlefield: React.RefObject<HTMLDivElement | null>;
  hand: React.RefObject<HTMLDivElement | null>;
}

interface UseDragReturn {
  dragState: DragState;
  startDrag: (card: Card, index: number, e: React.MouseEvent) => void;
  cancelDrag: () => void;
  registerDropZones: (refs: DropZoneRefs) => void;
}

const initialDragState: DragState = {
  isDragging: false,
  card: null,
  cardIndex: -1,
  position: { x: 0, y: 0 },
  currentZone: null,
};

export function useDrag(onDrop: (card: Card, zone: DropZone) => void): UseDragReturn {
  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const [dropZoneRefs, setDropZoneRefs] = useState<DropZoneRefs | null>(null);

  // 드래그 시작
  const startDrag = useCallback((card: Card, index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setDragState({
      isDragging: true,
      card,
      cardIndex: index,
      position: { x: e.clientX, y: e.clientY },
      currentZone: null,
    });
  }, []);

  // 드래그 취소
  const cancelDrag = useCallback(() => {
    setDragState(initialDragState);
  }, []);

  // 드롭 존 등록
  const registerDropZones = useCallback((refs: DropZoneRefs) => {
    setDropZoneRefs(refs);
  }, []);

  // 드롭 존 감지
  const detectDropZone = useCallback((x: number, y: number): DropZone => {
    if (!dropZoneRefs) return null;

    const enemyRect = dropZoneRefs.enemy.current?.getBoundingClientRect();
    const battleRect = dropZoneRefs.battlefield.current?.getBoundingClientRect();
    const handRect = dropZoneRefs.hand.current?.getBoundingClientRect();

    const isInRect = (rect?: DOMRect) => {
      if (!rect) return false;
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };

    if (isInRect(enemyRect)) return 'enemy';
    if (isInRect(handRect)) return 'hand';
    if (isInRect(battleRect)) return 'battlefield';
    return null;
  }, [dropZoneRefs]);

  // 마우스 이벤트 리스너
  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const zone = detectDropZone(e.clientX, e.clientY);
      setDragState(prev => ({
        ...prev,
        position: { x: e.clientX, y: e.clientY },
        currentZone: zone,
      }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      const zone = detectDropZone(e.clientX, e.clientY);

      if (dragState.card && zone && zone !== 'hand') {
        onDrop(dragState.card, zone);
      }

      setDragState(initialDragState);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging, dragState.card, detectDropZone, onDrop]);

  return {
    dragState,
    startDrag,
    cancelDrag,
    registerDropZones,
  };
}
