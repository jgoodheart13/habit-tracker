import { BOARD_WIDTH, BOARD_DEPTH, COIN_RADII, COIN_TYPES, PUSH_DELTA_Y } from './constants';
import { SeededRandom, generateSeed } from './seededRandom';

/**
 * Represents a single coin on the board
 */
export class Coin {
  constructor(id, type, x, y) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = COIN_RADII[type];
  }

  // Check if this coin has fallen off the board
  hasFallen() {
    return (this.y + this.radius) >= BOARD_DEPTH;
  }

  // Clone the coin
  clone() {
    return new Coin(this.id, this.type, this.x, this.y);
  }
}

/**
 * Represents a habit event that triggers a push
 */
export class HabitEvent {
  constructor(habitId, timestamp, coinType, spawnPositions) {
    this.habitId = habitId;
    this.timestamp = timestamp;
    this.coinType = coinType; // CORE or REACH
    this.spawnPositions = spawnPositions; // Array of X positions for the 3 coins
  }

  // Create a new habit event with deterministic spawn positions
  static create(habitId, timestamp, coinType) {
    const seed = generateSeed(`${habitId}-${timestamp}`);
    const rng = new SeededRandom(seed);
    
    const spawnPositions = [];
    
    // Spawn 2 neutral coins first
    for (let i = 0; i < 2; i++) {
      const radius = COIN_RADII[COIN_TYPES.NEUTRAL];
      const x = rng.range(radius, BOARD_WIDTH - radius);
      spawnPositions.push(x);
    }
    
    // Spawn 1 main coin (Core or Reach)
    const mainRadius = COIN_RADII[coinType];
    const mainX = rng.range(mainRadius, BOARD_WIDTH - mainRadius);
    spawnPositions.push(mainX);
    
    return new HabitEvent(habitId, timestamp, coinType, spawnPositions);
  }
}

/**
 * Manages the board state and event history
 */
export class BoardState {
  constructor() {
    this.events = []; // Ordered list of habit events
    this.coins = []; // Current coins on board
    this.nextCoinId = 0;
    this.fallenCoins = []; // Coins that have fallen (for rewards tracking)
    this.totalRewards = { core: 0, reach: 0, neutral: 0 };
  }

  /**
   * Find or create an event for a habit
   * If an event with this habitId already exists, reuse it
   * This ensures deterministic replay when undoing/redoing
   */
  findOrCreateEvent(habitId, coinType) {
    // Check if an event already exists for this habit
    const existing = this.events.find(e => e.habitId === habitId);
    if (existing) {
      return existing;
    }
    
    // Create new event with deterministic spawn positions
    const timestamp = Date.now();
    const event = HabitEvent.create(habitId, timestamp, coinType);
    return event;
  }
  
  /**
   * Add a new habit event
   */
  addEvent(event) {
    this.events.push(event);
    return event;
  }

  /**
   * Remove the last event and replay the board
   */
  undoLastEvent() {
    if (this.events.length === 0) return null;
    
    const removed = this.events.pop();
    this.replayBoard();
    return removed;
  }

  /**
   * Clear board and replay all events
   * This does NOT restore fallen coins or revoke rewards
   * Coins that have fallen in history remain fallen
   */
  replayBoard() {
    // Preserve all coins that have fallen throughout history
    const historicallyFallenCoinIds = new Set(this.fallenCoins.map(c => c.id));
    
    // Clear only active coins, reset counter
    this.coins = [];
    this.nextCoinId = 0;
    
    // Replay all events to rebuild active coin state
    for (const event of this.events) {
      // Spawn coins
      this.spawnCoins(event);
      
      // Filter out any coins that historically fell
      // (shouldn't happen but safety check)
      this.coins = this.coins.filter(c => !historicallyFallenCoinIds.has(c.id));
      
      // Advance, settle, and drop
      this.advanceBoard();
      this.settleCoins();
      
      // Check for new fallen coins but don't add to rewards
      // (rewards were already granted when they first fell)
      const remaining = [];
      for (const coin of this.coins) {
        if (coin.hasFallen()) {
          // This coin is falling now during replay
          // Only add to fallen list if not already there
          if (!historicallyFallenCoinIds.has(coin.id)) {
            this.fallenCoins.push(coin);
            historicallyFallenCoinIds.add(coin.id);
          }
        } else {
          remaining.push(coin);
        }
      }
      this.coins = remaining;
    }
  }

