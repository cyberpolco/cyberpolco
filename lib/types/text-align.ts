export type TextAlign = "left" | "center" | "right" | "justify";

export const TEXT_ALIGN_VALUES: TextAlign[] = ["left", "center", "right", "justify"];

export function isTextAlign(value: unknown): value is TextAlign {
  return typeof value === "string" && (TEXT_ALIGN_VALUES as string[]).includes(value);
}
