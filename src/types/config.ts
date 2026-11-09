// types/config.ts
export interface NavItem {
  id: string;
  label: string;
  draftUrl: string;
  path?: string;
}

export interface TypographyAssignment {
  h1h2Font: string; // es. "Tosh A"
  subtitlesFont?: string; // es. "Mokoko"
  bodyFont: string; // es. "Acumin Pro"
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
      layoutNote:
        "Navbar sticky top, logo a sinistra, menu e CTA rapida a destra",
      assignedFontRole: "body",
    },
    {
      id: "sec-hero",
      tag: "section",
      headingTag: "h1",
      headingText: "Titolo Principale per Keyword Primaria SEO",
      assignedFontRole: "h1h2",
      layoutNote:
        "Full viewport height (100vh), sfondo immagine/video con overlay dark 40%",
      techNote: "Hero con fetchpriority='high'. Testo con fade-in GSAP.",
    },
    {
      id: "sec-about",
      tag: "section",
      headingTag: "h2",
      headingText: "Presentazione e Concept Struttura",
      assignedFontRole: "h1h2",
      layoutNote:
        "2 colonne: Testo + Paragrafi (col-lg-6) e Immagine/Gallery (col-lg-6)",
    },
    {
      id: "sec-cards",
      tag: "section",
      headingTag: "h2",
      headingText: "Le Camere & Suite / Servizi",
      assignedFontRole: "h1h2",
      layoutNote: "Griglia responsive 3 colonne (col-12 col-md-6 col-lg-4)",
      techNote: "Card con hover zoom morbido e lazy load immagini.",
    },
    {
      id: "sec-footer",
      tag: "footer",
      headingTag: "none",
      layoutNote:
        "4 colonne: Dati aziendali e logo, Link rapidi, Orari/Contatti, Mappa",
      techNote: "Includere Schema.org JSON-LD per LocalBusiness / Hotel.",
    },
  ],
  pageNotes: [
    "Ottimizzare tutte le immagini in formato .webp con risoluzione max 1920px per desktop e 800px per mobile.",
    "Mantenere un contrasto minimo 4.5:1 (WCAG AA) su tutti i testi rispetto allo sfondo.",
    "Utilizzare CSS variable centralizzate per colori e font-family per facilitare future personalizzazioni.",
  ],
};

/* DEVMODE */
// types/config.ts - Aggiungi queste interfacce

export interface SectionTemplate {
  id: string;
  name: string;
  tag: "header" | "section" | "article" | "footer" | "nav" | "aside";
  headingTag: "h1" | "h2" | "h3" | "h4" | "none";
  fontRole: "h1h2" | "subtitles" | "body";
  bootstrapClasses: string;
  scssImports: string[];
  layoutNote: string;
  techNote: string;
  codeSnippet: string;
}

