import React, { useState, useMemo } from "react"
import { useWeekGuard } from "../contexts/WeekGuardContext"
import { calculateWeekTotals } from "../utils/weekTotalsCalculator"
import theme from "../styles/theme"
import { isMobile } from "react-device-detect"

export default function LockModal() {
  const { isLockModalOpen, serverPendingInfo, lockIn, startReview } =
    useWeekGuard()
  const [isLocking, setIsLocking] = useState(false)

  const totals = useMemo(() => {
    if (!serverPendingInfo?.habits || !serverPendingInfo?.weekDays) {
      return null
    }
    return calculateWeekTotals(
      serverPendingInfo.habits,
      serverPendingInfo.weekDays,
    )
  }, [serverPendingInfo])

  const weekRange = useMemo(() => {
    if (!serverPendingInfo?.weekDays?.length) return null
    const fmt = (s) =>
      new Date(s + "T00:00:00Z").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })
    const end = serverPendingInfo.weekDays[6]
    const year = new Date(end + "T00:00:00Z").getUTCFullYear()
    return `${fmt(serverPendingInfo.weekDays[0])} – ${fmt(end)}, ${year}`
  }, [serverPendingInfo])

  if (!isLockModalOpen) return null

  const handleConfirm = async () => {
    setIsLocking(true)
    try {
      await lockIn()
    } catch (error) {
      alert("Failed to lock week. Please try again.")
    } finally {
      setIsLocking(false)
    }
  }

  const handleReview = () => {
    startReview()
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: isMobile ? "100dvh" : "100vh",
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: isMobile ? 0 : 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLocking) {
          handleReview()
        }
      }}
    >
      <div
        style={{
          background: theme.colors.background,
          borderRadius: isMobile ? 12 : 12,
          padding: isMobile ? "20px" : 24,
          width: isMobile ? "calc(100% - 0px)" : "100%",
          maxWidth: isMobile ? "calc(100% - 0px)" : 400,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          maxHeight: isMobile ? "calc(100dvh - 24px)" : "90vh",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            margin: "0 0 16px 0",
            fontSize: 20,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          New Week Started
        </h2>

        <p
          style={{
            margin: "0 0 20px 0",
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 1.5,
          }}
        >
          A new week has begun. Confirm to lock in your previous week's progress
          and start fresh.
        </p>

        {totals && (
          <div
            style={{
              background: theme.colors.cardBackground,
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Previous Week Summary
            </div>
            {weekRange && (
              <div
                style={{
                  fontSize: 13,
                  color: theme.colors.text,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {weekRange}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: theme.colors.text, fontSize: 14 }}>
                  Core Completions:
                </span>
                <span
                  style={{
                    color: theme.colors.coreColor,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {totals.coreCompletions}
                  {totals.coreTotal ? ` / ${totals.coreTotal}` : ""}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: theme.colors.text, fontSize: 14 }}>
                  Reach Completions:
                </span>
                <span
                  style={{
                    color: theme.colors.reachColor,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {totals.reachCompletions}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: theme.colors.text, fontSize: 14 }}>
                  Total XP:
                </span>
                <span
                  style={{
                    color: theme.colors.completeColor,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {totals.totalXP}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={handleReview}
            disabled={isLocking}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
              border: `1px solid ${theme.colors.border}`,
              background: "transparent",
              color: theme.colors.text,
              cursor: isLocking ? "not-allowed" : "pointer",
              opacity: isLocking ? 0.5 : 1,
            }}
          >
            Review Week
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLocking}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
              border: "none",
              background: theme.colors.accent,
              color: "#fff",
              cursor: isLocking ? "not-allowed" : "pointer",
              opacity: isLocking ? 0.7 : 1,
            }}
          >
            {isLocking ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  )
}
