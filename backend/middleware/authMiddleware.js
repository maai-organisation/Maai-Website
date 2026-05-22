const { pool } = require("../config/db");
const { verifyAuthToken } = require("../utils/jwt");

function mapVolunteer(row) {
  return {
    id: row.id,
    full_name: row.full_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    college: row.college,
    course: row.course,
    academicYear: row.academic_year,
    skills: row.skills,
    interests: row.interests,
    availability: row.availability,
    bio: row.bio,
    linkedinUrl: row.linkedin_url,
    instagramUrl: row.instagram_url,
    role: row.role,
    membership_status: row.membership_status || "under_review",
    membershipStatus: row.membership_status || "under_review",
    payment_status: row.payment_status || "free",
    paymentStatus: row.payment_status || "free",
    transaction_id: row.transaction_id || "FREE",
    transactionId: row.transaction_id || "FREE",
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseJsonField(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapNgo(row) {
  const workAreas = parseJsonField(row.work_areas, row.work_areas || []);
  const partnershipIntent = parseJsonField(row.partnership_intent, {});
  const campRequest = parseJsonField(row.camp_request, {});
  const uploads = parseJsonField(row.uploads, {});

  return {
    id: row.id,
    organization_name: row.organization_name,
    organizationName: row.organization_name,
    registration_number: row.registration_number,
    registrationNumber: row.registration_number,
    organisation_name: row.organisation_name || row.organization_name,
    organisationName: row.organisation_name || row.organization_name,
    organisation_type: row.organisation_type || row.ngo_type,
    organisationType: row.organisation_type || row.ngo_type,
    year_established: row.year_established,
    yearEstablished: row.year_established,
    founder_name: row.founder_name,
    founderName: row.founder_name,
    designation: row.designation,
    representative_email: row.representative_email,
    representativeEmail: row.representative_email,
    representative_phone: row.representative_phone,
    representativePhone: row.representative_phone,
    ngo_type: row.ngo_type,
    ngoType: row.ngo_type,
    email: row.email,
    phone: row.phone,
    website: row.website,
    city: row.city,
    state: row.state,
    address: row.address,
    pincode: row.pincode,
    country: row.country,
    work_areas: workAreas,
    workAreas,
    target_population: row.target_population,
    targetPopulation: row.target_population,
    districts_served: row.districts_served,
    districtsServed: row.districts_served,
    beneficiaries_per_year: row.beneficiaries_per_year,
    beneficiariesPerYear: row.beneficiaries_per_year,
    existing_collaborations: row.existing_collaborations,
    existingCollaborations: row.existing_collaborations,
    partnership_intent: partnershipIntent,
    partnershipIntent,
    camp_request: campRequest,
    campRequest,
    uploads,
    status: row.status || (row.membership_status === "verified" ? "approved" : row.membership_status === "rejected" ? "rejected" : "pending"),
    mission: row.mission,
    description: row.description,
    logo_url: row.logo_url,
    logoUrl: row.logo_url,
    cover_url: row.cover_url,
    coverUrl: row.cover_url,
    role: "ngo_admin",
    account_type: "ngo",
    accountType: "ngo",
    membership_status: row.membership_status || "under_review",
    membershipStatus: row.membership_status || "under_review",
    payment_status: row.payment_status || "free",
    paymentStatus: row.payment_status || "free",
    transaction_id: row.transaction_id || "FREE",
    transactionId: row.transaction_id || "FREE",
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function authenticateToken(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, headerToken] = header.split(" ");
  const token = scheme === "Bearer" ? headerToken : req.query?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication token is required." });
  }

  try {
    const payload = verifyAuthToken(token);
    if (payload.account_type === "ngo" || payload.role === "ngo" || payload.role === "ngo_admin") {
      const [ngoRows] = await pool.query("SELECT * FROM ngos WHERE id = ? LIMIT 1", [payload.id]);
      if (ngoRows.length === 0) {
        return res.status(401).json({ success: false, message: "NGO account no longer exists." });
      }
      req.user = mapNgo(ngoRows[0]);
      return next();
    }

    const [rows] = await pool.query("SELECT * FROM volunteers WHERE id = ? LIMIT 1", [payload.id]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }

    req.user = mapVolunteer(rows[0]);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired authentication token." });
  }
}

module.exports = {
  authenticateToken,
  requireAuth: authenticateToken,
  mapNgo,
  mapVolunteer,
};
