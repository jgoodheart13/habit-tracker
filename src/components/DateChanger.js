import React from "react";
import theme from "../styles/theme";

export default function DateChanger({ activeDate, changeDate, setActiveDate }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 16px",
        background: theme.colors.background,
        borderBottom: `1px solid ${theme.colors.border}`,
        height: "60px", // Ensure sufficient height for vertical centering
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => changeDate(-7)}
          style={{
            fontSize: 16,
            padding: "4px 8px",
            borderRadius: 4,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            color: theme.colors.text,
            cursor: "pointer",
          }}
        >
          &#171;
        </button>
        <button
          onClick={() => changeDate(-1)}
          style={{
            fontSize: 16,
            padding: "4px 8px",
            borderRadius: 4,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            color: theme.colors.text,
            cursor: "pointer",
          }}
        >
          &larr;
        </button>
        <span
          style={{
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            color: theme.colors.text,
          }}
        >
          {activeDate === new Date().toLocaleDateString("en-CA")
            ? "Today"
            : activeDate}
        </span>
        <button
          onClick={() => changeDate(1)}
          style={{
            fontSize: 16,
            padding: "4px 8px",
            borderRadius: 4,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            color: theme.colors.text,
            cursor: "pointer",
          }}
        >
          &rarr;
        </button>
        <button
          onClick={() => changeDate(7)}
          style={{
            fontSize: 16,
            padding: "4px 8px",
            borderRadius: 4,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            color: theme.colors.text,
            cursor: "pointer",
          }}
        >
          &#187;
        </button>
        <button
          onClick={() => setActiveDate(new Date().toLocaleDateString("en-CA"))}
          title="Go to Today"
          style={{
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "50%",
            padding: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            role="img"
            aria-label="clock"
            style={{ fontSize: 16, color: theme.colors.text }}
          >
            &#128337;
          </span>
        </button>
      </div>
    </div>
  );
}