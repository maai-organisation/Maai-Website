import { lazy, Suspense, useEffect, useState } from "react";
import CMSImagePreview from "./CMSImagePreview";
import CMSRichTextEditor from "./CMSRichTextEditor";
import Icon from "../shared/Icon";

const VisualTemplateEditor = lazy(() => import("./VisualTemplateEditor"));

function TemplateEditorFallback() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-black text-slate-500">
      Loading visual editor...
    </div>
  );
}

const initialForm = {
  title: "",
  slug: "",
  description: "",
  imageUrl: "",
  status: "draft",
  orderIndex: 0,
  tags: "",
};

const socialInitialForm = {
  platform: "instagram",
  url: "",
  icon: "instagram",
  status: "published",
  orderIndex: 0,
};

const teamInitialForm = {
  fullName: "",
  designation: "",
  department: "",
  bio: "",
  imageUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  email: "",
  status: "published",
  orderIndex: 0,
};

const mentorInitialForm = {
  fullName: "",
  designation: "",
  organization: "",
  specialization: "",
  bio: "",
  imageUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  email: "",
  featured: false,
  status: "published",
  orderIndex: 0,
};

const initiativeInitialForm = {
  title: "",
  slug: "",
  category: "other",
  shortDescription: "",
  description: "",
  imageUrl: "",
  bannerUrl: "",
  featured: false,
  visibility: "public",
  status: "published",
  orderIndex: 0,
  startDate: "",
  endDate: "",
};

const reelInitialForm = {
  title: "",
  slug: "",
  platform: "instagram",
  videoUrl: "",
  thumbnailUrl: "",
  caption: "",
  description: "",
  initiativeId: "",
  featured: false,
  status: "published",
  orderIndex: 0,
  publishedAt: "",
};

const testimonialInitialForm = {
  fullName: "",
  designation: "",
  organization: "",
  category: "volunteer",
  testimonial: "",
  imageUrl: "",
  rating: 5,
  featured: false,
  status: "published",
  orderIndex: 0,
};

const careerInitialForm = {
  title: "",
  slug: "",
  department: "",
  roleType: "volunteer",
  location: "",
  description: "",
  requirements: "",
  responsibilities: "",
  imageUrl: "",
  featured: false,
  visibility: "public",
  status: "published",
  orderIndex: 0,
  applicationDeadline: "",
};

const idTemplateInitialForm = {
  name: "",
  templateType: "membership",
  frontBackgroundUrl: "https://i.postimg.cc/CLPrycq0/Front-Side.png",
  backBackgroundUrl: "https://i.postimg.cc/prVC4jVY/Back-Side.png",
  logoUrl: "",
  headerText: "Maai Membership Card",
  footerText: "If found, please contact Maai organisation.",
  fieldConfig: {
    full_name: { enabled: true, x: 96, y: 170, width: 640, height: 54, fontSize: 34, color: "#0f172a", side: "front" },
    membership_number: { enabled: true, x: 96, y: 285, width: 420, height: 40, fontSize: 24, color: "#0f172a", side: "front" },
    college: { enabled: true, x: 96, y: 435, width: 620, height: 36, fontSize: 22, color: "#0f172a", side: "front" },
    role: { enabled: true, x: 96, y: 345, width: 320, height: 34, fontSize: 22, color: "#0f172a", side: "front" },
    status: { enabled: true, x: 96, y: 390, width: 320, height: 34, fontSize: 22, color: "#0f766e", side: "front" },
    verification_code: { enabled: true, x: 96, y: 520, width: 420, height: 34, fontSize: 20, color: "#0f172a", side: "front" },
    barcode: { enabled: true, x: 96, y: 600, width: 260, height: 46, fontSize: 18, color: "#000000", side: "front", type: "barcode" },
    qr: { enabled: true, x: 900, y: 245, width: 154, height: 154, fontSize: 18, color: "#000000", side: "back", type: "qr" },
  },
  isDefault: false,
  status: "draft",
};

