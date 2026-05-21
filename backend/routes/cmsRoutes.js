const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { pool } = require("../config/db");
const { cmsModules } = require("../config/cmsModules");

const router = express.Router();
const statuses = new Set(["draft", "published", "archived"]);
const socialPlatforms = new Set([
  "instagram",
  "linkedin",
  "youtube",
  "twitter",
  "facebook",
  "website",
  "whatsapp",
  "telegram",
  "discord",
]);
const sortColumns = new Set(["title", "slug", "status", "order_index", "created_at", "updated_at"]);
const socialSortColumns = new Set(["platform", "url", "status", "order_index", "created_at", "updated_at"]);
const teamSortColumns = new Set(["full_name", "designation", "department", "status", "order_index", "created_at", "updated_at"]);
const mentorSortColumns = new Set(["full_name", "designation", "organization", "specialization", "featured", "status", "order_index", "created_at", "updated_at"]);
const initiativeSortColumns = new Set(["title", "category", "visibility", "featured", "status", "order_index", "start_date", "end_date", "created_at", "updated_at"]);
const initiativeCategories = new Set(["awareness", "camp", "research", "education", "advocacy", "community", "conference", "other"]);
const initiativeVisibilities = new Set(["public", "volunteers", "internal"]);
const reelSortColumns = new Set(["title", "platform", "featured", "status", "order_index", "published_at", "created_at", "updated_at"]);
const reelPlatforms = new Set(["instagram", "youtube", "external"]);
const testimonialSortColumns = new Set(["full_name", "category", "organization", "rating", "featured", "status", "order_index", "created_at", "updated_at"]);
const testimonialCategories = new Set(["volunteer", "mentor", "ngo", "partner", "beneficiary", "speaker", "other"]);
const careerSortColumns = new Set(["title", "department", "role_type", "visibility", "featured", "status", "order_index", "application_deadline", "created_at", "updated_at"]);
const careerRoleTypes = new Set(["volunteer", "internship", "leadership", "research", "operations", "design", "it", "community", "other"]);
const careerVisibilities = new Set(["public", "members_only", "internal"]);
const idTemplateSortColumns = new Set(["name", "template_type", "status", "is_default", "created_at", "updated_at"]);
const certificateTemplateSortColumns = new Set(["name", "certificate_type", "status", "is_default", "created_at", "updated_at"]);
const certificateTypes = new Set(["membership", "event", "participation", "leadership", "recognition", "volunteer_hours", "other"]);
const emailTemplateSortColumns = new Set(["name", "email_type", "subject", "status", "is_default", "created_at", "updated_at"]);
const emailTypes = new Set([
  "membership_verified",
  "membership_rejected",
  "membership_under_review",
  "certificate_issued",
  "certificate_revoked",
  "camp_approved",
  "camp_rejected",
  "ngo_verified",
  "announcement",
  "event_created",
]);

function cleanString(value, maxLength = 1000) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanLongText(value, maxLength = 10000) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maxLength);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

function validateModule(req, res, next) {
  const config = cmsModules[req.params.module];
  if (!config) return res.status(404).json({ success: false, message: "CMS module not found." });
  req.cmsModule = config;
  return next();
}

