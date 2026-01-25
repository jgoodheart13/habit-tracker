# Coin Pusher Implementation - Technical Documentation

## Overview

This is a complete implementation of a deterministic, replayable coin-pusher habit board visualization system built with React and Framer Motion. The system creates the illusion of physics through carefully choreographed animations and deterministic position calculations.

## File Structure

```
src/coinPusher/
├── boardState.js          # Core state management and event system
├── CoinComponent.js       # Animated coin component with depth effects
├── CoinPusherBoard.js     # Main board container and orchestrator
├── collision.js           # Deterministic collision resolution algorithm
├── constants.js           # Configuration constants
├── integration.js         # Integration hooks for existing habit system
├── seededRandom.js        # Deterministic RNG for reproducibility
├── index.js              # Module exports
└── README.md             # User-facing documentation

src/contexts/
└── CoinPusherContext.js   # React context for board management

src/pages/
└── CoinPusherDemoPage.js  # Interactive demo page
```

## Architecture Decisions

### 1. Deterministic over Realistic

**Decision**: Use predetermined positions instead of real physics simulation.

**Rationale**: 
- Ensures board state is always reproducible
- Enables reliable undo/replay functionality
- Avoids non-deterministic floating-point physics issues
- Better performance (no continuous simulation)

**Implementation**: Seeded RNG generates spawn positions, collision resolution uses priority rules.

### 2. Animation as Presentation Layer

**Decision**: Separate logic (position calculation) from presentation (animation).

**Rationale**:
- Logic executes instantly, animations visualize results
- Can adjust timing without affecting game logic
- Easy to test logic independently
- Animations can be disabled for testing

**Implementation**: `boardState.executePush()` calculates final positions immediately, `CoinPusherBoard` animates transitions.

### 3. Event Sourcing Pattern

**Decision**: Store ordered list of habit events rather than mutable board state.

**Rationale**:
- Enables deterministic replay for undo
- Provides complete audit trail
- Makes debugging easier
- Supports future features (time travel, analytics)

**Implementation**: `HabitEvent` class stores event data, `BoardState.replayBoard()` recomputes from events.

### 4. No Reward Clawback

**Decision**: Fallen coins never restored, rewards never revoked on undo.

**Rationale**:
- Matches project requirements
- Provides psychological reward permanence
- Simplifies undo logic
- Prevents negative user experience

**Implementation**: `fallenCoins` and `totalRewards` persist through undo/replay.

## Key Algorithms

### Coin Spawning

```javascript
// For each habit event:
1. Generate seed from habitId + timestamp
2. Create SeededRandom instance
3. Spawn 2 neutral coins with random X in bounds
4. Spawn 1 main coin (Core/Reach) with random X in bounds
5. All coins start at Y = 0
```

### Push Cycle

```javascript
1. Spawn 3 new coins at Y = 0
2. Advance all coins: Y += PUSH_DELTA_Y (1 unit)
3. Settle coins (resolve collisions)
4. Drop coins where (Y + radius) >= BOARD_DEPTH
5. Grant rewards for dropped coins
```

### Collision Resolution

```javascript
For each coin pair that overlaps:
  1. Determine priority (Core > Reach > Neutral, then by Y position)
  2. Lower priority coin must move
  3. Try displacements in order:
     - Forward (+Y)
     - Diagonal forward-left
     - Diagonal forward-right
     - Sideways left
     - Sideways right
  4. Use first valid position (in bounds, no collisions)
  5. If no valid position, coin stays (overlap tolerated)
```

### Undo/Replay

```javascript
1. Remove last event from event list
2. Clear current coins (but keep fallenCoins and rewards)
3. Replay all remaining events from start
4. Each event re-executes full push cycle
5. Deterministic spawn positions ensure same outcome
```

## Animation Choreography

### Timeline (1200ms total)

```
0ms    : Habit checkbox clicked
0-100  : Board glow indicates activation
100-350: Coins spawn from entry chute (neutral first, main last)
350-500: Board advances forward (all coins move together)
500-900: Settle phase (coins find positions, spring physics)
900-1200: Drop phase (if coins fell, reward animation)
1200+  : Idle state
```

### Timing Constants

```javascript
GLOW: 100ms      // Board awareness flash
SPAWN: 250ms     // Coin entry animation
ADVANCE: 150ms   // Board push forward
SETTLE: 400ms    // Collision resolution animation
DROP: 300ms      // Fall and reward animation
```

### Visual Effects

- **Depth**: Scale decreases 0-15% from Y=0 to Y=6
- **Z-order**: Based on Y position (farther = lower z-index)
- **Weight**: Core coins use slower, heavier spring (stiffness: 100 vs 150)
- **Shadows**: Inset highlights + drop shadows
- **Glow**: Board shadow intensity tied to glow state

## Integration Patterns

### Pattern 1: Direct Window API (Demo)

```javascript
// Simple, good for prototypes and demos
window.coinPusherBoard.pushCore('habit-1');
window.coinPusherBoard.undo();
```

### Pattern 2: Integration Hook (Recommended)

```javascript
// Good for production integration
import { useCoinPusherIntegration } from './coinPusher/integration';

const { notifyHabitComplete, notifyHabitUndo } = useCoinPusherIntegration();

const handleComplete = async (habit) => {
  await markHabitComplete(habit.id, date, !completed);
  
  if (!completed) {
    notifyHabitComplete(habit.id, habit.type);
  } else {
    notifyHabitUndo();
  }
};
```

