/**
 * Branded HTML email signature appended to every outgoing email by
 * sendEmail. Markup mirrors the hand-pasted webmail signatures (style
 * "C. Split") so app-sent and manually-sent mail look the same; images are
 * served from public/email-signature/ (proxy.ts already skips .png paths).
 *
 * Values are pre-encoded HTML (entities included), not raw text.
 */

const ASSET_BASE = "https://www.cyberpolco.com/email-signature";
const FONT = "'Poppins', Arial, Helvetica, sans-serif";

type SignatureIdentity = {
  name: string;
  titleFr: string;
  titleEn?: string;
  showCompanyLine?: boolean;
};

const GENERAL: SignatureIdentity = {
  name: "Cyber PolCo",
  titleFr: "Informations g&eacute;n&eacute;rales",
  titleEn: "General Enquiries",
};

const IDENTITIES: Record<string, SignatureIdentity> = {
  "lam@cyberpolco.com": {
    name: "L&eacute;on Atunakou",
    titleFr: "Cofondateur &amp; Directeur technique",
    titleEn: "Co-founder &amp; CTO",
    showCompanyLine: true,
  },
  "info@cyberpolco.com": GENERAL,
  "notify@cyberpolco.com": GENERAL,
  "noreply@cyberpolco.com": GENERAL,
  "hr@cyberpolco.com": { name: "Cyber PolCo", titleFr: "Ressources humaines", titleEn: "Human Resources" },
  "admin@cyberpolco.com": { name: "Cyber PolCo", titleFr: "Administration" },
  "support@cyberpolco.com": { name: "Cyber PolCo", titleFr: "Support client", titleEn: "Client Support" },
};

const FALLBACK_ADDRESS = "info@cyberpolco.com";

// Accepts either a bare address or a "Name <address>" header value.
export function extractAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).trim().toLowerCase();
}

function icon(file: string, alt: string, size: number, extraStyle = ""): string {
  return `<img src="${ASSET_BASE}/${file}" width="${size}" height="${size}" alt="${alt}" style="display:block;border:0;outline:none;text-decoration:none;width:${size}px;height:${size}px;${extraStyle}">`;
}

function contactRow(file: string, alt: string, content: string): string {
  return `<tr><td width="22" valign="top" style="padding:3px 8px 3px 0;width:22px;">${icon(file, alt, 14, "margin-top:2px;")}</td><td valign="top" style="padding:3px 0;font-family:${FONT};font-size:12.5px;line-height:18px;color:#424242;">${content}</td></tr>`;
}

function link(href: string, text: string, weight = "normal"): string {
  return `<a href="${href}" style="color:#424242;text-decoration:none;font-weight:${weight};">${text}</a>`;
}

function socialCell(href: string, file: string, alt: string): string {
  return `<td style="padding:0 7px 0 0;"><a href="${href}" style="text-decoration:none;">${icon(file, alt, 26)}</a></td>`;
}

export function renderSignature(from: string): string {
  const known = extractAddress(from);
  const address = IDENTITIES[known] ? known : FALLBACK_ADDRESS;
  const id = IDENTITIES[address];

  const titleEn = id.titleEn
    ? `<span style="font-size:12.5px;line-height:18px;color:#6b6f80;"> &nbsp;/&nbsp; ${id.titleEn}</span>`
    : "";
  const companyLine = id.showCompanyLine
    ? `<br><span style="font-size:11px;line-height:17px;letter-spacing:1.6px;color:#6b6f80;text-transform:uppercase;">Cyber PolCo</span>`
    : "";
  const spacer = `<div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div>`;
  const bar = (height: number, color: string) =>
    `<tr><td width="3" height="${height}" bgcolor="${color}" style="width:3px;height:${height}px;background:${color};font-size:0;line-height:0;">&nbsp;</td></tr>`;

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="border-collapse:collapse;width:560px;max-width:100%;font-family:${FONT};">
<tr>
<td width="104" valign="top" style="padding:2px 18px 0 0;width:104px;">${icon("logo.png", "Cyber PolCo", 92)}</td>
<td width="3" style="width:3px;padding:0;" valign="top"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${bar(84, "#626fda")}${bar(50, "#e3484f")}${bar(36, "#e69c3f")}</table></td>
<td valign="top" style="padding:0 0 0 18px;">
<div style="font-family:${FONT};"><span style="font-family:'Telegraf', ${FONT};font-size:18px;line-height:24px;font-weight:bold;color:#2f3555;letter-spacing:0.2px;">${id.name}</span><br><span style="font-size:12.5px;line-height:18px;color:#626fda;font-weight:bold;">${id.titleFr}</span>${titleEn}${companyLine}</div>
${spacer}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${contactRow("whatsapp.png", "WhatsApp", `${link("https://wa.me/243828117710", "+243 82 811 77 10")} &nbsp;&middot;&nbsp; ${link("https://wa.me/264812314352", "+264 81 23 14 352")}`)}${contactRow("mail.png", "Email", link(`mailto:${address}`, address))}${contactRow("globe.png", "Web", link("https://www.cyberpolco.com", "cyberpolco.com", "bold"))}${contactRow("pin.png", "Offices", `<span style="color:#424242;">Mbujimayi, RDC / DRC &nbsp;&middot;&nbsp; Windhoek, Namibie / Namibia</span>`)}</table>
${spacer}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>${socialCell("https://www.linkedin.com/company/cyberpolco", "linkedin.png", "LinkedIn")}${socialCell("https://www.x.com/cyber_polco", "x.png", "X")}${socialCell("https://www.youtube.com/cyberpolco", "youtube.png", "YouTube")}${socialCell("https://www.tiktok.com/@cyberpolco", "tiktok.png", "TikTok")}${socialCell("https://www.github.com/cyberpolco", "github.png", "GitHub")}</tr></table>
</td></tr>
<tr><td colspan="3" style="padding:16px 0 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr><td bgcolor="#2f3555" style="background:#2f3555;padding:11px 16px;border-radius:8px 0 0 8px;"><span style="font-family:${FONT};font-size:11.5px;line-height:16px;letter-spacing:2.2px;white-space:nowrap;text-transform:uppercase;font-weight:bold;color:#ffffff;">Limit the risk now</span></td><td bgcolor="#2f3555" align="right" style="background:#2f3555;padding:11px 16px;border-radius:0 8px 8px 0;white-space:nowrap;"><a href="https://www.cyberpolco.com" style="font-family:${FONT};font-size:12px;font-weight:bold;color:#e69c3f;text-decoration:none;">cyberpolco.com &rarr;</a></td></tr></table></td></tr>
<tr><td colspan="3" style="padding:14px 0 0 0;font-family:${FONT};font-size:9.5px;line-height:13px;color:#8a8fa3;max-width:560px;"><b>CONFIDENTIEL</b> &ndash; Ce message et ses pi&egrave;ces jointes sont destin&eacute;s exclusivement &agrave; leurs destinataires. Si vous l&rsquo;avez re&ccedil;u par erreur, merci d&rsquo;en informer l&rsquo;exp&eacute;diteur et de le supprimer. Toute utilisation ou diffusion non autoris&eacute;e est interdite.<br><b>CONFIDENTIAL</b> &ndash; This message and any attachments are intended solely for the named recipients. If you received it in error, please notify the sender and delete it. Any unauthorised use or disclosure is prohibited.</td></tr>
</table>`;
}

export function appendSignature(html: string, from: string): string {
  return `${html}<div style="margin-top:32px;">${renderSignature(from)}</div>`;
}
