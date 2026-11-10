// components/DevMode/hooks/useDevMode.ts
import { useState, useEffect } from "react";
import type { AppConfig, /* NavItem */ } from "../../../types/config";
import { DEFAULT_DEV_SPEC } from "../../../types/config";
import {
  SECTION_TEMPLATES,
  SECTION_HEIGHT_RANGES,
  type SectionTemplate,
} from "../../../types/config";
import {
  copyToClipboard,
  getTypography,
  generateMarkdown,
} from "../utils/devModeHelpers";

export type RightPanelTab =
  | "seo"
  | "typography"
  | "colors"
  | "notes"
  | "section";
export type SelectionMode = "click" | "drag";
export type ZoomMode = "fit" | "original";

interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DragStart {
  x: number;
  y: number;
}

interface DevModeState {
  // Toolbar
  showGrid: boolean;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  showFold: boolean;
  setShowFold: React.Dispatch<React.SetStateAction<boolean>>;
  zoomMode: ZoomMode;
  setZoomMode: React.Dispatch<React.SetStateAction<ZoomMode>>;
  rightPanelTab: RightPanelTab;
  setRightPanelTab: React.Dispatch<React.SetStateAction<RightPanelTab>>;

  // Feedback
  copyFeedback: string | null;
  copyToClipboard: (text: string, label: string) => void;

  // Checklist
  checkedItems: Record<string, boolean>;
  toggleCheckItem: (id: string) => void;
  checkProgress: number;

  // Immagine
  imgSrc: string;
  setImgSrc: React.Dispatch<React.SetStateAction<string>>;
  isImgLoading: boolean;
  setIsImgLoading: React.Dispatch<React.SetStateAction<boolean>>;
  imgErrorStep: number;
  setImgErrorStep: React.Dispatch<React.SetStateAction<number>>;
  isExternalUrl: boolean;

  // Selezione sezione
  selectedSection: SectionTemplate | null;
  setSelectedSection: React.Dispatch<
    React.SetStateAction<SectionTemplate | null>
  >;
  selectionMode: SelectionMode;
  setSelectionMode: React.Dispatch<React.SetStateAction<SelectionMode>>;
  selectionBox: SelectionBox | null;
  isDragging: boolean;
  dragStart: DragStart | null;
  handleImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleDragStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleDragMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleDragEnd: (e: React.MouseEvent<HTMLDivElement>) => void;

  // Derived data
  currentDevSpec: AppConfig["devSpecs"] extends Record<string, infer T>
    ? T
    : any;
  typography: ReturnType<typeof getTypography>;
  generateMarkdown: () => void;
}

