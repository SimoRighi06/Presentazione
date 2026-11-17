// src/components/DevMode/hooks/useAIAnalysis.ts
import { useState, useCallback } from "react";

export interface AIAnalysisResponse {
  componentName: string;
  layoutClasses: string[];
  scssImports: string[];
  htmlSnippet: string;
  seoTags?: { h1: string; metaDesc: string };
  techNotes: string;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5087";

export const useAIAnalysis = (siteParam: string, draftId: string) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResponse | null>(null);

  const analyzeSection = useCallback(
    async (yPercent?: number, userPrompt?: string) => {
      if (!siteParam || !draftId) return;

      // 🔑 LETTURA DIRETTA: Se il token c'è, sei autenticato. Punto.
      const token =
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("admin_token") ||
        "";

      // ❌ RIMOSSO: Non controlliamo più admin_authenticated
      // Se il token manca, il backend risponderà 401 comunque

      const roundedY = Math.round((yPercent || 0) * 100);
      const cacheKey = `ai_${siteParam}_${draftId}_${roundedY}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        try {
          setAiResult(JSON.parse(cached));
          return;
        } catch {
          sessionStorage.removeItem(cacheKey);
        }
      }

      setIsAnalyzing(true);
      try {
        console.log("🚀 [AI] Invio richiesta con token:", token ? token.substring(0, 15) + "..." : "TOKEN MANCANTE");
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/devmode/analyze`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            siteParam,
            draftId,
            selectedYPercent: yPercent,
            userPrompt: userPrompt || "",
          }),
        });

        if (response.status === 401) {
          throw new Error("Token JWT rifiutato dal backend. Sessione scaduta.");
        }
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Errore API (${response.status}): ${errText}`);
        }

        const data: AIAnalysisResponse = await response.json();
        
        if (!data.error) {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        }
        
        setAiResult(data);
      } catch (error) {
        console.error("❌ [AI Analysis] Errore:", error);
        setAiResult({
          componentName: "FALLBACK",
          layoutClasses: [],
          scssImports: [],
          htmlSnippet: "",
          techNotes: "",
          error: error instanceof Error ? error.message : "Errore di connessione",
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [siteParam, draftId]
  );

  const clearCache = useCallback(() => {
    setAiResult(null);
  }, []);

  return { isAnalyzing, aiResult, analyzeSection, clearCache };
};