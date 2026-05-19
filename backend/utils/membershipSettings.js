const { pool } = require("../config/db");

function mapMembershipSettings(row = {}) {
  const instructions = row.payment_instructions || row.instructions || "";
  const active = row.is_active === undefined ? true : Boolean(row.is_active);
  const paymentsEnabled = Boolean(row.payments_enabled) && active;
  return {
    id: row.id || 1,
    payments_enabled: paymentsEnabled,
    paymentsEnabled,
    membership_fee: Number(row.membership_fee || 0),
    membershipFee: Number(row.membership_fee || 0),
    currency: row.currency || "INR",
    upi_qr_url: row.upi_qr_url || "",
    upiQrUrl: row.upi_qr_url || "",
    payment_instructions: instructions,
    paymentInstructions: instructions,
    instructions,
    membership_name: row.membership_name || "Free Membership",
    membershipName: row.membership_name || "Free Membership",
    is_active: active,
    isActive: active,
    plan_duration: row.plan_duration || null,
    planDuration: row.plan_duration || null,
    renewal_fee: row.renewal_fee === undefined || row.renewal_fee === null ? null : Number(row.renewal_fee),
    renewalFee: row.renewal_fee === undefined || row.renewal_fee === null ? null : Number(row.renewal_fee),
    expiry_date: row.expiry_date || null,
    expiryDate: row.expiry_date || null,
    chapter_pricing: row.chapter_pricing || null,
    chapterPricing: row.chapter_pricing || null,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

async function getMembershipSettings() {
  const [rows] = await pool.query("SELECT * FROM membership_settings WHERE id = 1 LIMIT 1");
  return mapMembershipSettings(rows[0]);
}

module.exports = {
  getMembershipSettings,
  mapMembershipSettings,
};
