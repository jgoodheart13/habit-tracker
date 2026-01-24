import React from "react"
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext"
import { useNavigate } from "react-router-dom"
import theme from "../styles/theme"

function DropdownMenu({ userInfo, onClose }) {
  const navigate = useNavigate()

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
    color: "#333",
    width: "100%",
    textAlign: "left",
    borderRadius: 6,
    transition: "background 0.2s",
  }

  const menuItemHoverStyle = {
    background: "#f5f5f5",
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        right: 0,
        background: "#fff",
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 8,
        boxShadow: theme.colors.shadow,
        padding: 8,
        zIndex: 1000,
        minWidth: 180,
      }}
    >
      <div
        style={{
          padding: "8px 16px",
          fontWeight: 600,
          fontSize: 14,
          color: "#666",
          borderBottom: `1px solid ${theme.colors.border}`,
          marginBottom: 4,
        }}
      >
        {userInfo?.name || userInfo?.email || "Account"}
      </div>

      <button
        onClick={() => {
          navigate("/help")
          onClose()
        }}
        style={menuItemStyle}
        onMouseEnter={(e) =>
          Object.assign(e.currentTarget.style, menuItemHoverStyle)
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <span style={{ fontSize: 18 }}>❓</span>
        Help & Guide
      </button>

      <div
        style={{
          height: 1,
          background: theme.colors.border,
          margin: "4px 0",
        }}
      />

      <button
        onClick={() => {
          navigate("/logout")
          onClose()
        }}
        style={{
          ...menuItemStyle,
          color: theme.colors.accent,
          fontWeight: 600,
        }}
        onMouseEnter={(e) =>
          Object.assign(e.currentTarget.style, menuItemHoverStyle)
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        Log Out
      </button>
    </div>
  )
}

export default function Header() {
  const { isAuthenticated, getUserMetadata } = useSupabaseAuth()
  const userInfo = getUserMetadata()
  const [showDropdown, setShowDropdown] = React.useState(false)
  const dropdownRootRef = React.useRef(null)

  React.useEffect(() => {
    if (!showDropdown) return

    const handlePointerDown = (e) => {
      const root = dropdownRootRef.current
      if (!root) return
      if (!root.contains(e.target)) {
        setShowDropdown(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowDropdown(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    })
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [showDropdown])

  return (
    <header
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        padding: "12px 0px",
        background: "#fff",
        borderBottom: "1px solid #eee",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        position: "relative",
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Left: Logo */}
      <div
        style={{
          paddingLeft: 16,
          display: "flex",
          alignItems: "center",
          minWidth: 48,
        }}
      >
        <img
          src={
            process.env.PUBLIC_URL + "/Reach4LogoMock-NoLogo-transparent.png"
          }
          alt="Reach4 Logo"
          style={{ width: 38, height: 38, marginRight: 8 }}
        />
      </div>

      {/* Center: Title */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          position: "absolute",
          left: 0,
          right: 0,
        }}
      >
        <h1
          style={{
            color: theme.colors.accent,
            fontWeight: 800,
            fontSize: 28,
            margin: 0,
            textAlign: "center",
            pointerEvents: "auto",
          }}
        >
          Reach 4
        </h1>
      </div>

      {/* Right: User Icon */}
      <div
        style={{
          paddingRight: 16,
          position: "relative",
          marginLeft: "auto",
          zIndex: 51,
        }}
      >
        {isAuthenticated && (
          <div ref={dropdownRootRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowDropdown((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
              title={userInfo?.name || userInfo?.email || "Account"}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  stroke="#555"
                  strokeWidth="2"
                  fill="#eee"
                />
                <path
                  d="M4 20c0-4 8-4 8-4s8 0 8 4"
                  stroke="#555"
                  strokeWidth="2"
                  fill="#eee"
                />
              </svg>
            </button>

            {showDropdown && (
              <DropdownMenu
                userInfo={userInfo}
                onClose={() => setShowDropdown(false)}
              />
            )}
          </div>
        )}
      </div>
    </header>
  )
}
