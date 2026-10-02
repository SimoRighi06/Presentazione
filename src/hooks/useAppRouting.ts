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

// Creazione del link del dominio
export const getSiteParamFromDomain = (domain: string | undefined): string => {
  if (!domain) return "hoteltorbole";
  return domain
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")             
    .split("/")[0]                     
    .split(".")[0]                      
    .replace(/\s+/g, "")                
    .toLowerCase();                    
};

export const useAppRouter = (): UseAppRouterReturn => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    /* const urlParams = new URLSearchParams(window.location.search); */
    return window.location.pathname === "/area" ? "admin" : "draft";
  });

  const isConfigMode = viewMode === "admin";
  const [siteParam, setSiteParam] = useState<string>("hoteltorbole");

  const setIsConfigMode = useCallback((value: boolean) => {
    setViewMode(value ? "admin" : "draft");
  }, []);

  // Scorciatoia tastiera 
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