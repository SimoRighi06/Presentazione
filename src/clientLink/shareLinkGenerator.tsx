import React, { useState } from "react";
import { Copy, Check, Link as LinkIcon } from "lucide-react";

interface ShareLinkGeneratorProps {
  siteParam: string;
}

export const ShareLinkGenerator: React.FC<ShareLinkGeneratorProps> = ({ siteParam }) => {
  const [copied, setCopied] = useState(false);

  // Genera l'URL pulito
  const clientUrl = `${window.location.origin}/v/${siteParam}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clientUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Errore nella copia:", err);
    }
  };

  return (
    <div className="p-4 bg-light rounded-3 border mt-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <LinkIcon size={20} className="text-primary" />
        <h5 className="mb-0 fw-bold">Link per il Cliente</h5>
      </div>
      <p className="text-muted small mb-3">
        Invia questo link al cliente. La modalità configurazione sarà automaticamente disabilitata.
      </p>
      
      <div className="d-flex gap-2">
        <input 
          type="text" 
          className="form-control bg-white" 
          value={clientUrl} 
          readOnly 
          style={{ fontSize: "0.9rem" }}
        />
        <button 
          onClick={handleCopy}
          className={`btn ${copied ? "btn-success" : "btn-primary"} d-flex align-items-center gap-2`}
          style={{ minWidth: "100px", justifyContent: "center" }}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? "Copiato!" : "Copia"}
        </button>
      </div>
    </div>
  );
};