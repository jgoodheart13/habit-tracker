// WeeklyHabitRow.js
import React, { useEffect, useState } from "react";
import theme from "../styles/theme";
import WeekDayRow from "./WeekDayRow"
import { motion, AnimatePresence } from "framer-motion"

// Accept handleComplete and activeDate as props

export default function WeeklyHabitRow({
  habit,
  activeDate,
  handleComplete,
  handleDelete,
  onEdit,
  showWeekDays, // New prop to control display of week days
  weekDays,
}) {
  const [completedWeeklyHabits, setCompletedWeeklyHabits] = useState([])
  const [completedToday, setCompletedToday] = useState(false)

  useEffect(() => {
    if (weekDays && habit) {
      const days = weekDays?.filter((d) => habit.completedDates.includes(d))
      setCompletedWeeklyHabits(days)
    }
  }, [habit, weekDays])

  useEffect(() => {
    setCompletedToday(habit.completedDates.includes(activeDate))
  }, [habit, activeDate])

  const n = habit.frequency.timesPerWeek
  // Color logic: if habit is 100% or more complete, all segments are p2Above100; else, first N completions are p1, extras are p2Above100, incomplete is 'incomplete'
  return (
    true && (
      <motion.div
        key={habit.id}
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background:
              completedWeeklyHabits.length >= habit.frequency.timesPerWeek
                ? "#e6e6e6"
                : "#fff", // darker grey, not too light
            padding: 10,
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            marginBottom: 8,
            minWidth: 0,
            opacity:
              completedWeeklyHabits.length >= habit.frequency.timesPerWeek
                ? 0.55
                : 1,
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
              // textShadow:
              //   habit.type === "P1" ? "0 0 4px rgb(255, 213, 79, 1)" : "none",
            }}
          >
            <input
              type="checkbox"
              checked={completedToday}
              onChange={(e) =>
                handleComplete(habit.id, activeDate, e.target.checked)
              }
              style={{
                accentColor:
                  completedWeeklyHabits?.length >= n
                    ? theme.colors.p2Above100
                    : habit.type === "P1"
                    ? theme.colors.p1
                    : theme.colors.p2Below100,
                width: 20,
                height: 20,
                flexShrink: 0,
              }}
            />
            {habit.type === "P1" ? (
              // Glow effect
              <span
                style={{
                  color: "#111",
                  textShadow: `0 0 6px ${theme.colors.p2Above100}, 0 0 12px ${theme.colors.p2Above100}`,
                  fontWeight: 500,
                  textDecoration:
                    completedWeeklyHabits.length >= habit.frequency.timesPerWeek
                      ? "line-through"
                      : "none",
                }}
              >
                {habit.name}
              </span>
            ) : (
              <span style={{ color: "#111" }}>{habit.name}</span>
            )}
          </div>
          {/* 7 static-width day columns */}
          {showWeekDays && weekDays && (
            <WeekDayRow
              weekDays={weekDays}
              habit={habit}
              completed={completedWeeklyHabits}
              n={n}
              activeDate={activeDate}
            />
          )}
          {/* Goal count and delete button (fixed width) */}
          {habit.type === "P1" && (
            <span
              style={{
                marginLeft: 12,
                fontSize: 13,
                color: "#888",
                flexShrink: 0,
              }}
            >
              {completedWeeklyHabits?.length} / {n}
            </span>
          )}
          {/* Edit button */}
          {!showWeekDays && (
            <button
              onClick={() => onEdit(habit)}
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
          )}
          {/* Delete button */}
          {!showWeekDays && (
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
          )}
        </div>
      </motion.div>
    )
  )
}
