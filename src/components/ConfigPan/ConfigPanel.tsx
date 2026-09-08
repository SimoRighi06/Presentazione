import React, { useState } from "react";
import { type AppConfig, DEFAULT_CONFIG } from "../../types/config";
import { Download, Play, Plus, Trash2 } from "lucide-react";

// Nav item interface
export interface NavItem {
  id: string;
  label: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "menu", label: "Menu" },
  { id: "pagina1", label: "Pagina1" },
];

interface ConfigPanelProps {
  initialConfig?: AppConfig & { navItems?: NavItem[] };
  onStartPresentation: () => void;
  onApplyConfig: (config: AppConfig & { navItems?: NavItem[] }) => void;
  config: AppConfig;
  updateConfig?: (newConfig: Partial<AppConfig>) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  initialConfig = DEFAULT_CONFIG,
  onApplyConfig,
  onStartPresentation,
}) => {
  const [config, setConfig] = useState<AppConfig & { navItems?: NavItem[] }>(
    () => ({
      ...initialConfig,
      navItems: (initialConfig as any).navItems || DEFAULT_NAV_ITEMS,
    }),
  );

  // ----------------------------------------------------------------
  const [newFont, setNewFont] = useState("");
  /* const [isUploadingTexture, setIsUploadingTexture] = useState(false); */

  // --- STATI PER IL DRAG & DROP DEL PDF ---
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  //------------------------------------------------------------------

  // --- GESTIONE FONT ---
  const handleAddFont = () => {
    if (!newFont.trim()) return;
    setConfig((prev) => ({
      ...prev,
      fonts: [...prev.fonts, newFont.trim()],
    }));
    setNewFont("");
  };

  const handleRemoveFont = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      fonts: prev.fonts.filter((_, i) => i !== index),
    }));
  };

  // --- GESTIONE BOTTONI FOOTER ---
  const handleNavItemChange = (index: number, newLabel: string) => {
    const updatedNav = [...config.navItems];
    updatedNav[index] = { ...updatedNav[index], label: newLabel };
    setConfig((prev) => ({ ...prev, navItems: updatedNav }));
  };

  const handleAddNavItem = () => {
    const nextNumber = String(config.navItems.length + 1).padStart(2, "0");
    const newId = `nav_${Date.now()}`;
    const updatedNav = [
      ...config.navItems,
      {
        id: newId,
        label: `Pagina ${nextNumber}`,
        draftUrl: `bozza${nextNumber}`,
      },
    ];
    setConfig((prev) => ({ ...prev, navItems: updatedNav }));
  };

  const handleRemoveNavItem = (index: number) => {
    const updatedNav = config.navItems.filter((_, i) => i !== index);
    setConfig((prev) => ({ ...prev, navItems: updatedNav }));
  };

  // --- GESTIONE FILE PDF LOCALE (DRAG & DROP) ---
  const handleFileSelect = (file: File) => {
    if (file && file.type === "application/pdf") {
      const objectUrl = URL.createObjectURL(file);
      setUploadedFileName(file.name);
      setConfig((prev) => ({ ...prev, presentationUrl: objectUrl }));
    } else {
      alert("Deve essere PDF.");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // --- ESPORTAZIONE JSON ---
  const handleDownloadJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className="container-fluid vh-100 overflow-y-auto py-4 bg-light "
      style={{ paddingLeft: "30%" }}
    >
      <div
        className="cloud-glass-card p-4 p-md-5 rounded-4 w-100 text-dark"
        style={{ maxWidth: "680px" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="m-0 fs-3 fw-bold">Pannello Configurazione</h2>
          <span className="badge bg-dark rounded-pill px-3 py-2">
            Admin Mode
          </span>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="d-flex flex-column gap-4"
        >
          {/* DOMINIO CLIENTE */}
          <div className="py-5 border-bottom">
            <label className="form-label text-uppercase fs-7 fw-bold text-muted">
              Nome Dominio
            </label>
            <input
              type="text"
              className="form-control form-control-lg bg-light border-0"
              value={config.dominio.toLowerCase().replace(/\s+/g, "")}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, dominio: e.target.value }))
              }
              placeholder="es. tecnoprogress.com"
            />
          </div>

          {/* PALETTE COLORI */}
          <div className="py-5 border-bottom">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label text-uppercase fs-7 fw-bold text-muted m-0">
                Palette Colori ({config.colors.length}/5)
              </label>
              {config.colors.length < 5 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1 py-0 px-2"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => {
                    setConfig((prev) => ({
                      ...prev,
                      colors: [...prev.colors, "#000000"],
                    }));
                  }}
                >
                  <Plus size={14} /> Aggiungi Colore
                </button>
              )}
            </div>

            <div className="d-flex flex-column gap-2">
              {config.colors.map((color, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center gap-3 bg-light p-2 rounded-3"
                >
                  <input
                    type="color"
                    className="form-control form-control-color border-0 p-0 flex-shrink-0"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...config.colors];
                      newColors[index] = e.target.value;
                      setConfig((prev) => ({ ...prev, colors: newColors }));
                    }}
                    style={{ width: "40px", height: "35px", cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace text-uppercase bg-light border-0"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...config.colors];
                      newColors[index] = e.target.value;
                      setConfig((prev) => ({ ...prev, colors: newColors }));
                    }}
                  />
                  {config.colors.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0"
                      onClick={() => {
                        const newColors = config.colors.filter(
                          (_, i) => i !== index,
                        );
                        setConfig((prev) => ({ ...prev, colors: newColors }));
                      }}
                      title="Rimuovi colore"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <div className="mb-3">
                <label
                  htmlFor="customDescriptionPalette"
                  className="form-label small text-muted"
                >
                  Descrizione Palette
                </label>
                <textarea
                  id="customDescriptionPalette"
                  className="form-control text-dark border-secondary"
                  placeholder="Inserisci una descrizione (lascia vuoto per nascondere)"
                  rows={2}
                  value={config.customDescriptionPalette || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      customDescriptionPalette: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* BOTTONI FOOTER (NAVIGAZIONE) */}
          <div className="py-5 border-bottom">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label text-uppercase fs-7 fw-bold text-muted m-0">
                Bottoni Footer Navigazione
              </label>
              <button
                type="button"
                className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1 py-0 px-2"
                style={{ fontSize: "0.75rem" }}
                onClick={handleAddNavItem}
              >
                <Plus size={14} /> Aggiungi Bottone
              </button>
            </div>

            <div className="row g-2">
              {config.navItems.map((item, index) => (
                <div key={item.id} className="col-6 col-md-4">
                  <div className="d-flex align-items-center gap-2 bg-light p-2 rounded-3 border-0">
                    <input
                      type="text"
                      className="form-control form-control-sm bg-white border-0 fw-medium shadow-sm"
                      value={item.label}
                      onChange={(e) =>
                        handleNavItemChange(index, e.target.value)
                      }
                      placeholder="Nome bottone"
                    />
                    {config.navItems.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0 me-1 flex-shrink-0"
                        onClick={() => handleRemoveNavItem(index)}
                        title="Rimuovi bottone"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FONT UTILIZZATI */}
          <div className="py-5 border-bottom">
            <label className="form-label text-uppercase fs-7 fw-bold text-muted">
              Font Utilizzati
            </label>
            <div className="d-flex gap-2 mb-2">
              <input
                type="text"
                className="form-control bg-light border-0"
                placeholder="Aggiungi font (es. Montserrat)"
                value={newFont}
                onChange={(e) => setNewFont(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-dark d-flex align-items-center px-3"
                onClick={handleAddFont}
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {config.fonts.map((font, idx) => (
                <span
                  key={idx}
                  className="badge bg-light text-dark border d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                >
                  {font}
                  <Trash2
                    size={14}
                    className="text-danger cursor-pointer"
                    onClick={() => handleRemoveFont(idx)}
                    style={{ cursor: "pointer" }}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* GESTIONE CUSTOM CARD */}
          <div className="row g-3  border-bottom py-5 ">
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between mb-2">
                {/* SWITCH VISIBILITÀ */}
                <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    id="isCustomCardVisibleCheck"
                    checked={config.isCustomCardVisible ?? false}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        isCustomCardVisible: e.target.checked,
                      }))
                    }
                  />
                  <label
                    className="form-check-label text-uppercase fs-7 fw-bold text-muted cursor-pointer"
                    htmlFor="isCustomCardVisibleCheck"
                  >
                    Custom Card
                  </label>
                </div>
              </div>

              {/* CAMPI MOSTRATI SOLO SE LA CARD È ATTIVA */}
              {config.isCustomCardVisible && (
                <div className="row g-2 mt-2">
                  {/* TITOLO CARD */}
                  <div className="col-12">
                    <input
                      type="text"
                      className="form-control form-control-sm bg-light border-0 fw-semibold"
                      value={config.customCardTitle || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          customCardTitle: e.target.value,
                        }))
                      }
                      placeholder="Titolo della card:"
                    />
                  </div>

                  {/* TESTO CARD */}
                  <div className="col-12">
                    <textarea
                      className="form-control form-control-sm bg-light border-0"
                      rows={3}
                      value={config.customCardText || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          customCardText: e.target.value,
                        }))
                      }
                      placeholder="Testo (premi Invio per andare a capo)"
                    />
                  </div>

                  {/* IMMAGINE CARD (Stesso sistema della texture) */}
                  <div className="col-12">
                    <label className="form-label text-uppercase fs-7 fw-bold text-muted mb-1">
                      Immagine Custom{" "}
                      <span className="text-muted text-lowercase">
                        (ottimale: 1920pxx1080px)
                      </span>
                    </label>
                    <input
                      type="file"
                      className="form-control form-control-sm bg-light border-0"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const objectUrl = URL.createObjectURL(file);
                          setConfig((prev) => ({
                            ...prev,
                            customCardImageUrl: objectUrl,
                          }));
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================= */}
          {/* SEZIONE PRESENTAZIONE PDF (DRAG & TEXT)   */}
          {/* ========================================= */}
          <div className="py-5 border-bottom text-start">
            <label className="form-label text-uppercase fs-7 fw-bold text-muted">
              File Presentazione (PDF)
            </label>

            {/* Area Drag & Drop */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("pdf-file-input")?.click()}
              className={`border border-2 border-dashed rounded-3 p-3 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary bg-opacity-10"
                  : "border-secondary bg-light"
              }`}
              style={{ cursor: "pointer" }}
            >
              <input
                type="file"
                id="pdf-file-input"
                accept="application/pdf"
                className="d-none"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {uploadedFileName ? (
                <div className="text-success fw-semibold small d-flex align-items-center justify-content-center gap-2">
                  📄 {uploadedFileName}
                </div>
              ) : (
                <div className="text-secondary small">
                  <strong>Trascina qui il PDF</strong> oppure{" "}
                  <span className="text-primary text-decoration-underline">
                    sfoglia i file
                  </span>
                </div>
              )}
            </div>

            {/* Separatore */}
            <div className="d-flex align-items-center gap-2 my-3">
              <hr className="flex-grow-1 border-secondary opacity-25 m-0" />
              <span
                className="small text-muted px-1 text-uppercase fw-bold"
                style={{ fontSize: "0.65rem" }}
              >
                oppure url server
              </span>
              <hr className="flex-grow-1 border-secondary opacity-25 m-0" />
            </div>

            {/* Input URL Server / Testo */}
            <input
              type="text"
              className="form-control bg-light border-0"
              placeholder="es. presentazione.pdf o http://..."
              value={
                config.presentationUrl?.startsWith("blob:")
                  ? ""
                  : config.presentationUrl || ""
              }
              onChange={(e) => {
                setUploadedFileName(""); // Resetta il nome file locale
                setConfig((prev) => ({
                  ...prev,
                  presentationUrl: e.target.value,
                }));
              }}
            />
          </div>
          {/* ========================================= */}

          {/* AZIONI: PREVIEW ED ESPORTAZIONE */}
          <div className="d-flex gap-3 mt-1">
            <button
              type="button"
              className="btn btn-outline-dark w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
              onClick={() => onApplyConfig(config)}
            >
              <Play size={18} /> Bozzasito
            </button>
            <button
              type="button"
              className="btn btn-dark w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
              onClick={handleDownloadJSON}
            >
              <Download size={18} /> config.json
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            onClick={() => {
              onApplyConfig(config);
              onStartPresentation();
            }}
          >
            ▶ Via Presentazione
          </button>
        </form>
      </div>
    </div>
  );
};
