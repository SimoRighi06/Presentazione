import { useState, useEffect, useCallback } from "react";

// =========================================================
// TIPI E INTERFACCE
// =========================================================
export type ViewMode = "admin" | "presentation" | "draft";

export interface UseAppRouterReturn {
  viewMode: ViewMode;
  isConfigMode: boolean;
  siteParam: string;
  setViewMode: (mode: ViewMode) => void;
  setIsConfigMode: (value: boolean) => void;
  setSiteParam: (value: string) => void;
  getSiteParamFromDomain: (domain: string | undefined) => string;
}

// =========================================================
// FUNZIONE HELPER: Pulizia dominio
// =========================================================
export const getSiteParamFromDomain = (domain: string | undefined): string => {
  if (!domain) return "hotellabussola";
  return domain
    .replace(/^https?:\/\//i, "")       // 1. Rimuove http:// o https://
    .replace(/^www\./i, "")             // 2. Rimuove www.
    .split("/")[0]                      // 3. Prende solo l'host, rimuove eventuali path
    .split(".")[0]                      // 4. Prende la prima parte (es. "campingmaroadi")
    .replace(/\s+/g, "")                // 5. Rimuove TUTTI gli spazi
    .toLowerCase();                     // 6. Converte tutto in minuscolo
};

// =========================================================
// CUSTOM HOOK: useAppRouter
// =========================================================
export const useAppRouter = (): UseAppRouterReturn => {
  // ✅ Lazy initialization: leggi l'URL solo al primo render
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("mode") === "admin" ? "admin" : "draft";
  });

  // ✅ isConfigMode è DERIVATO da viewMode (Single Source of Truth)
  const isConfigMode = viewMode === "admin";

  const [siteParam, setSiteParam] = useState<string>("hotellabussola");

  // Wrapper per setIsConfigMode che aggiorna viewMode
  const setIsConfigMode = useCallback((value: boolean) => {
    setViewMode(value ? "admin" : "draft");
  }, []);

  // =========================================================
  // SCORCIATOIA TASTIERA (Alt+C / Ctrl+Shift+C)
  // =========================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.code === "KeyC") ||
        (e.altKey && (e.code === "KeyC" || e.key.toLowerCase() === "c" || e.key === "ç"))
      ) {
        e.preventDefault();
        setViewMode((prev) => (prev === "admin" ? "draft" : "admin"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return {
    viewMode,
    isConfigMode,
    siteParam,
    setViewMode,
    setIsConfigMode,
    setSiteParam,
    getSiteParamFromDomain,
  };
};