function validateImageUrl(value) {
  const imageUrl = cleanString(value, 2000);
  if (!imageUrl) return "";
  try {
    const parsed = new URL(imageUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return imageUrl;
  } catch {
    return "";
  }
}

function parseTags(value) {
  if (Array.isArray(value)) return value.map((item) => cleanString(item, 80)).filter(Boolean);
  return cleanString(value, 1000)
    .split(",")
    .map((item) => cleanString(item, 80))
    .filter(Boolean);
}

function mapEntry(row) {
  let tags = [];
  let metadata = {};
  try {
    tags = row.tags_json ? JSON.parse(row.tags_json) : [];
  } catch {
    tags = [];
  }
  try {
    metadata = row.metadata_json ? JSON.parse(row.metadata_json) : {};
  } catch {
    metadata = {};
  }

  return {
    id: row.id,
    module: row.module,
    title: row.title,
    slug: row.slug,
    description: row.description,
    image_url: row.image_url,
    imageUrl: row.image_url,
    status: row.status,
    order_index: row.order_index,
    orderIndex: row.order_index,
    tags,
    metadata,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function isValidPublicUrl(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function normalizeSocial(input = {}) {
  const platform = cleanString(input.platform, 40).toLowerCase();
  const status = statuses.has(input.status) ? input.status : "published";
  const url = cleanString(input.url, 2000);
  const icon = cleanString(input.icon || platform, 80).toLowerCase();

  const errors = {};
  if (!socialPlatforms.has(platform)) errors.platform = "Choose a supported platform.";
  if (!url || !isValidPublicUrl(url)) errors.url = "Enter a valid public http(s) URL.";
  if (!icon) errors.icon = "Icon is required.";

  return {
    data: {
      platform,
      url,
      icon,
      status,
      orderIndex: Number(input.orderIndex ?? input.order_index ?? 0),
    },
    errors,
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
    order_index: row.order_index,
    orderIndex: row.order_index,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function cleanOptionalUrl(value, fieldLabel) {
  const url = cleanString(value, 2000);
  if (!url) return null;
  if (!isValidPublicUrl(url)) {
    const error = new Error(`${fieldLabel} must be a valid public http(s) URL.`);
    error.statusCode = 400;
    throw error;
  }
  return url;
}

function isValidOptionalEmail(value) {
  const email = cleanString(value, 180);
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeTeamMember(input = {}) {
  const fullName = cleanString(input.fullName || input.full_name || input.name, 180);
  const email = cleanString(input.email, 180).toLowerCase();
  const status = statuses.has(input.status) ? input.status : "published";
  const errors = {};

  if (!fullName) errors.fullName = "Full name is required.";
  if (email && !isValidOptionalEmail(email)) errors.email = "Enter a valid email address.";

  return {
    data: {
      fullName,
      designation: cleanString(input.designation, 180) || null,
      department: cleanString(input.department, 160) || null,
      bio: cleanString(input.bio, 5000) || null,
      imageUrl: cleanOptionalUrl(input.imageUrl || input.image_url, "Image URL"),
      linkedinUrl: cleanOptionalUrl(input.linkedinUrl || input.linkedin_url, "LinkedIn URL"),
      instagramUrl: cleanOptionalUrl(input.instagramUrl || input.instagram_url, "Instagram URL"),
      email: email || null,
      status,
      orderIndex: Number(input.orderIndex ?? input.order_index ?? 0),
    },
    errors,
  };
}

function mapTeamMember(row) {
  const fullName = row.full_name || row.name;
  const imageUrl = row.image_url || row.imageUrl || row.image;
  const linkedinUrl = row.linkedin_url || row.linkedin;
  const instagramUrl = row.instagram_url || row.instagram;

  return {
    id: row.id,
    full_name: fullName,
    fullName,
    name: fullName,
    designation: row.designation,
    department: row.department,
    bio: row.bio,
    image_url: imageUrl,
    imageUrl,
    image: imageUrl,
    linkedin_url: linkedinUrl,
    linkedinUrl,
    linkedin: linkedinUrl,
    instagram_url: instagramUrl,
    instagramUrl,
    instagram: instagramUrl,
    email: row.email,
    status: row.status,
    order_index: row.order_index,
    orderIndex: row.order_index,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function normalizeMentor(input = {}) {
  const fullName = cleanString(input.fullName || input.full_name || input.name, 180);
  const email = cleanString(input.email, 180).toLowerCase();
  const status = statuses.has(input.status) ? input.status : "published";
  const errors = {};

  if (!fullName) errors.fullName = "Full name is required.";
  if (email && !isValidOptionalEmail(email)) errors.email = "Enter a valid email address.";

  return {
    data: {
      fullName,
      designation: cleanString(input.designation, 180) || null,
      organization: cleanString(input.organization, 180) || null,
      specialization: cleanString(input.specialization, 180) || null,
      bio: cleanString(input.bio, 5000) || null,
      imageUrl: cleanOptionalUrl(input.imageUrl || input.image_url, "Image URL"),
      linkedinUrl: cleanOptionalUrl(input.linkedinUrl || input.linkedin_url, "LinkedIn URL"),
      instagramUrl: cleanOptionalUrl(input.instagramUrl || input.instagram_url, "Instagram URL"),
      email: email || null,
      featured: Boolean(input.featured),
      status,
      orderIndex: Number(input.orderIndex ?? input.order_index ?? 0),
    },
    errors,
  };
}

function mapMentor(row) {
  const fullName = row.full_name || row.name;
  const imageUrl = row.image_url || row.imageUrl || row.image;
  const linkedinUrl = row.linkedin_url || row.linkedin;
  const instagramUrl = row.instagram_url || row.instagram;
  const specialization = row.specialization || row.category;

  return {
    id: row.id,
    full_name: fullName,
    fullName,
    name: fullName,
    designation: row.designation,
    organization: row.organization,
    specialization,
    category: specialization,
    bio: row.bio,
    image_url: imageUrl,
    imageUrl,
    image: imageUrl,
    linkedin_url: linkedinUrl,
    linkedinUrl,
    linkedin: linkedinUrl,
    instagram_url: instagramUrl,
    instagramUrl,
    instagram: instagramUrl,
    email: row.email,
    status: row.status,
    featured: Boolean(row.featured),
    order_index: row.order_index,
    orderIndex: row.order_index,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function normalizeInitiative(input = {}) {
  const title = cleanString(input.title, 180);
  const category = initiativeCategories.has(input.category) ? input.category : "other";
  const visibility = initiativeVisibilities.has(input.visibility) ? input.visibility : "public";
  const status = statuses.has(input.status) ? input.status : "published";
  const slug = slugify(input.slug || title);
  const errors = {};

  if (!title) errors.title = "Title is required.";
  if (!slug) errors.slug = "Slug is required.";

  return {
    data: {
      title,
      slug,
      category,
      shortDescription: cleanString(input.shortDescription || input.short_description, 1200) || null,
      description: cleanString(input.description, 5000) || null,
      imageUrl: cleanOptionalUrl(input.imageUrl || input.image_url, "Image URL"),
      bannerUrl: cleanOptionalUrl(input.bannerUrl || input.banner_url, "Banner URL"),
      status,
      featured: Boolean(input.featured),
      orderIndex: Number(input.orderIndex ?? input.order_index ?? 0),
      startDate: cleanString(input.startDate || input.start_date, 20) || null,
      endDate: cleanString(input.endDate || input.end_date, 20) || null,
      visibility,
    },
    errors,
  };
}

function mapInitiative(row) {
  const imageUrl = row.image_url || row.imageUrl || row.image;
  const bannerUrl = row.banner_url || row.bannerUrl;
  const shortDescription = row.short_description || row.subtitle;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    short_description: shortDescription,
    shortDescription,
    subtitle: shortDescription,
    description: row.description,
    image_url: imageUrl,
    imageUrl,
    image: imageUrl,
    banner_url: bannerUrl,
    bannerUrl,
    status: row.status,
    featured: Boolean(row.featured),
    order_index: row.order_index,
    orderIndex: row.order_index,
    start_date: row.start_date,
    startDate: row.start_date,
    end_date: row.end_date,
    endDate: row.end_date,
    visibility: row.visibility,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function normalizeReel(input = {}) {
  const title = cleanString(input.title, 180);
  const platform = reelPlatforms.has(input.platform) ? input.platform : "external";
  const status = statuses.has(input.status) ? input.status : "published";
  const slug = slugify(input.slug || title);
  const errors = {};

  if (!title) errors.title = "Title is required.";
  if (!slug) errors.slug = "Slug is required.";

  const videoUrl = cleanOptionalUrl(input.videoUrl || input.video_url, "Video URL");
  if (!videoUrl) errors.videoUrl = "Video URL is required.";

  return {
    data: {
      title,
      slug,
      platform,
      videoUrl,
      thumbnailUrl: cleanOptionalUrl(input.thumbnailUrl || input.thumbnail_url || input.thumbnail, "Thumbnail URL"),
      caption: cleanString(input.caption, 1200) || null,
      description: cleanString(input.description, 5000) || null,
      initiativeId: input.initiativeId || input.initiative_id || null,
      status,
      featured: Boolean(input.featured),
      orderIndex: Number(input.orderIndex ?? input.order_index ?? 0),
      publishedAt: cleanString(input.publishedAt || input.published_at || input.publishDate, 30) || null,
    },
    errors,
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
    video_url: videoUrl,
    videoUrl,
    thumbnail_url: thumbnailUrl,
    thumbnailUrl,
    thumbnail: thumbnailUrl,
    caption: row.caption,
    description: row.description,
    initiative_id: row.initiative_id,
    initiativeId: row.initiative_id,
    status: row.status,
    featured: Boolean(row.featured),
    order_index: row.order_index,
    orderIndex: row.order_index,
    published_at: publishedAt,
    publishedAt,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function normalizeTestimonial(input = {}) {
  const fullName = cleanString(input.fullName || input.full_name || input.name, 180);
  const testimonial = cleanString(input.testimonial || input.quote, 5000);
  const category = testimonialCategories.has(input.category) ? input.category : "other";
  const status = statuses.has(input.status) ? input.status : "published";
  const rating = Math.min(Math.max(Number(input.rating || 5), 1), 5);
  const errors = {};

  if (!fullName) errors.fullName = "Full name is required.";
  if (!testimonial) errors.testimonial = "Testimonial text is required.";

  return {
    data: {
      fullName,
      designation: cleanString(input.designation || input.role, 180) || null,
      organization: cleanString(input.organization, 180) || null,
      testimonial,
      imageUrl: cleanOptionalUrl(input.imageUrl || input.image_url || input.image, "Image URL"),
      rating,
      category,
      status,
      featured: Boolean(input.featured),
      orderIndex: Number(input.orderIndex ?? input.order_index ?? 0),
    },
    errors,
  };
}

function mapTestimonial(row) {
  const fullName = row.full_name || row.name;
  const designation = row.designation || row.role;
  const testimonial = row.testimonial || row.quote;
  const imageUrl = row.image_url || row.imageUrl || row.image;

  return {
    id: row.id,
    full_name: fullName,
    fullName,
    name: fullName,
    designation,
    role: designation,
    organization: row.organization,
    testimonial,
    quote: testimonial,
    image_url: imageUrl,
    imageUrl,
    image: imageUrl,
    rating: row.rating,
    category: row.category,
    status: row.status,
    featured: Boolean(row.featured),
    order_index: row.order_index,
    orderIndex: row.order_index,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function normalizeCareer(input = {}) {
  const title = cleanString(input.title, 180);
  const slug = slugify(input.slug || title);
  const roleType = careerRoleTypes.has(input.roleType || input.role_type) ? input.roleType || input.role_type : "other";
  const visibility = careerVisibilities.has(input.visibility) ? input.visibility : "public";
  const status = statuses.has(input.status) ? input.status : "published";
  const errors = {};

  if (!title) errors.title = "Title is required.";
  if (!slug) errors.slug = "Slug is required.";

  return {
    data: {
      title,
      slug,
      department: cleanString(input.department, 160) || null,
      roleType,
      location: cleanString(input.location, 180) || null,
      description: cleanString(input.description, 5000) || null,
      requirements: cleanString(input.requirements, 5000) || null,
      responsibilities: cleanString(input.responsibilities, 5000) || null,
      imageUrl: cleanOptionalUrl(input.imageUrl || input.image_url || input.image, "Image URL"),
      status,
      featured: Boolean(input.featured),
      orderIndex: Number(input.orderIndex ?? input.order_index ?? 0),
      visibility,
      applicationDeadline: cleanString(input.applicationDeadline || input.application_deadline, 20) || null,
    },
    errors,
  };
}

function mapCareer(row) {
  const roleType = row.role_type || row.type || row.employmentType;
  const imageUrl = row.image_url || row.bannerUrl || row.image;
  const description = row.description || row.short_description;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    department: row.department,
    role_type: roleType,
    roleType,
    type: roleType,
    employmentType: roleType,
    location: row.location,
    description,
    requirements: row.requirements,
    responsibilities: row.responsibilities,
    image_url: imageUrl,
    imageUrl,
    image: imageUrl,
    status: row.status,
    featured: Boolean(row.featured),
    order_index: row.order_index,
    orderIndex: row.order_index,
    visibility: row.visibility,
    application_deadline: row.application_deadline,
    applicationDeadline: row.application_deadline,
    application_form_url: row.application_form_url || row.applyLink || row.apply_url,
    applicationFormUrl: row.application_form_url || row.applyLink || row.apply_url,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function normalizeEmailTemplate(input = {}) {
  const name = cleanString(input.name || input.title, 180);
  const emailType = cleanString(input.emailType || input.email_type, 80);
  const subject = cleanString(input.subject, 255);
  const bodyTemplate = cleanLongText(input.bodyTemplate || input.body_template, 10000);
  const status = statuses.has(input.status) ? input.status : "draft";
  const errors = {};

  if (!name) errors.name = "Template name is required.";
  if (!emailTypes.has(emailType)) errors.emailType = "Choose a supported email type.";
  if (!subject) errors.subject = "Subject is required.";
  if (!bodyTemplate) errors.bodyTemplate = "Email body is required.";

  return {
    data: {
      name,
      emailType,
      subject,
      bodyTemplate,
      status,
      isDefault: Boolean(input.isDefault ?? input.is_default),
    },
    errors,
  };
}

function mapEmailTemplate(row) {
  return {
    id: row.id,
    name: row.name,
    title: row.name,
    email_type: row.email_type,
    emailType: row.email_type,
    subject: row.subject,
    body_template: row.body_template,
    bodyTemplate: row.body_template,
    status: row.status,
    is_default: Boolean(row.is_default),
    isDefault: Boolean(row.is_default),
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function normalizeIdTemplate(input = {}) {
  const name = cleanString(input.name || input.title, 180);
  const status = statuses.has(input.status) ? input.status : "draft";
  const fieldConfigInput = input.fieldConfig ?? input.field_config ?? null;
  let fieldConfig = null;
  const errors = {};

  if (!name) errors.name = "Template name is required.";
  if (fieldConfigInput) {
    try {
      fieldConfig = typeof fieldConfigInput === "string" ? JSON.parse(fieldConfigInput) : fieldConfigInput;
      if (!fieldConfig || typeof fieldConfig !== "object" || Array.isArray(fieldConfig)) {
        fieldConfig = null;
        errors.fieldConfig = "Field config must be a JSON object.";
      }
    } catch {
      errors.fieldConfig = "Field config must be valid JSON.";
    }
  }

  return {
    data: {
      name,
      templateType: cleanString(input.templateType || input.template_type, 80) || "membership",
      frontBackgroundUrl: cleanOptionalUrl(input.frontBackgroundUrl || input.front_background_url, "Front background URL"),
      backBackgroundUrl: cleanOptionalUrl(input.backBackgroundUrl || input.back_background_url, "Back background URL"),
      logoUrl: cleanOptionalUrl(input.logoUrl || input.logo_url, "Logo URL"),
      headerText: cleanString(input.headerText || input.header_text, 220) || null,
      footerText: cleanString(input.footerText || input.footer_text, 500) || null,
      fieldConfig,
      status,
      isDefault: Boolean(input.isDefault ?? input.is_default),
    },
    errors,
  };
}

function mapIdTemplate(row) {
  let fieldConfig = row.field_config || null;
  if (typeof fieldConfig === "string") {
    try {
      fieldConfig = JSON.parse(fieldConfig || "{}");
    } catch {
      fieldConfig = null;
    }
  }
  return {
    id: row.id,
    name: row.name,
    title: row.name,
    template_type: row.template_type,
    templateType: row.template_type,
    front_background_url: row.front_background_url,
    frontBackgroundUrl: row.front_background_url,
    back_background_url: row.back_background_url,
    backBackgroundUrl: row.back_background_url,
    logo_url: row.logo_url,
    logoUrl: row.logo_url,
    header_text: row.header_text,
    headerText: row.header_text,
    footer_text: row.footer_text,
    footerText: row.footer_text,
    field_config: fieldConfig,
    fieldConfig,
    status: row.status,
    is_default: Boolean(row.is_default),
    isDefault: Boolean(row.is_default),
    order_index: row.is_default ? 0 : 1,
    orderIndex: row.is_default ? 0 : 1,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function normalizeCertificateTemplate(input = {}) {
  const name = cleanString(input.name || input.title, 180);
  const certificateType = certificateTypes.has(input.certificateType || input.certificate_type) ? input.certificateType || input.certificate_type : "other";
  const status = statuses.has(input.status) ? input.status : "draft";
  const fieldConfigInput = input.fieldConfig ?? input.field_config ?? null;
  let fieldConfig = null;
  const errors = {};
  if (!name) errors.name = "Template name is required.";
  if (fieldConfigInput) {
    try {
      fieldConfig = typeof fieldConfigInput === "string" ? JSON.parse(fieldConfigInput) : fieldConfigInput;
      if (!fieldConfig || typeof fieldConfig !== "object" || Array.isArray(fieldConfig)) {
        fieldConfig = null;
        errors.fieldConfig = "Field config must be a JSON object.";
      }
    } catch {
      errors.fieldConfig = "Field config must be valid JSON.";
    }
  }

  return {
    data: {
      name,
      certificateType,
      backgroundUrl: cleanOptionalUrl(input.backgroundUrl || input.background_url, "Background URL"),
      logoUrl: cleanOptionalUrl(input.logoUrl || input.logo_url, "Logo URL"),
      headerText: cleanString(input.headerText || input.header_text, 220) || null,
      bodyTemplate: cleanString(input.bodyTemplate || input.body_template, 5000) || null,
      footerText: cleanString(input.footerText || input.footer_text, 500) || null,
      signatureName: cleanString(input.signatureName || input.signature_name, 180) || null,
      signatureDesignation: cleanString(input.signatureDesignation || input.signature_designation, 180) || null,
      fieldConfig,
      status,
      isDefault: Boolean(input.isDefault ?? input.is_default),
    },
    errors,
  };
}

function mapCertificateTemplate(row) {
  let fieldConfig = row.field_config || null;
  if (typeof fieldConfig === "string") {
    try {
      fieldConfig = JSON.parse(fieldConfig || "{}");
    } catch {
      fieldConfig = null;
    }
  }
  return {
    id: row.id,
    name: row.name,
    title: row.name,
    certificate_type: row.certificate_type,
    certificateType: row.certificate_type,
    background_url: row.background_url,
    backgroundUrl: row.background_url,
    logo_url: row.logo_url,
    logoUrl: row.logo_url,
    header_text: row.header_text,
    headerText: row.header_text,
    body_template: row.body_template,
    bodyTemplate: row.body_template,
    footer_text: row.footer_text,
    footerText: row.footer_text,
    signature_name: row.signature_name,
    signatureName: row.signature_name,
    signature_designation: row.signature_designation,
    signatureDesignation: row.signature_designation,
    field_config: fieldConfig,
    fieldConfig,
    status: row.status,
    is_default: Boolean(row.is_default),
    isDefault: Boolean(row.is_default),
    order_index: row.is_default ? 0 : 1,
    orderIndex: row.is_default ? 0 : 1,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

async function logAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'cms_entry', ?, ?)
    `,
    [req.user.id, action, entityId, JSON.stringify(metadata)],
  );
}

async function logSocialAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'social_link', ?, ?)
    `,
    [req.user.id, `cms.social-links.${action}`, entityId, JSON.stringify(metadata)],
  );
}

async function logTeamAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'team_member', ?, ?)
    `,
    [req.user.id, `cms.team.${action}`, entityId, JSON.stringify(metadata)],
  );
}

async function logMentorAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'mentor', ?, ?)
    `,
    [req.user.id, `cms.mentors.${action}`, entityId, JSON.stringify(metadata)],
  );
}

async function logInitiativeAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'initiative', ?, ?)
    `,
    [req.user.id, `cms.initiatives.${action}`, entityId, JSON.stringify(metadata)],
  );
}

async function logReelAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'reel', ?, ?)
    `,
    [req.user.id, `cms.reels.${action}`, entityId, JSON.stringify(metadata)],
  );
}

async function logTestimonialAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'testimonial', ?, ?)
    `,
    [req.user.id, `cms.testimonials.${action}`, entityId, JSON.stringify(metadata)],
  );
}

async function logCareerAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'career', ?, ?)
    `,
    [req.user.id, `cms.careers.${action}`, entityId, JSON.stringify(metadata)],
  );
}

async function logIdTemplateAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'id_card_template', ?, ?)
    `,
    [req.user.id, `cms.id-templates.${action}`, entityId, JSON.stringify(metadata)],
  );
}

async function logCertificateTemplateAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    "INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata_json) VALUES (?, ?, 'certificate_template', ?, ?)",
    [req.user.id, `cms.certificate-templates.${action}`, entityId, JSON.stringify(metadata)],
  );
}

async function logEmailTemplateAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    "INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata_json) VALUES (?, ?, 'email_template', ?, ?)",
    [req.user.id, `cms.email-templates.${action}`, entityId, JSON.stringify(metadata)],
  );
}

router.get("/modules", (_req, res) => {
  res.json({
    success: true,
    data: Object.entries(cmsModules).map(([key, config]) => ({ key, ...config })),
  });
});

router.get(
  "/email-templates",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const sort = emailTemplateSortColumns.has(req.query.sort) ? req.query.sort : "updated_at";
    const direction = String(req.query.direction || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }
    if (search) {
      filters.push("(name LIKE ? OR email_type LIKE ? OR subject LIKE ? OR body_template LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM email_templates ${where}`, values);
    const [rows] = await pool.query(
      `SELECT * FROM email_templates ${where} ORDER BY ${sort} ${direction}, updated_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );
    res.json({ success: true, data: rows.map(mapEmailTemplate), meta: { page, limit, total: countRow.total } });
  }),
);

async function saveEmailTemplate(req, res, id = null) {
  const { data, errors } = normalizeEmailTemplate(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
  }

  let templateId = id;
  if (id) {
    const [result] = await pool.query(
      `
        UPDATE email_templates
        SET name = ?,
            email_type = ?,
            subject = ?,
            body_template = ?,
            status = ?,
            is_default = ?
        WHERE id = ?
      `,
      [data.name, data.emailType, data.subject, data.bodyTemplate, data.status, data.isDefault ? 1 : 0, id],
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Email template not found." });
  } else {
    const [result] = await pool.query(
      `
        INSERT INTO email_templates
          (name, email_type, subject, body_template, status, is_default)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [data.name, data.emailType, data.subject, data.bodyTemplate, data.status, data.isDefault ? 1 : 0],
    );
    templateId = result.insertId;
  }
  if (data.isDefault) {
    await pool.query("UPDATE email_templates SET is_default = 0 WHERE email_type = ? AND id <> ?", [data.emailType, templateId]);
  }

  await logEmailTemplateAudit(req, id ? "edit" : "create", templateId, { emailType: data.emailType, status: data.status });
  if (data.status === "published") await logEmailTemplateAudit(req, "publish", templateId);
  const [rows] = await pool.query("SELECT * FROM email_templates WHERE id = ?", [templateId]);
  return res.status(id ? 200 : 201).json({ success: true, data: mapEmailTemplate(rows[0]) });
}

router.post("/email-templates", asyncHandler((req, res) => saveEmailTemplate(req, res)));
router.put("/email-templates/:id", asyncHandler((req, res) => saveEmailTemplate(req, res, req.params.id)));

router.patch(
  "/email-templates/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid template status." });
    const [result] = await pool.query("UPDATE email_templates SET status = ? WHERE id = ?", [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Email template not found." });
    await logEmailTemplateAudit(req, status === "published" ? "publish" : status === "archived" ? "archive" : status, req.params.id);
    const [rows] = await pool.query("SELECT * FROM email_templates WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapEmailTemplate(rows[0]) });
  }),
);

router.patch(
  "/email-templates/:id/default",
  asyncHandler(async (req, res) => {
    const [templates] = await pool.query("SELECT email_type FROM email_templates WHERE id = ? LIMIT 1", [req.params.id]);
    if (templates.length === 0) return res.status(404).json({ success: false, message: "Email template not found." });
    await pool.query("UPDATE email_templates SET is_default = 0 WHERE email_type = ?", [templates[0].email_type]);
    await pool.query("UPDATE email_templates SET is_default = 1, status = 'published' WHERE id = ?", [req.params.id]);
    await logEmailTemplateAudit(req, "default", req.params.id, { emailType: templates[0].email_type });
    const [rows] = await pool.query("SELECT * FROM email_templates WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapEmailTemplate(rows[0]) });
  }),
);

router.delete(
  "/email-templates/:id",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("UPDATE email_templates SET status = 'archived' WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Email template not found." });
    await logEmailTemplateAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/social-links",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const sort = socialSortColumns.has(req.query.sort) ? req.query.sort : "order_index";
    const direction = String(req.query.direction || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }

    if (search) {
      filters.push("(platform LIKE ? OR url LIKE ? OR icon LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM social_links ${where}`, values);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM social_links
        ${where}
        ORDER BY ${sort} ${direction}, updated_at DESC
        LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    );

    res.json({ success: true, data: rows.map(mapSocialLink), meta: { page, limit, total: countRow.total } });
  }),
);

router.post(
  "/social-links",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeSocial(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const [result] = await pool.query(
      `
        INSERT INTO social_links
          (platform, url, icon, status, order_index)
        VALUES (?, ?, ?, ?, ?)
      `,
      [data.platform, data.url, data.icon, data.status, data.orderIndex],
    );

    await logSocialAudit(req, "create", result.insertId, { platform: data.platform, status: data.status });
    if (data.status === "published") await logSocialAudit(req, "publish", result.insertId, { platform: data.platform });
    const [rows] = await pool.query("SELECT * FROM social_links WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: mapSocialLink(rows[0]) });
  }),
);

router.put(
  "/social-links/:id",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeSocial(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const [result] = await pool.query(
      `
        UPDATE social_links
        SET platform = ?,
            url = ?,
            icon = ?,
            status = ?,
            order_index = ?
        WHERE id = ?
      `,
      [data.platform, data.url, data.icon, data.status, data.orderIndex, req.params.id],
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Social link not found." });
    await logSocialAudit(req, "edit", req.params.id, { platform: data.platform, status: data.status });
    if (data.status === "published") await logSocialAudit(req, "publish", req.params.id, { platform: data.platform });
    const [rows] = await pool.query("SELECT * FROM social_links WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapSocialLink(rows[0]) });
  }),
);

router.patch(
  "/social-links/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid social link status." });

    const [result] = await pool.query("UPDATE social_links SET status = ? WHERE id = ?", [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Social link not found." });

    await logSocialAudit(req, status === "published" ? "publish" : status === "archived" ? "archive" : status, req.params.id);
    const [rows] = await pool.query("SELECT * FROM social_links WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapSocialLink(rows[0]) });
  }),
);

router.delete(
  "/social-links/:id",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM social_links WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Social link not found." });

    await logSocialAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/team",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const sort = teamSortColumns.has(req.query.sort) ? req.query.sort : "order_index";
    const direction = String(req.query.direction || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }

    if (search) {
      filters.push("(full_name LIKE ? OR name LIKE ? OR department LIKE ? OR designation LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM team_members ${where}`, values);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM team_members
        ${where}
        ORDER BY department ASC, ${sort} ${direction}, created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    );

    res.json({ success: true, data: rows.map(mapTeamMember), meta: { page, limit, total: countRow.total } });
  }),
);

router.post(
  "/team",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeTeamMember(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const [result] = await pool.query(
      `
        INSERT INTO team_members
          (full_name, name, designation, department, bio, image_url, imageUrl, linkedin_url, linkedin, instagram_url, instagram, email, status, order_index, priority, active, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.fullName,
        data.fullName,
        data.designation,
        data.department,
        data.bio,
        data.imageUrl,
        data.imageUrl,
        data.linkedinUrl,
        data.linkedinUrl,
        data.instagramUrl,
        data.instagramUrl,
        data.email,
        data.status,
        data.orderIndex,
        data.orderIndex,
        data.status === "archived" ? 0 : 1,
        data.status === "archived" ? 0 : 1,
      ],
    );

    await logTeamAudit(req, "create", result.insertId, { status: data.status });
    if (data.status === "published") await logTeamAudit(req, "publish", result.insertId);
    const [rows] = await pool.query("SELECT * FROM team_members WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: mapTeamMember(rows[0]) });
  }),
);

router.put(
  "/team/:id",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeTeamMember(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const [result] = await pool.query(
      `
        UPDATE team_members
        SET full_name = ?,
            name = ?,
            designation = ?,
            department = ?,
            bio = ?,
            image_url = ?,
            imageUrl = ?,
            linkedin_url = ?,
            linkedin = ?,
            instagram_url = ?,
            instagram = ?,
            email = ?,
            status = ?,
            order_index = ?,
            priority = ?,
            active = ?,
            isActive = ?
        WHERE id = ?
      `,
      [
        data.fullName,
        data.fullName,
        data.designation,
        data.department,
        data.bio,
        data.imageUrl,
        data.imageUrl,
        data.linkedinUrl,
        data.linkedinUrl,
        data.instagramUrl,
        data.instagramUrl,
        data.email,
        data.status,
        data.orderIndex,
        data.orderIndex,
        data.status === "archived" ? 0 : 1,
        data.status === "archived" ? 0 : 1,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Team member not found." });
    await logTeamAudit(req, "edit", req.params.id, { status: data.status });
    if (data.status === "published") await logTeamAudit(req, "publish", req.params.id);
    const [rows] = await pool.query("SELECT * FROM team_members WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapTeamMember(rows[0]) });
  }),
);

router.patch(
  "/team/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid team member status." });

    const [result] = await pool.query("UPDATE team_members SET status = ?, active = ?, isActive = ? WHERE id = ?", [
      status,
      status === "archived" ? 0 : 1,
      status === "archived" ? 0 : 1,
      req.params.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Team member not found." });

    await logTeamAudit(req, status === "published" ? "publish" : status === "archived" ? "archive" : status, req.params.id);
    const [rows] = await pool.query("SELECT * FROM team_members WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapTeamMember(rows[0]) });
  }),
);

router.delete(
  "/team/:id",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM team_members WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Team member not found." });

    await logTeamAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/mentors",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const organization = cleanString(req.query.organization, 180);
    const featured = cleanString(req.query.featured, 20);
    const sort = mentorSortColumns.has(req.query.sort) ? req.query.sort : "order_index";
    const direction = String(req.query.direction || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }

    if (featured && featured !== "all") {
      filters.push("featured = ?");
      values.push(featured === "true" || featured === "featured" ? 1 : 0);
    }

    if (organization && organization !== "all") {
      filters.push("organization = ?");
      values.push(organization);
    }

    if (search) {
      filters.push("(full_name LIKE ? OR name LIKE ? OR organization LIKE ? OR specialization LIKE ? OR category LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like, like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM mentors ${where}`, values);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM mentors
        ${where}
        ORDER BY featured DESC, ${sort} ${direction}, created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    );

    res.json({ success: true, data: rows.map(mapMentor), meta: { page, limit, total: countRow.total } });
  }),
);

router.post(
  "/mentors",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeMentor(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const [result] = await pool.query(
      `
        INSERT INTO mentors
          (full_name, name, designation, organization, specialization, category, bio, image_url, imageUrl, linkedin_url, linkedin, instagram_url, instagram, email, status, featured, order_index, display_order, visible, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.fullName,
        data.fullName,
        data.designation,
        data.organization,
        data.specialization,
        data.specialization,
        data.bio,
        data.imageUrl,
        data.imageUrl,
        data.linkedinUrl,
        data.linkedinUrl,
        data.instagramUrl,
        data.instagramUrl,
        data.email,
        data.status,
        data.featured ? 1 : 0,
        data.orderIndex,
        data.orderIndex,
        data.status === "archived" ? 0 : 1,
        data.status === "archived" ? 0 : 1,
      ],
    );

    await logMentorAudit(req, "create", result.insertId, { status: data.status, featured: data.featured });
    if (data.status === "published") await logMentorAudit(req, "publish", result.insertId);
    if (data.featured) await logMentorAudit(req, "feature", result.insertId);
    const [rows] = await pool.query("SELECT * FROM mentors WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: mapMentor(rows[0]) });
  }),
);

router.put(
  "/mentors/:id",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeMentor(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const [result] = await pool.query(
      `
        UPDATE mentors
        SET full_name = ?,
            name = ?,
            designation = ?,
            organization = ?,
            specialization = ?,
            category = ?,
            bio = ?,
            image_url = ?,
            imageUrl = ?,
            linkedin_url = ?,
            linkedin = ?,
            instagram_url = ?,
            instagram = ?,
            email = ?,
            status = ?,
            featured = ?,
            order_index = ?,
            display_order = ?,
            visible = ?,
            isActive = ?
        WHERE id = ?
      `,
      [
        data.fullName,
        data.fullName,
        data.designation,
        data.organization,
        data.specialization,
        data.specialization,
        data.bio,
        data.imageUrl,
        data.imageUrl,
        data.linkedinUrl,
        data.linkedinUrl,
        data.instagramUrl,
        data.instagramUrl,
        data.email,
        data.status,
        data.featured ? 1 : 0,
        data.orderIndex,
        data.orderIndex,
        data.status === "archived" ? 0 : 1,
        data.status === "archived" ? 0 : 1,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Mentor not found." });
    await logMentorAudit(req, "edit", req.params.id, { status: data.status, featured: data.featured });
    if (data.status === "published") await logMentorAudit(req, "publish", req.params.id);
    if (data.featured) await logMentorAudit(req, "feature", req.params.id);
    const [rows] = await pool.query("SELECT * FROM mentors WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapMentor(rows[0]) });
  }),
);

router.patch(
  "/mentors/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid mentor status." });

    const [result] = await pool.query("UPDATE mentors SET status = ?, visible = ?, isActive = ? WHERE id = ?", [
      status,
      status === "archived" ? 0 : 1,
      status === "archived" ? 0 : 1,
      req.params.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Mentor not found." });

    await logMentorAudit(req, status === "published" ? "publish" : status === "archived" ? "archive" : status, req.params.id);
    const [rows] = await pool.query("SELECT * FROM mentors WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapMentor(rows[0]) });
  }),
);

router.patch(
  "/mentors/:id/featured",
  asyncHandler(async (req, res) => {
    const featured = Boolean(req.body?.featured);
    const [result] = await pool.query("UPDATE mentors SET featured = ? WHERE id = ?", [featured ? 1 : 0, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Mentor not found." });

    if (featured) await logMentorAudit(req, "feature", req.params.id);
    else await logMentorAudit(req, "unfeature", req.params.id);
    const [rows] = await pool.query("SELECT * FROM mentors WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapMentor(rows[0]) });
  }),
);

router.delete(
  "/mentors/:id",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM mentors WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Mentor not found." });

    await logMentorAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/initiatives",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const category = cleanString(req.query.category, 40);
    const visibility = cleanString(req.query.visibility, 40);
    const featured = cleanString(req.query.featured, 20);
    const sort = initiativeSortColumns.has(req.query.sort) ? req.query.sort : "order_index";
    const direction = String(req.query.direction || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }

    if (category && category !== "all") {
      filters.push("category = ?");
      values.push(category);
    }

    if (visibility && visibility !== "all") {
      filters.push("visibility = ?");
      values.push(visibility);
    }

    if (featured && featured !== "all") {
      filters.push("featured = ?");
      values.push(featured === "true" || featured === "featured" ? 1 : 0);
    }

    if (search) {
      filters.push("(title LIKE ? OR category LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM initiatives ${where}`, values);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM initiatives
        ${where}
        ORDER BY featured DESC, ${sort} ${direction}, created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    );

    res.json({ success: true, data: rows.map(mapInitiative), meta: { page, limit, total: countRow.total } });
  }),
);

