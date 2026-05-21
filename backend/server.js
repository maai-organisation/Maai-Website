require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { pool } = require("./config/db");
const { version } = require("./package.json");
const initializeDatabase = require("./config/initDatabase");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const campRoutes = require("./routes/campRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const cmsRoutes = require("./routes/cmsRoutes");
const eventRoutes = require("./routes/eventRoutes");
const emailRoutes = require("./routes/emailRoutes");
const idCardRoutes = require("./routes/idCardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const startDbHeartbeat = require("./utils/dbHeartbeat");
const { sendTemplateEmail } = require("./utils/emailService");
const { requireAuth } = require("./middleware/authMiddleware");
const { authorizeRoles } = require("./middleware/roleMiddleware");
const { auditAdminAction } = require("./middleware/auditMiddleware");

const app = express();
const configuredOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowUnconfiguredCors = process.env.NODE_ENV !== "production" && configuredOrigins.length === 0;

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED_REJECTION]", reason?.message || reason);
});

process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT_EXCEPTION]", error?.message || error);
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowUnconfiguredCors || configuredOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Railway health endpoint: GET /health
// Purpose: monitor backend availability and current Aiven DB state.
app.get("/health", async (_req, res) => {
  let dbStatus = "disconnected";

  try {
    const [rows] = await pool.query(
  "SELECT 1 AS status"
);
    void rows;
    dbStatus = "connected";
  } catch (err) {
    dbStatus = "error";
  }

  res.status(200).json({
    status: "ok",
    service: "Maai organisation backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV,
    version,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/announcements", requireDatabase, announcementRoutes);
app.use("/api/camps", campRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/email", requireDatabase, emailRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/id-cards", idCardRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

function mapInitiative(row) {
  let tags = [];

  if (Array.isArray(row.tags)) {
    tags = row.tags;
  } else if (row.tags) {
    try {
      tags = JSON.parse(row.tags);
    } catch (error) {
      tags = [];
    }
  }

  return {
    id: row.id,
    title: row.title,
    subtitle: row.short_description || row.subtitle,
    shortDescription: row.short_description || row.subtitle,
    short_description: row.short_description || row.subtitle,
    description: row.description,
    imageUrl: row.image_url || row.imageUrl || row.image,
    image_url: row.image_url || row.imageUrl || row.image,
    image: row.image_url || row.imageUrl || row.image,
    bannerUrl: row.banner_url || row.bannerUrl,
    banner_url: row.banner_url || row.bannerUrl,
    category: row.category,
    status: row.status,
    featured: Boolean(row.featured),
    slug: row.slug,
    visibility: row.visibility,
    visible: row.status ? row.status === "published" && row.visibility === "public" : Boolean(row.visible),
    active: row.status ? row.status !== "archived" : Boolean(row.active),
    date: row.start_date || row.date,
    startDate: row.start_date,
    start_date: row.start_date,
    endDate: row.end_date,
    end_date: row.end_date,
    location: row.location,
    volunteersNeeded: row.volunteers_needed,
    registrationOpen: Boolean(row.registration_open),
    orderIndex: row.order_index,
    order_index: row.order_index,
    tags,
    displayOrder: row.order_index ?? row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMentor(row) {
  const name = row.full_name || row.name;
  const imageUrl = row.image_url || row.imageUrl || row.image;
  const linkedinUrl = row.linkedin_url || row.linkedin;
  const instagramUrl = row.instagram_url || row.instagram;
  const specialization = row.specialization || row.category;

  return {
    id: row.id,
    fullName: name,
    full_name: name,
    name,
    designation: row.designation,
    organization: row.organization,
    specialization,
    category: specialization,
    bio: row.bio,
    imageUrl,
    image_url: imageUrl,
    image: imageUrl,
    linkedin: linkedinUrl,
    linkedinUrl,
    linkedin_url: linkedinUrl,
    instagram: instagramUrl,
    instagramUrl,
    instagram_url: instagramUrl,
    email: row.email,
    status: row.status,
    featured: Boolean(row.featured),
    visible: row.status ? row.status === "published" : Boolean(row.visible),
    orderIndex: row.order_index,
    order_index: row.order_index,
    displayOrder: row.order_index ?? row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTeamMember(row) {
  const name = row.full_name || row.name;
  const imageUrl = row.image_url || row.imageUrl || row.image;
  const linkedinUrl = row.linkedin_url || row.linkedin;
  const instagramUrl = row.instagram_url || row.instagram;

  return {
    id: row.id,
    fullName: name,
    full_name: name,
    name,
    designation: row.designation,
    department: row.department,
    imageUrl,
    image_url: imageUrl,
    image: imageUrl,
    bio: row.bio,
    linkedin: linkedinUrl,
    linkedinUrl,
    linkedin_url: linkedinUrl,
    instagram: instagramUrl,
    instagramUrl,
    instagram_url: instagramUrl,
    email: row.email,
    status: row.status,
    orderIndex: row.order_index,
    order_index: row.order_index,
    priority: row.order_index ?? row.priority,
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReel(row) {
  const thumbnailUrl = row.thumbnail_url || row.thumbnailUrl || row.thumbnail;
  const videoUrl = row.video_url || row.videoUrl;
  const publishedAt = row.published_at || row.upload_date;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    platform: row.platform,
    caption: row.caption,
    description: row.description,
    thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    thumbnail: thumbnailUrl,
    videoUrl,
    video_url: videoUrl,
    initiativeId: row.initiative_id,
    initiative_id: row.initiative_id,
    status: row.status,
    uploadDate: publishedAt,
    publishedAt,
    published_at: publishedAt,
    featured: Boolean(row.featured),
    active: row.status ? row.status !== "archived" : Boolean(row.active),
    category: row.category,
    orderIndex: row.order_index,
    order_index: row.order_index,
    displayOrder: row.order_index ?? row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTestimonial(row) {
  const name = row.full_name || row.name;
  const designation = row.designation || row.role;
  const testimonial = row.testimonial || row.quote;
  const imageUrl = row.image_url || row.imageUrl || row.image;

  return {
    id: row.id,
    fullName: name,
    full_name: name,
    name,
    designation,
    role: designation,
    organization: row.organization,
    testimonial,
    quote: testimonial,
    imageUrl,
    image_url: imageUrl,
    image: imageUrl,
    category: row.category,
    status: row.status,
    featured: Boolean(row.featured),
    active: row.status ? row.status !== "archived" : Boolean(row.active),
    rating: row.rating,
    orderIndex: row.order_index,
    order_index: row.order_index,
    displayOrder: row.order_index ?? row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCareer(row) {
  const roleType = row.role_type || row.type || row.employmentType;
  const description = row.description || row.short_description;
  const imageUrl = row.image_url || row.bannerUrl || row.image;
  const applicationFormUrl = row.application_form_url || row.applyLink || row.apply_url;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    department: row.department,
    roleType,
    role_type: roleType,
    type: roleType,
    employmentType: roleType,
    location: row.location,
    description,
    shortDescription: row.short_description || description,
    requirements: row.requirements,
    responsibilities: row.responsibilities,
    imageUrl,
    image_url: imageUrl,
    image: imageUrl,
    status: row.status,
    visibility: row.visibility,
    applicationDeadline: row.application_deadline,
    application_deadline: row.application_deadline,
    bannerUrl: imageUrl,
    category: row.category,
    applyLink: applicationFormUrl,
    applyUrl: applicationFormUrl,
    applicationFormUrl,
    application_form_url: applicationFormUrl,
    isActive: row.status ? row.status !== "archived" : Boolean(row.active),
    featured: Boolean(row.featured),
    active: row.status ? row.status !== "archived" : Boolean(row.active),
    orderIndex: row.order_index,
    order_index: row.order_index,
    displayOrder: row.order_index ?? row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSocial(row) {
  return {
    id: row.id,
    platform: row.platform,
    handle: row.handle,
    url: row.url,
    iconUrl: row.iconUrl,
    icon: row.iconUrl || row.icon,
    isActive: Boolean(row.is_active),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSocialLink(row) {
  return {
    id: row.id,
    platform: row.platform,
    name: row.platform ? row.platform.charAt(0).toUpperCase() + row.platform.slice(1) : "",
    url: row.url,
    icon: row.icon || row.platform,
    status: row.status,
    orderIndex: row.order_index,
    order_index: row.order_index,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

function mapCampRegistration(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp,
    organizationName: row.organization_name,
    organizationType: row.organization_type,
    website: row.website,
    campTitle: row.camp_title,
    campType: row.camp_type,
    location: row.location,
    beneficiaries: row.beneficiaries,
    proposedDate: row.proposed_date,
    description: row.description,
    additionalNotes: row.additional_notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function sendCampRegistrationStatusEmail(registration) {
  if (!registration?.email || !["approved", "rejected"].includes(registration.status)) return;
  await sendTemplateEmail({
    emailType: registration.status === "approved" ? "camp_approved" : "camp_rejected",
    to: registration.email,
    recipientType: "camp_registration",
    recipientId: registration.id,
    variables: {
      full_name: registration.full_name,
      event_name: registration.camp_title,
      certificate_name: "",
      membership_status: registration.status,
    },
    metadata: { campRegistrationId: registration.id },
  });
}

function requireDatabase(req, res, next) {
  if (!pool) {
    return res.status(503).json({
      success: false,
      message: "Database is not configured for this deployment.",
    });
  }

  return next();
}

app.use("/api/admin", requireDatabase, requireAuth, authorizeRoles("superadmin", "it_staff"), auditAdminAction);
app.use("/api/admin", adminRoutes);
app.get(
  "/api/cms/social-links",
  requireDatabase,
  asyncHandler(async (req, res, next) => {
    if (Object.keys(req.query || {}).length > 0) return next();

    const [rows] = await pool.query(`
      SELECT *
      FROM social_links
      WHERE status = 'published'
      ORDER BY order_index ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapSocialLink) });
  }),
);
app.get(
  "/api/cms/team",
  requireDatabase,
  asyncHandler(async (req, res, next) => {
    if (Object.keys(req.query || {}).length > 0) return next();

    const [rows] = await pool.query(`
      SELECT *
      FROM team_members
      WHERE status = 'published'
      ORDER BY department ASC, order_index ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapTeamMember) });
  }),
);
app.get(
  "/api/cms/mentors",
  requireDatabase,
  asyncHandler(async (req, res, next) => {
    if (Object.keys(req.query || {}).length > 0) return next();

    const [rows] = await pool.query(`
      SELECT *
      FROM mentors
      WHERE status = 'published'
      ORDER BY featured DESC, order_index ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapMentor) });
  }),
);
app.get(
  "/api/cms/initiatives",
  requireDatabase,
  asyncHandler(async (req, res, next) => {
    if (Object.keys(req.query || {}).length > 0) return next();

    const [rows] = await pool.query(`
      SELECT *
      FROM initiatives
      WHERE status = 'published'
        AND visibility = 'public'
      ORDER BY featured DESC, order_index ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapInitiative) });
  }),
);
app.get(
  "/api/cms/reels",
  requireDatabase,
  asyncHandler(async (req, res, next) => {
    if (Object.keys(req.query || {}).length > 0) return next();

    const [rows] = await pool.query(`
      SELECT *
      FROM reels
      WHERE status = 'published'
      ORDER BY featured DESC, order_index ASC, COALESCE(published_at, created_at) DESC
    `);

    res.json({ success: true, data: rows.map(mapReel) });
  }),
);
app.get(
  "/api/cms/testimonials",
  requireDatabase,
  asyncHandler(async (req, res, next) => {
    if (Object.keys(req.query || {}).length > 0) return next();

    const [rows] = await pool.query(`
      SELECT *
      FROM testimonials
      WHERE status = 'published'
      ORDER BY featured DESC, order_index ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapTestimonial) });
  }),
);
app.get(
  "/api/cms/careers",
  requireDatabase,
  asyncHandler(async (req, res, next) => {
    if (Object.keys(req.query || {}).length > 0) return next();

    const [rows] = await pool.query(`
      SELECT *
      FROM careers
      WHERE status = 'published'
      ORDER BY featured DESC, order_index ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapCareer) });
  }),
);
app.use("/api/cms", requireDatabase, requireAuth, authorizeRoles("superadmin", "it_staff"), cmsRoutes);

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function cleanString(value, maxLength = 1000) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanLongText(value, maxLength = 5000) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidUrl(value) {
  if (!value) return true;

  try {
    const parsed = new URL(String(value).trim());
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function cleanUrl(value, fieldLabel = "URL") {
  const url = cleanString(value, 2000);
  if (!url) return null;
  if (!isValidUrl(url)) {
    const error = new Error(`${fieldLabel} must be a valid public http(s) URL.`);
    error.statusCode = 400;
    throw error;
  }
  return url;
}

function firstUrl(input, keys, fieldLabel) {
  for (const key of keys) {
    if (input[key]) return cleanUrl(input[key], fieldLabel);
  }
  return null;
}

const urlFieldKeys = new Set([
  "imageUrl",
  "image",
  "bannerUrl",
  "thumbnailUrl",
  "thumbnail",
  "videoUrl",
  "video_url",
  "applyLink",
  "applyUrl",
  "apply_url",
  "iconUrl",
  "icon",
  "url",
]);

function validateCampRegistration(input = {}) {
  const data = {
    fullName: cleanString(input.fullName, 180),
    email: cleanString(input.email, 180).toLowerCase(),
    whatsapp: cleanString(input.whatsapp, 40),
    organizationName: cleanString(input.organizationName, 180),
    organizationType: cleanString(input.organizationType, 120),
    website: cleanString(input.website, 1000),
    campTitle: cleanString(input.campTitle, 220),
    campType: cleanString(input.campType, 140),
    location: cleanString(input.location, 220),
    beneficiaries: cleanString(input.beneficiaries, 120),
    proposedDate: cleanString(input.proposedDate, 20),
    description: cleanLongText(input.description, 5000),
    additionalNotes: cleanLongText(input.additionalNotes, 5000),
  };

  const required = [
    ["fullName", "Full name is required."],
    ["email", "Email address is required."],
    ["whatsapp", "WhatsApp number is required."],
    ["organizationName", "NGO / organization name is required."],
    ["organizationType", "Organization type is required."],
    ["campTitle", "Camp title is required."],
    ["campType", "Camp type is required."],
    ["location", "Location is required."],
    ["beneficiaries", "Expected beneficiaries is required."],
    ["proposedDate", "Proposed date is required."],
    ["description", "Short description is required."],
  ];

  const errors = {};
  required.forEach(([key, message]) => {
    if (!data[key]) errors[key] = message;
  });

  if (data.email && !isValidEmail(data.email)) errors.email = "Enter a valid email address.";
  if (data.proposedDate && Number.isNaN(Date.parse(data.proposedDate))) {
    errors.proposedDate = "Enter a valid proposed date.";
  }

  return { data, errors };
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Maai organisation backend is running",
    database: pool ? "configured" : "not configured",
  });
});

app.post(
  "/api/camp-registration",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const { data, errors } = validateCampRegistration(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please fix the highlighted fields.",
        errors,
      });
    }

    const [result] = await pool.query(
      `
        INSERT INTO camp_registrations
          (full_name, email, whatsapp, organization_name, organization_type, website, camp_title, camp_type, location, beneficiaries, proposed_date, description, additional_notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        data.fullName,
        data.email,
        data.whatsapp,
        data.organizationName,
        data.organizationType,
        data.website || null,
        data.campTitle,
        data.campType,
        data.location,
        data.beneficiaries,
        data.proposedDate,
        data.description,
        data.additionalNotes || null,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM camp_registrations WHERE id = ?", [result.insertId]);
    return res.status(201).json({
      success: true,
      message: "Your proposal has been submitted successfully.",
      data: mapCampRegistration(rows[0]),
    });
  }),
);

app.get(
  "/api/admin/camp-registrations",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const filters = [];
    const values = [];
    const status = cleanString(req.query.status, 40);
    const search = cleanString(req.query.search, 180);

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }

    if (search) {
      filters.push("(full_name LIKE ? OR organization_name LIKE ? OR camp_title LIKE ? OR location LIKE ? OR email LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like, like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `
        SELECT *
        FROM camp_registrations
        ${where}
        ORDER BY created_at DESC
      `,
      values,
    );

    res.json({ success: true, data: rows.map(mapCampRegistration) });
  }),
);

app.patch(
  "/api/admin/camp-registrations/:id/status",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const allowedStatuses = new Set(["pending", "reviewed", "approved", "rejected", "contacted"]);
    const status = cleanString(req.body?.status, 40);

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ success: false, message: "Invalid registration status." });
    }

    const [result] = await pool.query("UPDATE camp_registrations SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Camp registration not found." });
    }

    const [rows] = await pool.query("SELECT * FROM camp_registrations WHERE id = ?", [req.params.id]);
    await sendCampRegistrationStatusEmail(rows[0]);
    return res.json({ success: true, data: mapCampRegistration(rows[0]) });
  }),
);

app.patch(
  "/api/admin/camp-registrations/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const allowedStatuses = new Set(["pending", "reviewed", "approved", "rejected", "contacted"]);
    const status = cleanString(req.body?.status, 40);

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ success: false, message: "Invalid registration status." });
    }

    const [result] = await pool.query("UPDATE camp_registrations SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Camp registration not found." });
    }

    const [rows] = await pool.query("SELECT * FROM camp_registrations WHERE id = ?", [req.params.id]);
    await sendCampRegistrationStatusEmail(rows[0]);
    return res.json({ success: true, data: mapCampRegistration(rows[0]) });
  }),
);

app.delete(
  "/api/admin/camp-registrations/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM camp_registrations WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Camp registration not found." });
    }

    return res.json({ success: true });
  }),
);

app.get(
  "/api/stats",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [[volunteers]] = await pool.query(
      "SELECT COUNT(*) AS count FROM volunteers WHERE membership_status = 'verified'",
    );
    const [[ngos]] = await pool.query("SELECT COUNT(*) AS count FROM ngos WHERE membership_status = 'verified'");
    const [[events]] = await pool.query("SELECT COUNT(*) AS count FROM events WHERE status IN ('published', 'completed')");
    const [[certificates]] = await pool.query("SELECT COUNT(*) AS count FROM event_certificates WHERE status <> 'revoked'");

    await pool.query(
      `
        INSERT INTO impact_stats
          (id, volunteers_count, ngo_count, events_count, certificates_count)
        VALUES (1, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          volunteers_count = VALUES(volunteers_count),
          ngo_count = VALUES(ngo_count),
          events_count = VALUES(events_count),
          certificates_count = VALUES(certificates_count)
      `,
      [volunteers.count, ngos.count, events.count, certificates.count],
    );

    res.json({
      success: true,
      data: [
        { value: events.count, label: "EVENTS CONDUCTED", tone: "teal" },
        { value: certificates.count, label: "CERTIFICATES ISSUED", tone: "coral" },
        { value: volunteers.count, label: "VOLUNTEERS ENGAGED", tone: "amber" },
        { value: ngos.count, label: "NGO PARTNERS", tone: "teal" },
      ],
    });
  }),
);

app.get(
  "/api/initiative-categories",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`
      SELECT DISTINCT category
      FROM initiatives
      WHERE status = 'published'
        AND visibility = 'public'
        AND category IS NOT NULL
        AND category <> ''
      ORDER BY category ASC
    `);

    res.json({
      success: true,
      data: ["All", ...rows.map((row) => row.category)].map((name) => ({ name })),
    });
  }),
);

app.get(
  "/api/initiatives",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const includeHidden = toBoolean(req.query.includeHidden);
    const featuredOnly = toBoolean(req.query.featured);
    const filters = [];
    const values = [];

    if (!includeHidden) filters.push("status = 'published' AND visibility = 'public'");
    if (featuredOnly) filters.push("featured = 1");
    if (req.query.category && req.query.category !== "All") {
      filters.push("category = ?");
      values.push(req.query.category);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `
        SELECT *
        FROM initiatives
        ${where}
        ORDER BY featured DESC, order_index ASC, created_at DESC
      `,
      values,
    );

    res.json({ success: true, data: rows.map(mapInitiative) });
  }),
);

app.get(
  "/api/admin/initiatives",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`
      SELECT *
      FROM initiatives
      ORDER BY display_order ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapInitiative) });
  }),
);

app.post(
  "/api/admin/initiatives",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const initiative = req.body || {};
    const title = String(initiative.title || "").trim();

    if (!title) {
      return res.status(400).json({ success: false, message: "Initiative title is required." });
    }

    const slug = slugify(initiative.slug || title);

    const [result] = await pool.query(
      `
        INSERT INTO initiatives
          (title, subtitle, description, imageUrl, bannerUrl, category, status, featured, slug, visible, active, date, location, volunteers_needed, registration_open, tags, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        initiative.subtitle || null,
        initiative.description || null,
        firstUrl(initiative, ["imageUrl", "image"], "Initiative image URL"),
        firstUrl(initiative, ["bannerUrl"], "Initiative banner URL"),
        initiative.category || null,
        initiative.status || "Active",
        toBoolean(initiative.featured) ? 1 : 0,
        slug,
        toBoolean(initiative.visible, true) ? 1 : 0,
        toBoolean(initiative.active, true) ? 1 : 0,
        initiative.date || null,
        initiative.location || null,
        initiative.volunteersNeeded || initiative.volunteers_needed || null,
        toBoolean(initiative.registrationOpen || initiative.registration_open) ? 1 : 0,
        JSON.stringify(Array.isArray(initiative.tags) ? initiative.tags : []),
        Number(initiative.displayOrder || initiative.display_order || 0),
      ],
    );

    const [rows] = await pool.query("SELECT * FROM initiatives WHERE id = ?", [result.insertId]);
    return res.status(201).json({ success: true, data: mapInitiative(rows[0]) });
  }),
);

app.put(
  "/api/admin/initiatives/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const initiative = req.body || {};
    const title = String(initiative.title || "").trim();

    if (!title) {
      return res.status(400).json({ success: false, message: "Initiative title is required." });
    }

    const slug = slugify(initiative.slug || title);

    const [result] = await pool.query(
      `
        UPDATE initiatives
        SET title = ?,
            subtitle = ?,
            description = ?,
            imageUrl = ?,
            bannerUrl = ?,
            category = ?,
            status = ?,
            featured = ?,
            slug = ?,
            visible = ?,
            active = ?,
            date = ?,
            location = ?,
            volunteers_needed = ?,
            registration_open = ?,
            tags = ?,
            display_order = ?
        WHERE id = ?
      `,
      [
        title,
        initiative.subtitle || null,
        initiative.description || null,
        firstUrl(initiative, ["imageUrl", "image"], "Initiative image URL"),
        firstUrl(initiative, ["bannerUrl"], "Initiative banner URL"),
        initiative.category || null,
        initiative.status || "Active",
        toBoolean(initiative.featured) ? 1 : 0,
        slug,
        toBoolean(initiative.visible, true) ? 1 : 0,
        toBoolean(initiative.active, true) ? 1 : 0,
        initiative.date || null,
        initiative.location || null,
        initiative.volunteersNeeded || initiative.volunteers_needed || null,
        toBoolean(initiative.registrationOpen || initiative.registration_open) ? 1 : 0,
        JSON.stringify(Array.isArray(initiative.tags) ? initiative.tags : []),
        Number(initiative.displayOrder || initiative.display_order || 0),
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Initiative not found." });
    }

    const [rows] = await pool.query("SELECT * FROM initiatives WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapInitiative(rows[0]) });
  }),
);

app.patch(
  "/api/admin/initiatives/reorder",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Reorder items are required." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.query("UPDATE initiatives SET display_order = ? WHERE id = ?", [
          Number(item.displayOrder || item.display_order || 0),
          item.id,
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ success: true });
  }),
);

app.patch(
  "/api/admin/initiatives/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const allowedFields = {
      subtitle: "subtitle",
      description: "description",
      imageUrl: "imageUrl",
      image: "imageUrl",
      bannerUrl: "bannerUrl",
      category: "category",
      status: "status",
      featured: "featured",
      visible: "visible",
      active: "active",
      date: "date",
      location: "location",
      volunteersNeeded: "volunteers_needed",
      volunteers_needed: "volunteers_needed",
      registrationOpen: "registration_open",
      registration_open: "registration_open",
      tags: "tags",
      displayOrder: "display_order",
      display_order: "display_order",
      title: "title",
      slug: "slug",
    };

    const updates = [];
    const values = [];

    Object.entries(allowedFields).forEach(([inputKey, column]) => {
      if (!(inputKey in req.body)) return;
      let value = req.body[inputKey];
      if (urlFieldKeys.has(inputKey)) value = cleanUrl(value, `${inputKey} URL`);

      if (inputKey === "featured" || inputKey === "visible" || inputKey === "active" || inputKey === "registrationOpen" || inputKey === "registration_open") value = toBoolean(value) ? 1 : 0;
      if (inputKey === "displayOrder" || inputKey === "display_order") value = Number(value || 0);
      if (inputKey === "slug") value = slugify(value);
      if (inputKey === "tags") value = JSON.stringify(Array.isArray(value) ? value : []);

      updates.push(`${column} = ?`);
      values.push(value);
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided." });
    }

    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE initiatives SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Initiative not found." });
    }

    const [rows] = await pool.query("SELECT * FROM initiatives WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapInitiative(rows[0]) });
  }),
);

app.patch(
  "/api/admin/initiatives/reorder",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Reorder items are required." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.query("UPDATE initiatives SET display_order = ? WHERE id = ?", [
          Number(item.displayOrder || item.display_order || 0),
          item.id,
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ success: true });
  }),
);

app.delete(
  "/api/admin/initiatives/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM initiatives WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Initiative not found." });
    }

    return res.json({ success: true });
  }),
);

app.get(
  "/api/mentors",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const includeHidden = toBoolean(req.query.includeHidden);
    const featuredOnly = toBoolean(req.query.featured);
    const filters = [];

    if (!includeHidden) filters.push("status = 'published'");
    if (featuredOnly) filters.push("featured = 1");

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(`
      SELECT *
      FROM mentors
      ${where}
      ORDER BY featured DESC, order_index ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapMentor) });
  }),
);

app.get(
  "/api/admin/mentors",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`
      SELECT *
      FROM mentors
      ORDER BY display_order ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapMentor) });
  }),
);

app.post(
  "/api/admin/mentors",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const mentor = req.body || {};
    const name = String(mentor.name || "").trim();

    if (!name) {
      return res.status(400).json({ success: false, message: "Mentor name is required." });
    }

    const [result] = await pool.query(
      `
        INSERT INTO mentors
          (name, designation, organization, bio, imageUrl, linkedin, category, featured, visible, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        mentor.designation || null,
        mentor.organization || null,
        mentor.bio || null,
        firstUrl(mentor, ["imageUrl", "image"], "Mentor image URL"),
        mentor.linkedin || null,
        mentor.category || null,
        toBoolean(mentor.featured) ? 1 : 0,
        toBoolean(mentor.visible, true) ? 1 : 0,
        Number(mentor.displayOrder || mentor.display_order || 0),
      ],
    );

    const [rows] = await pool.query("SELECT * FROM mentors WHERE id = ?", [result.insertId]);
    return res.status(201).json({ success: true, data: mapMentor(rows[0]) });
  }),
);

app.put(
  "/api/admin/mentors/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const mentor = req.body || {};
    const name = String(mentor.name || "").trim();

    if (!name) {
      return res.status(400).json({ success: false, message: "Mentor name is required." });
    }

    const [result] = await pool.query(
      `
        UPDATE mentors
        SET name = ?,
            designation = ?,
            organization = ?,
            bio = ?,
            imageUrl = ?,
            linkedin = ?,
            category = ?,
            featured = ?,
            visible = ?,
            display_order = ?
        WHERE id = ?
      `,
      [
        name,
        mentor.designation || null,
        mentor.organization || null,
        mentor.bio || null,
        firstUrl(mentor, ["imageUrl", "image"], "Mentor image URL"),
        mentor.linkedin || null,
        mentor.category || null,
        toBoolean(mentor.featured) ? 1 : 0,
        toBoolean(mentor.visible, true) ? 1 : 0,
        Number(mentor.displayOrder || mentor.display_order || 0),
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Mentor not found." });
    }

    const [rows] = await pool.query("SELECT * FROM mentors WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapMentor(rows[0]) });
  }),
);

app.patch(
  "/api/admin/mentors/reorder",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Reorder items are required." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.query("UPDATE mentors SET display_order = ? WHERE id = ?", [
          Number(item.displayOrder || item.display_order || 0),
          item.id,
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ success: true });
  }),
);

