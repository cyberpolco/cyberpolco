import {
  ShieldCheck,
  Radar,
  SatelliteDish,
  GraduationCap,
  SearchCheck,
  Layers,
  type LucideIcon,
} from "lucide-react";

export type ServiceIconKey =
  | "shield"
  | "radar"
  | "satellite-dish"
  | "graduation-cap"
  | "search-check"
  | "layers";

export const SERVICE_ICONS: Record<ServiceIconKey, LucideIcon> = {
  shield: ShieldCheck,
  radar: Radar,
  "satellite-dish": SatelliteDish,
  "graduation-cap": GraduationCap,
  "search-check": SearchCheck,
  layers: Layers,
};

export const SERVICE_ICON_OPTIONS: { value: ServiceIconKey; label: string }[] = [
  { value: "shield", label: "Shield" },
  { value: "radar", label: "Radar" },
  { value: "satellite-dish", label: "Satellite dish" },
  { value: "graduation-cap", label: "Graduation cap" },
  { value: "search-check", label: "Search check" },
  { value: "layers", label: "Layers" },
];