  /**
   * Execute a single push cycle for an event
   * Used during replay only - live pushes are handled by animation
   */
  executePush(event) {
    // Step 1: Spawn coins at Y = 0
    this.spawnCoins(event);
    
    // Step 2: Advance board (move all coins forward)
    this.advanceBoard();
    
    // Step 3: Settle coins (resolve collisions)
    this.settleCoins();
    
    // Step 4: Drop coins that have fallen (no rewards during replay)
    this.dropFallenCoins(false);
  }

  /**
   * Spawn coins for an event
   */
  spawnCoins(event) {
    const newCoins = [];
    
    // Spawn 2 neutral coins
    for (let i = 0; i < 2; i++) {
      const coin = new Coin(
        `coin-${this.nextCoinId++}`,
        COIN_TYPES.NEUTRAL,
        event.spawnPositions[i],
        0
      );
      newCoins.push(coin);
      this.coins.push(coin);
    }
    
    // Spawn 1 main coin
    const mainCoin = new Coin(
      `coin-${this.nextCoinId++}`,
      event.coinType,
      event.spawnPositions[2],
      0
    );
    newCoins.push(mainCoin);
    this.coins.push(mainCoin);
    
    return newCoins;
  }

  /**
   * Advance coins that are pushed by the pusher or other coins
   * Pusher pushes all coins in a continuous chain forward
   */
  advanceBoard() {
    const pusherReach = 1.5; // Extended reach to catch all newly spawned coins
    
    // Mark coins that should be pushed (in pusher's path)
    const toPush = new Set();
    
    // First pass: find all coins near the pusher
    for (const coin of this.coins) {
      if (coin.y < pusherReach) {
        toPush.add(coin.id);
      }
    }
    
    // Second pass: cascading push - find chains of touching coins
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 20) {
      changed = false;
      iterations++;
      
      for (const coin1 of this.coins) {
        if (!toPush.has(coin1.id)) continue;
        
        // Check all other coins
        for (const coin2 of this.coins) {
          if (toPush.has(coin2.id)) continue;
          
          // Check if coins are close enough to push each other
          const dx = coin1.x - coin2.x;
          const dy = coin1.y - coin2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const pushDistance = coin1.radius + coin2.radius + 0.3; // Small gap tolerance
          
          // If coin1 is behind or at same level as coin2 and close enough
          if (distance < pushDistance && coin1.y <= coin2.y + 0.5) {
            toPush.add(coin2.id);
            changed = true;
          }
        }
      }
    }
    
    // Move all coins that should be pushed
    for (const coin of this.coins) {
      if (toPush.has(coin.id)) {
        coin.y += PUSH_DELTA_Y;
      }
    }
  }

  /**
   * Settle coins - resolve collisions deterministically
   * See collision.js for the algorithm
   */
  settleCoins() {
    // Implementation will be in collision.js
    // For now, we'll import and call it
    const { settleCoins } = require('./collision');
    settleCoins(this.coins);
  }

  /**
   * Drop coins that have crossed the edge
   * grantRewards: whether to increment reward counters (false during replay)
   */
  dropFallenCoins(grantRewards = true) {
    const remaining = [];
    const fallen = [];
    
    for (const coin of this.coins) {
      if (coin.hasFallen()) {
        fallen.push(coin);
        
        // Only add to fallen list if not already there
        const alreadyFallen = this.fallenCoins.some(fc => fc.id === coin.id);
        if (!alreadyFallen) {
          this.fallenCoins.push(coin);
        }
        
        // Grant rewards only if requested (not during replay)
        if (grantRewards && !alreadyFallen) {
          if (coin.type === COIN_TYPES.CORE) {
            this.totalRewards.core++;
          } else if (coin.type === COIN_TYPES.REACH) {
            this.totalRewards.reach++;
          } else {
            this.totalRewards.neutral++;
          }
        }
      } else {
        remaining.push(coin);
      }
    }
    
    this.coins = remaining;
    return fallen;
  }

  /**
   * Get current board state
   */
  getState() {
    return {
      coins: this.coins.map(c => c.clone()),
      events: [...this.events],
      fallenCoins: [...this.fallenCoins],
      totalRewards: { ...this.totalRewards },
    };
  }
}
