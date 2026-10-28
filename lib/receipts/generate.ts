import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { put } from "@vercel/blob";
import { getStarlinkClientBySiteId } from "@/lib/db/starlink";
import { getAcademyEnrollmentById, getAcademyCourseById } from "@/lib/db/academy";
import { LEARNING_MODE_LABELS } from "@/lib/academy/pricing";
import { STARLINK_OPTION_LABELS } from "@/lib/content/starlink-options";
import { createReceipt, getReceiptByPawapayTransactionId, nextReceiptNumber } from "@/lib/db/receipts";
import { sendEmail } from "@/lib/email";
import { renderTemplate } from "@/lib/email/templates";
import { escapeHtml } from "@/lib/email/escape-html";
import { RECEIPT_LOGO_PNG_BASE64 } from "./logo";
import type { DepositTransaction } from "@/lib/pawapay/reconcile";

type Payer = { name: string; email: string; phone: string };
type ReceiptContext = { payer: Payer; productLabel: string };

async function resolveStarlinkContext(siteId: string): Promise<ReceiptContext | undefined> {
  const client = await getStarlinkClientBySiteId(siteId);
  const site = client?.sites.find((s) => s.id === siteId);
  if (!client || !site) return undefined;
  const plan = STARLINK_OPTION_LABELS.subscriptionType[site.subscriptionType] ?? "Starlink";
  return {
    payer: { name: client.name, email: client.email, phone: client.phone },
    productLabel: `Starlink subscription (${plan}) — ${site.siteName}`,
  };
}

async function resolveAcademyContext(enrollmentId: string): Promise<ReceiptContext | undefined> {
  const enrollment = await getAcademyEnrollmentById(enrollmentId);
  if (!enrollment) return undefined;
  const course = await getAcademyCourseById(enrollment.courseId);
  const title = course?.en.title ?? "Academy enrollment";
  return {
    payer: { name: enrollment.studentName, email: enrollment.email, phone: enrollment.phone },
    productLabel: enrollment.learningMode ? `${title} — ${LEARNING_MODE_LABELS[enrollment.learningMode]}` : title,
  };
}

const COMPANY = {
  name: "Cyber PolCo",
  addressLines: [
    "17 Av/Belgique, C/Diulu",
    "Mbujimayi, K-OR",
    "Congo - Kinshasa",
    "Tax ID: A2527465G",
    "ID NAT 09-F4300-N69044N: RCCM",
    "CD/MJM/RCCM/25-A-00430",
  ],
  emails: "info@cyberpolco.com / support@cyberpolco.com / sales@cyberpolco.com",
  phone: "+243 82 811 77 10",
  website: "www.cyberpolco.com",
};

const NOTE =
  "Thank you for choosing Cyber PolCo. We sincerely appreciate your trust and confidence in our services/products. " +
  "Your support is invaluable to us, and it is always a pleasure to serve clients like you.";

const INK = rgb(0.1, 0.1, 0.12);
const MUTED = rgb(0.45, 0.45, 0.48);
const RULE = rgb(0.88, 0.88, 0.9);
const NAVY = rgb(0.21, 0.23, 0.31);
const GREEN = rgb(0.13, 0.55, 0.3);

function formatMoney(amount: string, currency: string): string {
  return `${currency} ${Number(amount).toFixed(2)}`;
}

function formatReceiptDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lubumbashi",
  }).format(date);
}