router.post(
  "/initiatives",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeInitiative(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const visible = data.status === "published" && data.visibility === "public" ? 1 : 0;
    const active = data.status === "archived" ? 0 : 1;
    const [result] = await pool.query(
      `
        INSERT INTO initiatives
          (title, slug, category, short_description, subtitle, description, image_url, imageUrl, banner_url, bannerUrl, status, featured, isFeatured, order_index, display_order, start_date, end_date, visibility, visible, active, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.title,
        data.slug,
        data.category,
        data.shortDescription,
        data.shortDescription,
        data.description,
        data.imageUrl,
        data.imageUrl,
        data.bannerUrl,
        data.bannerUrl,
        data.status,
        data.featured ? 1 : 0,
        data.featured ? 1 : 0,
        data.orderIndex,
        data.orderIndex,
        data.startDate,
        data.endDate,
        data.visibility,
        visible,
        active,
        active,
      ],
    );

    await logInitiativeAudit(req, "create", result.insertId, { status: data.status, featured: data.featured });
    if (data.status === "published") await logInitiativeAudit(req, "publish", result.insertId);
    if (data.featured) await logInitiativeAudit(req, "feature", result.insertId);
    const [rows] = await pool.query("SELECT * FROM initiatives WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: mapInitiative(rows[0]) });
  }),
);

router.put(
  "/initiatives/:id",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeInitiative(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const visible = data.status === "published" && data.visibility === "public" ? 1 : 0;
    const active = data.status === "archived" ? 0 : 1;
    const [result] = await pool.query(
      `
        UPDATE initiatives
        SET title = ?,
            slug = ?,
            category = ?,
            short_description = ?,
            subtitle = ?,
            description = ?,
            image_url = ?,
            imageUrl = ?,
            banner_url = ?,
            bannerUrl = ?,
            status = ?,
            featured = ?,
            isFeatured = ?,
            order_index = ?,
            display_order = ?,
            start_date = ?,
            end_date = ?,
            visibility = ?,
            visible = ?,
            active = ?,
            isActive = ?
        WHERE id = ?
      `,
      [
        data.title,
        data.slug,
        data.category,
        data.shortDescription,
        data.shortDescription,
        data.description,
        data.imageUrl,
        data.imageUrl,
        data.bannerUrl,
        data.bannerUrl,
        data.status,
        data.featured ? 1 : 0,
        data.featured ? 1 : 0,
        data.orderIndex,
        data.orderIndex,
        data.startDate,
        data.endDate,
        data.visibility,
        visible,
        active,
        active,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Initiative not found." });
    await logInitiativeAudit(req, "edit", req.params.id, { status: data.status, featured: data.featured });
    if (data.status === "published") await logInitiativeAudit(req, "publish", req.params.id);
    if (data.featured) await logInitiativeAudit(req, "feature", req.params.id);
    const [rows] = await pool.query("SELECT * FROM initiatives WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapInitiative(rows[0]) });
  }),
);

router.patch(
  "/initiatives/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid initiative status." });

    const [rowsBefore] = await pool.query("SELECT visibility FROM initiatives WHERE id = ?", [req.params.id]);
    if (rowsBefore.length === 0) return res.status(404).json({ success: false, message: "Initiative not found." });
    const visible = status === "published" && rowsBefore[0].visibility === "public" ? 1 : 0;
    const active = status === "archived" ? 0 : 1;
    await pool.query("UPDATE initiatives SET status = ?, visible = ?, active = ?, isActive = ? WHERE id = ?", [
      status,
      visible,
      active,
      active,
      req.params.id,
    ]);

    await logInitiativeAudit(req, status === "published" ? "publish" : status === "archived" ? "archive" : status, req.params.id);
    const [rows] = await pool.query("SELECT * FROM initiatives WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapInitiative(rows[0]) });
  }),
);

router.patch(
  "/initiatives/:id/featured",
  asyncHandler(async (req, res) => {
    const featured = Boolean(req.body?.featured);
    const [result] = await pool.query("UPDATE initiatives SET featured = ?, isFeatured = ? WHERE id = ?", [
      featured ? 1 : 0,
      featured ? 1 : 0,
      req.params.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Initiative not found." });

    await logInitiativeAudit(req, featured ? "feature" : "unfeature", req.params.id);
    const [rows] = await pool.query("SELECT * FROM initiatives WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapInitiative(rows[0]) });
  }),
);

router.delete(
  "/initiatives/:id",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM initiatives WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Initiative not found." });

    await logInitiativeAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/reels",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const platform = cleanString(req.query.platform, 40);
    const featured = cleanString(req.query.featured, 20);
    const initiativeId = cleanString(req.query.initiativeId || req.query.initiative_id, 40);
    const sort = reelSortColumns.has(req.query.sort) ? req.query.sort : "order_index";
    const direction = String(req.query.direction || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }
    if (platform && platform !== "all") {
      filters.push("platform = ?");
      values.push(platform);
    }
    if (featured && featured !== "all") {
      filters.push("featured = ?");
      values.push(featured === "true" || featured === "featured" ? 1 : 0);
    }
    if (initiativeId && initiativeId !== "all") {
      filters.push("initiative_id = ?");
      values.push(initiativeId);
    }
    if (search) {
      filters.push("(title LIKE ? OR caption LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM reels ${where}`, values);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM reels
        ${where}
        ORDER BY featured DESC, ${sort} ${direction}, COALESCE(published_at, created_at) DESC
        LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    );

    res.json({ success: true, data: rows.map(mapReel), meta: { page, limit, total: countRow.total } });
  }),
);

