// WeeklyHabitRowLayout.js
import React from "react"
import theme from "../styles/theme"
import WeekDayRow from "./WeekDayRow"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTrash,
  faEdit,
  faEllipsis,
  faCirclePause,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons"

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
  disabled = false,
  sortMode = "priority",
}) {
  const n = habit.frequency.timesPerWeek
  const isPaused = n === 0
  const isWeekComplete = !isPaused && (completedWeeklyHabits?.length ?? 0) >= n
  const leftBarColor = isPaused
    ? "#999"
    : isWeekComplete
      ? theme.colors.completeColor
      : habit.type === "P1"
        ? theme.colors.coreColor
        : theme.colors.reachColor

  const CheckBox = (
    <input
      type="checkbox"
      checked={completedToday}
      onChange={(e) => handleComplete(habit.id, activeDate, e.target.checked)}
      disabled={isPaused || disabled}
      style={{
        accentColor: isPaused
          ? "#999"
          : completedWeeklyHabits?.length >= n
            ? theme.colors.completeColor
            : habit.type === "P1"
              ? theme.colors.coreColor
              : theme.colors.reachColor,
        width: "100%",
        height: "100%",
        flexShrink: 0,
        cursor: isPaused || disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    />
  )

  const HabitName =
    habit.type === "P1" ? (
      <span
        style={{
          color: isPaused ? "#999" : "#111",
          fontWeight: 600,
          textDecoration:
            completedWeeklyHabits.length >= n ? "line-through" : "none",
          fontStyle: isPaused ? "italic" : "normal",
        }}
      >
        {habit.name}
      </span>
    ) : (
      <span
        style={{
          color: isPaused ? "#999" : "#111",
          fontStyle: isPaused ? "italic" : "normal",
        }}
      >
        {habit.name}
      </span>
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
          color: isPaused ? "#999" : "#888",
          flexShrink: 0,
          fontStyle: "normal",
        }}
      >
        {isPaused ? (
          <FontAwesomeIcon icon={faCirclePause} />
        ) : (
          `${completedWeeklyHabits?.length} / ${n}`
        )}
      </span>
    ) : null

  const EditButton = true ? (
    <button
      onClick={() => !disabled && onEdit(habit)}
      title={disabled ? "Cannot edit habits in past/future weeks" : "Edit habit"}
      disabled={disabled}
      style={{
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        marginLeft: 8,
        padding: 4,
        color: theme.colors.text,
        display: "flex",
        alignItems: "center",
        borderRadius: 4,
        transition: "background 0.2s",
        flexShrink: 0,
        opacity: disabled ? 0.3 : 1,
      }}
    >
      <FontAwesomeIcon icon={faEdit} size="lg" />
    </button>
  ) : null

  const DeleteButton = true ? (
    <button
      onClick={() => !disabled && handleDelete(habit.id)}
      title={disabled ? "Cannot delete habits in past/future weeks" : "Delete habit"}
      disabled={disabled}
      style={{
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        marginLeft: 4,
        padding: 4,
        color: theme.colors.accent,
        display: "flex",
        alignItems: "center",
        borderRadius: 4,
        transition: "background 0.2s",
        flexShrink: 0,
        opacity: disabled ? 0.3 : 1,
      }}
    >
      <FontAwesomeIcon icon={faTrash} size="lg" />
    </button>
  ) : null

  const HabitMenuButton = (
    <button
      onClick={() => !disabled && openSheet(habit)}
      title={disabled ? "Cannot modify habits in past/future weeks" : "Habit Menu"}
      disabled={disabled}
      style={{
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        marginLeft: 8,
        padding: 4,
        color: theme.colors.text,
        display: "flex",
        alignItems: "center",
        borderRadius: 4,
        transition: "background 0.2s",
        flexShrink: 0,
        opacity: disabled ? 0.3 : 1,
      }}
    >
      <FontAwesomeIcon icon={faEllipsis} size="lg" />
    </button>
  )

  const timeLabel = sortMode !== "time"
    ? habit.tags?.time?.[0]?.label ?? null
    : null

  const timeBadgeConfig = {
    Morning: {
      bg: "#FFF8E1",
      color: "#B45309",
      icon: (
        <svg width="11" height="9" viewBox="0 0 22 16" fill="none" aria-hidden="true">
          <line x1="0" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M 3 14 A 8 8 0 0 1 19 14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      ),
    },
    Afternoon: {
      bg: "#FEF9C3",
      color: "#CA8A04",
      icon: <FontAwesomeIcon icon={faSun} />,
    },
    Night: {
      bg: "#EDE9FE",
      color: "#5B21B6",
      icon: <FontAwesomeIcon icon={faMoon} />,
    },
  }

  const cfg = timeLabel ? timeBadgeConfig[timeLabel] : null

  const TimeBadge = cfg ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontWeight: 600,
        lineHeight: 1,
        padding: "2px 6px",
        borderRadius: 10,
        flexShrink: 0,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {cfg.icon}
      {timeLabel}
    </span>
  ) : null

  return {
    CheckBox,
    HabitName,
    WeekRow,
    Fraction,
    EditButton,
    DeleteButton,
    HabitMenuButton,
    TimeBadge,
    leftBarColor,
  }
}

// Layout strategies
export const Layouts = {
  P1: {
    mobile: ({
      CheckBox,
      HabitName,
      WeekRow,
      Fraction,
      HabitMenuButton,
      TimeBadge,
      leftBarColor,
    }) => (
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
            borderLeft: `4px solid ${leftBarColor}`,
            paddingLeft: 8,
          }}
        >
          <div style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            {HabitName}
            {TimeBadge}
          </div>

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
      TimeBadge,
      leftBarColor,
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
            borderLeft: `4px solid ${leftBarColor}`,
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
          {TimeBadge}
          {Fraction}
          {EditButton}
          {DeleteButton}
        </div>
      </div>
    ),
  },

  P2: {
    mobile: ({
      CheckBox,
      HabitName,
      HabitMenuButton,
      WeekRow,
      TimeBadge,
      leftBarColor,
    }) => (
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
            borderLeft: `4px solid ${leftBarColor}`,
            paddingLeft: 8,
          }}
        >
          <div
            style={{
              marginBottom: 4,
              minHeight: 28,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {HabitName}
            {TimeBadge}
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            {WeekRow}
            {/* {Fraction} */}
          </div>
        </div>

        {HabitMenuButton}
      </div>
    ),

    desktop: ({
      CheckBox,
      HabitName,
      WeekRow,
      EditButton,
      DeleteButton,
      TimeBadge,
      leftBarColor,
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
            borderLeft: `4px solid ${leftBarColor}`,
            paddingLeft: 8,
          }}
        >
          {HabitName}
        </div>

        {/* Column 3: Weekday row (fixed width so everything lines up) */}
        <div
          style={{
            width: 224,
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
          {TimeBadge}
          {EditButton}
          {DeleteButton}
        </div>
      </div>
    ),
  },
}
