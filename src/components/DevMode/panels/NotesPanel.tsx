// components/DevMode/panels/NotesPanel.tsx
import React from "react";
import type { DevPageSpec } from "../../../types/config";

interface NotesPanelProps {
  checkProgress: number;
  checkedItems: Record<string, boolean>;
  onToggleCheck: (id: string) => void;
  currentDevSpec: DevPageSpec;
  generalDevTips?: string[];
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  checkProgress, checkedItems, onToggleCheck, currentDevSpec, generalDevTips,
}) => {
  const checks = [
    { id: "h1-single", title: "Un solo tag <h1> per pagina", desc: "Il tag H1 deve contenere la parola chiave principale del sito o dell'hotel." },
    { id: "webp-opt", title: "Immagini WebP & Risoluzione Adattiva", desc: "Convertire tutti gli asset in WebP (max 1920px per hero, 800px per card). Target < 200KB." },
    { id: "alt-tags", title: "Attributi alt descrittivi su tutti i tag <img>", desc: "Essenziale per punteggio Lighthouse SEO 100/100 e accessibilità per ipovedenti." },
    { id: "contrast-wcag", title: "Contrasto minimo 4.5:1 (WCAG AA)", desc: "Verificare la leggibilità dei testi rispetto ai colori di sfondo scelti." },
    { id: "schema-org", title: "Markup Schema.org JSON-LD", desc: "Includere lo schema Hotel / LocalBusiness con indirizzo, telefono e coordinate." },
    { id: "lazy-load", title: "Lazy Loading su Immagini Secondarie", desc: 'Utilizzare loading="lazy" e decoding="async" per tutte le immagini sotto il Fold.' },
  ];

  return (
    <div className="panel-notes">
      <div className="panel-header-info">
        <h3 className="panel-title">Checklist Sviluppo Frontend</h3>
        <div className="progress-container">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Avanzamento specifiche:</span>
            <span className="text-light fw-bold">{checkProgress}%</span>
          </div>
          <div className="progress" style={{ height: "6px", background: "#2d3748" }}>
            <div className="progress-bar bg-success" style={{ width: `${checkProgress}%`, transition: "width 0.3s" }} />
          </div>
        </div>
      </div>
      <div className="checklist-items">
        {checks.map((c) => (
          <label key={c.id} className="check-item">
            <input type="checkbox" checked={checkedItems[c.id] || false} onChange={() => onToggleCheck(c.id)} />
            <div className="check-text">
              <strong>{c.title}</strong>
              <span>{c.desc}</span>
            </div>
          </label>
        ))}
      </div>
      {((currentDevSpec.pageNotes && currentDevSpec.pageNotes.length > 0) || (generalDevTips && generalDevTips.length > 0)) && (
        <div className="custom-notes-section mt-4">
          <h4 className="small text-uppercase text-muted fw-bold mb-3">Note Aggiuntive del Team</h4>
          <ul className="custom-notes-list">
            {(currentDevSpec.pageNotes || []).map((note, idx) => <li key={`pn-${idx}`}>{note}</li>)}
            {(generalDevTips || []).map((tip, idx) => <li key={`gt-${idx}`}>{tip}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};