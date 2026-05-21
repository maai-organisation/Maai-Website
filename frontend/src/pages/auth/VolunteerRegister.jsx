import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRoleRedirect, registerVolunteer } from "../../services/authService";

const visualImage = "https://i.postimg.cc/KvgKDb3x/Volunteerportalbg.jpg";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  city: "",
  college: "",
  course: "",
  academicYear: "",
  skills: "",
  interests: "",
  availability: "",
  bio: "",
  linkedinUrl: "",
  instagramUrl: "",
};

const steps = [
  { label: "Account", fields: ["fullName", "email", "password", "confirmPassword"] },
  { label: "Personal", fields: ["phone", "city", "college", "course", "academicYear"] },
  { label: "Community", fields: ["skills", "interests", "availability", "bio", "linkedinUrl", "instagramUrl"] },
];

const stepVariants = {
  enter: { opacity: 0, y: 16, filter: "blur(6px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(6px)" },
};

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}
function isValidOptionalUrl(v) {
  if (!v.trim()) return true;
  try { const p = new URL(v.trim()); return ["http:", "https:"].includes(p.protocol); }
  catch { return false; }
}

function validateStep(form, i) {
  const e = {};
  if (i === 0) {
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    if (form.email.trim() && !isValidEmail(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    if (form.password && form.password.length < 8) e.password = "Use at least 8 characters.";
    if (!form.confirmPassword) e.confirmPassword = "Confirm your password.";
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
  }
  if (i === 1) {
    if (!form.phone.trim()) e.phone = "Phone is required.";
    if (!form.city.trim()) e.city = "City is required.";
  }
  if (i === 2) {
    if (form.linkedinUrl && !isValidOptionalUrl(form.linkedinUrl)) e.linkedinUrl = "Use a valid URL.";
    if (form.instagramUrl && !isValidOptionalUrl(form.instagramUrl)) e.instagramUrl = "Use a valid URL.";
  }
  return e;
}

function getStepForErrors(errors) {
  const key = Object.keys(errors)[0];
  const idx = steps.findIndex((s) => s.fields.includes(key));
  return idx === -1 ? 0 : idx;
}

/* ── Responsive hook ──────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

/* ── Field components ─────────────────────────────────── */
function Field({ label, name, type = "text", value, onChange, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: focused ? "#0891b2" : "#64748b" }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 50, borderRadius: 12,
          border: error ? "1.5px solid #f87171" : focused ? "1.5px solid #22d3ee" : "1.5px solid #e2e8f0",
          background: "#f8fafc", padding: "0 14px", fontSize: 14,
          fontWeight: 500, color: "#0f172a", outline: "none", lineHeight: "normal",
          boxSizing: "border-box", fontFamily: "inherit",
          boxShadow: focused ? (error ? "0 0 0 3px rgba(248,113,113,0.12)" : "0 0 0 3px rgba(34,211,238,0.12)") : "none",
          transition: "border 0.2s, box-shadow 0.2s",
        }}
      />
      {error && <span style={{ fontSize: 11, fontWeight: 600, color: "#ef4444" }}>{error}</span>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, error, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: focused ? "#0891b2" : "#64748b" }}>
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 50, borderRadius: 12,
          border: error ? "1.5px solid #f87171" : focused ? "1.5px solid #22d3ee" : "1.5px solid #e2e8f0",
          background: "#f8fafc", padding: "0 14px", fontSize: 14,
          fontWeight: 500, color: "#0f172a", outline: "none",
          boxSizing: "border-box", fontFamily: "inherit", appearance: "none", cursor: "pointer",
          boxShadow: focused ? "0 0 0 3px rgba(34,211,238,0.12)" : "none",
          transition: "border 0.2s, box-shadow 0.2s",
        }}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: 11, fontWeight: 600, color: "#ef4444" }}>{error}</span>}
    </div>
  );
}

function TextareaField({ label, name, value, onChange, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: focused ? "#0891b2" : "#64748b" }}>
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={3}
        style={{
          width: "100%", borderRadius: 12, padding: "12px 14px", fontSize: 14,
          border: error ? "1.5px solid #f87171" : focused ? "1.5px solid #22d3ee" : "1.5px solid #e2e8f0",
          background: "#f8fafc", fontWeight: 500, color: "#0f172a", outline: "none",
          boxSizing: "border-box", fontFamily: "inherit", resize: "vertical",
          boxShadow: focused ? "0 0 0 3px rgba(34,211,238,0.12)" : "none",
          transition: "border 0.2s, box-shadow 0.2s",
        }}
      />
      {error && <span style={{ fontSize: 11, fontWeight: 600, color: "#ef4444" }}>{error}</span>}
    </div>
  );
}

