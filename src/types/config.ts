// types/config.ts
export interface NavItem {
  id: string;
  label: string;
  draftUrl: string;
  path?: string;
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
}

export const DEFAULT_CONFIG: AppConfig = {
  dominio: "hotellabussola.com", 
  colors: ["#2B2B2B", "#E2D3C3", "#FFFFFF"],
  fonts: ["Space Grotesk", "Outfit"],
  textureUrl: "",
  imageBaseUrl: `${window.location.origin}/assets/images/`,
  navItems: [
    { id: "home", label: "Home", draftUrl: "bozza01", path: "#home" },
    { id: "menu", label: "Menu", draftUrl: "bozza02", path: "#menu" },
    { id: "pagina1", label: "Pagina1", draftUrl: "bozza03", path: "#pagina1" },
  ],
};

export interface AdminPsw{
  adminPassword?:string;
}