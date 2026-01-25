import React, { createContext, useContext, useRef, useCallback } from 'react';
import { COIN_TYPES } from '../coinPusher/constants';

const CoinPusherContext = createContext(null);

/**
 * Context provider for coin pusher board integration
 */
export function CoinPusherProvider({ children }) {
  const boardRef = useRef(null);
  const rewardCallbackRef = useRef(null);
  
  /**
   * Register the coin pusher board instance
   */
  const registerBoard = useCallback((boardMethods) => {
    boardRef.current = boardMethods;
  }, []);
  
  /**
   * Register reward callback
   */
  const registerRewardCallback = useCallback((callback) => {
    rewardCallbackRef.current = callback;
  }, []);
  
  /**
   * Trigger a push when a habit is completed
   */
  const onHabitComplete = useCallback((habitId, habitType) => {
    if (!boardRef.current) {
      console.warn('Coin pusher board not registered');
      return;
    }
    
    // Determine coin type based on habit type
    // Assuming habit.type === 'P1' is Core, others are Reach
    const coinType = habitType === 'P1' ? COIN_TYPES.CORE : COIN_TYPES.REACH;
    
    // Execute push
    if (coinType === COIN_TYPES.CORE) {
      boardRef.current.pushCore(habitId);
    } else {
      boardRef.current.pushReach(habitId);
    }
  }, []);
  
  /**
   * Undo the last push when a habit is uncompleted
   */
  const onHabitUndo = useCallback(() => {
    if (!boardRef.current) {
      console.warn('Coin pusher board not registered');
      return;
    }
    
    boardRef.current.undo();
  }, []);
  
  /**
   * Handle rewards
   */
  const onRewardGranted = useCallback((coinType) => {
    if (rewardCallbackRef.current) {
      rewardCallbackRef.current(coinType);
    }
  }, []);
  
  /**
   * Get current board state
   */
  const getBoardState = useCallback(() => {
    if (!boardRef.current) {
      return null;
    }
    return boardRef.current.getState();
  }, []);
  
  const value = {
    registerBoard,
    registerRewardCallback,
    onHabitComplete,
    onHabitUndo,
    onRewardGranted,
    getBoardState,
  };
  
  return (
    <CoinPusherContext.Provider value={value}>
      {children}
    </CoinPusherContext.Provider>
  );
}

/**
 * Hook to use coin pusher context
 */
export function useCoinPusher() {
  const context = useContext(CoinPusherContext);
  if (!context) {
    throw new Error('useCoinPusher must be used within CoinPusherProvider');
  }
  return context;
}
