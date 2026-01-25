# Coin Pusher Quick Start Guide

## View the Demo

1. Start the development server:
   ```bash
   npm start
   ```

2. Navigate to the demo page:
   ```
   http://localhost:3000/coin-pusher-demo
   ```

3. Try the controls:
   - Click "Complete Core Habit" to push a large blue coin
   - Click "Complete Reach Habit" to push a medium light-blue coin
   - Click "Undo Last Push" to reverse the last action
   - Watch the coins settle and potentially fall for rewards!

## What You'll See

### Board Layout
- Entry chute at top (blue dashed line)
- Drop edge at bottom (red dashed line)  
- Coins spawn at the top and are pushed forward
- Coins that reach the bottom fall and grant rewards

### Coin Types
- **Large dark blue** = Core habit (high value)
- **Medium light blue** = Reach habit (medium value)
- **Small gray** = Neutral coins (filler)

### Animation Sequence
1. **Glow**: Board flashes when you click
2. **Spawn**: 3 coins slide in from the left
3. **Advance**: Board shifts forward slightly
4. **Settle**: Coins find their positions
5. **Drop**: Fallen coins drop with reward notification

## How It Works

### Deterministic System
- Every push spawns exactly 3 coins with predetermined positions
- Collisions are resolved using priority rules (bigger coins stay)
- The board state is always replayable from history

### Undo Behavior
- Removes the last push event
- Replays the entire board from scratch
- **Important**: Never restores coins that already fell (rewards are permanent!)

### Statistics
Watch the stats at the bottom of the board:
- **Coins on board**: Current coins not yet fallen
- **Total rewards**: Permanent reward count
- **Pushes**: Number of habit completions

## Integration with Your Habit Tracker

### Option 1: Quick Integration

Add to your habit completion handler:

```javascript
const handleComplete = async () => {
  // Your existing logic
  await markHabitComplete(habit.id, date, isChecked);
  
  // Add coin pusher notification
  if (!isChecked && window.coinPusherBoard) {
    const coinType = habit.type === 'P1' ? 'Core' : 'Reach';
    window.coinPusherBoard[`push${coinType}`](habit.id);
  } else if (isChecked && window.coinPusherBoard) {
    window.coinPusherBoard.undo();
  }
};
```

### Option 2: Using Integration Hook

```javascript
import { useCoinPusherIntegration } from './coinPusher/integration';

function MyHabitComponent({ habit }) {
  const { notifyHabitComplete, notifyHabitUndo } = useCoinPusherIntegration();
  
  const handleComplete = async () => {
    const wasCompleted = completedToday;
    await markHabitComplete(habit.id, activeDate, !completedToday);
    
    if (!wasCompleted) {
      notifyHabitComplete(habit.id, habit.type);
    } else {
      notifyHabitUndo();
    }
  };
  
  // ... rest of component
}
```

### Adding the Board to a Page

```javascript
import CoinPusherBoard from './coinPusher/CoinPusherBoard';

function MyPage() {
  const handleReward = (coinType) => {
    // Do something when a reward is granted
    console.log('Reward!', coinType);
  };
  
  return (
    <div>
      <h1>My Habits</h1>
      
      {/* Your existing content */}
      
      <CoinPusherBoard
        onRewardGranted={handleReward}
        containerWidth={600}
        containerHeight={400}
      />
    </div>
  );
}
```

## Customization

### Change Colors

Edit [src/coinPusher/CoinComponent.js](./src/coinPusher/CoinComponent.js):

```javascript
function getCoinColor(type) {
  switch (type) {
    case COIN_TYPES.CORE:
      return '#FF5722'; // Change to orange
    case COIN_TYPES.REACH:
      return '#4CAF50'; // Change to green
    // ...
  }
}
```

### Adjust Timing

Edit [src/coinPusher/constants.js](./src/coinPusher/constants.js):

```javascript
export const ANIMATION_TIMING = {
  GLOW: 100,
  SPAWN: 250,
  ADVANCE: 150,
  SETTLE: 400,    // Make longer for more dramatic settling
  DROP: 300,
  TOTAL: 1200,
};
```

### Change Board Size

Edit [src/coinPusher/constants.js](./src/coinPusher/constants.js):

```javascript
export const BOARD_WIDTH = 12;  // Make wider
export const BOARD_DEPTH = 8;   // Make deeper
```

Then adjust the component size:

```javascript
<CoinPusherBoard
  containerWidth={800}   // Increase width
  containerHeight={600}  // Increase height
/>
```

## Troubleshooting

### "Coin pusher board not available"
- Make sure `<CoinPusherBoard />` is rendered before trying to use it
- Check that the component has mounted (useEffect)

### Coins overlap after settling
- This is rare but possible when coins are tightly packed
- Increase collision resolution passes in collision.js
- Reduce coin spawn rate

### Animations feel too fast/slow
- Adjust timing constants in constants.js
- Modify spring physics in CoinComponent.js

### Board doesn't replay correctly on undo
- Verify you're not mutating event objects
- Check that seeded random is working correctly
- Test with `console.log(window.coinPusherBoard.getState())`

## Next Steps

1. ✅ Visit the demo page to see it in action
2. ✅ Read [COIN_PUSHER_TECHNICAL_DOCS.md](./COIN_PUSHER_TECHNICAL_DOCS.md) for implementation details
3. ✅ Check [src/coinPusher/README.md](./src/coinPusher/README.md) for API documentation
4. ✅ Integrate with your habit tracking system
5. ✅ Customize colors and timing to match your app

## Questions?

See the inline code comments in the source files or refer to the technical documentation.

Enjoy your coin pusher habit board! 🎰✨