router.post(
  "/reels",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeReel(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const active = data.status === "archived" ? 0 : 1;
    const [result] = await pool.query(
      `
        INSERT INTO reels
          (title, slug, platform, video_url, videoUrl, thumbnail_url, thumbnailUrl, caption, description, initiative_id, status, featured, order_index, display_order, published_at, upload_date, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.title,
        data.slug,
        data.platform,
        data.videoUrl,
        data.videoUrl,
        data.thumbnailUrl,
        data.thumbnailUrl,
        data.caption,
        data.description,
        data.initiativeId,
        data.status,
        data.featured ? 1 : 0,
        data.orderIndex,
        data.orderIndex,
        data.publishedAt,
        data.publishedAt,
        active,
      ],
    );

    await logReelAudit(req, "create", result.insertId, { status: data.status, featured: data.featured });
    if (data.status === "published") await logReelAudit(req, "publish", result.insertId);
    if (data.featured) await logReelAudit(req, "feature", result.insertId);
    const [rows] = await pool.query("SELECT * FROM reels WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: mapReel(rows[0]) });
  }),
);

router.put(
  "/reels/:id",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeReel(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const active = data.status === "archived" ? 0 : 1;
    const [result] = await pool.query(
      `
        UPDATE reels
        SET title = ?,
            slug = ?,
            platform = ?,
            video_url = ?,
            videoUrl = ?,
            thumbnail_url = ?,
            thumbnailUrl = ?,
            caption = ?,
            description = ?,
            initiative_id = ?,
            status = ?,
            featured = ?,
            order_index = ?,
            display_order = ?,
            published_at = ?,
            upload_date = ?,
            active = ?
        WHERE id = ?
      `,
      [
        data.title,
        data.slug,
        data.platform,
        data.videoUrl,
        data.videoUrl,
        data.thumbnailUrl,
        data.thumbnailUrl,
        data.caption,
        data.description,
        data.initiativeId,
        data.status,
        data.featured ? 1 : 0,
        data.orderIndex,
        data.orderIndex,
        data.publishedAt,
        data.publishedAt,
        active,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Reel not found." });
    await logReelAudit(req, "edit", req.params.id, { status: data.status, featured: data.featured });
    if (data.status === "published") await logReelAudit(req, "publish", req.params.id);
    if (data.featured) await logReelAudit(req, "feature", req.params.id);
    const [rows] = await pool.query("SELECT * FROM reels WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapReel(rows[0]) });
  }),
);

router.patch(
  "/reels/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid reel status." });

    const active = status === "archived" ? 0 : 1;
    const [result] = await pool.query("UPDATE reels SET status = ?, active = ? WHERE id = ?", [status, active, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Reel not found." });

    await logReelAudit(req, status === "published" ? "publish" : status === "archived" ? "archive" : status, req.params.id);
    const [rows] = await pool.query("SELECT * FROM reels WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapReel(rows[0]) });
  }),
);

router.patch(
  "/reels/:id/featured",
  asyncHandler(async (req, res) => {
    const featured = Boolean(req.body?.featured);
    const [result] = await pool.query("UPDATE reels SET featured = ? WHERE id = ?", [featured ? 1 : 0, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Reel not found." });

    await logReelAudit(req, featured ? "feature" : "unfeature", req.params.id);
    const [rows] = await pool.query("SELECT * FROM reels WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapReel(rows[0]) });
  }),
);

router.delete(
  "/reels/:id",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM reels WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Reel not found." });

    await logReelAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/testimonials",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const category = cleanString(req.query.category, 40);
    const featured = cleanString(req.query.featured, 20);
    const rating = cleanString(req.query.rating, 10);
    const sort = testimonialSortColumns.has(req.query.sort) ? req.query.sort : "order_index";
    const direction = String(req.query.direction || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }
    if (category && category !== "all") {
      filters.push("category = ?");
      values.push(category);
    }
    if (featured && featured !== "all") {
      filters.push("featured = ?");
      values.push(featured === "true" || featured === "featured" ? 1 : 0);
    }
    if (rating && rating !== "all") {
      filters.push("rating = ?");
      values.push(Number(rating));
    }
    if (search) {
      filters.push("(full_name LIKE ? OR name LIKE ? OR organization LIKE ? OR testimonial LIKE ? OR quote LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like, like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM testimonials ${where}`, values);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM testimonials
        ${where}
        ORDER BY featured DESC, ${sort} ${direction}, created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    );

    res.json({ success: true, data: rows.map(mapTestimonial), meta: { page, limit, total: countRow.total } });
  }),
);

