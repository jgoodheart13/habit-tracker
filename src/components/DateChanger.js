import React from "react";
import theme from "../styles/theme";

const { rowHeight } = theme // Destructure rowHeight for use

export default function DateChanger({
  activeDate,
  changeDate,
  setActiveDate,
  activeTab,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between", // Spread buttons across the row
        alignItems: "center",
        padding: "0", // Remove padding for full height
        background: theme.colors.background,
        borderBottom: `1px solid ${theme.colors.border}`,
        height: rowHeight, // Use centralized row height
      }}
    >
      {activeTab === "weekly" && (
        <button
          onClick={() => changeDate(-7)}
          style={{
            flex: 1, // Make buttons take equal width
            height: "100%", // Full height for the button
            fontSize: 18, // Larger font for better tap targets
            border: "none", // Remove border for seamless look
            background: theme.colors.background,
            color: theme.colors.text,
            cursor: "pointer",
          }}
        >
          &#171;
        </button>
      )}
      {activeTab === "daily" && (
        <button
          onClick={() => changeDate(-1)}
          style={{
            flex: 1,
            height: "100%",
            fontSize: 18,
            border: "none",
            background: theme.colors.background,
            color: theme.colors.text,
            cursor: "pointer",
          }}
        >
          &larr;
        </button>
      )}
      <span
        style={{
          flex: 2, // Make the date span larger for emphasis
          textAlign: "center",
          fontWeight: 700,
          fontSize: 18,
          color: theme.colors.text,
        }}
      >
        {activeDate === new Date().toLocaleDateString("en-CA")
          ? "Today"
          : activeDate}
      </span>
      {activeTab === "daily" && (
        <button
          onClick={() => changeDate(1)}
          style={{
            flex: 1,
            height: "100%",
            fontSize: 18,
            border: "none",
            background: theme.colors.background,
            color: theme.colors.text,
            cursor: "pointer",
          }}
        >
          &rarr;
        </button>
      )}
      {activeTab === "weekly" && (
        <button
          onClick={() => changeDate(7)}
          style={{
            flex: 1,
            height: "100%",
            fontSize: 18,
            border: "none",
            background: theme.colors.background,
            color: theme.colors.text,
            cursor: "pointer",
          }}
        >
          &#187;
        </button>
      )}
      <button
        onClick={() => setActiveDate(new Date().toLocaleDateString("en-CA"))}
        title="Go to Today"
        style={{
          flex: 1,
          height: "100%",
          fontSize: 18,
          border: "none",
          background: theme.colors.background,
          color: theme.colors.text,
          cursor: "pointer",
        }}
      >
        &#128337;
      </button>
    </div>
  )
}