import type { ProjectConfig } from '../types/project';

// 🌟 Configurazione Bozza collegata al Server Aziendale Interno
export const currentProject: ProjectConfig = {
  clientName: "Sentieri di Stelle",
  fonts: ["Arial", "Playfair Display", "Source Sans Pro"],
  palette: [
    { hex: "#F4F1EA", label: "Alabaster" },
    { hex: "#E2D3C3", label: "Warm Linen" },
    { hex: "#3A3632", label: "Charcoal" },
    { hex: "#C89B7B", label: "Terracotta" }
  ],
  inspoImageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
  options: [
    {
      id: "aspx",
      label: "Sito .aspx",
      type: "iframe",
      url: "http://servizi.local/bozze/bozza-preview.aspx#1" 
    },
    {
      id: "img1",
      label: "img 1",
      type: "image",
      url: "images/bozza01.jpg"
    },
    {
      id: "img2",
      label: "img 2",
      type: "image",
      url: "images/bozza02.jpg"
    },
    {
      id: "img3",
      label: "img 3",
      type: "image",
      url: "images/bozza03.jpg"
    }
  ]
};