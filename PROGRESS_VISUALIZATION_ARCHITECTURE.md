# Progress Visualization System - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     WeeklyProgressGraph                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Toggle Button: [🎰 Coin Pusher] / [⭕ Ring View]        │  │
│  │  State: visualizationType (localStorage)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │       ProgressVisualizationContainer                      │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Input: habits, activeDate, activeWeekRange        │  │  │
│  │  │                                                     │  │  │
│  │  │  Calculate:                                        │  │  │
│  │  │  • P1_done, P1_total, P1_done_today               │  │  │
│  │  │  • dailyP1Percent, weeklyP1Percent                │  │  │
│  │  │  • P2_done, P2_scale                              │  │  │
│  │  │  • P1_points, P2_points, totalPoints              │  │  │
│  │  │  • weekDays, idealP1ForToday, weeklyPaceMarker    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                              ▼                             │  │
│  │  Dynamic require(`./${visualizationType}Visualization`)   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                ▼                                  ▼
┌───────────────────────────────┐  ┌─────────────────────────────┐
│    RingVisualization          │  │  CoinPusherVisualization    │
│  ┌─────────────────────────┐  │  │  ┌───────────────────────┐  │
│  │  Props: Standard        │  │  │  │  Props: Standard      │  │
│  │  • dailyP1Percent       │  │  │  │  • All metrics        │  │
│  │  • weeklyP1Percent      │  │  │  │  • P1_habits          │  │
│  │  • P2_done              │  │  │  │  • P2_habits          │  │
│  │  • weeklyPaceMarker     │  │  │  │  • weekDays           │  │
│  │  • totalPoints          │  │  │  │  • activeDate         │  │
│  └─────────────────────────┘  │  │  └───────────────────────┘  │
│              ▼                 │  │              ▼              │
│  ┌─────────────────────────┐  │  │  ┌───────────────────────┐  │
│  │  Render:                │  │  │  │  useEffect:           │  │
│  │  ┌───────┬──────┬────┐  │  │  │  │  • Track completions │  │
│  │  │ Stats │ Ring │    │  │  │  │  │  • Detect changes    │  │
│  │  │       │      │    │  │  │  │  │  • Call boardRef     │  │
│  │  │ P1/P2 │  ⭕   │    │  │  │  │  │                      │  │
│  │  │ Points│ ◆◆◆  │    │  │  │  │  └───────────────────────┘  │
│  │  └───────┴──────┴────┘  │  │  │              ▼              │
│  │                         │  │  │  ┌───────────────────────┐  │
│  │  ┌─ RingProgressGraph  │  │  │  │  Render:              │  │
│  │  │  (Existing)          │  │  │  │  ┌──────────────────┐ │  │
│  │  └──────────────────────│  │  │  │  │  Stats Row       │ │  │
│  │                         │  │  │  │  │  Core|Reach|Total│ │  │
│  └─────────────────────────┘  │  │  │  └──────────────────┘ │  │
└───────────────────────────────┘  │  │  ┌──────────────────┐ │  │
                                    │  │  │ CoinPusherBoard  │ │  │
                                    │  │  │  (via ref)       │ │  │
                                    │  │  │                  │ │  │
                                    │  │  │  [💙💙💎💎]     │ │  │
                                    │  │  │  ═══════════════ │ │  │
                                    │  │  │  Pusher Blade    │ │  │
                                    │  │  └──────────────────┘ │  │
                                    │  └───────────────────────┘  │
                                    └─────────────────────────────┘
```

## Data Flow

```
User Action (Check/Uncheck Habit)
          │
          ▼
Parent Component Updates habits array
          │
          ▼
WeeklyProgressGraph receives new habits
          │
          ▼
ProgressVisualizationContainer
    │
    ├─ Calculates all metrics
    ├─ Filters P1/P2 habits
    ├─ Computes points
    │
    ▼
Passes standardized props to selected visualization
    │
    ├─── RingVisualization
    │    └─→ Renders rings with metrics
    │
    └─── CoinPusherVisualization
         │
         ├─ useEffect detects habit changes
         ├─ Compares with previous state
         ├─ Determines: add core / add reach / undo
         │
         ▼
         boardRef.current.pushCore(habitId)
         boardRef.current.pushReach(habitId)
         boardRef.current.undo()
         │
         ▼
         CoinPusherBoard (via ref)
         │
         ├─ findOrCreateEvent(habitId)  ← Deterministic spawn
         ├─ executePushCycle()           ← 5-phase animation
         └─ onRewardGranted callback     ← Points earned
