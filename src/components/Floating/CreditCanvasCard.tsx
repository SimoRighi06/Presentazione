import React, { useState, useRef, useEffect } from "react";
import { Code, X, User, Palette, Building, Briefcase } from "lucide-react";
import gsap from "gsap";

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

  // Animazione GSAP per l'apertura dal basso a sinistra
  useEffect(() => {
    if (isOpen && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.8, opacity: 0, y: 40, transformOrigin: "bottom left" },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" },
      );
    }
  }, [isOpen]);

  return (
    <div
      className="position-fixed"
      style={{ bottom: "2.5%", left: "2.5%", zIndex: 9999 }}
    >
      {isOpen && (
        <div
          ref={cardRef}
          className="cloud-glass-card p-4 shadow-lg mb-3"
          style={{
            width: "420px",
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <h6
              className="m-0 fw-bold d-flex align-items-center gap-2"
              style={{ fontSize: "1rem" }}
            >
              <Code size={20} className="arancione" />
              Credits Team
            </h6>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center"
            >
              <X size={16} />
            </button>
          </div>

          {/* LISTA CREDITI TEAM */}
          <div
            className="d-flex flex-column gap-3 font-monospace"
            style={{ fontSize: "0.95rem" }}
          >
            {/* AZIENDE (Stampa se almeno una è presente, gestendo dinamicamente la "&" o il singolo valore) */}
            {(azienda1 || azienda2) && (
              <div className="d-flex align-items-start gap-2">
                <Building size={20} className="arancione mt-1 shrink-0" />
                <div>
                  <span
                    className="text-muted d-block"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Partner
                  </span>
                  <span className="fw-semibold text-dark">
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
                  <span
                    className="text-muted d-block"
                    style={{ fontSize: "0.82rem" }}
                  >
                    UI/UX Design
                  </span>
                  <span className="fw-semibold text-dark">{designer}</span>
                </div>
              </div>
            )}

            {/* CONSULENTE */}
            {consulente && (
              <div className="d-flex align-items-start gap-2 pt-2 border-top">
                <Briefcase size={20} className="arancione mt-1 shrink-0" />
                <div>
                  <span
                    className="text-muted d-block"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Consulenza Commerciale
                  </span>
                  <span className="fw-semibold text-dark">{consulente}</span>
                </div>
              </div>
            )}

            {/* DEVELOPER */}
            {developer && (
              <div className="d-flex align-items-start gap-2 pt-2 border-top">
                <User size={20} className="arancione mt-1 shrink-0" />
                <div>
                  <span
                    className="text-muted d-block"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Development & Motion
                  </span>
                  <span className="fw-semibold text-dark">{developer}</span>
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
          className="btn rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "48px",
            height: "48px",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
          }}
          title="Crediti del Team"
        >
          <Code size={30} className="arancione" />
        </button>
      )}
    </div>
  );
};