app.patch(
  "/api/admin/mentors/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const allowedFields = {
      name: "name",
      designation: "designation",
      organization: "organization",
      bio: "bio",
      imageUrl: "imageUrl",
      image: "imageUrl",
      linkedin: "linkedin",
      category: "category",
      featured: "featured",
      visible: "visible",
      displayOrder: "display_order",
      display_order: "display_order",
    };

    const updates = [];
    const values = [];

    Object.entries(allowedFields).forEach(([inputKey, column]) => {
      if (!(inputKey in req.body)) return;
      let value = req.body[inputKey];
      if (urlFieldKeys.has(inputKey)) value = cleanUrl(value, `${inputKey} URL`);

      if (inputKey === "featured" || inputKey === "visible") value = toBoolean(value) ? 1 : 0;
      if (inputKey === "displayOrder" || inputKey === "display_order") value = Number(value || 0);

      updates.push(`${column} = ?`);
      values.push(value);
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided." });
    }

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE mentors SET ${updates.join(", ")} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Mentor not found." });
    }

    const [rows] = await pool.query("SELECT * FROM mentors WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapMentor(rows[0]) });
  }),
);

app.patch(
  "/api/admin/mentors/reorder",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Reorder items are required." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.query("UPDATE mentors SET display_order = ? WHERE id = ?", [
          Number(item.displayOrder || item.display_order || 0),
          item.id,
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ success: true });
  }),
);

