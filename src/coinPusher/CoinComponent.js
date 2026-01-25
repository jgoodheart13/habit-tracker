import React from 'react';
import { motion } from 'framer-motion';
import { COIN_TYPES, BOARD_DEPTH } from './constants';
import theme from '../styles/theme';

/**
 * Get color for coin type
 */
function getCoinColor(type) {
  switch (type) {
    case COIN_TYPES.CORE:
      return theme.colors.coreColor;
    case COIN_TYPES.REACH:
      return theme.colors.reachColor;
    case COIN_TYPES.NEUTRAL:
      return '#999';
    default:
      return '#999';
  }
}

/**
 * Calculate visual depth effects based on Y position
 */
function getDepthEffects(y) {
  // Scale: coins farther away (higher Y) appear slightly smaller
  const scale = 1 - (y / BOARD_DEPTH) * 0.15; // 0.85 to 1.0
  
  // Opacity: slight fade for depth
  const opacity = 1 - (y / BOARD_DEPTH) * 0.1; // 0.9 to 1.0
  
  return { scale, opacity };
}

/**
 * Animated Coin Component
 */
export default function CoinComponent({ coin, unitSize, animationState, isFalling = false }) {
  const color = getCoinColor(coin.type);
  const { scale: depthScale, opacity: depthOpacity } = getDepthEffects(coin.y);
  
  // Convert board units to pixels
  const x = coin.x * unitSize;
  const y = coin.y * unitSize;
  const radius = coin.radius * unitSize;
  
  // Animation variants based on state
  const getAnimationProps = () => {
    // Special handling for dropping state
    if (animationState === 'dropping') {
      if (isFalling) {
        // This coin is falling - animate it
        return {
          animate: {
            x,
            y: y + radius * 4,
            scale: depthScale * 0.8,
            opacity: 0,
          },
          transition: {
            duration: 0.3,
            ease: 'easeIn',
          },
        };
      } else {
        // This coin is NOT falling - keep it still
        return {
          animate: { x, y, scale: depthScale, opacity: depthOpacity },
          transition: {
            duration: 0,
          },
        };
      }
    }
    
    switch (animationState) {
      case 'spawning':
        return {
          initial: { x: x - radius * 3, y, scale: 0.5, opacity: 0 },
          animate: { x, y, scale: depthScale, opacity: depthOpacity },
          transition: {
            type: 'spring',
            stiffness: 200,
            damping: 20,
            duration: 0.25,
          },
        };
      
      case 'advancing':
        return {
          animate: { x, y, scale: depthScale, opacity: depthOpacity },
          transition: {
            type: 'tween',
            duration: 0.15,
            ease: 'easeOut',
          },
        };
      
      case 'settling':
        return {
          animate: { x, y, scale: depthScale, opacity: depthOpacity },
          transition: {
            type: 'spring',
            stiffness: coin.type === COIN_TYPES.CORE ? 100 : 150,
            damping: coin.type === COIN_TYPES.CORE ? 15 : 20,
            duration: 0.4,
          },
        };
      
      case 'dropping':
        // This case is now handled above
        return {
          animate: { x, y, scale: depthScale, opacity: depthOpacity },
          transition: {
            duration: 0,
          },
        };
      
      default:
        return {
          animate: { x, y, scale: depthScale, opacity: depthOpacity },
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
          },
        };
    }
  };
  
  const animProps = getAnimationProps();
  
  return (
    <motion.div
      key={coin.id}
      style={{
        position: 'absolute',
        width: radius * 2,
        height: radius * 2,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 2px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)`,
        border: '2px solid rgba(255,255,255,0.4)',
        zIndex: Math.floor(coin.y * 10), // Z-order based on Y position
        transformOrigin: 'center',
      }}
      initial={animProps.initial}
      animate={animProps.animate}
      transition={animProps.transition}
    />
  );
}
