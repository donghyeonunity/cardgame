/**
 * 개발자 도구 (DevTools)
 *
 * 독립 모듈 - 삭제해도 기존 코드에 영향 없음
 *
 * 사용법:
 * 1. App.tsx에서 <DevTools /> 추가
 * 2. 키보드 ` (백틱) 키로 토글
 * 3. 삭제 시: 이 파일 삭제 + App.tsx에서 import/컴포넌트 제거
 */

import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';

// 개발자 도구 활성화 여부 (프로덕션에서 비활성화하려면 false로)
const DEV_TOOLS_ENABLED = true;

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const { battle, run, player } = useGameStore();

  // 키보드 단축키 (` 백틱)
  useEffect(() => {
    if (!DEV_TOOLS_ENABLED) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`') {
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 마을로 바로 이동
  const jumpToVillage = useCallback(() => {
    const store = useGameStore.getState();
    const villageRound = Math.ceil(store.run.totalRounds / 2); // 7라운드 기준 4

    useGameStore.setState({
      run: { ...store.run, round: villageRound },
      battle: { ...store.battle, phase: 'village_entrance' },
      destinationOptions: [],
    });
  }, []);

  // 장신구 선택으로 이동
  const jumpToAccessory = useCallback(() => {
    const store = useGameStore.getState();
    useGameStore.setState({
      battle: { ...store.battle, phase: 'village_accessory' },
    });
  }, []);

  // 시설 선택으로 이동
  const jumpToFacility = useCallback(() => {
    const store = useGameStore.getState();
    useGameStore.setState({
      battle: { ...store.battle, phase: 'village_facility' },
    });
  }, []);

  // 선술집으로 이동
  const jumpToTavern = useCallback(() => {
    const store = useGameStore.getState();
    useGameStore.setState({
      battle: { ...store.battle, phase: 'tavern_companion' },
    });
  }, []);

  // 특정 라운드로 이동
  const jumpToRound = useCallback((round: number) => {
    const store = useGameStore.getState();
    useGameStore.setState({
      run: { ...store.run, round },
      battle: { ...store.battle, phase: 'destination_selection' },
    });
    // 행선지 선택 표시
    useGameStore.getState().showDestinationSelection();
  }, []);

  // 골드 추가
  const addGold = useCallback((amount: number) => {
    const store = useGameStore.getState();
    useGameStore.setState({
      player: { ...store.player, gold: store.player.gold + amount },
    });
  }, []);

  // HP 회복
  const healPlayer = useCallback((amount: number) => {
    const store = useGameStore.getState();
    const newHp = Math.min(store.player.maxHp, store.player.hp + amount);
    useGameStore.setState({
      player: { ...store.player, hp: newHp },
    });
  }, []);

  // HP 설정
  const setPlayerHp = useCallback((hp: number) => {
    const store = useGameStore.getState();
    useGameStore.setState({
      player: { ...store.player, hp: Math.min(hp, store.player.maxHp) },
    });
  }, []);

  if (!DEV_TOOLS_ENABLED) return null;

  return (
    <>
      {/* 토글 버튼 (항상 표시) */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed top-2 right-2 z-[9999] px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded border border-gray-600 hover:bg-gray-700 hover:text-white"
        title="개발자 도구 (` 키)"
      >
        DEV
      </button>

      {/* 개발자 도구 패널 */}
      {isOpen && (
        <div className="fixed top-10 right-2 z-[9998] w-64 bg-gray-900 border border-gray-600 rounded-lg shadow-xl text-sm">
          {/* 헤더 */}
          <div className="px-3 py-2 border-b border-gray-700 flex justify-between items-center">
            <span className="text-yellow-400 font-bold">🛠️ DevTools</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* 현재 상태 */}
          <div className="px-3 py-2 border-b border-gray-700 text-gray-400">
            <div>Phase: <span className="text-white">{battle.phase}</span></div>
            <div>Round: <span className="text-white">{run.round}/{run.totalRounds}</span></div>
            <div>HP: <span className="text-white">{player.hp}/{player.maxHp}</span></div>
            <div>Gold: <span className="text-yellow-400">{player.gold}</span></div>
          </div>

          {/* 마을 섹션 */}
          <div className="px-3 py-2 border-b border-gray-700">
            <div className="text-gray-500 text-xs mb-2">🏘️ 마을</div>
            <div className="flex flex-wrap gap-1">
              <DevButton onClick={jumpToVillage}>마을 진입</DevButton>
              <DevButton onClick={jumpToAccessory}>장신구 선택</DevButton>
              <DevButton onClick={jumpToFacility}>시설 선택</DevButton>
              <DevButton onClick={jumpToTavern}>계약 제단</DevButton>
            </div>
          </div>

          {/* 라운드 섹션 */}
          <div className="px-3 py-2 border-b border-gray-700">
            <div className="text-gray-500 text-xs mb-2">📍 라운드 이동</div>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map(r => (
                <DevButton
                  key={r}
                  onClick={() => jumpToRound(r)}
                  active={run.round === r}
                >
                  {r}
                </DevButton>
              ))}
            </div>
          </div>

          {/* 플레이어 섹션 */}
          <div className="px-3 py-2">
            <div className="text-gray-500 text-xs mb-2">👤 플레이어</div>
            <div className="flex flex-wrap gap-1">
              <DevButton onClick={() => addGold(50)}>+50G</DevButton>
              <DevButton onClick={() => healPlayer(20)}>+20HP</DevButton>
              <DevButton onClick={() => setPlayerHp(1)}>HP=1</DevButton>
              <DevButton onClick={() => setPlayerHp(player.maxHp)}>Full HP</DevButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 개발자 도구 버튼 컴포넌트
function DevButton({
  children,
  onClick,
  active = false
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs transition-colors ${
        active
          ? 'bg-yellow-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export default DevTools;
