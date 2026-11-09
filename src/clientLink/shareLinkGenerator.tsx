import React, { useState } from "react";
import { Copy, Check, ExternalLink} from "lucide-react";

interface ShareLinkGeneratorProps {
  siteParam: string; // Questo è il "dominio" / slug (es. "hoteltorbole")
}

export const ShareLinkGenerator: React.FC<ShareLinkGeneratorProps> = ({ siteParam }) => {
  const [copied, setCopied] = useState(false);

  // 1. Puliamo lo slug: lowercase e senza spazi
  const cleanSlug = siteParam ? siteParam.toLowerCase().replace(/\s+/g, "") : "";
  
  // 2. Costruiamo l'URL pulito usando l'origine corrente 
  // (Funziona automaticamente sia su localhost:5173 che sul tuo dominio di produzione)
  const shareUrl = cleanSlug ? `${window.location.origin}/${cleanSlug}` : "";

  // 3. Funzione per copiare negli appunti
  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset dopo 2 secondi
    } catch (err) {
      console.error("Errore nella copia del link:", err);
    }
  };

  const apriLink = async () => {
    if (!shareUrl) return;
    window.open(shareUrl);
  }

  // Se non c'è uno slug, mostriamo un avviso
  if (!cleanSlug) {
    return (
      <div className="alert alert-warning small text-center mt-3 mb-0">
        ⚠️ Inserisci un "Nome Dominio" valido sopra per generare il link.
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 bg-light rounded-3 border">
      <label className="form-label text-uppercase fs-7 fw-bold text-muted mb-2">
        Link di Condivisione (Pubblico)
      </label>
      
      <div className="input-group">
        <button
          className={`btn d-flex align-items-center gap-2 ${copied ? "btn-success" : "btn-dark"}`}
          type="button"
          onClick={handleCopy}
          title="Copia link"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copiato!" : "Copia"}
        </button>
        <input
          type="text"
          className="form-control bg-white border-0 font-monospace small text-truncate"
          value={shareUrl}
          readOnly
          title={shareUrl}
        />
        <button
          className="btn d-flex align-items-center btn-success"
          type="button"
          onClick={apriLink}
        >
          <ExternalLink size={18}></ExternalLink>
        </button>
        
      </div>
      
      <small className="text-muted mt-2 d-block" style={{ fontSize: "0.75rem" }}>

      </small>
    </div>
  );
};