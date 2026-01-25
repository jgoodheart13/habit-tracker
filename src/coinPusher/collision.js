import { BOARD_WIDTH, COIN_PRIORITY } from './constants';

/**
 * Check if two coins overlap
 */
function coinsOverlap(coin1, coin2) {
  const dx = coin1.x - coin2.x;
  const dy = coin1.y - coin2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = coin1.radius + coin2.radius;
  return distance < minDistance;
}

/**
 * Check if a coin is within board bounds
 */
function isInBounds(coin) {
  return coin.x - coin.radius >= 0 &&
         coin.x + coin.radius <= BOARD_WIDTH &&
         coin.y - coin.radius >= 0;
}

/**
 * Get displacement directions in priority order
 */
function getDisplacementDirections() {
  return [
    { dx: 0, dy: 0.1, name: 'forward' },           // Forward (+Y)
    { dx: -0.1, dy: 0.1, name: 'forward-left' },   // Diagonal forward-left
    { dx: 0.1, dy: 0.1, name: 'forward-right' },   // Diagonal forward-right
    { dx: -0.1, dy: 0, name: 'left' },             // Sideways left
    { dx: 0.1, dy: 0, name: 'right' },             // Sideways right
  ];
}

/**
 * Try to displace a coin in a given direction
 */
function tryDisplace(coin, direction, allCoins, maxAttempts = 10) {
  let attempts = 0;
  const testCoin = coin.clone();
  
  while (attempts < maxAttempts) {
    testCoin.x = coin.x + direction.dx * attempts;
    testCoin.y = coin.y + direction.dy * attempts;
    
    // Check if in bounds
    if (!isInBounds(testCoin)) {
      return null;
    }
    
    // Check for collisions with other coins
    let hasCollision = false;
    for (const other of allCoins) {
      if (other.id !== coin.id && coinsOverlap(testCoin, other)) {
        hasCollision = true;
        break;
      }
    }
    
    if (!hasCollision) {
      return { x: testCoin.x, y: testCoin.y };
    }
    
    attempts++;
  }
  
  return null;
}

/**
 * Sort coins by priority for collision resolution
 * Priority: Larger coins first, then by Y position (front-most first)
 */
function sortCoinsByPriority(coins) {
  return [...coins].sort((a, b) => {
    // First by coin type priority (Core > Reach > Neutral)
    const priorityDiff = COIN_PRIORITY[b.type] - COIN_PRIORITY[a.type];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by Y position (larger Y = closer to drop edge = higher priority)
    return b.y - a.y;
  });
}

/**
 * Resolve collision between two coins
 * The lower priority coin gets displaced
 */
function resolveCollision(coin1, coin2, allCoins) {
  const priority1 = COIN_PRIORITY[coin1.type];
  const priority2 = COIN_PRIORITY[coin2.type];
  
  let coinToMove;
  
  if (priority1 > priority2) {
    coinToMove = coin2;
  } else if (priority2 > priority1) {
    coinToMove = coin1;
  } else {
    // Equal priority - resolve by Y position (front-most stays)
    coinToMove = coin1.y > coin2.y ? coin2 : coin1;
  }
  
  // Try to displace the coin
  const directions = getDisplacementDirections();
  for (const direction of directions) {
    const newPosition = tryDisplace(coinToMove, direction, allCoins);
    if (newPosition) {
      coinToMove.x = newPosition.x;
      coinToMove.y = newPosition.y;
      return true;
    }
  }
  
  // No valid displacement found - coin stays in place
  return false;
}

/**
 * Settle all coins on the board
 * Resolves collisions deterministically based on priority rules
 */
export function settleCoins(coins) {
  if (coins.length === 0) return;
  
  // Sort coins by priority
  const sortedCoins = sortCoinsByPriority(coins);
  
  // Multiple passes to ensure all collisions are resolved
  const maxPasses = 10;
  let pass = 0;
  
  while (pass < maxPasses) {
    let hadCollision = false;
    
    // Check each coin against all others
    for (let i = 0; i < sortedCoins.length; i++) {
      for (let j = i + 1; j < sortedCoins.length; j++) {
        if (coinsOverlap(sortedCoins[i], sortedCoins[j])) {
          resolveCollision(sortedCoins[i], sortedCoins[j], coins);
          hadCollision = true;
        }
      }
    }
    
    // Ensure all coins are within bounds
    for (const coin of coins) {
      if (coin.x - coin.radius < 0) {
        coin.x = coin.radius;
      }
      if (coin.x + coin.radius > BOARD_WIDTH) {
        coin.x = BOARD_WIDTH - coin.radius;
      }
      if (coin.y - coin.radius < 0) {
        coin.y = coin.radius;
      }
    }
    
    if (!hadCollision) {
      break; // All collisions resolved
    }
    
    pass++;
  }
}
