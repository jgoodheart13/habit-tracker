// WeeklyHabitsList.js

import React, { useEffect } from "react"
import WeeklyHabitRow from "./WeeklyHabitRow"
import theme from "../styles/theme"
import PropTypes from "prop-types"
import { AnimatePresence } from "framer-motion"

export default function WeeklyHabitsList({
  habits,
  sortMode,
  handleComplete,
  handleDelete,
  activeDate,
  onEdit,
  completedVisibility,
  weekDays,
  openSheet,
}) {
  const [collapsed, setCollapsed] = React.useState(new Set())
  const [initialized, setInitialized] = React.useState(new Set())

  const [groupedHabits, setGroupedHabits] = React.useState([])

  // Extract tags safely
  const getTags = (habit, sortMode) =>
    Array.isArray(habit.tags?.[sortMode])
      ? habit.tags[sortMode].filter((t) => t?.label)
      : []

  // Compute frequency of tag usage globally
  const computeTagFrequency = (habits, sortMode) => {
    const freq = {}
    habits.forEach((h) => {
      getTags(h, sortMode).forEach((t) => {
        freq[t.label] = (freq[t.label] || 0) + 1
      })
    })
    return freq
  }

  const toggleCollapse = (key) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Determine the parent tag based on frequency (stable tie breaker)
  const inferParentTag = (habit, sortMode, freq) => {
    const tags = getTags(habit, sortMode)
    if (tags.length === 0) return null

    return tags.reduce((best, curr) => {
      const fb = freq[best.label]
      const fc = freq[curr.label]

      if (fc > fb) return curr
      if (fc === fb && curr.label < best.label) return curr
      return best
    })
  }

  // Parent + child grouping (shared logic)
  const groupByParentAndChildren = (
    habits,
    sortMode,
    freq,
    sortByCompletions = true,
  ) => {
    const parents = {}

    habits.forEach((habit) => {
      // Filter out completed habits if completedVisibility is false
      const isHidden =
        habit.completedDates.includes(activeDate) ||
        weekDays?.filter((d) => habit.completedDates.includes(d)).length >=
          habit.frequency.timesPerWeek
      if (!completedVisibility && isHidden) {
        return // Skip this habit
      }

      const tags = getTags(habit, sortMode)
      const parent = inferParentTag(habit, sortMode, freq)
      const parentLabel = parent?.label || "Unspecified"

      if (!parents[parentLabel]) parents[parentLabel] = {}

      if (tags.length <= 1) {
        if (!parents[parentLabel]["General"])
          parents[parentLabel]["General"] = []
        parents[parentLabel]["General"].push(habit)
        return
      }

      const childTags = tags
        .filter((t) => t.label !== parentLabel)
        .map((t) => t.label)

      if (childTags.length === 0) {
        if (!parents[parentLabel]["General"])
          parents[parentLabel]["General"] = []
        parents[parentLabel]["General"].push(habit)
      } else {
        childTags.forEach((child) => {
          if (!parents[parentLabel][child]) parents[parentLabel][child] = []
          parents[parentLabel][child].push(habit)
        })
      }
    })

    // Sort habits within each group
    Object.keys(parents).forEach((parentLabel) => {
      Object.keys(parents[parentLabel]).forEach((childLabel) => {
        if (sortByCompletions) {
          // Use start-of-day state (before activeDate) so order stays static throughout the day
          parents[parentLabel][childLabel].sort((a, b) => {
            // Count completions BEFORE the active date (not including today)
            const completedA = weekDays.filter(
              (d) => a.completedDates.includes(d) && d < activeDate,
            ).length
            const completedB = weekDays.filter(
              (d) => b.completedDates.includes(d) && d < activeDate,
            ).length
            const remainingA = a.frequency.timesPerWeek - completedA
            const remainingB = b.frequency.timesPerWeek - completedB

            // Primary sort: by remaining (desc)
            if (remainingB !== remainingA) {
              return remainingB - remainingA
            }

            // Secondary sort: by habit name alphabetically
            return (a.name || "").localeCompare(b.name || "")
          })
        } else {
          // Simple alphabetical sort by name
          parents[parentLabel][childLabel].sort((a, b) => {
            return (a.name || "").localeCompare(b.name || "")
          })
        }
      })
    })

    // Calculate totals and sort categories
    if (sortByCompletions) {
      // Calculate total remaining completions for each child group
      // Based on start-of-day state (before activeDate) so order stays static throughout the day
      const childGroupTotals = {}
      Object.keys(parents).forEach((parentLabel) => {
        childGroupTotals[parentLabel] = {}
        Object.keys(parents[parentLabel]).forEach((childLabel) => {
          let childTotal = 0
          parents[parentLabel][childLabel].forEach((habit) => {
            const completedBeforeToday = weekDays.filter(
              (d) => habit.completedDates.includes(d) && d < activeDate,
            ).length
            const remaining = Math.max(
              0,
              habit.frequency.timesPerWeek - completedBeforeToday,
            )
            childTotal += remaining
          })
          childGroupTotals[parentLabel][childLabel] = childTotal
        })
      })

      // Calculate total remaining completions for each parent category
      const categoryTotals = {}
      Object.keys(parents).forEach((parentLabel) => {
        categoryTotals[parentLabel] = Object.values(
          childGroupTotals[parentLabel],
        ).reduce((sum, val) => sum + val, 0)
      })

      // Sort by completions
      return Object.keys(parents)
        .sort((a, b) => {
          if (a === "Unspecified") return 1
          if (b === "Unspecified") return -1
          return categoryTotals[b] - categoryTotals[a]
        })
        .map((parentLabel) => ({
          label: parentLabel,
          groups: Object.keys(parents[parentLabel])
            .sort((a, b) => {
              if (a === "General") return -1
              if (b === "General") return 1
              return (
                childGroupTotals[parentLabel][b] -
                childGroupTotals[parentLabel][a]
              )
            })
            .map((childLabel) => ({
              label: childLabel,
              habits: parents[parentLabel][childLabel],
            })),
        }))
    } else {
      // Sort alphabetically
      return Object.keys(parents)
        .sort((a, b) => {
          if (a === "Unspecified") return 1
          if (b === "Unspecified") return -1
          return a.localeCompare(b)
        })
        .map((parentLabel) => ({
          label: parentLabel,
          groups: Object.keys(parents[parentLabel])
            .sort((a, b) => {
              if (a === "General") return -1
              if (b === "General") return 1
              return a.localeCompare(b)
            })
            .map((childLabel) => ({
              label: childLabel,
              habits: parents[parentLabel][childLabel],
            })),
        }))
    }
  }

  // CATEGORY-only tree (can be nested later)
  const groupByCategoryTree = (
    habits,
    sortByTypeAndName = false,
    sortByCompletions = true,
  ) => {
    const sortMode = "category"
    const freq = computeTagFrequency(habits, sortMode)
    const tree = groupByParentAndChildren(
      habits,
      sortMode,
      freq,
      sortByCompletions,
    )

    // If sortByTypeAndName is true, sort habits by type (P1 before P2) then name
    if (sortByTypeAndName) {
      tree.forEach((parent) => {
        parent.groups.forEach((group) => {
          group.habits.sort((a, b) => {
            // Primary sort: P1 before P2
            if (a.type !== b.type) {
              return a.type === "P1" ? -1 : 1
            }
            // Secondary sort: by name alphabetically
            return (a.name || "").localeCompare(b.name || "")
          })
        })
      })
    }

    return tree.map((parent) => ({
      label: parent.label,
      groups: parent.groups,
    }))
  }

  const groupByPriority = (habits) => {
    const p1 = habits.filter((h) => h.type === "P1")
    const p2 = habits.filter((h) => h.type === "P2")

    // Calculate days remaining in week (from activeDate to end of week)
    const daysRemainingInWeek = weekDays.filter((d) => d >= activeDate).length

    // Identify urgent habits - need to be done today to stay on track
    // Only Core (P1) habits can be urgent since Reach goals don't use frequency
    const isHabitUrgent = (habit) => {
      // Reach goals are never urgent
      if (habit.type === "P2") return false

      const completedThisWeek = weekDays.filter((d) =>
        habit.completedDates.includes(d),
      ).length
      const completionsRemaining =
        habit.frequency.timesPerWeek - completedThisWeek

      // Urgent if completions remaining >= days remaining
      // But not urgent if already completed today
      const completedToday = habit.completedDates.includes(activeDate)
      return completionsRemaining >= daysRemainingInWeek && !completedToday
    }

    const urgentHabits = habits.filter(isHabitUrgent)

    // Build Core groups with Time Sensitive subcategory if applicable
    const coreGroups = groupByCategoryTree(p1)

    // Prepend Time Sensitive group at the top of Core's groups if there are urgent habits
    if (urgentHabits.length > 0) {
      coreGroups.unshift({
        label: "Time Sensitive",
        habits: urgentHabits.sort((a, b) => {
          // Sort by remaining completions
          const completedA = weekDays.filter((d) =>
            a.completedDates.includes(d),
          ).length
          const completedB = weekDays.filter((d) =>
            b.completedDates.includes(d),
          ).length
          const remainingA = a.frequency.timesPerWeek - completedA
          const remainingB = b.frequency.timesPerWeek - completedB
          return remainingB - remainingA
        }),
      })
    }

    return [
      {
        label: "Core",
        color: theme.colors.coreColor,
        groups: coreGroups,
      },
      {
        label: "Reach",
        color: theme.colors.reachColor,
        groups: groupByCategoryTree(p2),
      },
    ]
  }

  const groupByCategoryMode = (habits) => {
    return groupByCategoryTree(habits, true, false).map((parent) => ({
      label: parent.label,
      color:
        parent.label === "Unspecified"
          ? theme.colors.incomplete
          : theme.colors.accent,
      groups: parent.groups,
    }))
  }

  const groupByTime = (habits) => {
    const buckets = {}

    habits.forEach((h) => {
      const times = getTags(h, "time")
      const labels = times.length ? times.map((t) => t.label) : ["Unspecified"]

      labels.forEach((label) => {
        if (!buckets[label]) buckets[label] = []
        buckets[label].push(h)
      })
    })

    // Define custom time order
    const timeOrder = ["Morning", "Afternoon", "Night", "Unspecified"]

    return Object.keys(buckets)
      .sort((a, b) => {
        const indexA = timeOrder.indexOf(a)
        const indexB = timeOrder.indexOf(b)
        // If not in timeOrder, put at end
        const posA = indexA === -1 ? timeOrder.length : indexA
        const posB = indexB === -1 ? timeOrder.length : indexB
        return posA - posB
      })
      .map((label) => ({
        label: label === "Unspecified" ? "Anytime" : label,
        color:
          label === "Unspecified"
            ? theme.colors.coreColor
            : theme.colors.accent,
        groups: groupByCategoryTree(buckets[label], true, false),
      }))
  }

  useEffect(() => {
    const sortHabits = () => {
      var groupedHabits = []
      switch (sortMode) {
        case "priority":
          groupedHabits = groupByPriority(habits)
          break
        case "time":
          groupedHabits = groupByTime(habits)
          break
        case "category":
          groupedHabits = groupByCategoryMode(habits)
          break
        default:
          groupedHabits = [
            {
              label: "All Habits",
              color: theme.colors.accent,
              groups: groupByCategoryTree(habits),
            },
          ]
          break
      }

      setGroupedHabits(groupedHabits)
    }
    if (weekDays.length > 0 && habits) sortHabits()
  }, [sortMode, habits, weekDays, completedVisibility])

  const renderGroup = (group, level = 1, path = "") => {
    const thisPath = path ? `${path} > ${group.label}` : group.label
    const collapseKey = thisPath

    const defaultCollapsed = false

    // Initialize collapse state for this group ONCE
    if (!initialized.has(collapseKey)) {
      setInitialized((prev) => {
        const next = new Set(prev)
        next.add(collapseKey)
        return next
      })

      // Apply defaultCollapsed into collapsed state ONCE
      if (defaultCollapsed) {
        setCollapsed((prev) => {
          const next = new Set(prev)
          next.add(collapseKey)
          return next
        })
      }
    }

    const isCollapsed = collapsed.has(collapseKey)

    // CASE 1: "General" = habits-only leaf node
    if (group.label === "General") {
      return (
        <div key={group.label} className="group-level" data-level={level}>
          {group.habits?.map((habit) => (
            <WeeklyHabitRow
              key={habit._id || habit.id}
              habit={habit}
              activeDate={activeDate}
              handleComplete={handleComplete}
              handleDelete={handleDelete}
              onEdit={onEdit}
              weekDays={weekDays}
              openSheet={openSheet}
            />
          ))}
        </div>
      )
    }

    // CASE 2: non-General group → show header (h3 or h4)
    const HeadingTag = level === 1 ? "h3" : "h4"
    const headingStyle = {
      margin: level === 1 ? "0px 0px" : `0px ${level * 4}px`,
      color:
        level === 1
          ? group.color ?? theme.colors.accent
          : theme.colors.textSecondary,
      fontSize: level <= 2 ? 20 : 16,
      fontWeight: level <= 2 ? 600 : 500,
      display: "flex",
      alignItems: "center",
      gap: "6px", // arrow sits to the left of label
    }

    return (
      <div key={group.label} className="group-level" data-level={level}>
        <HeadingTag style={headingStyle}>
          {/* Left-side arrow */}
          <span
            style={{
              cursor: "pointer",
              // padding: "16px",
              lineHeight: 1,
            }}
            onClick={(e) => {
              e.stopPropagation()
              toggleCollapse(collapseKey)
            }}
          >
            {isCollapsed ? "▶" : "▼"}
          </span>

          {group.label}
        </HeadingTag>

        {/* IMPORTANT FIX: Render habits when leaf node has habits */}
        {!isCollapsed && (
          <>
            {Array.isArray(group.habits) &&
              group.habits.map((habit) => (
                <WeeklyHabitRow
                  key={habit._id || habit.id}
                  habit={habit}
                  activeDate={activeDate}
                  handleComplete={handleComplete}
                  handleDelete={handleDelete}
                  onEdit={onEdit}
                  weekDays={weekDays}
                  openSheet={openSheet}
                />
              ))}

            {/* Recurse into child groups if present */}
            {Array.isArray(group.groups) &&
              group.groups.map((child) =>
                renderGroup(child, level + 1, thisPath)
              )}
          </>
        )}
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div>
        {weekDays.length > 0 && groupedHabits.map((h) => renderGroup(h))}
      </div>
    </AnimatePresence>
  )
}

WeeklyHabitsList.propTypes = {
  habits: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      tags: PropTypes.object,
    })
  ).isRequired,
  activeWeekRange: PropTypes.shape({
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
  }).isRequired,
  sortMode: PropTypes.string.isRequired,
  handleComplete: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  activeDate: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  showWeekDays: PropTypes.bool.isRequired,
}