### Pattern 3: Context Provider (Future)

```javascript
// Most flexible, good for complex apps
<CoinPusherProvider>
  <App />
</CoinPusherProvider>

// In components
const { onHabitComplete } = useCoinPusher();
```

## Testing Strategy

### Unit Tests (Recommended)

```javascript
// boardState.test.js
test('spawn creates 3 coins', () => {
  const board = new BoardState();
  board.addEvent('habit-1', COIN_TYPES.CORE);
  expect(board.coins.length).toBe(3);
});

test('undo removes last event', () => {
  const board = new BoardState();
  board.addEvent('habit-1', COIN_TYPES.CORE);
  board.addEvent('habit-2', COIN_TYPES.REACH);
  board.undoLastEvent();
  expect(board.events.length).toBe(1);
});

// seededRandom.test.js
test('same seed produces same sequence', () => {
  const rng1 = new SeededRandom(12345);
  const rng2 = new SeededRandom(12345);
  expect(rng1.next()).toBe(rng2.next());
});

// collision.test.js
test('core coin displaces neutral coin', () => {
  const core = new Coin('c1', COIN_TYPES.CORE, 5, 3);
  const neutral = new Coin('n1', COIN_TYPES.NEUTRAL, 5.1, 3);
  settleCoins([core, neutral]);
  expect(neutral.x).not.toBe(5.1); // Neutral moved
  expect(core.x).toBe(5); // Core stayed
});
```

### Integration Tests

```javascript
test('full push cycle', async () => {
  render(<CoinPusherBoard />);
  
  window.coinPusherBoard.pushCore('habit-1');
  
  await waitFor(() => {
    const state = window.coinPusherBoard.getState();
    expect(state.coins.length).toBeGreaterThan(0);
  });
});
```

## Performance Considerations

### Optimizations

1. **No Continuous Animation**: Board only animates on events
2. **Efficient Collision Detection**: O(n²) but n is small (typically < 30 coins)
3. **Lazy Rendering**: Coins render only when on board
4. **Memoization**: Board state change triggers re-render, not continuous updates

### Bottlenecks

1. **Many Simultaneous Pushes**: Queue and execute sequentially
2. **Large Coin Count**: Consider cap at ~50 coins on board
3. **Collision Passes**: Max 10 passes to prevent infinite loops

### Memory

- Each coin: ~100 bytes
- Each event: ~200 bytes
- 100 events + 30 coins ≈ 23KB (negligible)

## Future Enhancements

### Possible Features

1. **Coin Trails**: Motion blur or particle effects
2. **Sound Effects**: Coin clinks, drops, rewards
3. **Power-ups**: Special coins with unique behaviors
4. **Multipliers**: Streak bonuses affect spawn
5. **Visual Themes**: Different board styles
6. **Mobile Gestures**: Swipe to push manually
7. **Haptic Feedback**: Vibration on drops
8. **Analytics Dashboard**: Coin drop patterns over time

### Technical Improvements

1. **Web Workers**: Collision calculation in background
2. **Canvas Rendering**: Better performance for many coins
3. **Predictive Animation**: Pre-calculate next positions
4. **Replay Speed Control**: Fast-forward through history
5. **Save/Load State**: Persist board to localStorage
6. **Multi-board**: Different boards for different habits

## Debugging

### Debug Utilities

```javascript
// Log all events
console.log(window.coinPusherBoard.getState().events);

// Visualize coin positions
const { coins } = window.coinPusherBoard.getState();
coins.forEach(c => console.log(`${c.type} at (${c.x.toFixed(2)}, ${c.y.toFixed(2)})`));

// Check for overlaps
const overlaps = [];
for (let i = 0; i < coins.length; i++) {
  for (let j = i + 1; j < coins.length; j++) {
    const dx = coins[i].x - coins[j].x;
    const dy = coins[i].y - coins[j].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = coins[i].radius + coins[j].radius;
    if (dist < minDist) {
      overlaps.push([coins[i].id, coins[j].id]);
    }
  }
}
console.log('Overlapping coins:', overlaps);
```

### Common Issues

**Coins overlap after settling**
- Increase collision resolution passes in `collision.js`
- Check displacement direction logic
- Verify priority sorting

**Board state doesn't match animation**
- Ensure animation state synced with board state
- Check timing of state updates vs animation starts

**Undo doesn't work correctly**
- Verify events array not mutated externally
- Check seeded random produces same sequence
- Ensure fallen coins not accidentally restored

## Compliance with Requirements

✅ **Deterministic**: Seeded RNG, priority-based collision  
✅ **Replayable**: Event sourcing, replay algorithm  
✅ **No physics engine**: Custom collision resolution  
✅ **Framer Motion**: All animations use motion components  
✅ **Push model**: No idle simulation, event-driven  
✅ **Coin types**: Core (0.71), Reach (0.61), Neutral (0.50)  
✅ **Spawn rules**: 3 coins per push (1 main + 2 neutral)  
✅ **Board geometry**: 10×6 units, Y=0 entry, Y=6 drop  
✅ **Undo behavior**: Never restores fallen coins  
✅ **Animation sequence**: Glow → Spawn → Advance → Settle → Drop  
✅ **Visual depth**: Scale, z-order, edge indicators  

## Contact & Support

For questions about implementation details, see the inline code comments or refer to the main README.md.

---

**Implementation Date**: January 2026  
**Framework**: React 17+, Framer Motion 10+  
**Author**: GitHub Copilot (Claude Sonnet 4.5)
