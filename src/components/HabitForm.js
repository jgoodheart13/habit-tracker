// HabitForm.js
import React, { useState } from 'react';
import theme from "../styles/theme";

export default function HabitForm({ onAdd, defaultHabit }) {
  const [tag, setTag] = useState(() =>
    defaultHabit && defaultHabit.tag
      ? defaultHabit.tag
      : { value: "", type: "category" }
  );
  const isEdit = !!(defaultHabit && defaultHabit.id);
  const [habit, setHabit] = useState(
    () =>
      defaultHabit || {
        name: "",
        type: "P1",
        frequency: { daily: true, timesPerWeek: 7 },
      }
  );

  // If defaultHabit changes (e.g. switching tabs), reset form
  React.useEffect(() => {
    setHabit(
      defaultHabit || {
        name: "",
        type: "P1",
        frequency: { daily: true, timesPerWeek: 7 },
      }
    );
  }, [defaultHabit]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "tagValue") {
      setTag((t) => ({ ...t, value }));
    } else if (name === "tagType") {
      setTag((t) => ({ ...t, type: value }));
    } else if (name === "type") {
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
    const habitWithTag = { ...habit, tag };
    if (isEdit) {
      onAdd(habitWithTag);
    } else {
      onAdd({ ...habitWithTag, id: Date.now(), completedDates: [] });
      setHabit(
        defaultHabit || {
          name: "",
          type: "P1",
          frequency: { daily: true, timesPerWeek: 7 },
        }
      );
      setTag({ value: "", type: "category" });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: theme.colors.background,
        padding: 16,
        borderRadius: 12,
        boxShadow: theme.colors.shadow,
      }}
    >
      <input
        name="name"
        value={habit.name}
        onChange={handleChange}
        placeholder="Habit name"
        required
        style={{
          padding: 8,
          borderRadius: 6,
          border: `1px solid ${theme.colors.border}`,
        }}
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
        style={{
          padding: 8,
          borderRadius: 6,
          border: `1px solid ${theme.colors.border}`,
        }}
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
          style={{
            padding: 8,
            borderRadius: 6,
            border: `1px solid ${theme.colors.border}`,
          }}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            name="tagValue"
            value={tag.value}
            onChange={handleChange}
            placeholder="Tag (e.g. Morning, Health)"
            style={{
              padding: 8,
              borderRadius: 6,
              border: `1px solid ${theme.colors.border}`,
              flex: 1,
            }}
          />
          <select
            name="tagType"
            value={tag.type}
            onChange={handleChange}
            style={{
              padding: 8,
              borderRadius: 6,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <option value="category">Category</option>
            <option value="time">Time</option>
          </select>
        </div>
      </div>
      {/* Buttons row at bottom, inline with Cancel in modal */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 18,
        }}
      >
        {/* Cancel button will be rendered by parent modal, so only Save here */}
        <button
          type="submit"
          style={{
            padding: 10,
            borderRadius: 6,
            background: theme.colors.accent,
            color: theme.colors.background,
            border: "none",
            fontWeight: 600,
            minWidth: 110,
          }}
        >
          {isEdit ? "Save Changes" : "Add Habit"}
        </button>
      </div>
    </form>
  );
}
