# Progress Visualization System

## Overview

This directory contains a modular system for swappable progress visualizations. The architecture allows easy switching between different visualization types (rings, coin pusher, etc.) without changing the parent components.

## Architecture

### ProgressVisualizationContainer
The main container that:
- Calculates all shared metrics from habit data
- Provides a unified interface for all visualizations
- Handles visualization type selection
- Passes standardized props to the active visualization

### Visualization Components

Each visualization component receives identical props and implements the display differently:

#### Available Visualizations:
1. **ringVisualization** - Traditional ring progress display
2. **coinPusherVisualization** - Coin pusher game-style progress

## Usage

### Basic Usage

```javascript
import ProgressVisualizationContainer from './components/progress/ProgressVisualizationContainer';

<ProgressVisualizationContainer
  habits={habits}
  activeDate={activeDate}
  activeWeekRange={activeWeekRange}
  visualizationType="ring" // or "coinPusher"
  onHabitComplete={handleComplete}
  onRewardGranted={handleReward}
/>
```

### Props Interface

All visualizations receive these standardized props:

```javascript
{
  // Metrics
  dailyP1Percent: number,        // Today's core habit completion %
  weeklyP1Percent: number,       // Week's core habit completion %
  P1_done: number,               // Core habits completed this week
  P1_total: number,              // Total core habits required this week
  P1_done_today: number,         // Core habits completed today
  idealP1ForToday: number,       // Ideal core completions for today
  P2_done: number,               // Reach habits completed
  P2_scale: number,              // Reach habit point multiplier
  P1_points: number,             // Points from core habits
  P2_points: number,             // Points from reach habits
  totalPoints: number,           // Total points earned
  weeklyPaceMarker: number,      // Ideal pace percentage
  
  // Data
  habits: Array,                 // All habits
  P1_habits: Array,              // Core habits only
  P2_habits: Array,              // Reach habits only
  activeDate: string,            // Current date (YYYY-MM-DD)
  weekDays: Array<string>,       // All days in active week
  
  // Callbacks
  onHabitComplete: function,     // Called when habit is completed
  onRewardGranted: function,     // Called when reward is earned
}
```

## Adding New Visualizations

To add a new visualization type:

1. **Create visualization component** in `./[name]Visualization.js`
2. **Accept standardized props** (see Props Interface above)
3. **Implement display logic** using the provided metrics
4. **Export from index.js**
5. **Add to container's require statement**

Example:

```javascript
// barVisualization.js
export default function BarVisualization({
  weeklyP1Percent,
  P2_done,
  totalPoints,
  // ... other props
}) {
  return (
    <div>
      <div style={{ width: `${weeklyP1Percent}%` }}>
        Core: {weeklyP1Percent}%
      </div>
      <div>Reach: {P2_done}</div>
      <div>Total: {totalPoints} pts</div>
    </div>
  );
}
```

## Switching Visualizations

The visualization type can be controlled via:

1. **Props**: Pass `visualizationType` prop
2. **LocalStorage**: Saved in `progressVisualization` key
3. **User Toggle**: Button in WeeklyProgressGraph

## Integration Points

### WeeklyProgressGraph
The main integration point that:
- Provides visualization toggle button
- Persists user preference
- Passes habit data to container

### CoinPusherVisualization Specifics
- Uses React refs to control CoinPusherBoard
- Tracks habit completion changes via useEffect
- Maps P1 habits (over frequency) to reach coins
- Handles undo when habits are unchecked

## Metrics Calculation

All metrics are calculated once in the container:

- **P1 (Core) Metrics**: Based on `timesPerWeek` frequency
- **P2 (Reach) Metrics**: Includes P2 habits + P1 overflow
- **Points**: 
  - P1 points = `weeklyP1Percent * 5`
  - P2 scale = `0.5 + 0.5 * (weeklyP1Percent / 100)`
  - P2 points = `P2_done * 5 * P2_scale`
  - Total = P1 points + P2 points

## File Structure

```
progress/
├── index.js                              # Module exports
├── README.md                             # This file
├── ProgressVisualizationContainer.js    # Main container
├── ringVisualization.js                 # Ring display
└── coinPusherVisualization.js           # Coin pusher display
```

## Future Enhancements

Potential additions:
- Bar chart visualization
- Calendar heatmap visualization
- XP/level progress bar
- Achievement badges display
- Streak counter visualization
- Team/social comparison view
