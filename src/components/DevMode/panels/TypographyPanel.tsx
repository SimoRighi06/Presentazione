// components/DevMode/panels/TypographyPanel.tsx
import React from "react";
import { Copy } from "lucide-react";
import type { TypographyAssignment } from "../../../types/config";

interface TypographyPanelProps {
  typography: TypographyAssignment;
  onCopy: (text: string, label: string) => void;
}

export const TypographyPanel: React.FC<TypographyPanelProps> = ({ typography, onCopy }) => {
  const fonts = [
    { role: "h1", label: "Font 1 — Titoli (H1, H2, Hero)", badge: "badge-role-h1", name: typography.h1h2Font, preview: "Hotel Torbole Vista Lago", previewClass: "preview-heading", caption: "Consigliato: 700 Bold / 800 ExtraBold • line-height 1.15" },
    { role: "sub", label: "Font 2 — Sottotitoli (H3, Claim, Lead)", badge: "badge-role-sub", name: typography.subtitlesFont || typography.h1h2Font, preview: "Un'oasi di tranquillità ed eccellenza sul Lago di Garda", previewClass: "preview-subheading", caption: "Consigliato: 400 Regular / Italic • line-height 1.4" },
    { role: "body", label: "Font 3 — Corpo Testo (Paragrafi, Menu, Bottoni)", badge: "badge-role-body", name: typography.bodyFont, preview: "Le nostre suite offrono comfort esclusivo con finiture artigianali.", previewClass: "preview-body", caption: "Consigliato: 400 Regular / 500 Medium • font-size: 16px" },
  ];

  return (
    <div className="panel-typo">
      <div className="panel-header-info">
        <h3 className="panel-title">Mappa Tipografica & Token</h3>
        <p className="panel-subtitle">Associazione ruoli font e codice pronto da incollare</p>
      </div>
      <div className="typo-roles-list">
        {fonts.map((f) => (
          <div key={f.role} className="typo-role-card">
            <div className="role-header">
              <span className={`badge-role ${f.badge}`}>{f.label}</span>
              <span className="font-name-badge">{f.name}</span>
            </div>
            <div className="font-preview-box" style={{ fontFamily: f.name }}>
              <p className={f.previewClass}>{f.preview}</p>
              <span className="preview-caption">{f.caption}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="code-snippets-section">
        <div className="snippet-header">
          <h4>Snippet Design Tokens</h4>
          <div className="d-flex gap-2">
            <button type="button" className="btn-copy-code" onClick={() => onCopy(
              `:root {\n  --font-heading: '${typography.h1h2Font}', sans-serif;\n  --font-subheading: '${typography.subtitlesFont || typography.h1h2Font}', sans-serif;\n  --font-body: '${typography.bodyFont}', sans-serif;\n}`,
              "CSS Tokens copiati",
            )}><Copy size={13} /> Copia :root CSS</button>
            <button type="button" className="btn-copy-code btn-copy-tailwind" onClick={() => onCopy(
              `fontFamily: {\n  heading: ['${typography.h1h2Font}', 'sans-serif'],\n  subheading: ['${typography.subtitlesFont || typography.h1h2Font}', 'sans-serif'],\n  body: ['${typography.bodyFont}', 'sans-serif'],\n}`,
              "Tailwind Config copiata",
            )}><Copy size={13} /> Copia Tailwind</button>
          </div>
        </div>
        <pre className="code-box">{`:root {\n  --font-heading: '${typography.h1h2Font}', sans-serif;\n  --font-subheading: '${typography.subtitlesFont || typography.h1h2Font}', sans-serif;\n  --font-body: '${typography.bodyFont}', sans-serif;\n}`}</pre>
      </div>
    </div>
  );
};