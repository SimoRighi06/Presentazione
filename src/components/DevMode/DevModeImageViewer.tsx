// components/DevMode/DevModeImageViewer.tsx
import React from "react";
import { Loader2, Target } from "lucide-react";
import type { SectionTemplate } from "../../types/config";
import type { SelectionMode, ZoomMode } from "./hooks/useDevMode";

interface DevModeImageViewerProps {
  imgSrc: string;
  isImgLoading: boolean;
  imgErrorStep: number;
  isExternalUrl: boolean;
  currentDraft: string;
  zoomMode: ZoomMode;
  showGrid: boolean;
  showFold: boolean;
  selectionMode: SelectionMode;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  selectedSection: SectionTemplate | null;
  isDragging: boolean;
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.MouseEvent<HTMLDivElement>) => void;
  onImgError: () => void;
  onImgLoad: () => void;
}

export const DevModeImageViewer: React.FC<DevModeImageViewerProps> = ({
  imgSrc, isImgLoading, imgErrorStep, isExternalUrl, currentDraft,
  zoomMode, showGrid, showFold, selectionMode, selectionBox, selectedSection,
  isDragging, onImageClick, onDragStart, onDragMove, onDragEnd, onImgError, onImgLoad,
}) => (
  <div className={`devmode-left ${zoomMode === "original" ? "overflow-scroll-both" : "overflow-scroll-y"}`}>
    <div className={`viewer-wrapper ${zoomMode === "original" ? "wrapper-original" : "wrapper-fit"}`}>
      <div
        className={`image-selection-wrapper ${selectionMode === "click" ? "cursor-crosshair" : "cursor-drag"}`}
        onClick={onImageClick}
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={(e) => { if (isDragging) onDragEnd(e as any); }}
      >
        {isImgLoading && !isExternalUrl && (
          <div className="dev-img-loader">
            <Loader2 size={40} className="animate-spin text-primary mb-2" />
            <span className="small text-light">Caricamento bozza ({currentDraft})...</span>
            {imgErrorStep > 0 && <span className="badge bg-secondary mt-1">Tentativo formato #{imgErrorStep + 1}</span>}
          </div>
        )}

        {showGrid && (
          <div className={`grid-overlay-container ${zoomMode === "original" ? "container-original" : "container-fit"}`}>
            <div className="bootstrap-grid-row">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bootstrap-grid-col">
                  <span className="col-label">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showFold && (
          <>
            <div className="fold-line fold-1080">
              <span className="fold-badge">FOLD 1080px (Standard Desktop)</span>
            </div>
            <div className="fold-line fold-900">
              <span className="fold-badge fold-badge-yellow">FOLD 900px (Laptop 14-15")</span>
            </div>
          </>
        )}

        {isExternalUrl ? (
          <iframe src={imgSrc} title={`Anteprima Bozza`} className="draft-iframe" />
        ) : (
          <img
            src={imgSrc}
            alt={`Bozza ${currentDraft}`}
            className={`draft-image ${zoomMode === "original" ? "img-original" : "img-fit"}`}
            onLoad={onImgLoad}
            onError={onImgError}
          />
        )}

        {selectionBox && (
          <div className="selection-overlay" style={{
            left: `${selectionBox.x}px`, top: `${selectionBox.y}px`,
            width: `${selectionBox.width}px`, height: `${selectionBox.height}px`,
          }} />
        )}

        {selectedSection && (
          <div className="detected-section-badge">
            <Target size={14} />
            <span>{selectedSection.name}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);