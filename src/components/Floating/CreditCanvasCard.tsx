import React, { useState, useRef, useEffect } from "react";
import { Code, X, User, Palette, Building, Briefcase } from "lucide-react";
import gsap from "gsap";
import "./CreditInfoCard.css"

interface CreditsPopupCardProps {
  azienda1?: string;
  azienda2?: string;
  designer?: string;
  consulente?: string;
  developer?: string;
}

export const CreditsPopupCard: React.FC<CreditsPopupCardProps> = ({
  azienda1,
  azienda2,
  designer,
  consulente,
  developer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Animazione GSAP per l'apertura
  useEffect(() => {
    if (isOpen && cardRef.current) {
      // Kill eventuali animazioni precedenti per evitare conflitti
      gsap.killTweensOf(cardRef.current);
      
      gsap.fromTo(
        cardRef.current,
        { 
          scale: 0.9, 
          opacity: 0, 
          y: 30, 
          transformOrigin: "bottom left" 
        },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          ease: "back.out(1.2)" 
        },
      );
    }
  }, [isOpen]);

  return (
    <div className="credits-popup-wrapper position-fixed">
      {isOpen && (
        <div
          ref={cardRef}
          className="cloud-glass-card p-3 p-md-4 shadow-lg mb-3 credits-popup-card"
        >
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <h6
              className="m-0 fw-bold d-flex align-items-center gap-2"
              style={{ fontSize: "1rem" }}
            >
              <Code size={16} className="arancione" />
              Credits Team
            </h6>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center"
              aria-label="Chiudi crediti"
              style={{ width: "32px", height: "32px" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* LISTA CREDITI TEAM */}
          <div
            className="d-flex flex-column gap-3 font-monospace"
            style={{ fontSize: "0.9rem" }}
          >
            {/* AZIENDE */}
            {(azienda1 || azienda2) && (
              <div className="d-flex align-items-start gap-2">
                <Building size={20} className="arancione mt-1 shrink-0" />
                <div>
                  <span className="text-muted d-block" style={{ fontSize: "0.82rem" }}>
                    Partner
                  </span>
                  <span className="fw-semibold text-dark text-break">
                    {azienda1 && azienda2 ? `${azienda1} & ${azienda2}` : azienda1 || azienda2}
                  </span>
                </div>
              </div>
            )}

            {/* DESIGNER */}
            {designer && (
              <div className="d-flex align-items-start gap-2 pt-2 border-top">
                <Palette size={20} className="arancione mt-1 shrink-0" />
                <div>
                  <span className="text-muted d-block" style={{ fontSize: "0.82rem" }}>
                    UI/UX Design
                  </span>
                  <span className="fw-semibold text-dark text-break">{designer}</span>
                </div>
              </div>
            )}

            {/* CONSULENTE */}
            {consulente && (
              <div className="d-flex align-items-start gap-2 pt-2 border-top">
                <Briefcase size={20} className="arancione mt-1 shrink-0" />
                <div>
                  <span className="text-muted d-block" style={{ fontSize: "0.82rem" }}>
                    Consulenza Commerciale
                  </span>
                  <span className="fw-semibold text-dark text-break">{consulente}</span>
                </div>
              </div>
            )}

            {/* DEVELOPER */}
            {developer && (
              <div className="d-flex align-items-start gap-2 pt-2 border-top">
                <User size={20} className="arancione mt-1 shrink-0" />
                <div>
                  <span className="text-muted d-block" style={{ fontSize: "0.82rem" }}>
                    Development & Motion
                  </span>
                  <span className="fw-semibold text-dark text-break">{developer}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PULSANTE CODE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="credits-popup-btn rounded-circle d-flex align-items-center justify-content-center"
          aria-label="Apri crediti del team"
          title="Crediti del Team"
        >
          <Code size={15} className="arancione" />
        </button>
      )}
    </div>
  );
};