app.delete(
  "/api/admin/mentors/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM mentors WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Mentor not found." });
    }

    return res.json({ success: true });
  }),
);

app.get(
  "/api/team",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const includeInactive = toBoolean(req.query.includeInactive);
    const featuredOnly = toBoolean(req.query.featured);
    const filters = [];

    if (!includeInactive) filters.push("status = 'published'");
    if (featuredOnly) filters.push("featured = 1");

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(`
      SELECT *
      FROM team_members
      ${where}
      ORDER BY department ASC, order_index ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapTeamMember) });
  }),
);

app.get(
  "/api/admin/team",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`
      SELECT *
      FROM team_members
      ORDER BY priority ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapTeamMember) });
  }),
);

app.post(
  "/api/admin/team",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const member = req.body || {};
    const name = String(member.name || "").trim();

    if (!name) {
      return res.status(400).json({ success: false, message: "Team member name is required." });
    }

    const [result] = await pool.query(
      `
        INSERT INTO team_members
          (name, designation, department, imageUrl, bio, linkedin, instagram, priority, featured, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        member.designation || null,
        member.department || null,
        firstUrl(member, ["imageUrl", "image"], "Team image URL"),
        member.bio || null,
        member.linkedin || null,
        member.instagram || null,
        Number(member.priority || 0),
        toBoolean(member.featured) ? 1 : 0,
        toBoolean(member.active, true) ? 1 : 0,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM team_members WHERE id = ?", [result.insertId]);
    return res.status(201).json({ success: true, data: mapTeamMember(rows[0]) });
  }),
);

app.put(
  "/api/admin/team/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const member = req.body || {};
    const name = String(member.name || "").trim();

    if (!name) {
      return res.status(400).json({ success: false, message: "Team member name is required." });
    }

    const [result] = await pool.query(
      `
        UPDATE team_members
        SET name = ?,
            designation = ?,
            department = ?,
            imageUrl = ?,
            bio = ?,
            linkedin = ?,
            instagram = ?,
            priority = ?,
            featured = ?,
            active = ?
        WHERE id = ?
      `,
      [
        name,
        member.designation || null,
        member.department || null,
        firstUrl(member, ["imageUrl", "image"], "Team image URL"),
        member.bio || null,
        member.linkedin || null,
        member.instagram || null,
        Number(member.priority || 0),
        toBoolean(member.featured) ? 1 : 0,
        toBoolean(member.active, true) ? 1 : 0,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Team member not found." });
    }

    const [rows] = await pool.query("SELECT * FROM team_members WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapTeamMember(rows[0]) });
  }),
);

app.patch(
  "/api/admin/team/reorder",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Reorder items are required." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.query("UPDATE team_members SET priority = ? WHERE id = ?", [
          Number(item.priority || 0),
          item.id,
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ success: true });
  }),
);

app.patch(
  "/api/admin/team/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const allowedFields = {
      name: "name",
      designation: "designation",
      department: "department",
      imageUrl: "imageUrl",
      image: "imageUrl",
      bio: "bio",
      linkedin: "linkedin",
      instagram: "instagram",
      priority: "priority",
      featured: "featured",
      active: "active",
    };

    const updates = [];
    const values = [];

    Object.entries(allowedFields).forEach(([inputKey, column]) => {
      if (!(inputKey in req.body)) return;
      let value = req.body[inputKey];
      if (urlFieldKeys.has(inputKey)) value = cleanUrl(value, `${inputKey} URL`);

      if (inputKey === "featured" || inputKey === "active" || inputKey === "isActive") {
        value = toBoolean(value) ? 1 : 0;
      }
      if (inputKey === "priority") value = Number(value || 0);

      updates.push(`${column} = ?`);
      values.push(value);
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided." });
    }

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE team_members SET ${updates.join(", ")} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Team member not found." });
    }

    const [rows] = await pool.query("SELECT * FROM team_members WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapTeamMember(rows[0]) });
  }),
);

app.patch(
  "/api/admin/team/reorder",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Reorder items are required." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.query("UPDATE team_members SET priority = ? WHERE id = ?", [
          Number(item.priority || 0),
          item.id,
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ success: true });
  }),
);

app.delete(
  "/api/admin/team/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM team_members WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Team member not found." });
    }

    return res.json({ success: true });
  }),
);

app.get(
  "/api/reels",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const includeInactive = toBoolean(req.query.includeInactive);
    const featuredOnly = toBoolean(req.query.featured);
    const filters = [];

    if (!includeInactive) filters.push("status = 'published'");
    if (featuredOnly) filters.push("featured = 1");

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(`
      SELECT *
      FROM reels
      ${where}
      ORDER BY featured DESC, order_index ASC, COALESCE(published_at, created_at) DESC
    `);

    res.json({ success: true, data: rows.map(mapReel) });
  }),
);

app.get(
  "/api/admin/reels",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`
      SELECT *
      FROM reels
      ORDER BY display_order ASC, COALESCE(upload_date, created_at) DESC
    `);

    res.json({ success: true, data: rows.map(mapReel) });
  }),
);

app.post(
  "/api/admin/reels",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const reel = req.body || {};
    const title = String(reel.title || "").trim();

    if (!title) {
      return res.status(400).json({ success: false, message: "Reel title is required." });
    }

    const [result] = await pool.query(
      `
        INSERT INTO reels
          (title, description, thumbnailUrl, videoUrl, upload_date, featured, active, category, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        reel.description || null,
        firstUrl(reel, ["thumbnailUrl", "thumbnail"], "Reel thumbnail URL"),
        firstUrl(reel, ["videoUrl", "video_url"], "Reel video URL"),
        reel.uploadDate || reel.upload_date || null,
        toBoolean(reel.featured) ? 1 : 0,
        toBoolean(reel.active, true) ? 1 : 0,
        reel.category || null,
        Number(reel.displayOrder || reel.display_order || 0),
      ],
    );

    const [rows] = await pool.query("SELECT * FROM reels WHERE id = ?", [result.insertId]);
    return res.status(201).json({ success: true, data: mapReel(rows[0]) });
  }),
);

