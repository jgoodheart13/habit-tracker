// DailyViewPage.js

import React, { useState, useEffect } from "react";
import HabitChecklist from "../components/HabitChecklist";
import HabitChart from "../components/HabitChart";
import WeeklyHabitBar from "../components/WeeklyHabitBar";
import WeeklyProgressChart from "../components/WeeklyProgressChart";
import HabitForm from "../components/HabitForm";
import {
  getHabits,
  markHabitComplete,
  deleteHabit,
} from "../services/habitService";
// import { calculateRollingAverage } from "../utils/rollingAverage"; // Remove unused

// function getLastNDates(n) { /* unused */ }

export default function DailyViewPage() {
  const [habits, setHabits] = useState([]);
  // const [selectedHabitIds, setSelectedHabitIds] = useState([]); // unused
  const [activeTab, setActiveTab] = useState("daily"); // 'daily' or 'weekly'
  // Track the active date (default to today)
  const [activeDate, setActiveDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  // Modal state for Add Habit
  const [showAddHabit, setShowAddHabit] = useState(false);
  // Context-sensitive default for HabitForm
  function getDefaultHabit() {
    if (activeTab === "daily") {
      return {
        name: "",
        type: "P1",
        frequency: { daily: true, timesPerWeek: 7 },
      };
    } else {
      return {
        name: "",
        type: undefined,
        frequency: { daily: false, timesPerWeek: 1 },
      };
    }
  }

  function handleAddHabit(newHabit) {
    setHabits((prev) => [...prev, newHabit]);
    setShowAddHabit(false);
    // Optionally persist using habitService
    // import { addHabit } from habitService if needed
    // addHabit(newHabit);
  }

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

  // function handleSelectHabit(id) { /* unused */ }
  // function handleSelectAll() { /* unused */ }

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
      {/* Tab header + Add Habit button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setActiveTab("daily")}
            style={{
              fontWeight: activeTab === "daily" ? 700 : 400,
              background: activeTab === "daily" ? "#fc5200" : "#fff",
              color: activeTab === "daily" ? "#fff" : "#333",
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: "6px 18px",
              cursor: "pointer",
              fontSize: 16,
              boxShadow:
                activeTab === "daily"
                  ? "0 2px 8px rgba(252,82,0,0.08)"
                  : "none",
              transition: "background 0.2s",
            }}
          >
            Daily View
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            style={{
              fontWeight: activeTab === "weekly" ? 700 : 400,
              background: activeTab === "weekly" ? "#fc5200" : "#fff",
              color: activeTab === "weekly" ? "#fff" : "#333",
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: "6px 18px",
              cursor: "pointer",
              fontSize: 16,
              boxShadow:
                activeTab === "weekly"
                  ? "0 2px 8px rgba(252,82,0,0.08)"
                  : "none",
              transition: "background 0.2s",
            }}
          >
            Weekly View
          </button>
        </div>
        <button
          onClick={() => setShowAddHabit(true)}
          style={{
            padding: "8px 20px",
            background: "#fc5200",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(252,82,0,0.08)",
            cursor: "pointer",
          }}
        >
          Add Habit
        </button>
      </div>
      {/* Add Habit Modal (simple inline modal for now) */}
      {showAddHabit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 16,
              minWidth: 340,
              boxShadow: "0 2px 16px rgba(0,0,0,0.13)",
            }}
          >
            <h2 style={{ marginBottom: 18, fontWeight: 700 }}>
              Add {activeTab === "daily" ? "Daily" : "Weekly"} Habit
            </h2>
            {/* Pass context-sensitive default to HabitForm */}
            <HabitForm
              onAdd={handleAddHabit}
              defaultHabit={getDefaultHabit()}
            />
            <button
              onClick={() => setShowAddHabit(false)}
              style={{
                marginTop: 18,
                background: "#eee",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
      {activeTab === "daily" && (
        <>
          <h2 style={{ fontWeight: 700, marginBottom: 16 }}>
            Habits for {activeDate}
          </h2>
          {renderGroupedChecklist()}
          <div style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 16 }}>
              Progress Chart
            </h2>
            <HabitChart
              data={chartData}
              title="Baseline vs Reach Habit Completion"
            />
          </div>
        </>
      )}
      {activeTab === "weekly" &&
        habits.filter((h) => !h.frequency.daily).length > 0 && (
          <>
            <WeeklyProgressChart habits={habits} activeDate={activeDate} />
            <div style={{ marginTop: 16 }}>
              <h2 style={{ fontWeight: 700, marginBottom: 16 }}>
                Weekly Goals
              </h2>
              {habits
                .filter((h) => !h.frequency.daily)
                .map((habit) => (
                  <WeeklyHabitBar
                    key={habit.id}
                    habit={habit}
                    activeDate={activeDate}
                    handleComplete={handleComplete}
                    handleDelete={handleDelete}
                  />
                ))}
            </div>
          </>
        )}
    </div>
  );
}
