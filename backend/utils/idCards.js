const { pool } = require("../config/db");

function escapePdfText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function createSimplePdf(heading, lines) {
  const content = [
    "BT",
    "/F1 24 Tf",
    "72 740 Td",
    `(${escapePdfText("Maai organisation")}) Tj`,
    "/F1 18 Tf",
    "0 -44 Td",
    `(${escapePdfText(heading)}) Tj`,
    "/F1 12 Tf",
    ...lines.flatMap((line) => ["0 -24 Td", `(${escapePdfText(line)}) Tj`]),
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

function newVerificationCode() {
  return `MAAI-ID-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function membershipNumber(volunteerId) {
  return `MAAI-VOL-${String(volunteerId).padStart(4, "0")}`;
}

async function defaultTemplateId() {
  const [rows] = await pool.query(
    `
      SELECT id
      FROM id_card_templates
      WHERE status = 'published'
      ORDER BY is_default DESC, created_at DESC
      LIMIT 1
    `,
  );
  return rows[0]?.id || null;
}

async function ensureVolunteerId(volunteerId, actorId = null) {
  const [existing] = await pool.query("SELECT id, status FROM volunteer_ids WHERE volunteer_id = ? LIMIT 1", [volunteerId]);
  const templateId = await defaultTemplateId();
  if (!templateId) return null;

  if (existing.length > 0) {
    if (existing[0].status === "revoked") {
      await pool.query("UPDATE volunteer_ids SET status = 'active', template_id = ?, issued_at = NOW() WHERE id = ?", [
        templateId,
        existing[0].id,
      ]);
    }
    return existing[0].id;
  }

  const [result] = await pool.query(
    `
      INSERT INTO volunteer_ids
        (volunteer_id, template_id, membership_number, verification_code, issued_at, status)
      VALUES (?, ?, ?, ?, NOW(), 'active')
    `,
    [volunteerId, templateId, membershipNumber(volunteerId), newVerificationCode()],
  );

  await pool.query(
    "INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata_json) VALUES (?, 'id_cards.issue', 'volunteer_id', ?, ?)",
    [actorId, result.insertId, JSON.stringify({ volunteerId, templateId })],
  );
  return result.insertId;
}

function mapVolunteerId(row) {
  return {
    id: row.id,
    volunteerId: row.volunteer_id,
    templateId: row.template_id,
    membershipNumber: row.membership_number,
    verificationCode: row.verification_code,
    issuedAt: row.issued_at,
    status: row.status,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    membershipStatus: row.membership_status,
    template: {
      id: row.template_id,
      name: row.template_name,
      templateType: row.template_type,
      frontBackgroundUrl: row.front_background_url,
      backBackgroundUrl: row.back_background_url,
      logoUrl: row.logo_url,
      headerText: row.header_text,
      footerText: row.footer_text,
      isDefault: Boolean(row.is_default),
    },
  };
}

module.exports = {
  createSimplePdf,
  ensureVolunteerId,
  mapVolunteerId,
};
