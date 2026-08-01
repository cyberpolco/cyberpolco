"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { needsApproval } from "@/lib/auth/approval";
import { addPendingChange } from "@/lib/db/pending-changes";
import { applyContentBundle, type ContentBundle } from "@/lib/db/content";
import { getSettings } from "@/lib/db/settings";
import type { SessionPayload } from "@/lib/auth/session";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "");
}

// Page content blocks (and the settings fields some pages also touch) have
// no owner concept — a whole-page submission always needs super_admin
// review from a non-super_admin, same as Starlink pricing/site settings.
async function submitOrApply(
  session: SessionPayload,
  bundle: ContentBundle,
  targetId: string,
  redirectPath: string
): Promise<void> {
  if (
    needsApproval({ existingRecord: { createdBy: null }, sessionUserId: session.userId, sessionRole: session.role })
  ) {
    await addPendingChange({
      targetTable: "content_block",
      targetId,
      proposedData: bundle,
      proposedBy: session.userId,
    });
    redirect(`${redirectPath}?pending=1`);
  }

  await applyContentBundle(bundle);
}

export async function updateHomeContentAction(formData: FormData) {
  const session = await requireRole(["super_admin", "content_editor"]);

  const currentSettings = await getSettings();
  const stats = currentSettings.stats.map((s, i) => ({
    ...s,
    value: field(formData, `stat_value_${i}`) || s.value,
    fr: field(formData, `stat_fr_${i}`) || s.fr,
    en: field(formData, `stat_en_${i}`) || s.en,
  }));

  const bundle: ContentBundle = {
    blocks: {
      "home.hero": {
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
      },
      "home.mission": {
        fr: { title: field(formData, "mission_title_fr"), body: field(formData, "mission_body_fr") },
        en: { title: field(formData, "mission_title_en"), body: field(formData, "mission_body_en") },
      },
      "home.vision": {
        fr: { title: field(formData, "vision_title_fr"), body: field(formData, "vision_body_fr") },
        en: { title: field(formData, "vision_title_en"), body: field(formData, "vision_body_en") },
      },
      "home.map": {
        fr: { title: field(formData, "map_title_fr"), subtitle: field(formData, "map_subtitle_fr") },
        en: { title: field(formData, "map_title_en"), subtitle: field(formData, "map_subtitle_en") },
      },
      "home.servicesIntro": {
        fr: {
          title: field(formData, "servicesIntro_title_fr"),
          subtitle: field(formData, "servicesIntro_subtitle_fr"),
        },
        en: {
          title: field(formData, "servicesIntro_title_en"),
          subtitle: field(formData, "servicesIntro_subtitle_en"),
        },
      },
      "home.clientsIntro": {
        fr: { title: field(formData, "clientsIntro_title_fr") },
        en: { title: field(formData, "clientsIntro_title_en") },
      },
      "home.statsIntro": {
        fr: { title: field(formData, "statsIntro_title_fr") },
        en: { title: field(formData, "statsIntro_title_en") },
      },
      "home.articlesIntro": {
        fr: {
          title: field(formData, "articlesIntro_title_fr"),
          subtitle: field(formData, "articlesIntro_subtitle_fr"),
        },
        en: {
          title: field(formData, "articlesIntro_title_en"),
          subtitle: field(formData, "articlesIntro_subtitle_en"),
        },
      },
      "home.finalCta": {
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
      },
    },
    // Stats live in the settings singleton, not content_blocks, but are
    // edited from this same form since that's where they visually appear.
    stats,
    revalidate: [{ path: "/[locale]", type: "page" }, { path: "/admin/cms/pages/home" }],
  };

  await submitOrApply(session, bundle, "home", "/admin/cms/pages/home");
}

export async function updateAboutContentAction(formData: FormData) {
  const session = await requireRole(["super_admin", "content_editor"]);

  const bundle: ContentBundle = {
    blocks: {
      "about.story": {
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
      },
      "about.leadership": {
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
      },
    },
    revalidate: [{ path: "/[locale]/about", type: "page" }, { path: "/admin/cms/pages/about" }],
  };

  await submitOrApply(session, bundle, "about", "/admin/cms/pages/about");
}

export async function updateServicesPageAction(formData: FormData) {
  const session = await requireRole(["super_admin", "content_editor"]);

  const bundle: ContentBundle = {
    blocks: {
      "services.intro": {
        fr: { subtitle: field(formData, "subtitle_fr") },
        en: { subtitle: field(formData, "subtitle_en") },
      },
    },
    revalidate: [{ path: "/[locale]/services", type: "page" }, { path: "/admin/cms/pages/services" }],
  };

  await submitOrApply(session, bundle, "services", "/admin/cms/pages/services");
}

export async function updateCareersPageAction(formData: FormData) {
  const session = await requireRole(["super_admin", "content_editor"]);

  const bundle: ContentBundle = {
    blocks: {
      "careers.intro": {
        fr: { subtitle: field(formData, "subtitle_fr") },
        en: { subtitle: field(formData, "subtitle_en") },
      },
    },
    revalidate: [{ path: "/[locale]/careers", type: "page" }, { path: "/admin/cms/pages/careers" }],
  };

  await submitOrApply(session, bundle, "careers", "/admin/cms/pages/careers");
}

export async function updateContactPageAction(formData: FormData) {
  const session = await requireRole(["super_admin", "content_editor"]);

  const bundle: ContentBundle = {
    blocks: {
      "contact.intro": {
        fr: { subtitle: field(formData, "subtitle_fr") },
        en: { subtitle: field(formData, "subtitle_en") },
      },
    },
    revalidate: [{ path: "/[locale]/contact", type: "page" }, { path: "/admin/cms/pages/contact" }],
  };

  await submitOrApply(session, bundle, "contact", "/admin/cms/pages/contact");
}

export async function updateFooterContentAction(formData: FormData) {
  const session = await requireRole(["super_admin", "content_editor"]);

  const currentSettings = await getSettings();
  const offices = currentSettings.offices.map((o, i) => ({
    ...o,
    fr: {
      city: field(formData, `office_${i}_city_fr`) || o.fr.city,
      label: field(formData, `office_${i}_label_fr`) || o.fr.label,
    },
    en: {
      city: field(formData, `office_${i}_city_en`) || o.en.city,
      label: field(formData, `office_${i}_label_en`) || o.en.label,
    },
    phone: field(formData, `office_${i}_phone`) || o.phone,
    whatsapp: field(formData, `office_${i}_whatsapp`) || o.whatsapp,
  }));

  const bundle: ContentBundle = {
    blocks: {
      "footer.tagline": {
        fr: { tagline: field(formData, "tagline_fr") },
        en: { tagline: field(formData, "tagline_en") },
      },
    },
    // Office contact info lives in the settings singleton, not
    // content_blocks, but is edited from this same form since it's also
    // shown in the footer.
    offices,
    // "layout" (not "page") since the footer is rendered by the shared
    // [locale] layout across every page, not just the homepage.
    revalidate: [
      { path: "/[locale]", type: "layout" },
      { path: "/[locale]/contact", type: "page" },
      { path: "/admin/cms/footer" },
    ],
  };

  await submitOrApply(session, bundle, "footer", "/admin/cms/footer");
}
