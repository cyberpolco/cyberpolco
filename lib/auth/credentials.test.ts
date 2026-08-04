import { afterEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("@/lib/db/users", () => ({ getUserByEmail: vi.fn(), getUserByLinkedId: vi.fn() }));
vi.mock("@/lib/db/academy", () => ({ getEnrollmentByStudentId: vi.fn() }));
vi.mock("@/lib/db/starlink", () => ({ getStarlinkClientByClientId: vi.fn() }));

const { getUserByEmail, getUserByLinkedId } = await import("@/lib/db/users");
const { getEnrollmentByStudentId } = await import("@/lib/db/academy");
const { getStarlinkClientByClientId } = await import("@/lib/db/starlink");
const { isValidLoginIdentifier, verifyUserCredentials } = await import("./credentials");

const passwordHash = bcrypt.hashSync("correct-horse-battery-staple", 10);

const adminUser = {
  id: "user-1",
  email: "admin@example.com",
  passwordHash,
  role: "super_admin" as const,
  name: null,
  mustChangePassword: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  createdBy: null,
  lastLoginAt: null,
  viewerType: null,
  linkedId: null,
  phone: null,
  phoneUpdatedAt: null,
};

const studentUser = { ...adminUser, id: "user-2", role: "viewer" as const, viewerType: "academy_student" as const, linkedId: "enrollment-1" };
const clientUser = { ...adminUser, id: "user-3", role: "viewer" as const, viewerType: "starlink_client" as const, linkedId: "client-1" };

describe("isValidLoginIdentifier", () => {
  it("accepts a well-formed email", () => {
    expect(isValidLoginIdentifier("admin@example.com")).toBe(true);
  });

  it("accepts a well-formed Student ID", () => {
    expect(isValidLoginIdentifier("CPC26J18M003")).toBe(true);
  });

  it("accepts a well-formed Client ID", () => {
    expect(isValidLoginIdentifier("STK-0001")).toBe(true);
  });

  it("rejects garbage that matches none of the formats", () => {
    expect(isValidLoginIdentifier("not-an-identifier")).toBe(false);
  });
});

describe("verifyUserCredentials", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for a malformed identifier without touching the DB", async () => {
    const result = await verifyUserCredentials("not-an-identifier", "whatever");

    expect(result).toBeNull();
    expect(getUserByEmail).not.toHaveBeenCalled();
    expect(getEnrollmentByStudentId).not.toHaveBeenCalled();
    expect(getStarlinkClientByClientId).not.toHaveBeenCalled();
  });

  it("looks up by email when the identifier is a well-formed email", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(adminUser);

    const result = await verifyUserCredentials("admin@example.com", "correct-horse-battery-staple");

    expect(result).toEqual(adminUser);
  });

  it("returns null when the email's password doesn't match", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(adminUser);

    const result = await verifyUserCredentials("admin@example.com", "wrong-password");

    expect(result).toBeNull();
  });

  it("resolves a Student ID through the enrollment's linked user", async () => {
    vi.mocked(getEnrollmentByStudentId).mockResolvedValue({ id: "enrollment-1" } as never);
    vi.mocked(getUserByLinkedId).mockResolvedValue(studentUser);

    const result = await verifyUserCredentials("CPC26J18M003", "correct-horse-battery-staple");

    expect(getEnrollmentByStudentId).toHaveBeenCalledWith("CPC26J18M003");
    expect(getUserByLinkedId).toHaveBeenCalledWith("academy_student", "enrollment-1");
    expect(result).toEqual(studentUser);
  });

  it("returns null for a well-formed Student ID with no matching enrollment", async () => {
    vi.mocked(getEnrollmentByStudentId).mockResolvedValue(undefined);

    const result = await verifyUserCredentials("CPC26J18M003", "whatever");

    expect(result).toBeNull();
    expect(getUserByLinkedId).not.toHaveBeenCalled();
  });

  it("resolves a Client ID through the client's linked user", async () => {
    vi.mocked(getStarlinkClientByClientId).mockResolvedValue({ id: "client-1" } as never);
    vi.mocked(getUserByLinkedId).mockResolvedValue(clientUser);

    const result = await verifyUserCredentials("STK-0001", "correct-horse-battery-staple");

    expect(getStarlinkClientByClientId).toHaveBeenCalledWith("STK-0001");
    expect(getUserByLinkedId).toHaveBeenCalledWith("starlink_client", "client-1");
    expect(result).toEqual(clientUser);
  });

  it("returns null for a well-formed Client ID with no matching client", async () => {
    vi.mocked(getStarlinkClientByClientId).mockResolvedValue(undefined);

    const result = await verifyUserCredentials("STK-0001", "whatever");

    expect(result).toBeNull();
    expect(getUserByLinkedId).not.toHaveBeenCalled();
  });
});
