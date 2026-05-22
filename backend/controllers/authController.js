const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { mapNgo, mapVolunteer } = require("../middleware/authMiddleware");
const { signAuthToken } = require("../utils/jwt");
const { validateLogin, validateVolunteerRegistration } = require("../utils/authValidation");
const { getMembershipSettings } = require("../utils/membershipSettings");
const { createAdminNotifications } = require("../utils/notifications");

const PASSWORD_SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS || 10);

function authResponse(user) {
  return {
    success: true,
    token: signAuthToken(user),
    user: {
      id: user.id,
      full_name: user.full_name || user.fullName,
      fullName: user.fullName || user.full_name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      college: user.college,
      course: user.course,
      academic_year: user.academicYear || user.academic_year,
      academicYear: user.academicYear || user.academic_year,
      skills: user.skills,
      interests: user.interests,
      role: user.role,
      account_type: user.account_type || user.accountType || "volunteer",
      accountType: user.accountType || user.account_type || "volunteer",
      organization_name: user.organization_name || user.organizationName,
      organizationName: user.organizationName || user.organization_name,
      registration_number: user.registration_number || user.registrationNumber,
      ngo_type: user.ngo_type || user.ngoType,
      website: user.website,
      state: user.state,
      address: user.address,
      mission: user.mission,
      description: user.description,
      logo_url: user.logo_url || user.logoUrl,
      cover_url: user.cover_url || user.coverUrl,
      membership_status: user.membership_status || user.membershipStatus,
      membershipStatus: user.membershipStatus || user.membership_status,
      payment_status: user.payment_status || user.paymentStatus,
      paymentStatus: user.paymentStatus || user.payment_status,
      transaction_id: user.transaction_id || user.transactionId,
      transactionId: user.transactionId || user.transaction_id,
      verifiedBy: user.verifiedBy,
      verifiedAt: user.verifiedAt,
    },
  };
}

const ngoTypes = new Set(["healthcare", "education", "community", "research", "environment", "other"]);
const ngoRoles = new Set(["ngo", "ngo_admin"]);

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.map((item) => cleanString(item, 120)).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => cleanString(item, 120))
    .filter(Boolean);
}

function normalizeIntent(input = {}) {
  return {
    campSupport: Boolean(input.campSupport),
    awarenessPrograms: Boolean(input.awarenessPrograms),
    screeningCamp: Boolean(input.screeningCamp),
    researchCollaboration: Boolean(input.researchCollaboration),
    volunteerSupport: Boolean(input.volunteerSupport),
    medicalSupport: Boolean(input.medicalSupport),
    longTermPartnership: Boolean(input.longTermPartnership),
    csrPartnership: Boolean(input.csrPartnership),
  };
}

function cleanString(value, maxLength = 1000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanLongText(value, maxLength = 5000) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, maxLength);
}

function cleanOptionalUrl(value, fieldLabel) {
  const url = cleanString(value, 2000);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
    return url;
  } catch {
    const error = new Error(`${fieldLabel} must be a valid public http(s) URL.`);
    error.statusCode = 400;
    throw error;
  }
}

