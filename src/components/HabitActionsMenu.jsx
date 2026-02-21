export default function HabitActionsMenu({ habit, onEdit, onDelete, onPause, onResume, onClose }) {
  const isPaused = habit.frequency?.timesPerWeek === 0
  
  return (
    <div>
      <h3 style={{ fontSize: 18, marginBottom: 10 }}>{habit.name}</h3>

      <div
        style={{
          padding: "12px 0",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <button
          onClick={() => { onEdit(); onClose(); }}
          style={itemStyle}
        >
          Edit Habit
        </button>

        {isPaused ? (
          <button
            onClick={() => { onResume(); onClose(); }}
            style={itemStyle}
          >
            Resume Habit
          </button>
        ) : (
          <button
            onClick={() => { onPause(); onClose(); }}
            style={itemStyle}
          >
            Pause Habit
          </button>
        )}

        <button
          onClick={() => { onDelete(); onClose(); }}
          style={itemStyle}
        >
          Delete Habit
        </button>
      </div>
    </div>
  );
}

const itemStyle = {
  fontSize: 16,
  padding: "12px",
  textAlign: "left",
  border: "none",
  background: "transparent",
  cursor: "pointer",
};
