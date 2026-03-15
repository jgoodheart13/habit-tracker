import { useState, useMemo } from "react"
import "./SettingsModal.css"
import { useSettings } from "../contexts/SettingsContext"
import { useUserContext } from "../contexts/UserContext"
import { useWeekGuard } from "../contexts/WeekGuardContext"
import { updateUserPreferences } from "../api/userApi"
import { clearWeekStateCache } from "../utils/weekStateCache"

export default function SettingsModal({ onClose }) {
  const { settings, updateSetting } = useSettings()
  const { user, refetchUser } = useUserContext()
  const { needsLock, pendingWeekStart } = useWeekGuard()
  const [confirmingSwitch, setConfirmingSwitch] = useState(null)

  const weekStartDay = user?.preferences?.weekStartDay ?? "monday"

  const forfeitRange = useMemo(() => {
    if (!pendingWeekStart) return null
    const start = new Date(pendingWeekStart + "T12:00:00")
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    return `${fmt(start)} – ${fmt(end)}`
  }, [pendingWeekStart])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  async function handleWeekStartDayChange(value) {
    if (value === weekStartDay) return
    if (needsLock) {
      setConfirmingSwitch(value)
      return
    }
    await applyWeekStartDayChange(value)
  }

  async function applyWeekStartDayChange(value) {
    await updateUserPreferences({ weekStartDay: value })
    clearWeekStateCache()
    await refetchUser()
  }

  async function handleConfirmSwitch() {
    const value = confirmingSwitch
    setConfirmingSwitch(null)
    await applyWeekStartDayChange(value)
  }

  function handleCancelSwitch() {
    setConfirmingSwitch(null)
  }

  return (
    <div className="settings-modal-backdrop" onClick={handleBackdropClick}>
      <div className="settings-modal">
        <div className="settings-modal-header">
          <span>Settings</span>
          <button
            className="settings-modal-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="settings-modal-body">
          <div className="settings-section-title">Priority Mode</div>

          <div className="settings-row">
            <div className="settings-row-label">
              <span className="settings-row-name">Time Sensitivity</span>
              <span className="settings-row-desc">
                Show the Time Sensitive category for urgent Core habits
              </span>
            </div>
            <button
              className={`settings-toggle${settings.timeSensitivityEnabled ? " settings-toggle--on" : ""}`}
              onClick={() =>
                updateSetting(
                  "timeSensitivityEnabled",
                  !settings.timeSensitivityEnabled,
                )
              }
              role="switch"
              aria-checked={settings.timeSensitivityEnabled}
              aria-label="Toggle Time Sensitivity"
            />
          </div>

          <div className="settings-section-title settings-section-title--spaced">Week</div>

          <div className="settings-row">
            <div className="settings-row-label">
              <span className="settings-row-name">
                Week Starts On
                {needsLock && !confirmingSwitch && (
                  <svg
                    className="settings-row-lock-icon"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Locked"
                  >
                    <rect x="3" y="7" width="10" height="8" rx="1.5" fill="#f0a500" />
                    <path
                      d="M5 7V5a3 3 0 0 1 6 0v2"
                      stroke="#f0a500"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="8" cy="11" r="1" fill="#fff" />
                  </svg>
                )}
              </span>
              <span className={`settings-row-desc${needsLock && !confirmingSwitch ? " settings-row-desc--locked" : ""}`}>
                {needsLock && !confirmingSwitch
                  ? "You have a pending week — tap to change anyway"
                  : "Choose whether your week begins on Sunday or Monday"}
              </span>
            </div>
            <div className="settings-segmented">
              <button
                className={`settings-segmented-btn${weekStartDay === "sunday" ? " settings-segmented-btn--active" : ""}`}
                onClick={() => handleWeekStartDayChange("sunday")}
              >
                Sun
              </button>
              <button
                className={`settings-segmented-btn${weekStartDay === "monday" ? " settings-segmented-btn--active" : ""}`}
                onClick={() => handleWeekStartDayChange("monday")}
              >
                Mon
              </button>
            </div>
          </div>

          {confirmingSwitch && (
            <div className="settings-week-confirm">
              <span className="settings-week-confirm-text">
                Switching now forfeits your unlocked week
                {forfeitRange && (
                  <strong className="settings-week-confirm-range"> ({forfeitRange})</strong>
                )}
                . You'll lose any XP earned those days.
              </span>
              <div className="settings-week-confirm-actions">
                <button
                  className="settings-week-confirm-btn settings-week-confirm-btn--cancel"
                  onClick={handleCancelSwitch}
                >
                  Lock Week First
                </button>
                <button
                  className="settings-week-confirm-btn settings-week-confirm-btn--confirm"
                  onClick={handleConfirmSwitch}
                >
                  Switch Anyway
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