router.post(
  "/testimonials",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeTestimonial(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const active = data.status === "archived" ? 0 : 1;
    const [result] = await pool.query(
      `
        INSERT INTO testimonials
          (full_name, name, designation, role, organization, testimonial, quote, image_url, imageUrl, rating, category, status, featured, order_index, display_order, active, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.fullName,
        data.fullName,
        data.designation,
        data.designation,
        data.organization,
        data.testimonial,
        data.testimonial,
        data.imageUrl,
        data.imageUrl,
        data.rating,
        data.category,
        data.status,
        data.featured ? 1 : 0,
        data.orderIndex,
        data.orderIndex,
        active,
        active,
      ],
    );

    await logTestimonialAudit(req, "create", result.insertId, { status: data.status, featured: data.featured });
    if (data.status === "published") await logTestimonialAudit(req, "publish", result.insertId);
    if (data.featured) await logTestimonialAudit(req, "feature", result.insertId);
    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: mapTestimonial(rows[0]) });
  }),
);

router.put(
  "/testimonials/:id",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeTestimonial(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const active = data.status === "archived" ? 0 : 1;
    const [result] = await pool.query(
      `
        UPDATE testimonials
        SET full_name = ?,
            name = ?,
            designation = ?,
            role = ?,
            organization = ?,
            testimonial = ?,
            quote = ?,
            image_url = ?,
            imageUrl = ?,
            rating = ?,
            category = ?,
            status = ?,
            featured = ?,
            order_index = ?,
            display_order = ?,
            active = ?,
            isActive = ?
        WHERE id = ?
      `,
      [
        data.fullName,
        data.fullName,
        data.designation,
        data.designation,
        data.organization,
        data.testimonial,
        data.testimonial,
        data.imageUrl,
        data.imageUrl,
        data.rating,
        data.category,
        data.status,
        data.featured ? 1 : 0,
        data.orderIndex,
        data.orderIndex,
        active,
        active,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Testimonial not found." });
    await logTestimonialAudit(req, "edit", req.params.id, { status: data.status, featured: data.featured });
    if (data.status === "published") await logTestimonialAudit(req, "publish", req.params.id);
    if (data.featured) await logTestimonialAudit(req, "feature", req.params.id);
    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapTestimonial(rows[0]) });
  }),
);

router.patch(
  "/testimonials/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid testimonial status." });

    const active = status === "archived" ? 0 : 1;
    const [result] = await pool.query("UPDATE testimonials SET status = ?, active = ?, isActive = ? WHERE id = ?", [
      status,
      active,
      active,
      req.params.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Testimonial not found." });

    await logTestimonialAudit(req, status === "published" ? "publish" : status === "archived" ? "archive" : status, req.params.id);
    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapTestimonial(rows[0]) });
  }),
);

router.patch(
  "/testimonials/:id/featured",
  asyncHandler(async (req, res) => {
    const featured = Boolean(req.body?.featured);
    const [result] = await pool.query("UPDATE testimonials SET featured = ? WHERE id = ?", [featured ? 1 : 0, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Testimonial not found." });

    await logTestimonialAudit(req, featured ? "feature" : "unfeature", req.params.id);
    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapTestimonial(rows[0]) });
  }),
);

router.delete(
  "/testimonials/:id",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM testimonials WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Testimonial not found." });

    await logTestimonialAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/careers",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const featured = cleanString(req.query.featured, 20);
    const department = cleanString(req.query.department, 160);
    const roleType = cleanString(req.query.roleType || req.query.role_type, 40);
    const visibility = cleanString(req.query.visibility, 40);
    const sort = careerSortColumns.has(req.query.sort) ? req.query.sort : "order_index";
    const direction = String(req.query.direction || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }
    if (featured && featured !== "all") {
      filters.push("featured = ?");
      values.push(featured === "true" || featured === "featured" ? 1 : 0);
    }
    if (department && department !== "all") {
      filters.push("department LIKE ?");
      values.push(`%${department}%`);
    }
    if (roleType && roleType !== "all") {
      filters.push("role_type = ?");
      values.push(roleType);
    }
    if (visibility && visibility !== "all") {
      filters.push("visibility = ?");
      values.push(visibility);
    }
    if (search) {
      filters.push("(title LIKE ? OR department LIKE ? OR requirements LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM careers ${where}`, values);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM careers
        ${where}
        ORDER BY featured DESC, ${sort} ${direction}, created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    );

    res.json({ success: true, data: rows.map(mapCareer), meta: { page, limit, total: countRow.total } });
  }),
);