app.put(
  "/api/admin/reels/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const reel = req.body || {};
    const title = String(reel.title || "").trim();

    if (!title) {
      return res.status(400).json({ success: false, message: "Reel title is required." });
    }

    const [result] = await pool.query(
      `
        UPDATE reels
        SET title = ?,
            description = ?,
            thumbnailUrl = ?,
            videoUrl = ?,
            upload_date = ?,
            featured = ?,
            active = ?,
            category = ?,
            display_order = ?
        WHERE id = ?
      `,
      [
        title,
        reel.description || null,
        firstUrl(reel, ["thumbnailUrl", "thumbnail"], "Reel thumbnail URL"),
        firstUrl(reel, ["videoUrl", "video_url"], "Reel video URL"),
        reel.uploadDate || reel.upload_date || null,
        toBoolean(reel.featured) ? 1 : 0,
        toBoolean(reel.active, true) ? 1 : 0,
        reel.category || null,
        Number(reel.displayOrder || reel.display_order || 0),
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Reel not found." });
    }

    const [rows] = await pool.query("SELECT * FROM reels WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapReel(rows[0]) });
  }),
);

app.patch(
  "/api/admin/reels/reorder",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Reorder items are required." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.query("UPDATE reels SET display_order = ? WHERE id = ?", [
          Number(item.displayOrder || item.display_order || 0),
          item.id,
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ success: true });
  }),
);

