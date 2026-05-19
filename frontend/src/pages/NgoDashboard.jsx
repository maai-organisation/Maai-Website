import { Bell, CalendarDays, FileText, LayoutDashboard, LogOut, Megaphone, Menu, Settings, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { cancelCampRequest, createCampRequest, getAnnouncements, getCampRequests, getNgoNotifications, updateCampRequest, updateNgoProfile } from "../services/api";
import NotificationBell from "../components/notifications/NotificationBell";

const nav = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["profile", "Profile", UserRound],
  ["camp-requests", "Camp Requests", FileText],
  ["events", "Events", CalendarDays],
  ["certificates", "Certificates", FileText],
  ["notifications", "Notifications", Bell],
  ["settings", "Settings", Settings],
];

export default function NgoDashboard({ initialPage = "dashboard" }) {
  const { logout, refreshUser, user } = useAuth();
  const [page, setPage] = useState(initialPage);
  const [dashboardRequests, setDashboardRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(() => ({
    organizationName: user?.organizationName || user?.organization_name || "",
    registrationNumber: user?.registrationNumber || user?.registration_number || "",
    ngoType: user?.ngoType || user?.ngo_type || "other",
    phone: user?.phone || "",
    website: user?.website || "",
    city: user?.city || "",
    state: user?.state || "",
    address: user?.address || "",
    mission: user?.mission || "",
    description: user?.description || "",
    logoUrl: user?.logoUrl || user?.logo_url || "",
    coverUrl: user?.coverUrl || user?.cover_url || "",
  }));
  const [message, setMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const verified = (user?.membershipStatus || user?.membership_status) === "verified";

  useEffect(() => {
    let ignore = false;

    Promise.all([verified ? getCampRequests() : Promise.resolve([]), getAnnouncements()])
      .then(([requestRows, announcementRows]) => {
        if (!ignore) {
          setDashboardRequests(requestRows);
          setAnnouncements(announcementRows);
        }
      })
      .catch(() => {
        if (!ignore) {
          setDashboardRequests([]);
          setAnnouncements([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, [verified]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    await updateNgoProfile(form);
    await refreshUser();
    setMessage("Profile updated.");
  }

  const sidebar = (
    <aside className="flex h-full w-[280px] shrink-0 flex-col bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
      <div className="flex items-center gap-3">
        <img alt="" className="h-10 w-10 rounded-2xl bg-white object-cover shadow-sm" src={user?.logoUrl || "/Favicon.ico"} />
        <div className="min-w-0">
          <p className="truncate text-sm font-black">{user?.organizationName || "NGO Dashboard"}</p>
          <p className="text-xs font-bold text-white/50">{user?.membershipStatus || "under_review"}</p>
        </div>
      </div>
      <nav className="mt-8 grid gap-2">
        {nav.map(([key, label, Icon]) => (
          <button className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${page === key ? "bg-white text-slate-950 shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"}`} key={key} onClick={() => { setPage(key); setMobileMenuOpen(false); }} type="button">
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
        <button className="mt-6 flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold text-white/70 transition hover:bg-white/10 hover:text-white" onClick={logout} type="button">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </nav>
    </aside>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-cyan-50/50 text-slate-950">
      <div className="flex min-h-screen">
        <div className="sticky top-0 hidden h-screen w-[280px] shrink-0 lg:block">
          {sidebar}
        </div>
        <div className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity lg:hidden ${mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setMobileMenuOpen(false)} />
        <div className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="relative h-full">
            <button className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white" onClick={() => setMobileMenuOpen(false)} type="button">
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </div>
        </div>
        <section className="min-w-0 flex-1 px-4 py-5 md:px-8">
          <header className="sticky top-4 z-30 flex items-center justify-between gap-4 rounded-[24px] border border-white/70 bg-white/88 px-4 py-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl md:px-6">
            <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-100 bg-white text-slate-700 lg:hidden" onClick={() => setMobileMenuOpen(true)} type="button">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">NGO Workspace</p>
              <h1 className="truncate text-xl font-black md:text-2xl">{user?.organizationName || user?.organization_name || "NGO Dashboard"}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden rounded-full bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-700 md:inline-flex">{user?.membershipStatus || "under_review"}</span>
              <NotificationBell />
              <button className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-cyan-700 md:inline-flex" onClick={logout} type="button">
                Logout
              </button>
            </div>
          </header>
          {!verified ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h1 className="text-2xl font-black">Organization Under Review</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-amber-800">Your NGO registration is being reviewed by the Maai team. Profile editing remains available, while camp requests and collaboration tools unlock after verification.</p>
            </div>
          ) : null}

          {page === "dashboard" ? (
            <div className="mt-5">
              <section className="rounded-[28px] border border-white/70 bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950 p-6 text-white shadow-[0_24px_90px_rgba(15,23,42,0.2)]">
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Partnership workspace</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight">NGO Dashboard</h1>
                    <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                      Track camp requests, approval movement, collaboration events, and future certificates from one operational home.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black capitalize backdrop-blur">
                    {user?.membershipStatus || user?.membership_status || "under_review"}
                  </span>
                </div>
              </section>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Membership Status", user?.membershipStatus || user?.membership_status],
                  ["Camp Requests", dashboardRequests.length],
                  ["Approved Camps", dashboardRequests.filter((request) => ["approved", "completed"].includes(request.status)).length],
                  ["Events", "Ready"],
                  ["Certificates", "Ready"],
                ].map(([label, value]) => (
                  <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur" key={label}>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                    <p className="mt-3 text-xl font-black capitalize">{value || "-"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black">Announcements</h2>
                  <Megaphone className="h-5 w-5 text-cyan-700" />
                </div>
                <div className="mt-4 grid gap-3">
                  {announcements.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                      No announcements right now.
                    </p>
                  ) : (
                    announcements.slice(0, 4).map((announcement) => (
                      <article className="rounded-2xl bg-slate-50 p-4" key={announcement.id}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase text-cyan-700">{announcement.priority}</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{announcement.announcementType || announcement.announcement_type}</span>
                        </div>
                        <h3 className="mt-3 font-black">{announcement.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-500">{announcement.message}</p>
                      </article>
                    ))
                  )}
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <h2 className="text-lg font-black">Recent Activity</h2>
                <div className="mt-4 grid gap-3">
                  {dashboardRequests.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                      No camp requests yet. Submitted and reviewed requests will appear here.
                    </p>
                  ) : (
                    dashboardRequests.slice(0, 4).map((request) => (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4" key={request.id}>
                        <div>
                          <p className="font-black">{request.title}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">{request.location || request.city || "Location pending"}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-cyan-700">{request.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {page === "profile" ? (
            <form className="mt-5 max-w-4xl rounded-2xl border border-slate-200 bg-white p-6" onSubmit={saveProfile}>
              <h1 className="text-2xl font-black">NGO Profile</h1>
              {message ? <p className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{message}</p> : null}
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ["Organization Name", "organizationName"],
                  ["Registration Number", "registrationNumber"],
                  ["Phone", "phone"],
                  ["Website", "website"],
                  ["City", "city"],
                  ["State", "state"],
                  ["Logo URL", "logoUrl"],
                  ["Cover URL", "coverUrl"],
                ].map(([label, name]) => (
                  <label key={name}>
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
                    <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name={name} onChange={updateField} value={form[name]} />
                  </label>
                ))}
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">NGO Type</span>
                  <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="ngoType" onChange={updateField} value={form.ngoType}>
                    {["healthcare", "education", "community", "research", "environment", "other"].map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                {["address", "mission", "description"].map((name) => (
                  <label className="md:col-span-2" key={name}>
                    <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{name}</span>
                    <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name={name} onChange={updateField} value={form[name]} />
                  </label>
                ))}
              </div>
              <button className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white" type="submit">Save Profile</button>
            </form>
          ) : null}

          {page === "camp-requests" ? <NgoCampRequests /> : null}
          {page === "notifications" ? <NgoNotifications /> : null}

          {!["dashboard", "profile", "camp-requests", "notifications"].includes(page) ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
              <h1 className="text-2xl font-black">{nav.find(([key]) => key === page)?.[1]}</h1>
              <p className="mt-3 text-sm font-semibold text-slate-500">This workspace is prepared for the next NGO workflow.</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function NgoNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      getNgoNotifications()
        .then((data) => setNotifications(data))
        .catch(() => setNotifications([]));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-black">Notifications</h1>
      <div className="mt-5 grid gap-3">
        {notifications.length === 0 ? <p className="text-sm font-semibold text-slate-500">No notifications yet.</p> : null}
        {notifications.map((notification) => (
          <article className="rounded-xl bg-slate-50 p-4" key={notification.id}>
            <h3 className="font-black">{notification.title}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">{notification.message}</p>
            <p className="mt-2 text-xs font-bold text-slate-400">{notification.created_at ? new Date(notification.created_at).toLocaleString() : ""}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const initialCampForm = {
  title: "",
  campType: "health",
  description: "",
  location: "",
  city: "",
  state: "",
  proposedDate: "",
  expectedBeneficiaries: "",
  volunteersRequired: "",
  resourcesNeeded: "",
};

function NgoCampRequests() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(initialCampForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadRequests() {
    setRequests(await getCampRequests());
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      getCampRequests()
        .then((data) => setRequests(data))
        .catch(() => setMessage("Unable to load camp requests."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function editRequest(request) {
    setEditingId(request.id);
    setForm({
      title: request.title || "",
      campType: request.campType || "health",
      description: request.description || "",
      location: request.location || "",
      city: request.city || "",
      state: request.state || "",
      proposedDate: request.proposedDate ? String(request.proposedDate).slice(0, 10) : "",
      expectedBeneficiaries: request.expectedBeneficiaries || "",
      volunteersRequired: request.volunteersRequired || "",
      resourcesNeeded: request.resourcesNeeded || "",
    });
  }

  async function submitRequest(event) {
    event.preventDefault();
    if (editingId) await updateCampRequest(editingId, form);
    else await createCampRequest(form);
    setMessage(editingId ? "Camp request updated." : "Camp request submitted.");
    setEditingId(null);
    setForm(initialCampForm);
    await loadRequests();
  }

  async function cancelRequest(id) {
    await cancelCampRequest(id);
    setMessage("Camp request cancelled.");
    await loadRequests();
  }

  return (
    <div className="mt-5 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form className="rounded-2xl border border-slate-200 bg-white p-6" onSubmit={submitRequest}>
        <h1 className="text-2xl font-black">{editingId ? "Edit Camp Request" : "Request Camp"}</h1>
        {message ? <p className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{message}</p> : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label><span className="text-xs font-black uppercase text-slate-500">Camp Title</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold" name="title" onChange={updateField} value={form.title} /></label>
          <label><span className="text-xs font-black uppercase text-slate-500">Camp Type</span><select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="campType" onChange={updateField} value={form.campType}>{["health", "awareness", "screening", "research", "education", "community", "other"].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label className="md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Description</span><textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" name="description" onChange={updateField} value={form.description} /></label>
          {["location", "city", "state"].map((name) => <label key={name}><span className="text-xs font-black uppercase text-slate-500">{name}</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold" name={name} onChange={updateField} value={form[name]} /></label>)}
          <label><span className="text-xs font-black uppercase text-slate-500">Proposed Date</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold" name="proposedDate" onChange={updateField} type="date" value={form.proposedDate} /></label>
          <label><span className="text-xs font-black uppercase text-slate-500">Expected Beneficiaries</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold" name="expectedBeneficiaries" onChange={updateField} type="number" value={form.expectedBeneficiaries} /></label>
          <label><span className="text-xs font-black uppercase text-slate-500">Volunteers Required</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold" name="volunteersRequired" onChange={updateField} type="number" value={form.volunteersRequired} /></label>
          <label className="md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Resources Needed</span><textarea className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" name="resourcesNeeded" onChange={updateField} value={form.resourcesNeeded} /></label>
        </div>
        <button className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white" type="submit">{editingId ? "Save Request" : "Submit Request"}</button>
      </form>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-black">Camp Requests</h2>
        <div className="mt-5 grid gap-3">
          {requests.map((request) => (
            <article className="rounded-xl bg-slate-50 p-4" key={request.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="font-black">{request.title}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{request.campType} / {request.location} / {request.proposedDate ? new Date(request.proposedDate).toLocaleDateString() : "-"}</p></div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-600">{request.status}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-cyan-700" onClick={() => editRequest(request)} type="button">Edit</button>
                <button className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-rose-700" onClick={() => cancelRequest(request.id)} type="button">Cancel</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
