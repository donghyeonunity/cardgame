import { create } from 'zustand';
import type { GameState, Card, CharacterClass, Player, RunState } from '../types';
import { createWarriorStarterDeck, createPaladinTestDeck, createAdvancementTestDeck, createRewardCards, createAdvancementRewardCards } from '../data/cards';
import { createEnemy, getNextIntent, ENEMY_DEFINITIONS, ROUND_ENEMIES } from '../data/enemies';
import { ANIMATION_TIMING, TOTAL_ATTACK_DURATION } from '../animations';
import { getCardEffects } from '../utils/cardEffects';
import {
  applyBuff,
  collectTurnStartBuffEffects,
  processBuffDurations,
} from '../utils/buffSystem';
import {
  getAvailableAdvancements,
  processClassAdvancement,
} from '../utils/advancementSystem';

// 덱 셔플 함수
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 초기 플레이어 상태 생성
function createInitialPlayer(characterClass: CharacterClass = 'warrior'): Player {
  return {
    hp: 50,
    maxHp: 50,
    block: 0,
    energy: 3,
    maxEnergy: 3,
    characterClass,
    activeBuffs: [],
  };
}

// 기본 전투 애니메이션 상태
const defaultCombatAnimation = {
  playerAttacking: false,
  enemyAttacking: false,
  playerHit: false,
  enemyHit: false,
  shieldHit: false,
};

// 초기 런 상태
const createInitialRun = (): RunState => ({
  round: 1,
  totalRounds: 5,
  isComplete: false,
});

// 초기 상태
const initialState: GameState = {
  player: createInitialPlayer(),
  enemy: null,
  battle: {
    phase: 'player_turn',
    animationPhase: 'idle',
    combatAnimation: { ...defaultCombatAnimation },
    turn: 1,
    deck: [],
    hand: [],
    discard: [],
  },
  reward: null,
  run: createInitialRun(),
};

// 스토어 액션 타입
interface GameActions {
  // 런 시작
  startRun: () => void;
  // 전투 시작 (enemyKey 선택적 - 없으면 현재 라운드 적 사용)
  startBattle: (enemyKey?: string, deckType?: 'warrior' | 'paladin' | 'advancement') => void;
  // 다음 라운드 시작
  startNextRound: () => void;
  // 카드 드로우
  drawCards: (count: number) => void;
  // 카드 플레이
  playCard: (cardId: string) => void;
  // 턴 종료
  endTurn: () => void;
  // 적 턴 실행
  executeEnemyTurn: () => void;
  // 게임 리셋
  resetGame: () => void;
  // 보상 시스템
  showReward: () => void;
  selectRewardCard: (cardId: string) => void;
  skipReward: () => void;
  // 전직 시스템
  checkAdvancement: () => void;
  selectAdvancement: (targetClass: CharacterClass) => void;  // 다중 전직 시 선택
  confirmAdvancement: (cardId: string) => void;
  // 다음 전투로 이동
  proceedToNextBattle: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  // 새로운 런 시작
  startRun: () => {
    const deck = shuffle(createWarriorStarterDeck());
    const enemyKey = ROUND_ENEMIES[0]; // 라운드 1 적
    const enemy = createEnemy(enemyKey);

    set({
      player: createInitialPlayer('warrior'),
      enemy,
      battle: {
        phase: 'player_turn',
        animationPhase: 'drawing',
        combatAnimation: { ...defaultCombatAnimation },
        turn: 1,
        deck,
        hand: [],
        discard: [],
      },
      reward: null,
      run: createInitialRun(),
    });

    // 초기 5장 드로우
    get().drawCards(5);

    // 드로우 애니메이션 완료 후 idle로 전환
    const drawTime = ANIMATION_TIMING.DRAW_DURATION * 1000 + (5 * ANIMATION_TIMING.CARD_STAGGER * 1000);
    setTimeout(() => {
      set((state) => ({
        battle: { ...state.battle, animationPhase: 'idle' },
      }));
    }, drawTime);
  },