const certificateTemplateInitialForm = {
  name: "",
  certificateType: "event",
  backgroundUrl: "https://i.postimg.cc/CLPrycq0/Front-Side.png",
  logoUrl: "https://i.postimg.cc/prVC4jVY/Back-Side.png",
  headerText: "Certificate",
  bodyTemplate: "This certifies that {{full_name}} participated in {{event_name}}.\nCertificate ID: {{certificate_id}}",
  footerText: "Issued by Maai organisation.",
  signatureName: "",
  signatureDesignation: "",
  fieldConfig: {
    full_name: { enabled: true, x: 100, y: 360, width: 420, height: 44, fontSize: 26, color: "#000000", side: "front" },
    membership_number: { enabled: true, x: 100, y: 420, width: 360, height: 38, fontSize: 22, color: "#000000", side: "front" },
    college: { enabled: true, x: 100, y: 480, width: 420, height: 38, fontSize: 22, color: "#000000", side: "front" },
    role: { enabled: true, x: 100, y: 540, width: 300, height: 36, fontSize: 20, color: "#000000", side: "front" },
    verification_code: { enabled: true, x: 100, y: 590, width: 360, height: 34, fontSize: 20, color: "#000000", side: "front" },
    issue_date: { enabled: true, x: 100, y: 635, width: 260, height: 34, fontSize: 18, color: "#000000", side: "front" },
    barcode: { enabled: true, x: 100, y: 690, width: 260, height: 44, fontSize: 18, color: "#000000", side: "front", type: "barcode" },
    qr: { enabled: true, x: 930, y: 610, width: 96, height: 96, fontSize: 18, color: "#000000", side: "front", type: "qr" },
  },
  isDefault: false,
  status: "draft",
};

const emailTemplateInitialForm = {
  name: "",
  emailType: "membership_verified",
  subject: "",
  bodyTemplate: "Hello {{full_name}},\n\nYour Maai update for {{event_name}} is ready.",
  isDefault: false,
  status: "draft",
};

const socialPlatforms = [
  "instagram",
  "linkedin",
  "youtube",
  "twitter",
  "facebook",
  "website",
  "whatsapp",
  "telegram",
  "discord",
];

