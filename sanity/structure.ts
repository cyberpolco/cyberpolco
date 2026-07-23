import type { StructureResolver } from "sanity/structure";
import { SINGLETON_TYPES } from "./schemaTypes";

const SINGLETONS: { type: string; title: string }[] = [
  { type: "homePage", title: "Home page" },
  { type: "aboutPage", title: "About page" },
  { type: "servicesPage", title: "Services page" },
  { type: "careersPage", title: "Careers page" },
  { type: "contactPage", title: "Contact page" },
  { type: "footer", title: "Footer" },
  { type: "siteSettings", title: "Site settings" },
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SINGLETONS.map(({ type, title }) =>
        S.listItem()
          .title(title)
          .id(type)
          .child(S.document().schemaType(type).documentId(type))
      ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !SINGLETON_TYPES.has(item.getId() ?? "")
      ),
    ]);
