import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import tpLogo from "../../assets/logo-tp-black.svg";

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
  const [inputValue, setInputValue] = useState(currentUrl);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  // Rilevamento automatico ?mode=admin o scorciatoia Alt + S
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("mode") === "admin") {
      setIsAdminMode(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Funziona con Alt/Option oppure Cmd (⌘) + S su Mac/Win
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
    <header className="fixed-top w-100 p-4 d-flex justify-content-between align-items-center z-3 pointer-events-auto">
      {/* LOGO BRAND (A SINISTRA) */}
      <div className="d-flex align-items-center">
        <img
          src={tpLogo}
          alt="Tecnoprogress"
          style={{ height: "32px", objectFit: "contain" }}
          loading="eager"
              decoding="async"
              fetchPriority="high"
        />
      </div>

      {/* TITOLO DOMINIO (AL CENTRO) */}
      <div className="position-absolute top-50 start-50 translate-middle">
        <h1 className="m-0 fs-4 fw-normal text-dark"><strong>{dominio}</strong> </h1>
      </div>

      {/* DESTRA: SEARCHBAR (ADMIN) O CONTATTI GLASS (CLIENTE) */}
      {isAdminMode ? (
        <form
          onSubmit={handleSubmit}
          className="position-relative"
          style={{ width: "320px" }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="bozza01 o URL..."
            className="btn btn-cloud w-100 ps-4 pe-5 text-start"
            style={{ borderRadius: "50px", outline: "none" }}
            autoFocus
          />
          <div className="position-absolute end-0 top-50 translate-middle-y me-3 d-flex align-items-center gap-2">
            {inputValue && (
              <X
                size={15}
                className="text-muted"
                onClick={() => {
                  setInputValue("");
                  onUrlChange("bozza01");
                }}
                style={{ cursor: "pointer" }}
              />
            )}
            <button
              type="submit"
              className="border-0 bg-transparent p-0 text-muted d-flex align-items-center"
            >
              <Search size={16} style={{ cursor: "pointer" }} />
            </button>
          </div>
        </form>
      ) : (
        <div className="d-flex align-items-center gap-2">
          <a
            href="https://www.tecnoprogress.net/"
            className="btn btn-cloud-black  d-flex align-items-center gap-2 px-4 py-2"
            style={{ borderRadius: "50px", fontSize: "14px" }}
          >
            <span className="text-white">Conosciamoci</span>
          </a>

          <a href="https://www.instagram.com/tecnoprogress/" target="_blank">
            <i className="bi bi-instagram text-black fs-4 me-2"></i>
          </a>

          <a href="https://it.linkedin.com/company/tecnoprogress" target="_blank">
            <i className="bi bi-linkedin text-black fs-4"></i>
          </a>
        </div>
      )}
    </header>
  );
};