  // 다음 라운드 시작 (HP, 덱 유지)
  startNextRound: () => {
    const { player, battle, run } = get();
    const nextRound = run.round + 1;

    // 마지막 라운드였으면 런 완료
    if (nextRound > run.totalRounds) {
      set({
        run: { ...run, isComplete: true },
        battle: { ...battle, phase: 'victory' },
      });
      return;
    }

    // 다음 라운드 적 생성
    const enemyKey = ROUND_ENEMIES[nextRound - 1];
    const enemy = createEnemy(enemyKey);

    // 모든 카드를 덱으로 모으고 셔플
    const fullDeck = shuffle([...battle.deck, ...battle.hand, ...battle.discard]);

    set({
      player: {
        ...player,
        block: 0,           // 방어력 초기화
        energy: player.maxEnergy,  // 에너지 회복
        activeBuffs: [],    // 버프 초기화
        // HP는 그대로 유지
      },
      enemy,
      battle: {
        phase: 'player_turn',
        animationPhase: 'drawing',
        combatAnimation: { ...defaultCombatAnimation },
        turn: 1,
        deck: fullDeck,
        hand: [],
        discard: [],
      },
      reward: null,
      run: {
        ...run,
        round: nextRound,
      },
    });

    // 5장 드로우
    get().drawCards(5);

    // 드로우 애니메이션 완료 후 idle로 전환
    const drawTime = ANIMATION_TIMING.DRAW_DURATION * 1000 + (5 * ANIMATION_TIMING.CARD_STAGGER * 1000);
    setTimeout(() => {
      set((state) => ({
        battle: { ...state.battle, animationPhase: 'idle' },
      }));
    }, drawTime);
  },

  // 전투 시작 (레거시 지원 + 새 시스템)
  startBattle: (enemyKey?: string, deckType: 'warrior' | 'paladin' | 'advancement' = 'advancement') => {
    // enemyKey가 없으면 startRun 호출
    if (!enemyKey) {
      get().startRun();
      return;
    }

    // 레거시: deckType에 따라 덱 선택
    let deck: Card[];
    let characterClass: CharacterClass;

    switch (deckType) {
      case 'paladin':
        deck = shuffle(createPaladinTestDeck());
        characterClass = 'paladin';
        break;
      case 'advancement':
        deck = shuffle(createAdvancementTestDeck());
        characterClass = 'warrior';
        break;
      case 'warrior':
      default:
        deck = shuffle(createWarriorStarterDeck());
        characterClass = 'warrior';
        break;
    }
    const enemy = createEnemy(enemyKey);

    set({
      player: createInitialPlayer(characterClass),
      enemy,
      battle: {
        phase: 'player_turn',
        animationPhase: 'drawing',
        combatAnimation: { ...defaultCombatAnimation },
        turn: 1,
        deck,
        hand: [],
        discard: [],
      },
      run: createInitialRun(),
    });

    // 초기 5장 드로우
    get().drawCards(5);

    // 드로우 애니메이션 완료 후 idle로 전환
    const drawTime = ANIMATION_TIMING.DRAW_DURATION * 1000 + (5 * ANIMATION_TIMING.CARD_STAGGER * 1000);
    setTimeout(() => {
      set((state) => ({
        battle: { ...state.battle, animationPhase: 'idle' },
      }));
    }, drawTime);
  },

  drawCards: (count: number) => {
    set((state) => {
      let { deck, hand, discard } = state.battle;
      const drawnCards: Card[] = [];

      for (let i = 0; i < count; i++) {
        // 덱이 비어있으면 버린 카드 더미를 셔플하여 새 덱으로
        if (deck.length === 0) {
          if (discard.length === 0) break;
          deck = shuffle(discard);
          discard = [];
        }
        const card = deck.pop();
        if (card) drawnCards.push(card);
      }

      return {
        battle: {
          ...state.battle,
          deck,
          hand: [...hand, ...drawnCards],
          discard,
        },
      };
    });
  },

