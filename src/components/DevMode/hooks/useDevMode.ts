// components/DevMode/hooks/useDevMode.ts
import { useState, useEffect, useCallback } from "react";
import type { AppConfig, DevPageSpec } from "../../../types/config";
import { DEFAULT_DEV_SPEC } from "../../../types/config";
import {
  SECTION_TEMPLATES,
  SECTION_HEIGHT_RANGES,
  type SectionTemplate,
} from "../../../types/config";

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

export const useDevMode = (
  config: AppConfig,
  siteParam: string,
  activeTab: string,
  currentDraftProp?: string,
  draftUrlProp?: string,
) => {
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
  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  }, []);

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

  const [imgSrc, setImgSrc] = useState<string>(getInitialImgSrc());
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

  const handleImgError = useCallback(() => {
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
  }, [imgErrorStep, siteParam, currentDraft]);

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
  const currentDevSpec: DevPageSpec =
    config.devSpecs?.[activeTab] || DEFAULT_DEV_SPEC;
  const rawFonts = config.fonts || ["Tosh A", "Mokoko", "Acumin Pro"];
  const typography = config.typographyAssignment || {
    h1h2Font: rawFonts[0] || "Sans-serif",
    subtitlesFont: rawFonts[1] || rawFonts[0] || "Sans-serif",
    bodyFont: rawFonts[2] || rawFonts[0] || "Sans-serif",
  };

  const getContrastColor = (hex: string): string => {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return "#ffffff";
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  };

  const generateMarkdown = () => {
    const colorsCss = (config.colors || [])
      .map((hex, index) => `--color-${index + 1}: ${hex};`)
      .join("\n");
    const md = `# 🚀 Specifiche Tecniche Frontend: ${config.dominio || siteParam}

Data generazione: ${new Date().toLocaleDateString("it-IT")}

## 🎨 1. Design System & Tipografia

\`\`\`css
:root {
  --font-heading: '${typography.h1h2Font}', sans-serif;
  --font-subheading: '${typography.subtitlesFont || typography.h1h2Font}', sans-serif;
  --font-body: '${typography.bodyFont}', sans-serif;
  ${colorsCss}
}
\`\`\`

## 🏗️ 2. Struttura Layout & Albero SEO (Pagina: ${activeTab})

${currentDevSpec.seoSections
  .map(
    (sec) => `
### \`${sec.tag}\` ${sec.headingTag && sec.headingTag !== "none" ? `→ <${sec.headingTag.toUpperCase()}>` : ""}
- **Testo SEO**: ${sec.headingText || "N/A"}
- **Font Ruolo**: ${sec.assignedFontRole === "h1h2" ? `Titoli (${typography.h1h2Font})` : sec.assignedFontRole === "subtitles" ? `Sottotitoli (${typography.subtitlesFont})` : `Corpo (${typography.bodyFont})`}
- **Layout**: ${sec.layoutNote || "Container standard"}
- **Note Tecniche**: ${sec.techNote || "Nessuna"}
`,
  )
  .join("\n---\n")}

## ✅ 3. Checklist Sviluppo

- [x] Un solo tag H1 semantico per pagina
- [ ] Convertire immagini in .webp (< 200KB)
- [ ] Attributi alt descrittivi su ogni <img>
- [ ] Contrasto WCAG AA minimo 4.5:1
- [ ] Schema.org JSON-LD (LocalBusiness / Hotel)

${(currentDevSpec.pageNotes || []).map((n) => `- [ ] ${n}`).join("\n")}
${(config.generalDevTips || []).map((t) => `- [ ] ${t}`).join("\n")}

*Generato da Tecnoprogress Hub X-Ray DevMode Workbench*`;
    copyToClipboard(md, "Markdown SPEC.md copiato");
  };

  return {
    currentDraft,
    isExternalUrl,
    imgSrc,
    setImgSrc,
    isImgLoading,
    setIsImgLoading,
    imgErrorStep,
    setImgErrorStep,
    handleImgError,
    showGrid,
    setShowGrid,
    showFold,
    setShowFold,
    zoomMode,
    setZoomMode,
    rightPanelTab,
    setRightPanelTab,
    copyFeedback,
    copyToClipboard,
    checkedItems,
    toggleCheckItem,
    checkProgress,
    currentDevSpec,
    typography,
    getContrastColor,
    generateMarkdown,
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
  };
};
