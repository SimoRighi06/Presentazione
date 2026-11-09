// types/config.ts
export interface NavItem {
  id: string;
  label: string;
  draftUrl: string;
  path?: string;
}

export interface TypographyAssignment {
  h1h2Font: string;          // es. "Tosh A"
  subtitlesFont?: string;    // es. "Mokoko"
  bodyFont: string;          // es. "Acumin Pro"
}

export interface SeoSectionItem {
  id: string;
  tag: "header" | "section" | "article" | "footer";
  headingTag?: "h1" | "h2" | "h3" | "h4" | "none";
  headingText?: string;      
  assignedFontRole?: "h1h2" | "subtitles" | "body";
  layoutNote?: string;       
  techNote?: string;         
}

export interface DevPageSpec {
  seoSections: SeoSectionItem[];
  pageNotes?: string[];
}

export interface AppConfig {
  hasPresentation?: boolean;
  presentationUrl?: string;
  slidesCount?: number;
  dominio: string;
  colors: string[];
  fonts: string[];
  textureUrl: string;
  imageBaseUrl: string;
  navItems: NavItem[];
  isCustomCardVisible?: boolean;
  customCardTitle?: string;
  customCardText?: string;
  customCardImageUrl?: string;
  customDescriptionPalette?: string;
  typographyAssignment?: TypographyAssignment;
  devSpecs?: Record<string, DevPageSpec>; // Chiave: id del navItem (es. "home")
  generalDevTips?: string[];
}

export const DEFAULT_CONFIG: AppConfig = {
  dominio: "hoteltorbole", 
  colors: ["#2f3b4c", "#4f5b6b", "#b6d4da", "#e4dace", "f1efe2"],
  fonts: ["Tosh A", "Mokoko", "Acumin Pro"],
  textureUrl: "",
  imageBaseUrl: `${window.location.origin}/assets/images/`,
  navItems: [
    { id: "home", label: "Home", draftUrl: "bozza01", path: "#home" },
    { id: "menu", label: "Menu", draftUrl: "bozza02", path: "#menu" },
  ],
};

export interface AdminPsw {
  adminPassword?: string;
}

export const DEFAULT_DEV_SPEC: DevPageSpec = {
  seoSections: [
    {
      id: "sec-header",
      tag: "header",
      headingTag: "none",
      layoutNote: "Navbar sticky top, logo a sinistra, menu e CTA rapida a destra",
      assignedFontRole: "body"
    },
    {
      id: "sec-hero",
      tag: "section",
      headingTag: "h1",
      headingText: "Titolo Principale per Keyword Primaria SEO",
      assignedFontRole: "h1h2",
      layoutNote: "Full viewport height (100vh), sfondo immagine/video con overlay dark 40%",
      techNote: "Hero con fetchpriority='high'. Testo con fade-in GSAP."
    },
    {
      id: "sec-about",
      tag: "section",
      headingTag: "h2",
      headingText: "Presentazione e Concept Struttura",
      assignedFontRole: "h1h2",
      layoutNote: "2 colonne: Testo + Paragrafi (col-lg-6) e Immagine/Gallery (col-lg-6)"
    },
    {
      id: "sec-cards",
      tag: "section",
      headingTag: "h2",
      headingText: "Le Camere & Suite / Servizi",
      assignedFontRole: "h1h2",
      layoutNote: "Griglia responsive 3 colonne (col-12 col-md-6 col-lg-4)",
      techNote: "Card con hover zoom morbido e lazy load immagini."
    },
    {
      id: "sec-footer",
      tag: "footer",
      headingTag: "none",
      layoutNote: "4 colonne: Dati aziendali e logo, Link rapidi, Orari/Contatti, Mappa",
      techNote: "Includere Schema.org JSON-LD per LocalBusiness / Hotel."
    }
  ],
  pageNotes: [
    "Ottimizzare tutte le immagini in formato .webp con risoluzione max 1920px per desktop e 800px per mobile.",
    "Mantenere un contrasto minimo 4.5:1 (WCAG AA) su tutti i testi rispetto allo sfondo.",
    "Utilizzare CSS variable centralizzate per colori e font-family per facilitare future personalizzazioni."
  ]
};