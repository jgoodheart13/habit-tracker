// HabitForm.js
import React, { useState } from 'react';

const defaultHabit = {
  name: "",
  type: "P1", // Only used for daily habits
  frequency: { daily: true, timesPerWeek: 7 },
};

export default function HabitForm({ onAdd }) {
  const [habit, setHabit] = useState(defaultHabit);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "type") {
      setHabit((h) => ({ ...h, type: value }));
    } else if (name === "name") {
      setHabit((h) => ({ ...h, name: value }));
    } else if (name === "frequency") {
      if (value === "dailyP1") {
        setHabit((h) => ({
          ...h,
          type: "P1",
          frequency: { daily: true, timesPerWeek: 7 },
        }));
      } else if (value === "dailyP2") {
        setHabit((h) => ({
          ...h,
          type: "P2",
          frequency: { daily: true, timesPerWeek: 7 },
        }));
      } else if (value === "weeklyN") {
        setHabit((h) => ({
          ...h,
          type: undefined,
          frequency: {
            daily: false,
            timesPerWeek: h.frequency.timesPerWeek || 1,
          },
        }));
      }
    } else if (name === "timesPerWeek") {
      setHabit((h) => ({
        ...h,
        frequency: {
          ...h.frequency,
          timesPerWeek: value === "" ? "" : Number(value),
        },
      }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!habit.name) return;
    onAdd({ ...habit, id: Date.now(), completedDates: [] });
    setHabit(defaultHabit);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: "#fff",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      <input
        name="name"
        value={habit.name}
        onChange={handleChange}
        placeholder="Habit name"
        required
        style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
      />
      <select
        name="frequency"
        value={
          habit.frequency.daily
            ? habit.type === "P2"
              ? "dailyP2"
              : "dailyP1"
            : "weeklyN"
        }
        onChange={handleChange}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
      >
        <option value="dailyP1">Daily Priority 1</option>
        <option value="dailyP2">Daily Priority 2</option>
        <option value="weeklyN">N x Week Priority</option>
      </select>
      {!habit.frequency.daily && (
        <input
          type="number"
          name="timesPerWeek"
          min={1}
          max={7}
          value={habit.frequency.timesPerWeek}
          onChange={handleChange}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
      )}
      <button
        type="submit"
        style={{
          padding: 10,
          borderRadius: 6,
          background: "#fc5200",
          color: "#fff",
          border: "none",
          fontWeight: 600,
        }}
      >
        Add Habit
      </button>
    </form>
  );
}
