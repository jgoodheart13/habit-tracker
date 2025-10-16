// HabitForm.js
import React, { useState } from 'react';
import theme from "../styles/theme";
import { getTags, saveTag } from "../services/habitService";

export default function HabitForm({ onAdd, defaultHabit }) {
  const [habit, setHabit] = useState(
    () =>
      defaultHabit || {
        name: "",
        type: "P1",
        frequency: { daily: true, timesPerWeek: 7 },
      }
  );
  const [tags, setTags] = useState(() => {
    if (defaultHabit && defaultHabit.tags) return defaultHabit.tags;
    return { category: null, time: null };
  });
  const [tagInput, setTagInput] = useState({ label: "", type: "category" });
  const [allTags, setAllTags] = useState([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const isEdit = !!(defaultHabit && defaultHabit.id);

  // If defaultHabit changes (e.g. switching tabs), reset form
  React.useEffect(() => {
    setHabit(
      defaultHabit || {
        name: "",
        type: "P1",
        frequency: { timesPerWeek: 7 },
      }
    );
  }, [defaultHabit]);

  React.useEffect(() => {
    async function fetchTags() {
      try {
        const tags = await getTags();
        setAllTags(Array.isArray(tags) ? tags : []);
      } catch (err) {
        setAllTags([]);
      }
    }
    fetchTags();
    if (defaultHabit && defaultHabit.tags) setTags(defaultHabit.tags);
  }, [defaultHabit]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "type") {
      setHabit((h) => ({ ...h, type: value }));
    } else if (name === "name") {
      setHabit((h) => ({ ...h, name: value }));
    } else if (name === "timesPerWeek") {
      setHabit((h) => ({
        ...h,
        frequency: { ...h.frequency, timesPerWeek: value },
      }));
    }
  }

  function handleTagInputChange(e) {
    const { name, value } = e.target;
    if (name === "tagValue") {
      setTagInput((t) => ({ ...t, label: value }));
      setTagDropdownOpen(true);
    } else if (name === "tagType") {
      setTagInput((t) => ({ ...t, type: value }));
    }
  }

  function handleTagSelect(selectedTag) {
    setTags((prev) => ({ ...prev, [selectedTag.type]: selectedTag }));
    setTagInput({ label: "", type: selectedTag.type });
    setTagDropdownOpen(false);
  }

  function handleTagAdd() {
    if (tagInput.label) {
      const newTag = { label: tagInput.label, type: tagInput.type };
      setTags((prev) => ({ ...prev, [newTag.type]: newTag }));
      saveTag(newTag).then(() => {
        getTags().then((tags) => setAllTags(Array.isArray(tags) ? tags : []));
      });
      setTagInput({ label: "", type: tagInput.type });
      setTagDropdownOpen(false);
    }
  }

  function handleTagRemove(type) {
    setTags((prev) => ({ ...prev, [type]: null }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!habit.name) return;
    const habitWithTags = { ...habit, tags };
    if (isEdit) {
      onAdd(habitWithTags);
    } else {
      onAdd({ ...habitWithTags, completedDates: [] });
      setHabit(
        defaultHabit || {
          name: "",
          type: "P1",
          frequency: { timesPerWeek: 7 },
        }
      );
      setTags({ category: null, time: null });
    }
  }

  // Filter tags for dropdown (useMemo ensures UI updates when allTags or tagInput changes)
  const filteredTags = React.useMemo(() => {
    if (!Array.isArray(allTags)) return [];
    return tagInput.label
      ? allTags.filter(
          (t) =>
            t.label.toLowerCase().includes(tagInput.label.toLowerCase()) &&
            t.type === tagInput.type
        )
      : allTags.filter((t) => t.type === tagInput.type);
  }, [allTags, tagInput]);

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
      {/* Horizontal switch for P1/P2 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ fontWeight: 500, marginRight: 8 }}>Type:</label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 20,
            padding: 2,
            width: 80,
            position: "relative",
          }}
        >
          <div
            onClick={() => setHabit((h) => ({ ...h, type: "P1" }))}
            style={{
              flex: 1,
              zIndex: 2,
              textAlign: "center",
              padding: "4px 0",
              cursor: "pointer",
              color:
                habit.type === "P1"
                  ? theme.colors.background
                  : theme.colors.text,
              fontWeight: habit.type === "P1" ? 700 : 400,
              userSelect: "none",
            }}
          >
            P1
          </div>
          <div
            onClick={() => setHabit((h) => ({ ...h, type: "P2" }))}
            style={{
              flex: 1,
              zIndex: 2,
              textAlign: "center",
              padding: "4px 0",
              cursor: "pointer",
              color:
                habit.type === "P2"
                  ? theme.colors.background
                  : theme.colors.text,
              fontWeight: habit.type === "P2" ? 700 : 400,
              userSelect: "none",
            }}
          >
            P2
          </div>
          {/* Switch thumb */}
          <div
            style={{
              position: "absolute",
              top: 2,
              left: habit.type === "P1" ? 2 : 40,
              width: 38,
              height: 28,
              borderRadius: 16,
              background:
                habit.type === "P1" ? theme.colors.p1 : theme.colors.accent,
              transition: "left 0.2s",
              zIndex: 1,
            }}
          />
        </div>
      </div>
      {/* Times per week input */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ fontWeight: 500 }}>Times per week:</label>
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
            width: 60,
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            position: "relative",
          }}
        >
          <input
            name="tagValue"
            value={tagInput.label}
            onChange={handleTagInputChange}
            placeholder={`Add ${tagInput.type} tag`}
            style={{
              padding: 8,
              borderRadius: 6,
              border: `1px solid ${theme.colors.border}`,
              flex: 1,
            }}
            onFocus={() => setTagDropdownOpen(true)}
            onBlur={() => setTimeout(() => setTagDropdownOpen(false), 150)}
          />
          <select
            name="tagType"
            value={tagInput.type}
            onChange={handleTagInputChange}
            style={{
              padding: 8,
              borderRadius: 6,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <option value="category">Category</option>
            <option value="time">Time</option>
          </select>
          <button
            type="button"
            onClick={handleTagAdd}
            style={{
              padding: "8px 12px",
              marginLeft: 4,
              borderRadius: 6,
              background: theme.colors.accent,
              color: theme.colors.background,
              border: "none",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Add
          </button>
          {tagDropdownOpen && filteredTags.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 38,
                left: 0,
                right: 0,
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 6,
                boxShadow: theme.colors.shadow,
                zIndex: 10,
                maxHeight: 120,
                overflowY: "auto",
              }}
            >
              {filteredTags.map((t, idx) => (
                <div
                  key={t.label + t.type + idx}
                  onMouseDown={() => handleTagSelect(t)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    background:
                      t.label === tagInput.label
                        ? theme.colors.accent
                        : theme.colors.background,
                    color:
                      t.label === tagInput.label
                        ? theme.colors.background
                        : theme.colors.text,
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Show assigned tags as labels with remove option */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {["category", "time"].map((type) =>
            tags[type] ? (
              <span
                key={type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: theme.colors.accent,
                  color: theme.colors.background,
                  borderRadius: 12,
                  padding: "4px 10px",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <span style={{ marginRight: 6 }}>{tags[type].label}</span>
                <button
                  type="button"
                  onClick={() => handleTagRemove(type)}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.colors.background,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    marginLeft: 2,
                  }}
                >
                  ×
                </button>
              </span>
            ) : null
          )}
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
