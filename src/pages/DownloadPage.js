import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function DownloadPage() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [installClicked, setInstallClicked] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Check if already installed (running in standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches || 
                      window.navigator.standalone === true
    setIsStandalone(standalone)

    // Listen for the beforeinstallprompt event (Chrome/Android)
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    setInstallClicked(true)
    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
      // Redirect to home after installation
      setTimeout(() => navigate("/"), 1000)
    } else {
      console.log("User dismissed the install prompt")
      setInstallClicked(false)
    }

    setDeferredPrompt(null)
  }

  if (isStandalone) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconContainer}>
            <span style={styles.checkIcon}>✓</span>
          </div>
          <h1 style={styles.title}>Already Installed!</h1>
          <p style={styles.description}>
            Reach4 is already installed on your device.
          </p>
          <button
            onClick={() => navigate("/")}
            style={styles.primaryButton}
          >
            Open App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <img
            src="/icons/reach4-192.png"
            alt="Reach4 Logo"
            style={styles.icon}
          />
        </div>

        <h1 style={styles.title}>Download Reach4</h1>
        <p style={styles.description}>
          Get Reach4 on your home screen for quick and easy access!
        </p>

        {/* Chrome/Android - Direct Install Button */}
        {deferredPrompt && !installClicked && (
          <div style={styles.installSection}>
            <button
              onClick={handleInstallClick}
              style={styles.primaryButton}
            >
              📱 Add to Home Screen
            </button>
            <p style={styles.hint}>
              Tap the button above to install Reach4 directly
            </p>
          </div>
        )}

        {installClicked && (
          <div style={styles.installSection}>
            <p style={styles.hint}>Follow the prompt to install...</p>
          </div>
        )}

        {/* iOS Instructions */}
        {isIOS && !deferredPrompt && (
          <div style={styles.instructionsSection}>
            <h3 style={styles.instructionsTitle}>Install on iOS:</h3>
            <ol style={styles.instructionsList}>
              <li style={styles.instructionItem}>
                <span style={styles.stepNumber}>1</span>
                Tap the <strong>Share</strong> button <span style={styles.iosIcon}>⎙</span> at the bottom of Safari
              </li>
              <li style={styles.instructionItem}>
                <span style={styles.stepNumber}>2</span>
                Scroll down and tap <strong>"Add to Home Screen"</strong> <span style={styles.iosIcon}>➕</span>
              </li>
              <li style={styles.instructionItem}>
                <span style={styles.stepNumber}>3</span>
                Tap <strong>"Add"</strong> in the top right corner
              </li>
            </ol>
            <div style={styles.visualHint}>
              <p style={styles.visualHintText}>
                💡 Look for the share icon at the bottom center of your screen
              </p>
            </div>
          </div>
        )}

        {/* Fallback for other browsers */}
        {!isIOS && !deferredPrompt && !installClicked && (
          <div style={styles.instructionsSection}>
            <h3 style={styles.instructionsTitle}>Install Instructions:</h3>
            <p style={styles.description}>
              To install Reach4 on your device:
            </p>
            <ol style={styles.instructionsList}>
              <li style={styles.instructionItem}>
                <span style={styles.stepNumber}>1</span>
                Open your browser's menu (⋮ or ⋯)
              </li>
              <li style={styles.instructionItem}>
                <span style={styles.stepNumber}>2</span>
                Look for <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>
              </li>
              <li style={styles.instructionItem}>
                <span style={styles.stepNumber}>3</span>
                Follow the prompts to complete installation
              </li>
            </ol>
          </div>
        )}

        <div style={styles.footer}>
          <button
            onClick={() => navigate("/login")}
            style={styles.secondaryButton}
          >
            Continue in Browser
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    padding: "20px",
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: "16px",
    padding: "40px 30px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: "24px",
  },
  icon: {
    width: "100px",
    height: "100px",
    borderRadius: "20px",
  },
  checkIcon: {
    fontSize: "80px",
    color: "#10B981",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#F8FAFC",
    marginBottom: "12px",
  },
  description: {
    fontSize: "16px",
    color: "#94A3B8",
    marginBottom: "30px",
    lineHeight: "1.5",
  },
  installSection: {
    marginBottom: "24px",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "16px 32px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    color: "#94A3B8",
    border: "2px solid #334155",
    borderRadius: "12px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  hint: {
    fontSize: "14px",
    color: "#64748B",
    marginTop: "12px",
  },
  instructionsSection: {
    textAlign: "left",
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#0F172A",
    borderRadius: "12px",
  },
  instructionsTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#F8FAFC",
    marginBottom: "16px",
  },
  instructionsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  instructionItem: {
    fontSize: "15px",
    color: "#CBD5E1",
    marginBottom: "16px",
    display: "flex",
    alignItems: "flex-start",
    lineHeight: "1.6",
  },
  stepNumber: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    backgroundColor: "#3B82F6",
    color: "white",
    borderRadius: "50%",
    fontSize: "14px",
    fontWeight: "bold",
    marginRight: "12px",
    flexShrink: 0,
    marginTop: "2px",
  },
  iosIcon: {
    fontSize: "20px",
    marginLeft: "4px",
  },
  visualHint: {
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "#1E293B",
    borderRadius: "8px",
    borderLeft: "4px solid #3B82F6",
  },
  visualHintText: {
    fontSize: "14px",
    color: "#94A3B8",
    margin: 0,
  },
  footer: {
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #334155",
  },
}
