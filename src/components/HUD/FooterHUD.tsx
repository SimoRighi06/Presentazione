import React from "react";
import { Presentation } from "lucide-react";
import { type NavItem } from "../../types/config";

interface FooterHUDProps {
  navItems?: NavItem[];
  activeTab?: string;
  onSelectTab?: (item: NavItem) => void;
  onOpenPresentation?: () => void; // Funzione per tornare al PDF
}

export const FooterHUD: React.FC<FooterHUDProps> = ({
  navItems = [],
  activeTab,
  onSelectTab,
  onOpenPresentation,
}) => {
  return (
    <footer className="position-fixed bottom-0 start-50 translate-middle-x mb-4 z-3">
      <nav className="cloud-glass-card d-flex align-items-center gap-2 p-2 rounded-pill shadow">
        
        {/* Tasto rapido per tornare alla Presentazione PDF */}
        {onOpenPresentation && (
          <button
            type="button"
            onClick={onOpenPresentation}
            className="btn btn-sm btn-dark rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm fw-semibold"
            title="Torna alla Presentazione"
          >
            <Presentation size={16} />
            <span className="d-none d-sm-inline">Presentazione</span>
          </button>
        )}

        {/* Separatore visivo se il tasto presentazione è attivo */}
        {onOpenPresentation && navItems.length > 0 && (
          <div className="vr opacity-25 mx-1" />
        )}

        {/* Lista delle sezioni della bozza */}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab?.(item)}
              className={`btn btn-sm rounded-pill px-3 py-2 transition-all ${
                isActive
                  ? "btn-dark-glass shadow-sm fw-bold"
                  : "btn-light text-dark bg-transparent border-0 opacity-75"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </footer>
  );
};