```

## Component Hierarchy

```
WeeklyProgressGraph
└── ProgressVisualizationContainer
    ├── RingVisualization
    │   └── RingProgressGraph (existing component)
    └── CoinPusherVisualization
        └── CoinPusherBoard (forwardRef)
            ├── CoinComponent (multiple instances)
            ├── Pusher Blade (motion.div)
            └── Board State (event sourcing)
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│  WeeklyProgressGraph (Component State)                      │
│  • visualizationType: 'ring' | 'coinPusher'                 │
│  • Persisted in localStorage                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  ProgressVisualizationContainer (Computed State)            │
│  • No state - pure calculations                             │
│  • Derives everything from props                            │
└─────────────────────────────────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
┌──────────────────────┐  ┌────────────────────────────────┐
│  RingVisualization   │  │  CoinPusherVisualization       │
│  • No state          │  │  • previousCompletionsRef      │
│  • Pure render       │  │  • boardRef (imperative)       │
└──────────────────────┘  └────────────────────────────────┘
                                       │
                                       ▼
                          ┌────────────────────────────────┐
                          │  CoinPusherBoard (via ref)     │
                          │  • boardState (event sourcing) │
                          │  • coins array                 │
                          │  • animationState              │
                          │  • fallingCoinIds Set          │
                          │  • pusherPosition              │
                          └────────────────────────────────┘
```

## Props Flow

```
Parent (e.g., DailyViewPage)
│
├─ habits: Array<Habit>
├─ activeDate: string
└─ activeWeekRange: { start, end }
    │
    ▼
WeeklyProgressGraph
    │
    └─ visualizationType: 'ring' | 'coinPusher'
        │
        ▼
    ProgressVisualizationContainer
        │
        ├─ Computes 15+ metrics
        │
        ▼
    [Ring|CoinPusher]Visualization
        │
        ├─ dailyP1Percent
        ├─ weeklyP1Percent
        ├─ P1_done, P1_total, P1_done_today
        ├─ idealP1ForToday
        ├─ P2_done, P2_scale
        ├─ P1_points, P2_points, totalPoints
        ├─ weeklyPaceMarker
        ├─ habits, P1_habits, P2_habits
        ├─ activeDate, weekDays
        └─ onHabitComplete, onRewardGranted
```

## Visualization Selection Logic

```
visualizationType = localStorage.getItem('progressVisualization') || 'ring'
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            visualizationType === 'ring'   visualizationType === 'coinPusher'
                    │                       │
                    ▼                       ▼
            require('./ringVisualization')  require('./coinPusherVisualization')
                    │                       │
                    └───────────┬───────────┘
                                │
                                ▼
                    <VisualizationComponent {...commonProps} />
```

## Adding New Visualization

```
1. Create file: src/components/progress/barVisualization.js
   └─ export default function BarVisualization(props) { ... }

2. Add to index.js:
   └─ export { default as BarVisualization } from './barVisualization';

3. Update toggle button:
   └─ Add 'bar' to cycle options

4. ProgressVisualizationContainer automatically loads via:
   └─ require(`./${visualizationType}Visualization`).default

Result:
   ✅ New visualization available
   ✅ Same props interface
   ✅ No changes to parent components
   ✅ User can toggle to new view
```

## Error Handling

```
ProgressVisualizationContainer
    │
    ├─ try { require(`./${type}Visualization`) }
    ├─ catch { 
    │     console.error('Visualization not found')
    │     fallback to ringVisualization
    │  }
    │
    └─ Render selected or fallback visualization
```

## Performance Considerations

```
Calculation Cost: O(n) where n = number of habits
    ├─ Filter P1/P2: O(n)
    ├─ Count completions: O(n * 7) - 7 days per week
    └─ Compute metrics: O(1)

Re-render Triggers:
    ├─ habits array change → Full recalculation
    ├─ activeDate change → Full recalculation
    ├─ activeWeekRange change → Full recalculation
    └─ visualizationType change → No recalculation, just component swap

Optimization Opportunities:
    ├─ useMemo for metric calculations
    ├─ React.memo for visualization components
    └─ Debounce rapid habit check/uncheck
```
