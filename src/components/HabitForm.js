// HabitForm.js
import React, { useEffect, useState } from "react"
import theme from "../styles/theme"
import { getTags, saveTag } from "../services/habitService"

export default function HabitForm({ onAdd, onEdit, existingHabit, onClose }) {
  const [habit, setHabit] = useState(
    () =>
      existingHabit || {
        name: "",
        type: "P1",
        frequency: { daily: true, timesPerWeek: 7 },
      }
  )
  const [tags, setTags] = useState(() => {
    if (habit && habit.tags) return habit.tags
    return { category: null, time: null }
  })
  const [tagInput, setTagInput] = useState({ label: "", type: "category" })
  const [allTags, setAllTags] = useState([])
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)

  const isEdit = habit && habit.id

  // If habit changes (e.g. switching tabs), reset form
  React.useEffect(() => {
    setHabit(
      habit || {
        name: "",
        type: "P1",
        frequency: { timesPerWeek: 7 },
      }
    )
  }, [habit])

  useEffect(() => {
    async function fetchTags() {
      try {
        const tags = await getTags()
        setAllTags(Array.isArray(tags) ? tags : [])
      } catch (err) {
        setAllTags([])
      }
    }
    fetchTags()
  }, [])


  function handleChange(e) {
    const { name, value } = e.target
    if (name === "type") {
      setHabit((h) => ({ ...h, type: value }))
    } else if (name === "name") {
      setHabit((h) => ({ ...h, name: value }))
    } else if (name === "timesPerWeek") {
      setHabit((h) => ({
        ...h,
        frequency: { ...h.frequency, timesPerWeek: value },
      }))
    }
  }

  function incrementTimesPerWeek() {
    setHabit((h) => ({
      ...h,
      frequency: {
        ...h.frequency,
        timesPerWeek: Math.min(7, (h.frequency.timesPerWeek || 0) + 1),
      },
    }))
  }

  function decrementTimesPerWeek() {
    setHabit((h) => ({
      ...h,
      frequency: {
        ...h.frequency,
        timesPerWeek: Math.max(1, (h.frequency.timesPerWeek || 0) - 1),
      },
    }))
  }

  function handleTagInputChange(e) {
    const { name, value } = e.target
    if (name === "tagValue") {
      setTagInput((t) => ({ ...t, label: value }))
      setTagDropdownOpen(true)
    } else if (name === "tagType") {
      setTagInput((t) => ({ ...t, type: value }))
    }
  }

  function handleTagSelect(selectedTag) {
    setTags((prev) => {
      const updatedTags = { ...prev }
      if (!Array.isArray(updatedTags[selectedTag.type])) {
        updatedTags[selectedTag.type] = []
      }
      if (
        !updatedTags[selectedTag.type].some(
          (tag) => tag.label === selectedTag.label
        )
      ) {
        updatedTags[selectedTag.type].push(selectedTag)
      }
      return updatedTags
    })
    setTagInput({ label: "", type: selectedTag.type })
    setTagDropdownOpen(false)
  }

  function handleTagAdd() {
    if (tagInput.label) {
      const newTag = { label: tagInput.label, type: tagInput.type }
      setTags((prev) => {
        const updatedTags = { ...prev }
        if (!Array.isArray(updatedTags[newTag.type])) {
          updatedTags[newTag.type] = []
        }
        // Add the new tag to the array if it doesn't already exist
        if (
          !updatedTags[newTag.type].some((tag) => tag.label === newTag.label)
        ) {
          updatedTags[newTag.type].push(newTag)
        }
        return updatedTags
      })
      saveTag(newTag).then(() => {
        getTags().then((tags) => setAllTags(Array.isArray(tags) ? tags : []))
      })
      setTagInput({ label: "", type: tagInput.type })
      setTagDropdownOpen(false)
    }
  }

  function handleTagRemove(type, label) {
    setTags((prev) => {
      const updatedTags = { ...prev }
      if (updatedTags[type]) {
        updatedTags[type] = updatedTags[type].filter(
          (tag) => tag.label !== label
        )
        if (updatedTags[type].length === 0) {
          delete updatedTags[type]
        }
      }
      return updatedTags
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!habit.name) return
    const habitWithTags = { ...habit, tags }
    if (isEdit) {
      onEdit(habitWithTags)
    } else {
      onAdd({ ...habitWithTags, completedDates: [] })
      setHabit(
        habit || {
          name: "",
          type: "P1",
          frequency: { timesPerWeek: 7 },
        }
      )
      setTags({ category: null, time: null })
    }
  }

  // Filter tags for dropdown (useMemo ensures UI updates when allTags or tagInput changes)
  const filteredTags = React.useMemo(() => {
    if (!Array.isArray(allTags)) return []
    return tagInput.label
      ? allTags.filter(
          (t) =>
            t.label.toLowerCase().includes(tagInput.label.toLowerCase()) &&
            t.type === tagInput.type
        )
      : allTags.filter((t) => t.type === tagInput.type)
  }, [allTags, tagInput])

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
          fontSize: 16,
        }}
      />
      {/* Horizontal switch for Core/Reach */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* <label style={{ fontWeight: 500, marginRight: 8 }}>Type:</label> */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 20,
            padding: 2,
            width: 100,
            gap: 8,
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
            Core
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
            Reach
          </div>
          {/* Switch thumb */}
          <div
            style={{
              position: "absolute",
              top: 2,
              left: habit.type === "P1" ? 2 : 52,
              width: 42,
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={decrementTimesPerWeek}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            cursor: "pointer",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          −
        </button>
        <span style={{ fontWeight: 500, minWidth: 140, textAlign: "center" }}>
          {habit.frequency.timesPerWeek} times per week
        </span>
        <button
          type="button"
          onClick={incrementTimesPerWeek}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            cursor: "pointer",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          +
        </button>
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
              fontSize: 16,
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
              fontSize: 16,
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
              {filteredTags?.map((t, idx) => (
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
          {Object.keys(tags).map((type) =>
            tags[type]?.map((tag) => (
              <span
                key={`${type}-${tag.label}`}
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
                <span style={{ marginRight: 6 }}>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => handleTagRemove(type, tag.label)}
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
            ))
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
          onClick={onClose}
          style={{
            background: theme.colors.incomplete,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            padding: "8px 18px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: 10,
            borderRadius: 6,
            background: theme.colors.accent,
            color: theme.colors.background,
            border: "none",
            fontWeight: 600,
            // minWidth: 110,
          }}
        >
          {"Save"}
        </button>
      </div>
    </form>
  )
}
