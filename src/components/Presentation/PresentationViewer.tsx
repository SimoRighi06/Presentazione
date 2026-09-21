import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, ArrowRight, Loader2} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "../../App.css";

// Setup Worker PDF — caricato dal CDN versionato (come da report)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PresentationViewerProps {
  siteParam: string;
  presentationUrl?: string;
  navItems: { id: string; draftUrl?: string }[];
  onStartDraft: () => void;
  onOpenAdmin: () => void;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({
  siteParam,
  presentationUrl,
  navItems,
  onStartDraft,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  // Altezza PDF dinamica — reagisce al resize della finestra
  const [pdfHeight, setPdfHeight] = useState(() => window.innerHeight * 0.82);

  useEffect(() => {
    const onResize = () => setPdfHeight(window.innerHeight * 0.82);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const currentPdfSrc = useMemo(() => {
    if (!presentationUrl) return "";
    if (
      presentationUrl.startsWith("blob:") ||
      presentationUrl.startsWith("http")
    ) {
      return presentationUrl;
    }
    return `/bozze-proxy/${siteParam}/${presentationUrl}`;
  }, [presentationUrl, siteParam]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setPageNumber(1);
      setLoading(false);
    },
    [],
  );

  const prevPage = useCallback(
    () => setPageNumber((prev) => Math.max(prev - 1, 1)),
    [],
  );

  const nextPage = useCallback(
    () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1)),
    [numPages],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Buona pratica: ignora la navigazione se l'utente sta scrivendo in un input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault(); // Previene eventuali scroll orizzontali/verticali del browser
        prevPage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [prevPage, nextPage]); // Le dipendenze sono stabili grazie a useCallback

  // =========================================================
  // SLIDING WINDOW: Calcola la finestra di pagine da renderizzare (corrente ±1)
  // Solo queste 3 pagine vengono montate nel DOM, non tutte.
  // =========================================================
  const visiblePages = useMemo(() => {
    if (!numPages) return [];
    const pages: number[] = [];
    for (
      let i = Math.max(1, pageNumber - 1);
      i <= Math.min(numPages, pageNumber + 1);
      i++
    ) {
      pages.push(i);
    }
    return pages;
  }, [pageNumber, numPages]);

  // =========================================================
  // PREFETCH delle immagini bozza — con cleanup dei link
  // =========================================================
  useEffect(() => {
    if (!navItems || navItems.length === 0) return;

    const links: HTMLLinkElement[] = [];

    navItems.forEach((item) => {
      const draft = item.draftUrl || item.id;
      if (draft && !draft.startsWith("http")) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = `/bozze-proxy/${siteParam}/images/${draft}.jpg`;
        link.as = "image";
        document.head.appendChild(link);
        links.push(link);
      }
    });

    return () => {
      links.forEach((link) => {
        try {
          document.head.removeChild(link);
        } catch {
          /* già rimosso o non presente */
        }
      });
    };
  }, [siteParam, navItems]);

  return (
    <div className="cloud-viewport">
      <div className="cloud-bg-canvas" />
      <main className="d-flex flex-column align-items-center justify-content-center w-100 h-100 position-relative z-1 p-4 pt-5">
        <div
          className="center-stage-container cloud-glass-card p-0 shadow-lg overflow-hidden position-relative mb-4 d-flex align-items-center justify-content-center bg-white mt-4"
          style={{ width: "100%", maxWidth: "1570px", height: "85vh" }}
        >
          {currentPdfSrc ? (
            <Document
              file={currentPdfSrc}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <Loader2 size={48} className="text-secondary animate-spin" />
              }
              className="w-100 h-100 position-relative d-flex justify-content-center align-items-center"
            >
              {!loading &&
                numPages &&
                visiblePages.map((pg) => (
                  <div
                    key={`page_${pg}`}
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{
                      visibility: pageNumber === pg ? "visible" : "hidden",
                      opacity: pageNumber === pg ? 1 : 0,
                      pointerEvents: pageNumber === pg ? "auto" : "none",
                    }}
                  >
                    <Page
                      pageNumber={pg}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      height={pdfHeight}
                      className="pdf-page-render shadow-sm"
                    />
                  </div>
                ))}
            </Document>
          ) : (
            <div className="text-secondary d-flex flex-column align-items-center justify-content-center h-100">
              <p className="fs-5 m-0">Nessun file PDF configurato.</p>
            </div>
          )}
        </div>

        {/* HUD CONTROLLI: Frecce e Bottone in basso */}
        <div
          className="d-flex align-items-center gap-4 bg-white bg-opacity-75 px-4 py-3 rounded-pill shadow-lg mt-2"
          style={{
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.5)",
          }}
        >
          <div className="d-flex align-items-center gap-2 border-end border-2 pe-4 border-secondary border-opacity-25">
            <button
              onClick={prevPage}
              disabled={pageNumber <= 1}
              className={`btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center p-2 border-0 shadow-sm bg-white ${pageNumber <= 1 ? "opacity-50" : "hover-bg-light"}`}
              style={{ width: "42px", height: "42px" }}
              aria-label="Pagina precedente"
            >
              <ArrowLeft size={20} />
            </button>

            <span
              className="fw-bold text-dark font-monospace fs-6"
              style={{ minWidth: "50px", textAlign: "center" }}
            >
              {numPages
                ? `${String(pageNumber).padStart(2, "0")} / ${String(numPages).padStart(2, "0")}`
                : "00"}
            </span>

            <button
              onClick={nextPage}
              disabled={pageNumber >= (numPages || 1)}
              className={`btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center p-2 border-0 shadow-sm bg-white ${pageNumber >= (numPages || 1) ? "opacity-50" : "hover-bg-light"}`}
              style={{ width: "42px", height: "42px" }}
              aria-label="Pagina successiva"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <button
            onClick={onStartDraft}
            className="btn btn-dark fw-bold px-4 rounded-pill shadow"
          >
            Vai alla Bozza Sito ➔
          </button>
        </div>
      </main>
    </div>
  );
};

export default PresentationViewer;
