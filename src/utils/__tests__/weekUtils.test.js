import { getWeekStart, getWeekRange, weekDayLabel } from "../weekUtils"

// Reference week: Mon 2026-03-09 … Sun 2026-03-15
// XP_EPOCH week:  Sun 2026-03-08 … Sat 2026-03-14

// ─── getWeekStart — Monday mode ──────────────────────────────────────────────

describe("getWeekStart — monday mode", () => {
  const cases = [
    ["2026-03-09", "2026-03-09"], // Monday → itself
    ["2026-03-10", "2026-03-09"], // Tuesday
    ["2026-03-11", "2026-03-09"], // Wednesday
    ["2026-03-12", "2026-03-09"], // Thursday
    ["2026-03-13", "2026-03-09"], // Friday
    ["2026-03-14", "2026-03-09"], // Saturday
    ["2026-03-15", "2026-03-09"], // Sunday → last day of week, still rounds back
  ]
  test.each(cases)("%s → %s", (input, expected) => {
    expect(getWeekStart(input, "monday")).toBe(expected)
  })
})

// ─── getWeekStart — Sunday mode ───────────────────────────────────────────────

describe("getWeekStart — sunday mode", () => {
  const cases = [
    ["2026-03-08", "2026-03-08"], // Sunday → itself
    ["2026-03-09", "2026-03-08"], // Monday
    ["2026-03-10", "2026-03-08"], // Tuesday
    ["2026-03-11", "2026-03-08"], // Wednesday
    ["2026-03-12", "2026-03-08"], // Thursday
    ["2026-03-13", "2026-03-08"], // Friday
    ["2026-03-14", "2026-03-08"], // Saturday → last day of week, still rounds back
  ]
  test.each(cases)("%s → %s", (input, expected) => {
    expect(getWeekStart(input, "sunday")).toBe(expected)
  })
})

// ─── getWeekStart — cross-month boundary ─────────────────────────────────────

describe("getWeekStart — cross-month boundary", () => {
  test("monday mode: Sunday Mar 1 rounds back to Mon Feb 23", () => {
    // Mar 1 2026 = Sunday (day 0). daysBack = (0+6)%7 = 6 → Feb 23
    expect(getWeekStart("2026-03-01", "monday")).toBe("2026-02-23")
  })

  test("sunday mode: Saturday Mar 7 rounds back to Sun Mar 1", () => {
    // Mar 7 2026 = Saturday (day 6). daysBack = 6 → Mar 1
    expect(getWeekStart("2026-03-07", "sunday")).toBe("2026-03-01")
  })

  test("monday mode: Monday Mar 2 stays at Mar 2", () => {
    expect(getWeekStart("2026-03-02", "monday")).toBe("2026-03-02")
  })
})

// ─── getWeekStart — default falls back to monday ─────────────────────────────

test("getWeekStart defaults to monday when weekStartDay omitted", () => {
  expect(getWeekStart("2026-03-13")).toBe("2026-03-09")
})

// ─── getWeekRange ─────────────────────────────────────────────────────────────

describe("getWeekRange — monday mode", () => {
  test("Friday Mar 13 → Mon Mar 9 … Sun Mar 15", () => {
    expect(getWeekRange("2026-03-13", "monday")).toEqual({
      start: "2026-03-09",
      end: "2026-03-15",
    })
  })

  test("Monday Mar 9 (start of week) → Mon Mar 9 … Sun Mar 15", () => {
    expect(getWeekRange("2026-03-09", "monday")).toEqual({
      start: "2026-03-09",
      end: "2026-03-15",
    })
  })

  test("Sunday Mar 15 (end of week) → Mon Mar 9 … Sun Mar 15", () => {
    expect(getWeekRange("2026-03-15", "monday")).toEqual({
      start: "2026-03-09",
      end: "2026-03-15",
    })
  })
})

describe("getWeekRange — sunday mode", () => {
  test("Friday Mar 13 → Sun Mar 8 … Sat Mar 14", () => {
    expect(getWeekRange("2026-03-13", "sunday")).toEqual({
      start: "2026-03-08",
      end: "2026-03-14",
    })
  })

  test("Sunday Mar 8 (start of week) → Sun Mar 8 … Sat Mar 14", () => {
    expect(getWeekRange("2026-03-08", "sunday")).toEqual({
      start: "2026-03-08",
      end: "2026-03-14",
    })
  })

  test("Saturday Mar 14 (end of week) → Sun Mar 8 … Sat Mar 14", () => {
    expect(getWeekRange("2026-03-14", "sunday")).toEqual({
      start: "2026-03-08",
      end: "2026-03-14",
    })
  })
})

describe("getWeekRange — end is always 6 days after start", () => {
  test("range span is always 6 days in monday mode", () => {
    const { start, end } = getWeekRange("2026-03-13", "monday")
    const diff = (new Date(end) - new Date(start)) / 86400000
    expect(diff).toBe(6)
  })

  test("range span is always 6 days in sunday mode", () => {
    const { start, end } = getWeekRange("2026-03-13", "sunday")
    const diff = (new Date(end) - new Date(start)) / 86400000
    expect(diff).toBe(6)
  })
})

// ─── weekDayLabel ─────────────────────────────────────────────────────────────

describe("weekDayLabel", () => {
  const cases = [
    ["2026-03-08", "S"], // Sunday
    ["2026-03-09", "M"], // Monday
    ["2026-03-10", "T"], // Tuesday
    ["2026-03-11", "W"], // Wednesday
    ["2026-03-12", "T"], // Thursday
    ["2026-03-13", "F"], // Friday
    ["2026-03-14", "S"], // Saturday
  ]
  test.each(cases)("%s → %s", (date, label) => {
    expect(weekDayLabel(date)).toBe(label)
  })
})

// ─── Mode consistency: same date gives different starts in different modes ────

describe("mode consistency", () => {
  test("Friday gives different week starts in monday vs sunday mode", () => {
    const mon = getWeekStart("2026-03-13", "monday")
    const sun = getWeekStart("2026-03-13", "sunday")
    expect(mon).toBe("2026-03-09")
    expect(sun).toBe("2026-03-08")
    expect(mon).not.toBe(sun)
  })

  test("switching mode on a Sunday boundary shifts week start by 1 day", () => {
    // Sunday Mar 15: in monday mode it's the LAST day → week starts Mar 9
    // Sunday Mar 15: in sunday mode it's the FIRST day → week starts Mar 15
    expect(getWeekStart("2026-03-15", "monday")).toBe("2026-03-09")
    expect(getWeekStart("2026-03-15", "sunday")).toBe("2026-03-15")
  })
})