function normalizeNgoRegistration(input = {}) {
  const organisationType = cleanString(input.organisationType || input.organizationType || input.ngoType || input.ngo_type, 120);
  const workAreas = normalizeStringArray(input.workAreas || input.work_areas);
  const partnershipIntent = normalizeIntent(input.partnershipIntent || input.partnership_intent || input);
  const campRequestInput = input.campRequest || input.camp_request || {};
  const uploads = input.uploads || {};
  const data = {
    organizationName: cleanString(input.organizationName || input.organization_name || input.organisationName || input.organisation_name, 220),
    registrationNumber: cleanString(input.registrationNumber || input.registration_number, 180),
    organisationType,
    yearEstablished: Number(input.yearEstablished || input.year_established || 0) || null,
    ngoType: ngoTypes.has(input.ngoType || input.ngo_type) ? input.ngoType || input.ngo_type : "other",
    email: cleanString(input.email || input.organisationEmail || input.organisation_email, 180).toLowerCase(),
    password: String(input.password || ""),
    phone: cleanString(input.phone || input.organisationPhone || input.organisation_phone, 40),
    website: cleanOptionalUrl(input.website, "Website"),
    founderName: cleanString(input.founderName || input.founder_name, 180),
    designation: cleanString(input.designation, 180),
    representativeEmail: cleanString(input.representativeEmail || input.representative_email, 180).toLowerCase(),
    representativePhone: cleanString(input.representativePhone || input.representative_phone, 40),
    city: cleanString(input.city, 120),
    state: cleanString(input.state, 120) || null,
    pincode: cleanString(input.pincode, 20) || null,
    country: cleanString(input.country, 120) || "India",
    address: cleanLongText(input.address, 2000) || null,
    workAreas,
    targetPopulation: cleanLongText(input.targetPopulation || input.target_population, 2000) || null,
    districtsServed: cleanLongText(input.districtsServed || input.districts_served, 2000) || null,
    beneficiariesPerYear: Number(input.beneficiariesPerYear || input.beneficiaries_per_year || 0) || null,
    existingCollaborations: cleanLongText(input.existingCollaborations || input.existing_collaborations, 3000) || null,
    partnershipIntent,
    campRequest: {
      campType: cleanString(campRequestInput.campType || input.campType, 120),
      expectedBeneficiaries: cleanString(campRequestInput.expectedBeneficiaries || input.expectedBeneficiaries, 120),
      preferredDate: cleanString(campRequestInput.preferredDate || input.preferredDate, 40),
      campLocation: cleanString(campRequestInput.campLocation || input.campLocation, 220),
      notes: cleanLongText(campRequestInput.notes || input.notes, 3000),
    },
    uploads: {
      registrationCertificate: uploads.registrationCertificate || input.registrationCertificate || null,
      logo: uploads.logo || input.logo || null,
      activityImages: Array.isArray(uploads.activityImages || input.activityImages)
        ? uploads.activityImages || input.activityImages
        : [],
    },
    mission: cleanLongText(input.mission, 2000) || null,
    description: cleanLongText(input.description, 5000) || null,
    logoUrl: cleanOptionalUrl(input.logoUrl || input.logo_url, "Logo URL"),
    coverUrl: cleanOptionalUrl(input.coverUrl || input.cover_url, "Cover URL"),
  };
  const errors = {};
  if (!data.organizationName) errors.organizationName = "Organization name is required.";
  if (!data.registrationNumber) errors.registrationNumber = "Registration number is required.";
  if (!data.email) errors.email = "Email is required.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter a valid email.";
  if (data.representativeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.representativeEmail)) {
    errors.representativeEmail = "Enter a valid representative email.";
  }
  if (!data.password) errors.password = "Password is required.";
  if (data.password && data.password.length < 8) errors.password = "Use at least 8 characters.";
  if (!data.phone) errors.phone = "Phone is required.";
  if (!data.city) errors.city = "City is required.";
  return { data, errors };
}

async function register(req, res) {
  const { data, errors } = validateVolunteerRegistration(req.body);
  const membershipSettings = await getMembershipSettings();

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Please fix the highlighted fields.",
      errors,
    });
  }

  const [existing] = await pool.query("SELECT id FROM volunteers WHERE email = ? LIMIT 1", [data.email]);
  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists.",
      errors: { email: "An account with this email already exists." },
    });
  }

  const passwordHash = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);
  const paymentStatus = membershipSettings.payments_enabled ? "pending" : "free";
  const transactionId = membershipSettings.payments_enabled ? data.transactionId || "PENDING" : "FREE";

  try {
    const [result] = await pool.query(
      `
        INSERT INTO volunteers
          (full_name, email, password_hash, phone, city, college, course, academic_year, skills, interests, availability, bio, linkedin_url, instagram_url, role, membership_status, payment_status, transaction_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'volunteer', 'under_review', ?, ?)
      `,
      [
        data.fullName,
        data.email,
        passwordHash,
        data.phone,
        data.city,
        data.college || null,
        data.course || null,
        data.academicYear || null,
        data.skills || null,
        data.interests || null,
        data.availability || null,
        data.bio || null,
        data.linkedinUrl || null,
        data.instagramUrl || null,
        paymentStatus,
        transactionId,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM volunteers WHERE id = ? LIMIT 1", [result.insertId]);
    const user = mapVolunteer(rows[0]);
    await createAdminNotifications({
      title: "New volunteer registration",
      message: `${user.fullName || user.full_name} submitted a volunteer membership request.`,
      notificationType: "membership",
      actionUrl: "/admin/volunteers",
    });

    return res.status(201).json({
      ...authResponse(user),
      message: "Volunteer registration submitted successfully.",
    });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
        errors: { email: "An account with this email already exists." },
      });
    }

    throw error;
  }
}

async function login(req, res) {
  const { data, errors } = validateLogin(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Please fix the highlighted fields.",
      errors,
    });
  }

  const [rows] = await pool.query("SELECT * FROM volunteers WHERE email = ? LIMIT 1", [data.email]);
  if (rows.length === 0) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  const volunteer = rows[0];
  const passwordMatches = await bcrypt.compare(data.password, volunteer.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  const user = mapVolunteer(volunteer);
  return res.json({
    ...authResponse(user),
    message: "Logged in successfully.",
  });
}

