import React, { useState, useMemo, useEffect } from "react"
import { useWeekGuard } from "../contexts/WeekGuardContext"
import { calculateWeekTotals } from "../utils/weekTotalsCalculator"
import theme from "../styles/theme"
import BottomSheet from "./BottomSheet"

function useMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 640px)").matches,
  )
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isMobile
}

/**
 * Minimal modal for week lock-in confirmation
 * Shows pending week info and allows user to confirm or cancel.
 * On mobile renders as a bottom sheet; on desktop as a centered overlay.
 */
export default function LockModal() {
  const { isLockModalOpen, serverPendingInfo, lockIn, startReview } =
    useWeekGuard()
  const [isLocking, setIsLocking] = useState(false)
  const isMobile = useMobile()

  // Calculate totals from habits and weekDays
  const totals = useMemo(() => {
    if (!serverPendingInfo?.habits || !serverPendingInfo?.weekDays) {
      return null
    }
    return calculateWeekTotals(
      serverPendingInfo.habits,
      serverPendingInfo.weekDays,
    )
  }, [serverPendingInfo])

  if (!isLockModalOpen) return null

  const handleConfirm = async () => {
    setIsLocking(true)
    try {
      await lockIn()
    } catch (error) {
      console.error("Lock failed:", error)
      alert("Failed to lock week. Please try again.")
    } finally {
      setIsLocking(false)
    }
  }

  const handleReview = () => {
    startReview()
  }

  const modalContent = (
    <>
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
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Previous Week Summary
          </div>
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
    </>
  )

  if (isMobile) {
    return (
      <BottomSheet isOpen={isLockModalOpen} onClose={handleReview}>
        {modalContent}
      </BottomSheet>
    )
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 20,
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
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        {modalContent}
      </div>
    </div>
  )
}
