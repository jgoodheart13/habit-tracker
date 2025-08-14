// DailyViewPage.js

import React, { useState, useEffect } from "react";
import HabitChecklist from "../components/HabitChecklist";
import HabitChart from "../components/HabitChart";
import { getHabits, markHabitComplete } from "../services/habitService";
import { calculateRollingAverage } from "../utils/rollingAverage";

function getLastNDates(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export default function DailyViewPage() {
  const [habits, setHabits] = useState([]);
  const [selectedHabitIds, setSelectedHabitIds] = useState([]);

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  function handleComplete(id, date, isChecked) {
    console.log("handleComplete called:", { id, date, isChecked });
    markHabitComplete(id, date, isChecked);
    const updatedHabits = getHabits();
    console.log("Habits after markComplete:", updatedHabits);
    setHabits(updatedHabits);
  }

  function handleSelectHabit(id) {
    setSelectedHabitIds((prev) =>
      prev.includes(id) ? prev.filter((hid) => hid !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    setSelectedHabitIds([]);
  }

  const last7Days = getLastNDates(7);
  // If none selected, show all habits. If some selected, show only those.
  const filteredHabits =
    selectedHabitIds.length === 0
      ? habits
      : habits.filter((h) => selectedHabitIds.includes(h.id));

  // Calculate average for each day for selected habits
  const chartData = last7Days.map((date) => {
    const total = filteredHabits.length;
    const completed = filteredHabits.filter((h) =>
      h.completedDates.includes(date)
    ).length;
    return {
      date,
      percent: total === 0 ? 0 : (completed / total) * 100,
    };
  });

  return (
    <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Today's Habits</h2>
      <HabitChecklist habits={habits} onComplete={handleComplete} />
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Progress Chart</h2>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {habits.map((habit) => (
            <div
              key={habit.id}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <input
                type="checkbox"
                checked={selectedHabitIds.includes(habit.id)}
                onChange={() => {
                  console.log("Checkbox changed for habit:", habit.id);
                  handleSelectHabit(habit.id);
                }}
                style={{ accentColor: "#fc5200", width: 18, height: 18 }}
              />
              <span style={{ fontWeight: 500 }}>{habit.name}</span>
            </div>
          ))}
          <button
            onClick={handleSelectAll}
            style={{
              padding: 8,
              border:
                selectedHabitIds.length === 0
                  ? "2px solid #fc5200"
                  : "1px solid #ccc",
              borderRadius: 4,
              background: selectedHabitIds.length === 0 ? "#fff7f2" : "#fff",
              fontWeight: 500,
              opacity: selectedHabitIds.length === 0 ? 1 : 0.85,
              boxShadow:
                selectedHabitIds.length === 0 ? "0 2px 8px #fc520033" : "none",
              transition: "all 0.2s",
            }}
          >
            All Habits
          </button>
        </div>
        <HabitChart
          data={chartData}
          title={
            selectedHabitIds.length === 0
              ? "All Habits"
              : `Selected Habits (${selectedHabitIds.length})`
          }
        />
      </div>
    </div>
  );
}
