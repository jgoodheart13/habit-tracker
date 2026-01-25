// Integration hook for connecting existing habit completion to coin pusher

import { useRef } from 'react';

/**
 * Hook to connect habit completion events to the coin pusher board
 * 
 * Usage:
 * ```javascript
 * import { useCoinPusherIntegration } from './coinPusher/integration';
 * 
 * function MyComponent() {
 *   const { notifyHabitComplete, notifyHabitUndo } = useCoinPusherIntegration();
 *   
 *   const handleComplete = (habitId, habitType) => {
 *     // Your existing logic
 *     updateHabit(habitId, { completed: true });
 *     
 *     // Notify coin pusher
 *     notifyHabitComplete(habitId, habitType);
 *   };
 * }
 * ```
 */
export function useCoinPusherIntegration() {
  const lastActionRef = useRef(null);
  
  const notifyHabitComplete = (habitId, habitType) => {
    if (!window.coinPusherBoard) {
      console.warn('Coin pusher board not available');
      return;
    }
    
    // Determine if Core (P1) or Reach (other types)
    const isCoreHabit = habitType === 'P1';
    
    // Execute push
    if (isCoreHabit) {
      window.coinPusherBoard.pushCore(habitId);
    } else {
      window.coinPusherBoard.pushReach(habitId);
    }
    
    // Store action for potential undo
    lastActionRef.current = { habitId, habitType, timestamp: Date.now() };
  };
  
  const notifyHabitUndo = () => {
    if (!window.coinPusherBoard) {
      console.warn('Coin pusher board not available');
      return;
    }
    
    // Execute undo
    window.coinPusherBoard.undo();
    lastActionRef.current = null;
  };
  
  return {
    notifyHabitComplete,
    notifyHabitUndo,
  };
}

/**
 * Example: Modified handleComplete function for existing components
 * 
 * Before:
 * ```javascript
 * const handleComplete = async () => {
 *   await markHabitComplete(habit.id, activeDate, !completedToday);
 * };
 * ```
 * 
 * After:
 * ```javascript
 * const { notifyHabitComplete, notifyHabitUndo } = useCoinPusherIntegration();
 * 
 * const handleComplete = async () => {
 *   const wasCompleted = completedToday;
 *   await markHabitComplete(habit.id, activeDate, !completedToday);
 *   
 *   if (!wasCompleted) {
 *     notifyHabitComplete(habit.id, habit.type);
 *   } else {
 *     notifyHabitUndo();
 *   }
 * };
 * ```
 */
