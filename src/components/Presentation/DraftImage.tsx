import React, { useState } from "react";
import { Loader2 } from "lucide-react";

interface DraftImageProps {
  draftUrl: string;
  siteParam: string;
  brandLogoUrl: string;
  clientName: string;
}

export const DraftImage: React.FC<DraftImageProps> = ({
  draftUrl,
  siteParam,
  brandLogoUrl,
  clientName,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(`/bozze-proxy/${siteParam}/images/${draftUrl}.webp`);

  const handleImageError = () => {
    if (currentSrc.endsWith(".webp")) {
      console.log(`WebP non trovato, provo JPG: ${draftUrl}`);
      setCurrentSrc(`/bozze-proxy/${siteParam}/images/${draftUrl}.jpg`);
    } else if (currentSrc.endsWith(".jpg") && !currentSrc.includes("placehold.co")) {
      console.warn(`JPG non trovato, mostro placeholder: ${draftUrl}`);
      setCurrentSrc(`https://placehold.co/1920x1080/12161f/ffffff?text=Immagine+Bozza+non+trovata+(${draftUrl})`);
      setIsImageLoading(false);
    } else {
      setIsImageLoading(false);
    }
  };

  return (
    <div
      className="w-100 h-100 overflow-y-auto bg-white position-relative"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {isImageLoading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white z-2">
          <div className="d-flex flex-column align-items-center gap-3">
            <img
              src={brandLogoUrl}
              alt={`${clientName} Logo`}
              className="mb-2"
              loading="lazy"
              style={{
                maxHeight: "80px",
                objectFit: "contain",
                opacity: 0.5,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <h3 className="fw-bold text-dark mb-0 fs-4">{clientName}</h3>
            <Loader2 size={32} className="text-secondary animate-spin mt-2" />
            <p className="text-muted small mb-0 mt-2">
              Caricamento bozza in corso...
            </p>
          </div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={`Bozza ${draftUrl}`}
        className="w-100 d-block h-auto"
        loading="lazy"
        decoding="async"
        style={{ objectFit: "contain", objectPosition: "top center" }}
        onLoad={() => setIsImageLoading(false)}
        onError={handleImageError}
      />
    </div>
  );
};
