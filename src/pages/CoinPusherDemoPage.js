import React, { useState, useCallback } from 'react';
import CoinPusherBoard from '../coinPusher/CoinPusherBoard';
import theme from '../styles/theme';

/**
 * Demo page for the Coin Pusher Board
 */
export default function CoinPusherDemoPage() {
  const [rewards, setRewards] = useState({ core: 0, reach: 0, neutral: 0 });
  const [habitCounter, setHabitCounter] = useState(1);
  const [log, setLog] = useState([]);
  
  const handleRewardGranted = useCallback((coinType) => {
    setRewards(prev => ({
      ...prev,
      [coinType.toLowerCase()]: prev[coinType.toLowerCase()] + 1,
    }));
    
    addLog(`Reward granted: ${coinType}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const addLog = useCallback((message) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 10));
  }, []);
  
  const handlePushCore = useCallback(() => {
    const habitId = `habit-${habitCounter}`;
    setHabitCounter(prev => prev + 1);
    
    if (window.coinPusherBoard) {
      window.coinPusherBoard.pushCore(habitId);
      addLog(`Pushed Core habit: ${habitId}`);
    }
  }, [habitCounter, addLog]);
  
  const handlePushReach = useCallback(() => {
    const habitId = `habit-${habitCounter}`;
    setHabitCounter(prev => prev + 1);
    
    if (window.coinPusherBoard) {
      window.coinPusherBoard.pushReach(habitId);
      addLog(`Pushed Reach habit: ${habitId}`);
    }
  }, [habitCounter, addLog]);
  
  const handleUndo = useCallback(() => {
    if (window.coinPusherBoard) {
      const removed = window.coinPusherBoard.undo();
      if (removed) {
        addLog('Undid last push');
      } else {
        addLog('Nothing to undo');
      }
    }
  }, [addLog]);
  
  return (
    <div style={{ 
      padding: 24, 
      maxWidth: 1200, 
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
          Coin Pusher Habit Board
        </h1>
        <p style={{ fontSize: 16, color: '#666' }}>
          Complete habits to push coins and earn rewards!
        </p>
      </div>
      
      {/* Main content */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Left column: Board */}
        <div style={{ flex: '1 1 600px', minWidth: 300 }}>
          <div style={{ 
            background: '#fff', 
            padding: 24, 
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            <CoinPusherBoard
              onRewardGranted={handleRewardGranted}
              containerWidth={600}
              containerHeight={400}
            />
          </div>
          
          {/* Controls */}
          <div style={{ 
            marginTop: 24,
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
              Controls
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={handlePushCore}
                style={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: theme.colors.coreColor,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'transform 100ms',
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                Complete Core Habit
              </button>
              
              <button
                onClick={handlePushReach}
                style={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: theme.colors.reachColor,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'transform 100ms',
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                Complete Reach Habit
              </button>
              
              <button
                onClick={handleUndo}
                style={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#333',
                  backgroundColor: '#eee',
                  border: '2px solid #ccc',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'transform 100ms',
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                Undo Last Push
              </button>
            </div>
          </div>
        </div>
        
        {/* Right column: Stats and log */}
        <div style={{ flex: '1 1 300px', minWidth: 250 }}>
          {/* Rewards */}
          <div style={{ 
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: 24,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
              Rewards Earned
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, color: '#666' }}>Core:</span>
                <span style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: theme.colors.coreColor,
                }}>
                  {rewards.core}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, color: '#666' }}>Reach:</span>
                <span style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: theme.colors.reachColor,
                }}>
                  {rewards.reach}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, color: '#666' }}>Neutral:</span>
                <span style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: '#999',
                }}>
                  {rewards.neutral}
                </span>
              </div>
              <div style={{ 
                marginTop: 12, 
                paddingTop: 12, 
                borderTop: '2px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Total:</span>
                <span style={{ 
                  fontSize: 28, 
                  fontWeight: 'bold', 
                  color: '#FFD700',
                }}>
                  {rewards.core + rewards.reach + rewards.neutral}
                </span>
              </div>
            </div>
          </div>
          
          {/* Activity log */}
          <div style={{ 
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
              Activity Log
            </h3>
            <div style={{ 
              maxHeight: 300, 
              overflowY: 'auto',
              fontSize: 13,
              fontFamily: 'monospace',
            }}>
              {log.length === 0 ? (
                <div style={{ color: '#999', fontStyle: 'italic' }}>
                  No activity yet...
                </div>
              ) : (
                log.map((entry, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '6px 0',
                      borderBottom: '1px solid #f0f0f0',
                      color: '#666',
                    }}
                  >
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div style={{ 
        marginTop: 32,
        background: '#f9f9f9',
        padding: 24,
        borderRadius: 12,
        border: '2px solid #e0e0e0',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>
          How It Works
        </h3>
        <ul style={{ 
          fontSize: 15, 
          color: '#666',
          lineHeight: 1.6,
          paddingLeft: 24,
        }}>
          <li>Click "Complete Core Habit" or "Complete Reach Habit" to trigger a push cycle</li>
          <li>Each push spawns 3 coins: 2 neutral (small gray) + 1 main coin (large blue/light blue)</li>
          <li>Coins advance forward and settle based on collisions</li>
          <li>Coins that fall off the edge grant permanent rewards</li>
          <li>Undo removes the last push but never restores fallen coins or rewards</li>
          <li>Core habits spawn larger coins with more impact than Reach habits</li>
          <li>The board is fully deterministic and replayable</li>
        </ul>
      </div>
    </div>
  );
}
