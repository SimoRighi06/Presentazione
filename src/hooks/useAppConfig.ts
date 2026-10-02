import { useState, useEffect } from "react";
/* import { AppConfig, DEFAULT_CONFIG } from "../types/config"; */
import { type AppConfig, DEFAULT_CONFIG } from "../types/config";

export function useAppConfig(
  setSiteParam: (site: string) => void,
  getSiteParamFromDomain: (domain: string) => string
) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const loadConfigFromQuery = () => {
      const params = new URLSearchParams(window.location.search);
      const encodedData = params.get("data");

      if (!encodedData) return false;

      try {
        const decodedString = decodeURIComponent(escape(atob(encodedData)));
        const parsedConfig = JSON.parse(decodedString) as AppConfig;

        setConfig(parsedConfig);

        if (parsedConfig.dominio) {
          setSiteParam(getSiteParamFromDomain(parsedConfig.dominio));
        }

        return true;
      } catch (error) {
        console.warn("Parametri config invalidi, fallback a config.json", error);
        return false;
      }
    };

    const loadConfigFromFile = async () => {
      try {
        const res = await fetch("/config.json");
        if (!res.ok) throw new Error("config.json non trovato");

        const data = (await res.json()) as AppConfig;
        setConfig(data);

        if (data.dominio) {
          setSiteParam(getSiteParamFromDomain(data.dominio));
        }
      } catch {
        setConfig(DEFAULT_CONFIG);
        setSiteParam(getSiteParamFromDomain(DEFAULT_CONFIG.dominio));
      }
    };

    const fromQuery = loadConfigFromQuery();
    if (!fromQuery) {
      void loadConfigFromFile();
    }
  }, [setSiteParam, getSiteParamFromDomain]);

  return { config, setConfig };
}
