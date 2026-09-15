/* import React, { useState, useRef } from "react";
import { Upload, Download, Image as ImageIcon } from "lucide-react";

export const WebPConverter = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [status, setStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsConverting(true);
    setStatus("Lettura file...");

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      setStatus("Conversione in WebP...");

      // Usiamo Canvas per convertire
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Impossibile creare il contesto canvas");
      
      ctx.drawImage(img, 0, 0);

      // toBlob è più sicuro di toDataURL per immagini giganti (evita crash di memoria)
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error("Conversione fallita");
          
          // Crea il link per il download
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
          setStatus(`✅ Fatto! Scaricato WebP da ${sizeMB} MB. Caricalo sul server.`);
          setIsConverting(false);
        },
        "image/webp",
        0.85 // Qualità 85%
      );
    } catch (error) {
      console.error(error);
      setStatus("❌ Errore durante la conversione. L'immagine potrebbe essere troppo grande per il browser.");
      setIsConverting(false);
    }
    
    // Resetta l'input per poter caricare di nuovo lo stesso file se serve
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 bg-light rounded-3 border mt-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <ImageIcon size={20} className="text-primary" />
        <h5 className="mb-0 fw-bold">Convertitore JPG → WebP</h5>
      </div>
      <p className="text-muted small mb-3">
        Seleziona un'immagine pesante. Il browser la convertirà in WebP e te la farà scaricare pronta per il server.
      </p>
      
      <div className="d-flex flex-column gap-2">
        <input 
          ref={fileInputRef}
          type="file" 
          className="form-control" 
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
          disabled={isConverting}
        />
        
        {status && (
          <div className={`alert ${status.includes("✅") ? "alert-success" : status.includes("❌") ? "alert-danger" : "alert-info"} py-2 mb-0`}>
            {status}
          </div>
        )}
        
        {isConverting && (
          <div className="text-center">
            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
          </div>
        )}
      </div>
    </div>
  );
}; */