router.post(
  "/careers",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeCareer(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const active = data.status === "archived" ? 0 : 1;
    const [result] = await pool.query(
      `
        INSERT INTO careers
          (title, slug, department, role_type, type, employmentType, location, short_description, description, requirements, responsibilities, image_url, bannerUrl, status, featured, order_index, display_order, visibility, application_deadline, active, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.title,
        data.slug,
        data.department,
        data.roleType,
        data.roleType,
        data.roleType,
        data.location,
        data.description,
        data.description,
        data.requirements,
        data.responsibilities,
        data.imageUrl,
        data.imageUrl,
        data.status,
        data.featured ? 1 : 0,
        data.orderIndex,
        data.orderIndex,
        data.visibility,
        data.applicationDeadline,
        active,
        active,
      ],
    );

    await logCareerAudit(req, "create", result.insertId, { status: data.status, featured: data.featured });
    if (data.status === "published") await logCareerAudit(req, "publish", result.insertId);
    if (data.featured) await logCareerAudit(req, "feature", result.insertId);
    const [rows] = await pool.query("SELECT * FROM careers WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: mapCareer(rows[0]) });
  }),
);

router.put(
  "/careers/:id",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeCareer(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const active = data.status === "archived" ? 0 : 1;
    const [result] = await pool.query(
      `
        UPDATE careers
        SET title = ?,
            slug = ?,
            department = ?,
            role_type = ?,
            type = ?,
            employmentType = ?,
            location = ?,
            short_description = ?,
            description = ?,
            requirements = ?,
            responsibilities = ?,
            image_url = ?,
            bannerUrl = ?,
            status = ?,
            featured = ?,
            order_index = ?,
            display_order = ?,
            visibility = ?,
            application_deadline = ?,
            active = ?,
            isActive = ?
        WHERE id = ?
      `,
      [
        data.title,
        data.slug,
        data.department,
        data.roleType,
        data.roleType,
        data.roleType,
        data.location,
        data.description,
        data.description,
        data.requirements,
        data.responsibilities,
        data.imageUrl,
        data.imageUrl,
        data.status,
        data.featured ? 1 : 0,
        data.orderIndex,
        data.orderIndex,
        data.visibility,
        data.applicationDeadline,
        active,
        active,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Career opportunity not found." });
    await logCareerAudit(req, "edit", req.params.id, { status: data.status, featured: data.featured });
    if (data.status === "published") await logCareerAudit(req, "publish", req.params.id);
    if (data.featured) await logCareerAudit(req, "feature", req.params.id);
    const [rows] = await pool.query("SELECT * FROM careers WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapCareer(rows[0]) });
  }),
);

router.patch(
  "/careers/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid career status." });

    const active = status === "archived" ? 0 : 1;
    const [result] = await pool.query("UPDATE careers SET status = ?, active = ?, isActive = ? WHERE id = ?", [
      status,
      active,
      active,
      req.params.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Career opportunity not found." });

    await logCareerAudit(req, status === "published" ? "publish" : status === "archived" ? "archive" : status, req.params.id);
    const [rows] = await pool.query("SELECT * FROM careers WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapCareer(rows[0]) });
  }),
);

router.patch(
  "/careers/:id/featured",
  asyncHandler(async (req, res) => {
    const featured = Boolean(req.body?.featured);
    const [result] = await pool.query("UPDATE careers SET featured = ? WHERE id = ?", [featured ? 1 : 0, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Career opportunity not found." });

    await logCareerAudit(req, featured ? "feature" : "unfeature", req.params.id);
    const [rows] = await pool.query("SELECT * FROM careers WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapCareer(rows[0]) });
  }),
);

router.delete(
  "/careers/:id",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM careers WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Career opportunity not found." });

    await logCareerAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/id-templates",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const sort = idTemplateSortColumns.has(req.query.sort) ? req.query.sort : "is_default";
    const direction = String(req.query.direction || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }
    if (search) {
      filters.push("(name LIKE ? OR header_text LIKE ? OR footer_text LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM id_card_templates ${where}`, values);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM id_card_templates
        ${where}
        ORDER BY ${sort} ${direction}, updated_at DESC
        LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    );

    res.json({ success: true, data: rows.map(mapIdTemplate), meta: { page, limit, total: countRow.total } });
  }),
);

