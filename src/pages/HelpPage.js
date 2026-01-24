import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
import WeekDayRow from "../components/WeekDayRow"
import RingProgressGraph from "../components/RingProgressGraph"
import { motion } from "framer-motion"

export default function HelpPage() {
  const navigate = useNavigate()
  const [demoCompletions, setDemoCompletions] = useState([])
  const [demoP2Completions, setDemoP2Completions] = useState([])
  const [expandedSection, setExpandedSection] = useState(null)

  // Generate week days starting from Monday
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
  const todayString = today.toISOString().slice(0, 10)

  // Demo habit for P1
  const demoHabitP1 = {
    id: "demo-1",
    name: "Morning Workout",
    type: "P1",
    frequency: { timesPerWeek: 4 },
    completedDates: demoCompletions,
    tags: { category: [{ label: "Health" }], time: [{ label: "Morning" }] },
  }

  // Demo habit for P2
  const demoHabitP2 = {
    id: "demo-2",
    name: "Read a Book",
    type: "P2",
    frequency: { timesPerWeek: 2 },
    completedDates: demoP2Completions,
    tags: { category: [{ label: "Learning" }], time: [{ label: "Night" }] },
  }

  const toggleDemoCompletion = (day) => {
    setDemoCompletions((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const toggleP2Completion = (day) => {
    setDemoP2Completions((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const p1CompletedCount = demoCompletions.length
  const p2CompletedCount = demoP2Completions.length
  const p1Target = demoHabitP1.frequency.timesPerWeek
  const p2Target = demoHabitP2.frequency.timesPerWeek

  const dailyProgress = (p1CompletedCount / p1Target) * 100
  const weeklyProgress =
    ((p1CompletedCount + p2CompletedCount) / (p1Target + p2Target)) * 100

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.title}>How to Use Reach4</h1>
      </div>

      <div style={styles.content}>
        {/* Introduction */}
        <Section
          title="Welcome to Reach4! 🎯"
          expanded={expandedSection === 0}
          onToggle={() => setExpandedSection(expandedSection === 0 ? null : 0)}
        >
          <p style={styles.text}>
            Reach4 helps you build consistent habits with a simple, visual
            system. Track two types of habits:
          </p>
          <div style={styles.habitTypes}>
            <div style={styles.habitType}>
              <div
                style={{
                  ...styles.badge,
                  backgroundColor: theme.colors.coreColor,
                }}
              >
                P1
              </div>
              <div>
                <strong>Priority 1 (Core Habits)</strong>
                <p style={styles.smallText}>
                  Your essential daily habits. These are your non-negotiables
                  that keep you on track.
                </p>
              </div>
            </div>
            <div style={styles.habitType}>
              <div
                style={{
                  ...styles.badge,
                  backgroundColor: theme.colors.reachColor,
                }}
              >
                P2
              </div>
              <div>
                <strong>Priority 2 (Reach Goals)</strong>
                <p style={styles.smallText}>
                  Stretch goals that take you further. Optional but rewarding
                  when completed.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Interactive Progress Ring Demo */}
        <Section
          title="Understanding Your Progress Ring 💍"
          expanded={expandedSection === 1}
          onToggle={() => setExpandedSection(expandedSection === 1 ? null : 1)}
        >
          <div style={styles.ringDemo}>
            <div style={styles.ringContainer}>
              <RingProgressGraph
                dailyP1={dailyProgress}
                weeklyP1={weeklyProgress}
                p2Count={p2CompletedCount}
                size={180}
                strokeInner={12}
                strokeOuter={12}
                showNumbers={true}
              />
            </div>
            <div style={styles.ringExplanation}>
              <h4 style={styles.subheading}>
                The ring shows your progress at a glance:
              </h4>
              <ul style={styles.list}>
                <li>
                  <strong style={{ color: theme.colors.coreColor }}>
                    Inner Ring (Blue):
                  </strong>{" "}
                  Daily P1 progress
                </li>
                <li>
                  <strong style={{ color: theme.colors.completeColor }}>
                    Outer Ring (Yellow):
                  </strong>{" "}
                  Weekly overall progress
                </li>
                <li>
                  <strong>💎 Diamonds:</strong> P2 habits completed (bonus
                  points!)
                </li>
              </ul>
              <p style={styles.highlight}>
                ✨ When you hit 100% daily, the ring glows with celebration
                animation!
              </p>
            </div>
          </div>
        </Section>

        {/* Interactive Habit Tracking Demo */}
        <Section
          title="Tracking Your Habits ✅"
          expanded={expandedSection === 2}
          onToggle={() => setExpandedSection(expandedSection === 2 ? null : 2)}
        >
          <p style={styles.text}>
            Try it! Click on the week days below to mark habits as complete:
          </p>

          {/* P1 Demo */}
          <div style={styles.demoHabit}>
            <div style={styles.habitHeader}>
              <div
                style={{
                  ...styles.badge,
                  backgroundColor: theme.colors.coreColor,
                }}
              >
                P1
              </div>
              <div>
                <strong>{demoHabitP1.name}</strong>
                <p style={styles.smallText}>
                  Goal: {p1Target}x per week • Progress: {p1CompletedCount}/
                  {p1Target}
                </p>
              </div>
            </div>
            <div style={styles.weekRowContainer}>
              <div
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  const idx = Math.floor(
                    (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * 7
                  )
                  if (idx >= 0 && idx < 7) toggleDemoCompletion(weekDays[idx])
                }}
              >
                <WeekDayRow
                  weekDays={weekDays}
                  habit={demoHabitP1}
                  completed={demoCompletions}
                  n={p1Target}
                  activeDate={todayString}
                />
              </div>
            </div>
          </div>

          {/* P2 Demo */}
          <div style={styles.demoHabit}>
            <div style={styles.habitHeader}>
              <div
                style={{
                  ...styles.badge,
                  backgroundColor: theme.colors.reachColor,
                }}
              >
                P2
              </div>
              <div>
                <strong>{demoHabitP2.name}</strong>
                <p style={styles.smallText}>
                  Goal: {p2Target}x per week • Progress: {p2CompletedCount}/
                  {p2Target}
                </p>
              </div>
            </div>
            <div style={styles.weekRowContainer}>
              <div
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  const idx = Math.floor(
                    (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * 7
                  )
                  if (idx >= 0 && idx < 7) toggleP2Completion(weekDays[idx])
                }}
              >
                <WeekDayRow
                  weekDays={weekDays}
                  habit={demoHabitP2}
                  completed={demoP2Completions}
                  n={p2Target}
                  activeDate={todayString}
                />
              </div>
            </div>
          </div>

          <div style={styles.colorGuide}>
            <h4 style={styles.subheading}>Understanding the colors:</h4>
            <div style={styles.colorExamples}>
              <div style={styles.colorItem}>
                <div
                  style={{
                    ...styles.colorBox,
                    backgroundColor: theme.colors.coreColor,
                  }}
                />
                <span>P1 in progress (blue)</span>
              </div>
              <div style={styles.colorItem}>
                <div
                  style={{
                    ...styles.colorBox,
                    backgroundColor: theme.colors.reachColor,
                  }}
                />
                <span>P2 in progress (light blue)</span>
              </div>
              <div style={styles.colorItem}>
                <div
                  style={{
                    ...styles.colorBox,
                    backgroundColor: theme.colors.completeColor,
                  }}
                />
                <span>Goal completed (yellow) ✨</span>
              </div>
              <div style={styles.colorItem}>
                <div
                  style={{
                    ...styles.colorBox,
                    backgroundColor: theme.colors.incomplete,
                  }}
                />
                <span>Not yet done (gray)</span>
              </div>
            </div>
            <p style={styles.highlight}>
              💡 Once you reach your weekly goal, additional completions show
              in light blue as "reach" days!
            </p>
          </div>
        </Section>

        {/* Creating Habits */}
        <Section
          title="Creating Your First Habit 📝"
          expanded={expandedSection === 3}
          onToggle={() => setExpandedSection(expandedSection === 3 ? null : 3)}
        >
          <ol style={styles.stepList}>
            <li>
              <strong>Tap the "+" button</strong> at the top of your habit list
            </li>
            <li>
              <strong>Choose P1 or P2:</strong>
              <ul style={styles.nestedList}>
                <li>P1 for essential daily habits (workout, meditation)</li>
                <li>P2 for stretch goals (side project, learning)</li>
              </ul>
            </li>
            <li>
              <strong>Set your weekly goal:</strong> How many times per week?
              (default: 4x)
            </li>
            <li>
              <strong>Add tags (optional):</strong> Organize by category
              (Health, Work) and time (Morning, Night)
            </li>
            <li>
              <strong>Save and start tracking!</strong>
            </li>
          </ol>
        </Section>

        {/* Best Practices */}
        <Section
          title="Tips for Success 🌟"
          expanded={expandedSection === 4}
          onToggle={() => setExpandedSection(expandedSection === 4 ? null : 4)}
        >
          <div style={styles.tipsList}>
            <div style={styles.tip}>
              <span style={styles.tipIcon}>💪</span>
              <div>
                <strong>Start small</strong>
                <p style={styles.smallText}>
                  3-5 habits is ideal. Quality over quantity!
                </p>
              </div>
            </div>
            <div style={styles.tip}>
              <span style={styles.tipIcon}>🎯</span>
              <div>
                <strong>Be realistic with P1 habits</strong>
                <p style={styles.smallText}>
                  Set goals you can actually maintain. 4-5x per week allows for
                  rest days.
                </p>
              </div>
            </div>
            <div style={styles.tip}>
              <span style={styles.tipIcon}>🚀</span>
              <div>
                <strong>Use P2 for aspirational goals</strong>
                <p style={styles.smallText}>
                  These are your "reach" habits. No pressure, just bonus credit!
                </p>
              </div>
            </div>
            <div style={styles.tip}>
              <span style={styles.tipIcon}>📱</span>
              <div>
                <strong>Install as an app</strong>
                <p style={styles.smallText}>
                  Visit{" "}
                  <button
                    onClick={() => navigate("/download")}
                    style={styles.linkButton}
                  >
                    /download
                  </button>{" "}
                  for quick home screen access
                </p>
              </div>
            </div>
            <div style={styles.tip}>
              <span style={styles.tipIcon}>🔄</span>
              <div>
                <strong>Check in daily</strong>
                <p style={styles.smallText}>
                  Make it a habit to track your habits! Morning or evening
                  works best.
                </p>
              </div>
            </div>
            <div style={styles.tip}>
              <span style={styles.tipIcon}>🎨</span>
              <div>
                <strong>Use tags to organize</strong>
                <p style={styles.smallText}>
                  Group habits by category or time of day for easy viewing.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Quick Reference */}
        <Section
          title="Quick Reference 📚"
          expanded={expandedSection === 5}
          onToggle={() => setExpandedSection(expandedSection === 5 ? null : 5)}
        >
          <div style={styles.reference}>
            <h4 style={styles.subheading}>Week View:</h4>
            <ul style={styles.list}>
              <li>Tap any day square to mark complete/incomplete</li>
              <li>
                Today's date is highlighted with a{" "}
                <span style={{ color: theme.colors.accent }}>blue border</span>
              </li>
              <li>Swipe or use arrows to change weeks</li>
            </ul>

            <h4 style={styles.subheading}>Habit Actions:</h4>
            <ul style={styles.list}>
              <li>Long press or tap menu icon to edit/delete</li>
              <li>Drag to reorder (coming soon!)</li>
            </ul>

            <h4 style={styles.subheading}>Progress Tracking:</h4>
            <ul style={styles.list}>
              <li>View weekly/monthly graphs in tabs</li>
              <li>Toggle completed habits visibility with eye icon</li>
              <li>Progress resets each Monday</li>
            </ul>
          </div>
        </Section>

        {/* Get Started CTA */}
        <div style={styles.cta}>
          <h3 style={styles.ctaTitle}>Ready to build better habits?</h3>
          <button onClick={() => navigate("/")} style={styles.ctaButton}>
            Start Tracking Now →
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children, expanded, onToggle }) {
  return (
    <motion.div
      style={styles.section}
      initial={false}
      animate={{ backgroundColor: expanded ? "#f8f9fa" : "#fff" }}
    >
      <button onClick={onToggle} style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <span style={styles.expandIcon}>{expanded ? "▼" : "▶"}</span>
      </button>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={styles.sectionContent}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #eee",
    padding: "16px 20px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  backButton: {
    background: "none",
    border: "none",
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    padding: "8px 0",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: theme.colors.accent,
    margin: 0,
  },
  content: {
    maxWidth: 700,
    margin: "0 auto",
    padding: "20px",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  sectionHeader: {
    width: "100%",
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#333",
    margin: 0,
  },
  expandIcon: {
    fontSize: 14,
    color: theme.colors.accent,
  },
  sectionContent: {
    padding: "0 20px 20px",
  },
  text: {
    fontSize: 16,
    lineHeight: 1.6,
    color: "#555",
    margin: "0 0 16px 0",
  },
  habitTypes: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 16,
  },
  habitType: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  badge: {
    padding: "4px 12px",
    borderRadius: 6,
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  smallText: {
    fontSize: 14,
    color: "#777",
    margin: "4px 0 0 0",
  },
  ringDemo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    padding: "20px 0",
  },
  ringContainer: {
    padding: 20,
  },
  ringExplanation: {
    textAlign: "left",
    width: "100%",
  },
  subheading: {
    fontSize: 16,
    fontWeight: 600,
    color: "#333",
    marginBottom: 12,
  },
  list: {
    margin: "8px 0",
    paddingLeft: 24,
    lineHeight: 1.8,
    color: "#555",
  },
  highlight: {
    backgroundColor: "#FFF9E6",
    border: `2px solid ${theme.colors.completeColor}`,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  demoHabit: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    border: "2px solid #e9ecef",
  },
  habitHeader: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  weekRowContainer: {
    display: "flex",
    justifyContent: "center",
  },
  colorGuide: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  colorExamples: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
    marginTop: 12,
  },
  colorItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    border: "1px solid #ddd",
    flexShrink: 0,
  },
  stepList: {
    margin: "8px 0",
    paddingLeft: 24,
    lineHeight: 2,
    color: "#555",
  },
  nestedList: {
    marginTop: 8,
    paddingLeft: 20,
    lineHeight: 1.6,
  },
  tipsList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  tip: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  tipIcon: {
    fontSize: 28,
    flexShrink: 0,
  },
  linkButton: {
    background: "none",
    border: "none",
    color: theme.colors.accent,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
  },
  reference: {
    lineHeight: 1.8,
  },
  cta: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginTop: 24,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#333",
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: theme.colors.accent,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "14px 32px",
    fontSize: 18,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
    transition: "all 0.2s",
  },
}
