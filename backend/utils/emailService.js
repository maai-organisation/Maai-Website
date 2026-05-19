const nodemailer = require("nodemailer");
const { pool } = require("../config/db");

const allowedVariables = new Set([
  "full_name",
  "event_name",
  "certificate_name",
  "membership_status",
  "camp_name",
  "ngo_name",
  "verification_code",
]);

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.MAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM || process.env.MAIL_FROM || user;
  const fromName = process.env.SMTP_FROM_NAME || "Maai organisation";
  const secureValue = process.env.SMTP_SECURE || process.env.MAIL_SECURE;
  const secure = secureValue ? ["true", "1", "yes"].includes(String(secureValue).toLowerCase()) : port === 465;

  return {
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    from: fromEmail ? `"${fromName}" <${fromEmail}>` : "",
  };
}

function renderTemplate(template = "", variables = {}) {
  return String(template).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    if (!allowedVariables.has(key)) return match;
    return variables[key] === undefined || variables[key] === null ? "" : String(variables[key]);
  });
}

async function writeEmailLog({
  emailType,
  recipientEmail,
  subject = "",
  status,
  errorMessage = null,
}) {
  await pool.query(
    `
      INSERT INTO email_logs
        (recipient_email, email_type, subject, status, sent_at, error_message)
      VALUES (?, ?, ?, ?, IF(? = 'sent', NOW(), NULL), ?)
    `,
    [recipientEmail, emailType, subject, status, status, errorMessage],
  );
}

async function sendEmail({ to, subject, body, emailType = "announcement" }) {
  const recipientEmail = String(to || "").trim().toLowerCase();
  if (!recipientEmail) {
    return { sent: false, status: "failed", reason: "Recipient email missing." };
  }

  const smtp = getSmtpConfig();
  if (!smtp.host || !smtp.from) {
    await writeEmailLog({
      emailType,
      recipientEmail,
      subject,
      status: "queued",
      errorMessage: "SMTP is not configured.",
    });
    return { sent: false, status: "queued", reason: "SMTP is not configured." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth,
    });

    const info = await transporter.sendMail({
      from: smtp.from,
      to: recipientEmail,
      subject,
      text: body,
    });

    await writeEmailLog({ emailType, recipientEmail, subject, status: "sent" });
    return { sent: true, status: "sent", messageId: info.messageId };
  } catch (error) {
    await writeEmailLog({
      emailType,
      recipientEmail,
      subject,
      status: "failed",
      errorMessage: error.message,
    });
    return { sent: false, status: "failed", reason: error.message };
  }
}

async function sendTemplateEmail({ emailType, to, variables = {} }) {
  const recipientEmail = String(to || "").trim().toLowerCase();
  if (!recipientEmail) return { sent: false, status: "failed", reason: "Recipient email missing." };

  const [templates] = await pool.query(
    `
      SELECT *
      FROM email_templates
      WHERE email_type = ?
        AND status = 'published'
      ORDER BY is_default DESC, updated_at DESC
      LIMIT 1
    `,
    [emailType],
  );
  const template = templates[0];

  if (!template) {
    await writeEmailLog({
      emailType,
      recipientEmail,
      status: "queued",
      errorMessage: "No published template found.",
    });
    return { sent: false, status: "queued", reason: "No published template found." };
  }

  const subject = renderTemplate(template.subject, variables);
  const body = renderTemplate(template.body_template, variables);
  return sendEmail({ to: recipientEmail, subject, body, emailType });
}

module.exports = {
  renderTemplate,
  sendEmail,
  sendTemplateEmail,
};