async function registerNgo(req, res) {
  const { data, errors } = normalizeNgoRegistration(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
  }

  const [existing] = await pool.query("SELECT id FROM ngos WHERE email = ? OR registration_number = ? LIMIT 1", [
    data.email,
    data.registrationNumber,
  ]);
  if (existing.length > 0) {
    return res.status(409).json({ success: false, message: "An NGO with this email or registration number already exists." });
  }

  const passwordHash = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);
  const [result] = await pool.query(
    `
      INSERT INTO ngos
        (organization_name, organisation_name, organisation_type, year_established, registration_number, ngo_type, founder_name, designation, email, representative_email, password_hash, phone, representative_phone, website, address, city, state, pincode, country, work_areas, target_population, districts_served, beneficiaries_per_year, existing_collaborations, partnership_intent, camp_request, uploads, mission, description, logo_url, cover_url, status, membership_status, payment_status, transaction_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'under_review', 'free', 'FREE')
    `,
    [
      data.organizationName,
      data.organizationName,
      data.organisationType,
      data.yearEstablished,
      data.registrationNumber,
      data.ngoType,
      data.founderName,
      data.designation,
      data.email,
      data.representativeEmail || data.email,
      passwordHash,
      data.phone,
      data.representativePhone,
      data.website,
      data.address,
      data.city,
      data.state,
      data.pincode,
      data.country,
      JSON.stringify(data.workAreas),
      data.targetPopulation,
      data.districtsServed,
      data.beneficiariesPerYear,
      data.existingCollaborations,
      JSON.stringify(data.partnershipIntent),
      JSON.stringify(data.campRequest),
      JSON.stringify(data.uploads),
      data.mission,
      data.description,
      data.logoUrl,
      data.coverUrl,
    ],
  );

  await pool.query(
    "INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata_json) VALUES (NULL, 'ngo.register', 'ngo', ?, ?)",
    [result.insertId, JSON.stringify({ email: data.email })],
  );
  await createAdminNotifications({
    title: "New NGO registration",
    message: `${data.organizationName} submitted an NGO partnership profile.`,
    notificationType: "ngo",
    actionUrl: "/admin/ngos",
  });
  const [rows] = await pool.query("SELECT * FROM ngos WHERE id = ? LIMIT 1", [result.insertId]);
  return res.status(201).json({ ...authResponse(mapNgo(rows[0])), message: "NGO registration submitted successfully." });
}

async function loginNgo(req, res) {
  const { data, errors } = validateLogin(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
  }

  const [rows] = await pool.query("SELECT * FROM ngos WHERE email = ? LIMIT 1", [data.email]);
  if (rows.length === 0) return res.status(401).json({ success: false, message: "Invalid email or password." });

  const passwordMatches = await bcrypt.compare(data.password, rows[0].password_hash);
  if (!passwordMatches) return res.status(401).json({ success: false, message: "Invalid email or password." });

  return res.json({ ...authResponse(mapNgo(rows[0])), message: "Logged in successfully." });
}

async function me(req, res) {
  return res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
}

async function updateNgoProfile(req, res) {
  if (!ngoRoles.has(req.user.role)) return res.status(403).json({ success: false, message: "NGO account required." });
  const { data, errors } = normalizeNgoRegistration({ ...req.user, ...req.body, password: "temporary-pass" });
  delete errors.password;
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
  }

  await pool.query(
    `
      UPDATE ngos
      SET organization_name = ?,
          registration_number = ?,
          ngo_type = ?,
          phone = ?,
          website = ?,
          city = ?,
          state = ?,
          address = ?,
          mission = ?,
          description = ?,
          logo_url = ?,
          cover_url = ?
      WHERE id = ?
    `,
    [
      data.organizationName,
      data.registrationNumber,
      data.ngoType,
      data.phone,
      data.website,
      data.city,
      data.state,
      data.address,
      data.mission,
      data.description,
      data.logoUrl,
      data.coverUrl,
      req.user.id,
    ],
  );
  await pool.query(
    "INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata_json) VALUES (NULL, 'ngo.profile_edit', 'ngo', ?, ?)",
    [req.user.id, JSON.stringify({ email: req.user.email })],
  );
  const [rows] = await pool.query("SELECT * FROM ngos WHERE id = ? LIMIT 1", [req.user.id]);
  res.json({ success: true, data: mapNgo(rows[0]) });
}

module.exports = {
  register,
  registerNgo,
  login,
  loginNgo,
  me,
  updateNgoProfile,
};
