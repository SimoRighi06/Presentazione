import { useState, useEffect } from "react";
import { isClientView } from "../clientLink";

export function useAdminAuth() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("admin_authenticated") === "true";
  });

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

  const login = () => {
    setIsAuthenticated(true);
    setShowAdminLogin(false);
  };

  const cancelLogin = () => {
    setShowAdminLogin(false);
  };

  return { showAdminLogin, isAuthenticated, login, cancelLogin, setShowAdminLogin };
}
