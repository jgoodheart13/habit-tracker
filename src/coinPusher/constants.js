// Coin Pusher Board Constants

export const BOARD_WIDTH = 10; // units
export const BOARD_DEPTH = 6; // units

export const COIN_TYPES = {
  NEUTRAL: 'NEUTRAL',
  REACH: 'REACH',
  CORE: 'CORE',
};

export const COIN_RADII = {
  [COIN_TYPES.NEUTRAL]: 0.50,
  [COIN_TYPES.REACH]: 0.61,
  [COIN_TYPES.CORE]: 0.71,
};

// Priority for collision resolution (larger value = higher priority)
export const COIN_PRIORITY = {
  [COIN_TYPES.CORE]: 3,
  [COIN_TYPES.REACH]: 2,
  [COIN_TYPES.NEUTRAL]: 1,
};

// Animation timing (in milliseconds)
export const ANIMATION_TIMING = {
  GLOW: 100,
  SPAWN: 250,
  ADVANCE: 150,
  SETTLE: 400,
  DROP: 300,
  TOTAL: 1200,
};

// Push delta per habit completion
export const PUSH_DELTA_Y = 1;

// Spawning configuration
export const COINS_PER_PUSH = 3; // 1 main + 2 neutral