export const SECTION_TEMPLATES: Record<string, SectionTemplate> = {
  header: {
    id: "header",
    name: "Header / Navbar",
    tag: "header",
    headingTag: "none",
    fontRole: "body",
    bootstrapClasses:
      "navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top",
    scssImports: ["@import 'components/navbar'"],
    layoutNote: "Navbar sticky top, logo a sinistra, menu e CTA a destra",
    techNote:
      "Usare Bootstrap Navbar con collapse su mobile. Logo SVG ottimizzato.",
    codeSnippet: `<header class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
  <div class="container">
    <a class="navbar-brand" href="/">
      <img src="/assets/logo.svg" alt="Logo" height="40">
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <nav class="collapse navbar-collapse" id="mainNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="#about">Chi Siamo</a></li>
        <li class="nav-item"><a class="nav-link" href="#services">Servizi</a></li>
        <li class="nav-item"><a class="nav-link btn btn-primary text-white px-4 ms-2" href="#contact">Contatti</a></li>
      </ul>
    </nav>
  </div>
</header>`,
  },
  hero: {
    id: "hero",
    name: "Hero Section",
    tag: "section",
    headingTag: "h1",
    fontRole: "h1h2",
    bootstrapClasses: "container-fluid px-0 position-relative",
    scssImports: ["@import 'components/hero'", "@import 'mixins/overlay'"],
    layoutNote:
      "Full viewport height (100vh), sfondo immagine/video con overlay dark 40%",
    techNote:
      "Hero con fetchpriority='high'. Testo con fade-in GSAP. Immagine lazy load con LCP optimization.",
    codeSnippet: `<section class="hero-section position-relative" style="height: 100vh;">
  <div class="hero-background">
    <img src="/assets/hero-bg.webp" alt="Hero Background" class="w-100 h-100 object-fit-cover" fetchpriority="high">
    <div class="hero-overlay"></div>
  </div>
  <div class="container h-100 d-flex align-items-center">
    <div class="row">
      <div class="col-lg-8 col-md-10">
        <h1 class="hero-title display-3 fw-bold text-white mb-4">
          Titolo Principale con Keyword SEO
        </h1>
        <p class="hero-subtitle lead text-white-50 mb-4">
          Sottotitolo descrittivo che cattura l'attenzione
        </p>
        <a href="#cta" class="btn btn-primary btn-lg px-5">Scopri di più</a>
      </div>
    </div>
  </div>
</section>`,
  },
  content: {
    id: "content",
    name: "Content / About",
    tag: "section",
    headingTag: "h2",
    fontRole: "h1h2",
    bootstrapClasses: "container py-5",
    scssImports: ["@import 'components/content'"],
    layoutNote: "2 colonne: Testo (col-lg-6) e Immagine/Gallery (col-lg-6)",
    techNote:
      "Usare grid Bootstrap con gap-4. Immagini con loading='lazy' e decoding='async'.",
    codeSnippet: `<section class="about-section py-5">
  <div class="container">
    <div class="row g-4 align-items-center">
      <div class="col-lg-6">
        <h2 class="section-title mb-4">La Nostra Storia</h2>
        <p class="lead text-muted mb-4">
          Testo introduttivo che presenta l'azienda o il servizio principale.
        </p>
        <p class="mb-4">
          Paragrafo descrittivo con dettagli e informazioni chiave per l'utente.
        </p>
        <a href="#details" class="btn btn-outline-primary">Leggi tutto</a>
      </div>
      <div class="col-lg-6">
        <img src="/assets/about-image.webp" alt="About" class="img-fluid rounded shadow" loading="lazy">
      </div>
    </div>
  </div>
</section>`,
  },
  cards: {
    id: "cards",
    name: "Cards / Services",
    tag: "section",
    headingTag: "h2",
    fontRole: "h1h2",
    bootstrapClasses: "container py-5",
    scssImports: ["@import 'components/cards'", "@import 'mixins/hover'"],
    layoutNote: "Griglia responsive 3 colonne (col-12 col-md-6 col-lg-4)",
    techNote:
      "Card con hover zoom morbido e lazy load immagini. Usare Bootstrap Card component.",
    codeSnippet: `<section class="services-section py-5 bg-light">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="section-title">I Nostri Servizi</h2>
      <p class="text-muted">Scopri cosa possiamo fare per te</p>
    </div>
    <div class="row g-4">
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm service-card">
          <img src="/assets/service-1.webp" class="card-img-top" alt="Service 1" loading="lazy">
          <div class="card-body">
            <h3 class="card-title h5">Servizio Uno</h3>
            <p class="card-text text-muted">Descrizione breve del servizio offerto.</p>
            <a href="#" class="btn btn-link text-decoration-none">Scopri di più →</a>
          </div>
        </div>
      </div>
      <!-- Ripeti per altri servizi -->
    </div>
  </div>
</section>`,
  },
  footer: {
    id: "footer",
    name: "Footer",
    tag: "footer",
    headingTag: "none",
    fontRole: "body",
    bootstrapClasses: "bg-dark text-light py-5",
    scssImports: ["@import 'components/footer'"],
    layoutNote: "4 colonne: Logo+Dati, Link rapidi, Contatti, Mappa/Newsletter",
    techNote:
      "Includere Schema.org JSON-LD per LocalBusiness. Link con aria-label per accessibilità.",
    codeSnippet: `<footer class="bg-dark text-light py-5">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-4 col-md-6">
        <img src="/assets/logo-white.svg" alt="Logo" height="50" class="mb-3">
        <p class="text-muted small">Descrizione breve azienda</p>
        <p class="small mb-0">P.IVA: 12345678901</p>
      </div>
      <div class="col-lg-2 col-md-6">
        <h5 class="text-white mb-3">Link Rapidi</h5>
        <ul class="list-unstyled">
          <li class="mb-2"><a href="#about" class="text-muted text-decoration-none">Chi Siamo</a></li>
          <li class="mb-2"><a href="#services" class="text-muted text-decoration-none">Servizi</a></li>
          <li class="mb-2"><a href="#contact" class="text-muted text-decoration-none">Contatti</a></li>
        </ul>
      </div>
      <div class="col-lg-3 col-md-6">
        <h5 class="text-white mb-3">Contatti</h5>
        <p class="small mb-1"><i class="bi bi-geo-alt me-2"></i>Via Roma 1, Milano</p>
        <p class="small mb-1"><i class="bi bi-telephone me-2"></i>+39 02 1234567</p>
        <p class="small mb-0"><i class="bi bi-envelope me-2"></i>info@azienda.it</p>
      </div>
      <div class="col-lg-3 col-md-6">
        <h5 class="text-white mb-3">Newsletter</h5>
        <form>
          <div class="input-group">
            <input type="email" class="form-control" placeholder="La tua email">
            <button class="btn btn-primary" type="submit">Iscriviti</button>
          </div>
        </form>
      </div>
    </div>
    <hr class="my-4 border-secondary">
    <div class="text-center small text-muted">
      © 2024 Azienda. Tutti i diritti riservati.
    </div>
  </div>
</footer>`,
  },
};

// Mappa percentuali altezza → sezione
export const SECTION_HEIGHT_RANGES: Record<
  string,
  { min: number; max: number }
> = {
  header: { min: 0, max: 0.12 },
  hero: { min: 0.12, max: 0.45 },
  content: { min: 0.45, max: 0.65 },
  cards: { min: 0.65, max: 0.85 },
  footer: { min: 0.85, max: 1.0 },
};
