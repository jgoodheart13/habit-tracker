// HabitForm.js
import React, { useEffect, useState } from "react"
import theme from "../styles/theme"
import { getTags, saveTag } from "../services/habitService"
import { DEFAULT_FREQUENCY_TIMES_PER_WEEK } from "../constants/habitDefaults"

export default function HabitForm({ onAdd, onEdit, existingHabit, onClose }) {
  const [habit, setHabit] = useState(
    () =>
      existingHabit || {
        name: "",
        type: "P1",
        frequency: { timesPerWeek: DEFAULT_FREQUENCY_TIMES_PER_WEEK },
      }
  )
  const [isNameFocused, setIsNameFocused] = useState(false)
  const [isSliderDragging, setIsSliderDragging] = useState(false)
  const [isTagFocused, setIsTagFocused] = useState(false)
  const nameInputRef = React.useRef(null)
  const [tags, setTags] = useState(() => {
    if (habit && habit.tags) return habit.tags
    return { category: null, time: null }
  })
  const [tagInput, setTagInput] = useState({ label: "", type: "category" })
  const [allTags, setAllTags] = useState([])
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState(() => {
    // Initialize from existing habit tags
    if (existingHabit?.tags?.time && Array.isArray(existingHabit.tags.time)) {
      const timeTag = existingHabit.tags.time[0]?.label?.toLowerCase()
      if (["morning", "afternoon", "night"].includes(timeTag)) {
        return timeTag
      }
    }
    return "unspecified"
  })

  const isEdit = habit && habit.id

  // If habit changes (e.g. switching tabs), reset form
  React.useEffect(() => {
    setHabit(
      habit || {
        name: "",
        type: "P1",
        frequency: { timesPerWeek: DEFAULT_FREQUENCY_TIMES_PER_WEEK },
      },
    )
    // Reset time of day when habit changes
    if (habit?.tags?.time && Array.isArray(habit.tags.time)) {
      const timeTag = habit.tags.time[0]?.label?.toLowerCase()
      if (["morning", "afternoon", "night"].includes(timeTag)) {
        setTimeOfDay(timeTag)
      } else {
        setTimeOfDay("unspecified")
      }
    } else {
      setTimeOfDay("unspecified")
    }
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
          (tag) => tag.label === selectedTag.label,
        )
      ) {
        updatedTags[selectedTag.type].push(selectedTag)
      }
      return updatedTags
    })
    setTagInput({ label: "", type: selectedTag.type })
    setTagDropdownOpen(false)
    setShowTagInput(false)
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
      setShowTagInput(false)
    }
  }

  function handleTagRemove(type, label) {
    setTags((prev) => {
      const updatedTags = { ...prev }
      if (updatedTags[type]) {
        updatedTags[type] = updatedTags[type].filter(
          (tag) => tag.label !== label,
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

    // Merge timeOfDay into tags
    const finalTags = { ...tags }
    if (timeOfDay !== "unspecified") {
      finalTags.time = [
        {
          label: timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1),
          type: "time",
        },
      ]
    } else {
      delete finalTags.time
    }

    const habitWithTags = { ...habit, tags: finalTags }
    if (isEdit) {
      onEdit(habitWithTags)
    } else {
      onAdd({ ...habitWithTags, completedDates: [] })
      setHabit(
        habit || {
          name: "",
          type: "P1",
          frequency: { timesPerWeek: DEFAULT_FREQUENCY_TIMES_PER_WEEK },
        },
      )
      setTags({ category: null, time: null })
      setTimeOfDay("unspecified")
    }
  }

  // Filter tags for dropdown (useMemo ensures UI updates when allTags or tagInput changes)
  const filteredTags = React.useMemo(() => {
    if (!Array.isArray(allTags)) return []

    const selectedForType = Array.isArray(tags?.[tagInput.type])
      ? tags[tagInput.type]
      : []
    const selectedLabels = new Set(
      selectedForType
        .map((t) => (t?.label || "").toLowerCase())
        .filter(Boolean),
    )

    return tagInput.label
      ? allTags.filter(
          (t) =>
            t.label.toLowerCase().includes(tagInput.label.toLowerCase()) &&
            t.type === tagInput.type &&
            !selectedLabels.has(t.label.toLowerCase()),
        )
      : allTags.filter(
          (t) =>
            t.type === tagInput.type &&
            !selectedLabels.has(t.label.toLowerCase()),
        )
  }, [allTags, tagInput, tags])

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: "transparent",
        padding: 16,
        borderRadius: 12,
        boxShadow: "none",
      }}
    >
      <input
        ref={nameInputRef}
        name="name"
        value={habit.name}
        onChange={handleChange}
        onFocus={() => setIsNameFocused(true)}
        onBlur={() => setIsNameFocused(false)}
        placeholder="Habit name..."
        required
        autoFocus
        autoComplete="off"
        style={{
          padding: 8,
          borderRadius: 6,
          border: "none",
          background: theme.colors.incomplete,
          fontSize: 16,
          fontWeight: 600,
          boxShadow: isNameFocused
            ? `0 0 0 3px ${theme.colors.accent}40`
            : "none",
          transition: "box-shadow 0.2s ease",
          color: theme.colors.text,
        }}
        className="habit-name-input"
      />
      {/* Mode selector for Core/Reach */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          opacity: habit.name ? 1 : 0.4,
          transition: "opacity 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={() => setHabit((h) => ({ ...h, type: "P1" }))}
            style={{
              padding: "10px 24px",
              borderRadius: 9999,
              border: `2px solid ${
                habit.type === "P1"
                  ? theme.colors.coreColor
                  : theme.colors.border
              }`,
              background:
                habit.type === "P1" ? theme.colors.coreColor : "transparent",
              color:
                habit.type === "P1"
                  ? theme.colors.background
                  : theme.colors.text,
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              userSelect: "none",
              opacity: habit.type === "P1" ? 1 : 0.6,
              boxShadow:
                habit.type === "P1"
                  ? `0 2px 8px ${theme.colors.coreColor}30, inset 0 1px 2px ${theme.colors.coreColor}40`
                  : "none",
              transition: "all 0.2s ease",
            }}
          >
            Core
          </button>
          <button
            type="button"
            onClick={() => setHabit((h) => ({ ...h, type: "P2" }))}
            style={{
              padding: "10px 24px",
              borderRadius: 9999,
              border: `2px solid ${
                habit.type === "P2"
                  ? theme.colors.reachColor
                  : theme.colors.border
              }`,
              background:
                habit.type === "P2" ? theme.colors.reachColor : "transparent",
              color:
                habit.type === "P2" ? theme.colors.text : theme.colors.text,
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              userSelect: "none",
              opacity: habit.type === "P2" ? 1 : 0.6,
              boxShadow:
                habit.type === "P2"
                  ? `0 2px 8px ${theme.colors.reachColor}30, inset 0 1px 2px ${theme.colors.reachColor}40`
                  : "none",
              transition: "all 0.2s ease",
            }}
          >
            Reach
          </button>
        </div>
        <div
          key={habit.type}
          style={{
            textAlign: "center",
            fontSize: 13,
            color: theme.colors.text,
            opacity: 0.7,
            fontStyle: "italic",
            animation: "fadeSlideIn 0.3s ease",
          }}
        >
          {habit.type === "P1" ? "Build consistency" : "Push your limits"}
        </div>
      </div>
      {/* Frequency slider (Core only) */}
      {habit.type !== "P2" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            opacity: habit.name ? 1 : 0.4,
            transition: "opacity 0.2s ease",
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: 15,
              fontWeight: 600,
              color: theme.colors.text,
            }}
          >
            {habit.frequency.timesPerWeek === 7
              ? "Every day"
              : `${habit.frequency.timesPerWeek}x / week`}
          </div>
          <input
            type="range"
            min="1"
            max="7"
            step="1"
            value={habit.frequency.timesPerWeek}
            onChange={(e) =>
              setHabit((h) => ({
                ...h,
                frequency: {
                  ...h.frequency,
                  timesPerWeek: parseInt(e.target.value),
                },
              }))
            }
            onMouseDown={() => setIsSliderDragging(true)}
            onMouseUp={() => setIsSliderDragging(false)}
            onTouchStart={() => setIsSliderDragging(true)}
            onTouchEnd={() => setIsSliderDragging(false)}
            className={`frequency-slider ${isSliderDragging ? "dragging" : ""}`}
            style={{
              width: "100%",
              cursor: "pointer",
            }}
          />
        </div>
      )}
      {/* Time of Day Slider */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          opacity: habit.name ? 1 : 0.4,
          transition: "opacity 0.2s ease",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 15,
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          {timeOfDay === "unspecified"
            ? "Anytime"
            : timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
        </div>
        <div style={{ position: "relative", paddingTop: 8, paddingBottom: 16 }}>
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={
              timeOfDay === "unspecified"
                ? 0
                : timeOfDay === "morning"
                  ? 1
                  : timeOfDay === "afternoon"
                    ? 2
                    : 3
            }
            onChange={(e) => {
              const value = parseInt(e.target.value)
              const timeMap = ["unspecified", "morning", "afternoon", "night"]
              setTimeOfDay(timeMap[value])
            }}
            className="time-slider"
            style={{
              width: "100%",
              cursor: "pointer",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 16,
              color: theme.colors.text,
              opacity: 0.5,
              marginTop: 4,
              paddingLeft: 4,
              paddingRight: 4,
            }}
          >
            <span>Any</span>
            <span>🌅</span>
            <span>☀️</span>
            <span>🌙</span>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          opacity: habit.name ? 1 : 0.4,
          transition: "opacity 0.2s ease",
        }}
      >
        {!showTagInput ? (
          <button
            type="button"
            onClick={() => {
              setTagInput((t) => ({ ...t, type: "category" }))
              setShowTagInput(true)
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background: theme.colors.incomplete,
              color: theme.colors.text,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              opacity: 0.8,
              transition: "opacity 0.2s ease",
              alignSelf: "flex-start",
            }}
          >
            + Add category
          </button>
        ) : (
          <div
            className="tag-input-container"
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
              placeholder="Add category"
              autoComplete="off"
              autoFocus
              style={{
                padding: 8,
                borderRadius: 6,
                border: "none",
                background: theme.colors.incomplete,
                flex: 1,
                fontSize: 16,
                boxShadow: isTagFocused
                  ? `0 0 0 3px ${theme.colors.accent}40`
                  : "none",
                transition: "box-shadow 0.2s ease",
              }}
              onFocus={() => {
                setIsTagFocused(true)
                setTagDropdownOpen(true)
              }}
              onBlur={() => {
                setIsTagFocused(false)
                setTimeout(() => setTagDropdownOpen(false), 150)
              }}
            />
            <button
              type="button"
              onClick={handleTagAdd}
              style={{
                padding: "8px 12px",
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
            <button
              type="button"
              onClick={() => {
                setShowTagInput(false)
                setTagInput((t) => ({ ...t, label: "", type: "category" }))
                setTagDropdownOpen(false)
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: theme.colors.incomplete,
                color: theme.colors.text,
                border: "none",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            {tagDropdownOpen && filteredTags.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 38,
                  left: 0,
                  right: 0,
                  background: theme.colors.background,
                  border: "none",
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
        )}
        {/* Show assigned tags as labels with remove option */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 4,
            flexWrap: "wrap",
          }}
        >
          {Object.keys(tags)
            .filter((type) => type !== "time")
            .map((type) =>
              tags[type]?.map((tag) => (
                <span
                  key={`${type}-${tag.label}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: theme.colors.accent,
                    color: theme.colors.background,
                    borderRadius: 12,
                    padding: "3px 8px",
                    fontSize: 13,
                    fontWeight: 500,
                    animation: "tagPillIn 0.18s ease",
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
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              )),
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
            border: "none",
            padding: "8px 18px",
            cursor: "pointer",
            fontWeight: 600,
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
            opacity: habit.name ? 1 : 0.4,
            transition: "opacity 0.2s ease",
            // minWidth: 110,
          }}
        >
          {"Save"}
        </button>
      </div>
    </form>
  )
}
