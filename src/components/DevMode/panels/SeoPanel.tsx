// components/DevMode/panels/SeoPanel.tsx
import React from "react";
import { Copy, Sparkles } from "lucide-react";
import type { SeoSectionItem, TypographyAssignment } from "../../../types/config";

interface SeoPanelProps {
  activeTab: string;
  seoSections: SeoSectionItem[];
  typography: TypographyAssignment;
  onCopy: (text: string, label: string) => void;
}

export const SeoPanel: React.FC<SeoPanelProps> = ({ activeTab, seoSections, typography, onCopy }) => (
  <div className="panel-seo">
    <div className="panel-header-info">
      <div>
        <h3 className="panel-title">Albero Semantico & Heading Tags</h3>
        <p className="panel-subtitle">
          Gerarchia H1/H2 e layout Bootstrap per la pagina <strong>{activeTab}</strong>
        </p>
      </div>
    </div>
    <div className="seo-items-list">
      {seoSections.map((sec, idx) => (
        <div key={sec.id || idx} className="seo-item-card">
          <div className="seo-item-top">
            <div className="badges-group">
              <span className={`tag-badge tag-${sec.tag}`}>&lt;{sec.tag}&gt;</span>
              {sec.headingTag && sec.headingTag !== "none" && (
                <span className={`heading-badge heading-${sec.headingTag}`}>&lt;{sec.headingTag.toUpperCase()}&gt;</span>
              )}
            </div>
            {sec.headingText && (
              <button type="button" className="btn-mini-copy" onClick={() => onCopy(sec.headingText || "", "Titolo copiato")} title="Copia testo SEO">
                <Copy size={13} />
              </button>
            )}
          </div>
          {sec.headingText && <h4 className="seo-heading-text">"{sec.headingText}"</h4>}
          <div className="seo-meta-grid">
            <div className="meta-box">
              <span className="meta-label">Font Ruolo:</span>
              <span className="meta-value font-mono">
                {sec.assignedFontRole === "h1h2" ? `Font 1 (Titoli - ${typography.h1h2Font})`
                  : sec.assignedFontRole === "subtitles" ? `Font 2 (Sottotitoli - ${typography.subtitlesFont || typography.h1h2Font})`
                  : `Font 3 (Body - ${typography.bodyFont})`}
              </span>
            </div>
            {sec.layoutNote && (
              <div className="meta-box">
                <span className="meta-label">Layout:</span>
                <span className="meta-value">{sec.layoutNote}</span>
              </div>
            )}
          </div>
          {sec.techNote && (
            <div className="tech-note-box">
              <Sparkles size={14} className="text-warning flex-shrink-0" />
              <span>{sec.techNote}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);