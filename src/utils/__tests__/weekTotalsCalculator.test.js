import { calculateWeekTotals } from "../weekTotalsCalculator"
import { BASE_POINTS } from "../../constants/habitDefaults"

const WEEK = [
  "2026-03-09",
  "2026-03-10",
  "2026-03-11",
  "2026-03-12",
  "2026-03-13",
  "2026-03-14",
  "2026-03-15",
]

function makeHabit(overrides) {
  return {
    id: "h1",
    type: "P1",
    frequency: { timesPerWeek: 5 },
    completedDates: [],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Empty / zero cases
// ---------------------------------------------------------------------------

test("no habits returns all zeros", () => {
  const result = calculateWeekTotals([], WEEK)
  expect(result.totalXP).toBe(0)
  expect(result.coreXP).toBe(0)
  expect(result.reachXP).toBe(0)
  expect(result.coreCompletions).toBe(0)
  expect(result.reachCompletions).toBe(0)
})

test("P1 habit with zero completions returns 0 XP", () => {
  const habits = [makeHabit({ completedDates: [] })]
  const result = calculateWeekTotals(habits, WEEK)
  expect(result.totalXP).toBe(0)
  expect(result.coreCompletions).toBe(0)
})

test("P2 habit with zero completions returns 0 XP", () => {
  const habits = [makeHabit({ type: "P2", frequency: { timesPerWeek: 0 }, completedDates: [] })]
  const result = calculateWeekTotals(habits, WEEK)
  expect(result.totalXP).toBe(0)
  expect(result.reachCompletions).toBe(0)
})

// ---------------------------------------------------------------------------
// P1 (Core) completion logic
// ---------------------------------------------------------------------------

test("P1 habit completed exactly at frequency counts all completions", () => {
  const habits = [makeHabit({ frequency: { timesPerWeek: 3 }, completedDates: WEEK.slice(0, 3) })]
  const result = calculateWeekTotals(habits, WEEK)
  expect(result.coreCompletions).toBe(3)
})

test("P1 completions capped at timesPerWeek for core XP", () => {
  // habit with frequency 3 but completed 5 times — core only counts 3
  const habits = [makeHabit({ frequency: { timesPerWeek: 3 }, completedDates: WEEK.slice(0, 5) })]
  const result = calculateWeekTotals(habits, WEEK)
  expect(result.coreCompletions).toBe(3)
})

test("P1 only counts completions within the given weekDays", () => {
  // completion on a date outside the week range — should not count
  const habits = [makeHabit({ frequency: { timesPerWeek: 3 }, completedDates: ["2026-03-01", "2026-03-09"] })]
  const result = calculateWeekTotals(habits, WEEK)
  expect(result.coreCompletions).toBe(1)
})

test("full P1 week (100%) produces maximum core XP", () => {
  const habits = [makeHabit({ frequency: { timesPerWeek: 5 }, completedDates: WEEK.slice(0, 5) })]
  const result = calculateWeekTotals(habits, WEEK)
  expect(result.coreCompletions).toBe(5)
  // 100% completion → weeklyP1Percent = 100 → P1_points = 100 * BASE_POINTS
  expect(result.coreXP).toBe(Math.round(100 * BASE_POINTS))
})

// ---------------------------------------------------------------------------
// P2 (Reach) logic
// ---------------------------------------------------------------------------

test("P2 habit completions count towards reach XP", () => {
  const habits = [
    makeHabit({ type: "P2", frequency: { timesPerWeek: 0 }, completedDates: WEEK.slice(0, 3) }),
  ]
  const result = calculateWeekTotals(habits, WEEK)
  expect(result.reachCompletions).toBe(3)
})

test("P1 completions above frequency spill into reach", () => {
  // frequency 3, completed 5 — 2 extras count as P2
  const habits = [makeHabit({ frequency: { timesPerWeek: 3 }, completedDates: WEEK.slice(0, 5) })]
  const result = calculateWeekTotals(habits, WEEK)
  expect(result.reachCompletions).toBe(2)
})

test("P2 scale is reduced when P1 completion is low", () => {
  const p1Habit = makeHabit({ frequency: { timesPerWeek: 5 }, completedDates: [] })  // 0% P1
  const p2Habit = makeHabit({ id: "h2", type: "P2", frequency: { timesPerWeek: 0 }, completedDates: WEEK.slice(0, 3) })
  const result = calculateWeekTotals([p1Habit, p2Habit], WEEK)
  // P2_scale = 0.5 + 0.5 * (0/100) = 0.5
  const expectedP2 = Math.round(3 * BASE_POINTS * 0.5)
  expect(result.reachXP).toBe(expectedP2)
})

test("P2 scale is maximised when P1 is 100%", () => {
  const p1Habit = makeHabit({ frequency: { timesPerWeek: 5 }, completedDates: WEEK.slice(0, 5) })
  const p2Habit = makeHabit({ id: "h2", type: "P2", frequency: { timesPerWeek: 0 }, completedDates: WEEK.slice(0, 3) })
  const result = calculateWeekTotals([p1Habit, p2Habit], WEEK)
  // P2_scale = 0.5 + 0.5 * 1 = 1.0
  const expectedP2 = Math.round(3 * BASE_POINTS * 1.0)
  expect(result.reachXP).toBe(expectedP2)
})

// ---------------------------------------------------------------------------
// totalXP is always an integer
// ---------------------------------------------------------------------------

test("totalXP is always a rounded integer", () => {
  const habits = [makeHabit({ frequency: { timesPerWeek: 3 }, completedDates: WEEK.slice(0, 2) })]
  const result = calculateWeekTotals(habits, WEEK)
  expect(Number.isInteger(result.totalXP)).toBe(true)
})

// ---------------------------------------------------------------------------
// Multi-habit scenarios
// ---------------------------------------------------------------------------

test("multiple P1 habits sum their completions and XP", () => {
  const habits = [
    makeHabit({ id: "h1", frequency: { timesPerWeek: 3 }, completedDates: WEEK.slice(0, 3) }),
    makeHabit({ id: "h2", frequency: { timesPerWeek: 2 }, completedDates: WEEK.slice(0, 2) }),
  ]
  const result = calculateWeekTotals(habits, WEEK)
  // Both at 100% → weeklyP1Percent = 5/5 = 100%
  expect(result.coreCompletions).toBe(5)
  expect(result.coreXP).toBe(Math.round(100 * BASE_POINTS))
})
