import theme from "../styles/theme";
import HabitForm from "./HabitForm";
import { DEFAULT_FREQUENCY_TIMES_PER_WEEK } from "../constants/habitDefaults"
import { isMobile } from "react-device-detect"

export default function HabitModal({ show, onClose, onAdd, onEdit, habit }) {
  if (!show) return null

  const isEditMode = !!habit
  const modalTitle = isEditMode ? "Edit Habit" : "Add Habit"

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.18)",
        display: "flex",
        // On mobile, the on-screen keyboard can cover focused inputs.
        // Top-align + allow scrolling so users can bring inputs into view.
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "center",
        zIndex: 1000,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: isMobile ? "24px 12px" : 0,
      }}
    >
      <div
        style={{
          background: theme.colors.background,
          padding: 32,
          borderRadius: 16,
          minWidth: 340,
          boxShadow: theme.colors.shadow,
          // Constrain height so the form can scroll within the viewport on mobile.
          maxHeight: isMobile ? "calc(100vh - 48px)" : undefined,
          overflowY: isMobile ? "auto" : undefined,
        }}
      >
        <h2
          style={{
            marginBottom: 18,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          {modalTitle}
        </h2>
        <HabitForm
          onAdd={(updatedHabit) => {
            onAdd(updatedHabit)
            onClose()
          }}
          onEdit={(updatedHabit) => {
            onEdit(updatedHabit)
            onClose()
          }}
          onClose={onClose}
          existingHabit={
            habit || {
              name: "",
              type: "P1",
              frequency: { timesPerWeek: DEFAULT_FREQUENCY_TIMES_PER_WEEK },
            }
          }
        />
      </div>
    </div>
  )
}