router.post(
  "/id-templates",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeIdTemplate(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      if (data.isDefault) await connection.query("UPDATE id_card_templates SET is_default = 0");
      const [result] = await connection.query(
        `
          INSERT INTO id_card_templates
            (name, template_type, front_background_url, back_background_url, logo_url, header_text, footer_text, field_config, status, is_default)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.name,
          data.templateType,
          data.frontBackgroundUrl,
          data.backBackgroundUrl,
          data.logoUrl,
          data.headerText,
          data.footerText,
          data.fieldConfig ? JSON.stringify(data.fieldConfig) : null,
          data.status,
          data.isDefault ? 1 : 0,
        ],
      );
      await connection.commit();
      await logIdTemplateAudit(req, "create", result.insertId, { status: data.status, isDefault: data.isDefault });
      if (data.status === "published") await logIdTemplateAudit(req, "publish", result.insertId);
      const [rows] = await pool.query("SELECT * FROM id_card_templates WHERE id = ?", [result.insertId]);
      return res.status(201).json({ success: true, data: mapIdTemplate(rows[0]) });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.put(
  "/id-templates/:id",
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeIdTemplate(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      if (data.isDefault) await connection.query("UPDATE id_card_templates SET is_default = 0");
      const [result] = await connection.query(
        `
          UPDATE id_card_templates
          SET name = ?,
              template_type = ?,
              front_background_url = ?,
              back_background_url = ?,
              logo_url = ?,
              header_text = ?,
              footer_text = ?,
              field_config = ?,
              status = ?,
              is_default = ?
          WHERE id = ?
        `,
        [
          data.name,
          data.templateType,
          data.frontBackgroundUrl,
          data.backBackgroundUrl,
          data.logoUrl,
          data.headerText,
          data.footerText,
          data.fieldConfig ? JSON.stringify(data.fieldConfig) : null,
          data.status,
          data.isDefault ? 1 : 0,
          req.params.id,
        ],
      );
      await connection.commit();
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "ID template not found." });
      await logIdTemplateAudit(req, "edit", req.params.id, { status: data.status, isDefault: data.isDefault });
      if (data.status === "published") await logIdTemplateAudit(req, "publish", req.params.id);
      const [rows] = await pool.query("SELECT * FROM id_card_templates WHERE id = ?", [req.params.id]);
      return res.json({ success: true, data: mapIdTemplate(rows[0]) });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.patch(
  "/id-templates/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid template status." });

    const [result] = await pool.query("UPDATE id_card_templates SET status = ? WHERE id = ?", [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "ID template not found." });
    await logIdTemplateAudit(req, status === "published" ? "publish" : status === "archived" ? "archive" : status, req.params.id);
    const [rows] = await pool.query("SELECT * FROM id_card_templates WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapIdTemplate(rows[0]) });
  }),
);

router.delete(
  "/id-templates/:id",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("UPDATE id_card_templates SET status = 'archived', is_default = 0 WHERE id = ? AND is_default = 0", [req.params.id]);
    if (result.affectedRows === 0) return res.status(400).json({ success: false, message: "Default template cannot be deleted." });
    await logIdTemplateAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/certificate-templates",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const sort = certificateTemplateSortColumns.has(req.query.sort) ? req.query.sort : "is_default";
    const direction = String(req.query.direction || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];
    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }
    if (search) {
      filters.push("(name LIKE ? OR certificate_type LIKE ? OR header_text LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like);
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM certificate_templates ${where}`, values);
    const [rows] = await pool.query(`SELECT * FROM certificate_templates ${where} ORDER BY ${sort} ${direction}, updated_at DESC LIMIT ? OFFSET ?`, [
      ...values,
      limit,
      offset,
    ]);
    res.json({ success: true, data: rows.map(mapCertificateTemplate), meta: { page, limit, total: countRow.total } });
  }),
);

