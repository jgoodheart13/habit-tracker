// DailyViewPage.js

import React, { useState, useEffect } from "react";
import HabitChecklist from "../components/HabitChecklist";
import HabitChart from "../components/HabitChart";
import { getHabits, markHabitComplete, deleteHabit } from "../services/habitService";
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

  function handleDelete(id) {
    deleteHabit(id);
    setHabits(getHabits());
  }

  function handleSelectHabit(id) {
    setSelectedHabitIds((prev) =>
      prev.includes(id) ? prev.filter((hid) => hid !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    setSelectedHabitIds([]);
  }

  const last14Days = getLastNDates(14);
  // Organize habits by type
  const baselineHabits = habits.filter((h) => h.type === "P1");
  const reachHabits = habits.filter((h) => h.type === "P2");

  // Checklist grouping
  function renderGroupedChecklist() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h3 style={{ margin: "8px 0", color: "#228B22" }}>Baseline (P1)</h3>
          <HabitChecklist
            habits={baselineHabits}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        </div>
        <div>
          <h3 style={{ margin: "8px 0", color: "#fc5200" }}>Reach (P2)</h3>
          <HabitChecklist
            habits={reachHabits}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        </div>
      </div>
    );
  }

  // Chart data for stacked lines
  const chartData = last14Days.map((date) => {
    // Baseline (P1)
    const p1Total = baselineHabits.length;
    const p1Completed = baselineHabits.filter((h) =>
      h.completedDates.includes(date)
    ).length;
    const p1Percent = p1Total === 0 ? 0 : (p1Completed / p1Total) * 100;
    // Reach (P2)
    const p2Total = reachHabits.length;
    const p2Completed = reachHabits.filter((h) =>
      h.completedDates.includes(date)
    ).length;
    const p2Percent = p2Total === 0 ? 0 : (p2Completed / p2Total) * 100;
    // Inverse relationship: scaled reach
    const reachScaled = p2Percent * (p1Percent / 100);
    const combined = p1Percent + reachScaled;
    return {
      date,
      baseline: p1Percent,
      reach: p2Percent,
      reachScaled,
      combined,
    };
  });

  return (
    <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Today's Habits</h2>
      {renderGroupedChecklist()}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Progress Chart</h2>
        <HabitChart
          data={chartData}
          title="Baseline vs Reach Habit Completion"
        />
      </div>
    </div>
  );
}
