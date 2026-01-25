# Coin Pusher Visual Guide

## Board Layout

```
┌─────────────────────────────────────────┐
│  ▼ ▼ ▼  ENTRY CHUTE (Y = 0)  ▼ ▼ ▼    │ ← Coins spawn here
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│                                         │
│        ●  Neutral (small gray)          │
│                                         │
│              ◉  Reach (medium blue)     │
│                                         │   10 units wide
│  ⬤  Core (large dark blue)             │   6 units deep
│                                         │
│                    ●                    │
│                                         │
│         ◉              ●                │
│                                         │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│  ▼ ▼ ▼  DROP EDGE (Y = 6)  ▼ ▼ ▼      │ ← Coins fall here
└─────────────────────────────────────────┘
         💰 REWARDS 💰
```

## Coin Sizes

```
Neutral:   ●   radius = 0.50 units
Reach:     ◉   radius = 0.61 units  
Core:      ⬤   radius = 0.71 units
```

## Push Cycle Animation Timeline

```
Time:    0ms      100ms     350ms     500ms     900ms     1200ms
         │         │         │         │         │         │
Phase:   │ GLOW    │ SPAWN   │ ADVANCE │ SETTLE  │ DROP    │ IDLE
         ▼         ▼         ▼         ▼         ▼         ▼
         
Click! ──┘         
                   
         ┌─────┐   ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
         │ ✨  │   │ → → → │ │ ═════ │ │ ~~ ⤵  │ │ ⬇💰  │
         │Glow │   │ Slide │ │ Push  │ │Bounce │ │ Fall │ Rest
         └─────┘   └───────┘ └───────┘ └───────┘ └───────┘
         
         100ms     250ms     150ms     400ms     300ms
```

## Push Cycle Step-by-Step

### 1. GLOW (100ms)
```
┌─────────────────────┐
│ ✨ Board flashes ✨ │ ← Visual feedback
└─────────────────────┘
```

### 2. SPAWN (250ms)
```
Entry Chute:
← ← ←  ●  ◉  ⬤  (coins slide in from left)
      │   │   │
      └───┴───┴─→ Y = 0
```

### 3. ADVANCE (150ms)
```
Before:          After:
  ●                
    ◉    ═════▶      ●
  ⬤                    ◉
                     ⬤

All coins move +1 unit forward (Y += 1)
```

### 4. SETTLE (400ms)
```
Collision Resolution:

Before (overlapping):   After (settled):
    ●  ⬤                    ●
                         ⬤

Core (⬤) stays, Neutral (●) moves sideways
```

### 5. DROP (300ms)
```
Drop Edge (Y = 6):

    ●  ◉  ⬤
    │  │  │
    ▼  ▼  ▼
   ─────────────
   💰 +1 Reward!
```

## Collision Priority

```
When two coins overlap:

⬤  vs  ◉   →  ⬤  stays,  ◉  moves
Core    Reach     (Core has higher priority)

◉  vs  ●   →  ◉  stays,  ●  moves
Reach  Neutral   (Reach has higher priority)

⬤  vs  ⬤   →  Front stays, Back moves
Core   Core      (Equal size, Y position decides)
```

## Displacement Directions

```
When a coin needs to move, try directions in this order:

1. Forward:          ↓
2. Diagonal left:    ↙
3. Diagonal right:   ↘
4. Sideways left:    ←
5. Sideways right:   →

First valid direction wins!
```

## Event Sourcing

```
Event History:
┌──────────────────────────────────┐
│ Event 1: Core habit at T=1000    │
│ Event 2: Reach habit at T=2000   │
│ Event 3: Core habit at T=3000    │
└──────────────────────────────────┘
         │
         ▼
    REPLAY ALL
         │
         ▼
┌──────────────────────────────────┐
│ Current Board State:             │
│   - 7 coins on board             │
│   - 2 coins fallen (rewards)     │
│   - Deterministic positions      │
└──────────────────────────────────┘
```

