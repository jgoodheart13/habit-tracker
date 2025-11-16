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
const grouped = () => {
  if (sortMode === "priority") {
    return [
      {
        label: "Baseline",
        color: theme.colors.p1,
        groups: [
          {
            label: "General",
            habits: habits.filter((h) => h.type === "P1"),
          },
        ],
      },
      {
        label: "Reach",
        color: theme.colors.accent,
        groups: [
          {
            label: "General",
            habits: habits.filter((h) => h.type === "P2"),
          },
        ],
      },
    ]
  }

  if (sortMode === "category" || sortMode === "time") {
    const getTags = (habit) =>
      Array.isArray(habit.tags?.[sortMode])
        ? habit.tags[sortMode].filter((t) => t?.label)
        : []

    // ------------------------------
    // Step 1 — global frequency
    // ------------------------------
    const freq = {}
    habits.forEach((h) => {
      getTags(h).forEach((t) => {
        freq[t.label] = (freq[t.label] || 0) + 1
      })
    })

    // ------------------------------
    // Step 2 — infer parent tag
    // ------------------------------
    const inferParentTag = (habit) => {
      const tags = getTags(habit)
      if (tags.length === 0) return null

      return tags.reduce((best, curr) => {
        const fb = freq[best.label]
        const fc = freq[curr.label]

        if (fc > fb) return curr
        if (fc === fb && curr.label < best.label) return curr // stable
        return best
      })
    }

    // ------------------------------
    // Step 3 — parent → child grouping
    // ------------------------------
    const parents = {}

    habits.forEach((habit) => {
      const tags = getTags(habit)
      const parent = inferParentTag(habit)

      const parentLabel = parent?.label || "Unspecified"
      if (!parents[parentLabel]) parents[parentLabel] = {}

      // If only 1 tag, place under General
      if (tags.length <= 1) {
        if (!parents[parentLabel]["General"])
          parents[parentLabel]["General"] = []
        parents[parentLabel]["General"].push(habit)
        return
      }

      // Multiple tags → children = all non-parent tags
      const childTags = tags
        .filter((t) => t.label !== parentLabel)
        .map((t) => t.label)

      if (childTags.length === 0) {
        // no children — treat like General
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

    // ------------------------------
    // Step 4 — build UI structure
    // ------------------------------
    const sortedParents = Object.keys(parents).sort((a, b) => {
      if (a === "Unspecified") return 1
      if (b === "Unspecified") return -1
      return a.localeCompare(b)
    })

    return sortedParents.map((parentLabel) => ({
      label: parentLabel,
      color:
        parentLabel === "Unspecified"
          ? theme.colors.incomplete
          : theme.colors.accent,
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

  return [
    {
      label: "All Habits",
      color: theme.colors.accent,
      groups: [
        {
          label: "General",
          habits,
        },
      ],
    },
  ]
}

return (
  <div>
    <div>
      {grouped().map((group) => (
        <div key={group.label}>
          {/* Parent heading */}
          <h3
            style={{
              paddingLeft: theme.defaultHorizontalPadding,
              margin: "8px 0",
              color: group.color,
            }}
          >
            {group.label}
          </h3>

          {/* Child groups inside the parent */}
          {group.groups?.map((child) => (
            <div key={child.label}>
              {/* Show h4 only for NON-General child categories */}
              {child.label !== "General" && (
                <h4
                  style={{
                    paddingLeft: theme.defaultHorizontalPadding * 2,
                    margin: "4px 0",
                    color: theme.colors.textSecondary,
                    fontWeight: 500,
                  }}
                >
                  {child.label}
                </h4>
              )}

              {/* Habits inside this child group */}
              {child.habits.map((habit) => (
                <WeeklyHabitRow
                  key={habit._id}
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
          ))}
        </div>
      ))}
    </div>
  </div>
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