app.patch(
  "/api/admin/reels/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const allowedFields = {
      title: "title",
      description: "description",
      thumbnailUrl: "thumbnailUrl",
      thumbnail: "thumbnailUrl",
      videoUrl: "videoUrl",
      video_url: "videoUrl",
      uploadDate: "upload_date",
      upload_date: "upload_date",
      featured: "featured",
      active: "active",
      category: "category",
      displayOrder: "display_order",
      display_order: "display_order",
    };

    const updates = [];
    const values = [];

    Object.entries(allowedFields).forEach(([inputKey, column]) => {
      if (!(inputKey in req.body)) return;
      let value = req.body[inputKey];
      if (urlFieldKeys.has(inputKey)) value = cleanUrl(value, `${inputKey} URL`);

      if (inputKey === "featured" || inputKey === "active" || inputKey === "isActive") {
        value = toBoolean(value) ? 1 : 0;
      }
      if (inputKey === "displayOrder" || inputKey === "display_order") value = Number(value || 0);

      updates.push(`${column} = ?`);
      values.push(value);
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided." });
    }

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE reels SET ${updates.join(", ")} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Reel not found." });
    }

    const [rows] = await pool.query("SELECT * FROM reels WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapReel(rows[0]) });
  }),
);

app.delete(
  "/api/admin/reels/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM reels WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Reel not found." });
    }

    return res.json({ success: true });
  }),
);

