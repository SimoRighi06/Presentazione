import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export interface AdminLoginGateProps {
  onSuccess: () => void;
  onCancel: () => void;
  requiredPassword?: string;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  onSuccess,
  onCancel,
  requiredPassword = "Presentazione26!",
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  // ✅ Controlla se l'utente è già autenticato in questa sessione
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("admin_authenticated");
    if (isAuthenticated === "true") {
      onSuccess();
    }
  }, [onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === requiredPassword) {
        console.log("password inserita:", {password})
      sessionStorage.setItem("admin_authenticated", "true");
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #533117 0%, #aa5119 100%)",
        zIndex: 9999,
      }}
    >
      <div
        className={`cloud-glass-card p-5 rounded-4 shadow-lg ${shake ? "animate-shake" : ""}`}
        style={{
          width: "100%",
          maxWidth: "400px",
          animation: shake ? "shake 0.5s" : "none",
        }}
      >
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(0,0,0,0.1)",
            }}
          >
            <Lock size={32} className="text-dark" />
          </div>
          <h3 className="fw-bold text-dark mb-1">Accesso Admin</h3>
          <p className="text-muted small mb-0">
            Inserisci la password per accedere al pannello di configurazione
          </p>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div className="position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control form-control-lg bg-light border-0 ps-4 pe-5 ${
                error ? "is-invalid" : ""
              }`}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              autoFocus
            />
            <button
              type="button"
              className="position-absolute top-50 end-0 translate-middle-y btn btn-link text-muted pe-3"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {error && (
              <div className="invalid-feedback d-flex align-items-center gap-1 mt-1">
                <AlertCircle size={14} />
                Password errata
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 rounded-pill py-2 fw-semibold"
          >
            Accedi
          </button>

          <button
            type="button"
            className="btn btn-link text-muted text-decoration-none small"
            onClick={onCancel}
          >
            ← Torna indietro
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};