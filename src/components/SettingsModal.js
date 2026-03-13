import React from "react"
import "./SettingsModal.css"
import { useSettings } from "../contexts/SettingsContext"

export default function SettingsModal({ onClose }) {
  const { settings, updateSetting } = useSettings()

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
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
        </div>
      </div>
    </div>
  )
}