app.get(
  "/api/testimonials",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const includeInactive = toBoolean(req.query.includeInactive);
    const featuredOnly = toBoolean(req.query.featured);
    const filters = [];

    if (!includeInactive) filters.push("status = 'published'");
    if (featuredOnly) filters.push("featured = 1");

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(`
      SELECT *
      FROM testimonials
      ${where}
      ORDER BY featured DESC, order_index ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapTestimonial) });
  }),
);

app.get(
  "/api/admin/testimonials",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`
      SELECT *
      FROM testimonials
      ORDER BY display_order ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapTestimonial) });
  }),
);

app.post(
  "/api/admin/testimonials",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const testimonial = req.body || {};
    const name = String(testimonial.name || "").trim();
    const quote = String(testimonial.quote || "").trim();

    if (!name || !quote) {
      return res.status(400).json({ success: false, message: "Name and quote are required." });
    }

    const [result] = await pool.query(
      `
        INSERT INTO testimonials
          (name, role, organization, quote, imageUrl, featured, active, rating, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        testimonial.role || null,
        testimonial.organization || null,
        quote,
        firstUrl(testimonial, ["imageUrl", "image"], "Testimonial image URL"),
        toBoolean(testimonial.featured) ? 1 : 0,
        toBoolean(testimonial.active, true) ? 1 : 0,
        testimonial.rating === undefined ? null : Number(testimonial.rating),
        Number(testimonial.displayOrder || testimonial.display_order || 0),
      ],
    );

    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [result.insertId]);
    return res.status(201).json({ success: true, data: mapTestimonial(rows[0]) });
  }),
);

app.put(
  "/api/admin/testimonials/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const testimonial = req.body || {};
    const name = String(testimonial.name || "").trim();
    const quote = String(testimonial.quote || "").trim();

    if (!name || !quote) {
      return res.status(400).json({ success: false, message: "Name and quote are required." });
    }

    const [result] = await pool.query(
      `
        UPDATE testimonials
        SET name = ?,
            role = ?,
            organization = ?,
            quote = ?,
            imageUrl = ?,
            featured = ?,
            active = ?,
            rating = ?,
            display_order = ?
        WHERE id = ?
      `,
      [
        name,
        testimonial.role || null,
        testimonial.organization || null,
        quote,
        firstUrl(testimonial, ["imageUrl", "image"], "Testimonial image URL"),
        toBoolean(testimonial.featured) ? 1 : 0,
        toBoolean(testimonial.active, true) ? 1 : 0,
        testimonial.rating === undefined ? null : Number(testimonial.rating),
        Number(testimonial.displayOrder || testimonial.display_order || 0),
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Testimonial not found." });
    }

    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapTestimonial(rows[0]) });
  }),
);

app.patch(
  "/api/admin/testimonials/reorder",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Reorder items are required." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.query("UPDATE testimonials SET display_order = ? WHERE id = ?", [
          Number(item.displayOrder || item.display_order || 0),
          item.id,
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ success: true });
  }),
);

app.patch(
  "/api/admin/testimonials/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const allowedFields = {
      name: "name",
      role: "role",
      organization: "organization",
      quote: "quote",
      imageUrl: "imageUrl",
      image: "imageUrl",
      featured: "featured",
      active: "active",
      rating: "rating",
      displayOrder: "display_order",
      display_order: "display_order",
    };

    const updates = [];
    const values = [];

    Object.entries(allowedFields).forEach(([inputKey, column]) => {
      if (!(inputKey in req.body)) return;
      let value = req.body[inputKey];
      if (urlFieldKeys.has(inputKey)) value = cleanUrl(value, `${inputKey} URL`);

      if (inputKey === "featured" || inputKey === "active" || inputKey === "isActive") {
        value = toBoolean(value) ? 1 : 0;
      }
      if (inputKey === "displayOrder" || inputKey === "display_order") value = Number(value || 0);
      if (inputKey === "rating") value = value === null || value === "" ? null : Number(value);

      updates.push(`${column} = ?`);
      values.push(value);
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided." });
    }

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE testimonials SET ${updates.join(", ")} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Testimonial not found." });
    }

    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapTestimonial(rows[0]) });
  }),
);

app.delete(
  "/api/admin/testimonials/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM testimonials WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Testimonial not found." });
    }

    return res.json({ success: true });
  }),
);

app.get(
  "/api/careers",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const includeInactive = toBoolean(req.query.includeInactive);
    const featuredOnly = toBoolean(req.query.featured);
    const filters = [];

    if (!includeInactive) filters.push("status = 'published'");
    if (featuredOnly) filters.push("featured = 1");

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(`
      SELECT *
      FROM careers
      ${where}
      ORDER BY featured DESC, order_index ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapCareer) });
  }),
);

