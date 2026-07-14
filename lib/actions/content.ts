"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { saveContentBlock } from "@/lib/db/content";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "");
}

export async function updateHomeContentAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  await saveContentBlock("home.hero", {
    fr: {
      eyebrow: field(formData, "hero_eyebrow_fr"),
      heroTitle: field(formData, "hero_heroTitle_fr"),
      heroSubtitle: field(formData, "hero_heroSubtitle_fr"),
      ctaPrimary: field(formData, "hero_ctaPrimary_fr"),
      ctaSecondary: field(formData, "hero_ctaSecondary_fr"),
    },
    en: {
      eyebrow: field(formData, "hero_eyebrow_en"),
      heroTitle: field(formData, "hero_heroTitle_en"),
      heroSubtitle: field(formData, "hero_heroSubtitle_en"),
      ctaPrimary: field(formData, "hero_ctaPrimary_en"),
      ctaSecondary: field(formData, "hero_ctaSecondary_en"),
    },
  });

  await saveContentBlock("home.mission", {
    fr: { title: field(formData, "mission_title_fr"), body: field(formData, "mission_body_fr") },
    en: { title: field(formData, "mission_title_en"), body: field(formData, "mission_body_en") },
  });

  await saveContentBlock("home.vision", {
    fr: { title: field(formData, "vision_title_fr"), body: field(formData, "vision_body_fr") },
    en: { title: field(formData, "vision_title_en"), body: field(formData, "vision_body_en") },
  });

  await saveContentBlock("home.map", {
    fr: { title: field(formData, "map_title_fr"), subtitle: field(formData, "map_subtitle_fr") },
    en: { title: field(formData, "map_title_en"), subtitle: field(formData, "map_subtitle_en") },
  });

  await saveContentBlock("home.servicesIntro", {
    fr: {
      title: field(formData, "servicesIntro_title_fr"),
      subtitle: field(formData, "servicesIntro_subtitle_fr"),
    },
    en: {
      title: field(formData, "servicesIntro_title_en"),
      subtitle: field(formData, "servicesIntro_subtitle_en"),
    },
  });

  await saveContentBlock("home.clientsIntro", {
    fr: { title: field(formData, "clientsIntro_title_fr") },
    en: { title: field(formData, "clientsIntro_title_en") },
  });

  await saveContentBlock("home.statsIntro", {
    fr: { title: field(formData, "statsIntro_title_fr") },
    en: { title: field(formData, "statsIntro_title_en") },
  });

  await saveContentBlock("home.articlesIntro", {
    fr: {
      title: field(formData, "articlesIntro_title_fr"),
      subtitle: field(formData, "articlesIntro_subtitle_fr"),
    },
    en: {
      title: field(formData, "articlesIntro_title_en"),
      subtitle: field(formData, "articlesIntro_subtitle_en"),
    },
  });

  await saveContentBlock("home.finalCta", {
    fr: {
      title: field(formData, "finalCta_title_fr"),
      body: field(formData, "finalCta_body_fr"),
      button: field(formData, "finalCta_button_fr"),
    },
    en: {
      title: field(formData, "finalCta_title_en"),
      body: field(formData, "finalCta_body_en"),
      button: field(formData, "finalCta_button_en"),
    },
  });

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/content/home");
}

export async function updateAboutContentAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  await saveContentBlock("about.story", {
    fr: {
      p1: field(formData, "story_p1_fr"),
      p2: field(formData, "story_p2_fr"),
      p3: field(formData, "story_p3_fr"),
      quote: field(formData, "story_quote_fr"),
    },
    en: {
      p1: field(formData, "story_p1_en"),
      p2: field(formData, "story_p2_en"),
      p3: field(formData, "story_p3_en"),
      quote: field(formData, "story_quote_en"),
    },
  });

  await saveContentBlock("about.leadership", {
    fr: {
      name: field(formData, "leadership_name_fr"),
      roleTitle: field(formData, "leadership_roleTitle_fr"),
      body: field(formData, "leadership_body_fr"),
    },
    en: {
      name: field(formData, "leadership_name_en"),
      roleTitle: field(formData, "leadership_roleTitle_en"),
      body: field(formData, "leadership_body_en"),
    },
  });

  await saveContentBlock("about.sector", {
    fr: { body: field(formData, "sector_body_fr") },
    en: { body: field(formData, "sector_body_en") },
  });

  revalidatePath("/[locale]/about", "page");
  revalidatePath("/admin/content/about");
}

export async function updatePageIntrosAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  await saveContentBlock("careers.intro", {
    fr: { subtitle: field(formData, "careers_subtitle_fr") },
    en: { subtitle: field(formData, "careers_subtitle_en") },
  });

  await saveContentBlock("contact.intro", {
    fr: { subtitle: field(formData, "contact_subtitle_fr") },
    en: { subtitle: field(formData, "contact_subtitle_en") },
  });

  await saveContentBlock("services.intro", {
    fr: { subtitle: field(formData, "services_subtitle_fr") },
    en: { subtitle: field(formData, "services_subtitle_en") },
  });

  revalidatePath("/[locale]/careers", "page");
  revalidatePath("/[locale]/contact", "page");
  revalidatePath("/[locale]/services", "page");
  revalidatePath("/admin/content/page-intros");
}
