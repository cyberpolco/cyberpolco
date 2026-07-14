"use client";

import { useState } from "react";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/auth/roles";
import type { ViewerType } from "@/lib/db/users";
import type { StarlinkClient } from "@/lib/db/starlink";
import type { AcademyEnrollment } from "@/lib/db/academy";

export default function ViewerLinkFields({
  defaultRole,
  defaultViewerType,
  defaultLinkedId,
  starlinkClients,
  academyEnrollments,
}: {
  defaultRole: Role;
  defaultViewerType?: ViewerType | null;
  defaultLinkedId?: string | null;
  starlinkClients: StarlinkClient[];
  academyEnrollments: AcademyEnrollment[];
}) {
  const [role, setRole] = useState<Role>(defaultRole);
  const [viewerType, setViewerType] = useState<ViewerType>(defaultViewerType ?? "starlink_client");

  return (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Role</label>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 outline-none focus:border-brand-blue dark:bg-white/5 dark:text-white"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {role === "viewer" && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Viewer type</label>
            <select
              name="viewerType"
              value={viewerType}
              onChange={(e) => setViewerType(e.target.value as ViewerType)}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 outline-none focus:border-brand-blue dark:bg-white/5 dark:text-white"
            >
              <option value="starlink_client">Starlink client</option>
              <option value="academy_student">Academy student</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Linked record</label>
            {viewerType === "starlink_client" ? (
              <select
                key="starlink_client"
                name="linkedId"
                defaultValue={defaultLinkedId ?? ""}
                required
                className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 outline-none focus:border-brand-blue dark:bg-white/5 dark:text-white"
              >
                <option value="" disabled>
                  Select a Starlink client
                </option>
                {starlinkClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.clientId} — {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <select
                key="academy_student"
                name="linkedId"
                defaultValue={defaultLinkedId ?? ""}
                required
                className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 outline-none focus:border-brand-blue dark:bg-white/5 dark:text-white"
              >
                <option value="" disabled>
                  Select a student
                </option>
                {academyEnrollments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.studentId} — {e.studentName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </>
      )}
    </>
  );
}
