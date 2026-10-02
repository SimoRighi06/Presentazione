# Hub X-Ray - Documentazione Tecnica Completa

> **Piattaforma professionale per la presentazione di bozze sito web a clienti**
> Versione: 1.0 | Ultimo aggiornamento: Settembre 2026

---

## 📑 Indice

1. [Panoramica del Progetto](#1-panoramica-del-progetto)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Architettura del Sistema](#3-architettura-del-sistema)
4. [Struttura del Progetto](#4-struttura-del-progetto)
5. [Modalità dell'Applicazione](#5-modalità-dellapplicazione)
6. [Flussi Utente](#6-flussi-utente)
7. [Componenti UI e Design System](#7-componenti-ui-e-design-system)
8. [Gestione Immagini Bozza](#8-gestione-immagini-bozza)
9. [Gestione PDF e Presentazioni](#9-gestione-pdf-e-presentazioni)
10. [Gestione Loghi e Asset](#10-gestione-loghi-e-asset)
11. [Sistema di Configurazione](#11-sistema-di-configurazione)
12. [Sicurezza e Controllo Accessi](#12-sicurezza-e-controllo-accessi)
13. [Ottimizzazioni Performance](#13-ottimizzazioni-performance)
14. [Deploy e Hosting](#14-deploy-e-hosting)
15. [Architettura Backend Futura (Node.js + IIS)](#15-architettura-backend-futura-nodejs--iis)
16. [Troubleshooting e Debugging](#16-troubleshooting-e-debugging)
17. [Roadmap Futura](#17-roadmap-futura)

---

## 1. Panoramica del Progetto

**Hub X-Ray** è una Single Page Application (SPA) costruita con React e TypeScript, progettata per presentare bozze di siti web ai clienti in modo professionale, interattivo e configurabile.

### 🎯 Obiettivi del Progetto

- **Presentazione professionale**: Mostrare bozze sito con un'esperienza visiva premium (effetto glassmorphism, animazioni GSAP, tilt 3D)
- **Configurazione dinamica**: Permettere al team interno di personalizzare colori, font, navigazione e contenuti senza toccare il codice
- **Scalabilità**: Gestire 900-1000+ clienti con possibilità di versioning (es. `hotel-labussola-2024`, `hotel-labussola-2026`)
- **Performance**: Caricamento ottimizzato anche per immagini di grandi dimensioni (fino a 1920x10000px)

### 📊 Metriche Chiave

| Metrica                            | Valore          |
| ---------------------------------- | --------------- |
| Clienti gestibili                  | 1000+           |
| Tempo configurazione nuovo cliente | ~5 minuti       |
| Dimensione bundle (produzione)     | ~300 KB gzipped |
| Punteggio Lighthouse (produzione)  | 85+             |
| Punteggio Accessibilità            | 94/100          |

---

## 2. Stack Tecnologico

### Frontend Core

| Tecnologia       | Versione | Scopo                              |
| ---------------- | -------- | ---------------------------------- |
| **React**        | 18.x     | Framework UI principale            |
| **TypeScript**   | 5.3      | Type safety e developer experience |
| **Vite**         | 4.5      | Build tool e dev server (HMR)      |
| **GSAP**         | 3.12     | Animazioni performanti a 60fps     |
| **Bootstrap**    | 5.3      | Framework CSS responsive           |
| **Lucide React** | 0.32     | Icone modulari e leggere           |
| **react-pdf**    | 7.7      | Visualizzazione PDF client-side    |

### Dipendenze di Sviluppo

| Strumento               | Scopo                                          |
| ----------------------- | ---------------------------------------------- |
| **ESLint**              | Linting e qualità codice (0 errori, 0 warning) |
| **TypeScript Compiler** | Type-checking e compilazione                   |
| **Vite Plugins**        | Ottimizzazione bundle e code splitting         |

### Configurazione Build

```typescript
// vite.config.ts - Code splitting manuale
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('pdfjs-dist') || id.includes('react-pdf')) return 'pdf-vendor';
    if (id.includes('gsap')) return 'gsap-vendor';
    if (id.includes('bootstrap') || id.includes('lucide-react')) return 'ui-vendor';
    return 'vendor';
  }
}
```

graph TB
subgraph Client["🖥️ Frontend React/Vite"]
A[App.tsx - Router Principale]
B[ConfigPanel - Admin UI]
C[PresentationViewer - PDF]
D[Floating Cards]
E[Header/Footer HUD]
end

    subgraph Hosting["🌐 Hosting Attuale"]
        F[Netlify - Static Hosting]
        G[public/config.json]
        H[CDN Globale]
    end

    subgraph External["🔗 Servizi Esterni"]
        I[bozzasito.com - Bozze Live]
        J[Proxy Immagini /bozze-proxy/]
    end

    A --> B
    A --> C
    A --> D
    A --> E

    F --> G
    F --> H

    A --> I
    A --> J

    style Client fill:#e1f5ff
    style Hosting fill:#fff4e1
    style External fill:#f3e5f5

    graph TB
    subgraph Frontend["Frontend React"]
        A[Build Ottimizzata]
    end

    subgraph Backend["Backend API"]
        B[Node.js + Express]
        C[Database PostgreSQL con JSONB]
        D[Archiviazione File - filesystem/S3]
    end

    subgraph Server["Server IIS"]
        E[Windows Server]
        F[web.config - SPA Routing]
    end

    A -->|richiede config| B
    B -->|query DB| C
    B -->|serve file| D
    E --> F
    F --> A

    style Frontend fill:#e8f5e9
    style Backend fill:#e1f5ff
    style Server fill:#fff4e1

## Struttura del progetto

presentazione2/
├── public/
│ ├── config.json # Configurazione default cliente
│ ├── web.config # Routing IIS per SPA
│ ├── Gilroy-ExtraBold.otf # Font custom
│ ├── Gilroy-Light.otf # Font custom
│ ├── favicon.svg
│ ├── icons.svg
│ └── \_redirects # Redirect Netlify
│
├── src/
│ ├── App.tsx # Componente root + routing viste
│ ├── App.css # Stili globali + glassmorphism
│ ├── main.tsx # Entry point
│ ├── index.css # Reset CSS + variabili
│ │
│ ├── assets/
│ │ ├── logo-tp-black.svg # Logo Tecnoprogress
│ │ ├── tp_logo.png
│ │ └── hero.png
│ │
│ ├── components/
│ │ ├── ConfigPan/
│ │ │ └── ConfigPanel.tsx # Pannello admin completo
│ │ │
│ │ ├── Floating/
│ │ │ ├── FloatingCard.tsx # Card fluttuante base
│ │ │ ├── FloatingCard.css
│ │ │ ├── CustomFloatingCard.tsx # Card espandibile custom
│ │ │ ├── CreditCanvasCard.tsx # Card credits
│ │ │ ├── CreditsPopupCard.tsx # Popup credits
│ │ │ └── InfoPopupCard.tsx # Info dominio
│ │ │
│ │ ├── HUD/
│ │ │ ├── HeaderHUD.tsx # Header con searchbar admin
│ │ │ ├── HeaderHUD.css
│ │ │ ├── FooterHUD.tsx # Footer con navigazione
│ │ │ └── FooterHUD.css
│ │ │
│ │ ├── Presentation/
│ │ │ ├── PresentationViewer.tsx # Viewer PDF con sliding window
│ │ │ └── PresentationViewer.css
│ │ │
│ │ ├── Login/
│ │ │ └── AdminLoginGate.tsx # Gate autenticazione admin
│ │ │
│ │ └── backgrounds/
│ │ └── bg1/
│ │ ├── Grainent.tsx # Effetto grain animato
│ │ └── Grainent.css
│ │
│ ├── hooks/
│ │ └── useAppRouting.ts # Custom hook routing + stato
│ │
│ ├── types/
│ │ ├── config.ts # Interfaccia AppConfig
│ │ └── project.ts # Interfaccia progetto futuro
│ │
│ └── data/
│ └── mockData.ts # (Rimosso - non più usato)
│
├── server/ # FUTURO - Backend Node.js
│ └── src/routes/
│
├── package.json
├── vite.config.ts # Config Vite + proxy middleware
├── tsconfig.json
├── eslint.config.js
├── netlify.toml # Config deploy Netlify
└── README.md

## Modalità

stateDiagram-v2
[*] --> DraftMode: Apertura URL
DraftMode --> AdminMode: Alt+C → Login
AdminMode --> PresentationMode: "Via Presentazione"
PresentationMode --> DraftMode: "Vai alla Bozza Sito"
AdminMode --> DraftMode: "Bozzasito"
DraftMode --> PresentationMode: Footer → "Presentazione"

### Admin

graph LR
A[Premi Alt+C] --> B[Login Gate]
B -->|Password corretta| C[Pannello Configurazione]
C --> D[Configura:<br/>- Dominio<br/>- Colori<br/>- Font<br/>- PDF<br/>- Nav Items]
D --> E{PDF Locale?}
E -->|Sì| F[Drag & Drop Upload]
E -->|No| G[Inserisci URL server]
F --> H
G --> H[Clicca "Bozzasito"]
H --> I[Vista Bozza con config applicata]
I --> J[Esporta config.json]
J --> K[Carica su server cliente]

    style A fill:#e1f5ff
    style C fill:#fff4e1
    style H fill:#c8e6c9
    style I fill:#dcedc8

Dettaglio passaggi:
Accesso: Premere Alt+C (o Ctrl+Shift+C) → appare AdminLoginGate
Autenticazione: Inserire password → isAuthenticated = true
Configurazione: Modificare tutti i campi in ConfigPanel
Applicazione: Cliccare "Bozzasito" → onApplyConfig aggiorna stato globale
Esportazione: Cliccare "config.json" → download file JSON
Deploy: Caricare config.json nella cartella cliente sul server

### Client

graph LR
A[Riceve link<br/>WhatsApp/Email] --> B[Apre URL]
B --> C{Has Presentation?}
C -->|Sì| D[Visualizza PDF<br/>Presentazione]
C -->|No| E[Visualizza direttamente<br/>Bozza Sito]
D --> F[Clicca "Vai alla Bozza Sito"]
F --> E
E --> G[Esplora Bozza:<br/>- Floating Cards<br/>- Palette<br/>- Font<br/>- Texture]
G --> H[Naviga tra pagine<br/>Footer Tabs]
H --> I[Feedback via<br/>email/telefono]

    style A fill:#f3e5f5
    style B fill:#e1f5ff
    style D fill:#fff4e1
    style E fill:#e8f5e9
    style G fill:#fce4ec

URL pulito e professionale
Nessun accesso admin (nemmeno con shortcut)
Navigazione fluida tra bozze
Animazioni 3D e glassmorphism
Responsive su mobile/tablet

## Caricamento immagini

sequenceDiagram
participant U as Utente
participant A as App.tsx
participant P as Proxy Vite
participant S as Server bozzasito.com

    U->>A: Cambia bozza (click tab)
    A->>A: setIsImageLoading(true)
    A->>P: GET /bozze-proxy/{site}/images/{draft}.webp
    P->>S: Forward richiesta

    alt WebP esiste
        S-->>P: 200 OK (WebP ~3-4MB)
        P-->>A: Immagine WebP
        A->>A: onLoad → setIsImageLoading(false)
        A->>U: Mostra immagine ✅
    else WebP non esiste (404)
        S-->>P: 404 Not Found
        P-->>A: Errore
        A->>A: onError → prova JPG
        A->>P: GET /bozze-proxy/{site}/images/{draft}.jpg
        P->>S: Forward richiesta
        S-->>P: 200 OK (JPG ~9MB)
        P-->>A: Immagine JPG
        A->>A: onLoad → setIsImageLoading(false)
        A->>U: Mostra immagine ✅
    end

    alt Anche JPG fallisce
        A->>A: onError → placeholder
        A->>U: Mostra placeholder con messaggio ❌
    end


## Configurazione
graph LR
    A[config.json<br/>public/] -->|fetch| B[App.tsx]
    B -->|useState + useEffect| C[Stato Globale]
    C -->|props| D[HeaderHUD]
    C -->|props| E[FloatingCards]
    C -->|props| F[FooterHUD]
    C -->|props| G[PresentationViewer]
    
    H[DEFAULT_CONFIG<br/>fallback] -.->|se config.json<br/>non disponibile| B
    
    style A fill:#e1f5ff
    style H fill:#f3e5f5
    style C fill:#fff4e1


### Framework esterni
React: https://react.dev
Vite: https://vitejs.dev
GSAP: https://gsap.com/docs
react-pdf: https://github.com/wojtekmaj/react-pdf
Bootstrap 5: https://getbootstrap.com/docs/5.3


