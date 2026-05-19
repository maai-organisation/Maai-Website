const { pool } = require("../config/db");
const { createTemplatePdf, loadCertificateTemplate } = require("../utils/certificateTemplates");

function escapePdfText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function createSimplePdf(heading, lines) {
  const content = [
    "BT",
    "/F1 26 Tf",
    "72 740 Td",
    `(${escapePdfText("Maai organisation")}) Tj`,
    "/F1 18 Tf",
    "0 -52 Td",
    `(${escapePdfText(heading)}) Tj`,
    "/F1 13 Tf",
    ...lines.flatMap((line) => ["0 -28 Td", `(${escapePdfText(line)}) Tj`]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf);
}

function mapCertificate(row) {
  const title = row.title || (row.certificate_type === "membership" ? "Membership Certificate" : "Certificate");

  return {
    id: row.id,
    title,
    eventName: title,
    eventTitle: title,
    type: row.certificate_type,
    certificateType: row.certificate_type,
    status: row.status,
    issued_at: row.issued_at,
    issuedAt: row.issued_at,
    verification_code: row.verification_code,
    verificationCode: row.verification_code,
    eventId: row.event_id,
    volunteerId: row.volunteer_id,
    eventDate: row.event_date,
  };
}

async function logCertificateAudit(user, action, certificateId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'event_certificate', ?, ?)
    `,
    [user.id, `certificates.${action}`, certificateId, JSON.stringify(metadata)],
  );
}

async function loadCertificateForUser(id, user) {
  const values = [id];
  const volunteerFilter = user.role === "superadmin" || user.role === "it_staff" ? "" : "AND ec.volunteer_id = ?";
  if (volunteerFilter) values.push(user.id);

  const [rows] = await pool.query(
    `
      SELECT ec.*, e.title, e.event_date, e.event_type, e.location, e.certificate_template_id, v.full_name, v.role, v.membership_status, vi.membership_number
      FROM event_certificates ec
      LEFT JOIN events e ON e.id = ec.event_id
      INNER JOIN volunteers v ON v.id = ec.volunteer_id
      LEFT JOIN volunteer_ids vi ON vi.volunteer_id = v.id
      WHERE ec.id = ?
      ${volunteerFilter}
      LIMIT 1
    `,
    values,
  );

  return rows[0];
}

async function listCertificates(req, res) {
  const admin = req.user.role === "superadmin" || req.user.role === "it_staff";
  const values = [];
  const volunteerFilter = admin ? "" : "WHERE ec.volunteer_id = ? AND ec.status <> 'revoked'";
  if (!admin) values.push(req.user.id);

  const [rows] = await pool.query(
    `
      SELECT ec.*, e.title, e.event_date, e.event_type, e.location
      FROM event_certificates ec
      LEFT JOIN events e ON e.id = ec.event_id
      ${volunteerFilter}
      ORDER BY ec.created_at DESC
    `,
    values,
  );

  return res.status(200).json(rows.map(mapCertificate));
}

async function claimCertificate(req, res) {
  const certificate = await loadCertificateForUser(req.params.id, req.user);
  if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found." });
  if (certificate.status === "revoked") {
    return res.status(403).json({ success: false, message: "This certificate has been revoked." });
  }

  await pool.query("UPDATE event_certificates SET status = 'claimed', claimed_at = COALESCE(claimed_at, NOW()) WHERE id = ?", [
    req.params.id,
  ]);
  await logCertificateAudit(req.user, "claim", req.params.id, { eventId: certificate.event_id });

  return res.json({ success: true, message: "Certificate claimed successfully." });
}

async function sendCertificatePdf(req, res, disposition = "inline") {
  const certificate = await loadCertificateForUser(req.params.id, req.user);
  if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found." });
  if (certificate.status !== "claimed") {
    return res.status(403).json({ success: false, message: "Claim this certificate before downloading." });
  }

  const template = await loadCertificateTemplate(certificate);
  const variables = {
    full_name: certificate.full_name,
    event_name: certificate.title || "Maai organisation",
    date: certificate.event_date || certificate.issued_at || "Not specified",
    certificate_id: certificate.verification_code,
    membership_number: certificate.membership_number || "",
    role: certificate.role || "volunteer",
  };
  const pdf = template
    ? createTemplatePdf(template, variables)
    : createSimplePdf("Certificate", [`This certifies that ${certificate.full_name}.`, `Certificate ID: ${certificate.verification_code}`]);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="maai-certificate-${certificate.id}.pdf"`);
  return res.send(pdf);
}

async function previewCertificate(req, res) {
  return sendCertificatePdf(req, res, "inline");
}

async function downloadCertificate(req, res) {
  return sendCertificatePdf(req, res, "attachment");
}

module.exports = {
  listCertificates,
  claimCertificate,
  downloadCertificate,
  previewCertificate,
};