## Undo Behavior

```
BEFORE UNDO:
Events: [E1, E2, E3]
Board:  ⬤ ◉ ● ● ●
Fallen: ● ◉  (2 rewards)

    ↓ UNDO ↓

AFTER UNDO:
Events: [E1, E2]     ← E3 removed
Board:  ⬤ ● ●       ← Replayed from E1, E2
Fallen: ● ◉          ← NEVER restored!

✅ Rewards are permanent
✅ Fallen coins stay fallen
```

## Deterministic Spawn

```
HabitEvent {
  habitId: "habit-123"
  timestamp: 1234567890
  coinType: CORE
  spawnPositions: [3.2, 7.1, 5.5]  ← Seeded random
}

Same seed → Same positions → Same outcome
```

## Component Hierarchy

```
<CoinPusherBoard>
  │
  ├─ <motion.div> (Board container with glow)
  │   │
  │   ├─ Drop edge indicator (red gradient)
  │   ├─ Entry chute indicator (blue gradient)
  │   │
  │   └─ Coins container
  │       ├─ <CoinComponent key="coin-1" />
  │       ├─ <CoinComponent key="coin-2" />
  │       └─ <CoinComponent key="coin-3" />
  │
  └─ Reward notification (when coins drop)
```

## State Flow

```
User clicks habit checkbox
         │
         ▼
executePushCycle(habitId, coinType)
         │
         ├─ setGlowIntensity(1)
         ├─ setAnimationState('spawning')
         ├─ boardState.addEvent() ───┐
         ├─ setAnimationState('advancing') │
         ├─ setAnimationState('settling')  │
         ├─ setAnimationState('dropping')  │
         ├─ onRewardGranted()              │
         └─ setAnimationState('idle')      │
                                           │
         ┌─────────────────────────────────┘
         │
         ▼
    BoardState.executePush()
         │
         ├─ spawnCoins()
         ├─ advanceBoard()
         ├─ settleCoins() ─────┐
         └─ dropFallenCoins()   │
                                │
         ┌──────────────────────┘
         │
         ▼
    collision.settleCoins()
         │
         ├─ Sort by priority
         ├─ Detect overlaps
         ├─ Resolve collisions
         └─ Enforce bounds
```

## Integration Example

```javascript
┌──────────────────────────────────────────┐
│ WeeklyHabitRow Component                 │
│                                          │
│  [ ] Habit checkbox                      │
│      │                                   │
│      │ onClick                           │
│      ▼                                   │
│  handleComplete()                        │
│      │                                   │
│      ├─→ markHabitComplete(API)         │
│      │                                   │
│      └─→ window.coinPusherBoard         │
│            .pushCore(habitId)  ──────────┼──┐
│                                          │  │
└──────────────────────────────────────────┘  │
                                              │
         ┌────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ CoinPusherBoard Component                │
│                                          │
│  [Board visual with coins]               │
│  [Animation in progress...]              │
│  [Rewards display]                       │
│                                          │
└──────────────────────────────────────────┘
```

## Performance Characteristics

```
Operation         Time Complexity   Notes
──────────────────────────────────────────────
Spawn coins       O(1)             Fixed 3 coins
Advance board     O(n)             n = coins on board
Collision detect  O(n²)            n typically < 30
Settle (1 pass)   O(n²)            Max 10 passes
Drop check        O(n)             Linear scan
Replay board      O(e * n²)        e = events, n = coins
Animation frame   O(n)             Render n coins

Typical Performance:
- 20 coins on board: ~5ms per push
- 50 events replay: ~100ms
- Animation: 60fps smooth
```

## Legend

```
Symbol  Meaning
───────────────────────
●       Neutral coin (small)
◉       Reach coin (medium)
⬤       Core coin (large)
→       Movement direction
═══     Push/advance
~       Settling/bounce
▼       Falling
💰      Reward
✨      Visual effect
├─      Timeline/flow
```