app.get(
  "/api/admin/careers",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`
      SELECT *
      FROM careers
      ORDER BY display_order ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapCareer) });
  }),
);

app.post(
  "/api/admin/careers",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const career = req.body || {};
    const title = String(career.title || "").trim();

    if (!title) {
      return res.status(400).json({ success: false, message: "Career title is required." });
    }

    const [result] = await pool.query(
      `
        INSERT INTO careers
          (title, department, type, location, short_description, application_deadline, bannerUrl, category, applyLink, featured, active, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        career.department || null,
        career.employmentType || career.type || null,
        career.location || null,
        career.description || career.shortDescription || career.short_description || null,
        career.applicationDeadline || career.application_deadline || null,
        firstUrl(career, ["bannerUrl"], "Career banner URL"),
        career.category || null,
        firstUrl(career, ["applyLink", "applyUrl", "apply_url"], "Career apply URL"),
        toBoolean(career.featured) ? 1 : 0,
        toBoolean(career.isActive ?? career.active, true) ? 1 : 0,
        Number(career.displayOrder || career.display_order || 0),
      ],
    );

    const [rows] = await pool.query("SELECT * FROM careers WHERE id = ?", [result.insertId]);
    return res.status(201).json({ success: true, data: mapCareer(rows[0]) });
  }),
);

app.put(
  "/api/admin/careers/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const career = req.body || {};
    const title = String(career.title || "").trim();

    if (!title) {
      return res.status(400).json({ success: false, message: "Career title is required." });
    }

    const [result] = await pool.query(
      `
        UPDATE careers
        SET title = ?,
            department = ?,
            type = ?,
            location = ?,
            short_description = ?,
            application_deadline = ?,
            bannerUrl = ?,
            category = ?,
            applyLink = ?,
            featured = ?,
            active = ?,
            display_order = ?
        WHERE id = ?
      `,
      [
        title,
        career.department || null,
        career.employmentType || career.type || null,
        career.location || null,
        career.description || career.shortDescription || career.short_description || null,
        career.applicationDeadline || career.application_deadline || null,
        firstUrl(career, ["bannerUrl"], "Career banner URL"),
        career.category || null,
        firstUrl(career, ["applyLink", "applyUrl", "apply_url"], "Career apply URL"),
        toBoolean(career.featured) ? 1 : 0,
        toBoolean(career.isActive ?? career.active, true) ? 1 : 0,
        Number(career.displayOrder || career.display_order || 0),
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Career not found." });
    }

    const [rows] = await pool.query("SELECT * FROM careers WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapCareer(rows[0]) });
  }),
);