  playCard: (cardId: string) => {
    const state = get();
    const { player, enemy, battle } = state;

    if (battle.phase !== 'player_turn' || !enemy) return;

    const cardIndex = battle.hand.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return;

    const card = battle.hand[cardIndex];

    // 에너지 체크
    if (player.energy < card.cost) return;

    // 새로운 효과 시스템으로 카드 효과 계산
    const effects = getCardEffects(card, player);

    let newEnemy = { ...enemy };
    let newPlayer: Player = {
      ...player,
      energy: player.energy - card.cost,
      activeBuffs: [...player.activeBuffs],
    };
    let newHand = [...battle.hand];
    let newDiscard = [...battle.discard];

    // 데미지 적용 (적 방어력 고려)
    let dealsDamage = false;
    if (effects.damageToEnemy > 0) {
      dealsDamage = true;
      const actualDamage = Math.max(0, effects.damageToEnemy - newEnemy.block);
      const remainingBlock = Math.max(0, newEnemy.block - effects.damageToEnemy);
      newEnemy.block = remainingBlock;
      newEnemy.hp = Math.max(0, newEnemy.hp - actualDamage);
    }

    // 방어력 적용
    if (effects.blockToPlayer > 0) {
      newPlayer.block += effects.blockToPlayer;
    }

    // 버프 적용
    for (const buffId of effects.buffsToApply) {
      newPlayer = applyBuff(newPlayer, buffId);
    }

    // 드로우 처리
    if (effects.drawCards > 0) {
      // 드로우는 카드 사용 후 처리
      setTimeout(() => {
        get().drawCards(effects.drawCards);
      }, 100);
    }

    // 에너지 변경
    if (effects.energyChange !== 0) {
      newPlayer.energy = Math.max(0, newPlayer.energy + effects.energyChange);
    }

    // 손패에서 카드 제거
    newHand.splice(cardIndex, 1);

    // 파워 카드는 버리지 않음 (사용 후 사라짐)
    if (card.type !== 'power') {
      newDiscard = [...newDiscard, card];
    }

    // 적 처치 체크 - 승리 시 보상 화면으로
    const newPhase = newEnemy.hp <= 0 ? 'reward' : battle.phase;

    // 승리 시 보상 카드 생성
    const newReward = newEnemy.hp <= 0
      ? { cards: createRewardCards(), isAdvancementReward: false }
      : null;

    // 공격 애니메이션 설정
    const newCombatAnimation = dealsDamage
      ? { ...defaultCombatAnimation, playerAttacking: true, enemyHit: true }
      : battle.combatAnimation;

    set({
      player: newPlayer,
      enemy: newEnemy.hp <= 0 ? null : newEnemy,
      battle: {
        ...battle,
        phase: newPhase,
        hand: newHand,
        discard: newDiscard,
        combatAnimation: newCombatAnimation,
      },
      reward: newReward,
    });

    // 공격 애니메이션 완료 후 상태 리셋
    if (dealsDamage) {
      setTimeout(() => {
        set((state) => ({
          battle: {
            ...state.battle,
            combatAnimation: { ...defaultCombatAnimation },
          },
        }));
      }, TOTAL_ATTACK_DURATION * 1000);
    }
  },

  endTurn: () => {
    const handLength = get().battle.hand.length;

    // 1. 버림 애니메이션 시작
    set((state) => ({
      battle: {
        ...state.battle,
        animationPhase: 'discarding',
      },
    }));

    // 2. 애니메이션 완료 후 실제 상태 변경
    const discardTime = ANIMATION_TIMING.DISCARD_DURATION * 1000 + (handLength * ANIMATION_TIMING.CARD_STAGGER * 1000);
    setTimeout(() => {
      set((state) => ({
        battle: {
          ...state.battle,
          phase: 'enemy_turn',
          animationPhase: 'idle',
          hand: [],
          discard: [...state.battle.discard, ...state.battle.hand],
        },
      }));

      // 적 턴 실행
      setTimeout(() => {
        get().executeEnemyTurn();
      }, 300);
    }, discardTime);
  },

