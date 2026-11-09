import React, { useState, useEffect } from "react";
import type { AppConfig, NavItem } from "../../types/config";
import { DEFAULT_DEV_SPEC } from "../../types/config";
import {
  X,
  Copy,
  Grid,
  Ruler,
  FileText,
  CheckCircle,
  Maximize2,
  Minimize2,
  Loader2,
  Code,
  Type,
  Palette,
  Layers,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import "./DevModeViewer.scss";

interface DevModeViewerProps {
  config: AppConfig;
  siteParam: string;
  activeTab: string;
  currentDraft?: string;
  draftUrl?: string; // per retrocompatibilità
  onSelectTab: (item: NavItem) => void;
  onCloseDev: () => void;
}

export const DevModeViewer: React.FC<DevModeViewerProps> = ({
  config,
  siteParam,
  activeTab,
  currentDraft: currentDraftProp,
  draftUrl: draftUrlProp,
  onSelectTab,
  onCloseDev,
}) => {
  // Risoluzione draft attivo (priorità a currentDraftProp o estrazione dal draftUrl)
  const currentDraft =
    currentDraftProp ||
    (draftUrlProp && !draftUrlProp.includes("/") ? draftUrlProp : activeTab);

  // Stati toolbar e visualizzatore
  const [showGrid, setShowGrid] = useState(false);
  const [showFold, setShowFold] = useState(true);
  const [zoomMode, setZoomMode] = useState<"fit" | "original">("fit");
  const [rightPanelTab, setRightPanelTab] = useState<
    "seo" | "typography" | "colors" | "notes"
  >("seo");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Checklist interattiva
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    "h1-single": true,
    "webp-opt": true,
    "alt-tags": false,
    "contrast-wcag": true,
    "schema-org": false,
    "meta-tags": true,
    "lazy-load": true,
  });

  const toggleCheckItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calcolo immagine con fallback robusto: WebP -> JPG -> PNG -> Placeholder
  const isExternalUrl = Boolean(
    (currentDraft &&
      (currentDraft.startsWith("http://") ||
        currentDraft.startsWith("https://"))) ||
    (draftUrlProp &&
      (draftUrlProp.startsWith("http://") ||
        draftUrlProp.startsWith("https://"))),
  );

  const getInitialImgSrc = () => {
    if (isExternalUrl) return currentDraft || draftUrlProp || "";
    if (!currentDraft) return "";
    return `/bozze-proxy/${siteParam}/images/${currentDraft}.webp`;
  };

  const [imgSrc, setImgSrc] = useState<string>(getInitialImgSrc);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [imgErrorStep, setImgErrorStep] = useState<number>(0); // 0: webp, 1: jpg, 2: png, 3: placeholder

  // Quando cambiano siteParam o currentDraft, resettiamo lo stato
  useEffect(() => {
    if (isExternalUrl) {
      setImgSrc(currentDraft || draftUrlProp || "");
      setIsImgLoading(false);
      setImgErrorStep(0);
      return;
    }
    setImgSrc(`/bozze-proxy/${siteParam}/images/${currentDraft}.webp`);
    setIsImgLoading(true);
    setImgErrorStep(0);
  }, [siteParam, currentDraft, draftUrlProp, isExternalUrl]);

  const handleImgError = () => {
    if (imgErrorStep === 0) {
      // 1. Prova JPG
      console.log(
        `[DevMode] WebP non trovato per ${currentDraft}, provo JPG...`,
      );
      setImgErrorStep(1);
      setImgSrc(`/bozze-proxy/${siteParam}/images/${currentDraft}.jpg`);
      return;
    }
    if (imgErrorStep === 1) {
      // 2. Prova PNG
      console.log(
        `[DevMode] JPG non trovato per ${currentDraft}, provo PNG...`,
      );
      setImgErrorStep(2);
      setImgSrc(`/bozze-proxy/${siteParam}/images/${currentDraft}.png`);
      return;
    }
    // 3. Fallback finale con placeholder esplicativo
    console.warn(
      `[DevMode] Bozza "${currentDraft}" non trovata su ${siteParam}.bozzasito.com`,
    );
    setImgErrorStep(3);
    setIsImgLoading(false);
    setImgSrc(
      `https://placehold.co/1920x1080/12161f/ffffff?text=Bozza+non+trovata+(${currentDraft}+su+${siteParam})`,
    );
  };

  // Dati SEO e tipografia
  const currentDevSpec = config.devSpecs?.[activeTab] || DEFAULT_DEV_SPEC;
  const rawFonts = config.fonts || ["Tosh A", "Mokoko", "Acumin Pro"];
  const typography = config.typographyAssignment || {
    h1h2Font: rawFonts[0] || "Sans-serif",
    subtitlesFont: rawFonts[1] || rawFonts[0] || "Sans-serif",
    bodyFont: rawFonts[2] || rawFonts[0] || "Sans-serif",
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Helper calcolo contrasto WCAG (luminanza)
  const getContrastColor = (hex: string) => {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return "#ffffff";
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  };

  // Generatore Markdown SPEC.md
  const generateMarkdown = () => {
    const colorsCss = (config.colors || [])
      .map((hex, index) => `  --color-${index + 1}: ${hex};`)
      .join("\n");

    const md = `# 🚀 Specifiche Tecniche Frontend: ${config.dominio || siteParam}
Data generazione: ${new Date().toLocaleDateString("it-IT")}

---

## 🎨 1. Design System & Tipografia
\`\`\`css
:root {
  /* Tipografia */
  --font-heading: '${typography.h1h2Font}', sans-serif;
  --font-subheading: '${typography.subtitlesFont || typography.h1h2Font}', sans-serif;
  --font-body: '${typography.bodyFont}', sans-serif;

  /* Palette Colori */
${colorsCss}
}
\`\`\`

---

## 🏗️ 2. Struttura Layout & Albero SEO (Pagina: ${activeTab})
${currentDevSpec.seoSections
  .map(
    (sec) => `
### \`<${sec.tag}>\` ${sec.headingTag && sec.headingTag !== "none" ? `→ <${sec.headingTag}>` : ""}
- **Testo SEO**: ${sec.headingText || "N/A"}
- **Font Ruolo**: ${sec.assignedFontRole === "h1h2" ? `Titoli (${typography.h1h2Font})` : sec.assignedFontRole === "subtitles" ? `Sottotitoli (${typography.subtitlesFont})` : `Corpo (${typography.bodyFont})`}
- **Layout Grid**: ${sec.layoutNote || "Container standard"}
- **Note Tecniche**: ${sec.techNote || "Nessuna specifica aggiuntiva"}
`,
  )
  .join("\n---\n")}

---

## ✅ 3. Checklist Sviluppo & Best Practice
- [x] Rispettare un solo tag H1 semantico per pagina
- [ ] Convertire e comprimere le immagini in formato .webp (< 200KB)
- [ ] Aggiungere attributi alt descrittivi su ogni <img>
- [ ] Verificare contrasto WCAG AA minimo 4.5:1
- [ ] Configurare metadati Schema.org (LocalBusiness / Hotel)
${(currentDevSpec.pageNotes || []).map((note) => `- [ ] ${note}`).join("\n")}
${(config.generalDevTips || []).map((tip) => `- [ ] ${tip}`).join("\n")}

---
*Generato automaticamente da Tecnoprogress Hub X-Ray DevMode Workbench*
`;
    copyToClipboard(md, "Markdown SPEC.md");
  };

  // Calcolo progresso checklist
  const totalChecks = Object.keys(checkedItems).length;
  const completedChecks = Object.values(checkedItems).filter(Boolean).length;
  const checkProgress = Math.round((completedChecks / totalChecks) * 100);

  return (
    <div className="devmode-container">
      {/* TOP BAR WORKBENCH */}
      <header className="devmode-topbar">
        <div className="topbar-left">
          <div className="brand-group">
            <span className="brand">Tecnoprogress</span>
            <span className="badge-dev">
              <Code size={12} className="me-1" /> DEV WORKBENCH
            </span>
          </div>

          <span className="divider">|</span>
          <span
            className="site-name text-truncate"
            title={config.dominio || siteParam}
          >
            {config.dominio || siteParam}
          </span>

          <div className="page-selector-wrapper">
            <span className="selector-label">Pagina:</span>
            <select
              value={activeTab}
              onChange={(e) => {
                const selected = config.navItems?.find(
                  (item) => item.id === e.target.value,
                );
                if (selected) {
                  onSelectTab(selected);
                } else {
                  onSelectTab({
                    id: e.target.value,
                    label: e.target.value,
                    draftUrl: e.target.value,
                  });
                }
              }}
              className="page-selector"
            >
              {config.navItems?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className={`toggle-btn ${zoomMode === "original" ? "active" : ""}`}
            onClick={() =>
              setZoomMode((prev) => (prev === "fit" ? "original" : "fit"))
            }
            title="Alterna tra adatta a schermo e 100% pixel reali (1920px)"
          >
            {zoomMode === "fit" ? (
              <>
                <Maximize2 size={15} /> 100% Pixel Reali
              </>
            ) : (
              <>
                <Minimize2 size={15} /> Adatta Schermo
              </>
            )}
          </button>

          <button
            type="button"
            className={`toggle-btn ${showGrid ? "active" : ""}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Attiva/disattiva la griglia a 12 colonne Bootstrap con container"
          >
            <Grid size={15} /> Griglia 12 Col
          </button>

          <button
            type="button"
            className={`toggle-btn ${showFold ? "active" : ""}`}
            onClick={() => setShowFold(!showFold)}
            title="Visualizza linee di fold (1080px e 900px)"
          >
            <Ruler size={15} /> Linee di Fold
          </button>

          <button
            type="button"
            className="btn-export"
            onClick={generateMarkdown}
            title="Genera e copia negli appunti il file SPEC.md per la repo Git"
          >
            <FileText size={15} /> Esporta SPEC.md
          </button>

          <button
            type="button"
            className="btn-close"
            onClick={onCloseDev}
            title="Torna alla vista presentazione/bozza"
          >
            <X size={17} /> Esci
          </button>
        </div>
      </header>

      {/* SPLIT SCREEN WORKBENCH */}
      <div className="devmode-split">
        {/* COLONNA SINISTRA: VIEWER BOZZA */}
        <div
          className={`devmode-left ${zoomMode === "original" ? "overflow-scroll-both" : "overflow-scroll-y"}`}
        >
          <div
            className={`viewer-wrapper ${zoomMode === "original" ? "wrapper-original" : "wrapper-fit"}`}
          >
            {/* Loader durante il caricamento o fallback */}
            {isImgLoading && !isExternalUrl && (
              <div className="dev-img-loader">
                <Loader2 size={40} className="animate-spin text-primary mb-2" />
                <span className="small text-light">
                  Caricamento bozza ({currentDraft})...
                </span>
                {imgErrorStep > 0 && (
                  <span className="badge bg-secondary mt-1">
                    Tentativo formato #{imgErrorStep + 1}
                  </span>
                )}
              </div>
            )}

            {/* OVERLAY GRIGLIA 12 COLONNE BOOTSTRAP */}
            {showGrid && (
              <div
                className={`grid-overlay-container ${zoomMode === "original" ? "container-original" : "container-fit"}`}
              >
                <div className="bootstrap-grid-row">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bootstrap-grid-col">
                      <span className="col-label">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LINEE DI FOLD (DESKTOP 1080px e LAPTOP 900px) */}
            {showFold && (
              <>
                <div className="fold-line fold-1080">
                  <span className="fold-badge">
                    FOLD 1080px (Standard Desktop)
                  </span>
                </div>
                <div className="fold-line fold-900">
                  <span className="fold-badge fold-badge-yellow">
                    FOLD 900px (Laptop 14-15")
                  </span>
                </div>
              </>
            )}

            {/* IMMAGINE O IFRAME DELLA BOZZA */}
            {isExternalUrl ? (
              <iframe
                src={imgSrc}
                title={`Anteprima Bozza ${siteParam}`}
                className="draft-iframe"
              />
            ) : (
              <img
                src={imgSrc}
                alt={`Bozza ${currentDraft}`}
                className={`draft-image ${zoomMode === "original" ? "img-original" : "img-fit"}`}
                onLoad={() => setIsImgLoading(false)}
                onError={handleImgError}
              />
            )}
          </div>
        </div>

        {/* COLONNA DESTRA: DEV CONSOLE & SPECIFICHE */}
        <div className="devmode-right">
          {/* TABS CONSOLE */}
          <div className="console-tabs">
            <button
              type="button"
              className={`tab-btn ${rightPanelTab === "seo" ? "active" : ""}`}
              onClick={() => setRightPanelTab("seo")}
            >
              <Layers size={15} /> SEO & Layout
            </button>
            <button
              type="button"
              className={`tab-btn ${rightPanelTab === "typography" ? "active" : ""}`}
              onClick={() => setRightPanelTab("typography")}
            >
              <Type size={15} /> Tipografia
            </button>
            <button
              type="button"
              className={`tab-btn ${rightPanelTab === "colors" ? "active" : ""}`}
              onClick={() => setRightPanelTab("colors")}
            >
              <Palette size={15} /> Colori
            </button>
            <button
              type="button"
              className={`tab-btn ${rightPanelTab === "notes" ? "active" : ""}`}
              onClick={() => setRightPanelTab("notes")}
            >
              <CheckSquare size={15} /> Best Practice
            </button>
          </div>

          <div className="console-content">
            {/* TAB 1: SEO & STRUTTURA LAYOUT */}
            {rightPanelTab === "seo" && (
              <div className="panel-seo">
                <div className="panel-header-info">
                  <div>
                    <h3 className="panel-title">
                      Albero Semantico & Heading Tags
                    </h3>
                    <p className="panel-subtitle">
                      Gerarchia H1/H2 e layout Bootstrap per la pagina{" "}
                      <strong>{activeTab}</strong>
                    </p>
                  </div>
                </div>

                <div className="seo-items-list">
                  {currentDevSpec.seoSections.map((sec, idx) => (
                    <div key={sec.id || idx} className="seo-item-card">
                      <div className="seo-item-top">
                        <div className="badges-group">
                          <span className={`tag-badge tag-${sec.tag}`}>
                            &lt;{sec.tag}&gt;
                          </span>
                          {sec.headingTag && sec.headingTag !== "none" && (
                            <span
                              className={`heading-badge heading-${sec.headingTag}`}
                            >
                              &lt;{sec.headingTag.toUpperCase()}&gt;
                            </span>
                          )}
                        </div>

                        {sec.headingText && (
                          <button
                            type="button"
                            className="btn-mini-copy"
                            onClick={() =>
                              copyToClipboard(
                                sec.headingText || "",
                                "Titolo copiato",
                              )
                            }
                            title="Copia testo SEO"
                          >
                            <Copy size={13} />
                          </button>
                        )}
                      </div>

                      {sec.headingText && (
                        <h4 className="seo-heading-text">
                          "{sec.headingText}"
                        </h4>
                      )}

                      <div className="seo-meta-grid">
                        <div className="meta-box">
                          <span className="meta-label">Font Ruolo:</span>
                          <span className="meta-value font-mono">
                            {sec.assignedFontRole === "h1h2"
                              ? `Font 1 (Titoli - ${typography.h1h2Font})`
                              : sec.assignedFontRole === "subtitles"
                                ? `Font 2 (Sottotitoli - ${typography.subtitlesFont || typography.h1h2Font})`
                                : `Font 3 (Body - ${typography.bodyFont})`}
                          </span>
                        </div>

                        {sec.layoutNote && (
                          <div className="meta-box">
                            <span className="meta-label">Layout:</span>
                            <span className="meta-value">{sec.layoutNote}</span>
                          </div>
                        )}
                      </div>

                      {sec.techNote && (
                        <div className="tech-note-box">
                          <Sparkles
                            size={14}
                            className="text-warning flex-shrink-0"
                          />
                          <span>{sec.techNote}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TIPOGRAFIA & TOKEN CSS */}
            {rightPanelTab === "typography" && (
              <div className="panel-typo">
                <div className="panel-header-info">
                  <h3 className="panel-title">Mappa Tipografica & Token</h3>
                  <p className="panel-subtitle">
                    Associazione ruoli font e codice pronto da incollare
                  </p>
                </div>

                <div className="typo-roles-list">
                  {/* FONT 1 */}
                  <div className="typo-role-card">
                    <div className="role-header">
                      <span className="badge-role badge-role-h1">
                        Font 1 — Titoli (H1, H2, Hero)
                      </span>
                      <span className="font-name-badge">
                        {typography.h1h2Font}
                      </span>
                    </div>
                    <div
                      className="font-preview-box"
                      style={{ fontFamily: typography.h1h2Font }}
                    >
                      <p className="preview-heading">
                        Hotel Torbole Vista Lago
                      </p>
                      <span className="preview-caption">
                        Consigliato: 700 Bold / 800 ExtraBold • line-height 1.15
                      </span>
                    </div>
                  </div>

                  {/* FONT 2 */}
                  <div className="typo-role-card">
                    <div className="role-header">
                      <span className="badge-role badge-role-sub">
                        Font 2 — Sottotitoli (H3, Claim, Lead)
                      </span>
                      <span className="font-name-badge">
                        {typography.subtitlesFont || typography.h1h2Font}
                      </span>
                    </div>
                    <div
                      className="font-preview-box"
                      style={{
                        fontFamily:
                          typography.subtitlesFont || typography.h1h2Font,
                      }}
                    >
                      <p className="preview-subheading">
                        Un'oasi di tranquillità ed eccellenza sul Lago di Garda
                      </p>
                      <span className="preview-caption">
                        Consigliato: 400 Regular / Italic • line-height 1.4
                      </span>
                    </div>
                  </div>

                  {/* FONT 3 */}
                  <div className="typo-role-card">
                    <div className="role-header">
                      <span className="badge-role badge-role-body">
                        Font 3 — Corpo Testo (Paragrafi, Menu, Bottoni)
                      </span>
                      <span className="font-name-badge">
                        {typography.bodyFont}
                      </span>
                    </div>
                    <div
                      className="font-preview-box"
                      style={{ fontFamily: typography.bodyFont }}
                    >
                      <p className="preview-body">
                        Le nostre suite offrono comfort esclusivo con finiture
                        artigianali e terrazzo privato.
                      </p>
                      <span className="preview-caption">
                        Consigliato: 400 Regular / 500 Medium • font-size: 16px
                      </span>
                    </div>
                  </div>
                </div>

                {/* SNIPPET CSS / SCSS / TAILWIND */}
                <div className="code-snippets-section">
                  <div className="snippet-header">
                    <h4>Snippet Design Tokens</h4>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn-copy-code"
                        onClick={() =>
                          copyToClipboard(
                            `:root {
  --font-heading: '${typography.h1h2Font}', sans-serif;
  --font-subheading: '${typography.subtitlesFont || typography.h1h2Font}', sans-serif;
  --font-body: '${typography.bodyFont}', sans-serif;
}`,
                            "CSS Tokens copiati",
                          )
                        }
                      >
                        <Copy size={13} /> Copia :root CSS
                      </button>

                      <button
                        type="button"
                        className="btn-copy-code btn-copy-tailwind"
                        onClick={() =>
                          copyToClipboard(
                            `fontFamily: {
                                heading: ['${typography.h1h2Font}', 'sans-serif'],
                                subheading: ['${typography.subtitlesFont || typography.h1h2Font}', 'sans-serif'],
                                body: ['${typography.bodyFont}', 'sans-serif'],
                              }`,
                            "Tailwind Config copiata",
                          )
                        }
                      >
                        <Copy size={13} /> Copia Tailwind
                      </button>
                    </div>
                  </div>

                  <pre className="code-box">
                    {`:root {
                      --font-heading: '${typography.h1h2Font}', sans-serif;
                      --font-subheading: '${typography.subtitlesFont || typography.h1h2Font}', sans-serif;
                      --font-body: '${typography.bodyFont}', sans-serif;
                    }`}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 3: COLORI & DESIGN TOKENS */}
            {rightPanelTab === "colors" && (
              <div className="panel-colors">
                <div className="panel-header-info">
                  <h3 className="panel-title">Palette Colori del Progetto</h3>
                  <p className="panel-subtitle">
                    Clicca su qualsiasi swatch per copiare il codice HEX negli
                    appunti
                  </p>
                </div>

                <div className="colors-cards-grid">
                  {(config.colors || []).map((hex, index) => {
                    const textColor = getContrastColor(hex);
                    return (
                      <div
                        key={index}
                        className="color-card"
                        onClick={() =>
                          copyToClipboard(hex, `Colore ${hex} copiato`)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            copyToClipboard(hex, `Colore ${hex} copiato`);
                        }}
                      >
                        <div
                          className="swatch-large"
                          style={{ backgroundColor: hex, color: textColor }}
                        >
                          <span className="swatch-index">#{index + 1}</span>
                          <span
                            className="swatch-contrast-tag"
                            style={{ color: textColor }}
                          >
                            {textColor === "#ffffff" ? "Dark bg" : "Light bg"}
                          </span>
                        </div>
                        <div className="swatch-footer">
                          <span className="swatch-var-name">
                            --color-{index + 1}
                          </span>
                          <span className="swatch-hex-code">
                            {hex.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="code-snippets-section mt-4">
                  <div className="snippet-header">
                    <h4>Variabili Colori CSS</h4>
                    <button
                      type="button"
                      className="btn-copy-code"
                      onClick={() =>
                        copyToClipboard(
                          (config.colors || [])
                            .map((hex, i) => `  $color--${i + 1}: ${hex};`)
                            .join("\n"),
                          "Variabili colori copiate",
                        )
                      }
                    >
                      <Copy size={13} /> Copia Tutte
                    </button>
                  </div>
                  <pre className="code-box">
                    {(config.colors || [])
                      .map((hex, i) => `  $color--${i + 1}: ${hex};`)
                      .join("\n")}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 4: BEST PRACTICE & CHECKLIST */}
            {rightPanelTab === "notes" && (
              <div className="panel-notes">
                <div className="panel-header-info">
                  <h3 className="panel-title">Checklist Sviluppo Frontend</h3>
                  <div className="progress-container">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Avanzamento specifiche:</span>
                      <span className="text-light fw-bold">
                        {checkProgress}%
                      </span>
                    </div>
                    <div
                      className="progress"
                      style={{ height: "6px", background: "#2d3748" }}
                    >
                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${checkProgress}%`,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="checklist-items">
                  <label className="check-item">
                    <input
                      type="checkbox"
                      checked={checkedItems["h1-single"] || false}
                      onChange={() => toggleCheckItem("h1-single")}
                    />
                    <div className="check-text">
                      <strong>Un solo tag &lt;h1&gt; per pagina</strong>
                      <span>
                        Il tag H1 deve contenere la parola chiave principale del
                        sito o dell'hotel.
                      </span>
                    </div>
                  </label>

                  <label className="check-item">
                    <input
                      type="checkbox"
                      checked={checkedItems["webp-opt"] || false}
                      onChange={() => toggleCheckItem("webp-opt")}
                    />
                    <div className="check-text">
                      <strong>Immagini WebP & Risoluzione Adattiva</strong>
                      <span>
                        Convertire tutti gli asset in WebP (max 1920px per hero,
                        800px per card). Target &lt; 200KB.
                      </span>
                    </div>
                  </label>

                  <label className="check-item">
                    <input
                      type="checkbox"
                      checked={checkedItems["alt-tags"] || false}
                      onChange={() => toggleCheckItem("alt-tags")}
                    />
                    <div className="check-text">
                      <strong>
                        Attributi alt descrittivi su tutti i tag &lt;img&gt;
                      </strong>
                      <span>
                        Essenziale per punteggio Lighthouse SEO 100/100 e
                        accessibilità per ipovedenti.
                      </span>
                    </div>
                  </label>

                  <label className="check-item">
                    <input
                      type="checkbox"
                      checked={checkedItems["contrast-wcag"] || false}
                      onChange={() => toggleCheckItem("contrast-wcag")}
                    />
                    <div className="check-text">
                      <strong>Contrasto minimo 4.5:1 (WCAG AA)</strong>
                      <span>
                        Verificare la leggibilità dei testi rispetto ai colori
                        di sfondo scelti.
                      </span>
                    </div>
                  </label>

                  <label className="check-item">
                    <input
                      type="checkbox"
                      checked={checkedItems["schema-org"] || false}
                      onChange={() => toggleCheckItem("schema-org")}
                    />
                    <div className="check-text">
                      <strong>Markup Schema.org JSON-LD</strong>
                      <span>
                        Includere lo schema Hotel / LocalBusiness con indirizzo,
                        telefono e coordinate.
                      </span>
                    </div>
                  </label>

                  <label className="check-item">
                    <input
                      type="checkbox"
                      checked={checkedItems["lazy-load"] || false}
                      onChange={() => toggleCheckItem("lazy-load")}
                    />
                    <div className="check-text">
                      <strong>Lazy Loading su Immagini Secondarie</strong>
                      <span>
                        Utilizzare loading="lazy" e decoding="async" per tutte
                        le immagini sotto il Fold.
                      </span>
                    </div>
                  </label>
                </div>

                {/* NOTE PERSONALIZZATE */}
                {((currentDevSpec.pageNotes &&
                  currentDevSpec.pageNotes.length > 0) ||
                  (config.generalDevTips &&
                    config.generalDevTips.length > 0)) && (
                  <div className="custom-notes-section mt-4">
                    <h4 className="small text-uppercase text-muted fw-bold mb-3">
                      Note Aggiuntive del Team
                    </h4>
                    <ul className="custom-notes-list">
                      {(currentDevSpec.pageNotes || []).map((note, idx) => (
                        <li key={`pn-${idx}`}>{note}</li>
                      ))}
                      {(config.generalDevTips || []).map((tip, idx) => (
                        <li key={`gt-${idx}`}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FLOATING TOAST FEEDBACK */}
      {copyFeedback && (
        <div className="dev-toast-notification">
          <CheckCircle size={16} className="text-dark me-2" />
          <span>{copyFeedback}</span>
        </div>
      )}
    </div>
  );
};

export default DevModeViewer;