export const useDevMode = (
  config: AppConfig,
  siteParam: string,
  activeTab: string,
  currentDraftProp?: string,
  draftUrlProp?: string,
): DevModeState => {
  const currentDraft =
    currentDraftProp ||
    (draftUrlProp && !draftUrlProp.includes("/") ? draftUrlProp : activeTab);

  // Toolbar
  const [showGrid, setShowGrid] = useState(false);
  const [showFold, setShowFold] = useState(true);
  const [zoomMode, setZoomMode] = useState<ZoomMode>("fit");
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>("seo");

  // Feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const handleCopy = (text: string, label: string) =>
    copyToClipboard(text, label, setCopyFeedback);

  // Checklist
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    "h1-single": true,
    "webp-opt": true,
    "alt-tags": false,
    "contrast-wcag": true,
    "schema-org": false,
    "meta-tags": true,
    "lazy-load": true,
  });
  const toggleCheckItem = (id: string) =>
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalChecks = Object.keys(checkedItems).length;
  const completedChecks = Object.values(checkedItems).filter(Boolean).length;
  const checkProgress = Math.round((completedChecks / totalChecks) * 100);

  // Immagine
  const isExternalUrl = Boolean(
    (currentDraft &&
      (currentDraft.startsWith("http://") ||
        currentDraft.startsWith("https://"))) ||
    (draftUrlProp &&
      (draftUrlProp.startsWith("http://") ||
        draftUrlProp.startsWith("https://"))),
  );

  const getInitialImgSrc = () => {
    if (isExternalUrl) return currentDraft || draftUrlProp || "";
    if (!currentDraft) return "";
    return `/bozze-proxy/${siteParam}/images/${currentDraft}.webp`;
  };

  const [imgSrc, setImgSrc] = useState<string>(getInitialImgSrc);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [imgErrorStep, setImgErrorStep] = useState<number>(0);

  useEffect(() => {
    if (isExternalUrl) {
      setImgSrc(currentDraft || draftUrlProp || "");
      setIsImgLoading(false);
      setImgErrorStep(0);
      return;
    }
    setImgSrc(`/bozze-proxy/${siteParam}/images/${currentDraft}.webp`);
    setIsImgLoading(true);
    setImgErrorStep(0);
  }, [siteParam, currentDraft, draftUrlProp, isExternalUrl]);

  /* const handleImgError = () => {
    if (imgErrorStep === 0) {
      console.log(
        `[DevMode] WebP non trovato per ${currentDraft}, provo JPG...`,
      );
      setImgErrorStep(1);
      setImgSrc(`/bozze-proxy/${siteParam}/images/${currentDraft}.jpg`);
      return;
    }
    if (imgErrorStep === 1) {
      console.log(
        `[DevMode] JPG non trovato per ${currentDraft}, provo PNG...`,
      );
      setImgErrorStep(2);
      setImgSrc(`/bozze-proxy/${siteParam}/images/${currentDraft}.png`);
      return;
    }
    console.warn(
      `[DevMode] Bozza "${currentDraft}" non trovata su ${siteParam}.bozzasito.com`,
    );
    setImgErrorStep(3);
    setIsImgLoading(false);
    setImgSrc(
      `https://placehold.co/1920x1080/12161f/ffffff?text=Bozza+non+trovata+(${currentDraft}+su+${siteParam})`,
    );
  }; */

  // Selezione sezione
  const [selectedSection, setSelectedSection] =
    useState<SectionTemplate | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("click");
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DragStart | null>(null);

  const detectSectionFromY = (yPercent: number): SectionTemplate | null => {
    for (const [sectionId, range] of Object.entries(SECTION_HEIGHT_RANGES)) {
      if (yPercent >= range.min && yPercent < range.max) {
        return SECTION_TEMPLATES[sectionId] || null;
      }
    }
    return null;
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectionMode !== "click") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const yPercent = y / rect.height;
    const detected = detectSectionFromY(yPercent);
    setSelectedSection(detected);
    setSelectionBox({ x: 0, y: y - 20, width: rect.width, height: 40 });
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectionMode !== "drag") return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const x = Math.min(dragStart.x, currentX);
    const y = Math.min(dragStart.y, currentY);
    const width = Math.abs(currentX - dragStart.x);
    const height = Math.abs(currentY - dragStart.y);
    setSelectionBox({ x, y, width, height });
  };

  const handleDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !selectionBox) return;
    setIsDragging(false);
    setDragStart(null);
    const centerY = selectionBox.y + selectionBox.height / 2;
    const rect = e.currentTarget.getBoundingClientRect();
    const yPercent = centerY / rect.height;
    const detected = detectSectionFromY(yPercent);
    setSelectedSection(detected);
  };

  // Derived data
  const currentDevSpec = config.devSpecs?.[activeTab] || DEFAULT_DEV_SPEC;
  const typography = getTypography(config);

  const handleGenerateMarkdown = () =>
    generateMarkdown(config, siteParam, activeTab, typography, handleCopy);

  return {
    showGrid,
    setShowGrid,
    showFold,
    setShowFold,
    zoomMode,
    setZoomMode,
    rightPanelTab,
    setRightPanelTab,
    copyFeedback,
    copyToClipboard: handleCopy,
    checkedItems,
    toggleCheckItem,
    checkProgress,
    imgSrc,
    setImgSrc,
    isImgLoading,
    setIsImgLoading,
    imgErrorStep,
    setImgErrorStep,
    isExternalUrl,
    selectedSection,
    setSelectedSection,
    selectionMode,
    setSelectionMode,
    selectionBox,
    isDragging,
    dragStart,
    handleImageClick,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    currentDevSpec,
    typography,
    generateMarkdown: handleGenerateMarkdown,
  };
};
