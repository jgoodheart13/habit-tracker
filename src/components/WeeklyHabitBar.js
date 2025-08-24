// WeeklyHabitBar.js
import React from 'react';
import theme from "../styles/theme";

// Accept handleComplete and activeDate as props

// Helper to get all days in current week (Monday-Sunday)
function getWeekDays() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export default function WeeklyHabitBar({
  habit,
  activeDate,
  handleComplete,
  handleDelete,
}) {
  const weekDays = getWeekDays();
  const completed = weekDays.filter((d) => habit.completedDates.includes(d));
  const n = habit.frequency.timesPerWeek;
  // Sort completed dates by day order
  const completedSorted = weekDays.map((d) => habit.completedDates.includes(d));
  // Color logic: first N completions are p1, extras are p2Above100, incomplete is 'incomplete'
  let colored = [];
  let filled = 0;
  for (let i = 0; i < weekDays.length; i++) {
    if (completedSorted[i]) {
      if (filled < n) {
        colored.push("p1");
        filled++;
      } else {
        colored.push("p2Above100");
      }
    } else {
      colored.push("incomplete");
    }
  }
  // Checkbox for this week's activeDate
  const checked = habit.completedDates.includes(activeDate);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#fff",
        padding: 10,
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        marginBottom: 8,
      }}
    >
      <label
        style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 180 }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) =>
            handleComplete(habit.id, activeDate, e.target.checked)
          }
          style={{ accentColor: theme.colors.accent, width: 20, height: 20 }}
        />
        <span style={{ fontWeight: 500 }}>{habit.name}</span>
        <span style={{ fontSize: 12, color: "#888" }}>
          ({habit.frequency.timesPerWeek}x/week)
        </span>
      </label>
      <div style={{ display: "flex", gap: 2 }}>
        {colored.map((color, idx) => (
          <div
            key={idx}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background:
                color === "p1"
                  ? "#3c5ef8"
                  : color === "p2Above100"
                  ? "#fabf52"
                  : "#eee",
              border: "1px solid #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#333",
            }}
            title={weekDays[idx]}
          >
            {["M", "T", "W", "T", "F", "S", "S"][idx]}
          </div>
        ))}
      </div>
      <span style={{ marginLeft: 12, fontSize: 13, color: "#888" }}>
        {completed.length} / {n} goal
      </span>
      <button
        onClick={() => handleDelete(habit.id)}
        title="Delete habit"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          marginLeft: "auto",
          padding: 4,
          color: theme.colors.accent,
          display: "flex",
          alignItems: "center",
          borderRadius: 4,
          transition: "background 0.2s",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="6" y="8" width="8" height="8" rx="2" />
          <rect x="8" y="4" width="4" height="2" rx="1" />
          <rect x="5" y="6" width="10" height="2" rx="1" />
        </svg>
      </button>
    </div>
  );
}
