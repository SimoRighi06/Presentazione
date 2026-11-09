import { useState, useEffect, useCallback } from "react";

// Tipi interfacce
export type ViewMode = "admin" | "presentation" | "draft" | "dev";

export interface UseAppRouterReturn {
  viewMode: ViewMode;
  isConfigMode: boolean;
  siteParam: string;
  setViewMode: (mode: ViewMode) => void;
  setIsConfigMode: (value: boolean) => void;
  setSiteParam: (value: string) => void;
  getSiteParamFromDomain: (domain: string | undefined) => string;
}

// Creazione del link del dominio (Helper)
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
  // 1. Inizializzazione intelligente della ViewMode
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const pathname = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    
    // Controllo se siamo in dev mode tramite URL o Query Param
    if (pathname.includes("/devmode") || params.get("mode") === "dev") {
      return "dev";
    }
    
    // Fallback alla logica esistente
    return pathname === "/area" ? "admin" : "draft";
  });

  // 2. Inizializzazione intelligente del siteParam (estrae lo slug anche se c'è /devmode)
  const getInitialSiteParam = (): string => {
    const pathname = window.location.pathname.toLowerCase();
    
    // Rimuove /area, /devmode e gli slash iniziali/finali
    const cleanPath = pathname
      .replace(/\/area/i, "")
      .replace(/\/devmode/i, "")
      .replace(/^\/|\/$/g, "");
    
    if (cleanPath && cleanPath !== "v") {
      return cleanPath;
    }
    
    // Fallback a query param o default
    const params = new URLSearchParams(window.location.search);
    return params.get("site") || params.get("slug") || "hoteltorbole";
  };

  const [siteParam, setSiteParam] = useState<string>(getInitialSiteParam);

  const isConfigMode = viewMode === "admin";

  const setIsConfigMode = useCallback((value: boolean) => {
    setViewMode(value ? "admin" : "draft");
  }, []);

  // 3. Scorciatoie da tastiera (Admin + Dev Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // --- LOGICA ESISTENTE: Toggle Admin/Draft (Ctrl+Shift+C o Alt+C/ç) ---
      if (
        (e.ctrlKey && e.shiftKey && e.code === "KeyC") ||
        (e.altKey && (e.code === "KeyC" || e.key.toLowerCase() === "c" || e.key === "ç"))
      ) {
        e.preventDefault();
        setViewMode((prev) => (prev === "admin" ? "draft" : "admin"));
        return; // Esce per non attivare altre logiche
      }

      // --- NUOVA LOGICA: Toggle Dev Mode (Alt + D) ---
      if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setViewMode((prev) => {
          const nextMode = prev === "dev" ? "draft" : "dev";
          
          // Sincronizza l'URL senza ricaricare la pagina (per coerenza e condivisione link)
          const url = new URL(window.location.href);
          if (nextMode === "dev") {
            if (!url.pathname.toLowerCase().includes("/devmode")) {
              url.pathname = url.pathname.endsWith("/") 
                ? `${url.pathname}devmode` 
                : `${url.pathname}/devmode`;
            }
            url.searchParams.set("mode", "dev");
          } else {
            url.pathname = url.pathname.replace(/\/devmode/i, "");
            url.searchParams.delete("mode");
          }
          window.history.replaceState({}, "", url.toString());
          
          return nextMode;
        });
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