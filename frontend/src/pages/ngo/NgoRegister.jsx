import { Building2, CalendarDays, FileUp, Handshake, MapPin, UserRound } from "lucide-react";
import { useState } from "react";

const initialForm = {
  organisationName: "",
  organisationType: "healthcare",
  yearEstablished: "",
  registrationNumber: "",
  website: "",
  organisationEmail: "",
  organisationPhone: "",
  password: "",
  founderName: "",
  designation: "",
  representativeEmail: "",
  representativePhone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  workAreas: [],
  targetPopulation: "",
  districtsServed: "",
  beneficiariesPerYear: "",
  existingCollaborations: "",
  campSupport: false,
  awarenessPrograms: false,
  screeningCamp: false,
  researchCollaboration: false,
  volunteerSupport: false,
  medicalSupport: false,
  longTermPartnership: false,
  csrPartnership: false,
  campType: "",
  expectedBeneficiaries: "",
  preferredDate: "",
  campLocation: "",
  notes: "",
  registrationCertificate: null,
  logo: null,
  activityImages: [],
};

const workAreaOptions = ["Healthcare", "Education", "Women Health", "Rural Outreach", "Mental Health", "Disability Support", "Nutrition", "Research"];

const intentOptions = [
  ["campSupport", "Camp Support"],
  ["awarenessPrograms", "Awareness Programs"],
  ["screeningCamp", "Screening Camp"],
  ["researchCollaboration", "Research Collaboration"],
  ["volunteerSupport", "Volunteer Support"],
  ["medicalSupport", "Medical Support"],
  ["longTermPartnership", "Long-Term Partnership"],
  ["csrPartnership", "CSR Partnership"],
];

const sectionColors = {
  Organisation: { accent: "#0EA5E9", light: "#E0F2FE", icon: "#0369A1" },
  Founder: { accent: "#8B5CF6", light: "#EDE9FE", icon: "#6D28D9" },
  Location: { accent: "#10B981", light: "#D1FAE5", icon: "#047857" },
  Collaboration: { accent: "#F59E0B", light: "#FEF3C7", icon: "#B45309" },
  "Partnership Intent": { accent: "#EC4899", light: "#FCE7F3", icon: "#BE185D" },
  "Camp Request": { accent: "#EF4444", light: "#FEE2E2", icon: "#B91C1C" },
  Uploads: { accent: "#6366F1", light: "#EEF2FF", icon: "#4338CA" },
};

function Field({ label, name, value, onChange, type = "text", error, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
      <label
        htmlFor={name}
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#64748B",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          height: "46px",
          borderRadius: "10px",
          border: error ? "1.5px solid #F87171" : "1.5px solid #E2E8F0",
          background: error ? "#FFF5F5" : "#FAFBFC",
          padding: "0 14px",
          fontSize: "14px",
          fontWeight: 500,
          color: "#0F172A",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "border-color 0.15s, box-shadow 0.15s",
          fontFamily: "'DM Sans', sans-serif",
        }}
        onFocus={e => {
          e.target.style.borderColor = "#0EA5E9";
          e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)";
          e.target.style.background = "#fff";
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? "#F87171" : "#E2E8F0";
          e.target.style.boxShadow = "none";
          e.target.style.background = error ? "#FFF5F5" : "#FAFBFC";
        }}
      />
      {error && (
        <span style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600 }}>{error}</span>
      )}
    </div>
  );
}

