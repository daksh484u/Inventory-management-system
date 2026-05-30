import { useState, useEffect } from "react";
import { usePreview } from "../hooks/usePreview";

const STORAGE_KEY = "inv_onboarded";

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const { toggle } = usePreview();

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const openPreview = () => {
    dismiss();
    toggle();
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={(e) => e.target === e.currentTarget && dismiss()}>
      <div className="modal" style={{ maxWidth: 460, textAlign: "center" }}>
        <div style={{ padding: "32px 32px 0" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "var(--brand-50)", border: "2px solid var(--brand-200)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="var(--brand-600)" style={{ width: 30, height: 30 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
            Welcome to Inventory Manager
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>
            The app is empty right now — that's normal. Once you add products, customers, and orders, everything comes alive.
          </p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 28 }}>
            Want to see how it looks when fully loaded? Hit <strong style={{ color: "var(--brand-600)" }}>Preview</strong> in the top bar — it shows a complete working example with real charts and data.
          </p>

          <div style={{
            background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
            padding: "14px 16px", marginBottom: 28,
            display: "flex", alignItems: "center", gap: 12, textAlign: "left",
          }}>
            <div style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: "var(--radius-md)",
              background: "var(--brand-600)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#fff" style={{ width: 18, height: 18 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Preview button</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Top-right of the screen — toggles sample data on/off</div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: "center", gap: 12 }}>
          <button className="btn btn-secondary" onClick={dismiss} style={{ minWidth: 120 }}>
            Skip for now
          </button>
          <button className="btn btn-primary" onClick={openPreview} style={{ minWidth: 140 }}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Open Preview
          </button>
        </div>
      </div>
    </div>
  );
}
