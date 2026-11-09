import React, { useState, useEffect } from "react";
import { type AppConfig, DEFAULT_CONFIG } from "../../types/config";
import {
  Download,
  Play,
  Plus,
  Trash2,
  Save,
  Upload,
  Loader2,
} from "lucide-react";
import { ShareLinkGenerator } from "../../clientLink";

// Interfaccia Navbar
export interface NavItem {
  id: string;
  label: string;
  draftUrl?: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", draftUrl: "bozza01" },
  { id: "menu", label: "Menu", draftUrl: "bozza02" },
];

interface ConfigPanelProps {
  initialConfig?: AppConfig & { navItems?: NavItem[] };
  onStartPresentation: () => void;
  onApplyConfig: (config: AppConfig & { navItems?: NavItem[] }) => void;
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
      navItems: initialConfig.navItems || DEFAULT_NAV_ITEMS,
    }),
  );

  const [newFont, setNewFont] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  // Stati per il salvataggio backend
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFromServer, setIsLoadingFromServer] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  /* Richiesta della lista dei clients solamente scaricata quanndo si cerca dall'input */
  const [clientList, setClientList] = useState<
    { name: string; slug: string }[]
  >([]);

  useEffect(() => {
    document.body.style.overflow = "auto";
    // Fetch available clients for datalist
    const fetchClients = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) return;
        const res = await fetch(`${apiUrl}/api/presentations/clients`);
        if (res.ok) {
          const data = await res.json();
          setClientList(data);
        }
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      }
    };
    fetchClients();

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Helper per assicurarsi che i colori abbiano sempre il #
  const sanitizeColors = (colors: string[]) => {
    return colors.map((c) => (c.startsWith("#") ? c : `#${c}`));
  };

  // FUNZIONE PER CARICARE DAL SERVER
  const handleLoadFromServer = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const slug = config.dominio?.toLowerCase().replace(/\s+/g, "") || "";

    if (!apiUrl || !slug) {
      setSaveMessage("⚠️ Inserisci prima un Nome Dominio valido");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    setIsLoadingFromServer(true);
    setSaveMessage("Caricamento in corso...");

    try {
      const response = await fetch(`${apiUrl}/api/presentations/${slug}`);

      if (response.ok) {
        const data = await response.json();
        const parsedConfig = JSON.parse(data.configJson) as AppConfig & {
          navItems?: NavItem[];
        };

        // FIX: Sanitizziamo i colori per evitare l'errore del browser
        const safeConfig = {
          ...parsedConfig,
          colors: sanitizeColors(parsedConfig.colors || []),
          navItems: parsedConfig.navItems || DEFAULT_NAV_ITEMS,
        };

        setConfig(safeConfig);
        setSaveMessage("✅ Configurazione caricata dal server!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("⚠️ Nessuna configurazione trovata per questo dominio");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Errore caricamento:", error);
      setSaveMessage("❌ Errore nel caricamento");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsLoadingFromServer(false);
    }
  };

  const handleSaveToServer = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const slug = config.dominio?.toLowerCase().replace(/\s+/g, "") || "";

  if (!apiUrl) {
    setSaveMessage("⚠️ Variabile VITE_API_URL non configurata nel file .env");
    return;
  }
  if (!slug) {
    setSaveMessage("⚠️ Inserisci prima un Nome Dominio");
    return;
  }

  setIsSaving(true);
  setSaveMessage("Salvataggio in corso...");

  try {
    const checkRes = await fetch(`${apiUrl}/api/presentations/${slug}`, {
      credentials: 'include'
    });

    const method = checkRes.ok ? "PUT" : "POST";
    const payload = checkRes.ok
      ? { title: `Config ${slug}`, version: "v1", configJson: JSON.stringify(config) }
      : { clientName: slug, clientSlug: slug, title: `Config ${slug}`, version: "v1", configJson: JSON.stringify(config) };

    const url = checkRes.ok ? `${apiUrl}/api/presentations/${slug}` : `${apiUrl}/api/presentations`;

    // 2. Raccogliamo tutte le possibili credenziali dal frontend
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('access_token') ||
                  sessionStorage.getItem('token');
    
    const apiKey = import.meta.env.VITE_API_KEY; // Se definita nel file .env

    // 3. Costruiamo gli header dinamicamente
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("🔑 Token trovato e inviato nell'header Authorization");
    } else if (apiKey) {
      headers["x-api-key"] = apiKey; // O "Authorization": `Bearer ${apiKey}`, a seconda del backend
      console.log("🔑 API Key trovata nel .env e inviata");
    } else {
      console.warn("⚠️ Nessun token o API key trovati nel frontend. La richiesta potrebbe fallire con 401.");
    }

    // 4. Eseguiamo la richiesta
    const response = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setSaveMessage("✅ Configurazione salvata sul server con successo!");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      const errorText = await response.text();
      console.error(`❌ Errore Backend ${response.status}:`, errorText);
      
      if (response.status === 401) {
        setSaveMessage("🔐 Errore 401: Credenziali mancanti o non valide. Controlla la console per i dettagli.");
      } else {
        throw new Error(`Errore ${response.status}`);
      }
    }
  } catch (error) {
    console.error("Save error:", error);
    setSaveMessage("❌ Errore nel salvataggio. Controlla la console (F12)");
    setTimeout(() => setSaveMessage(""), 4000);
  } finally {
    setIsSaving(false);
  }
};

  // Font
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

  // Bottoni Footer
  const handleNavItemChange = (index: number, newLabel: string) => {
    const updatedNav = [...config.navItems!];
    updatedNav[index] = { ...updatedNav[index], label: newLabel };
    setConfig((prev) => ({ ...prev, navItems: updatedNav }));
  };

  const handleAddNavItem = () => {
    const nextNumber = String(config.navItems!.length + 1).padStart(2, "0");
    const newId = `nav_${Date.now()}`;
    const updatedNav = [
      ...config.navItems!,
      {
        id: newId,
        label: `Pagina ${nextNumber}`,
        draftUrl: `bozza${nextNumber}`,
      },
    ];
    setConfig((prev) => ({ ...prev, navItems: updatedNav }));
  };

  const handleRemoveNavItem = (index: number) => {
    const updatedNav = config.navItems!.filter((_, i) => i !== index);
    setConfig((prev) => ({ ...prev, navItems: updatedNav }));
  };

  // Gestione drag & drop
  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Per favore, seleziona solo file PDF.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setConfig((prev) => ({
      ...prev,
      presentationUrl: objectUrl,
      hasPresentation: true,
    }));
    setUploadedFileName(file.name);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Esportazione del JSON
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

  const logOut = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_username");
    window.location.reload();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 overflow-y-auto bg-light"
      style={{ zIndex: 1050 }}
    >
      <div
        className="container py-4 py-md-5 px-3 px-md-4"
        style={{ maxWidth: "720px" }}
      >
        <div className="position-fixed top-0 end-0 m-md-4 m-2 z-3">
          <button
            type="button"
            className="btn w-100 rounded-pill py-2 text-white"
            style={{ backgroundColor: "#EE731C" }}
            onClick={logOut}
          >
            {" "}
            <strong>Log out</strong>
          </button>
        </div>
        <div className="cloud-glass-card p-3 p-md-4 p-lg-5 rounded-4 w-100 text-dark mx-auto">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-4">
            <h2 className="m-0 fs-4 fs-md-3 fw-bold">
              Pannello Configurazione
            </h2>
            <span className="badge bg-dark rounded-pill px-3 py-2">
              Admin Mode
            </span>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="d-flex flex-column gap-4"
          >
            {/* NOME DOMINIO */}
            <div className="py-4 py-md-5 border-bottom">
              <label
                className="form-label text-uppercase fs-7 fw-bold text-muted"
                aria-label="Nome del dominio"
              >
                Nome Dominio
              </label>
              <input
                type="text"
                list="clients-datalist" // <-- Collega l'input alla datalist qui sotto
                className="form-control form-control-lg bg-light border-0"
                value={config.dominio.toLowerCase().replace(/\s+/g, "")}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, dominio: e.target.value }))
                }
                placeholder="es. hoteltorbole"
              />

              <datalist id="clients-datalist">
                {clientList.map((client) => (
                  <option key={client.slug} value={client.slug}>
                    {client.name}
                  </option>
                ))}
              </datalist>
            </div>

            {/* PALETTE COLORI */}
            <div className="py-4 py-md-5 border-bottom">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
                <label
                  className="form-label text-uppercase fs-7 fw-bold text-muted m-0"
                  aria-label="Palette dei colori"
                >
                  Palette Colori ({config.colors.length}/5)
                </label>
                {config.colors.length < 5 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1 py-1 px-2"
                    aria-label="Aggiungi il colore"
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
                    className="d-flex align-items-center gap-2 gap-sm-3 bg-light p-2 rounded-3"
                  >
                    <input
                      type="color"
                      className="form-control form-control-color border-0 p-0 flex-shrink-0"
                      value={color.startsWith("#") ? color : `#${color}`}
                      aria-label={`colore numero ${index + 1}`}
                      onChange={(e) => {
                        const newColors = [...config.colors];
                        newColors[index] = e.target.value;
                        setConfig((prev) => ({ ...prev, colors: newColors }));
                      }}
                      style={{
                        width: "40px",
                        height: "35px",
                        cursor: "pointer",
                      }}
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
                        className="btn btn-link text-danger p-0 flex-shrink-0"
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
                <div className="mb-3 mt-2">
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
            <div className="py-4 py-md-5 border-bottom">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
                <label className="form-label text-uppercase fs-7 fw-bold text-muted m-0">
                  Bottoni Footer Navigazione
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1 py-1 px-2"
                  style={{ fontSize: "0.75rem" }}
                  onClick={handleAddNavItem}
                >
                  <Plus size={14} /> Aggiungi Bottone
                </button>
              </div>
              <div className="row g-2">
                {config.navItems?.map((item, index) => (
                  <div key={item.id} className="col-12 col-sm-6 col-md-4">
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
                      {config.navItems!.length > 1 && (
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
            <div className="py-4 py-md-5 border-bottom">
              <label className="form-label text-uppercase fs-7 fw-bold text-muted">
                Font Utilizzati
              </label>
              <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  placeholder="Aggiungi font (es. Montserrat)"
                  value={newFont}
                  onChange={(e) => setNewFont(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFont();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-dark d-flex align-items-center justify-content-center px-3"
                  onClick={handleAddFont}
                  style={{ minHeight: "38px" }}
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {config.fonts.map((font, idx) => (
                  <span
                    key={idx}
                    className="badge bg-light text-dark border d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                    style={{ fontSize: "0.85rem" }}
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
            <div className="row g-3 border-bottom py-4 py-md-5">
              <div className="col-12">
                <div className="d-flex align-items-center justify-content-between mb-2">
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
                {config.isCustomCardVisible && (
                  <div className="row g-2 mt-2">
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
                    <div className="col-12">
                      <label className="form-label text-uppercase fs-7 fw-bold text-muted mb-1">
                        Immagine Custom{" "}
                        <span className="text-muted text-lowercase">
                          (ottimale: 1920px×1080px)
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

            {/* SEZIONE PRESENTAZIONE PDF */}
            <div className="py-4 py-md-5 border-bottom text-start">
              <label className="form-label text-uppercase fs-7 fw-bold text-muted">
                File Presentazione (PDF)
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() =>
                  document.getElementById("pdf-file-input")?.click()
                }
                className={`border border-2 border-dashed rounded-3 p-3 p-md-4 text-center transition-all ${
                  isDragging
                    ? "border-primary bg-primary bg-opacity-10"
                    : "border-secondary bg-light"
                }`}
                style={{ cursor: "pointer", minHeight: "100px" }}
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
                    <Download size={16} />
                    <span className="text-truncate" style={{ maxWidth: "90%" }}>
                      {uploadedFileName}
                    </span>
                  </div>
                ) : (
                  <div className="text-secondary small">
                    <strong>Trascina qui il PDF</strong>
                    <span className="d-none d-sm-inline">
                      {" "}
                      oppure{" "}
                      <span className="text-primary text-decoration-underline">
                        sfoglia i file
                      </span>
                    </span>
                  </div>
                )}
              </div>
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
                  setUploadedFileName("");
                  setConfig((prev) => ({
                    ...prev,
                    presentationUrl: e.target.value,
                  }));
                }}
              />
            </div>

            {/* 👇 NUOVA SEZIONE: SALVATAGGIO BACKEND */}
            <div className="py-4 py-md-5 border-bottom">
              <label className="form-label text-uppercase fs-7 fw-bold text-muted mb-3">
                Salvataggio e Caricamento configurazioni bozze
              </label>
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className={`btn w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 ${
                    saveMessage.includes("✅")
                      ? "btn-success"
                      : saveMessage.includes("❌")
                        ? "btn-danger"
                        : "btn-primary"
                  }`}
                  onClick={handleSaveToServer}
                  disabled={isSaving || isLoadingFromServer}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Salvataggio in corso...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Salva
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-dark w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleLoadFromServer}
                  disabled={isSaving || isLoadingFromServer}
                >
                  {isLoadingFromServer ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Carica Ultima Configurazione
                    </>
                  )}
                </button>

                {saveMessage && (
                  <small
                    className={`text-center mt-2 fw-medium ${
                      saveMessage.includes("✅")
                        ? "text-success"
                        : saveMessage.includes("❌") ||
                            saveMessage.includes("⚠️")
                          ? "text-danger"
                          : "text-muted"
                    }`}
                  >
                    {saveMessage}
                  </small>
                )}
              </div>
            </div>

            {/* AZIONI: PREVIEW ED ESPORTAZIONE */}
            <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 mt-1">
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
            <ShareLinkGenerator siteParam={config.dominio} />
          </form>
        </div>
      </div>
    </div>
  );
};
