// components/DevMode/DevModeTopbar.tsx
import React from "react";
import type { AppConfig, NavItem } from "../../types/config";
import {
  X, Grid, Ruler, FileText, Maximize2, Minimize2, Code,
} from "lucide-react";
import type { ZoomMode } from "./hooks/useDevMode";

interface DevModeTopbarProps {
  config: AppConfig;
  siteParam: string;
  activeTab: string;
  zoomMode: ZoomMode;
  showGrid: boolean;
  showFold: boolean;
  onSelectTab: (item: NavItem) => void;
  onToggleZoom: () => void;
  onToggleGrid: () => void;
  onToggleFold: () => void;
  onExportSpec: () => void;
  onCloseDev: () => void;
}

export const DevModeTopbar: React.FC<DevModeTopbarProps> = ({
  config, siteParam, activeTab, zoomMode, showGrid, showFold,
  onSelectTab, onToggleZoom, onToggleGrid, onToggleFold,
  onExportSpec, onCloseDev,
}) => (
  <header className="devmode-topbar">
    <div className="topbar-left">
      <div className="brand-group">
        <span className="brand">Tecnoprogress</span>
        <span className="badge-dev">
          <Code size={12} className="me-1" /> DEV WORKBENCH
        </span>
      </div>
      <span className="divider">|</span>
      <span className="site-name text-truncate" title={config.dominio || siteParam}>
        {config.dominio || siteParam}
      </span>
      <div className="page-selector-wrapper">
        <span className="selector-label">Pagina:</span>
        <select
          value={activeTab}
          onChange={(e) => {
            const selected = config.navItems?.find((item) => item.id === e.target.value);
            if (selected) onSelectTab(selected);
            else onSelectTab({ id: e.target.value, label: e.target.value, draftUrl: e.target.value });
          }}
          className="page-selector"
        >
          {config.navItems?.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>
    </div>
    <div className="topbar-right">
      <button type="button" className={`toggle-btn ${zoomMode === "original" ? "active" : ""}`} onClick={onToggleZoom} title="Alterna tra adatta a schermo e 100% pixel reali (1920px)">
        {zoomMode === "fit" ? <><Maximize2 size={15} /> 100% Pixel Reali</> : <><Minimize2 size={15} /> Adatta Schermo</>}
      </button>
      <button type="button" className={`toggle-btn ${showGrid ? "active" : ""}`} onClick={onToggleGrid} title="Attiva/disattiva la griglia a 12 colonne Bootstrap con container">
        <Grid size={15} /> Griglia 12 Col
      </button>
      <button type="button" className={`toggle-btn ${showFold ? "active" : ""}`} onClick={onToggleFold} title="Visualizza linee di fold (1080px e 900px)">
        <Ruler size={15} /> Linee di Fold
      </button>
      <button type="button" className="btn-export" onClick={onExportSpec} title="Genera e copia negli appunti il file SPEC.md per la repo Git">
        <FileText size={15} /> Esporta SPEC.md
      </button>
      <button type="button" className="btn-close" onClick={onCloseDev} title="Torna alla vista presentazione/bozza">
        <X size={17} /> Esci
      </button>
    </div>
  </header>
);