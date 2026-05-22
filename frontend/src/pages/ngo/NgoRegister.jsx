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

function Field({ label, name, value, onChange, type = "text", error }) {
  return (
    <label className="min-w-0">
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <input
        className={`mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 ${error ? "border-rose-300" : "border-slate-200"}`}
        name={name}
        onChange={onChange}
        type={type}
        value={value}
      />
      {error ? <p className="mt-1 text-xs font-bold text-rose-600">{error}</p> : null}
    </label>
  );
}

function TextArea({ label, name, value, onChange, error }) {
  return (
    <label className="min-w-0 md:col-span-2">
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <textarea
        className={`mt-2 min-h-24 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 ${error ? "border-rose-300" : "border-slate-200"}`}
        name={name}
        onChange={onChange}
        value={value}
      />
      {error ? <p className="mt-1 text-xs font-bold text-rose-600">{error}</p> : null}
    </label>
  );
}

function UploadField({ label, multiple = false, name, onChange }) {
  return (
    <label className={multiple ? "md:col-span-2" : ""}>
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold" multiple={multiple} name={name} onChange={onChange} type="file" />
    </label>
  );
}

function Section({ children, icon: Icon, title }) {
  return (
    <fieldset className="rounded-3xl border border-slate-200 bg-white/88 p-5 shadow-[0_18px_55px_rgba(4,28,50,0.07)]">
      <legend className="mb-4 flex items-center gap-2 px-1 text-sm font-black text-[#041C32]">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </legend>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function NgoRegister({ onSubmit, loading, message, errors = {} }) {
  const [form, setForm] = useState(initialForm);

  function updateField(event) {
    const { checked, files, name, type, value } = event.target;
    if (type === "file") {
      setForm((current) => ({ ...current, [name]: name === "activityImages" ? Array.from(files || []) : files?.[0] || null }));
      return;
    }
    if (type === "checkbox") {
      setForm((current) => ({ ...current, [name]: checked }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleWorkArea(area) {
    setForm((current) => ({
      ...current,
      workAreas: current.workAreas.includes(area)
        ? current.workAreas.filter((item) => item !== area)
        : [...current.workAreas, area],
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
      organisationType: form.organisationType,
      organizationName: form.organisationName,
      organizationType: form.organisationType,
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

  return (
    <form className="grid gap-5" onSubmit={submit}>
      <Section icon={Building2} title="Organisation">
        <Field error={errors.organisationName || errors.organizationName} label="Organisation Name" name="organisationName" onChange={updateField} value={form.organisationName} />
        <label>
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Organisation Type</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none" name="organisationType" onChange={updateField} value={form.organisationType}>
            {["healthcare", "education", "community", "research", "environment", "other"].map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <Field label="Year Established" name="yearEstablished" onChange={updateField} type="number" value={form.yearEstablished} />
        <Field error={errors.registrationNumber} label="Registration Number" name="registrationNumber" onChange={updateField} value={form.registrationNumber} />
        <Field label="Website" name="website" onChange={updateField} type="url" value={form.website} />
        <Field error={errors.email} label="Organisation Email" name="organisationEmail" onChange={updateField} type="email" value={form.organisationEmail} />
        <Field error={errors.phone} label="Organisation Phone" name="organisationPhone" onChange={updateField} value={form.organisationPhone} />
        <Field error={errors.password} label="Password" name="password" onChange={updateField} type="password" value={form.password} />
      </Section>

      <Section icon={UserRound} title="Founder">
        <Field label="Founder Name" name="founderName" onChange={updateField} value={form.founderName} />
        <Field label="Designation" name="designation" onChange={updateField} value={form.designation} />
        <Field error={errors.representativeEmail} label="Representative Email" name="representativeEmail" onChange={updateField} type="email" value={form.representativeEmail} />
        <Field label="Representative Phone" name="representativePhone" onChange={updateField} value={form.representativePhone} />
      </Section>

      <Section icon={MapPin} title="Location">
        <TextArea error={errors.address} label="Address" name="address" onChange={updateField} value={form.address} />
        <Field error={errors.city} label="City" name="city" onChange={updateField} value={form.city} />
        <Field label="State" name="state" onChange={updateField} value={form.state} />
        <Field label="Pincode" name="pincode" onChange={updateField} value={form.pincode} />
        <Field label="Country" name="country" onChange={updateField} value={form.country} />
      </Section>

      <Section icon={Handshake} title="Collaboration">
        <div className="md:col-span-2">
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Work Areas</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {workAreaOptions.map((area) => (
              <button className={`rounded-full px-4 py-2 text-xs font-black transition ${form.workAreas.includes(area) ? "bg-[#041C32] text-white" : "bg-slate-100 text-slate-600 hover:bg-cyan-50"}`} key={area} onClick={() => toggleWorkArea(area)} type="button">
                {area}
              </button>
            ))}
          </div>
        </div>
        <Field label="Target Population" name="targetPopulation" onChange={updateField} value={form.targetPopulation} />
        <Field label="Districts Served" name="districtsServed" onChange={updateField} value={form.districtsServed} />
        <Field label="Beneficiaries Per Year" name="beneficiariesPerYear" onChange={updateField} type="number" value={form.beneficiariesPerYear} />
        <TextArea label="Existing Collaborations" name="existingCollaborations" onChange={updateField} value={form.existingCollaborations} />
      </Section>

      <Section icon={Handshake} title="Partnership Intent">
        <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
          {intentOptions.map(([key, label]) => (
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700" key={key}>
              <input checked={form[key]} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-400" name={key} onChange={updateField} type="checkbox" />
              {label}
            </label>
          ))}
        </div>
      </Section>

      <Section icon={CalendarDays} title="Camp Request">
        <Field label="Camp Type" name="campType" onChange={updateField} value={form.campType} />
        <Field label="Expected Beneficiaries" name="expectedBeneficiaries" onChange={updateField} type="number" value={form.expectedBeneficiaries} />
        <Field label="Preferred Date" name="preferredDate" onChange={updateField} type="date" value={form.preferredDate} />
        <Field label="Camp Location" name="campLocation" onChange={updateField} value={form.campLocation} />
        <TextArea label="Notes" name="notes" onChange={updateField} value={form.notes} />
      </Section>

      <Section icon={FileUp} title="Uploads">
        <UploadField label="Registration Certificate" name="registrationCertificate" onChange={updateField} />
        <UploadField label="Logo" name="logo" onChange={updateField} />
        <UploadField label="Activity Images" multiple name="activityImages" onChange={updateField} />
      </Section>

      {message ? <p className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-800">{message}</p> : null}

      <button className="h-14 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 px-8 text-base font-black text-white shadow-lg shadow-cyan-500/20 disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "Submitting..." : "Register Organisation"}
      </button>
    </form>
  );
}
