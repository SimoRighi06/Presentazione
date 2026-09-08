import { useState, useEffect, useRef } from "react";
import { Palette, Type, Loader2 } from "lucide-react";
import gsap from "gsap";
import { FloatingCard } from "./components/Floating/FloatingCard";
import { HeaderHUD } from "./components/HUD/HeaderHUD";
import { FooterHUD } from "./components/HUD/FooterHUD";
import { InfoPopupCard } from "./components/Floating/InfoPopupCard";
import { ConfigPanel } from "./components/ConfigPan/ConfigPanel";
import { CreditsPopupCard } from "./components/Floating/CreditCanvasCard";
import { PresentationViewer } from "./components/Presentation/PresentationViewer";
import { IndependentCustomCard } from "./components/Floating/CustomFloatingCard";
import { type AppConfig, DEFAULT_CONFIG } from "./types/config";
import { AdminLoginGate } from "./components/Login/AdminLoginGate";
/* import { type AdminLoginGateProps } from "./components/Login/AdminLoginGate"; */

import "./App.css";

// ✅ FIX: Funzione helper per estrarre il nome pulito da qualsiasi formato di dominio/URL
const getSiteParamFromDomain = (domain: string | undefined): string => {
  if (!domain) return "hotellabussola";
  return domain
    .replace(/^https?:\/\//i, "") // Rimuove http:// o https://
    .replace(/^www\./i, "") // Rimuove www.
    .split("/")[0] // Prende solo l'host, rimuove eventuali path
    .split(".")[0]; // Prende la prima parte (es. "tecnoprogress" da "tecnoprogress.com")
};

export default function App() {
  const [siteParam, setSiteParam] = useState("hotellabussola");
  const [activePage] = useState("1"); // usato per navigazione live .aspx
  const [draftUrl, setDraftUrl] = useState("bozza01");
  const isInteractive = true;
  const [isFocusedOnDraft, setIsFocusedOnDraft] = useState(false);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [viewMode, setViewMode] = useState<"admin" | "presentation" | "draft">(
    "admin",
  );
  const stageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ NEW: Stato per tracciare il caricamento dell'immagine
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Gestore del cambio tab/bozza
  const [activeTab, setActiveTab] = useState<string>(
    config.navItems?.[0]?.id || "home",
  );

  // =========================================================
  // CARICAMENTO CONFIG + MODALITÀ ADMIN + SCORCIATOIA
  // =========================================================
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("mode") === "admin") {
      setShowAdminLogin(true);
    }
    fetch("/config.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("config.json non trovato");
        }
        return res.json();
      })
      .then((data: AppConfig) => {
        setConfig(data);
        if (data.dominio) {
          // ✅ FIX: Usa la funzione helper per gestire anche URL completi
          setSiteParam(getSiteParamFromDomain(data.dominio));
        }
      })
      .catch(() => {
        setConfig(DEFAULT_CONFIG);
      });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.code === "KeyC") ||
        (e.altKey &&
          (e.code === "KeyC" || e.key.toLowerCase() === "c" || e.key === "ç"))
      ) {
        e.preventDefault();
        setShowAdminLogin(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // =========================================================
  // ✅ RESET LOADER QUANDO CAMBIA L'IMMAGINE
  // =========================================================
  useEffect(() => {
    if (isImage) {
      setIsImageLoading(true);
    }
  }, [draftUrl, siteParam]);

  // =========================================================
  // CLIENT / LOGO
  // =========================================================
  const brandLogoUrl = `http://${siteParam}.bozzasito.com/bozze/images/logos/logo.svg`;

  // =========================================================
  // TIPO DI BOZZA
  // =========================================================
  const isImage =
    !draftUrl.startsWith("http://") && !draftUrl.startsWith("https://");
  const imageUrl = isImage
    ? `/bozze-proxy/${siteParam}/images/${draftUrl}.jpg`
    : draftUrl;

  /* !! DEBUGG   */
 /*  console.group("🔍 DEBUG CARICAMENTO IMMAGINE");
  console.log("Input draftUrl:", draftUrl);
  console.log("Input siteParam:", siteParam);
  console.log("È una stringa semplice (isImage)?", isImage);
  console.log("URL Finale generato (imageUrl):", imageUrl);
  console.groupEnd(); */
  // --------------------

  // =========================================================
  // NOME CLIENTE
  // =========================================================
  const clientName = siteParam
    .replace(/-/g, " ")
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

  // =========================================================
  // CAMBIO URL
  // =========================================================
  const handleUrlChange = (newUrl: string) => {
    if (newUrl === "live-reset") {
      setDraftUrl(
        `http://${siteParam}.bozzasito.com/bozze/bozza-preview.aspx#${activePage}`,
      );
      return;
    }
    setDraftUrl(newUrl);
    if (newUrl.startsWith("http")) {
      try {
        const urlObj = new URL(newUrl);
        const clientDomain = urlObj.hostname.split(".")[0];
        setSiteParam(clientDomain);
      } catch {
        const match = newUrl.match(/https?:\/\/([^.]+)\.bozzasito\.com/);
        if (match?.[1]) {
          setSiteParam(match[1]);
        }
      }
    }
  };

  // =========================================================
  // PAGE ENTRANCE
  // =========================================================
  useEffect(() => {
    if (isConfigMode || viewMode !== "draft") {
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });
      tl.fromTo(
        ".cloud-bg-canvas",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
        },
      )
        .fromTo(
          ".center-stage-container",
          {
            opacity: 0,
            y: 30,
            scale: 0.96,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
          },
          "-=0.5",
        )
        .fromTo(
          "header, .bottom-nav",
          {
            opacity: 0,
            y: -10,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
          },
          "-=0.3",
        );
    }, containerRef);
    return () => {
      ctx.revert();
    };
  }, [isConfigMode, viewMode]);

  // =========================================================
  // 3D TILT
  // =========================================================
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) {
      return;
    }
    const rect = stageRef.current.getBoundingClientRect();
    const tiltFactor = isFocusedOnDraft ? 0.3 : 1;
    const rotateX =
      ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) *
      -3 *
      tiltFactor;
    const rotateY =
      ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) *
      3 *
      tiltFactor;
    gsap.to(stageRef.current, {
      rotateX,
      rotateY,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  if (showAdminLogin && !isAuthenticated) {
  return (
    <AdminLoginGate
      onSuccess={() => {
        setIsAuthenticated(true);
        setShowAdminLogin(false);
        setIsConfigMode(true);
      }}
      onCancel={() => {
        setShowAdminLogin(false);
      }}
    />
  );
}

  const handleMouseLeaveStage = () => {
    setIsFocusedOnDraft(false);
    if (!stageRef.current) {
      return;
    }
    gsap.to(stageRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  // =========================================================
  // GESTIONE VISTE (ADMIN / PRESENTATION / DRAFT)
  // =========================================================
  // 1. Se siamo in modalità Admin ( `isConfigMode`  attivo)
  if (isConfigMode) {
    return (
      <>
        {/* Se l'utente clicca  "Via Presentazione " dal pannello admin */}
        {viewMode === "presentation" && (
          <PresentationViewer
            siteParam={siteParam}
            presentationUrl={config.presentationUrl}
            navItems={config.navItems || []}
            onStartDraft={() => {
              setViewMode("draft");
              setIsConfigMode(false); // Esce dall'admin e mostra la bozza del sito
            }}
            onOpenAdmin={() => {
              setViewMode("admin");
              setIsConfigMode(true); // Ritorna al pannello admin
            }}
          />
        )}
        {/* Pannello Admin standard */}
        {viewMode === "admin" && (
          <ConfigPanel
            initialConfig={config}
            onApplyConfig={(updatedConfig) => {
              setConfig(updatedConfig);
              // ✅ FIX CRUCIALE: Aggiorna siteParam quando si salva la config dal pannello admin
              if (updatedConfig.dominio) {
                setSiteParam(getSiteParamFromDomain(updatedConfig.dominio));
              }
              setViewMode("draft");
              setIsConfigMode(false);
            }}
            onStartPresentation={() => {
              setViewMode("presentation"); // Lancia il viewer PDF
            }}
          />
        )}
      </>
    );
  }

  // 2. Se l'utente preme "Passa al Progetto Sito" dal PDF durante la presentazione
  if (viewMode === "presentation") {
    return (
      <PresentationViewer
        siteParam={siteParam}
        presentationUrl={config.presentationUrl}
        navItems={config.navItems || []}
        onStartDraft={() => {
          setViewMode("draft");
          setIsConfigMode(false); // Esce dall'admin e mostra la bozza del sito
        }}
        onOpenAdmin={() => {
          setViewMode("admin");
          setIsConfigMode(true); // Riapre il pannello di configurazione
        }}
      />
    );
  }

  // =========================================================
  // MAIN (VISTA BOZZA SITO FINALE)
  // =========================================================
  return (
    <div
      ref={containerRef}
      className={`cloud-viewport ${isFocusedOnDraft ? "focus-active" : ""}`}
    >
      <div className="cloud-bg-canvas" />
      {/* HEADER HUD */}
      <HeaderHUD
        currentUrl={draftUrl}
        brandLogoUrl={brandLogoUrl}
        clientName={clientName}
        onUrlChange={handleUrlChange}
        dominio={config.dominio || `${siteParam}.com`}
      />
      {/* MAIN STAGE */}
      <main className="d-flex flex-column align-items-center justify-content-center w-100 h-100 position-relative z-1">
        {/* CARD 01 — FONT */}
        <FloatingCard
          style={{ top: "40%", right: "5%", width: "330px" }}
          introDelay={0.06}
          introDuration={1.2}
          stackX={-6}
          stackY={-4}
          introRotation={-3}
          introScale={0.98}
          floatRange={12}
          speed={4.2}
          floatRotation={1.2}
        >
          <div
            className="d-flex align-items-center gap-2 mb-3 text-muted font-monospace border-bottom pb-2"
            style={{ fontSize: "inherit" }}
          >
            <Type size={16} />
            Font Utilizzati
          </div>
          <ul className="list-unstyled mb-0 ms-1 d-flex text-start ps-4 flex-column gap-2 mt-3">
            {config.fonts?.map((font, index) => (
              <li
                key={font}
                className={
                  index === 0
                    ? "fw-bold text-dark mt-2 fs-4"
                    : "text-muted mt-2 fs-4"
                }
              >
                • {font}
              </li>
            ))}
          </ul>
        </FloatingCard>
        {/* CARD 02 — CREDITS */}
        <CreditsPopupCard azienda1="Tecnoprogress" />
        {/* CARD 03 — PALETTE */}
        <FloatingCard
          style={{ top: "18%", left: "2.5%", width: "300px" }}
          introDelay={0}
          introDuration={1.25}
          stackX={0}
          stackY={0}
          introRotation={2}
          introScale={1.08}
          floatRange={15}
          speed={4.5}
          floatRotation={1.4}
        >
          <div
            className="d-flex align-items-center gap-2 mb-3 text-muted font-monospace border-bottom pb-2"
            style={{ fontSize: "0.85rem" }}
          >
            <Palette size={16} />
            Palette Colori
          </div>
          <div className="d-flex flex-column gap-2 ms-1">
            {config.colors?.map((hex, index) => (
              <div
                key={index}
                className="d-flex align-items-center justify-content-around mt-3"
              >
                <span className="font-monospace fs-4 fw-semibold text-uppercase">
                  {hex}
                </span>
                <div
                  className="color-swatch-rect"
                  style={{ backgroundColor: hex }}
                />
              </div>
            ))}
          </div>
        </FloatingCard>
        <InfoPopupCard dominio={config.dominio || `${siteParam}.com`} />
        {/* CUSTOM CARD — configurabile dal pannello admin */}
        <IndependentCustomCard
          config={config}
          style={{ bottom: "8%", left: "5%", width: "280px", height: "140px" }}
          introDelay={0.15}
          introDuration={1.2}
          stackX={4}
          stackY={-2}
          introRotation={-2}
          introScale={0.98}
          floatRange={12}
          speed={4.2}
          floatRotation={1.2}
        />
        {/* CENTRAL WEBSITE PREVIEW */}
        <div
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => {
            setIsFocusedOnDraft(true);
            if (stageRef.current) {
              gsap.to(stageRef.current, {
                scale: 1.1,
                duration: 0.7,
                ease: "power3.out",
              });
            }
          }}
          onMouseLeave={handleMouseLeaveStage}
          className="center-stage-container cloud-glass-card p-0 shadow-lg overflow-hidden position-relative"
        >
          <div className="draft-viewport w-100 h-100 overflow-hidden rounded-4">
            {isImage ? (
              <div
                className="w-100 h-100 overflow-y-auto bg-white position-relative"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {/* ✅ LOADER PERSONALIZZATO CON LOGO E NOME CLIENTE */}
                {isImageLoading && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white z-2">
                    <div className="d-flex flex-column align-items-center gap-3">
                      {/* Logo del cliente */}
                      <img
                        src={brandLogoUrl}
                        alt={`${clientName} Logo`}
                        className="mb-2"
                        style={{
                          maxHeight: "80px",
                          objectFit: "contain",
                          opacity: 0.9,
                        }}
                        onError={(e) => {
                          // Se il logo non carica, nascondilo
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {/* Nome cliente */}
                      <h3 className="fw-bold text-dark mb-0 fs-4">
                        {clientName}
                      </h3>
                      {/* Spinner */}
                      <Loader2
                        size={32}
                        className="text-secondary animate-spin mt-2"
                      />
                      {/* Messaggio */}
                      <p className="text-muted small mb-0 mt-2">
                        Caricamento bozza in corso...
                      </p>
                    </div>
                  </div>
                )}
                {/* Immagine bozza */}
                <img
                  src={imageUrl}
                  alt={`Bozza ${draftUrl}`}
                  className="w-100 d-block h-auto"
                  style={{
                    objectFit: "contain",
                    objectPosition: "top center",
                    opacity: isImageLoading ? 0 : 1,
                    transition: "opacity 0.3s ease-in-out",
                  }}
                  onLoad={() => setIsImageLoading(false)}
                  onError={(e) => {
                    setIsImageLoading(false);
                    e.currentTarget.src = `https://placehold.co/1920x1080/12161f/ffffff?text=Immagine+Bozza+non+trovata+(${draftUrl})`;
                  }}
                />
              </div>
            ) : (
              <iframe
                key={draftUrl}
                src={draftUrl}
                title="Anteprima Bozza Cliente"
                className={`w-100 h-100 border-0 d-block bg-white ${
                  isInteractive
                    ? "interactive-iframe"
                    : "non-interactive-iframe"
                }`}
                loading="eager"
              />
            )}
          </div>
        </div>
        <FooterHUD
          navItems={config.navItems}
          activeTab={activeTab}
          onSelectTab={(item) => {
            setActiveTab(item.id);
            if (item.draftUrl) handleUrlChange(item.draftUrl);
          }}
          onOpenPresentation={() => setViewMode("presentation")}
        />
      </main>
    </div>
  );
}
