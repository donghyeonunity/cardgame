import type { ActiveBuff } from '../../types';
import { getBuffDefinition } from '../../utils/buffSystem';

interface PlayerBuffsProps {
  buffs: ActiveBuff[];
}

export function PlayerBuffs({ buffs }: PlayerBuffsProps) {
  if (buffs.length === 0) return null;

  return (
    <div className="flex gap-2 mt-2">
      {buffs.map((activeBuff, index) => {
        const buffDef = getBuffDefinition(activeBuff.buffId);
        if (!buffDef) return null;

        return (
          <div
            key={`${activeBuff.buffId}-${index}`}
            className="relative group"
          >
            {/* 버프 아이콘 */}
            <div className="w-10 h-10 rounded-full bg-yellow-600 border-2 border-yellow-400 flex items-center justify-center text-white font-bold text-sm">
              {buffDef.name.charAt(0)}
            </div>

            {/* 스택 수 (스택 가능한 버프일 경우) */}
            {activeBuff.stacks > 1 && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {activeBuff.stacks}
              </div>
            )}

            {/* 툴팁 */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="font-bold text-yellow-400 mb-1">{buffDef.name}</div>
              <div className="text-gray-300">{buffDef.description}</div>
              {activeBuff.remainingDuration !== 'combat' && (
                <div className="text-gray-500 mt-1">
                  남은 턴: {activeBuff.remainingDuration}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
