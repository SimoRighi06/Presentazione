import React, { useState, useRef, useEffect } from "react";
import {
  Info,
  X,
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import gsap from "gsap";

interface InfoPopupCardProps {
  dominio?: string;
}

export const InfoPopupCard: React.FC<InfoPopupCardProps> = ({
  dominio = "hotellabussola.com",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.8, opacity: 0, y: 40, transformOrigin: "bottom right" },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" },
      );
    }
  }, [isOpen]);

  return (
    <div
      className="position-fixed"
      style={{ bottom: "2.5%", right: "2.5%", zIndex: 9999 }}
    >
      {isOpen && (
        <div
          ref={cardRef}
          className="cloud-glass-card p-4 shadow-lg mb-3"
          style={{
            width: "460px",
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.4)",
            fontFamily: "'Gilroy', sans-serif",
          }}
        >
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <h6 className="m-0 fw-bold d-flex align-items-center gap-2" style={{ fontSize: "1rem" }}>
              <ShieldCheck size={20} className="arancione" />
              Info Progetto & Crediti
            </h6>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center"
            >
              <X size={16} />
            </button>
          </div>

          <div
            className="d-flex flex-column gap-3"
            style={{ fontSize: "0.9rem", lineHeight: "1.5" }}
          >
            <div className="p-2 rounded bg-light bg-opacity-75 border border-light-subtle">
              <p className="m-0 fw-semibold text-dark">
                Il copyright della proposta grafica{" "}
                <span className="arancione">{dominio}</span> è di
                Tecnoprogress.
              </p>
            </div>

            <div
              className="text-secondary d-flex flex-column gap-2"
              style={{ fontSize: "0.82rem" }}
            >
              <p className="m-0">
                Le proposte grafiche sono immagini che rappresentano come
                apparirà il sito.
              </p>
              <p className="m-0">
                La strutturazione in html per la navigazione avverrà una volta
                scelta la proposta di preferenza.
              </p>
              <p className="m-0">
                I contenuti (immagini e testi) sono di esempio e in fase di
                impaginazione potranno essere modificati e/o sostituiti.
              </p>
            </div>

            <div
              className="pt-2 border-top d-flex flex-column gap-1 text-muted"
              style={{ fontSize: "0.72rem" }}
            >
              <div
                className="fw-bold text-dark d-flex align-items-center gap-1 mb-1"
                style={{ fontSize: "0.82rem" }}
              >
                <Building size={14} className="arancione" />
                Tecnoprogress S.p.A.
              </div>

              <div className="d-flex align-items-center gap-2">
                <MapPin size={12} className="shrink-0" />
                <span>Via S.Andrea, 53 - Arco (TN)</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Phone size={12} className="shrink-0" />
                <a
                  href="tel:0464570720"
                  className="text-decoration-none text-muted"
                >
                  Tel. 0464570720
                </a>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Mail size={12} className="shrink-0" />
                <a
                  href="mailto:modifiche@tecnoprogress.net"
                  className="text-decoration-none text-muted"
                >
                  modifiche@tecnoprogress.net
                </a>
              </div>

              <div
                className="text-muted mt-2 pt-1 border-top"
                style={{ fontSize: "0.68rem" }}
              >
                P.IVA 01442520225
              </div>
            </div>
          </div>
        </div>
      )}

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
          <Info size={22} className="arancione" />
        </button>
      )}
    </div>
  );
};
