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

function isValidOptionalUrl(value) {
  if (!value) return true;

  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function validateVolunteerRegistration(input = {}) {
  const data = {
    fullName: cleanString(input.fullName || input.full_name, 180),
    email: cleanString(input.email, 180).toLowerCase(),
    password: String(input.password || ""),
    confirmPassword: String(input.confirmPassword || ""),
    phone: cleanString(input.phone, 40),
    college: cleanString(input.college, 180),
    course: cleanString(input.course, 180),
    academicYear: cleanString(input.academicYear || input.academic_year || input.year, 80),
    city: cleanString(input.city, 120),
    skills: cleanLongText(input.skills, 2000),
    interests: cleanLongText(input.interests, 2000),
    availability: cleanString(input.availability, 220),
    bio: cleanLongText(input.bio, 5000),
    linkedinUrl: cleanString(input.linkedinUrl || input.linkedin_url || input.linkedin, 1000),
    instagramUrl: cleanString(input.instagramUrl || input.instagram_url || input.instagram, 1000),
    transactionId: cleanString(input.transactionId || input.transaction_id, 255),
  };

  const errors = {};

  if (!data.fullName) errors.fullName = "Full name is required.";
  if (!data.email) errors.email = "Email address is required.";
  if (!data.password) errors.password = "Password is required.";
  if (!data.confirmPassword) errors.confirmPassword = "Please confirm your password.";
  if (!data.phone) errors.phone = "Phone number is required.";
  if (!data.city) errors.city = "City is required.";

  if (data.email && !isValidEmail(data.email)) errors.email = "Enter a valid email address.";
  if (data.password && data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  if (data.linkedinUrl && !isValidOptionalUrl(data.linkedinUrl)) {
    errors.linkedinUrl = "LinkedIn must be a valid http(s) URL.";
  }
  if (data.instagramUrl && !isValidOptionalUrl(data.instagramUrl)) {
    errors.instagramUrl = "Instagram must be a valid http(s) URL.";
  }

  return { data, errors };
}

function validateLogin(input = {}) {
  const data = {
    email: cleanString(input.email, 180).toLowerCase(),
    password: String(input.password || ""),
  };
  const errors = {};

  if (!data.email) errors.email = "Email address is required.";
  if (data.email && !isValidEmail(data.email)) errors.email = "Enter a valid email address.";
  if (!data.password) errors.password = "Password is required.";

  return { data, errors };
}

module.exports = {
  validateVolunteerRegistration,
  validateLogin,
};
