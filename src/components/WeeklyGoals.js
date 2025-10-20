// WeeklyGoals.js

import React from "react";
import WeeklyHabitBar from "./WeeklyHabitBar";
import theme from "../styles/theme";

export default function WeeklyGoals({
  habits,
  sortMode,
  handleComplete,
  handleDelete,
  activeDate,
  activeWeekRange,
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
      ];
    } else if (sortMode === "category" || sortMode === "time") {
      const withTag = habits.filter(
        (h) => h.tags && h.tags[sortMode] && h.tags[sortMode].label
      );
      const tagGroups = {};
      withTag.forEach((h) => {
        const tag = h.tags[sortMode].label;
        if (!tagGroups[tag]) tagGroups[tag] = [];
        tagGroups[tag].push(h);
      });
      const grouped = Object.keys(tagGroups).map((tag) => ({
        label: tag,
        color: theme.colors.accent,
        habits: tagGroups[tag],
      }));
      const unspecified = habits.filter(
        (h) => !h.tags || !h.tags[sortMode] || !h.tags[sortMode].label
      );
      if (unspecified.length) {
        grouped.push({
          label: "Unspecified",
          color: theme.colors.incomplete,
          habits: unspecified,
        });
      }
      return grouped;
    } else {
      return [
        {
          label: "All Habits",
          color: theme.colors.accent,
          habits,
        },
      ];
    }
  })();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {grouped.map((group) => (
        <div key={group.label}>
          <h3 style={{ margin: "8px 0", color: group.color }}>{group.label}</h3>
          {group.habits.map((habit) => (
            <WeeklyHabitBar
              key={habit.id}
              habit={habit}
              handleComplete={handleComplete}
              handleDelete={handleDelete}
              activeDate={activeDate}
              activeWeekRange={activeWeekRange}
            />
          ))}
        </div>
      ))}
    </div>
  );
}