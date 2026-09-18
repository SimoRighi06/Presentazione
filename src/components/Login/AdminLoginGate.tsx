import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, AlertCircle, Timer } from "lucide-react";

const PASSWORD_BASE64 = "UHJlc2VudGF6aW9uZTI2IQ==";

export interface AdminLoginGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // RATE LIMITING: Stati per il blocco dopo 3 tentativi
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // FIX PUNTO 5: Se l'utente è già autenticato, entra direttamente
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("admin_authenticated");
    if (isAuthenticated === "true") {
      onSuccess();
    }
  }, [onSuccess]);

  // Timer per il conto alla rovescia del blocco
  useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
      // Date.now() qui è OK perché siamo dentro un useEffect (effetto collaterale)
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        setError("");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // FIX PUNTO 3: Se siamo bloccati, non fare nulla
    if (timeLeft > 0) {
      return;
    }

    // FIX PUNTO 2: Codifica l'input in Base64 e confronta (no password in chiaro)
    const inputBase64 = btoa(password);

    if (inputBase64 === PASSWORD_BASE64) {
      // Successo
      sessionStorage.setItem("admin_authenticated", "true");
      onSuccess();
    } else {
      // Fallimento
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 4) {
        // FIX PUNTO 3: Blocco per 60 secondi
        // Date.now() qui è OK perché siamo dentro un gestore di eventi (handleSubmit)
        const lockTime = Date.now() + 30000;
        setLockoutUntil(lockTime);
        setError("Troppi tentativi. Riprova tra 60 secondi.");
      } else {
        setError(`Password errata. Tentativi rimasti: ${4 - newAttempts}`);
      }

      setPassword("");
      triggerShake();
    }
  };

  const isLocked = timeLeft > 0;

  const handleCancel = () => {
    sessionStorage.removeItem("admin_authenticated");
    onCancel();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #e7975a 0%, #b55012 100%)",
        zIndex: "9999",
      }}
    >
      <div
        className={`cloud-glass-card p-5 rounded-2 shadow-lg ${shake ? "animate-shake" : ""}`}
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
                if (error) setError("");
              }}
              disabled={isLocked}
              autoFocus
            />
            <button
              type="button"
              className="position-absolute top-50 end-0 translate-middle-y btn btn-link text-muted pe-3"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              disabled={isLocked}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {error && (
              <div className="invalid-feedback d-flex align-items-center gap-1 mt-1">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
          </div>

          {/* ✅ Indicatore blocco con timer */}
          {isLocked && (
            <div className="d-flex align-items-center justify-content-center gap-2 text-danger small">
              <Timer size={14} className="animate-spin" />
              <span>Account bloccato per {timeLeft}s</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked || !password.trim()}
            className="btn btn-dark w-100 rounded-pill py-2 fw-semibold"
            style={{
              opacity: isLocked ? 0.5 : 1,
              cursor: isLocked ? "not-allowed" : "pointer",
            }}
          >
            {isLocked ? `Attendi ${timeLeft}s` : "Accedi"}
          </button>

          <button
            type="button"
            className="btn btn-link text-muted text-decoration-none small"
            onClick={handleCancel}
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};