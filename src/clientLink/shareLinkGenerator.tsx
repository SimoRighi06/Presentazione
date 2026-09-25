import React, { useState } from "react";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import { getSiteParamFromDomain } from "../hooks/useAppRouting";
import type { AppConfig } from "../types/config";

interface ShareLinkGeneratorProps {
  siteParam: string;
  config: AppConfig;
}

export const ShareLinkGenerator: React.FC<ShareLinkGeneratorProps> = ({
  siteParam,
  config,
}) => {
  const [copied, setCopied] = useState(false);

  const getClientUrl = () => {
    const activeSiteParam =
      siteParam && siteParam.trim()
        ? getSiteParamFromDomain(siteParam)
        : getSiteParamFromDomain(config.dominio);

    const serializedConfig = JSON.stringify(config);
    const encodedString = btoa(
      unescape(encodeURIComponent(serializedConfig)),
    );

    return `${window.location.origin}/v/${activeSiteParam}?data=${encodedString}`;
  };

  const handleCopy = async () => {
    try {
      const clientUrl = getClientUrl();
      await navigator.clipboard.writeText(clientUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Errore nella copia del link:", err);
      alert("Impossibile copiare il link. Copia manualmente la URL.");
    }
  };

  const clientUrl = getClientUrl();

  return (
    <div className="p-4 bg-light rounded-3 border mt-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <LinkIcon size={20} className="text-primary" />
        <h5 className="mb-0 fw-bold">Link per il Cliente</h5>
      </div>

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