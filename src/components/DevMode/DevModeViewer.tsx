// components/DevMode/DevModeViewer.tsx
import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import type { AppConfig, NavItem } from "../../types/config";
import { useDevMode } from "./hooks/useDevMode";
import { useAIAnalysis } from "./hooks/useAIAnalysis";
import { DevModeTopbar } from "./DevModeTopbar";
import { DevModeImageViewer } from "./DevModeImageViewer";
import { DevModeConsole } from "./DevModeConsole";
import "./DevModeViewer.scss";

interface DevModeViewerProps {
  config: AppConfig;
  siteParam: string;
  activeTab: string;
  currentDraft?: string;
  draftUrl?: string;
  onSelectTab: (item: NavItem) => void;
  onCloseDev: () => void;
}

export const DevModeViewer: React.FC<DevModeViewerProps> = ({
  config,
  siteParam,
  activeTab,
  currentDraft,
  draftUrl,
  onSelectTab,
  onCloseDev,
}) => {
  const currentDraftResolved =
    currentDraft ||
    (draftUrl && !draftUrl.includes("/") ? draftUrl : activeTab);

  // Hook principale della DevMode
  const dev = useDevMode(config, siteParam, activeTab, currentDraft, draftUrl);

  // ✅ Hook AI: DENTRO il componente, con i valori risolti
  const { isAnalyzing, aiResult, analyzeSection, clearCache } = useAIAnalysis(
    siteParam,
    currentDraftResolved,
  );

  // Reset cache AI quando cambia bozza o pagina
  useEffect(() => {
    clearCache();
  }, [siteParam, currentDraftResolved, activeTab, clearCache]);

  // ✅ Wrapper che chiama sia la selezione locale sia l'AI
  const handleImageClickWithAI = (e: React.MouseEvent<HTMLDivElement>) => {
    dev.handleImageClick(e);

    // Estrai Y% per passarlo all'AI
    const rect = e.currentTarget.getBoundingClientRect();
    const yPercent = (e.clientY - rect.top) / rect.height;

    // Se il click ha effettivamente rilevato una sezione, chiama l'AI
    if (dev.selectionMode === "click") {
      analyzeSection(yPercent);
    }
  };

  const handleDragEndWithAI = (e: React.MouseEvent<HTMLDivElement>) => {
    dev.handleDragEnd(e);

    // Calcola Y% del centro della selezione
    if (dev.selectionBox) {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerY = dev.selectionBox.y + dev.selectionBox.height / 2;
      const yPercent = centerY / rect.height;
      analyzeSection(yPercent);
    }
  };

  return (
    <div className="devmode-container">
      <DevModeTopbar
        config={config}
        siteParam={siteParam}
        activeTab={activeTab}
        zoomMode={dev.zoomMode}
        showGrid={dev.showGrid}
        showFold={dev.showFold}
        onSelectTab={onSelectTab}
        onToggleZoom={() =>
          dev.setZoomMode((p) => (p === "fit" ? "original" : "fit"))
        }
        onToggleGrid={() => dev.setShowGrid(!dev.showGrid)}
        onToggleFold={() => dev.setShowFold(!dev.showFold)}
        onExportSpec={dev.generateMarkdown}
        onCloseDev={onCloseDev}
      />

      <div className="devmode-split">
        <DevModeImageViewer
          imgSrc={dev.imgSrc}
          isImgLoading={dev.isImgLoading}
          imgErrorStep={dev.imgErrorStep}
          isExternalUrl={dev.isExternalUrl}
          currentDraft={currentDraftResolved}
          zoomMode={dev.zoomMode}
          showGrid={dev.showGrid}
          showFold={dev.showFold}
          selectionMode={dev.selectionMode}
          selectionBox={dev.selectionBox}
          selectedSection={dev.selectedSection}
          isDragging={dev.isDragging}
          isAnalyzing={isAnalyzing}
          onImageClick={handleImageClickWithAI}
          onDragStart={dev.handleDragStart}
          onDragMove={dev.handleDragMove}
          onDragEnd={handleDragEndWithAI}
          onImgError={() => {
            if (dev.imgErrorStep === 0) {
              dev.setImgErrorStep(1);
              dev.setImgSrc(
                `/bozze-proxy/${siteParam}/images/${currentDraftResolved}.jpg`,
              );
            } else if (dev.imgErrorStep === 1) {
              dev.setImgErrorStep(2);
              dev.setImgSrc(
                `/bozze-proxy/${siteParam}/images/${currentDraftResolved}.png`,
              );
            } else {
              dev.setImgErrorStep(3);
              dev.setIsImgLoading(false);
              dev.setImgSrc(
                `https://placehold.co/1920x1080/12161f/ffffff?text=Bozza+non+trovata+(${currentDraftResolved}+su+${siteParam})`,
              );
            }
          }}
          onImgLoad={() => dev.setIsImgLoading(false)}
        />

        <DevModeConsole
          rightPanelTab={dev.rightPanelTab}
          onTabChange={dev.setRightPanelTab}
          hasSelectedSection={!!dev.selectedSection}
          seoProps={{
            activeTab,
            seoSections: dev.currentDevSpec.seoSections,
            typography: dev.typography,
            onCopy: dev.copyToClipboard,
          }}
          typoProps={{
            typography: dev.typography,
            onCopy: dev.copyToClipboard,
          }}
          /* colorsProps={{
            colors: config.colors || [],
            onCopy: dev.copyToClipboard,
            getContrastColor: dev.getContrastColor, 
          }} */
          notesProps={{
            checkProgress: dev.checkProgress,
            checkedItems: dev.checkedItems,
            onToggleCheck: dev.toggleCheckItem,
            currentDevSpec: dev.currentDevSpec,
            generalDevTips: config.generalDevTips,
          }}
          sectionProps={{
            selectedSection: dev.selectedSection,
            selectionMode: dev.selectionMode,
            onClearSelection: () => {
              dev.setSelectedSection(null);
              clearCache();
            },
            onSelectionModeChange: dev.setSelectionMode,
            onCopy: dev.copyToClipboard,
            // ✅ Dati AI passati al SectionPanel
            isAnalyzing,
            aiResult,
          }}
        />
      </div>

      {dev.copyFeedback && (
        <div className="dev-toast-notification">
          <CheckCircle size={16} className="text-dark me-2" />
          <span>{dev.copyFeedback}</span>
        </div>
      )}
    </div>
  );
};

export default DevModeViewer;