function TextArea({ label, name, value, onChange, error, span2 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: span2 ? "1 / -1" : undefined, minWidth: 0 }}>
      <label
        htmlFor={name}
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#64748B",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        style={{
          borderRadius: "10px",
          border: error ? "1.5px solid #F87171" : "1.5px solid #E2E8F0",
          background: error ? "#FFF5F5" : "#FAFBFC",
          padding: "12px 14px",
          fontSize: "14px",
          fontWeight: 500,
          color: "#0F172A",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          resize: "vertical",
          transition: "border-color 0.15s, box-shadow 0.15s",
          fontFamily: "'DM Sans', sans-serif",
        }}
        onFocus={e => {
          e.target.style.borderColor = "#0EA5E9";
          e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)";
          e.target.style.background = "#fff";
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? "#F87171" : "#E2E8F0";
          e.target.style.boxShadow = "none";
          e.target.style.background = error ? "#FFF5F5" : "#FAFBFC";
        }}
      />
      {error && (
        <span style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600 }}>{error}</span>
      )}
    </div>
  );
}

function UploadField({ label, multiple = false, name, onChange, span2 }) {
  const [fileName, setFileName] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: span2 ? "1 / -1" : undefined }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#64748B",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </label>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1.5px dashed #CBD5E1",
          background: "#F8FAFC",
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
      >
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "30px",
          height: "30px",
          borderRadius: "8px",
          background: "#E0F2FE",
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </span>
        <span style={{ fontSize: "13px", color: fileName ? "#0F172A" : "#94A3B8", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
          {fileName || (multiple ? "Choose files…" : "Choose file…")}
        </span>
        <input
          type="file"
          name={name}
          multiple={multiple}
          onChange={e => {
            const files = e.target.files;
            if (files?.length > 0) {
              setFileName(multiple ? `${files.length} file(s) selected` : files[0].name);
            }
            onChange(e);
          }}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}

function Section({ children, icon: Icon, title, stepNumber }) {
  const colors = sectionColors[title] || { accent: "#0EA5E9", light: "#E0F2FE", icon: "#0369A1" };
  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid #E8EEF4",
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 24px",
          borderBottom: "1px solid #F1F5F9",
          background: "linear-gradient(to right, " + colors.light + "60, #fff)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: colors.light,
            flexShrink: 0,
          }}
        >
          <Icon size={17} color={colors.icon} strokeWidth={2.2} />
        </div>
        <h2
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#0F172A",
            margin: 0,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </h2>
        <div
          style={{
            marginLeft: "auto",
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {stepNumber}
        </div>
      </div>

      {/* Section Body */}
      <div
        style={{
          padding: "20px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function NgoRegister({ onSubmit, loading, message, errors = {} }) {
  const [form, setForm] = useState(initialForm);

  function updateField(event) {
    const { checked, files, name, type, value } = event.target;
    if (type === "file") {
      setForm(cur => ({ ...cur, [name]: name === "activityImages" ? Array.from(files || []) : files?.[0] || null }));
      return;
    }
    if (type === "checkbox") {
      setForm(cur => ({ ...cur, [name]: checked }));
      return;
    }
    setForm(cur => ({ ...cur, [name]: value }));
  }

  function toggleWorkArea(area) {
    setForm(cur => ({
      ...cur,
      workAreas: cur.workAreas.includes(area)
        ? cur.workAreas.filter(i => i !== area)
        : [...cur.workAreas, area],
    }));
  }

  function serializeFile(file) {
    if (!file) return null;
    return { name: file.name, size: file.size, type: file.type };
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      email: form.organisationEmail,
      phone: form.organisationPhone,
      ngoType: "other",
      campRequest: {
        campType: form.campType,
        expectedBeneficiaries: form.expectedBeneficiaries,
        preferredDate: form.preferredDate,
        campLocation: form.campLocation,
        notes: form.notes,
      },
      partnershipIntent: Object.fromEntries(intentOptions.map(([key]) => [key, form[key]])),
      uploads: {
        registrationCertificate: serializeFile(form.registrationCertificate),
        logo: serializeFile(form.logo),
        activityImages: form.activityImages.map(serializeFile),
      },
    });
  }

  const selectStyle = {
    height: "46px",
    borderRadius: "10px",
    border: "1.5px solid #E2E8F0",
    background: "#FAFBFC",
    padding: "0 14px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#0F172A",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: "38px",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      {/* Page Header */}
      <div
        style={{
          marginBottom: "28px",
          paddingBottom: "24px",
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "13px",
              background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Handshake size={22} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#0F172A",
                margin: 0,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Register Your Organisation
            </h1>
            <p style={{ fontSize: "14px", color: "#64748B", margin: "2px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
              Complete all sections to join our NGO partnership network
            </p>
          </div>
        </div>

        {/* Progress pill steps */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "16px" }}>
          {["Organisation", "Founder", "Location", "Collaboration", "Partnership", "Camp", "Uploads"].map((step, i) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: "#F1F5F9",
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748B",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: Object.values(sectionColors)[i]?.accent || "#0EA5E9",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      </div>

      <form style={{ display: "flex", flexDirection: "column", gap: "16px" }} onSubmit={submit}>

        {/* 1. Organisation */}
        <Section icon={Building2} title="Organisation" stepNumber={1}>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field
              error={errors.organisationName || errors.organizationName}
              label="Organisation Name"
              name="organisationName"
              onChange={updateField}
              value={form.organisationName}
              placeholder="e.g. Arogya Sewa Foundation"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B", fontFamily: "'DM Sans', sans-serif" }}>
              Organisation Type
            </label>
            <select name="organisationType" onChange={updateField} value={form.organisationType} style={selectStyle}>
              {["healthcare", "education", "community", "research", "environment", "other"].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          <Field label="Year Established" name="yearEstablished" onChange={updateField} type="number" value={form.yearEstablished} placeholder="e.g. 2010" />
          <Field error={errors.registrationNumber} label="Registration Number" name="registrationNumber" onChange={updateField} value={form.registrationNumber} placeholder="e.g. MH/2010/0012345" />
          <Field label="Website" name="website" onChange={updateField} type="url" value={form.website} placeholder="https://yourngo.org" />
          <Field error={errors.email} label="Organisation Email" name="organisationEmail" onChange={updateField} type="email" value={form.organisationEmail} placeholder="info@yourngo.org" />
          <Field error={errors.phone} label="Organisation Phone" name="organisationPhone" onChange={updateField} value={form.organisationPhone} placeholder="+91 98765 43210" />
          <Field error={errors.password} label="Password" name="password" onChange={updateField} type="password" value={form.password} placeholder="Create a strong password" />
        </Section>

        {/* 2. Founder */}
        <Section icon={UserRound} title="Founder" stepNumber={2}>
          <Field label="Founder Name" name="founderName" onChange={updateField} value={form.founderName} placeholder="Full name" />
          <Field label="Designation" name="designation" onChange={updateField} value={form.designation} placeholder="e.g. Executive Director" />
          <Field error={errors.representativeEmail} label="Representative Email" name="representativeEmail" onChange={updateField} type="email" value={form.representativeEmail} placeholder="representative@yourngo.org" />
          <Field label="Representative Phone" name="representativePhone" onChange={updateField} value={form.representativePhone} placeholder="+91 98765 43210" />
        </Section>

        {/* 3. Location */}
        <Section icon={MapPin} title="Location" stepNumber={3}>
          <TextArea error={errors.address} label="Address" name="address" onChange={updateField} value={form.address} span2 />
          <Field error={errors.city} label="City" name="city" onChange={updateField} value={form.city} placeholder="e.g. Mumbai" />
          <Field label="State" name="state" onChange={updateField} value={form.state} placeholder="e.g. Maharashtra" />
          <Field label="Pincode" name="pincode" onChange={updateField} value={form.pincode} placeholder="e.g. 400001" />
          <Field label="Country" name="country" onChange={updateField} value={form.country} />
        </Section>

        {/* 4. Collaboration */}
        <Section icon={Handshake} title="Collaboration" stepNumber={4}>
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B", marginBottom: "10px", fontFamily: "'DM Sans', sans-serif" }}>
              Work Areas
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {workAreaOptions.map(area => {
                const active = form.workAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleWorkArea(area)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: active ? "1.5px solid #0EA5E9" : "1.5px solid #E2E8F0",
                      background: active ? "#E0F2FE" : "#F8FAFC",
                      color: active ? "#0369A1" : "#64748B",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {active && <span style={{ marginRight: "4px" }}>✓</span>}
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Target Population" name="targetPopulation" onChange={updateField} value={form.targetPopulation} placeholder="e.g. Women, Children, Elderly" />
          <Field label="Districts Served" name="districtsServed" onChange={updateField} value={form.districtsServed} placeholder="e.g. Pune, Nashik, Aurangabad" />
          <Field label="Beneficiaries Per Year" name="beneficiariesPerYear" onChange={updateField} type="number" value={form.beneficiariesPerYear} placeholder="e.g. 5000" />
          <TextArea label="Existing Collaborations" name="existingCollaborations" onChange={updateField} value={form.existingCollaborations} span2 />
        </Section>

        {/* 5. Partnership Intent */}
        <Section icon={Handshake} title="Partnership Intent" stepNumber={5}>
          <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
            {intentOptions.map(([key, label]) => {
              const checked = form[key];
              return (
                <label
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: checked ? "1.5px solid #EC4899" : "1.5px solid #E2E8F0",
                    background: checked ? "#FDF2F8" : "#FAFBFC",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "5px",
                      border: checked ? "none" : "1.5px solid #CBD5E1",
                      background: checked ? "#EC4899" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <input
                    checked={checked}
                    name={key}
                    onChange={updateField}
                    type="checkbox"
                    style={{ display: "none" }}
                  />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: checked ? "#BE185D" : "#475569", fontFamily: "'DM Sans', sans-serif" }}>
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </Section>

        {/* 6. Camp Request */}
        <Section icon={CalendarDays} title="Camp Request" stepNumber={6}>
          <Field label="Camp Type" name="campType" onChange={updateField} value={form.campType} placeholder="e.g. Eye Camp, Blood Donation" />
          <Field label="Expected Beneficiaries" name="expectedBeneficiaries" onChange={updateField} type="number" value={form.expectedBeneficiaries} placeholder="e.g. 500" />
          <Field label="Preferred Date" name="preferredDate" onChange={updateField} type="date" value={form.preferredDate} />
          <Field label="Camp Location" name="campLocation" onChange={updateField} value={form.campLocation} placeholder="Village / Town / City" />
          <TextArea label="Additional Notes" name="notes" onChange={updateField} value={form.notes} span2 />
        </Section>

        {/* 7. Uploads */}
        <Section icon={FileUp} title="Uploads" stepNumber={7}>
          <UploadField label="Registration Certificate" name="registrationCertificate" onChange={updateField} />
          <UploadField label="Organisation Logo" name="logo" onChange={updateField} />
          <UploadField label="Activity Images" multiple name="activityImages" onChange={updateField} span2 />
        </Section>

        {/* Message */}
        {message && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "16px" }}>✅</span>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#166534", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{message}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          disabled={loading}
          type="submit"
          style={{
            height: "52px",
            borderRadius: "13px",
            border: "none",
            background: loading ? "#94A3B8" : "linear-gradient(135deg, #0EA5E9 0%, #6366F1 50%, #EC4899 100%)",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "opacity 0.15s, transform 0.1s",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.01em",
            boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.3)",
          }}
          onMouseEnter={e => { if (!loading) e.target.style.opacity = "0.92"; }}
          onMouseLeave={e => { e.target.style.opacity = "1"; }}
          onMouseDown={e => { if (!loading) e.target.style.transform = "scale(0.99)"; }}
          onMouseUp={e => { e.target.style.transform = "scale(1)"; }}
        >
          {loading ? "Submitting…" : "Register Organisation →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#94A3B8", margin: "0 0 8px", fontFamily: "'DM Sans', sans-serif" }}>
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </>
  );
}