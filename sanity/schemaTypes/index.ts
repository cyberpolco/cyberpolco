import { type SchemaTypeDefinition } from "sanity";

import { localizedArticleText, localizedJobText, localizedServiceText, localizedCourseText } from "./objects/localizedText";
import {
  heroText,
  titleBodyText,
  titleSubtitleText,
  titleOnlyText,
  finalCtaText,
  storyText,
  leadershipText,
  bodyOnlyText,
  subtitleOnlyText,
  taglineOnlyText,
} from "./objects/blockText";
import { statItem, officeItem, socialLinks } from "./objects/settingsParts";
import { academyLesson, academyModule } from "./objects/academyParts";

import { article } from "./documents/article";
import { job } from "./documents/job";
import { service } from "./documents/service";
import { academyCourse } from "./documents/academyCourse";
import { homePage } from "./documents/homePage";
import { aboutPage } from "./documents/aboutPage";
import { servicesPage } from "./documents/servicesPage";
import { careersPage } from "./documents/careersPage";
import { contactPage } from "./documents/contactPage";
import { footer } from "./documents/footer";
import { siteSettings } from "./documents/siteSettings";

// Document types with exactly one instance, edited directly rather than as a
// list — see sanity/structure.ts for how these are pinned in the Studio nav.
export const SINGLETON_TYPES = new Set([
  "homePage",
  "aboutPage",
  "servicesPage",
  "careersPage",
  "contactPage",
  "footer",
  "siteSettings",
]);

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // documents
    article,
    job,
    service,
    academyCourse,
    homePage,
    aboutPage,
    servicesPage,
    careersPage,
    contactPage,
    footer,
    siteSettings,
    // objects
    localizedArticleText,
    localizedJobText,
    localizedServiceText,
    localizedCourseText,
    heroText,
    titleBodyText,
    titleSubtitleText,
    titleOnlyText,
    finalCtaText,
    storyText,
    leadershipText,
    bodyOnlyText,
    subtitleOnlyText,
    taglineOnlyText,
    statItem,
    officeItem,
    socialLinks,
    academyLesson,
    academyModule,
  ],
};
