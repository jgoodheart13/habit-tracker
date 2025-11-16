import theme from "../styles/theme";
import HabitForm from "./HabitForm";

export default function HabitModal({ show, onClose, onAdd, onEdit, habit }) {
  if (!show) return null;

  const isEditMode = !!habit;
  const modalTitle = isEditMode ? "Edit Habit" : "Add Habit";

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
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: theme.colors.background,
          padding: 32,
          borderRadius: 16,
          minWidth: 340,
          boxShadow: theme.colors.shadow,
          border: `1px solid ${theme.colors.border}`,
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
            habit || { name: "", type: "P1", frequency: { timesPerWeek: 7 } }
          }
        />
      </div>
    </div>
  )
}