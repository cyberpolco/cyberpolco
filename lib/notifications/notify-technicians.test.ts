import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/users", () => ({ getTechnicianEmails: vi.fn() }));
vi.mock("@/lib/email/templates", () => ({ sendTemplatedEmail: vi.fn() }));

const { getTechnicianEmails } = await import("@/lib/db/users");
const { sendTemplatedEmail } = await import("@/lib/email/templates");
const { notifyTechniciansOfHelpRequest } = await import("./notify-technicians");

describe("notifyTechniciansOfHelpRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends one email per technician", async () => {
    vi.mocked(getTechnicianEmails).mockResolvedValue(["tech1@example.com", "tech2@example.com"]);
    vi.mocked(sendTemplatedEmail).mockResolvedValue({ simulated: true });

    await notifyTechniciansOfHelpRequest({ clientName: "Ada", clientId: "CL-001", siteName: "HQ" });

    expect(sendTemplatedEmail).toHaveBeenCalledTimes(2);
    expect(sendTemplatedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "starlink_help_notify_technician",
        to: "tech1@example.com",
        from: "Cyber PolCo <notify@cyberpolco.com>",
      })
    );
    expect(sendTemplatedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "tech2@example.com" })
    );
  });

  it("escapes HTML in the substituted variables", async () => {
    vi.mocked(getTechnicianEmails).mockResolvedValue(["tech1@example.com"]);
    vi.mocked(sendTemplatedEmail).mockResolvedValue({ simulated: true });

    await notifyTechniciansOfHelpRequest({
      clientName: '<script>alert("x")</script>',
      clientId: "CL-001",
      siteName: "HQ",
    });

    expect(sendTemplatedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ vars: expect.objectContaining({ clientName: expect.not.stringContaining("<script>") }) })
    );
  });

  it("continues sending to the rest when one technician's send fails", async () => {
    vi.mocked(getTechnicianEmails).mockResolvedValue(["tech1@example.com", "tech2@example.com"]);
    vi.mocked(sendTemplatedEmail)
      .mockRejectedValueOnce(new Error("Resend is down"))
      .mockResolvedValueOnce({ simulated: true });

    await expect(
      notifyTechniciansOfHelpRequest({ clientName: "Ada", clientId: "CL-001", siteName: "HQ" })
    ).resolves.toBeUndefined();

    expect(sendTemplatedEmail).toHaveBeenCalledTimes(2);
  });

  it("does not throw when there are no technicians", async () => {
    vi.mocked(getTechnicianEmails).mockResolvedValue([]);

    await expect(
      notifyTechniciansOfHelpRequest({ clientName: "Ada", clientId: "CL-001", siteName: "HQ" })
    ).resolves.toBeUndefined();
    expect(sendTemplatedEmail).not.toHaveBeenCalled();
  });
});