/* ── Stepper ──────────────────────────────────────────── */
function Stepper({ activeStep, isMobile }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 24, width: "100%" }}>
      {steps.map((step, i) => {
        const isActive = i === activeStep;
        const isDone = i < activeStep;
        return (
          <div key={step.label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? "1" : "0" }}>
            {/* Circle + label */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: isMobile ? 48 : 56 }}>
              <div style={{
                width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isMobile ? 11 : 13, fontWeight: 800,
                background: isActive ? "linear-gradient(135deg,#06b6d4,#3b82f6)" : isDone ? "#3b82f6" : "#e2e8f0",
                color: isActive || isDone ? "#fff" : "#94a3b8",
                boxShadow: isActive ? "0 4px 14px rgba(6,182,212,0.35)" : "none",
                flexShrink: 0,
                transition: "all 0.3s",
              }}>
                {isDone ? "✓" : i + 1}
              </div>
              <span style={{
                marginTop: 5, fontSize: isMobile ? 9 : 10, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "center",
                color: isActive ? "#0891b2" : isDone ? "#3b82f6" : "#94a3b8",
                whiteSpace: "nowrap",
              }}>
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: "#e2e8f0", borderRadius: 2, margin: "0 4px", marginBottom: 20, overflow: "hidden" }}>
                <div style={{ height: "100%", width: isDone ? "100%" : "0%", background: "linear-gradient(90deg,#06b6d4,#3b82f6)", transition: "width 0.4s" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────── */
export default function VolunteerRegister() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("Current step:", activeStep + 1);
  }, [activeStep]);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
    setErrors((c) => ({ ...c, [name]: "" }));
    setServerMessage("");
  }

  function continueStep() {
    console.log("Current step:", activeStep + 1);
    const nextErrors = validateStep(form, activeStep);
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return; }
    setErrors({});
    setActiveStep((c) => Math.min(c + 1, steps.length - 1));
  }

  function backStep() {
    setErrors({});
    setServerMessage("");
    setActiveStep((c) => Math.max(c - 1, 0));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Current step:", activeStep + 1);
    if (activeStep < steps.length - 1) {
      continueStep();
      return;
    }

    const allErrors = steps.reduce((acc, _s, i) => ({ ...acc, ...validateStep(form, i) }), {});
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setActiveStep(getStepForErrors(allErrors));
      return;
    }
    setIsSubmitting(true);
    setServerMessage("");
    try {
      const { user } = await registerVolunteer(form);
      setSuccess(true);
      window.setTimeout(() => navigate(getRoleRedirect(user?.role)), 900);
    } catch (error) {
      const payload = error?.response?.data;
      const nextErrors = payload?.errors || {};
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) setActiveStep(getStepForErrors(nextErrors));
      setServerMessage(payload?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const gridCols = isMobile ? "1fr" : "1fr 1fr";
  const cardPadding = isMobile ? "24px 20px 28px" : "36px 40px 40px";
  const headingSize = isMobile ? 28 : 36;

  return (
    <div style={{
      minHeight: "100vh", width: "100%", position: "relative",
      display: "flex", alignItems: "center",
      justifyContent: isMobile ? "center" : "flex-start",
      padding: isMobile ? "16px" : "40px 60px",
      boxSizing: "border-box",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Background image */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `url(${visualImage})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      {/* Overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, background: "rgba(240,244,248,0.78)" }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative", zIndex: 2,
          width: "100%", maxWidth: isMobile ? "100%" : 540,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: isMobile ? 20 : 24,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 24px 80px rgba(15,23,42,0.16)",
          padding: cardPadding,
          boxSizing: "border-box",
          overflowY: "auto",
          maxHeight: isMobile ? "calc(100vh - 32px)" : "none",
        }}
      >
        {/* Navbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? 20 : 32, flexWrap: "wrap", gap: 8 }}>
          <Link to="/volunteer" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/Favicon.ico" alt="" style={{ width: 32, height: 32, borderRadius: "50%" }} />
            <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Maai organisation
            </span>
          </Link>
          <div style={{ display: "flex", gap: 16 }}>
            <Link to="/volunteer" style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none" }}>Home</Link>
            <Link to="/volunteer/login" style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none" }}>Login</Link>
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#0891b2", margin: "0 0 8px" }}>
            Volunteer Registration
          </p>
          <h1 style={{ fontSize: headingSize, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.035em", lineHeight: 1.1, margin: "0 0 10px" }}>
            Join the Movement
            <span style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>.</span>
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500, margin: 0 }}>
            Already registered?{" "}
            <Link to="/volunteer/login" style={{ color: "#0891b2", fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
          </p>
        </div>

        {/* Stepper */}
        <Stepper activeStep={activeStep} isMobile={isMobile} />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeStep === 0 && (
                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 14 }}>
                  <Field label="Full Name" name="fullName" value={form.fullName} onChange={updateField} error={errors.fullName} />
                  <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} error={errors.email} />
                  <Field label="Password" name="password" type="password" value={form.password} onChange={updateField} error={errors.password} />
                  <Field label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} error={errors.confirmPassword} />
                </div>
              )}

              {activeStep === 1 && (
                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 14 }}>
                  <Field label="Phone" name="phone" value={form.phone} onChange={updateField} error={errors.phone} />
                  <Field label="City" name="city" value={form.city} onChange={updateField} error={errors.city} />
                  <Field label="College" name="college" value={form.college} onChange={updateField} error={errors.college} />
                  <Field label="Course" name="course" value={form.course} onChange={updateField} error={errors.course} />
                  <SelectField label="Academic Year" name="academicYear" value={form.academicYear} onChange={updateField} error={errors.academicYear}>
                    <option value="">Select year</option>
                    <option value="First year">First year</option>
                    <option value="Second year">Second year</option>
                    <option value="Third year">Third year</option>
                    <option value="Fourth year">Fourth year</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Other">Other</option>
                  </SelectField>
                </div>
              )}

              {activeStep === 2 && (
                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 14 }}>
                  <TextareaField label="Skills" name="skills" value={form.skills} onChange={updateField} error={errors.skills} />
                  <TextareaField label="Interests" name="interests" value={form.interests} onChange={updateField} error={errors.interests} />
                  <SelectField label="Availability" name="availability" value={form.availability} onChange={updateField} error={errors.availability}>
                    <option value="">Select availability</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Evenings">Evenings</option>
                    <option value="Flexible">Flexible</option>
                  </SelectField>
                  <Field label="LinkedIn URL" name="linkedinUrl" type="url" value={form.linkedinUrl} onChange={updateField} error={errors.linkedinUrl} />
                  <Field label="Instagram URL" name="instagramUrl" type="url" value={form.instagramUrl} onChange={updateField} error={errors.instagramUrl} />
                  <TextareaField label="Bio" name="bio" value={form.bio} onChange={updateField} error={errors.bio} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {serverMessage && (
            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, fontWeight: 600, color: "#dc2626" }}>
              {serverMessage}
            </div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 14, padding: "10px 14px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
              Application submitted. Redirecting...
            </motion.div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
            {activeStep > 0 && (
              <button type="button" onClick={backStep} style={{
                height: 46, padding: "0 24px", borderRadius: 999,
                border: "1.5px solid #e2e8f0", background: "#f1f5f9",
                fontSize: 13, fontWeight: 700, color: "#475569", cursor: "pointer",
                fontFamily: "inherit",
              }}>
                Back
              </button>
            )}
            {activeStep < steps.length - 1 ? (
              <button type="button" onClick={continueStep} style={{
                height: 46, padding: "0 28px", borderRadius: 999,
                border: "none", background: "linear-gradient(135deg,#06b6d4,#3b82f6)",
                fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(6,182,212,0.35)", fontFamily: "inherit",
              }}>
                Continue
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} style={{
                height: 46, padding: "0 28px", borderRadius: 999,
                border: "none", background: "linear-gradient(135deg,#06b6d4,#3b82f6,#ec4899)",
                fontSize: 13, fontWeight: 700, color: "#fff",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: "0 4px 14px rgba(6,182,212,0.35)", fontFamily: "inherit",
              }}>
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