  executeEnemyTurn: () => {
    const state = get();
    const { player, enemy, battle } = state;

    if (!enemy || battle.phase !== 'enemy_turn') return;

    let newPlayer = { ...player };
    let newEnemy = { ...enemy };

    // 적 의도에 따른 행동
    const { intent } = enemy;

    // 적 공격 애니메이션 설정
    let newCombatAnimation = { ...defaultCombatAnimation };

    if (intent.type === 'attack') {
      const willHitShield = newPlayer.block > 0;
      newCombatAnimation = {
        ...defaultCombatAnimation,
        enemyAttacking: true,
        playerHit: true,
        shieldHit: willHitShield,
      };

      // 플레이어 방어력 고려 데미지 계산
      const actualDamage = Math.max(0, intent.value - newPlayer.block);
      const remainingBlock = Math.max(0, newPlayer.block - intent.value);
      newPlayer.block = remainingBlock;
      newPlayer.hp = Math.max(0, newPlayer.hp - actualDamage);
    } else if (intent.type === 'defend') {
      newEnemy.block += intent.value;
    }
    // buff는 프로토타입에서 단순화 (효과 없음)

    // 플레이어 사망 체크
    if (newPlayer.hp <= 0) {
      set({
        player: newPlayer,
        enemy: newEnemy,
        battle: {
          ...battle,
          phase: 'defeat',
          combatAnimation: newCombatAnimation,
        },
      });
      return;
    }

    // 먼저 공격 애니메이션 상태 적용
    set({
      player: newPlayer,
      enemy: newEnemy,
      battle: {
        ...battle,
        combatAnimation: newCombatAnimation,
      },
    });

    // 애니메이션 완료 후 다음 턴으로 전환
    const animationDelay = intent.type === 'attack' ? TOTAL_ATTACK_DURATION * 1000 : 0;

    setTimeout(() => {
      const currentState = get();
      const currentEnemy = currentState.enemy;
      if (!currentEnemy) return;

      const nextTurn = currentState.battle.turn + 1;

      // 적 다음 의도 설정
      const enemyKey = Object.keys(ENEMY_DEFINITIONS).find(
        (key) => ENEMY_DEFINITIONS[key].name === currentEnemy.name
      ) || 'slime';
      const nextIntent = getNextIntent(enemyKey, nextTurn);

      // 플레이어 방어력 리셋, 에너지 회복
      let updatedPlayer = { ...currentState.player };
      updatedPlayer.block = 0;
      updatedPlayer.energy = updatedPlayer.maxEnergy;

      // 턴 시작 시 버프 효과 처리
      const buffEffects = collectTurnStartBuffEffects(updatedPlayer);
      updatedPlayer.block += buffEffects.blockGained;

      // 턴 종료 시 버프 지속시간 처리
      updatedPlayer = processBuffDurations(updatedPlayer);

      set({
        player: updatedPlayer,
        enemy: { ...currentEnemy, intent: nextIntent },
        battle: {
          ...currentState.battle,
          phase: 'player_turn',
          animationPhase: 'drawing',
          turn: nextTurn,
          combatAnimation: { ...defaultCombatAnimation },
        },
      });

      // 새 턴 카드 드로우
      get().drawCards(5);

      // 드로우 애니메이션 완료 후 idle로 전환
      const drawTime = ANIMATION_TIMING.DRAW_DURATION * 1000 + (5 * ANIMATION_TIMING.CARD_STAGGER * 1000);
      setTimeout(() => {
        set((state) => ({
          battle: { ...state.battle, animationPhase: 'idle' },
        }));
      }, drawTime);
    }, animationDelay);
  },

  resetGame: () => {
    set(initialState);
  },

  // 보상 화면 표시 (수동 호출용)
  showReward: () => {
    set({
      battle: { ...get().battle, phase: 'reward' },
      reward: { cards: createRewardCards(), isAdvancementReward: false },
    });
  },

