import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import tpLogo from "../../assets/logo-tp-black.svg";
import { Instagram, Linkedin } from "react-bootstrap-icons";

interface HeaderHUDProps {
  currentUrl: string;
  dominio: string;
  onUrlChange: (url: string) => void;
  brandLogoUrl?: string;
  clientName?: string;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  currentUrl,
  dominio,
  onUrlChange,
}) => {
  // ✅ 1. Lazy initialization: risolve l'errore "setState in effect" del linter
  const [isAdminMode, setIsAdminMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("mode") === "admin";
  });

  // ✅ 2. Stato locale per l'input, sincronizzato in modo sicuro tramite useEffect
  const [inputValue, setInputValue] = useState(currentUrl);

  // ✅ 3. Event listener per la scorciatoia da tastiera
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.code === "KeyS") {
        e.preventDefault();
        setIsAdminMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedInput = inputValue.trim().replace(/\s+/g, "");

    if (!cleanedInput) {
      onUrlChange("bozza01");
      return;
    }

    if (cleanedInput.toLowerCase().startsWith("bozza")) {
      onUrlChange(cleanedInput.toLowerCase());
    } else {
      let finalUrl = cleanedInput;
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = `http://${finalUrl}.bozzasito.com/bozze/bozza-preview.aspx#1`;
      }
      onUrlChange(finalUrl);
    }
  };

  return (
    <>
      <header className="fixed-top w-100 p-2 p-md-4 d-flex justify-content-between align-items-center z-3 pointer-events-auto">
        {/* 1. LOGO BRAND (A SINISTRA) */}
        <div className="d-flex align-items-center flex-shrink-0">
          <img
            src={tpLogo} // Sostituisci con brandLogoUrl se preferisci
            alt="Logo Tecnoprogress"
            style={{ height: "22px", objectFit: "contain" }} // 28px su mobile, più compatto
            className="d-sm-none" // Nascondi su schermi >= 576px
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <img
            src={tpLogo}
            alt="Logo Tecnoprogress"
            style={{ height: "32px", objectFit: "contain" }} // 32px su desktop
            className="d-none d-sm-block" // Mostra solo su schermi >= 576px
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        {/* 2. TITOLO DOMINIO (AL CENTRO) */}
        <div className="d-none d-sm-block position-absolute top-50 start-50 translate-middle text-center px-2">
          <h1
            className="m-0 fs-3 fs-md-4 fw-normal text-dark text-truncate"
            style={{ maxWidth: "300px", whiteSpace: "nowrap" }}
          >
            <strong>{dominio}</strong>
          </h1>
        </div>

        {/* 3. DESTRA: SEARCHBAR (ADMIN) O CONTATTI GLASS (CLIENTE) */}
        {isAdminMode ? (
          <form
            onSubmit={handleSubmit}
            className="position-relative flex-shrink-0"
            style={{ width: "100%", maxWidth: "280px" }} // maxWidth invece di width fissa per mobile
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="bozza01 o URL..."
              className="btn btn-cloud w-100 ps-4 pe-5 text-start"
              style={{
                borderRadius: "50px",
                outline: "none",
                fontSize: "0.9rem",
              }}
              autoFocus
            />
            <div className="position-absolute end-0 top-50 translate-middle-y me-3 d-flex align-items-center gap-2">
              {inputValue && (
                <X
                  size={15}
                  className="text-muted"
                  onClick={() => {
                    setInputValue("bozza01");
                    onUrlChange("bozza01");
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Cancella input"
                  style={{ cursor: "pointer" }}
                />
              )}
              <button
                type="submit"
                className="border-0 bg-transparent p-0 text-muted d-flex align-items-center"
                aria-label="Cerca bozza"
              >
                <Search size={16} style={{ cursor: "pointer" }} />
              </button>
            </div>
          </form>
        ) : (
          <div className="d-flex align-items-center gap-1 gap-md-3 flex-shrink-0">
            <a
              href="https://www.tecnoprogress.net/"
              className="btn btn-cloud-black d-flex align-items-center gap-2 px-2 px-md-4 py-1 py-md-2"
              style={{ borderRadius: "50px", fontSize: "13px" }}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visita il sito Tecnoprogress"
            >
              <span className=" text-white">Conosciamoci</span>

              {/* Versione compatta per mobile */}
            </a>

            <a
              href="https://www.instagram.com/tecnoprogress/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Profilo Instagram Tecnoprogress"
            >
              <Instagram color="black" size={20} className="d-sm-none" />
              <Instagram
                color="black"
                size={24}
                className="d-none d-sm-block"
              />
            </a>

            <a
              href="https://it.linkedin.com/company/tecnoprogress"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Profilo LinkedIn Tecnoprogress"
            >
              <Linkedin color="black" size={20} className="d-sm-none" />
              <Linkedin color="black" size={24} className="d-none d-sm-block" />
            </a>
          </div>
        )}
      </header>
      <div
        className="position-absolute start-50 translate-middle-x d-block mt-3 d-sm-none"
        style={{
          top: "4.5rem",
          textAlign: "center",
        }}
      >
        <h1
          className="m-0 fs-3 fs-md-4 fw-normal text-dark text-truncate"
          style={{ whiteSpace: "nowrap" }}
        >
          <strong>{dominio}</strong>
        </h1>
      </div>
    </>
  );
};