async function saveCertificateTemplate(req, res, id = null) {
  const { data, errors } = normalizeCertificateTemplate(req.body);
  if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (data.isDefault) {
      await connection.query("UPDATE certificate_templates SET is_default = 0 WHERE certificate_type = ?", [data.certificateType]);
    }
    let templateId = id;
    if (id) {
      const [result] = await connection.query(
        `UPDATE certificate_templates SET name=?, certificate_type=?, background_url=?, logo_url=?, header_text=?, body_template=?, footer_text=?, signature_name=?, signature_designation=?, field_config=?, status=?, is_default=? WHERE id=?`,
        [data.name, data.certificateType, data.backgroundUrl, data.logoUrl, data.headerText, data.bodyTemplate, data.footerText, data.signatureName, data.signatureDesignation, data.fieldConfig ? JSON.stringify(data.fieldConfig) : null, data.status, data.isDefault ? 1 : 0, id],
      );
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: "Certificate template not found." });
      }
    } else {
      const [result] = await connection.query(
        `INSERT INTO certificate_templates (name, certificate_type, background_url, logo_url, header_text, body_template, footer_text, signature_name, signature_designation, field_config, status, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.name, data.certificateType, data.backgroundUrl, data.logoUrl, data.headerText, data.bodyTemplate, data.footerText, data.signatureName, data.signatureDesignation, data.fieldConfig ? JSON.stringify(data.fieldConfig) : null, data.status, data.isDefault ? 1 : 0],
      );
      templateId = result.insertId;
    }
    await connection.commit();
    await logCertificateTemplateAudit(req, id ? "edit" : "create", templateId, { status: data.status, isDefault: data.isDefault });
    if (data.status === "published") await logCertificateTemplateAudit(req, "publish", templateId);
    if (data.isDefault) await logCertificateTemplateAudit(req, "default", templateId);
    const [rows] = await pool.query("SELECT * FROM certificate_templates WHERE id = ?", [templateId]);
    return res.status(id ? 200 : 201).json({ success: true, data: mapCertificateTemplate(rows[0]) });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

router.post("/certificate-templates", asyncHandler((req, res) => saveCertificateTemplate(req, res)));
router.put("/certificate-templates/:id", asyncHandler((req, res) => saveCertificateTemplate(req, res, req.params.id)));

router.patch(
  "/certificate-templates/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid template status." });
    const [result] = await pool.query("UPDATE certificate_templates SET status = ? WHERE id = ?", [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Certificate template not found." });
    await logCertificateTemplateAudit(req, status === "published" ? "publish" : status === "archived" ? "archive" : status, req.params.id);
    const [rows] = await pool.query("SELECT * FROM certificate_templates WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapCertificateTemplate(rows[0]) });
  }),
);

router.delete(
  "/certificate-templates/:id",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("UPDATE certificate_templates SET status = 'archived', is_default = 0 WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Certificate template not found." });
    await logCertificateTemplateAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/:module",
  validateModule,
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const status = cleanString(req.query.status, 40);
    const sort = sortColumns.has(req.query.sort) ? req.query.sort : "order_index";
    const direction = String(req.query.direction || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const filters = ["module = ?"];
    const values = [req.params.module];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }

    if (search) {
      filters.push("(title LIKE ? OR slug LIKE ? OR description LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like);
    }

    const where = `WHERE ${filters.join(" AND ")}`;
    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM cms_entries ${where}`, values);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM cms_entries
        ${where}
        ORDER BY ${sort} ${direction}, updated_at DESC
        LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    );

    res.json({ success: true, data: rows.map(mapEntry), meta: { page, limit, total: countRow.total } });
  }),
);

router.post(
  "/:module",
  validateModule,
  asyncHandler(async (req, res) => {
    const title = cleanString(req.body?.title, 220);
    if (!title) return res.status(400).json({ success: false, message: "Title is required." });

    const status = statuses.has(req.body?.status) ? req.body.status : "draft";
    const slug = slugify(req.body?.slug || title);
    const tags = parseTags(req.body?.tags);
    const [result] = await pool.query(
      `
        INSERT INTO cms_entries
          (module, title, slug, description, image_url, status, order_index, tags_json, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.params.module,
        title,
        slug,
        cleanString(req.body?.description, 5000),
        validateImageUrl(req.body?.imageUrl || req.body?.image_url),
        status,
        Number(req.body?.orderIndex || req.body?.order_index || 0),
        JSON.stringify(tags),
        JSON.stringify(req.body?.metadata || {}),
      ],
    );

    await logAudit(req, `cms.${req.params.module}.create`, result.insertId, { status });
    const [rows] = await pool.query("SELECT * FROM cms_entries WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: mapEntry(rows[0]) });
  }),
);

router.put(
  "/:module/:id",
  validateModule,
  asyncHandler(async (req, res) => {
    const title = cleanString(req.body?.title, 220);
    if (!title) return res.status(400).json({ success: false, message: "Title is required." });

    const status = statuses.has(req.body?.status) ? req.body.status : "draft";
    const slug = slugify(req.body?.slug || title);
    const tags = parseTags(req.body?.tags);
    const [result] = await pool.query(
      `
        UPDATE cms_entries
        SET title = ?,
            slug = ?,
            description = ?,
            image_url = ?,
            status = ?,
            order_index = ?,
            tags_json = ?,
            metadata_json = ?
        WHERE id = ? AND module = ?
      `,
      [
        title,
        slug,
        cleanString(req.body?.description, 5000),
        validateImageUrl(req.body?.imageUrl || req.body?.image_url),
        status,
        Number(req.body?.orderIndex || req.body?.order_index || 0),
        JSON.stringify(tags),
        JSON.stringify(req.body?.metadata || {}),
        req.params.id,
        req.params.module,
      ],
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "CMS entry not found." });
    await logAudit(req, `cms.${req.params.module}.edit`, req.params.id, { status });
    const [rows] = await pool.query("SELECT * FROM cms_entries WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapEntry(rows[0]) });
  }),
);

router.patch(
  "/:module/:id/status",
  validateModule,
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid CMS status." });

    const [result] = await pool.query("UPDATE cms_entries SET status = ? WHERE id = ? AND module = ?", [
      status,
      req.params.id,
      req.params.module,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "CMS entry not found." });

    const action = status === "published" ? "publish" : status === "archived" ? "archive" : status;
    await logAudit(req, `cms.${req.params.module}.${action}`, req.params.id);
    const [rows] = await pool.query("SELECT * FROM cms_entries WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: mapEntry(rows[0]) });
  }),
);

router.delete(
  "/:module/:id",
  validateModule,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM cms_entries WHERE id = ? AND module = ?", [
      req.params.id,
      req.params.module,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "CMS entry not found." });

    await logAudit(req, `cms.${req.params.module}.delete`, req.params.id);
    res.json({ success: true });
  }),
);

module.exports = router;
