import React from "react";
import theme from "../styles/theme";

const { rowHeight } = theme

export default function DateChanger({
  activeDate,
  changeDate,
  setActiveDate,
  activeTab,
}) {
  const isWeekly = activeTab === "weekly"
  const todayDay = new Date().getDate()

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 2fr 1fr 1fr",
        height: rowHeight,
        background: theme.colors.background,
        borderBottom: `1px solid ${theme.colors.border}`,
        alignItems: "center",
      }}
    >
      {/* SLOT 1 — empty placeholder (reserve symmetry for Today button) */}
      <div />

      {/* SLOT 2 — left arrow cluster */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        {isWeekly && (
          <button style={buttonStyle} onClick={() => changeDate(-7)}>
            &#171;
          </button>
        )}
        <button style={buttonStyle} onClick={() => changeDate(-1)}>
          &larr;
        </button>
      </div>

      {/* SLOT 3 — centered date */}
      <div
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 20,
        }}
      >
        {activeDate === new Date().toLocaleDateString("en-CA")
          ? "Today"
          : activeDate}
      </div>

      {/* SLOT 4 — right arrow cluster */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <button style={buttonStyle} onClick={() => changeDate(1)}>
          &rarr;
        </button>
        {isWeekly && (
          <button style={buttonStyle} onClick={() => changeDate(7)}>
            &#187;
          </button>
        )}
      </div>

      {/* SLOT 5 — Today button */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => setActiveDate(new Date().toLocaleDateString("en-CA"))}
          title="Go to Today"
          style={buttonStyle}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="19" rx="2" fill="#fff" stroke="#ddd" strokeWidth="1.5"/>
              <rect x="2" y="3" width="20" height="7" rx="2" fill={theme.colors.accent}/>
              <rect x="2" y="7" width="20" height="3" fill={theme.colors.accent}/>
              <text x="12" y="17" textAnchor="middle" fontSize="9" fontWeight="700" fill={theme.colors.text}>
                {todayDay}
              </text>
            </svg>
        </button>
      </div>
    </div>
  )
}

const buttonStyle = {
  fontSize: 18,
  border: "none",
  background: theme.colors.background,
  color: theme.colors.text,
  cursor: "pointer",
  height: "100%",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}
