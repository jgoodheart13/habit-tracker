// WeeklyHabitRowLayout.js
import React from "react"
import theme from "../styles/theme"
import WeekDayRow from "./WeekDayRow"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faEdit, faEllipsis } from "@fortawesome/free-solid-svg-icons"

// Reusable view parts (these receive props from WeeklyHabitRow.js)
export function buildViewParts({
  habit,
  activeDate,
  handleComplete,
  handleDelete,
  onEdit,
  showWeekDays,
  weekDays,
  completedWeeklyHabits,
  completedToday,
  openSheet,
}) {
  const n = habit.frequency.timesPerWeek

  const CheckBox = (
    <input
      type="checkbox"
      checked={completedToday}
      onChange={(e) => handleComplete(habit.id, activeDate, e.target.checked)}
      style={{
        accentColor:
          completedWeeklyHabits?.length >= n
            ? theme.colors.p2Above100
            : habit.type === "P1"
            ? theme.colors.p1
            : theme.colors.p2Below100,
        width: "100%",
        height: "100%",
        flexShrink: 0,
      }}
    />
  )

  const HabitName =
    habit.type === "P1" ? (
      <span
        style={{
          color: "#111",
          textShadow: `0 0 6px ${theme.colors.p2Above100}, 0 0 12px ${theme.colors.p2Above100}`,
          fontWeight: 500,
          textDecoration:
            completedWeeklyHabits.length >= n ? "line-through" : "none",
        }}
      >
        {habit.name}
      </span>
    ) : (
      <span style={{ color: "#111" }}>{habit.name}</span>
    )

  const WeekRow =
    showWeekDays && weekDays ? (
      <WeekDayRow
        weekDays={weekDays}
        habit={habit}
        completed={completedWeeklyHabits}
        n={n}
        activeDate={activeDate}
      />
    ) : null

  const Fraction =
    habit.type === "P1" ? (
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
    ) : null

  const EditButton = true ? (
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
      <FontAwesomeIcon icon={faEdit} size="lg" />
    </button>
  ) : null

  const DeleteButton = true ? (
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
      <FontAwesomeIcon icon={faTrash} size="lg" />
    </button>
  ) : null

  const HabitMenuButton = (
    <button
      onClick={() => openSheet(habit)}
      title="Habit Menu"
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
      <FontAwesomeIcon icon={faEllipsis} size="lg" />
    </button>
  )

  return {
    CheckBox,
    HabitName,
    WeekRow,
    Fraction,
    EditButton,
    DeleteButton,
    HabitMenuButton,
  }
}

// Layout strategies
export const Layouts = {
  P1: {
    mobile: ({ CheckBox, HabitName, WeekRow, Fraction, HabitMenuButton }) => (
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ width: 50, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 28, // or 28, or whatever you want
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 15,
            }}
          >
            {CheckBox}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            borderLeft: `4px solid ${theme.colors.p1}` /* P1 color */,
            paddingLeft: 8,
          }}
        >
          <div style={{ marginBottom: 4 }}>{HabitName}</div>

          <div style={{ display: "flex", alignItems: "center" }}>
            {WeekRow}
            {Fraction}
          </div>
        </div>

        {HabitMenuButton}
      </div>
    ),

    desktop: ({
      CheckBox,
      HabitName,
      WeekRow,
      Fraction,
      EditButton,
      DeleteButton,
    }) => (
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        {/* Column 1: Checkbox */}
        <div style={{ width: 20, height: 20, marginRight: 15 }}>{CheckBox}</div>

        {/* Column 2: Name (fixed min width so weekdays line up) */}
        <div
          style={{
            minWidth: 210,
            flexShrink: 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            marginRight: 12,
            borderLeft: `4px solid ${theme.colors.p1}` /* P1 color */,
            paddingLeft: 8,
          }}
        >
          {HabitName}
        </div>

        {/* Column 3: Weekday row (fixed width so everything lines up) */}
        <div
          style={{
            width: 224, // <<< WEEKDAY COLUMN FIXED
            display: "flex",
            flexDirection: "row",
            gap: 4,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {WeekRow}
        </div>

        {/* Column 4: actions (auto spacing) */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {Fraction}
          {EditButton}
          {DeleteButton}
        </div>
      </div>
    ),
  },

  P2: {
    mobile: ({ CheckBox, HabitName, HabitMenuButton, WeekRow }) => (
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ width: 50, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 28, // or 28, or whatever you want
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 15,
            }}
          >
            {CheckBox}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            borderLeft: `4px solid ${theme.colors.p2Below100}` /* P1 color */,
            paddingLeft: 8,
          }}
        >
          <div
            style={{
              marginBottom: 4,
              height: 28,
              display: "flex",
              alignItems: "center",
            }}
          >
            {HabitName}
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            {WeekRow}
            {/* {Fraction} */}
          </div>
        </div>

        {HabitMenuButton}
      </div>
    ),

    desktop: ({ CheckBox, HabitName, EditButton, DeleteButton }) => (
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        {/* Column 1: Checkbox */}
        <div style={{ width: 20, height: 20, marginRight: 15 }}>{CheckBox}</div>

        {/* Column 2: Name (fixed min width so weekdays line up) */}
        <div
          style={{
            minWidth: 210,
            flexShrink: 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            marginRight: 12,
          }}
        >
          {HabitName}
        </div>

        {/* Column 4: actions (auto spacing) */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {EditButton}
          {DeleteButton}
        </div>
      </div>
    ),
  },
}
