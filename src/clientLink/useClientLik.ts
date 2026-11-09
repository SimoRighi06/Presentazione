import { useEffect } from "react";
import type { ViewMode } from "../hooks/useAppRouting"; 

export const extractClientSlug = (): string => {
  const pathname = window.location.pathname;
  
  if (!pathname || pathname === "/" || pathname === "/area") {
    const params = new URLSearchParams(window.location.search);
    return (params.get("site") || params.get("slug") || "").trim().toLowerCase();
  }

  if (pathname.includes("/devmode")) {
    const clean = pathname.replace("/devmode", "").replace(/\//g, "").trim().toLowerCase();
    if (clean && clean !== "v") return clean;
    
    const params = new URLSearchParams(window.location.search);
    // CORREZIONE 1: Ritorna stringa vuota, non null (la funzione deve ritornare sempre string)
    return (params.get("site") || params.get("slug") || "").trim().toLowerCase();
  }

  if (pathname.startsWith("/v/")) {
    return pathname.replace(/^\/v\//, "").split("/")[0].trim().toLowerCase();
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && segments[0] !== "area") {
    return segments[0].trim().toLowerCase();
  }

  return "";
};

export const isClientView = (): boolean => {
  const pathname = window.location.pathname;
  if (pathname.startsWith("/v/")) return true;
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 0 && segments[0] !== "area";
};

// CORREZIONE 2: Usa il tipo ViewMode importato per includere "dev"
export const useClientView = (
    setSiteParam: (param: string) => void,
    setViewMode: (mode: ViewMode) => void, 
    setIsConfigMode: (isConfig: boolean) => void
) => {
    useEffect(() => {
        const slug = extractClientSlug();

        if (slug) {
            // CORREZIONE 3: Usa i backticks (`) per l'interpolazione, non gli apici singoli (')
            console.log(`Modalità cliente attiva: ${slug}`);
            
            setSiteParam(slug);
            
            // CORREZIONE 4: Evita di forzare "draft" se l'URL è esplicitamente /devmode
            const isDev = window.location.pathname.includes("/devmode") || 
                          new URLSearchParams(window.location.search).get("mode") === "dev";
            
            setViewMode(isDev ? "dev" : "draft");
            setIsConfigMode(false);
            sessionStorage.removeItem("admin_authenticated");
        }
    }, [setSiteParam, setIsConfigMode, setViewMode]);
};