  // 보상 카드 선택
  selectRewardCard: (cardId: string) => {
    const { reward, battle } = get();
    if (!reward || battle.phase !== 'reward') return;

    const selectedCard = reward.cards.find(c => c.id === cardId);
    if (!selectedCard) return;

    // 덱에 카드 추가 (전체 덱 = 드로우덱 + 손패 + 버린카드)
    const fullDeck = [...battle.deck, ...battle.hand, ...battle.discard, selectedCard];

    set((state) => ({
      battle: {
        ...state.battle,
        deck: fullDeck,
        hand: [],
        discard: [],
      },
      reward: null,
    }));

    // 전직 보상이었으면 다음 전투로, 아니면 전직 체크
    if (reward.isAdvancementReward) {
      get().proceedToNextBattle();
    } else {
      get().checkAdvancement();
    }
  },

  // 보상 스킵
  skipReward: () => {
    const { reward } = get();
    if (!reward) return;

    set({ reward: null });

    // 전직 보상이었으면 다음 전투로, 아니면 전직 체크
    if (reward.isAdvancementReward) {
      get().proceedToNextBattle();
    } else {
      get().checkAdvancement();
    }
  },

  // 전직 조건 체크
  checkAdvancement: () => {
    const { player, battle } = get();

    // 이미 전직한 경우 스킵
    if (player.characterClass !== 'warrior') {
      get().proceedToNextBattle();
      return;
    }

    // 전체 덱 (현재 상태의 덱)
    const fullDeck = [...battle.deck, ...battle.hand, ...battle.discard];

    // 전직 가능한 클래스 확인
    const availableAdvancements = getAvailableAdvancements(player.characterClass, fullDeck);

    if (availableAdvancements.length === 0) {
      // 전직 조건 미충족 - 다음 전투로
      get().proceedToNextBattle();
      return;
    }

    if (availableAdvancements.length === 1) {
      // 단일 전직 가능 - 바로 보상 카드 표시
      const targetClass = availableAdvancements[0];
      const advancementCards = createAdvancementRewardCards(targetClass);

      set({
        battle: { ...battle, phase: 'class_advancement' },
        reward: {
          cards: advancementCards,
          isAdvancementReward: true,
          targetAdvancement: targetClass,
        },
      });
    } else {
      // 다중 전직 가능 - 선택 화면 표시
      set({
        battle: { ...battle, phase: 'class_advancement' },
        reward: {
          cards: [],
          isAdvancementReward: true,
          advancementOptions: availableAdvancements,
        },
      });
    }
  },

  // 다중 전직 시 클래스 선택
  selectAdvancement: (targetClass: CharacterClass) => {
    const { battle, reward } = get();
    if (!reward || battle.phase !== 'class_advancement') return;

    // 선택한 클래스의 보상 카드 생성
    const advancementCards = createAdvancementRewardCards(targetClass);

    set({
      reward: {
        ...reward,
        cards: advancementCards,
        advancementOptions: undefined,  // 선택 화면 숨김
        targetAdvancement: targetClass,
      },
    });
  },

  // 전직 확정 (전직 보상 카드 선택)
  confirmAdvancement: (cardId: string) => {
    const { player, reward, battle } = get();
    if (!reward || battle.phase !== 'class_advancement' || !reward.targetAdvancement) return;

    const selectedCard = reward.cards.find(c => c.id === cardId);
    if (!selectedCard) return;

    // 선택한 클래스로 전직
    const newPlayer = processClassAdvancement(player, reward.targetAdvancement);

    // 덱에 카드 추가
    const fullDeck = [...battle.deck, ...battle.hand, ...battle.discard, selectedCard];

    set({
      player: { ...newPlayer, activeBuffs: [] }, // 전직 시 버프 초기화
      battle: {
        ...battle,
        deck: fullDeck,
        hand: [],
        discard: [],
      },
      reward: null,
    });

    // 다음 전투로
    get().proceedToNextBattle();
  },

  // 다음 전투로 이동
  proceedToNextBattle: () => {
    // 다음 라운드 시작
    get().startNextRound();
  },
}));
