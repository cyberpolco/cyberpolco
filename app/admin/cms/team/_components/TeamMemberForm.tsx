"use client";

import { useState } from "react";
import Image from "next/image";
import { upsertTeamMemberAction } from "@/lib/actions/team";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import BlobFileField from "@/app/admin/_components/BlobFileField";
import type { TeamMember } from "@/lib/db/team";

export default function TeamMemberForm({ member }: { member?: TeamMember }) {
  const [photo, setPhoto] = useState(member?.photo || "");

  return (
    <form action={upsertTeamMemberAction} className="space-y-8">
      <input type="hidden" name="originalId" value={member?.id || ""} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Photo</label>
          <div className="mb-3 flex items-center gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-black/5 dark:border-white/10">
              <Image src={photo || "/images/logo-mark.png"} alt="" fill sizes="64px" className="object-cover object-top" />
            </div>
          </div>
          <BlobFileField
            kind="team-photo"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            value={photo}
            onChange={setPhoto}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 text-sm dark:bg-white/5 dark:text-white"
          />
          <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
            {member ? "Leave blank to keep the current photo." : "Leave blank to use the logo placeholder."}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Full name</label>
          <input
            name="name"
            defaultValue={member?.name}
            required
            className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
          />
          {member && (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
                Display order
              </label>
              <input
                type="number"
                name="displayOrder"
                defaultValue={member.displayOrder}
                className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
              />
              <p className="mt-1 text-xs text-brand-gray dark:text-white/60">Lower numbers appear first.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">Français</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Poste</label>
            <input
              name="title_fr"
              defaultValue={member?.fr.title}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
              Description courte
            </label>
            <textarea
              name="bio_fr"
              defaultValue={member?.fr.bio}
              rows={4}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">English</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Title</label>
            <input
              name="title_en"
              defaultValue={member?.en.title}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
              Brief description
            </label>
            <textarea
              name="bio_en"
              defaultValue={member?.en.bio}
              rows={4}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
        </fieldset>
      </div>

      <SubmitButton>Save team member</SubmitButton>
    </form>
  );
}
