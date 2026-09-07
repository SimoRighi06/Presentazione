export interface DraftOption {
  id: string;
  label: string;
  type: 'iframe' | 'image';
  url: string;
}

export interface ColorSwatch {
  hex: string;
  label?: string;
}

export interface ProjectConfig {
  clientName: string;
  fonts: string[];
  palette: ColorSwatch[];
  inspoImageUrl: string;
  options: DraftOption[];
}