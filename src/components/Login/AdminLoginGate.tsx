import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, AlertCircle, Timer } from "lucide-react";

{/* const PASSWORD_BASE64 = "UHJlc2VudGF6aW9uZTI2IQ=="; */}

export interface AdminLoginGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [username, setUsername] = useState("admin"); // Pre-compilato per comodità
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Controlla se esiste già un token valido all'avvio
  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      onSuccess();
    }
  }, [onSuccess]);

  // Gestione Timer di blocco
  useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
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

  // Chiamata al Backend .NET
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (lockoutUntil !== null || isLoading) return;
    if (!username.trim() || !password.trim()) {
      setError("Inserisci username e password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5087/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login riuscito: salva il JWT e accedi
        sessionStorage.setItem("admin_token", data.token);
        sessionStorage.setItem("admin_username", data.username);
        onSuccess();
      } else {
        // Login fallito: gestisci tentativi e lockout
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 4) {
          const lockTime = Date.now() + 30000;
          setLockoutUntil(lockTime);
          setTimeLeft(60);
          setError("Troppi tentativi. Riprova tra 30 secondi.");
        } else {
          setError(data.message || "Credenziali non valide");
        }

        setPassword("");
        triggerShake();
      }
      if(response.status === 401 ){
        sessionStorage.removeItem("admin_token");
        window.location.reload();
      }
    } catch {
      setError("Errore di connessione al server");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const isLocked = lockoutUntil !== null;

  const handleCancel = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_username");
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
            Inserisci le credenziali per accedere al pannello
          </p>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {/* Campo Username */}
          <input
            type="text"
            className={`form-control form-control-lg bg-light border-0 ps-4 pe-5 ${error ? "is-invalid" : ""}`}
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError("");
            }}
            disabled={isLocked || isLoading}
            autoFocus
          />

          {/* Campo Password */}
          <div className="position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control form-control-lg bg-light border-0 ps-4 pe-5 ${error ? "is-invalid" : ""}`}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              disabled={isLocked || isLoading}
            />
            <button
              type="button"
              className="position-absolute top-50 end-0 translate-middle-y btn btn-link text-muted pe-3"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              disabled={isLocked || isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Feedback Errori */}
          {error && (
            <div className="invalid-feedback d-flex align-items-center gap-1 mt-1 d-block">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Indicatore Blocco */}
          {isLocked && (
            <div className="d-flex align-items-center justify-content-center gap-2 text-danger small">
              <Timer size={14} className="animate-spin" />
              <span>Account bloccato per {timeLeft}s</span>
            </div>
          )}

          {/* Bottone Accedi */}
          <button
            type="submit"
            disabled={isLocked || !username.trim() || !password.trim() || isLoading}
            className="btn btn-dark w-100 rounded-pill py-2 fw-semibold"
            style={{
              opacity: isLocked || isLoading ? 0.5 : 1,
              cursor: isLocked || isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status"></span>
                Verifica...
              </span>
            ) : isLocked ? (
              `Attendi ${timeLeft}s`
            ) : (
              "Accedi"
            )}
          </button>

          {/* Torna Indietro */}
          <button
            type="button"
            className="btn btn-link text-muted text-decoration-none small"
            onClick={handleCancel}
            disabled={isLoading}
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
        .animate-shake { animation: shake 0.5s; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};