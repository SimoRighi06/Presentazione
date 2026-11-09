import { useState, useEffect } from "react";
import { type AppConfig, DEFAULT_CONFIG } from "../types/config";
import { extractClientSlug } from "../clientLink";

export function useAppConfig(
  setSiteParam: (site: string) => void,
  getSiteParamFromDomain: (domain: string) => string
) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      const rawApiUrl = import.meta.env.VITE_API_URL;
      const apiUrl = rawApiUrl ? rawApiUrl.replace(/\/+$/, "") : "";
      const slug = extractClientSlug();

      // ---------------------------------------------------------
      // PRIORITÀ 1: TENTATIVO BACKEND API (se c'è uno slug valido)
      // ---------------------------------------------------------
      if (slug) {
        try {
          const fetchUrl = apiUrl ? `${apiUrl}/api/presentations/${slug}` : `/api/presentations/${slug}`;
          const res = await fetch(fetchUrl);

          if (res.ok) {
            const data = await res.json();
            const parsedConfig = JSON.parse(data.configJson) as AppConfig;

            if (parsedConfig.colors && Array.isArray(parsedConfig.colors)) {
              parsedConfig.colors = parsedConfig.colors.map((c) =>
                c.startsWith("#") ? c : `#${c}`
              );
            }

            setConfig(parsedConfig);
            const resolvedDomain = parsedConfig.dominio || slug;
            setSiteParam(getSiteParamFromDomain(resolvedDomain));
            setIsLoading(false);
            return;
          } else {
            console.warn(`Configurazione non trovata per lo slug "${slug}" (Status: ${res.status}). Passo al fallback...`);
          }
        } catch (error) {
          console.warn("Backend non raggiungibile o errore di rete. Passo al fallback...", error);
        }
      }

      // ---------------------------------------------------------
      // PRIORITÀ 2: FALLBACK BASE64 (?data=)
      // ---------------------------------------------------------
      const params = new URLSearchParams(window.location.search);
      const encodedData = params.get("data");

      if (encodedData) {
        try {
          const decodedString = decodeURIComponent(escape(atob(encodedData)));
          const parsedConfig = JSON.parse(decodedString) as AppConfig;

          if (parsedConfig.colors && Array.isArray(parsedConfig.colors)) {
            parsedConfig.colors = parsedConfig.colors.map((c) =>
              c.startsWith("#") ? c : `#${c}`
            );
          }

          setConfig(parsedConfig);
          if (parsedConfig.dominio) {
            setSiteParam(getSiteParamFromDomain(parsedConfig.dominio));
          }
          setIsLoading(false);
          return;
        } catch (error) {
          console.warn("Parametri config ?data invalidi, fallback a config.json", error);
        }
      }

      // ---------------------------------------------------------
      // PRIORITÀ 3: FALLBACK FILE LOCALE (/config.json)
      // ---------------------------------------------------------
      try {
        const res = await fetch("/config.json");
        if (res.ok) {
          const data = (await res.json()) as AppConfig;
          if (data.colors && Array.isArray(data.colors)) {
            data.colors = data.colors.map((c) => (c.startsWith("#") ? c : `#${c}`));
          }
          setConfig(data);
          if (data.dominio) {
            setSiteParam(getSiteParamFromDomain(data.dominio));
          }
          setIsLoading(false);
          return;
        }
      } catch {
        // Fallback al default
      }

      // ---------------------------------------------------------
      // PRIORITÀ 4: DEFAULT CONFIG
      // ---------------------------------------------------------
      setConfig(DEFAULT_CONFIG);
      setSiteParam(getSiteParamFromDomain(DEFAULT_CONFIG.dominio));
      setIsLoading(false);
    };

    loadConfig();
  }, [setSiteParam, getSiteParamFromDomain]);

  return { config, setConfig, isLoading };
}