// One-page A4 receipt modelled on the company's Invoicely invoice layout,
// adapted for a payment that has already gone through: balance is always
// zero and the PawaPay transaction ID stands in for payment instructions.
// Kept free of DB/network calls so it can be tested and previewed in
// isolation, unlike the resolve/generate functions around it.
export async function buildReceiptPdf(input: {
  receiptNumber: string;
  transaction: DepositTransaction;
  payer: Payer;
  productLabel: string;
  paidAt: Date;
}): Promise<Uint8Array> {
  const { receiptNumber, transaction, payer, productLabel, paidAt } = input;
  const doc = await PDFDocument.create();
  doc.setTitle(`Receipt ${receiptNumber}`);
  doc.setAuthor(COMPANY.name);
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await doc.embedPng(Buffer.from(RECEIPT_LOGO_PNG_BASE64, "base64"));

  const left = 40;
  const right = 555;
  const amount = formatMoney(transaction.amount, transaction.currency);

  // Standard fonts only cover WinAnsi; swap anything else (e.g. a name typed
  // in a non-Latin script) for "?" rather than letting drawText throw.
  const safe = (f: PDFFont, s: string) =>
    Array.from(s)
      .map((ch) => {
        try {
          f.encodeText(ch);
          return ch;
        } catch {
          return "?";
        }
      })
      .join("");

  const text = (
    s: string,
    x: number,
    y: number,
    opts: { size?: number; f?: PDFFont; color?: RGB; align?: "left" | "right" | "center"; width?: number } = {}
  ) => {
    const f = opts.f ?? font;
    const size = opts.size ?? 8.5;
    const str = safe(f, s);
    const w = f.widthOfTextAtSize(str, size);
    const dx = opts.align === "right" ? -w : opts.align === "center" ? ((opts.width ?? 0) - w) / 2 : 0;
    page.drawText(str, { x: x + dx, y, size, font: f, color: opts.color ?? INK });
  };

  const rule = (p: PDFPage, y: number, x1 = left, x2 = right, thickness = 0.75) =>
    p.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color: RULE });

  const wrap = (s: string, f: PDFFont, size: number, maxWidth: number): string[] => {
    const lines: string[] = [];
    let line = "";
    for (const word of safe(f, s).split(" ")) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && f.widthOfTextAtSize(candidate, size) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  // Title + PAID badge + logo
  text("Receipt", left, 770, { size: 24, f: bold });
  const badgeX = left + bold.widthOfTextAtSize("Receipt", 24) + 12;
  page.drawRectangle({ x: badgeX, y: 771, width: 44, height: 18, color: GREEN });
  text("PAID", badgeX, 776, { size: 9, f: bold, color: rgb(1, 1, 1), align: "center", width: 44 });
  page.drawImage(logo, { x: right - 78, y: 718, width: 78, height: 78 });

  // From block (left) and receipt details (middle column)
  let y = 680;
  text("From", left, y, { f: bold });
  y -= 18;
  for (const line of [COMPANY.name, ...COMPANY.addressLines]) {
    text(line, left, y);
    y -= 11;
  }

  const midX = 230;
  let my = 680;
  for (const [label, value] of [
    ["Receipt No.", receiptNumber],
    ["Date", formatReceiptDate(paidAt)],
    ["Transaction ID", transaction.pawapayId],
  ]) {
    text(label, midX, my, { f: bold });
    text(value, midX, my - 11);
    my -= 30;
  }

  // To block
  y -= 14;
  text("To", left, y, { f: bold });
  y -= 18;
  for (const line of [payer.name, payer.email, payer.phone].filter(Boolean)) {
    text(line, left, y);
    y -= 11;
  }

  // Line items
  const qtyX = 360;
  const rateX = 455;
  y -= 28;
  text("Description", left, y, { f: bold });
  text("Quantity", qtyX, y, { f: bold, align: "right" });
  text("Rate", rateX, y, { f: bold, align: "right" });
  text("Amount", right, y, { f: bold, align: "right" });
  y -= 7;
  rule(page, y, left, right, 1.5);

  y -= 18;
  const descLines = wrap(productLabel, font, 8.5, qtyX - left - 50);
  descLines.forEach((line, i) => text(line, left, y - i * 11));
  text("1", qtyX, y, { align: "right" });
  text(Number(transaction.amount).toFixed(2), rateX, y, { align: "right" });
  text(amount, right, y, { align: "right" });
  y -= 11 * (descLines.length - 1) + 15;
  rule(page, y);

  // Totals
  const totalsX = 300;
  const totalRow = (label: string, value: string, isBold = false) => {
    y -= 18;
    text(label, totalsX, y, { f: isBold ? bold : font });
    text(value, right, y, { f: isBold ? bold : font, align: "right" });
    y -= 10;
    rule(page, y, totalsX - 4);
  };
  totalRow("Sub Total", Number(transaction.amount).toFixed(2));
  totalRow("Total", amount, true);
  totalRow("Paid to Date", amount, true);

  // Balance box
  y -= 8;
  const boxW = right - (totalsX - 4);
  page.drawRectangle({ x: totalsX - 4, y: y - 54, width: boxW, height: 54, borderColor: NAVY, borderWidth: 1.25 });
  page.drawRectangle({ x: totalsX - 4, y: y - 27, width: boxW, height: 27, color: NAVY });
  text("Balance", totalsX - 4, y - 17, { color: rgb(1, 1, 1), align: "center", width: boxW });
  text(formatMoney("0", transaction.currency), right - 9, y - 44, { f: bold, align: "right" });
  y -= 80;

  // Note
  text("Note", left, y, { f: bold });
  y -= 18;
  for (const line of wrap(NOTE, font, 8.5, right - left)) {
    text(line, left, y);
    y -= 11;
  }

  // Footer
  rule(page, 110, left, right, 1.25);
  text(COMPANY.name, left, 92);
  text("Email: ", left, 81, { f: bold });
  text(COMPANY.emails, left + bold.widthOfTextAtSize("Email: ", 8.5), 81);
  text(COMPANY.phone, left, 70);
  text(COMPANY.website, left, 59, { color: MUTED });

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

  const receiptNumber = await nextReceiptNumber(transaction.referenceType);
  const pdfBytes = await buildReceiptPdf({ receiptNumber, transaction, ...context, paidAt: new Date() });
  const fileName = `${receiptNumber}.pdf`;
  // Server-side put(), not the client-upload route (app/api/blob-upload) —
  // this runs on the server with no user-uploaded bytes to authorize/relay.
  const blob = await put(`receipts/${transaction.id}.pdf`, Buffer.from(pdfBytes), {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
  });

  await createReceipt({
    receiptNumber,
    referenceType: transaction.referenceType,
    referenceId: transaction.referenceId,
    pawapayTransactionId: transaction.id,
    source: "auto_generated",
    fileUrl: blob.url,
    fileName,
    amount: transaction.amount,
    currency: transaction.currency,
    createdBy: null,
  });

  // The receipt is already saved and visible in the dashboards, so a failed
  // email is logged rather than surfaced — same "nice-to-have" stance as the
  // receipt itself in applyDepositOutcome.
  try {
    const { subject, html } = await renderTemplate("payment_receipt", "en", {
      payerName: escapeHtml(context.payer.name),
      receiptNumber,
      productLabel: escapeHtml(context.productLabel),
      amount: formatMoney(transaction.amount, transaction.currency),
    });
    await sendEmail({
      to: context.payer.email,
      subject,
      html,
      attachments: [{ filename: fileName, content: Buffer.from(pdfBytes).toString("base64") }],
    });
  } catch (err) {
    console.error(`Failed to email receipt ${receiptNumber}:`, err);
  }
}
