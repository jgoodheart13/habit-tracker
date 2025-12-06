import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomSheet({ isOpen, onClose, children }) {
  // Close when user presses ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/*  Overlay / Scrim */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "#000",
              zIndex: 200,
            }}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 201,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              background: "#fff",
              padding: "20px",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.12)",
              maxHeight: "60vh",
              overflowY: "auto",
              touchAction: "none", // prevent scroll conflicts
            }}
          >
            {/* Handle bar */}
            <div
              style={{
                width: 40,
                height: 5,
                background: "#ccc",
                borderRadius: 3,
                margin: "0 auto 12px",
              }}
            />

            {children}

            {/* Optional: Close button */}
            {/* <div
              style={{
                marginTop: 20,
                textAlign: "center",
                color: "#444",
                padding: 10,
                cursor: "pointer",
              }}
              onClick={onClose}
            >
              Cancel
            </div> */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
