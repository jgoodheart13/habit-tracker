import React, { useEffect, useCallback, useRef, useState } from 'react';
import CoinPusherBoard from '../../coinPusher/CoinPusherBoard';

/**
 * Coin Pusher visualization for progress tracking
 * Uses the same metrics as ring visualization but displays as a coin pusher game
 */
export default function CoinPusherVisualization({
  dailyP1Percent,
  weeklyP1Percent,
  P1_done,
  P1_total,
  P1_done_today,
  idealP1ForToday,
  P2_done,
  P2_scale,
  P1_points,
  P2_points,
  totalPoints,
  habits,
  P1_habits,
  P2_habits,
  activeDate,
  weekDays,
  onRewardGranted,
}) {
  const basePoints = 5;
  const boardRef = useRef(null);
  const previousCompletionsRef = useRef(new Map());
  const isInitialMount = useRef(true);
  
  // Responsive sizing
  const [boardSize, setBoardSize] = useState({
    width: window.innerWidth > 768 ? Math.min(900, window.innerWidth - 100) : Math.min(window.innerWidth - 48, 400),
    height: window.innerWidth > 768 ? 400 : 250,
  });

  useEffect(() => {
    const handleResize = () => {
      setBoardSize({
        width: window.innerWidth > 768 ? Math.min(900, window.innerWidth - 100) : Math.min(window.innerWidth - 48, 400),
        height: window.innerWidth > 768 ? 400 : 250,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClearBoard = useCallback(() => {
    if (boardRef.current && window.confirm('Clear all coins from the board? This cannot be undone.')) {
      boardRef.current.clearBoard();
      previousCompletionsRef.current = new Map();
    }
  }, []);

  // Initialize previousCompletionsRef on mount to prevent triggering historic completions
  useEffect(() => {
    if (isInitialMount.current) {
      const initialCompletions = new Map();
      
      // Record all P1 habits current state
      P1_habits.forEach(habit => {
        const completedDatesThisWeek = weekDays.filter(d => habit.completedDates.includes(d));
        const isCompletedToday = habit.completedDates.includes(activeDate);
        const key = `${habit.id}-${activeDate}`;
        
        initialCompletions.set(key, { 
          completed: isCompletedToday, 
          type: 'P1',
          count: completedDatesThisWeek.length 
        });
      });
      
      // Record all P2 habits current state
      P2_habits.forEach(habit => {
        const isCompletedToday = habit.completedDates.includes(activeDate);
        const key = `${habit.id}-${activeDate}`;
        
        initialCompletions.set(key, { 
          completed: isCompletedToday, 
          type: 'P2' 
        });
      });
      
      previousCompletionsRef.current = initialCompletions;
      isInitialMount.current = false;
    }
  }, [P1_habits, P2_habits, activeDate, weekDays]);

  // Track habit completions and trigger coin pusher (only for NEW changes)
  useEffect(() => {
    if (!boardRef.current || isInitialMount.current) return;
    
    const currentCompletions = new Map();
    const changes = [];
    
    // Track P1 (Core) habits
    P1_habits.forEach(habit => {
      const completedDatesThisWeek = weekDays.filter(d => habit.completedDates.includes(d));
      const isCompletedToday = habit.completedDates.includes(activeDate);
      const timesPerWeek = habit.frequency?.timesPerWeek || 0;
      const key = `${habit.id}-${activeDate}`;
      
      currentCompletions.set(key, { 
        completed: isCompletedToday, 
        type: 'P1',
        count: completedDatesThisWeek.length 
      });
      
      // Check if this is a new completion
      const previous = previousCompletionsRef.current.get(key);
      if (isCompletedToday && (!previous || !previous.completed)) {
        // Determine if this is Core or Reach (based on whether over frequency)
        const isOverFrequency = completedDatesThisWeek.length > timesPerWeek;
        changes.push({ 
          action: 'add', 
          habitId: habit.id, 
          type: isOverFrequency ? 'reach' : 'core' 
        });
      } else if (!isCompletedToday && previous?.completed) {
        changes.push({ action: 'remove' });
      }
    });
    
    // Track P2 (Reach) habits
    P2_habits.forEach(habit => {
      const isCompletedToday = habit.completedDates.includes(activeDate);
      const key = `${habit.id}-${activeDate}`;
      
      currentCompletions.set(key, { 
        completed: isCompletedToday, 
        type: 'P2' 
      });
      
      // Check if this is a new completion
      const previous = previousCompletionsRef.current.get(key);
      if (isCompletedToday && (!previous || !previous.completed)) {
        changes.push({ action: 'add', habitId: habit.id, type: 'reach' });
      } else if (!isCompletedToday && previous?.completed) {
        changes.push({ action: 'remove' });
      }
    });
    
    // Apply changes
    changes.forEach(change => {
      if (change.action === 'add') {
        if (change.type === 'core') {
          boardRef.current.pushCore(change.habitId);
        } else if (change.type === 'reach') {
          boardRef.current.pushReach(change.habitId);
        }
      } else if (change.action === 'remove') {
        boardRef.current.undo();
      }
    });
    
    previousCompletionsRef.current = currentCompletions;
  }, [P1_habits, P2_habits, activeDate, weekDays]);

  const handleReward = useCallback((coinType) => {
    if (onRewardGranted) {
      onRewardGranted(coinType);
    }
  }, [onRewardGranted]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: 8,
        position: 'relative',
      }}
    >
      {/* Clear button */}
      <button
        onClick={handleClearBoard}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '4px 8px',
          fontSize: 11,
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          zIndex: 10,
        }}
        title="Clear all coins from board"
      >
        🗑️ Clear
      </button>

      {/* Stats Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          fontSize: 13,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#1976D2' }}>Core</div>
          <div>Week: {P1_done}/{P1_total}</div>
          <div>Today: {P1_done_today}/{idealP1ForToday}</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#90CAF9' }}>Reach</div>
          <div>Week: {P2_done}</div>
          <div>BP: x{(P2_scale * basePoints).toFixed(1)}</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#FFD700' }}>Total</div>
          <div>{totalPoints.toFixed(1)} pts</div>
          <div style={{ fontSize: 11, color: '#666' }}>
            ({P1_points.toFixed(0)}+{P2_points.toFixed(0)})
          </div>
        </div>
      </div>

      {/* Coin Pusher Board */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <CoinPusherBoard
          ref={boardRef}
          onRewardGranted={handleReward}
          containerWidth={boardSize.width}
          containerHeight={boardSize.height}
          persistenceKey={`coinPusher-${weekDays[0]}`}
        />
      </div>
    </div>
  );
}
