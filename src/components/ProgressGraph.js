import React from "react";
import theme from "../styles/theme"

export default function ProgressGraph({ primaryPercentage }) {
  const totalPercentage = primaryPercentage

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: theme.colors.background,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        padding: "12px 16px",
        width: "100%",
      }}
    >
      <div
        style={{
          flexGrow: 1,
          height: 20,
          background: theme.colors.border,
          borderRadius: 10,
          overflow: "hidden",
          display: "flex",
        }}
      >
        <div
          style={{
            width: `${primaryPercentage}%`,
            background: theme.colors.p1,
          }}
        ></div>
        {/* <div
          style={{
            width: `${secondaryPercentage}%`,
            background: theme.colors.p2Below100,
          }}
        ></div> */}
      </div>
      <span
        style={{
          marginLeft: 12,
          fontWeight: 700,
          color: theme.colors.text,
        }}
      >
        {totalPercentage}%
      </span>
    </div>
  )
}