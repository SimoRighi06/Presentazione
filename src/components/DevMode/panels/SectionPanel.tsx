// components/DevMode/panels/SectionPanel.tsx
import React from "react";
import { MousePointer, Target, X, Code2, Copy, Sparkles, Loader2 } from "lucide-react";
import type { SectionTemplate } from "../../../types/config";
import type { SelectionMode } from "../hooks/useDevMode";
import type { AIAnalysisResponse } from "../hooks/useAIAnalysis";

export interface SectionPanelProps {
  selectedSection: SectionTemplate | null;
  selectionMode: SelectionMode;
  onClearSelection: () => void;
  onSelectionModeChange: (mode: SelectionMode) => void;
  onCopy: (text: string, label: string) => void;
  isAnalyzing?: boolean;
  aiResult?: AIAnalysisResponse | null;
}

export const SectionPanel: React.FC<SectionPanelProps> = ({
  selectedSection,
  selectionMode,
  onClearSelection,
  onSelectionModeChange,
  onCopy,
  isAnalyzing = false,
  aiResult = null,
}) => {
  // 1. Stato vuoto (nessuna selezione)
  if (!selectedSection) {
    return (
      <div className="panel-section">
        <div className="empty-state">
          <MousePointer size={48} className="text-muted mb-3" />
          <h4 className="text-muted">Nessuna sezione selezionata</h4>
          <p className="text-muted small">
            Clicca o trascina il mouse sull'immagine a sinistra per rilevare automaticamente la macro-sezione
          </p>
          <div className="selection-mode-toggle mt-4">
            <span className="small text-muted me-2">Modalità:</span>
            <button
              type="button"
              className={`btn-mode ${selectionMode === "click" ? "active" : ""}`}
              onClick={() => onSelectionModeChange("click")}
            >
              <MousePointer size={14} /> Click
            </button>
            <button
              type="button"
              className={`btn-mode ${selectionMode === "drag" ? "active" : ""}`}
              onClick={() => onSelectionModeChange("drag")}
            >
              <Target size={14} /> Drag
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Helper per usare i dati AI se disponibili, altrimenti fallback allo statico
  const componentName = aiResult?.componentName && aiResult.componentName !== "FALLBACK" 
    ? aiResult.componentName 
    : selectedSection.name;

  const layoutClasses = aiResult?.layoutClasses?.length 
    ? aiResult.layoutClasses.join(" ") 
    : selectedSection.bootstrapClasses;

  const scssImports = aiResult?.scssImports?.length 
    ? aiResult.scssImports 
    : selectedSection.scssImports;

  const techNotes = aiResult?.techNotes || selectedSection.techNote;
  const codeSnippet = aiResult?.htmlSnippet || selectedSection.codeSnippet;

  // 3. Render principale con integrazione AI
  return (
    
    <div className="panel-section">
      <div className="section-details">
        <div className="section-header">
          <span className={`section-badge section-${selectedSection.id}`}>
            {isAnalyzing ? (
              <span className="d-flex align-items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> Analisi AI in corso...
              </span>
            ) : (
              componentName
            )}
          </span>
          <button type="button" className="btn-clear" onClick={onClearSelection}>
            <X size={14} />
          </button>
        </div>

        {/* Banner Errore AI (se presente, mostra fallback in uso) */}
        {aiResult?.error && (
          <div className="ai-error-banner">
            <Sparkles size={14} className="flex-shrink-0" />
            <span>AI non disponibile: {aiResult.error}. Uso template statico.</span>
          </div>
        )}

        <div className="section-code-snippet">
          <div className="snippet-header">
            <h5><Code2 size={16} /> Codice HTML Consigliato</h5>
            <button type="button" className="btn-copy-code" onClick={() => onCopy(codeSnippet, "Codice copiato")}>
              <Copy size={13} /> Copia Tutto
            </button>
          </div>
          <pre className="code-box">{codeSnippet}</pre>
        </div>

        <div className="section-info-grid">
          <div className="info-item">
            <span className="info-label">Tag Semantico:</span>
            <code className="info-value">&lt;{selectedSection.tag}&gt;</code>
          </div>
          <div className="info-item">
            <span className="info-label">Heading Tag:</span>
            <code className="info-value">
              {selectedSection.headingTag === "none" ? "Nessuno" : `<${selectedSection.headingTag}>`}
            </code>
          </div>
          {aiResult?.seoTags?.h1 && (
            <div className="info-item">
              <span className="info-label">H1 Suggerito:</span>
              <span className="info-value" style={{ color: "#34d399" }}>{aiResult.seoTags.h1}</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">Font Ruolo:</span>
            <span className="info-value">
              {selectedSection.fontRole === "h1h2" ? "Titoli (H1/H2)" : selectedSection.fontRole === "subtitles" ? "Sottotitoli" : "Corpo testo"}
            </span>
          </div>
        </div>

        <div className="section-layout-note">
          <h5>Layout Consigliato:</h5>
          <p>{techNotes}</p>
        </div>

        <div className="section-bootstrap-classes">
          <h5>Classi Bootstrap:</h5>
          <div style={{ position: "relative" }}>
            <code className="code-block">{layoutClasses}</code>
            <button type="button" className="btn-copy-small" onClick={() => onCopy(layoutClasses, "Classi copiate")}>
              <Copy size={12} />
            </button>
          </div>
        </div>

        <div className="section-scss-imports">
          <h5>Import SCSS:</h5>
          <ul className="imports-list">
            {scssImports.map((imp, idx) => (
              <li key={idx} className="import-item">
                <code>{imp}</code>
                <button type="button" className="btn-copy-small" onClick={() => onCopy(imp, "Import copiato")}>
                  <Copy size={12} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        
      </div>
    </div>
  );
};