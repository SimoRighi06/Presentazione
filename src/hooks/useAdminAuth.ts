// src/hooks/useAdminAuth.ts
import { useState, useEffect, useCallback } from "react";
import { isClientView } from "../clientLink";

// 🔧 Funzione helper per trovare il token in sessionStorage
// (adatta i nomi in base a quello che trovi nel Session Storage)
const findTokenInStorage = (): string | null => {
  const possibleKeys = [
    "token",
    "jwt",
    "admin_token",
    "accessToken",
    "auth_token",
    "PresentazioneToken",
  ];
  
  for (const key of possibleKeys) {
    const value = sessionStorage.getItem(key);
    if (value && value.length > 20) {
      console.log(`🔑 [Auth] Token trovato in sessionStorage["${key}"]`);
      return value;
    }
  }
  
  console.warn("⚠️ [Auth] Nessun token JWT trovato in sessionStorage!");
  return null;
};

export function useAdminAuth() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("admin_authenticated") === "true";
  });
  const [token, setToken] = useState<string | null>(() => findTokenInStorage());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isClientView()) return;
      if (
        (e.ctrlKey && e.shiftKey && e.code === "KeyC") ||
        (e.altKey &&
          (e.code === "KeyC" || e.key.toLowerCase() === "c" || e.key === "ç"))
      ) {
        e.preventDefault();
        setShowAdminLogin(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 🔧 Rileggi il token dopo il login
  const refreshToken = useCallback(() => {
    setToken(findTokenInStorage());
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    setShowAdminLogin(false);
    refreshToken(); // ✅ Rileggi il token appena salvato da AdminLoginGate
  };

  const cancelLogin = () => {
    setShowAdminLogin(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    sessionStorage.removeItem("admin_authenticated");
    // Rimuovi anche la chiave del token che usi
    ["token", "jwt", "admin_token", "accessToken", "auth_token"].forEach((k) =>
      sessionStorage.removeItem(k),
    );
  };

  return {
    showAdminLogin,
    isAuthenticated,
    token, // ✅ ESPONI IL TOKEN
    login,
    cancelLogin,
    logout,
    refreshToken,
    setShowAdminLogin,
  };
}