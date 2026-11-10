// components/DevMode/utils/devModeHelpers.ts
import type { AppConfig, TypographyAssignment } from "../../../types/config";

export const copyToClipboard = (text: string, label: string, onFeedback: (msg: string) => void) => {
  navigator.clipboard.writeText(text);
  onFeedback(label);
  setTimeout(() => onFeedback(""), 2500);
};

export const getContrastColor = (hex: string): string => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
};

export const getTypography = (
  config: AppConfig,
): TypographyAssignment => {
  const rawFonts = config.fonts || ["Tosh A", "Mokoko", "Acumin Pro"];
  return config.typographyAssignment || {
    h1h2Font: rawFonts[0] || "Sans-serif",
    subtitlesFont: rawFonts[1] || rawFonts[0] || "Sans-serif",
    bodyFont: rawFonts[2] || rawFonts[0] || "Sans-serif",
  };
};

export const generateMarkdown = (
  config: AppConfig,
  siteParam: string,
  activeTab: string,
  typography: TypographyAssignment,
  onCopy: (text: string, label: string) => void,
) => {
  const colorsCss = (config.colors || [])
    .map((hex, index) => `--color-${index + 1}: ${hex};`)
    .join("\n");

  const currentDevSpec = config.devSpecs?.[activeTab];
  const seoSections = currentDevSpec?.seoSections || [];
  const pageNotes = currentDevSpec?.pageNotes || [];

  const md = `# 🚀 Specifiche Tecniche Frontend: ${config.dominio || siteParam}

Data generazione: ${new Date().toLocaleDateString("it-IT")}

## 🎨 1. Design System & Tipografia

\`\`\`css
:root {
  /* Tipografia */
  --font-heading: '${typography.h1h2Font}', sans-serif;
  --font-subheading: '${typography.subtitlesFont || typography.h1h2Font}', sans-serif;
  --font-body: '${typography.bodyFont}', sans-serif;

  /* Palette Colori */
  ${colorsCss}
}
\`\`\`

## 🏗️ 2. Struttura Layout & Albero SEO (Pagina: ${activeTab})

${seoSections
  .map(
    (sec) => `
### \`${sec.tag}\` ${sec.headingTag && sec.headingTag !== "none" ? `→ <${sec.headingTag.toUpperCase()}>` : ""}
- **Testo SEO**: ${sec.headingText || "N/A"}
- **Font Ruolo**: ${sec.assignedFontRole === "h1h2" ? `Titoli (${typography.h1h2Font})` : sec.assignedFontRole === "subtitles" ? `Sottotitoli (${typography.subtitlesFont})` : `Corpo (${typography.bodyFont})`}
- **Layout Grid**: ${sec.layoutNote || "Container standard"}
- **Note Tecniche**: ${sec.techNote || "Nessuna specifica aggiuntiva"}
`,
  )
  .join("\n---\n")}

## ✅ 3. Checklist Sviluppo & Best Practice

- [x] Rispettare un solo tag H1 semantico per pagina
- [ ] Convertire e comprimere le immagini in formato .webp (< 200KB)
- [ ] Aggiungere attributi alt descrittivi su ogni <img>
- [ ] Verificare contrasto WCAG AA minimo 4.5:1
- [ ] Configurare metadati Schema.org (LocalBusiness / Hotel)

${pageNotes.map((note) => `- [ ] ${note}`).join("\n")}

${(config.generalDevTips || []).map((tip) => `- [ ] ${tip}`).join("\n")}

---
*Generato automaticamente da Tecnoprogress Hub X-Ray DevMode Workbench*
`;

  onCopy(md, "Markdown SPEC.md copiato");
};