const initiativeCategories = ["awareness", "camp", "research", "education", "advocacy", "community", "conference", "other"];
const initiativeVisibilities = ["public", "volunteers", "internal"];
const reelPlatforms = ["instagram", "youtube", "external"];
const testimonialCategories = ["volunteer", "mentor", "ngo", "partner", "beneficiary", "speaker", "other"];
const careerRoleTypes = ["volunteer", "internship", "leadership", "research", "operations", "design", "it", "community", "other"];
const careerVisibilities = ["public", "members_only", "internal"];
const certificateTypes = ["membership", "event", "participation", "leadership", "recognition", "volunteer_hours", "other"];
const certificateFrontTemplateUrl = "https://i.postimg.cc/CLPrycq0/Front-Side.png";
const certificateBackTemplateUrl = "https://i.postimg.cc/prVC4jVY/Back-Side.png";
const emailTypes = [
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
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CMSFormModal({ item, moduleKey, moduleLabel, onClose, onSubmit }) {
  const isSocialLinks = moduleKey === "social-links";
  const isTeam = moduleKey === "team";
  const isMentors = moduleKey === "mentors";
  const isInitiatives = moduleKey === "initiatives";
  const isReels = moduleKey === "reels";
  const isTestimonials = moduleKey === "testimonials";
  const isCareers = moduleKey === "careers";
  const isIdTemplates = moduleKey === "id-templates";
  const isCertificateTemplates = moduleKey === "certificate-templates";
  const isEmailTemplates = moduleKey === "email-templates";
  const [form, setForm] = useState(
    isSocialLinks ? socialInitialForm : isTeam ? teamInitialForm : isMentors ? mentorInitialForm : isInitiatives ? initiativeInitialForm : isReels ? reelInitialForm : isTestimonials ? testimonialInitialForm : isCareers ? careerInitialForm : isIdTemplates ? idTemplateInitialForm : isCertificateTemplates ? certificateTemplateInitialForm : isEmailTemplates ? emailTemplateInitialForm : initialForm,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
    if (!item) {
      setForm(
        isSocialLinks ? socialInitialForm : isTeam ? teamInitialForm : isMentors ? mentorInitialForm : isInitiatives ? initiativeInitialForm : isReels ? reelInitialForm : isTestimonials ? testimonialInitialForm : isCareers ? careerInitialForm : isIdTemplates ? idTemplateInitialForm : isCertificateTemplates ? certificateTemplateInitialForm : isEmailTemplates ? emailTemplateInitialForm : initialForm,
      );
      return;
    }
    if (isSocialLinks) {
      setForm({
        platform: item.platform || "instagram",
        url: item.url || "",
        icon: item.icon || item.platform || "instagram",
        status: item.status || "published",
        orderIndex: item.orderIndex ?? item.order_index ?? 0,
      });
      return;
    }
    if (isTeam) {
      setForm({
        fullName: item.fullName || item.full_name || item.name || "",
        designation: item.designation || "",
        department: item.department || "",
        bio: item.bio || "",
        imageUrl: item.imageUrl || item.image_url || item.image || "",
        linkedinUrl: item.linkedinUrl || item.linkedin_url || item.linkedin || "",
        instagramUrl: item.instagramUrl || item.instagram_url || item.instagram || "",
        email: item.email || "",
        status: item.status || "published",
        orderIndex: item.orderIndex ?? item.order_index ?? 0,
      });
      return;
    }
    if (isMentors) {
      setForm({
        fullName: item.fullName || item.full_name || item.name || "",
        designation: item.designation || "",
        organization: item.organization || "",
        specialization: item.specialization || item.category || "",
        bio: item.bio || "",
        imageUrl: item.imageUrl || item.image_url || item.image || "",
        linkedinUrl: item.linkedinUrl || item.linkedin_url || item.linkedin || "",
        instagramUrl: item.instagramUrl || item.instagram_url || item.instagram || "",
        email: item.email || "",
        featured: Boolean(item.featured),
        status: item.status || "published",
        orderIndex: item.orderIndex ?? item.order_index ?? 0,
      });
      return;
    }
    if (isInitiatives) {
      setForm({
        title: item.title || "",
        slug: item.slug || "",
        category: item.category || "other",
        shortDescription: item.shortDescription || item.short_description || item.subtitle || "",
        description: item.description || "",
        imageUrl: item.imageUrl || item.image_url || item.image || "",
        bannerUrl: item.bannerUrl || item.banner_url || "",
        featured: Boolean(item.featured),
        visibility: item.visibility || "public",
        status: item.status || "published",
        orderIndex: item.orderIndex ?? item.order_index ?? 0,
        startDate: item.startDate || item.start_date || "",
        endDate: item.endDate || item.end_date || "",
      });
      return;
    }
    if (isReels) {
      setForm({
        title: item.title || "",
        slug: item.slug || "",
        platform: item.platform || "external",
        videoUrl: item.videoUrl || item.video_url || "",
        thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || item.thumbnail || "",
        caption: item.caption || "",
        description: item.description || "",
        initiativeId: item.initiativeId || item.initiative_id || "",
        featured: Boolean(item.featured),
        status: item.status || "published",
        orderIndex: item.orderIndex ?? item.order_index ?? 0,
        publishedAt: item.publishedAt || item.published_at || "",
      });
      return;
    }
    if (isTestimonials) {
      setForm({
        fullName: item.fullName || item.full_name || item.name || "",
        designation: item.designation || item.role || "",
        organization: item.organization || "",
        category: item.category || "volunteer",
        testimonial: item.testimonial || item.quote || "",
        imageUrl: item.imageUrl || item.image_url || item.image || "",
        rating: item.rating || 5,
        featured: Boolean(item.featured),
        status: item.status || "published",
        orderIndex: item.orderIndex ?? item.order_index ?? 0,
      });
      return;
    }
    if (isCareers) {
      setForm({
        title: item.title || "",
        slug: item.slug || "",
        department: item.department || "",
        roleType: item.roleType || item.role_type || item.type || "volunteer",
        location: item.location || "",
        description: item.description || "",
        requirements: item.requirements || "",
        responsibilities: item.responsibilities || "",
        imageUrl: item.imageUrl || item.image_url || item.image || "",
        featured: Boolean(item.featured),
        visibility: item.visibility || "public",
        status: item.status || "published",
        orderIndex: item.orderIndex ?? item.order_index ?? 0,
        applicationDeadline: item.applicationDeadline || item.application_deadline || "",
      });
      return;
    }
    if (isIdTemplates) {
      setForm({
        name: item.name || item.title || "",
        templateType: item.templateType || item.template_type || "membership",
        frontBackgroundUrl: item.frontBackgroundUrl || item.front_background_url || "",
        backBackgroundUrl: item.backBackgroundUrl || item.back_background_url || "",
        logoUrl: item.logoUrl || item.logo_url || "",
        headerText: item.headerText || item.header_text || "",
        footerText: item.footerText || item.footer_text || "",
        fieldConfig: item.fieldConfig || item.field_config || idTemplateInitialForm.fieldConfig,
        isDefault: Boolean(item.isDefault || item.is_default),
        status: item.status || "draft",
      });
      return;
    }
    if (isCertificateTemplates) {
      setForm({
        name: item.name || item.title || "",
        certificateType: item.certificateType || item.certificate_type || "event",
        backgroundUrl: item.backgroundUrl || item.background_url || "",
        logoUrl: item.logoUrl || item.logo_url || "",
        headerText: item.headerText || item.header_text || "",
        bodyTemplate: item.bodyTemplate || item.body_template || "",
        footerText: item.footerText || item.footer_text || "",
        signatureName: item.signatureName || item.signature_name || "",
        signatureDesignation: item.signatureDesignation || item.signature_designation || "",
        fieldConfig: item.fieldConfig || item.field_config || certificateTemplateInitialForm.fieldConfig,
        isDefault: Boolean(item.isDefault || item.is_default),
        status: item.status || "draft",
      });
      return;
    }
    if (isEmailTemplates) {
      setForm({
        name: item.name || item.title || "",
        emailType: item.emailType || item.email_type || "membership_verified",
        subject: item.subject || "",
        bodyTemplate: item.bodyTemplate || item.body_template || "",
        isDefault: Boolean(item.isDefault || item.is_default),
        status: item.status || "draft",
      });
      return;
    }
    setForm({
      title: item.title || "",
      slug: item.slug || "",
      description: item.description || "",
      imageUrl: item.imageUrl || item.image_url || "",
      status: item.status || "draft",
      orderIndex: item.orderIndex ?? item.order_index ?? 0,
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
    });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isCareers, isCertificateTemplates, isEmailTemplates, isIdTemplates, isInitiatives, isMentors, isReels, isSocialLinks, isTeam, isTestimonials, item]);

  function updateField(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      ...(name === "platform" ? { icon: value } : {}),
      [name]: type === "checkbox" ? checked : value,
      ...(name === "title" && !item ? { slug: slugify(value) } : {}),
    }));
  }

  function updateTemplateFieldConfig(fieldConfig) {
    setForm((current) => ({
      ...current,
      fieldConfig,
    }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <form className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${isCertificateTemplates || isIdTemplates ? "max-w-6xl" : "max-w-2xl"}`} onSubmit={submit}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-600">CMS Form</p>
            <h2 className="text-xl font-black">{item ? "Edit" : "Create"} {moduleLabel}</h2>
          </div>
          <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black" onClick={onClose} type="button">Close</button>
        </div>
        {isSocialLinks ? (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Platform</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="platform" onChange={updateField} value={form.platform}>
                  {socialPlatforms.map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateField} value={form.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">URL</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="url" onChange={updateField} type="url" value={form.url} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Icon</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="icon" onChange={updateField} value={form.icon} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Order</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="orderIndex" onChange={updateField} type="number" value={form.orderIndex} />
              </label>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Live Preview</span>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-cyan-700">
                  <Icon className="h-5 w-5" name={form.icon || form.platform} />
                </span>
                <span className="capitalize text-slate-700">{form.icon || form.platform}</span>
                {form.url ? (
                  <a className="break-all text-cyan-700 underline" href={form.url} target="_blank" rel="noreferrer">{form.url}</a>
                ) : (
                  <span className="text-slate-400">URL preview</span>
                )}
              </div>
            </div>
          </div>
        ) : isEmailTemplates ? (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Template Name</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="name" onChange={updateField} value={form.name} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Email Type</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="emailType" onChange={updateField} value={form.emailType}>
                  {emailTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Subject</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="subject" onChange={updateField} value={form.subject} />
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Body Template</span>
              <textarea className="mt-2 min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="bodyTemplate" onChange={updateField} value={form.bodyTemplate} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateField} value={form.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-bold leading-6 text-slate-500">
                Variables: {"{{full_name}}"}, {"{{event_name}}"}, {"{{certificate_name}}"}, {"{{membership_status}}"}, {"{{camp_name}}"}, {"{{ngo_name}}"}, {"{{verification_code}}"}
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">
              <input checked={Boolean(form.isDefault)} name="isDefault" onChange={updateField} type="checkbox" />
              Default for this email type
            </label>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Live Preview</span>
              <h3 className="mt-3 text-base font-black text-slate-900">
                {(form.subject || "Subject").replaceAll("{{full_name}}", "Volunteer Name").replaceAll("{{event_name}}", "Maai Event").replaceAll("{{certificate_name}}", "Certificate").replaceAll("{{membership_status}}", "verified").replaceAll("{{camp_name}}", "Health Camp").replaceAll("{{ngo_name}}", "Partner NGO").replaceAll("{{verification_code}}", "MAAI-ABC123")}
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-600">
                {(form.bodyTemplate || "Email body").replaceAll("{{full_name}}", "Volunteer Name").replaceAll("{{event_name}}", "Maai Event").replaceAll("{{certificate_name}}", "Certificate").replaceAll("{{membership_status}}", "verified").replaceAll("{{camp_name}}", "Health Camp").replaceAll("{{ngo_name}}", "Partner NGO").replaceAll("{{verification_code}}", "MAAI-ABC123")}
              </p>
            </div>
          </div>
        ) : isCertificateTemplates ? (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Template Name</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="name" onChange={updateField} value={form.name} /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Certificate Type</span><select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="certificateType" onChange={updateField} value={form.certificateType}>{certificateTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Background URL</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="backgroundUrl" onChange={updateField} type="url" value={form.backgroundUrl} /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Logo URL</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="logoUrl" onChange={updateField} type="url" value={form.logoUrl} /></label>
            </div>
            <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Header Text</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="headerText" onChange={updateField} value={form.headerText} /></label>
            <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Body Template</span><textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="bodyTemplate" onChange={updateField} value={form.bodyTemplate} /></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Footer Text</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="footerText" onChange={updateField} value={form.footerText} /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span><select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateField} value={form.status}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Signature Name</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="signatureName" onChange={updateField} value={form.signatureName} /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Signature Designation</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="signatureDesignation" onChange={updateField} value={form.signatureDesignation} /></label>
            </div>
            <Suspense fallback={<TemplateEditorFallback />}>
              <VisualTemplateEditor
                backImageUrl={certificateBackTemplateUrl}
                fieldConfig={form.fieldConfig}
                frontImageUrl={certificateFrontTemplateUrl}
                onChange={updateTemplateFieldConfig}
              />
            </Suspense>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700"><input checked={Boolean(form.isDefault)} name="isDefault" onChange={updateField} type="checkbox" /> Default for this certificate type</label>
          </div>
        ) : isIdTemplates ? (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Template Name</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="name" onChange={updateField} value={form.name} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateField} value={form.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Front Background URL</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="frontBackgroundUrl" onChange={updateField} type="url" value={form.frontBackgroundUrl} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Back Background URL</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="backBackgroundUrl" onChange={updateField} type="url" value={form.backBackgroundUrl} />
              </label>
            </div>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Logo URL</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="logoUrl" onChange={updateField} type="url" value={form.logoUrl} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Header Text</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="headerText" onChange={updateField} value={form.headerText} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Footer Text</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="footerText" onChange={updateField} value={form.footerText} />
              </label>
            </div>
            <Suspense fallback={<TemplateEditorFallback />}>
              <VisualTemplateEditor
                backImageUrl={form.backBackgroundUrl}
                fieldConfig={form.fieldConfig}
                frontImageUrl={form.frontBackgroundUrl}
                onChange={updateTemplateFieldConfig}
              />
            </Suspense>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">
              <input checked={Boolean(form.isDefault)} name="isDefault" onChange={updateField} type="checkbox" />
              Default template
            </label>
          </div>
        ) : isInitiatives || isReels ? (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Title</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="title" onChange={updateField} value={form.title} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Slug</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="slug" onChange={updateField} value={form.slug || slugify(form.title)} />
              </label>
            </div>
            {isReels ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Platform</span>
                  <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="platform" onChange={updateField} value={form.platform}>
                    {reelPlatforms.map((platform) => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Related Initiative</span>
                  <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="initiativeId" onChange={updateField} placeholder="Initiative ID" value={form.initiativeId} />
                </label>
              </div>
            ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Category</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="category" onChange={updateField} value={form.category}>
                  {initiativeCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Visibility</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="visibility" onChange={updateField} value={form.visibility}>
                  {initiativeVisibilities.map((visibility) => (
                    <option key={visibility} value={visibility}>{visibility}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateField} value={form.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            )}
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isReels ? "Caption" : "Short Description"}</span>
              <textarea className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name={isReels ? "caption" : "shortDescription"} onChange={updateField} value={isReels ? form.caption : form.shortDescription} />
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isReels ? "Description" : "Long Description"}</span>
              <textarea className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="description" onChange={updateField} value={form.description} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isReels ? "Video URL" : "Image URL"}</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name={isReels ? "videoUrl" : "imageUrl"} onChange={updateField} type="url" value={isReels ? form.videoUrl : form.imageUrl} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isReels ? "Thumbnail URL" : "Banner URL"}</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name={isReels ? "thumbnailUrl" : "bannerUrl"} onChange={updateField} type="url" value={isReels ? form.thumbnailUrl : form.bannerUrl} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <CMSImagePreview url={isReels ? form.thumbnailUrl : form.imageUrl} />
              {isReels ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600">
                  {form.videoUrl ? <a className="break-all text-cyan-700 underline" href={form.videoUrl} target="_blank" rel="noreferrer">{form.videoUrl}</a> : "Video preview URL"}
                </div>
              ) : (
                <CMSImagePreview url={form.bannerUrl} />
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isReels ? "Publish Date" : "Start Date"}</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name={isReels ? "publishedAt" : "startDate"} onChange={updateField} type="date" value={isReels ? (form.publishedAt ? String(form.publishedAt).slice(0, 10) : "") : (form.startDate ? String(form.startDate).slice(0, 10) : "")} />
              </label>
              {!isReels ? (
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">End Date</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="endDate" onChange={updateField} type="date" value={form.endDate ? String(form.endDate).slice(0, 10) : ""} />
              </label>
              ) : null}
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Order Index</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="orderIndex" onChange={updateField} type="number" value={form.orderIndex} />
              </label>
              {isReels ? (
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateField} value={form.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              ) : null}
            </div>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">
              <input checked={Boolean(form.featured)} name="featured" onChange={updateField} type="checkbox" />
              Featured initiative
            </label>
          </div>
        ) : isCareers ? (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Title</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="title" onChange={updateField} value={form.title} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Slug</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="slug" onChange={updateField} value={form.slug || slugify(form.title)} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Department</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="department" onChange={updateField} value={form.department} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Role Type</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="roleType" onChange={updateField} value={form.roleType}>
                  {careerRoleTypes.map((roleType) => (
                    <option key={roleType} value={roleType}>{roleType}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Location</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="location" onChange={updateField} value={form.location} />
              </label>
            </div>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Description</span>
              <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="description" onChange={updateField} value={form.description} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Requirements</span>
                <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="requirements" onChange={updateField} value={form.requirements} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Responsibilities</span>
                <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="responsibilities" onChange={updateField} value={form.responsibilities} />
              </label>
            </div>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Image URL</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="imageUrl" onChange={updateField} type="url" value={form.imageUrl} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <CMSImagePreview url={form.imageUrl} />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Live Preview</span>
                <h3 className="mt-3 text-lg font-black text-slate-900">{form.title || "Opportunity title"}</h3>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-700">{form.department || "Department"} / {form.roleType}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{form.description || "Card preview description"}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Visibility</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="visibility" onChange={updateField} value={form.visibility}>
                  {careerVisibilities.map((visibility) => (
                    <option key={visibility} value={visibility}>{visibility}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateField} value={form.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Order Index</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="orderIndex" onChange={updateField} type="number" value={form.orderIndex} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Deadline</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="applicationDeadline" onChange={updateField} type="date" value={form.applicationDeadline ? String(form.applicationDeadline).slice(0, 10) : ""} />
              </label>
            </div>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">
              <input checked={Boolean(form.featured)} name="featured" onChange={updateField} type="checkbox" />
              Featured opportunity
            </label>
          </div>
        ) : isTestimonials ? (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Full Name</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="fullName" onChange={updateField} value={form.fullName} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Designation</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="designation" onChange={updateField} value={form.designation} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Organization</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="organization" onChange={updateField} value={form.organization} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Category</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="category" onChange={updateField} value={form.category}>
                  {testimonialCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Testimonial Text</span>
              <textarea className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="testimonial" onChange={updateField} value={form.testimonial} />
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Image URL</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="imageUrl" onChange={updateField} type="url" value={form.imageUrl} />
            </label>
            <CMSImagePreview url={form.imageUrl} />
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Live Preview</span>
              <p className="mt-3 text-sm font-semibold text-slate-700">{form.testimonial || "Testimonial preview"}</p>
              <p className="mt-2 text-xs font-black text-slate-500">{form.fullName || "Name"} / {form.organization || "Organization"}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Rating</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" max="5" min="1" name="rating" onChange={updateField} type="number" value={form.rating} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateField} value={form.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Order Index</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="orderIndex" onChange={updateField} type="number" value={form.orderIndex} />
              </label>
            </div>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">
              <input checked={Boolean(form.featured)} name="featured" onChange={updateField} type="checkbox" />
              Featured testimonial
            </label>
          </div>
        ) : isTeam || isMentors ? (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Full Name</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="fullName" onChange={updateField} value={form.fullName} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Designation</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="designation" onChange={updateField} value={form.designation} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isMentors ? "Organization" : "Department"}</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name={isMentors ? "organization" : "department"} onChange={updateField} placeholder={isMentors ? "Maai organisation" : "Leadership"} value={isMentors ? form.organization : form.department} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Email</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="email" onChange={updateField} type="email" value={form.email} />
              </label>
            </div>
            {isMentors ? (
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Specialization</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="specialization" onChange={updateField} value={form.specialization} />
              </label>
            ) : null}
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Bio</span>
              <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="bio" onChange={updateField} value={form.bio} />
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Image URL</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="imageUrl" onChange={updateField} type="url" value={form.imageUrl} />
            </label>
            <CMSImagePreview url={form.imageUrl} />
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">LinkedIn URL</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="linkedinUrl" onChange={updateField} type="url" value={form.linkedinUrl} />
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Instagram URL</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="instagramUrl" onChange={updateField} type="url" value={form.instagramUrl} />
              </label>
            </div>
            {isMentors ? (
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">
                <input checked={Boolean(form.featured)} name="featured" onChange={updateField} type="checkbox" />
                Featured mentor
              </label>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span>
                <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateField} value={form.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Order Index</span>
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="orderIndex" onChange={updateField} type="number" value={form.orderIndex} />
              </label>
            </div>
          </div>
        ) : (
        <div className="mt-5 grid gap-4">
          <label>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Title</span>
            <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="title" onChange={updateField} value={form.title} />
          </label>
          <label>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Slug</span>
            <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="slug" onChange={updateField} value={form.slug} />
          </label>
          <CMSRichTextEditor onChange={updateField} value={form.description} />
          <label>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Image URL</span>
            <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="imageUrl" onChange={updateField} value={form.imageUrl} />
          </label>
          <CMSImagePreview url={form.imageUrl} />
          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span>
              <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateField} value={form.status}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Order</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="orderIndex" onChange={updateField} type="number" value={form.orderIndex} />
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Tags</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="tags" onChange={updateField} value={form.tags} />
            </label>
          </div>
        </div>
        )}
        <button className="mt-6 h-11 rounded-xl bg-slate-950 px-5 text-sm font-black text-white" type="submit">Save</button>
      </form>
    </div>
  );
}
