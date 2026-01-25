import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BoardState } from './boardState';
import { BOARD_WIDTH, BOARD_DEPTH, COIN_TYPES, ANIMATION_TIMING } from './constants';
import CoinComponent from './CoinComponent';

/**
 * Main Coin Pusher Board Component
 */
export default function CoinPusherBoard({ 
  onRewardGranted, 
  containerWidth = 600,
  containerHeight = 400 
}) {
  const [boardState] = useState(() => new BoardState());
  const [coins, setCoins] = useState([]);
  const [animationState, setAnimationState] = useState('idle');
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [recentDrops, setRecentDrops] = useState([]);
  const [fallingCoinIds, setFallingCoinIds] = useState(new Set());
  const [pusherPosition, setPusherPosition] = useState(0);
  const animationTimeoutRef = useRef(null);
  
  // Calculate unit size for rendering
  const unitSize = Math.min(
    containerWidth / BOARD_WIDTH,
    containerHeight / BOARD_DEPTH
  );
  
  /**
   * Execute a push cycle with animations
   */
  const executePushCycle = useCallback(async (habitId, coinType) => {
    // Clear any existing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Phase 1: Glow (100ms)
    setGlowIntensity(1);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_TIMING.GLOW));
    
    // Phase 2: Spawn coins (250ms) - just spawn, don't advance yet
    setAnimationState('spawning');
    
    // Find or create event (reuses existing event for same habitId)
    const spawnEvent = boardState.findOrCreateEvent(habitId, coinType);
    
    // Add to events if not already there
    if (!boardState.events.includes(spawnEvent)) {
      boardState.addEvent(spawnEvent);
    }
    
    // Manually spawn coins without advancing
    boardState.spawnCoins(spawnEvent);
    setCoins([...boardState.coins]);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_TIMING.SPAWN));
    
    // Phase 3: Advance (150ms) - pusher and coins move together
    setAnimationState('advancing');
    setPusherPosition(1);
    
    // Advance coins in board state
    boardState.advanceBoard();
    setCoins([...boardState.coins]);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_TIMING.ADVANCE));
    
    // Pusher returns
    setPusherPosition(0);
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Phase 4: Settle (400ms)
    setAnimationState('settling');
    boardState.settleCoins();
    setCoins([...boardState.coins]);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_TIMING.SETTLE));
    
    // Phase 5: Drop fallen coins (300ms)
    const fallenCoins = boardState.coins.filter(c => c.hasFallen());
    if (fallenCoins.length > 0) {
      setAnimationState('dropping');
      setRecentDrops(fallenCoins);
      
      // Mark which coins are falling so they can animate independently
      const fallingIds = new Set(fallenCoins.map(c => c.id));
      setFallingCoinIds(fallingIds);
      
      // Let the drop animation play out first
      await new Promise(resolve => setTimeout(resolve, ANIMATION_TIMING.DROP));
      
      // AFTER animation completes, update board state
      boardState.dropFallenCoins();
      
      // Grant rewards
      for (const coin of fallenCoins) {
        if (onRewardGranted) {
          onRewardGranted(coin.type);
        }
      }
      
      // Now update display to remove fallen coins
      setCoins([...boardState.coins]);
      setFallingCoinIds(new Set());
      
      // Clear recent drops after a delay
      setTimeout(() => {
        setRecentDrops([]);
      }, 1000);
    }
    
    // Reset to idle
    setAnimationState('idle');
    setGlowIntensity(0);
  }, [boardState, onRewardGranted]);
  
  /**
   * Undo the last push
   */
  const undoLastPush = useCallback(() => {
    const removed = boardState.undoLastEvent();
    if (removed) {
      // Brief backward pusher motion to indicate reversal
      setPusherPosition(-0.3);
      setTimeout(() => setPusherPosition(0), 150);
      
      setAnimationState('idle');
      setCoins([...boardState.coins]);
    }
    return removed;
  }, [boardState]);
  
  /**
   * Expose methods via ref
   */
  useEffect(() => {
    // Create methods object
    const methods = {
      pushCore: (habitId) => executePushCycle(habitId, COIN_TYPES.CORE),
      pushReach: (habitId) => executePushCycle(habitId, COIN_TYPES.REACH),
      undo: undoLastPush,
      getState: () => boardState.getState(),
    };
    
    // Expose via window for demo purposes
    if (typeof window !== 'undefined') {
      window.coinPusherBoard = methods;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.coinPusherBoard;
      }
    };
  }, [executePushCycle, undoLastPush, boardState]);
  
  return (
    <div style={{ 
      width: containerWidth, 
      height: containerHeight,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Board container */}
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          background: 'linear-gradient(180deg, #f0f0f0 0%, #d0d0d0 100%)',
          borderRadius: 12,
          boxShadow: glowIntensity > 0 
            ? `0 0 ${20 * glowIntensity}px rgba(25, 118, 210, ${0.5 * glowIntensity})`
            : '0 4px 12px rgba(0,0,0,0.1)',
          border: '3px solid #bbb',
          transition: 'box-shadow 100ms ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Drop edge indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: unitSize * 0.5,
            background: 'linear-gradient(180deg, rgba(255,100,100,0.3), rgba(255,100,100,0))',
            borderTop: '2px dashed rgba(255,100,100,0.4)',
            pointerEvents: 'none',
          }}
        />
        
        {/* Entry chute indicator */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: unitSize * 0.5,
            background: 'linear-gradient(0deg, rgba(100,100,255,0.3), rgba(100,100,255,0))',
            borderBottom: '2px dashed rgba(100,100,255,0.4)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        
        {/* Pusher blade */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: unitSize * 0.3,
            background: 'linear-gradient(180deg, #888, #666)',
            borderBottom: '3px solid #444',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
          animate={{
            y: pusherPosition * unitSize,
          }}
          transition={{
            type: 'tween',
            duration: 0.15,
            ease: 'easeInOut',
          }}
        />
        
        {/* Coins */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {coins.map(coin => (
            <CoinComponent
              key={coin.id}
              coin={coin}
              unitSize={unitSize}
              animationState={animationState}
              isFalling={fallingCoinIds.has(coin.id)}
            />
          ))}
        </div>
        
        {/* Recent drops (rewards) */}
        {recentDrops.length > 0 && (
          <motion.div
            style={{
              position: 'absolute',
              bottom: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,215,0,0.9)',
              padding: '8px 16px',
              borderRadius: 20,
              color: '#333',
              fontWeight: 'bold',
              fontSize: 14,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            +{recentDrops.length} Reward{recentDrops.length > 1 ? 's' : ''}!
          </motion.div>
        )}
      </motion.div>
      
      {/* Stats display */}
      <div style={{ 
        marginTop: 12, 
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
      }}>
        <span style={{ marginRight: 16 }}>
          Coins on board: {coins.length}
        </span>
        <span style={{ marginRight: 16 }}>
          Total rewards: {boardState.totalRewards.core + boardState.totalRewards.reach + boardState.totalRewards.neutral}
        </span>
        <span>
          Pushes: {boardState.events.length}
        </span>
      </div>
    </div>
  );
}
