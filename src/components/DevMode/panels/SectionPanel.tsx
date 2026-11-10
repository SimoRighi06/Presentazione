// components/DevMode/panels/SectionPanel.tsx
import React from "react";
import { MousePointer, Target, X, Code2, Copy, Sparkles } from "lucide-react";
import type { SectionTemplate } from "../../../types/config";
import type { SelectionMode } from "../hooks/useDevMode";

interface SectionPanelProps {
  selectedSection: SectionTemplate | null;
  selectionMode: SelectionMode;
  onClearSelection: () => void;
  onSelectionModeChange: (mode: SelectionMode) => void;
  onCopy: (text: string, label: string) => void;
}

export const SectionPanel: React.FC<SectionPanelProps> = ({
  selectedSection, selectionMode, onClearSelection, onSelectionModeChange, onCopy,
}) => {
  if (!selectedSection) {
    return (
      <div className="panel-section">
        <div className="empty-state">
          <MousePointer size={48} className="text-muted mb-3" />
          <h4 className="text-muted">Nessuna sezione selezionata</h4>
          <p className="text-muted small">Clicca o trascina il mouse sull'immagine a sinistra per rilevare automaticamente la macro-sezione</p>
          <div className="selection-mode-toggle mt-4">
            <span className="small text-muted me-2">Modalità:</span>
            <button type="button" className={`btn-mode ${selectionMode === "click" ? "active" : ""}`} onClick={() => onSelectionModeChange("click")}>
              <MousePointer size={14} /> Click
            </button>
            <button type="button" className={`btn-mode ${selectionMode === "drag" ? "active" : ""}`} onClick={() => onSelectionModeChange("drag")}>
              <Target size={14} /> Drag
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-section">
      <div className="section-details">
        <div className="section-header">
          <span className={`section-badge section-${selectedSection.id}`}>{selectedSection.name}</span>
          <button type="button" className="btn-clear" onClick={onClearSelection}><X size={14} /></button>
        </div>
        <div className="section-info-grid">
          <div className="info-item">
            <span className="info-label">Tag Semantico:</span>
            <code className="info-value">&lt;{selectedSection.tag}&gt;</code>
          </div>
          <div className="info-item">
            <span className="info-label">Heading Tag:</span>
            <code className="info-value">{selectedSection.headingTag === "none" ? "Nessuno" : `<${selectedSection.headingTag}>`}</code>
          </div>
          <div className="info-item">
            <span className="info-label">Font Ruolo:</span>
            <span className="info-value">
              {selectedSection.fontRole === "h1h2" ? "Titoli (H1/H2)" : selectedSection.fontRole === "subtitles" ? "Sottotitoli" : "Corpo testo"}
            </span>
          </div>
        </div>
        <div className="section-layout-note">
          <h5>Layout Consigliato:</h5>
          <p>{selectedSection.layoutNote}</p>
        </div>
        <div className="section-bootstrap-classes">
          <h5>Classi Bootstrap:</h5>
          <div style={{ position: "relative" }}>
            <code className="code-block">{selectedSection.bootstrapClasses}</code>
            <button type="button" className="btn-copy-small" onClick={() => onCopy(selectedSection.bootstrapClasses, "Classi copiate")}>
              <Copy size={12} />
            </button>
          </div>
        </div>
        <div className="section-scss-imports">
          <h5>Import SCSS:</h5>
          <ul className="imports-list">
            {selectedSection.scssImports.map((imp, idx) => (
              <li key={idx} className="import-item">
                <code>{imp}</code>
                <button type="button" className="btn-copy-small" onClick={() => onCopy(imp, "Import copiato")}>
                  <Copy size={12} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="section-tech-note">
          <Sparkles size={14} className="text-warning flex-shrink-0" />
          <span>{selectedSection.techNote}</span>
        </div>
        <div className="section-code-snippet">
          <div className="snippet-header">
            <h5><Code2 size={16} /> Codice HTML Consigliato</h5>
            <button type="button" className="btn-copy-code" onClick={() => onCopy(selectedSection.codeSnippet, "Codice copiato")}>
              <Copy size={13} /> Copia Tutto
            </button>
          </div>
          <pre className="code-box">{selectedSection.codeSnippet}</pre>
        </div>
      </div>
    </div>
  );
};