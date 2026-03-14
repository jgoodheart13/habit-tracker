import React from "react"
import "./SettingsModal.css"
import { useSettings } from "../contexts/SettingsContext"
import { useUserContext } from "../contexts/UserContext"
import { useWeekGuard } from "../contexts/WeekGuardContext"
import { updateUserPreferences } from "../api/userApi"
import { clearWeekStateCache } from "../utils/weekStateCache"

export default function SettingsModal({ onClose }) {
  const { settings, updateSetting } = useSettings()
  const { user, refetchUser } = useUserContext()
  const { needsLock } = useWeekGuard()

  const weekStartDay = user?.preferences?.weekStartDay ?? "monday"

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  async function handleWeekStartDayChange(value) {
    if (value === weekStartDay) return
    await updateUserPreferences({ weekStartDay: value })
    clearWeekStateCache()
    await refetchUser()
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
              <span className="settings-row-name">Week Starts On</span>
              <span className="settings-row-desc">
                {needsLock
                  ? "Complete your pending week lock before changing this"
                  : "Choose whether your week begins on Sunday or Monday"}
              </span>
            </div>
            <div className={`settings-segmented${needsLock ? " settings-segmented--disabled" : ""}`}>
              <button
                className={`settings-segmented-btn${weekStartDay === "sunday" ? " settings-segmented-btn--active" : ""}`}
                onClick={() => handleWeekStartDayChange("sunday")}
                disabled={needsLock}
              >
                Sun
              </button>
              <button
                className={`settings-segmented-btn${weekStartDay === "monday" ? " settings-segmented-btn--active" : ""}`}
                onClick={() => handleWeekStartDayChange("monday")}
                disabled={needsLock}
              >
                Mon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
