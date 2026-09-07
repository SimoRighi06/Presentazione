# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```



```
presentazione2
├─ README.md
├─ REPORT_PRESTAZIONI_E_FLUSSI.md
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  ├─ Gilroy-ExtraBold.otf
│  ├─ Gilroy-Light.otf
│  ├─ favicon.svg
│  └─ icons.svg
├─ src
│  ├─ App.css
│  ├─ App.tsx
│  ├─ assets
│  │  ├─ hero.png
│  │  ├─ logo-tp-black.svg
│  │  ├─ react.svg
│  │  ├─ tp_logo.png
│  │  └─ vite.svg
│  ├─ components
│  │  ├─ ConfigPan
│  │  │  └─ ConfigPanel.tsx
│  │  ├─ Floating
│  │  │  ├─ CreditCanvasCard.tsx
│  │  │  ├─ CreditsPopupCard.tsx
│  │  │  ├─ CustomFloatingCard.tsx
│  │  │  ├─ FloatingCard.css
│  │  │  ├─ FloatingCard.tsx
│  │  │  └─ InfoPopupCard.tsx
│  │  ├─ HUD
│  │  │  ├─ FooterHUD.css
│  │  │  ├─ FooterHUD.tsx
│  │  │  ├─ HeaderHUD.css
│  │  │  └─ HeaderHUD.tsx
│  │  ├─ Presentation
│  │  │  ├─ PresentationViewer.css
│  │  │  └─ PresentationViewer.tsx
│  │  ├─ XRayStage
│  │  │  ├─ XRayStage.css
│  │  │  └─ XRayStage.tsx
│  │  └─ backgrounds
│  │     └─ bg1
│  │        ├─ Grainent.css
│  │        └─ Grainent.tsx
│  ├─ data
│  │  └─ mockData.ts
│  ├─ index.css
│  ├─ main.tsx
│  └─ types
│     ├─ config.ts
│     └─ project.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vercel.json
└─ vite.config.ts

```