// components/DevMode/DevModeConsole.tsx
import React from "react";
import { Layers, Type, Palette, CheckSquare, MousePointer } from "lucide-react";
import type { RightPanelTab } from "./hooks/useDevMode";
import { SeoPanel, type SeoPanelProps } from "./panels/SeoPanel";
import { TypographyPanel, type TypographyPanelProps } from "./panels/TypographyPanel";
import { ColorsPanel, type ColorsPanelProps } from "./panels/ColorsPanel";
import { NotesPanel, type NotesPanelProps } from "./panels/NotesPanel";
import { SectionPanel, type SectionPanelProps } from "./panels/SectionPanel"; 

interface DevModeConsoleProps {
  rightPanelTab: RightPanelTab;
  onTabChange: (tab: RightPanelTab) => void;
  hasSelectedSection: boolean;
  // Props pass-through per i panel
  seoProps: SeoPanelProps;
  typoProps: TypographyPanelProps;
  colorsProps?: ColorsPanelProps;
  notesProps: NotesPanelProps;
  sectionProps: SectionPanelProps;
}

const TABS: { id: RightPanelTab; label: string; icon: React.ElementType }[] = [
  { id: "seo", label: "SEO & Layout", icon: Layers },
  { id: "typography", label: "Tipografia", icon: Type },
  { id: "colors", label: "Colori", icon: Palette },
  { id: "notes", label: "Best Practice", icon: CheckSquare },
  { id: "section", label: "Sezione", icon: MousePointer },
];


export const DevModeConsole: React.FC<DevModeConsoleProps> = ({
  rightPanelTab, onTabChange, hasSelectedSection,
  seoProps, typoProps, colorsProps, notesProps, sectionProps,
}) => (
  <div className="devmode-right">
    <div className="console-tabs">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`tab-btn ${rightPanelTab === id ? "active" : ""}`}
          onClick={() => onTabChange(id)}
        >
          <Icon size={15} /> {label}
          {id === "section" && hasSelectedSection && <span className="badge-active">●</span>}
        </button>
      ))}
    </div>
    <div className="console-content">
      {rightPanelTab === "seo" && <SeoPanel {...seoProps} />}
      {rightPanelTab === "typography" && <TypographyPanel {...typoProps} />}
      {/* {rightPanelTab === "colors" && <ColorsPanel {...colorsProps} />} */}
      {rightPanelTab === "notes" && <NotesPanel {...notesProps} />}
      {rightPanelTab === "section" && <SectionPanel {...sectionProps} />}
    </div>
  </div>
);