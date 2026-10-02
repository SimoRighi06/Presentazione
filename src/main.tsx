import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/global.scss";
import App from "./App.tsx";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react"
/* import 'bootstrap-icons/font/bootstrap-icons.css'; */

createRoot(document.getElementById("root")!).render(

  <StrictMode>

    <App />
    <SpeedInsights />
    <Analytics/>
  </StrictMode>,
);
