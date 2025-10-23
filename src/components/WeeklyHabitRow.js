// WeeklyHabitRow.js
import React, { useEffect, useState } from "react";
import theme from "../styles/theme";

// Accept handleComplete and activeDate as props

export default function WeeklyHabitRow({
  habit,
  activeDate,
  handleComplete,
  handleDelete,
  onEdit,
  activeWeekRange, // New prop for active week range
}) {
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    if (activeWeekRange) {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(activeWeekRange.start);
        d.setDate(d.getDate() + i);
        return d.toISOString().slice(0, 10);
      });
      setWeekDays(days);
    }
  }, [activeWeekRange]); // Update weekDays when activeWeekRange changes

  const completed = weekDays.filter((d) => habit.completedDates.includes(d));
  const n = habit.frequency.timesPerWeek;
  // Color logic: if habit is 100% or more complete, all segments are p2Above100; else, first N completions are p1, extras are p2Above100, incomplete is 'incomplete'
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#fff",
        padding: 10,
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        marginBottom: 8,
        minWidth: 0,
      }}
    >
      {/* Habit name and info column (flexible) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          minWidth: 0,
          flex: 1,
          gap: 8,
          overflow: "hidden",
        }}
      >
        <input
          type="checkbox"
          checked={habit.completedDates.includes(activeDate)}
          onChange={(e) =>
            handleComplete(habit.id, activeDate, e.target.checked)
          }
          style={{
            accentColor:
              completed.length >= n
                ? theme.colors.p2Above100
                : theme.colors.accent,
            width: 20,
            height: 20,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontWeight: 500,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {habit.name}
        </span>
        {/* <span style={{ fontSize: 12, color: "#888", flexShrink: 0 }}>
          ({habit.frequency.timesPerWeek}x/week)
        </span> */}
      </div>
      {/* 7 static-width day columns */}
      <div style={{ display: "flex", gap: 2, minWidth: 168 }}>
        {weekDays.map((day, idx) => {
          const isRecorded = habit.completedDates.includes(day);
          let color = theme.colors.incomplete;
          if (isRecorded) {
            if (completed.length >= n) {
              color = theme.colors.p2Above100;
            } else {
              let filled = completed.slice(0, idx + 1).length;
              color = filled <= n ? theme.colors.p1 : theme.colors.p2Above100;
            }
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
      {/* Goal count and delete button (fixed width) */}
      {habit.type === "P1" && (
        <span
          style={{ marginLeft: 12, fontSize: 13, color: "#888", flexShrink: 0 }}
        >
          {completed.length} / {n}
        </span>
      )}
      {/* Edit button */}
      <button
        onClick={() => onEdit && onEdit(habit)}
        title="Edit habit"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          marginLeft: 8,
          padding: 4,
          color: theme.colors.text,
          display: "flex",
          alignItems: "center",
          borderRadius: 4,
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5z"
            fill="currentColor"
          />
          <path
            d="M17.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.13 1.13 3.75 3.75 1.13-1.13z"
            fill="currentColor"
          />
        </svg>
      </button>
      {/* Delete button */}
      <button
        onClick={() => handleDelete(habit.id)}
        title="Delete habit"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          marginLeft: 4,
          padding: 4,
          color: theme.colors.accent,
          display: "flex",
          alignItems: "center",
          borderRadius: 4,
          transition: "background 0.2s",
          flexShrink: 0,
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
