import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"
import RingProgressGraph from "../components/RingProgressGraph"
import WeeklyHabitRow from "../components/WeeklyHabitRow"
import { motion } from "framer-motion"

export default function HelpPage() {
  const navigate = useNavigate()
  const [expandedSection, setExpandedSection] = useState(0)

  // Demo habits state - 3 core, 2 reach
  const [habitCompletions, setHabitCompletions] = useState({
    core1: [],
    core2: [],
    core3: [],
    reach1: [],
    reach2: [],
  })

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

  // Demo habits definitions - Convert to P1/P2 for compatibility with components
  const demoHabits = [
    {
      id: "core1",
      name: "Morning Workout",
      type: "P1",
      frequency: { timesPerWeek: 4 },
      completedDates: habitCompletions.core1,
    },
    {
      id: "core2",
      name: "Meditate",
      type: "P1",
      frequency: { timesPerWeek: 5 },
      completedDates: habitCompletions.core2,
    },
    {
      id: "core3",
      name: "Read 30min",
      type: "P1",
      frequency: { timesPerWeek: 4 },
      completedDates: habitCompletions.core3,
    },
    {
      id: "reach1",
      name: "Learn Spanish",
      type: "P2",
      frequency: { timesPerWeek: 2 },
      completedDates: habitCompletions.reach1,
    },
    {
      id: "reach2",
      name: "Side Project",
      type: "P2",
      frequency: { timesPerWeek: 2 },
      completedDates: habitCompletions.reach2,
    },
  ]

  const toggleCompletion = (habitId, date) => {
    setHabitCompletions((prev) => ({
      ...prev,
      [habitId]: prev[habitId].includes(date)
        ? prev[habitId].filter((d) => d !== date)
        : [...prev[habitId], date],
    }))
  }

  // Mock handler functions for WeeklyHabitRow
  const handleComplete = (habitId, date, checked) => {
    toggleCompletion(habitId, date)
  }

  const handleDelete = () => {} // No-op for demo
  const onEdit = () => {} // No-op for demo
  const openSheet = () => {} // No-op for demo

  // Calculate progress for ring
  const coreHabits = demoHabits.filter((h) => h.type === "P1")
  const reachHabits = demoHabits.filter((h) => h.type === "P2")

  const totalCoreTarget = coreHabits.reduce(
    (sum, h) => sum + h.frequency.timesPerWeek,
    0,
  )
  const totalCoreCompleted = coreHabits.reduce(
    (sum, h) => sum + h.completedDates.length,
    0,
  )
  const totalReachCompleted = reachHabits.reduce(
    (sum, h) => sum + h.completedDates.length,
    0,
  )

  // Check if today's core habits are complete
  const todayCoreCompleted = coreHabits.filter((h) =>
    h.completedDates.includes(todayString),
  ).length
  const todayCoreTotal = coreHabits.length

  const dailyProgress = (todayCoreCompleted / todayCoreTotal) * 100
  const weeklyProgress = (totalCoreCompleted / totalCoreTarget) * 100

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ← Back
        </button>
        <h1 style={styles.titleCentered}>How to Use Reach4</h1>
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
                Core
              </div>
              <div>
                <strong>Core Habits</strong>
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
                Reach
              </div>
              <div>
                <strong>Reach Goals</strong>
                <p style={styles.smallText}>
                  Stretch goals that take you further. Optional but rewarding
                  when completed. Note: Core habits completed above your weekly
                  frequency also count as reach!
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Combined Interactive Demo */}
        <Section
          title={
            <span>
              Track Habits & Progress{" "}
              <span
                style={{ color: theme.colors.coreColor, fontSize: "1.1em" }}
              >
                ☑
              </span>
            </span>
          }
          expanded={expandedSection === 1}
          onToggle={() => setExpandedSection(expandedSection === 1 ? null : 1)}
        >
          <p style={styles.text}>
            Try it! Check off some habits below and watch the ring update in
            real-time:
          </p>

          {/* Progress Ring */}
          <div style={styles.ringContainer}>
            <RingProgressGraph
              dailyP1={dailyProgress}
              weeklyP1={weeklyProgress}
              p2Count={totalReachCompleted}
              size={180}
              strokeInner={12}
              strokeOuter={12}
              showNumbers={true}
            />
          </div>

          <div style={styles.ringExplanation}>
            <ul style={styles.list}>
              <li>
                <strong style={{ color: theme.colors.coreColor }}>
                  Inner Ring (Blue):
                </strong>{" "}
                Today's Core progress ({todayCoreCompleted}/{todayCoreTotal})
              </li>
              <li>
                <strong style={{ color: theme.colors.coreColor }}>
                  Outer Ring (Blue):
                </strong>{" "}
                This week's Core progress ({totalCoreCompleted}/
                {totalCoreTarget})
              </li>
              <li>
                <strong>💎 Diamonds:</strong> Reach habits completed (
                {totalReachCompleted})
              </li>
            </ul>
            <p style={styles.highlight}>
              ✨ Complete all your Core goals and both rings glow GOLD! Try it!
            </p>
          </div>

          {/* Demo Habits - Core */}
          <div style={styles.habitsSection}>
            <h4 style={styles.subheading}>Core Habits:</h4>
            {coreHabits.map((habit) => (
              <WeeklyHabitRow
                key={habit.id}
                habit={habit}
                activeDate={todayString}
                handleComplete={handleComplete}
                handleDelete={handleDelete}
                onEdit={onEdit}
                weekDays={weekDays}
                openSheet={openSheet}
              />
            ))}
          </div>

          {/* Demo Habits - Reach */}
          <div style={styles.habitsSection}>
            <h4 style={styles.subheading}>Reach Goals:</h4>
            {reachHabits.map((habit) => (
              <WeeklyHabitRow
                key={habit.id}
                habit={habit}
                activeDate={todayString}
                handleComplete={handleComplete}
                handleDelete={handleDelete}
                onEdit={onEdit}
                weekDays={weekDays}
                openSheet={openSheet}
              />
            ))}
          </div>

          <div style={styles.colorGuide}>
            <h4 style={styles.subheading}>Understanding the system:</h4>
            <ul style={styles.list}>
              <li>
                <strong style={{ color: theme.colors.coreColor }}>
                  Core habits (blue)
                </strong>{" "}
                power the rings - complete them daily and weekly
              </li>
              <li>
                <strong style={{ color: theme.colors.reachColor }}>
                  Reach habits (light blue)
                </strong>{" "}
                add diamonds - bonus achievements!
              </li>
              <li>
                <strong style={{ color: theme.colors.completeColor }}>
                  Gold glow
                </strong>{" "}
                = Core goals complete! 🎉
              </li>
            </ul>
          </div>
        </Section>

        {/* Creating Habits */}
        <Section
          title="Creating Your First Habit 📝"
          expanded={expandedSection === 2}
          onToggle={() => setExpandedSection(expandedSection === 2 ? null : 2)}
        >
          <ol style={styles.stepList}>
            <li>
              <strong>Tap the "+" button</strong> at the top of your habit list
            </li>
            <li>
              <strong>Choose Core or Reach:</strong>
              <ul style={styles.nestedList}>
                <li>Core for essential daily habits (workout, meditation)</li>
                <li>Reach for stretch goals (side project, learning)</li>
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
          expanded={expandedSection === 3}
          onToggle={() => setExpandedSection(expandedSection === 3 ? null : 3)}
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
                <strong>Be realistic with Core habits</strong>
                <p style={styles.smallText}>
                  Set goals you can actually maintain. 4-5x per week allows for
                  rest days.
                </p>
              </div>
            </div>
            <div style={styles.tip}>
              <span style={styles.tipIcon}>🚀</span>
              <div>
                <strong>Use Reach for aspirational goals</strong>
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
                  Make it a habit to track your habits! Morning or evening works
                  best.
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
        {/* <Section
          title="Quick Reference 📚"
          expanded={expandedSection === 4}
          onToggle={() => setExpandedSection(expandedSection === 4 ? null : 4)}
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
              <li>Tap menu icon to edit/delete</li>
            </ul>

            <h4 style={styles.subheading}>Progress Tracking:</h4>
            <ul style={styles.list}>
              <li>View weekly/monthly graphs in tabs</li>
              <li>Toggle completed habits visibility with eye icon</li>
              <li>Progress resets each Monday</li>
            </ul>
          </div>
        </Section> */}

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
        <span style={styles.expandIcon}>{expanded ? "▼" : "▶"}</span>
        <h2 style={styles.sectionTitle}>{title}</h2>
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
  titleCentered: {
    fontSize: 28,
    fontWeight: 800,
    color: theme.colors.accent,
    margin: "0 auto",
    textAlign: "center",
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
    alignItems: "center",
    gap: 12,
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
    flex: 1,
    textAlign: "center",
  },
  expandIcon: {
    fontSize: 14,
    color: theme.colors.accent,
  },
  sectionContent: {
    padding: "0 10px 20px",
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
  ringContainer: {
    padding: 20,
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 20,
  },
  ringExplanation: {
    textAlign: "left",
    width: "100%",
    marginBottom: 20,
  },
  habitsSection: {
    marginTop: 20,
    marginBottom: 20,
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
  colorGuide: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
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
