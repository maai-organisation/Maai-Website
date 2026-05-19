const cmsModules = {
  "social-links": {
    label: "Social Links",
    fields: ["platform", "url", "icon", "status", "order_index"],
  },
  socials: {
    label: "Legacy Socials",
    fields: ["title", "slug", "description", "image_url", "status", "order_index", "tags"],
  },
  team: {
    label: "Team",
    fields: ["full_name", "designation", "department", "bio", "image_url", "linkedin_url", "instagram_url", "email", "status", "order_index"],
  },
  mentors: {
    label: "Mentors",
    fields: ["full_name", "designation", "organization", "specialization", "bio", "image_url", "linkedin_url", "instagram_url", "email", "featured", "status", "order_index"],
  },
  initiatives: {
    label: "Initiatives",
    fields: ["title", "slug", "category", "short_description", "description", "image_url", "banner_url", "featured", "visibility", "status", "order_index", "start_date", "end_date"],
  },
  reels: {
    label: "Reels",
    fields: ["title", "slug", "platform", "video_url", "thumbnail_url", "caption", "description", "initiative_id", "featured", "status", "order_index", "published_at"],
  },
  testimonials: {
    label: "Testimonials",
    fields: ["full_name", "designation", "organization", "category", "testimonial", "image_url", "rating", "featured", "status", "order_index"],
  },
  careers: {
    label: "Careers",
    fields: ["title", "slug", "department", "role_type", "location", "description", "requirements", "responsibilities", "image_url", "featured", "visibility", "status", "order_index", "application_deadline"],
  },
  "id-templates": {
    label: "ID Card Templates",
    fields: ["name", "template_type", "front_background_url", "back_background_url", "logo_url", "header_text", "footer_text", "is_default", "status"],
  },
  "certificate-templates": {
    label: "Certificate Templates",
    fields: ["name", "certificate_type", "background_url", "logo_url", "header_text", "body_template", "footer_text", "signature_name", "signature_designation", "is_default", "status"],
  },
  "email-templates": {
    label: "Email Templates",
    fields: ["name", "email_type", "subject", "body_template", "status", "is_default"],
  },
  hero_sections: {
    label: "Hero Sections",
    fields: ["title", "slug", "description", "image_url", "status", "order_index", "tags"],
  },
};

module.exports = {
  cmsModules,
};
