// HabitChecklist.js

import React from 'react';

export default function HabitChecklist({ habits, onComplete, onDelete, date }) {
  // Use date prop if provided, fallback to today
  const selectedDate = date || new Date().toISOString().slice(0, 10);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {habits.map((habit) => (
        <div
          key={habit.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
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
            style={{ accentColor: "#fc5200", width: 20, height: 20 }}
          />
          <span style={{ fontWeight: 500 }}>{habit.name}</span>
          <span style={{ fontSize: 12, color: "#888" }}>({habit.type})</span>
          <button
            onClick={() => onDelete(habit.id)}
            title="Delete habit"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              marginLeft: "auto",
              padding: 4,
              color: "#fc5200",
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
      ))}
    </div>
  );
}
