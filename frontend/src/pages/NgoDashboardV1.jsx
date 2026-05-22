import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileUp,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import NotificationBell from "../components/notifications/NotificationBell";
import { useAuth } from "../hooks/useAuth";
import {
  createNgoDashboardCamp,
  getAnnouncements,
  getNgoCampDocuments,
  getNgoDashboardCamps,
  getNgoDashboardStats,
  updateNgoDashboardCampStatus,
  uploadNgoCampDocument,
} from "../services/api";

const navItems = [
  { label: "Dashboard", to: "/ngo-dashboard", icon: LayoutDashboard },
  { label: "Organise", to: "/ngo-dashboard/organise", icon: Plus },
  { label: "Camps", to: "/ngo-dashboard/camps", icon: FolderKanban },
  { label: "Requests", to: "/ngo-dashboard/requests", icon: ClipboardList },
];

const initialCampForm = {
  title: "",
  campType: "health",
  description: "",
  location: "",
  city: "",
  state: "",
  proposedDate: "",
  scheduledDate: "",
  expectedBeneficiaries: "",
  volunteersRequired: "",
  resourcesNeeded: "",
};

const workflow = [
  ["submitted", "Submitted"],
  ["under_review", "Review"],
  ["approved", "Approved"],
  ["scheduled", "Scheduled"],
  ["completed", "Completed"],
];

function activePage(pathname) {
  if (pathname.endsWith("/organise")) return "organise";
  if (pathname.endsWith("/camps")) return "camps";
  if (pathname.endsWith("/requests")) return "requests";
  return "dashboard";
}

