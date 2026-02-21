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
        // Use dvh (dynamic viewport height) on mobile to account for keyboard
        height: isMobile ? "100dvh" : "100vh",
        background: "rgba(0,0,0,0.18)",
        display: "flex",
        // Center on mobile to keep content in visible area when keyboard appears
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: 0,
      }}
    >
      <div
        style={{
          background: theme.colors.background,
          padding: isMobile ? "20px" : 32,
          borderRadius: isMobile ? 12 : 16,
          width: isMobile ? "calc(100% - 0px)" : "auto",
          minWidth: isMobile ? "unset" : 340,
          maxWidth: isMobile ? "calc(100% - 0px)" : 500,
          boxShadow: theme.colors.shadow,
          // Constrain height so the form can scroll within visible viewport
          maxHeight: isMobile ? "calc(100dvh - 24px)" : "90vh",
          overflowY: "auto",
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