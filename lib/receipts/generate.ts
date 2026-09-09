import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { put } from "@vercel/blob";
import { getStarlinkClientBySiteId } from "@/lib/db/starlink";
import { getAcademyEnrollmentById, getAcademyCourseById } from "@/lib/db/academy";
import { createReceipt, getReceiptByPawapayTransactionId } from "@/lib/db/receipts";
import { formatDateTime } from "@/lib/utils/date-format";
import type { DepositTransaction } from "@/lib/pawapay/reconcile";

type ReceiptContext = { payerName: string; productLabel: string };

async function resolveStarlinkContext(siteId: string): Promise<ReceiptContext | undefined> {
  const client = await getStarlinkClientBySiteId(siteId);
  const site = client?.sites.find((s) => s.id === siteId);
  if (!client || !site) return undefined;
  return { payerName: client.name, productLabel: site.siteName };
}

async function resolveAcademyContext(enrollmentId: string): Promise<ReceiptContext | undefined> {
  const enrollment = await getAcademyEnrollmentById(enrollmentId);
  if (!enrollment) return undefined;
  const course = await getAcademyCourseById(enrollment.courseId);
  return { payerName: enrollment.studentName, productLabel: course?.en.title ?? "Academy enrollment" };
}

// Plain one-page text summary — no branding/logo, matching the "summary
// receipt" ask. Kept as its own function (no DB/network calls) so it's
// testable in isolation, unlike the DB-touching resolve/generate functions
// above/below (this repo's convention — see payments.test.ts only testing
// computePaymentsStats, not the DB functions around it).
export async function buildReceiptPdf(input: {
  transaction: DepositTransaction;
  payerName: string;
  productLabel: string;
}): Promise<Uint8Array> {
  const { transaction, payerName, productLabel } = input;
  const doc = await PDFDocument.create();
  const page = doc.addPage([420, 560]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 500;
  const black = rgb(0, 0, 0);
  const gray = rgb(0.35, 0.35, 0.35);

  const drawLine = (text: string, opts: { size?: number; bold?: boolean; gap?: number } = {}) => {
    page.drawText(text, {
      x: 40,
      y,
      size: opts.size ?? 12,
      font: opts.bold ? bold : font,
      color: opts.bold ? black : gray,
    });
    y -= opts.gap ?? 22;
  };

  drawLine("Cyber PolCo", { size: 18, bold: true, gap: 26 });
  drawLine("Payment Receipt", { size: 14, bold: true, gap: 34 });
  drawLine(`Receipt for: ${payerName}`);
  drawLine(`Product: ${productLabel}`);
  drawLine(`Amount: $${transaction.amount} ${transaction.currency}`);
  drawLine(`Date: ${formatDateTime(new Date())}`);
  drawLine(`Transaction ID: ${transaction.pawapayId}`);
  drawLine("Status: COMPLETED");

  return doc.save();
}

// Called from applyDepositOutcome (lib/pawapay/reconcile.ts) the moment a
// deposit reaches COMPLETED, regardless of which path noticed first
// (webhook, status-poll fallback, or a manual super_admin reconcile) — all
// three are idempotent here via the pawapayTransactionId check below.
export async function generateReceiptForDeposit(transaction: DepositTransaction): Promise<void> {
  if (!transaction.referenceType || !transaction.referenceId) return;
  if (await getReceiptByPawapayTransactionId(transaction.id)) return;

  const context =
    transaction.referenceType === "starlink_subscription"
      ? await resolveStarlinkContext(transaction.referenceId)
      : await resolveAcademyContext(transaction.referenceId);
  if (!context) return;

  const pdfBytes = await buildReceiptPdf({ transaction, ...context });
  // Server-side put(), not the client-upload route (app/api/blob-upload) —
  // this runs on the server with no user-uploaded bytes to authorize/relay.
  const blob = await put(`receipts/${transaction.id}.pdf`, Buffer.from(pdfBytes), {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
  });

  await createReceipt({
    referenceType: transaction.referenceType,
    referenceId: transaction.referenceId,
    pawapayTransactionId: transaction.id,
    source: "auto_generated",
    fileUrl: blob.url,
    fileName: `Receipt-${transaction.id.slice(0, 8)}.pdf`,
    amount: transaction.amount,
    currency: transaction.currency,
    createdBy: null,
  });
}
