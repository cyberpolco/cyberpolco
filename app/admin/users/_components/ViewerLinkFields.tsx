"use client";

import { useState } from "react";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/auth/roles";
import type { ViewerType } from "@/lib/db/users";
import type { StarlinkClient } from "@/lib/db/starlink";
import type { AcademyEnrollment } from "@/lib/db/academy";
import LinkedRecordSearch from "@/app/admin/_components/LinkedRecordSearch";

export default function ViewerLinkFields({
  defaultRole,
  defaultViewerType,
  defaultLinkedId,
  starlinkClients,
  academyEnrollments,
  onLinkedEmailChange,
}: {
  defaultRole: Role;
  defaultViewerType?: ViewerType | null;
  defaultLinkedId?: string | null;
  starlinkClients: StarlinkClient[];
  academyEnrollments: AcademyEnrollment[];
  onLinkedEmailChange?: (email: string) => void;
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
              <LinkedRecordSearch
                key="starlink_client"
                name="linkedId"
                defaultValue={defaultLinkedId}
                required
                emptyLabel="Select a Starlink client"
                searchPlaceholder="Search clients..."
                items={starlinkClients.map((c) => ({
                  id: c.id,
                  primary: c.clientId,
                  secondary: c.name,
                  email: c.email,
                }))}
                onSelect={(item) => onLinkedEmailChange?.(item.email)}
              />
            ) : (
              <LinkedRecordSearch
                key="academy_student"
                name="linkedId"
                defaultValue={defaultLinkedId}
                required
                emptyLabel="Select a student"
                searchPlaceholder="Search students..."
                items={academyEnrollments.map((e) => ({
                  id: e.id,
                  primary: e.studentId,
                  secondary: e.studentName,
                  email: e.email,
                }))}
                onSelect={(item) => onLinkedEmailChange?.(item.email)}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}
