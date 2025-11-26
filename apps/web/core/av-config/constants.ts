export type PanelOption = {
  id: string;
  label: string;
  image: string;
};

export const PANEL_IMAGE_FALLBACK = "/images/panel-fallback.png";

export const PANEL_OPTIONS: PanelOption[] = [
  { id: "ROOM_PC", label: "Room PC", image: "/images/panel-images/ROOM_PC.png" },
  {
    id: "DOC_CAM",
    label: "Document Camera",
    image: "/images/panel-images/DOC_CAM.png",
  },
  { id: "LAPTOP_1", label: "Laptop 1", image: "/images/panel-images/LAPTOP_1.png" },
  { id: "LAPTOP_2", label: "Laptop 2", image: "/images/panel-images/LAPTOP_2.png" },
  { id: "LAPTOP_3", label: "Laptop 3", image: "/images/panel-images/LAPTOP_3.png" },
  { id: "PC_EXT", label: "PC Extension", image: "/images/panel-images/PC_EXT.png" },
];

export const PANEL_OPTION_MAP = PANEL_OPTIONS.reduce<Record<string, PanelOption>>(
  (acc, option) => {
    acc[option.id] = option;
    return acc;
  },
  {}
);

export const getPanelImageSrc = (panelId?: string | null) => {
  const key = (panelId ?? "").toUpperCase();
  if (!key) return PANEL_IMAGE_FALLBACK;
  return PANEL_OPTION_MAP[key]?.image ?? PANEL_IMAGE_FALLBACK;
};

export const BYOD_OPTIONS = [
  "MacBook",
  "PC",
  "iPad",
  "Android Tablet",
  "Surface",
  "Linux",
  "KIS Provided Laptop",
];

