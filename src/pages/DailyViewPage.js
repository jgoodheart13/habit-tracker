// DailyViewPage.js

import React, { useState, useEffect } from "react";
import HabitChecklist from "../components/HabitChecklist";
import HabitChart from "../components/HabitChart";
import WeeklyHabitBar from "../components/WeeklyHabitBar";
import {
  getHabits,
  markHabitComplete,
  deleteHabit,
} from "../services/habitService";
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
  // Track the active date (default to today)
  const [activeDate, setActiveDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  // Arrow navigation handlers
  function changeDate(offset) {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + offset);
    setActiveDate(d.toISOString().slice(0, 10));
  }

  function handleComplete(id, date, isChecked) {
    markHabitComplete(id, date, isChecked);
    setHabits(getHabits());
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

  // Chart and checklist should use the active date as the reference
  const last14Days = (() => {
    const dates = [];
    const d = new Date(activeDate);
    for (let i = 13; i >= 0; i--) {
      const dd = new Date(d);
      dd.setDate(d.getDate() - i);
      dates.push(dd.toISOString().slice(0, 10));
    }
    return dates;
  })();
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
            date={activeDate}
          />
        </div>
        <div>
          <h3 style={{ margin: "8px 0", color: "#fc5200" }}>Reach (P2)</h3>
          <HabitChecklist
            habits={reachHabits}
            onComplete={handleComplete}
            onDelete={handleDelete}
            date={activeDate}
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
      p1Percent,
      p2Percent,
      reachScaled,
      combined,
    };
  });

  return (
    <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
      {/* Date navigation header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <button
          onClick={() => changeDate(-1)}
          style={{
            fontSize: 22,
            padding: "4px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          &larr;
        </button>
        <span
          style={{
            fontWeight: 700,
            fontSize: 20,
            minWidth: 140,
            textAlign: "center",
          }}
        >
          {activeDate}
        </span>
        <button
          onClick={() => changeDate(1)}
          style={{
            fontSize: 22,
            padding: "4px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          &rarr;
        </button>
      </div>
      <h2 style={{ fontWeight: 700, marginBottom: 16 }}>
        Habits for {activeDate}
      </h2>
      {renderGroupedChecklist()}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Progress Chart</h2>
        <HabitChart
          data={chartData}
          title="Baseline vs Reach Habit Completion"
        />
      </div>
      {/* Weekly habits checkbox section */}
      {habits.filter((h) => !h.frequency.daily).length > 0 && (
        <div style={{ marginTop: 32, marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 12 }}>
            Weekly Goal Checkboxes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {habits
              .filter((h) => !h.frequency.daily)
              .map((habit) => {
                const checked = habit.completedDates.includes(activeDate);
                return (
                  <label
                    key={habit.id}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        handleComplete(habit.id, activeDate, e.target.checked)
                      }
                      style={{ accentColor: "#fc5200", width: 20, height: 20 }}
                    />
                    <span style={{ fontWeight: 500 }}>{habit.name}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>
                      ({habit.frequency.timesPerWeek}x/week)
                    </span>
                  </label>
                );
              })}
          </div>
        </div>
      )}
      {/* Weekly habits horizontal bar charts */}
      {habits.filter((h) => !h.frequency.daily).length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Weekly Goals</h2>
          {habits
            .filter((h) => !h.frequency.daily)
            .map((habit) => (
              <WeeklyHabitBar key={habit.id} habit={habit} />
            ))}
        </div>
      )}
    </div>
  );
}
