// WeeklyHabitsList.js

import React from "react";
import WeeklyHabitRow from "./WeeklyHabitRow";
import theme from "../styles/theme";
import PropTypes from "prop-types"

export default function WeeklyHabitsList({
  habits,
  activeWeekRange,
  sortMode,
  handleComplete,
  handleDelete,
  activeDate,
  onEdit,
  showWeekDays,
}) {
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
  const groupByParentAndChildren = (habits, sortMode, freq) => {
    const parents = {}

    habits.forEach((habit) => {
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

    // turn into sorted UI-friendly arrays
    return Object.keys(parents)
      .sort((a, b) =>
        a === "Unspecified" ? 1 : b === "Unspecified" ? -1 : a.localeCompare(b)
      )
      .map((parentLabel) => ({
        label: parentLabel,
        groups: Object.keys(parents[parentLabel])
          .sort((a, b) =>
            a === "General" ? -1 : b === "General" ? 1 : a.localeCompare(b)
          )
          .map((childLabel) => ({
            label: childLabel,
            habits: parents[parentLabel][childLabel],
          })),
      }))
  }

  // CATEGORY-only tree (can be nested later)
  const groupByCategoryTree = (habits) => {
    const sortMode = "category"
    const freq = computeTagFrequency(habits, sortMode)
    const tree = groupByParentAndChildren(habits, sortMode, freq)
    return tree.map((parent) => ({
      label: parent.label,
      groups: parent.groups,
    }))
  }

  const groupByPriority = (habits) => {
    const p1 = habits.filter((h) => h.type === "P1")
    const p2 = habits.filter((h) => h.type === "P2")

    return [
      {
        label: "Baseline",
        color: theme.colors.p1,
        groups: groupByCategoryTree(p1),
      },
      {
        label: "Reach",
        color: theme.colors.accent,
        groups: groupByCategoryTree(p2),
      },
    ]
  }

  const groupByCategoryMode = (habits) => {
    return groupByCategoryTree(habits).map((parent) => ({
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

    return Object.keys(buckets).map((label) => ({
      label,
      color:
        label === "Unspecified" ? theme.colors.incomplete : theme.colors.accent,
      groups: groupByCategoryTree(buckets[label]),
    }))
  }

  const grouped = () => {
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
    return groupedHabits
  }

  // ---------------------------------------------------------
  // ⭐ RECURSIVE RENDERER ⭐
  // ---------------------------------------------------------
  const renderGroup = (group, level = 1) => {
    const indent = theme.defaultHorizontalPadding * level

    // CASE 1: "General" = habits-only leaf node
    if (group.label === "General") {
      return (
        <div key={group.label}>
          {group.habits?.map((habit) => (
            <WeeklyHabitRow
              key={habit._id || habit.id}
              habit={habit}
              activeDate={activeDate}
              activeWeekRange={activeWeekRange}
              handleComplete={handleComplete}
              handleDelete={handleDelete}
              onEdit={onEdit}
              showWeekDays={showWeekDays}
            />
          ))}
        </div>
      )
    }

    // CASE 2: non-General group → show header (h3 or h4)
    const HeadingTag = level === 1 ? "h3" : "h4"
    const headingStyle =
      level === 1
        ? {
            paddingLeft: indent,
            margin: "8px 0",
            color: group.color ?? theme.colors.accent,
          }
        : {
            paddingLeft: indent,
            margin: "4px 0",
            color: theme.colors.textSecondary,
            fontWeight: 500,
          }

    return (
      <div key={group.label}>
        <HeadingTag style={headingStyle}>{group.label}</HeadingTag>

        {/* IMPORTANT FIX: Render habits when leaf node has habits */}
        {Array.isArray(group.habits) &&
          group.habits.map((habit) => (
            <WeeklyHabitRow
              key={habit._id || habit.id}
              habit={habit}
              activeDate={activeDate}
              activeWeekRange={activeWeekRange}
              handleComplete={handleComplete}
              handleDelete={handleDelete}
              onEdit={onEdit}
              showWeekDays={showWeekDays}
            />
          ))}

        {/* Recurse into child groups if present */}
        {Array.isArray(group.groups) &&
          group.groups.map((child) => renderGroup(child, level + 1))}
      </div>
    )
  }

  // ---------------------------------------------------------

  return <div>{grouped().map((g) => renderGroup(g))}</div>
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
