# Coin Pusher Habit Board

A deterministic, replayable coin-pusher style visualization system for habit tracking using React and Framer Motion.

## Features

- **Deterministic Physics**: No real physics engine - all movement is predetermined and replayable
- **Smooth Animations**: All animations powered by Framer Motion with carefully tuned timing
- **Coin Types**: Three coin sizes (Core, Reach, Neutral) with different visual weights
- **Reward System**: Coins that fall grant permanent rewards
- **Undo Support**: Replay board state without restoring fallen coins
- **Collision Resolution**: Smart priority-based coin settling

## Quick Start

### Demo Page

Visit `/coin-pusher-demo` to see an interactive demo with controls and stats.

### Basic Usage

```javascript
import CoinPusherBoard from './coinPusher/CoinPusherBoard';
import { COIN_TYPES } from './coinPusher/constants';

function MyComponent() {
  const handleReward = (coinType) => {
    console.log('Reward granted:', coinType);
  };
  
  return (
    <CoinPusherBoard
      onRewardGranted={handleReward}
      containerWidth={600}
      containerHeight={400}
    />
  );
}
```

### Triggering Pushes

The board exposes methods via `window.coinPusherBoard`:

```javascript
// Push a Core habit (spawns large blue coin)
window.coinPusherBoard.pushCore('habit-123');

// Push a Reach habit (spawns medium light-blue coin)
window.coinPusherBoard.pushReach('habit-456');

// Undo last push
window.coinPusherBoard.undo();

// Get current state
const state = window.coinPusherBoard.getState();
```

### Integration with Habit Tracking

Use the `CoinPusherContext` to integrate with your habit tracking system:

```javascript
import { CoinPusherProvider, useCoinPusher } from './contexts/CoinPusherContext';

// Wrap your app
<CoinPusherProvider>
  <App />
</CoinPusherProvider>

// In a component
const { onHabitComplete, onHabitUndo } = useCoinPusher();

// When a habit is completed
onHabitComplete(habitId, habitType);

// When a habit is unchecked
onHabitUndo();
```

## Architecture

### Core Components

- **boardState.js**: Manages event history and coin state
- **collision.js**: Deterministic collision resolution
- **CoinComponent.js**: Animated coin with depth effects
- **CoinPusherBoard.js**: Main board container and orchestrator
- **constants.js**: Configuration and timing values
- **seededRandom.js**: Deterministic random number generation

### Animation Sequence

Each push cycle follows this exact timeline:

1. **Glow** (100ms): Board glows to indicate action
2. **Spawn** (250ms): 3 coins slide in from the chute
3. **Advance** (150ms): Board pushes forward
4. **Settle** (400ms): Coins resolve collisions and find positions
5. **Drop** (300ms): Fallen coins drop and grant rewards

Total: ~1200ms per push cycle

### Board Geometry

- Width: 10 units (X: 0 to 10)
- Depth: 6 units (Y: 0 to 6)
- Entry edge: Y = 0
- Drop edge: Y = 6
- Coin radii:
  - Neutral: 0.50 units (small, gray)
  - Reach: 0.61 units (medium, light blue)
  - Core: 0.71 units (large, dark blue)

### Collision Rules

Priority order for displacement:

1. Coin type: Core > Reach > Neutral
2. Position: Larger Y (closer to drop) wins
3. Direction: Forward > Diagonal > Sideways

### Deterministic Replay

- Events stored with seeded random positions
- Board state recomputed by replaying events
- Fallen coins never restored
- Rewards never revoked

## Customization

### Styling

Edit [constants.js](./constants.js) to adjust:
- Board dimensions
- Coin sizes
- Animation timing
- Push distance

### Colors

Colors are pulled from the app theme:
- Core: `theme.colors.coreColor` (#1976D2)
- Reach: `theme.colors.reachColor` (#90CAF9)
- Neutral: #999

### Animation Tuning

Adjust spring physics in [CoinComponent.js](./CoinComponent.js):

```javascript
transition: {
  type: 'spring',
  stiffness: 200,  // Higher = snappier
  damping: 20,     // Higher = less bounce
}
```

## Performance

- No continuous animation loops
- All animations are triggered events
- Coins render only when on board
- Efficient collision detection

## Browser Support

Requires:
- Modern browser with ES6+ support
- Framer Motion 10+
- React 17+

## License

Part of the Habit Tracker app.
