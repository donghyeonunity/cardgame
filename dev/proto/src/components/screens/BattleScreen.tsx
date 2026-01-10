import { useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useDrag } from '../../hooks/useDrag';
import { Card } from '../common/Card';
import { CharacterCard } from '../battle/CharacterCard';
import { EnemyCard } from '../battle/EnemyCard';
import { DragOverlay } from '../battle/DragOverlay';
import { PlayerBuffs } from '../battle/PlayerBuffs';
import { RewardScreen } from './RewardScreen';
import { cardVariants, ANIMATION_TIMING } from '../../animations';
import { getCardEffects } from '../../utils/cardEffects';
import type { Card as CardType, DropZone } from '../../types';

export function BattleScreen() {
  const {
    player,
    enemy,
    battle,
    run,
    startRun,
    playCard,
    endTurn,
  } = useGameStore();

  // 드롭 존 refs
  const enemyZoneRef = useRef<HTMLDivElement>(null);
  const battlefieldRef = useRef<HTMLDivElement>(null);
  const handAreaRef = useRef<HTMLDivElement>(null);

  // 드롭 핸들러
  const handleDrop = useCallback((card: CardType, zone: DropZone) => {
    if (!zone || zone === 'hand') return;

    // 공격 카드는 적 영역에만
    if (card.type === 'attack' && zone === 'enemy') {
      playCard(card.id);
    }
    // 스킬/파워 카드는 전투 필드에
    else if (card.type !== 'attack' && (zone === 'battlefield' || zone === 'enemy')) {
      playCard(card.id);
    }
  }, [playCard]);

  // 드래그 훅
  const { dragState, startDrag, registerDropZones } = useDrag(handleDrop);

  // 프리뷰 데미지 계산 (공격 카드 + 적 영역 호버 시)
  const previewDamage = useMemo(() => {
    if (
      !dragState.isDragging ||
      !dragState.card ||
      dragState.card.type !== 'attack' ||
      dragState.currentZone !== 'enemy' ||
      !enemy
    ) {
      return 0;
    }

    // 카드 효과 계산
    const effects = getCardEffects(dragState.card, player);

    // 적 방어력을 고려한 실제 HP 데미지
    const actualDamage = Math.max(0, effects.damageToEnemy - enemy.block);

    return actualDamage;
  }, [dragState.isDragging, dragState.card, dragState.currentZone, enemy, player]);

  // 드롭 존 등록
  useEffect(() => {
    registerDropZones({
      enemy: enemyZoneRef,
      battlefield: battlefieldRef,
      hand: handAreaRef,
    });
  }, [registerDropZones]);

  // 런 시작
  useEffect(() => {
    startRun();  // 새 런 시작 (라운드 1부터)
  }, [startRun]);

  // 보상/전직 화면
  if (battle.phase === 'reward' || battle.phase === 'class_advancement') {
    return <RewardScreen />;
  }

  // 런 클리어 화면
  if (battle.phase === 'victory' && run.isComplete) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">🏆 런 클리어!</h1>
        <p className="text-gray-400 mb-2">모든 라운드를 클리어했습니다!</p>
        <p className="text-green-400 mb-8">
          최종 HP: {player.hp}/{player.maxHp} | 클래스: {player.characterClass === 'paladin' ? '팔라딘' : '전사'}
        </p>
        <button
          onClick={() => startRun()}
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-lg font-bold"
        >
          새 런 시작
        </button>
      </div>
    );
  }

  // 일반 승리 화면 (라운드 진행 중 - 보통 보상 선택으로 감)
  if (battle.phase === 'victory') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-green-500 mb-4">승리!</h1>
        <p className="text-gray-400 mb-8">적을 처치했습니다.</p>
        <button
          onClick={() => startRun()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          다시 시작
        </button>
      </div>
    );
  }

  if (battle.phase === 'defeat') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">패배...</h1>
        <p className="text-gray-400 mb-2">다음에는 더 잘 할 수 있을 거예요.</p>
        <p className="text-gray-500 mb-8">
          라운드 {run.round}/{run.totalRounds}에서 쓰러졌습니다.
        </p>
        <button
          onClick={() => startRun()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          다시 시작
        </button>
      </div>
    );
  }

  const isPlayerTurn = battle.phase === 'player_turn';
  const isAnimating = battle.animationPhase !== 'idle';
  const canAct = isPlayerTurn && !isAnimating;

  // 부채꼴 배열을 위한 카드 회전/위치 계산
  const getCardStyle = (index: number, total: number) => {
    const middle = (total - 1) / 2;
    const offset = index - middle;
    const rotation = offset * 5;
    const translateY = Math.abs(offset) * 10;

    return {
      transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
    };
  };

  // 드래그 중 유효한 드롭 존 하이라이트
  const getDropZoneHighlight = (zone: 'enemy' | 'battlefield') => {
    if (!dragState.isDragging || !dragState.card) return '';

    const isValidTarget =
      (dragState.card.type === 'attack' && zone === 'enemy') ||
      (dragState.card.type !== 'attack');

    return isValidTarget
      ? 'ring-4 ring-green-500/50'
      : 'ring-4 ring-red-500/30';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* 드래그 오버레이 */}
      <DragOverlay
        card={dragState.card}
        position={dragState.position}
        isDragging={dragState.isDragging}
      />

      {/* 라운드 표시 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-gray-800/90 px-4 py-2 rounded-lg border border-gray-700">
          <span className="text-gray-400 text-sm">라운드 </span>
          <span className="text-white font-bold text-lg">{run.round}</span>
          <span className="text-gray-500 text-sm">/{run.totalRounds}</span>
          {run.round === run.totalRounds && (
            <span className="ml-2 text-yellow-400 text-sm font-bold">BOSS</span>
          )}
        </div>
      </div>

      {/* 전투 영역 */}
      <div
        ref={battlefieldRef}
        className={`flex-1 flex items-center justify-around p-8 transition-all ${getDropZoneHighlight('battlefield')}`}
      >
        {/* 유저 캐릭터 */}
        <div className="flex flex-col items-center">
          {/* 적 "다음 액션" 높이만큼 스페이서 추가 (수평 정렬용) */}
          <div className="h-8 mb-2" />
          <CharacterCard
            name={player.characterClass === 'paladin' ? '팔라딘' : '전사'}
            hp={player.hp}
            maxHp={player.maxHp}
            block={player.block}
            attack={6}
            emoji={player.characterClass === 'paladin' ? '⚔️' : '🧑‍⚔️'}
            isPlayer={true}
            isAttacking={battle.combatAnimation.playerAttacking}
            isHit={battle.combatAnimation.playerHit}
            isShieldHit={battle.combatAnimation.shieldHit}
          />
          {/* 활성 버프 표시 */}
          <PlayerBuffs buffs={player.activeBuffs} />
        </div>

        {/* 적 캐릭터 */}
        <div
          ref={enemyZoneRef}
          className={`transition-all rounded-lg ${getDropZoneHighlight('enemy')}`}
        >
          {enemy && (
            <EnemyCard
              enemy={enemy}
              isAttacking={battle.combatAnimation.enemyAttacking}
              isHit={battle.combatAnimation.enemyHit}
              previewDamage={previewDamage}
            />
          )}
        </div>
      </div>

      {/* 하단 UI */}
      <div
        ref={handAreaRef}
        className="h-64 bg-gray-800 border-t border-gray-700 relative"
      >
        {/* 에너지 (좌상단) */}
        <div className="absolute top-4 left-4">
          <div className="w-16 h-16 rounded-full border-2 border-gray-700 bg-gray-900 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-400">에너지</span>
            <span className="text-xl font-bold text-yellow-500">
              {player.energy}/{player.maxEnergy}
            </span>
          </div>
        </div>

        {/* 덱 (좌하단) */}
        <div className="absolute bottom-4 left-4">
          <div className="w-16 h-16 rounded-full border-2 border-gray-700 bg-gray-900 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-400">덱</span>
            <span className="text-xl font-bold text-white">
              {battle.deck.length}
            </span>
          </div>
        </div>

        {/* 손패 (중앙, 부채꼴) */}
        <div className="absolute inset-0 flex items-end justify-center pb-4">
          <div className="flex items-end">
            <AnimatePresence mode="popLayout">
              {battle.hand.map((card, index) => (
                <motion.div
                  key={card.id}
                  layout
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  custom={{ index, total: battle.hand.length }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    delay: index * ANIMATION_TIMING.CARD_STAGGER,
                  }}
                  style={getCardStyle(index, battle.hand.length)}
                  className="hover:!-translate-y-8 hover:!rotate-0 hover:scale-105 hover:z-10 -ml-4 first:ml-0"
                >
                  <Card
                    card={card}
                    onDragStart={(e) => startDrag(card, index, e)}
                    disabled={!canAct || player.energy < card.cost}
                    isDragging={dragState.isDragging && dragState.card?.id === card.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {battle.hand.length === 0 && battle.animationPhase === 'idle' && (
              <div className="text-gray-500">손패가 비어있습니다</div>
            )}
          </div>
        </div>

        {/* 다음턴 버튼 (우측) */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2">
          <button
            onClick={endTurn}
            disabled={!canAct}
            className={`w-20 h-20 rounded-full font-bold transition-all flex items-center justify-center ${
              canAct
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-600 text-gray-400 opacity-50 cursor-not-allowed'
            }`}
          >
            다음턴
          </button>
        </div>
      </div>
    </div>
  );
}
