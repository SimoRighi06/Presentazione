// components/DevMode/panels/ColorsPanel.tsx
import React from "react";
import { Copy } from "lucide-react";
import { getContrastColor } from "../utils/devModeHelpers";

interface ColorsPanelProps {
  colors: string[];
  onCopy: (text: string, label: string) => void;
}

export const ColorsPanel: React.FC<ColorsPanelProps> = ({ colors, onCopy }) => (
  <div className="panel-colors">
    <div className="panel-header-info">
      <h3 className="panel-title">Palette Colori del Progetto</h3>
      <p className="panel-subtitle">Clicca su qualsiasi swatch per copiare il codice HEX negli appunti</p>
    </div>
    <div className="colors-cards-grid">
      {(colors || []).map((hex, index) => {
        const textColor = getContrastColor(hex);
        return (
          <div key={index} className="color-card" onClick={() => onCopy(hex, `Colore ${hex} copiato`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onCopy(hex, `Colore ${hex} copiato`); }}>
            <div className="swatch-large" style={{ backgroundColor: hex, color: textColor }}>
              <span className="swatch-index">#{index + 1}</span>
              <span className="swatch-contrast-tag" style={{ color: textColor }}>{textColor === "#ffffff" ? "Dark bg" : "Light bg"}</span>
            </div>
            <div className="swatch-footer">
              <span className="swatch-var-name">--color-{index + 1}</span>
              <span className="swatch-hex-code">{hex.toUpperCase()}</span>
            </div>
          </div>
        );
      })}
    </div>
    <div className="code-snippets-section mt-4">
      <div className="snippet-header">
        <h4>Variabili Colori CSS</h4>
        <button type="button" className="btn-copy-code" onClick={() => onCopy((colors || []).map((hex, i) => `  $color--${i + 1}: ${hex};`).join("\n"), "Variabili colori copiate")}>
          <Copy size={13} /> Copia Tutte
        </button>
      </div>
      <pre className="code-box">{(colors || []).map((hex, i) => `  $color--${i + 1}: ${hex};`).join("\n")}</pre>
    </div>
  </div>
);