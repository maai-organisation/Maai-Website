const path = require("path");
const { spawnSync } = require("child_process");
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

function parseFieldConfig(fieldConfig) {
  if (!fieldConfig) return null;
  if (typeof fieldConfig === "object" && !Array.isArray(fieldConfig)) return fieldConfig;
  if (typeof fieldConfig === "string") {
    try {
      const parsed = JSON.parse(fieldConfig);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

function isFieldRenderable(config) {
  return Boolean(
    config &&
      typeof config === "object" &&
      !Array.isArray(config) &&
      config.visible !== false &&
      config.enabled !== false,
  );
}

function fieldTextValue(name, config, fields) {
  let value = config.value || config.text;
  if (value) {
    value = String(value);
    Object.entries(fields).forEach(([key, field]) => {
      value = value.replaceAll(`{{${key}}}`, String(field || ""));
      value = value.replaceAll(`{{ ${key} }}`, String(field || ""));
    });
    return value;
  }
  return String(fields[name] || "");
}

function createConfiguredSimplePdf(card, fieldConfig) {
  const labels = {
    full_name: "Name",
    membership_number: "Membership Number",
    role: "Role",
    status: "Membership Status",
    verification_code: "Verification Code",
    college: "College",
    issue_date: "Issue Date",
  };
  const fields = {
    full_name: card.full_name,
    membership_number: card.membership_number,
    role: card.role,
    status: card.membership_status,
    verification_code: card.verification_code,
    college: card.college || "",
    issue_date: card.issued_at || "",
  };
  const lines = [card.header_text || "Maai Membership Card"];

  Object.entries(fieldConfig || {}).forEach(([name, config]) => {
    if (!isFieldRenderable(config)) return;
    const fieldType = config.type || name;
    if (fieldType === "barcode" || fieldType === "qr" || name === "barcode" || name === "qr") return;
    const label = labels[name] || name.replace(/_/g, " ");
    lines.push(`${label}: ${fieldTextValue(name, config, fields)}`);
  });

  lines.push("", "Back", card.footer_text || "This card remains the property of Maai organisation.");
  return createSimplePdf("Volunteer ID Card", lines);
}

function resolveTemplateImagePath(imageUrl, fallbackFileName) {
  const fallbackPath = path.join(__dirname, "..", "assets", "certificates", fallbackFileName);
  if (!imageUrl) return fallbackPath;
  const value = String(imageUrl).trim();
  if (/^https?:\/\//i.test(value) || /^data:image\//i.test(value)) return value;
  if (path.isAbsolute(value)) return value;
  return path.join(__dirname, "..", value.replace(/^\/+/, ""));
}

function createImageIdCardPdf(card) {
  const rendererPath = path.join(__dirname, "renderIdCard.py");
  const fieldConfig = parseFieldConfig(card.field_config);
  const payload = {
    frontTemplatePath: resolveTemplateImagePath(card.front_background_url, "front.png"),
    backTemplatePath: resolveTemplateImagePath(card.back_background_url, "back.png"),
    fallbackFrontTemplatePath: resolveTemplateImagePath(null, "front.png"),
    fallbackBackTemplatePath: resolveTemplateImagePath(null, "back.png"),
    fieldConfig,
    fields: {
      full_name: card.full_name,
      membership_number: card.membership_number,
      role: card.role,
      status: card.membership_status,
      verification_code: card.verification_code,
      college: card.college || "",
      issue_date: card.issued_at || "",
      header_text: card.header_text || "Maai Membership Card",
      footer_text: card.footer_text || "This card remains the property of Maai organisation.",
    },
  };
  const input = JSON.stringify(payload);
  let result = spawnSync("python", [rendererPath], {
    input,
    encoding: null,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.error?.code === "ENOENT") {
    result = spawnSync("python3", [rendererPath], {
      input,
      encoding: null,
      maxBuffer: 20 * 1024 * 1024,
    });
  }

  if (result.status !== 0 || !result.stdout?.length) {
    const error = result.stderr?.toString("utf8").trim();
    if (error) console.warn(`ID card image renderer unavailable: ${error}`);
    return null;
  }

  return result.stdout;
}

function createIdCardPdf(card) {
  const fieldConfig = parseFieldConfig(card.field_config);
  if (fieldConfig) {
    const imagePdf = createImageIdCardPdf(card);
    if (imagePdf) return imagePdf;
    return createConfiguredSimplePdf(card, fieldConfig);
  }

  return createSimplePdf("Volunteer ID Card", [
    card.header_text || "Maai Membership Card",
    `Name: ${card.full_name}`,
    `Membership Number: ${card.membership_number}`,
    `Role: ${card.role}`,
    `Membership Status: ${card.membership_status}`,
    `Verification Code: ${card.verification_code}`,
    `College: ${card.college || ""}`,
    "",
    "Back",
    "QR placeholder: reserved for future verification.",
    card.footer_text || "This card remains the property of Maai organisation.",
  ]);
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
        AND is_default = 1
      ORDER BY updated_at DESC
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
    } else {
      await pool.query("UPDATE volunteer_ids SET template_id = ? WHERE id = ? AND template_id <> ?", [
        templateId,
        existing[0].id,
        templateId,
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
  const fieldConfig = parseFieldConfig(row.field_config);
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
      fieldConfig,
      isDefault: Boolean(row.is_default),
    },
  };
}

module.exports = {
  createIdCardPdf,
  createSimplePdf,
  ensureVolunteerId,
  mapVolunteerId,
};
