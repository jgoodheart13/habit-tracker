import React from "react";
import theme from "../styles/theme";

export default function WeekDayRow({ weekDays, habit, completed, n, activeDate }) {
  return (
    <div style={{ display: "flex", gap: 2, minWidth: 168 }}>
      {weekDays.map((day, idx) => {
        const isRecorded = habit.completedDates.includes(day);
        let color = theme.colors.incomplete;

        if (isRecorded) {
          // completed is ordered by weekDays (WeeklyHabitRow derives it that way).
          // The first n recorded days count toward the goal (completeColor).
          // Any additional recorded days beyond n are shaded reachColor.
          const completionIndex = completed.indexOf(day); // 0-based rank among recorded days
          color = completionIndex > -1 && completionIndex < n
            ? theme.colors.completeColor
            : theme.colors.reachColor;
        }
        const isActive = day === activeDate;
        return (
          <div
            key={idx}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: color,
              border: isActive
                ? `2px solid ${theme.colors.accent}`
                : `1px solid ${theme.colors.border}`,
              boxShadow: isActive
                ? `0 0 0 2px ${theme.colors.accent}55`
                : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: theme.colors.text,
              fontWeight: isActive ? 700 : 400,
              flexShrink: 0,
            }}
            title={weekDays[idx]}
          >
            {["M", "T", "W", "T", "F", "S", "S"][idx]}
          </div>
        );
      })}
    </div>
  );
}