function statusTone(status) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "approved" || status === "scheduled") return "bg-cyan-50 text-cyan-700 ring-cyan-100";
  if (status === "rejected") return "bg-rose-50 text-rose-700 ring-rose-100";
  if (status === "under_review") return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function formatDate(value) {
  if (!value) return "Date pending";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function getReadableFileSize(size) {
  const bytes = Number(size || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NgoDashboardV1() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const page = activePage(location.pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [camps, setCamps] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    setLoading(true);
    try {
      const [nextStats, nextCamps, nextAnnouncements] = await Promise.all([
        getNgoDashboardStats(),
        getNgoDashboardCamps(),
        getAnnouncements(),
      ]);
      setStats(nextStats);
      setCamps(nextCamps);
      setAnnouncements(nextAnnouncements);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard().catch(() => {
      setStats(null);
      setCamps([]);
      setAnnouncements([]);
      setLoading(false);
    });
  }, []);

  const filteredCamps = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return camps;
    return camps.filter((camp) =>
      [camp.title, camp.location, camp.city, camp.status].some((value) => String(value || "").toLowerCase().includes(normalized)),
    );
  }, [camps, query]);

  const sidebar = (
    <aside className="flex h-full w-[284px] shrink-0 flex-col bg-[#071922] px-5 py-6 text-white shadow-[0_24px_80px_rgba(4,28,50,0.28)]">
      <div className="flex items-center gap-3 px-2">
        <img alt="" className="h-11 w-11 rounded-2xl bg-white object-cover" src={user?.logoUrl || user?.logo_url || "/Favicon.ico"} />
        <div className="min-w-0">
          <p className="truncate text-sm font-black">{user?.organizationName || user?.organization_name || "Maai NGO"}</p>
          <p className="text-xs font-bold capitalize text-cyan-100/70">NGO Admin</p>
        </div>
      </div>

      <nav className="mt-8 grid gap-2">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            className={({ isActive }) =>
              `flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition ${
                isActive ? "bg-white text-[#041C32]" : "text-white/72 hover:bg-white/10 hover:text-white"
              }`
            }
            end={to === "/ngo-dashboard"}
            key={to}
            onClick={() => setMobileOpen(false)}
            to={to}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        className="mt-auto flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-white/72 transition hover:bg-white/10 hover:text-white"
        onClick={logout}
        type="button"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );

  return (
    <main className="min-h-screen bg-[#F6FAFB] text-[#041C32]">
      <div className="flex min-h-screen">
        <div className="sticky top-0 hidden h-screen w-[284px] shrink-0 lg:block">{sidebar}</div>

        <button
          aria-label="Open navigation"
          className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-2xl bg-[#041C32] text-white shadow-xl lg:hidden"
          onClick={() => setMobileOpen(true)}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className={`fixed inset-0 z-40 bg-[#041C32]/45 backdrop-blur-sm lg:hidden ${mobileOpen ? "" : "pointer-events-none hidden"}`} onClick={() => setMobileOpen(false)} />
        <div className={`fixed inset-y-0 left-0 z-50 transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <button className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white" onClick={() => setMobileOpen(false)} type="button">
            <X className="h-4 w-4" />
          </button>
          {sidebar}
        </div>

        <section className="min-w-0 flex-1 px-4 py-5 md:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white bg-white/90 px-5 py-4 shadow-[0_16px_50px_rgba(4,28,50,0.08)] backdrop-blur">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0097A7]">Maai Organisation</p>
              <h1 className="truncate text-2xl font-black">NGO Dashboard V1</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full bg-[#E6F7FA] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#007C89] md:inline-flex">
                {user?.membershipStatus || user?.membership_status || "under_review"}
              </span>
              <NotificationBell />
            </div>
          </header>

          {message ? (
            <p className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-800">{message}</p>
          ) : null}

          {page === "dashboard" ? (
            <DashboardHome stats={stats} camps={camps} announcements={announcements} loading={loading} />
          ) : null}
          {page === "organise" ? <OrganiseCampForm onCreated={loadDashboard} setMessage={setMessage} /> : null}
          {page === "camps" ? (
            <CampsView camps={filteredCamps} query={query} setQuery={setQuery} onUploaded={loadDashboard} setMessage={setMessage} />
          ) : null}
          {page === "requests" ? <RequestsView camps={filteredCamps} query={query} setQuery={setQuery} /> : null}
        </section>
      </div>
    </main>
  );
}

function DashboardHome({ stats, camps, announcements, loading }) {
  const cards = [
    ["Total Camps", stats?.total || 0, Activity],
    ["Active Requests", stats?.activeRequests || 0, ClipboardList],
    ["Approved", stats?.approved || 0, CheckCircle2],
    ["Completed", stats?.completed || 0, CalendarCheck],
    ["Documents", stats?.documents || 0, FileUp],
  ];

  return (
    <div className="mt-5">
      <section className="rounded-[28px] bg-[#041C32] p-6 text-white shadow-[0_24px_90px_rgba(4,28,50,0.18)]">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Partnership operations</p>
        <h2 className="mt-3 text-3xl font-black">Plan camps, track reviews, and keep every document in one place.</h2>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/68">
          This V1 workspace gives NGO admins a responsive operating layer for organising Maai camps and monitoring status movement.
        </p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, Icon]) => (
          <article className="rounded-2xl border border-white bg-white p-5 shadow-[0_18px_50px_rgba(4,28,50,0.07)]" key={label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
              <Icon className="h-5 w-5 text-[#0097A7]" />
            </div>
            <p className="mt-4 text-3xl font-black">{loading ? "-" : value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-white bg-white p-5 shadow-[0_18px_50px_rgba(4,28,50,0.07)]">
          <h2 className="text-lg font-black">Recent Camps</h2>
          <div className="mt-4 grid gap-3">
            {camps.slice(0, 4).map((camp) => <CampCard camp={camp} compact key={camp.id} />)}
            {!loading && camps.length === 0 ? <EmptyState text="No camps organised yet." /> : null}
          </div>
        </section>
        <section className="rounded-2xl border border-white bg-white p-5 shadow-[0_18px_50px_rgba(4,28,50,0.07)]">
          <h2 className="text-lg font-black">Announcements</h2>
          <div className="mt-4 grid gap-3">
            {announcements.slice(0, 3).map((announcement) => (
              <article className="rounded-2xl bg-[#F6FAFB] p-4" key={announcement.id}>
                <p className="text-xs font-black uppercase text-[#0097A7]">{announcement.priority || "info"}</p>
                <h3 className="mt-2 font-black">{announcement.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-500">{announcement.message}</p>
              </article>
            ))}
            {!loading && announcements.length === 0 ? <EmptyState text="No announcements right now." /> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function OrganiseCampForm({ onCreated, setMessage }) {
  const [form, setForm] = useState(initialCampForm);
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitCamp(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await createNgoDashboardCamp(form);
      setForm(initialCampForm);
      setMessage("Camp submitted to Maai for review.");
      await onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mt-5 rounded-2xl border border-white bg-white p-5 shadow-[0_18px_50px_rgba(4,28,50,0.07)]" onSubmit={submitCamp}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0097A7]">Organise Camp</p>
          <h2 className="mt-1 text-2xl font-black">Submit a new camp plan</h2>
        </div>
        <button className="rounded-2xl bg-[#041C32] px-5 py-3 text-sm font-black text-white disabled:opacity-60" disabled={saving} type="submit">
          {saving ? "Submitting..." : "Submit Camp"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Camp Title" name="title" onChange={updateField} value={form.title} />
        <label>
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Camp Type</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-3 text-sm font-bold outline-none" name="campType" onChange={updateField} value={form.campType}>
            {["health", "awareness", "screening", "research", "education", "community", "other"].map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Description</span>
          <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="description" onChange={updateField} value={form.description} />
        </label>
        <Field label="Location" name="location" onChange={updateField} value={form.location} />
        <Field label="City" name="city" onChange={updateField} value={form.city} />
        <Field label="State" name="state" onChange={updateField} value={form.state} />
        <Field label="Proposed Date" name="proposedDate" onChange={updateField} type="date" value={form.proposedDate} />
        <Field label="Scheduled Date" name="scheduledDate" onChange={updateField} type="date" value={form.scheduledDate} />
        <Field label="Expected Beneficiaries" name="expectedBeneficiaries" onChange={updateField} type="number" value={form.expectedBeneficiaries} />
        <Field label="Volunteers Required" name="volunteersRequired" onChange={updateField} type="number" value={form.volunteersRequired} />
        <label className="md:col-span-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Resources Needed</span>
          <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="resourcesNeeded" onChange={updateField} value={form.resourcesNeeded} />
        </label>
      </div>
    </form>
  );
}

function CampsView({ camps, query, setQuery, onUploaded, setMessage }) {
  return (
    <div className="mt-5">
      <ListToolbar query={query} setQuery={setQuery} title="Camp List" />
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {camps.map((camp) => <CampCard camp={camp} key={camp.id} onUploaded={onUploaded} setMessage={setMessage} />)}
        {camps.length === 0 ? <EmptyState text="No camps match this view." /> : null}
      </div>
    </div>
  );
}

function RequestsView({ camps, query, setQuery }) {
  const requestCamps = camps.filter((camp) => ["submitted", "under_review", "rejected"].includes(camp.status));
  return (
    <div className="mt-5">
      <ListToolbar query={query} setQuery={setQuery} title="Camp Requests" />
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {requestCamps.map((camp) => <CampCard camp={camp} key={camp.id} showWorkflow />)}
        {requestCamps.length === 0 ? <EmptyState text="No active camp requests." /> : null}
      </div>
    </div>
  );
}

function CampCard({ camp, compact = false, onUploaded, setMessage, showWorkflow = true }) {
  async function moveStatus(nextStatus) {
    await updateNgoDashboardCampStatus(camp.id, { status: nextStatus });
    setMessage?.(`Camp marked as ${nextStatus.replace("_", " ")}.`);
    await onUploaded?.();
  }

  const nextStatus = {
    approved: "scheduled",
    scheduled: "completed",
  }[camp.status];

  return (
    <article className="rounded-2xl border border-white bg-white p-5 shadow-[0_18px_50px_rgba(4,28,50,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black">{camp.title}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{camp.location}, {camp.city}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ring-1 ${statusTone(camp.status)}`}>{camp.status}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm font-bold text-slate-600 sm:grid-cols-3">
        <span>{formatDate(camp.proposedDate)}</span>
        <span>{camp.expectedBeneficiaries || 0} beneficiaries</span>
        <span>{camp.documentsCount || 0} files</span>
      </div>
      {!compact && showWorkflow ? <Workflow status={camp.status} /> : null}
      {!compact && nextStatus ? (
        <div className="mt-4">
          <button className="rounded-2xl bg-[#041C32] px-4 py-2 text-xs font-black text-white" onClick={() => moveStatus(nextStatus)} type="button">
            Mark {nextStatus}
          </button>
        </div>
      ) : null}
      {!compact ? <DocumentUploader camp={camp} onUploaded={onUploaded} setMessage={setMessage} /> : null}
    </article>
  );
}

function Workflow({ status }) {
  const activeIndex = Math.max(0, workflow.findIndex(([key]) => key === status));
  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-5">
      {workflow.map(([key, label], index) => (
        <div className={`rounded-2xl px-3 py-3 text-xs font-black ${index <= activeIndex ? "bg-[#E6F7FA] text-[#007C89]" : "bg-slate-50 text-slate-400"}`} key={key}>
          {label}
        </div>
      ))}
    </div>
  );
}

