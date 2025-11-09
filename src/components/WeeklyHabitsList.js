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
  const grouped = (() => {
    if (sortMode === "priority") {
      return [
        {
          label: "Baseline",
          color: theme.colors.p1,
          habits: habits.filter((h) => h.type === "P1"),
        },
        {
          label: "Reach",
          color: theme.colors.accent,
          habits: habits.filter((h) => h.type === "P2"),
        },
      ]
    } else if (sortMode === "category" || sortMode === "time") {
      const withTag = habits.filter(
        (h) => h.tags && h.tags[sortMode] && h.tags[sortMode].label
      )
      const tagGroups = {}
      withTag.forEach((h) => {
        const tag = h.tags[sortMode].label
        if (!tagGroups[tag]) tagGroups[tag] = []
        tagGroups[tag].push(h)
      })
      const grouped = Object.keys(tagGroups).map((tag) => ({
        label: tag,
        color: theme.colors.accent,
        habits: tagGroups[tag],
      }))
      const unspecified = habits.filter(
        (h) => !h.tags || !h.tags[sortMode] || !h.tags[sortMode].label
      )
      if (unspecified.length) {
        grouped.push({
          label: "Unspecified",
          color: theme.colors.incomplete,
          habits: unspecified,
        })
      }
      return grouped
    } else {
      return [
        {
          label: "All Habits",
          color: theme.colors.accent,
          habits,
        },
      ]
    }
  })()

  return (
    <div>
      {/* Render week day tiles only if `showWeekDays` is true */}
      {/* Render habits */}
      <div>
        {grouped.map((group) => (
          <div key={group.label}>
            <h3
              style={{
                paddingLeft: theme.defaultHorizontalPadding,
                margin: "8px 0",
                color: group.color,
              }}
            >
              {group.label}
            </h3>
            {group.habits.map((habit) => (
              <WeeklyHabitRow
                habit={habit}
                activeDate={activeDate}
                activeWeekRange={activeWeekRange}
                handleComplete={handleComplete}
                handleDelete={handleDelete}
                onEdit={onEdit} // Ensure onEdit is passed
                showWeekDays={showWeekDays} // Pass showWeekDays prop
              />
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