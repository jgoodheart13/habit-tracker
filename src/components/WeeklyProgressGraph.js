import React, { useState } from "react"
import ProgressVisualizationContainer from "./progress/ProgressVisualizationContainer"
import theme from "../styles/theme"

export default function WeeklyProgressGraph({
  habits,
  activeWeekRange,
  activeDate,
}) {
  // Toggle between visualization types
  const [visualizationType, setVisualizationType] = useState(
    localStorage.getItem('progressVisualization') || 'ring'
  );
  
  const handleVisualizationToggle = () => {
    const newType = visualizationType === 'ring' ? 'coinPusher' : 'ring';
    setVisualizationType(newType);
    localStorage.setItem('progressVisualization', newType);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: 8,
      }}
    >
      {/* Visualization Toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleVisualizationToggle}
          style={{
            padding: "4px 12px",
            fontSize: 12,
            cursor: "pointer",
            backgroundColor: theme.colors.primary,
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          {visualizationType === 'ring' ? '🎰 Coin Pusher' : '⭕ Ring View'}
        </button>
      </div>

      {/* Visualization Container */}
      <ProgressVisualizationContainer
        habits={habits}
        activeDate={activeDate}
        activeWeekRange={activeWeekRange}
        visualizationType={visualizationType}
      />
    </div>
  )
}
