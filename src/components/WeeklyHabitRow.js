// WeeklyHabitRow.js
import React, { useEffect, useState } from "react"
import theme from "../styles/theme"
import { motion } from "framer-motion"
import { buildViewParts, Layouts } from "./WeeklyHabitRowLayout"
import { isMobile } from "react-device-detect"

export default function WeeklyHabitRow({
  habit,
  activeDate,
  handleComplete,
  handleDelete,
  onEdit,
  weekDays,
  openSheet,
}) {
  const [completedWeeklyHabits, setCompletedWeeklyHabits] = useState([])
  const [completedToday, setCompletedToday] = useState(false)
  const [showWeekDays, setShowWeekDays] = useState(false)

  useEffect(() => {
    if (weekDays && habit) {
      const days = weekDays?.filter((d) => habit.completedDates.includes(d))
      setCompletedWeeklyHabits(days)
    }
  }, [habit, weekDays])

  useEffect(() => {
    setCompletedToday(habit.completedDates.includes(activeDate))
  }, [habit, activeDate])

  useEffect(() => {
    if (habit.type === "P1") {
      setShowWeekDays(true)
    } else {
      setShowWeekDays(completedWeeklyHabits.length >= 1)
    }
  }, [habit, completedWeeklyHabits])

  const parts = buildViewParts({
    habit,
    activeDate,
    handleComplete,
    handleDelete: () => handleDelete(habit.id, habit.name),
    onEdit,
    showWeekDays,
    weekDays,
    completedWeeklyHabits,
    completedToday,
    openSheet,
  })

  const Layout = Layouts[habit.type][isMobile ? "mobile" : "desktop"]

  return (
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
          background: completedToday ? "#e6e6e6" : "#fff",
          padding: 5,
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          marginBottom: 8,
          minWidth: 0,
          opacity: completedToday ? 0.55 : 1,
          width: "90%",
        }}
      >
        {Layout(parts)}
      </div>
    </motion.div>
  )
}
