// HabitChecklist.js

import React from 'react';
import theme from "../styles/theme";

export default function HabitChecklist({
  habits,
  onComplete,
  onDelete,
  onEdit,
  date,
}) {
  // Use date prop if provided, fallback to today
  const selectedDate = date || new Date().toLocaleDateString("en-CA")
  function handleEditClick(habit) {
    onEdit(habit)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {habits.map((habit) => (
        <div
          key={habit.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: theme.colors.background,
            padding: 10,
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <input
            type="checkbox"
            checked={habit.completedDates.includes(selectedDate)}
            onChange={(e) =>
              onComplete(habit.id, selectedDate, e.target.checked)
            }
            style={{ accentColor: theme.colors.accent, width: 20, height: 20 }}
          />
          <span style={{ fontWeight: 500 }}>{habit.name}</span>
          <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
            ({habit.type})
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
              gap: 2,
            }}
          >
            <button
              onClick={() => handleEditClick(habit)}
              title="Edit habit"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: theme.colors.accent,
                display: "flex",
                alignItems: "center",
                borderRadius: 4,
                marginLeft: 2,
                marginRight: 2,
                transition: "background 0.2s",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: 2 }}
              >
                <path d="M14.85 3.15a1.2 1.2 0 0 1 1.7 1.7l-9.2 9.2-2.1.4.4-2.1 9.2-9.2zm-1.7-1.7a3.2 3.2 0 0 1 4.5 4.5l-9.2 9.2a1 1 0 0 1-.5.3l-3.1.6a1 1 0 0 1-1.2-1.2l.6-3.1a1 1 0 0 1 .3-.5l9.2-9.2z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              title="Delete habit"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
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
        </div>
      ))}
    </div>
  )
}
