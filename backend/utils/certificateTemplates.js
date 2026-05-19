const { pool } = require("../config/db");

function escapePdfText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function fillTemplate(value, variables = {}) {
  return String(value || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => variables[key] || "");
}

function createTemplatePdf(template, variables) {
  const body = fillTemplate(template.body_template, variables)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const lines = [
    template.header_text || template.name || "Certificate",
    ...body,
    template.footer_text || "",
    template.signature_name ? `Signed: ${template.signature_name}` : "",
    template.signature_designation || "",
    template.background_url ? `Background: ${template.background_url}` : "",
    template.logo_url ? `Logo: ${template.logo_url}` : "",
  ].filter(Boolean);

  const content = [
    "BT",
    "/F1 26 Tf",
    "72 740 Td",
    `(${escapePdfText("Maai organisation")}) Tj`,
    "/F1 20 Tf",
    "0 -48 Td",
    `(${escapePdfText(fillTemplate(template.name, variables))}) Tj`,
    "/F1 13 Tf",
    ...lines.flatMap((line) => ["0 -26 Td", `(${escapePdfText(fillTemplate(line, variables))}) Tj`]),
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

async function loadCertificateTemplate(certificate) {
  const templateId = certificate.certificate_template_id;
  if (templateId) {
    const [rows] = await pool.query("SELECT * FROM certificate_templates WHERE id = ? AND status = 'published' LIMIT 1", [
      templateId,
    ]);
    if (rows[0]) return rows[0];
  }

  const type = certificate.certificate_type === "event" ? "event" : certificate.certificate_type || "other";
  const [rows] = await pool.query(
    `
      SELECT *
      FROM certificate_templates
      WHERE status = 'published'
        AND certificate_type = ?
      ORDER BY is_default DESC, created_at DESC
      LIMIT 1
    `,
    [type],
  );
  if (rows[0]) return rows[0];

  const [fallback] = await pool.query(
    "SELECT * FROM certificate_templates WHERE status = 'published' ORDER BY is_default DESC, created_at DESC LIMIT 1",
  );
  return fallback[0];
}

module.exports = {
  createTemplatePdf,
  fillTemplate,
  loadCertificateTemplate,
};