function DocumentUploader({ camp, onUploaded, setMessage }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getNgoCampDocuments(camp.id).then(setDocuments).catch(() => setDocuments([]));
  }, [camp.id]);

  async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await uploadNgoCampDocument(camp.id, {
        documentType: "supporting",
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        fileData,
      });
      setMessage?.("Document uploaded.");
      setDocuments(await getNgoCampDocuments(camp.id));
      await onUploaded?.();
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="mt-5 rounded-2xl bg-[#F6FAFB] p-4">
      <label className="flex cursor-pointer flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-cyan-200 bg-white px-4 py-3">
        <span className="flex items-center gap-3 text-sm font-black text-[#041C32]">
          <UploadCloud className="h-5 w-5 text-[#0097A7]" />
          {uploading ? "Uploading..." : "Upload camp document"}
        </span>
        <input className="sr-only" disabled={uploading} onChange={uploadFile} type="file" />
      </label>
      {documents.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {documents.map((document) => (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600" key={document.id}>
              <span className="truncate">{document.fileName}</span>
              <span>{getReadableFileSize(document.fileSize)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <label>
      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <input className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none" name={name} onChange={onChange} type={type} value={value} />
    </label>
  );
}

function ListToolbar({ title, query, setQuery }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white bg-white p-4 shadow-[0_18px_50px_rgba(4,28,50,0.07)]">
      <h2 className="text-xl font-black">{title}</h2>
      <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 px-3 sm:max-w-sm">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input className="min-w-0 flex-1 text-sm font-semibold outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search camps" value={query} />
      </label>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
      {text}
    </div>
  );
}