app.patch(
  "/api/admin/careers/reorder",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Reorder items are required." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.query("UPDATE careers SET display_order = ? WHERE id = ?", [
          Number(item.displayOrder || item.display_order || 0),
          item.id,
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ success: true });
  }),
);

app.patch(
  "/api/admin/careers/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const allowedFields = {
      title: "title",
      department: "department",
      type: "type",
      employmentType: "type",
      location: "location",
      description: "short_description",
      shortDescription: "short_description",
      short_description: "short_description",
      applicationDeadline: "application_deadline",
      application_deadline: "application_deadline",
      bannerUrl: "bannerUrl",
      category: "category",
      applyLink: "applyLink",
      applyUrl: "applyLink",
      apply_url: "applyLink",
      featured: "featured",
      isActive: "active",
      active: "active",
      displayOrder: "display_order",
      display_order: "display_order",
    };

    const updates = [];
    const values = [];

    Object.entries(allowedFields).forEach(([inputKey, column]) => {
      if (!(inputKey in req.body)) return;
      let value = req.body[inputKey];
      if (urlFieldKeys.has(inputKey)) value = cleanUrl(value, `${inputKey} URL`);

      if (inputKey === "featured" || inputKey === "active" || inputKey === "isActive") {
        value = toBoolean(value) ? 1 : 0;
      }
      if (inputKey === "displayOrder" || inputKey === "display_order") value = Number(value || 0);

      updates.push(`${column} = ?`);
      values.push(value);
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided." });
    }

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE careers SET ${updates.join(", ")} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Career not found." });
    }

    const [rows] = await pool.query("SELECT * FROM careers WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapCareer(rows[0]) });
  }),
);

app.delete(
  "/api/admin/careers/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM careers WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Career not found." });
    }

    return res.json({ success: true });
  }),
);

app.get(
  "/api/socials",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const includeInactive = toBoolean(req.query.includeInactive);
    const where = includeInactive ? "" : "WHERE is_active = 1";
    const [rows] = await pool.query(`
      SELECT *
      FROM socials
      ${where}
      ORDER BY display_order ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapSocial) });
  }),
);

app.get(
  "/api/admin/socials",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`
      SELECT *
      FROM socials
      ORDER BY display_order ASC, created_at DESC
    `);

    res.json({ success: true, data: rows.map(mapSocial) });
  }),
);

app.post(
  "/api/admin/socials",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const social = req.body || {};
    const platform = String(social.platform || "").trim();

    if (!platform) {
      return res.status(400).json({ success: false, message: "Social platform is required." });
    }

    const [result] = await pool.query(
      `
        INSERT INTO socials
          (platform, handle, url, iconUrl, is_active, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        platform,
        social.handle || null,
        firstUrl(social, ["url"], "Social URL"),
        firstUrl(social, ["iconUrl", "icon"], "Social icon URL"),
        toBoolean(social.isActive ?? social.is_active, true) ? 1 : 0,
        Number(social.displayOrder || social.display_order || 0),
      ],
    );

    const [rows] = await pool.query("SELECT * FROM socials WHERE id = ?", [result.insertId]);
    return res.status(201).json({ success: true, data: mapSocial(rows[0]) });
  }),
);

app.put(
  "/api/admin/socials/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const social = req.body || {};
    const platform = String(social.platform || "").trim();

    if (!platform) {
      return res.status(400).json({ success: false, message: "Social platform is required." });
    }

    const [result] = await pool.query(
      `
        UPDATE socials
        SET platform = ?,
            handle = ?,
            url = ?,
            iconUrl = ?,
            is_active = ?,
            display_order = ?
        WHERE id = ?
      `,
      [
        platform,
        social.handle || null,
        firstUrl(social, ["url"], "Social URL"),
        firstUrl(social, ["iconUrl", "icon"], "Social icon URL"),
        toBoolean(social.isActive ?? social.is_active, true) ? 1 : 0,
        Number(social.displayOrder || social.display_order || 0),
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Social link not found." });
    }

    const [rows] = await pool.query("SELECT * FROM socials WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapSocial(rows[0]) });
  }),
);

app.patch(
  "/api/admin/socials/reorder",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Reorder items are required." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.query("UPDATE socials SET display_order = ? WHERE id = ?", [
          Number(item.displayOrder || item.display_order || 0),
          item.id,
        ]);
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ success: true });
  }),
);

app.patch(
  "/api/admin/socials/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const allowedFields = {
      platform: "platform",
      handle: "handle",
      url: "url",
      iconUrl: "iconUrl",
      icon: "iconUrl",
      isActive: "is_active",
      is_active: "is_active",
      displayOrder: "display_order",
      display_order: "display_order",
    };

    const updates = [];
    const values = [];

    Object.entries(allowedFields).forEach(([inputKey, column]) => {
      if (!(inputKey in req.body)) return;
      let value = req.body[inputKey];
      if (urlFieldKeys.has(inputKey)) value = cleanUrl(value, `${inputKey} URL`);

      if (inputKey === "isActive" || inputKey === "is_active") value = toBoolean(value) ? 1 : 0;
      if (inputKey === "displayOrder" || inputKey === "display_order") value = Number(value || 0);

      updates.push(`${column} = ?`);
      values.push(value);
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided." });
    }

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE socials SET ${updates.join(", ")} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Social link not found." });
    }

    const [rows] = await pool.query("SELECT * FROM socials WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: mapSocial(rows[0]) });
  }),
);

app.delete(
  "/api/admin/socials/:id",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM socials WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Social link not found." });
    }

    return res.json({ success: true });
  }),
);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : "Unexpected server error.",
  });
});

async function validateDatabaseStartup() {
   try {

      const [rows] = await pool.query(
         "SELECT 1 AS status"
      );

      console.log(
         "Database startup check OK",
         rows
      );

      return true;

   } catch (err) {

      console.error(
         "Database startup check failed",
         err
      );

      throw err;

   }
}

async function startServer() {
  try {
    await validateDatabaseStartup();
    await initializeDatabase();
    startDbHeartbeat();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database", error);
    process.exit(1);
  }
}

startServer();
