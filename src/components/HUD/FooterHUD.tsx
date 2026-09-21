import React from "react";
import { Presentation } from "lucide-react";
import { type NavItem } from "../../types/config";
import "./FooterHUD.css"

interface FooterHUDProps {
  navItems?: NavItem[];
  activeTab?: string;
  onSelectTab?: (item: NavItem) => void;
  onOpenPresentation?: () => void;
}

export const FooterHUD: React.FC<FooterHUDProps> = ({
  navItems = [],
  activeTab,
  onSelectTab,
  onOpenPresentation,
}) => {
  return (
    <footer className="position-fixed bottom-0 start-50 translate-middle-x mb-3 mb-md-4 z-3 footer-hud-wrapper">
      <nav className="cloud-glass-card d-flex align-items-center gap-1 gap-md-2 p-2 px-2 p-md-2 rounded-pill shadow footer-hud-nav">
        

        {onOpenPresentation && (
          <button
            type="button"
            onClick={onOpenPresentation}
            className="btn btn-sm btn-dark rounded-pill px-2 px-md-3 py-1 py-md-2 me-3 md-md-0 d-flex align-items-center gap-1 gap-md-2 shadow-sm fw-semibold footer-btn"
            title="Torna alla Presentazione"
          >
            <Presentation size={16} className="footer-icon" />
            <span className="d-none d-sm-inline footer-btn-text">Presentazione</span>
          </button>
        )}

        {/* Separatore visivo se il tasto presentazione è attivo */}
        {onOpenPresentation && navItems.length > 0 && (
          <div className="vr opacity-25 mx-1 d-none d-sm-block" />
        )}

        {/* Lista delle sezioni della bozza - scrollabile su mobile */}
        <div className="d-flex align-items-center gap-1 gap-md-2 footer-nav-scroll">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab?.(item)}
                className={`btn btn-sm rounded-pill px-2 px-md-3 py-1 py-md-2 transition-all footer-btn ${
                  isActive
                    ? "btn-dark-glass shadow-sm fw-bold"
                    : "btn-light text-dark bg-transparent border-0 opacity-75"
                }`}
              >
                <span className="footer-btn-text">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </footer>
  );
};

