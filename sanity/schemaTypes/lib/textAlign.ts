import { defineField } from "sanity";

const TEXT_ALIGN_OPTIONS = ["left", "center", "right", "justify"];

export function alignField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: "string",
    options: { list: TEXT_ALIGN_OPTIONS, layout: "radio", direction: "horizontal" },
  });
}
