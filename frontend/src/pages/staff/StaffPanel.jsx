import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, Bell, Briefcase, CalendarDays, ClipboardList, FileBadge, FileText, HeartHandshake, IdCard, Megaphone, MessageSquare, Search, Settings, ShieldCheck, Star, UserCog, Users } from "lucide-react";
import { Link } from "react-router-dom";
import NotificationBell from "../../components/notifications/NotificationBell";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getAdminAnalytics,
  getAdminMembershipSettings,
  getAnnouncements,
  getAdminVolunteers,
  updateAdminMembershipSettings,
  updateAdminVolunteerPaymentStatus,
  updateAdminVolunteerStatus,
} from "../../services/api";

const staffSections = [
  { title: "Dashboard", items: [{ key: "dashboard", label: "Dashboard" }] },
  {
    title: "Members",
    items: [
      { key: "volunteers", label: "Volunteers" },
      { key: "ngos", label: "NGOs" },
    ],
  },
  {
    title: "Content",
    items: [
      { key: "initiatives", label: "Initiatives" },
      { key: "mentors", label: "Mentors" },
      { key: "team", label: "Team" },
      { key: "reels", label: "Reels" },
      { key: "testimonials", label: "Testimonials" },
      { key: "careers", label: "Careers" },
      { key: "id-templates", label: "ID Card Templates" },
      { key: "certificate-templates", label: "Certificate Templates" },
      { key: "social-links", label: "Social Links" },
    ],
  },
  {
    title: "Events",
    items: [
      { key: "events", label: "Events" },
      { key: "certificates", label: "Certificates" },
    ],
  },
  {
    title: "Operations",
    items: [
      { key: "camp-requests", label: "Camp Requests" },
      { key: "announcements", label: "Announcements" },
      { key: "notifications", label: "Notifications" },
      { key: "settings", label: "Membership Settings" },
    ],
  },
];

const labels = staffSections.flatMap((section) => section.items).reduce((acc, item) => {
  acc[item.key] = item.label;
  return acc;
}, {});

const cmsModuleRoutes = {
  initiatives: "initiatives",
  mentors: "mentors",
  team: "team",
  reels: "reels",
  testimonials: "testimonials",
  careers: "careers",
  "id-templates": "id-templates",
  "certificate-templates": "certificate-templates",
  "social-links": "social-links",
};

const staffNavIcons = {
  dashboard: ShieldCheck,
  volunteers: Users,
  ngos: HeartHandshake,
  initiatives: Star,
  mentors: UserCog,
  team: Users,
  reels: FileText,
  testimonials: MessageSquare,
  careers: Briefcase,
  "id-templates": IdCard,
  "certificate-templates": FileBadge,
  "social-links": Megaphone,
  events: CalendarDays,
  certificates: Award,
  "camp-requests": ClipboardList,
  announcements: Megaphone,
  notifications: Bell,
  settings: Settings,
};

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function StaffLayout({ active, children, onSelect }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const getNavItemClass = (collapsed) => `flex min-h-12 w-full items-center rounded-2xl text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 ${
    collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3 text-left"
  }`;
  const renderNavLabel = (item, collapsed) => {
    const Icon = staffNavIcons[item.key] || FileText;
    return (
      <>
        <Icon className="h-5 w-5 shrink-0" />
        <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
      </>
    );
  };

  const sidebar = ({ collapsed = false } = {}) => (
    <div className={`flex h-full w-full flex-col ${collapsed ? "items-center p-4" : "p-6"}`}>
      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`} title={collapsed ? "Maai Staff" : undefined}>
        <img alt="" className="h-10 w-10 rounded-2xl bg-white shadow-sm border border-slate-100" src="/Favicon.ico" />
        <div className={collapsed ? "sr-only" : ""}>
          <p className="text-sm font-black text-slate-900">Maai Staff</p>
          <p className="text-xs font-bold text-slate-500">IT STAFF</p>
        </div>
      </div>
      <nav className={`mt-8 grid flex-1 gap-6 overflow-y-auto ${collapsed ? "w-full pr-0" : "pr-1"}`}>
        {staffSections.map((section) => (
          <section key={section.title}>
            <p className={`mb-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ${collapsed ? "sr-only" : ""}`}>{section.title}</p>
            <div className="grid gap-1">
              {section.items.map((item) => (
                item.key === "volunteers" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} onClick={closeMobileMenu} title={collapsed ? item.label : undefined} to="/admin/volunteers">{renderNavLabel(item, collapsed)}</Link>
                ) : item.key === "ngos" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} onClick={closeMobileMenu} title={collapsed ? item.label : undefined} to="/staff/ngos">{renderNavLabel(item, collapsed)}</Link>
                ) : item.key === "events" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} onClick={closeMobileMenu} title={collapsed ? item.label : undefined} to="/staff/events">{renderNavLabel(item, collapsed)}</Link>
                ) : item.key === "camp-requests" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} onClick={closeMobileMenu} title={collapsed ? item.label : undefined} to="/staff/camp-requests">{renderNavLabel(item, collapsed)}</Link>
                ) : item.key === "announcements" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} onClick={closeMobileMenu} title={collapsed ? item.label : undefined} to="/staff/communications/announcements">{renderNavLabel(item, collapsed)}</Link>
                ) : cmsModuleRoutes[item.key] ? (
                  <Link
                    aria-label={item.label}
                    className={getNavItemClass(collapsed)}
                    key={item.key}
                    onClick={closeMobileMenu}
                    title={collapsed ? item.label : undefined}
                    to={
                      item.key === "social-links"
                        ? "/staff/cms/social-links"
                        : item.key === "team"
                          ? "/staff/cms/team"
                          : item.key === "mentors"
                            ? "/staff/cms/mentors"
                            : item.key === "initiatives"
                              ? "/staff/cms/initiatives"
                              : item.key === "reels"
                                ? "/staff/cms/reels"
                                : item.key === "testimonials"
                                  ? "/staff/cms/testimonials"
                                  : item.key === "careers"
                                    ? "/staff/cms/careers"
                                    : item.key === "id-templates"
                                      ? "/staff/cms/id-templates"
                                      : item.key === "certificate-templates"
                                        ? "/staff/cms/certificate-templates"
                                        : `/staff/cms?module=${cmsModuleRoutes[item.key]}`
                    }
                  >
                    {renderNavLabel(item, collapsed)}
                  </Link>
                ) : (
                  <button
                    aria-label={item.label}
                    className={`flex min-h-12 w-full items-center rounded-2xl text-sm font-extrabold transition ${
                      collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3 text-left"
                    } ${
                      active === item.key ? "bg-cyan-50 text-cyan-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    key={item.key}
                    onClick={() => { onSelect(item.key); closeMobileMenu(); }}
                    title={collapsed ? item.label : undefined}
                    type="button"
                  >
                    {renderNavLabel(item, collapsed)}
                  </button>
                )
              ))}
            </div>
          </section>
        ))}
      </nav>
      <div
        className={`mt-auto border border-slate-100 bg-slate-50 ${
          collapsed ? "grid h-12 w-12 place-items-center rounded-2xl p-0" : "rounded-3xl p-4"
        }`}
        title={collapsed ? "Staff - it staff" : undefined}
      >
        {collapsed ? (
          <span className="text-sm font-black text-cyan-700">S</span>
        ) : (
          <>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Signed in as</p>
            <p className="mt-2 text-sm font-black text-slate-900">Staff</p>
            <p className="mt-1 text-xs font-bold capitalize text-cyan-700">it staff</p>
          </>
        )}
      </div>
    </div>
  );

  const topbarContent = (
    <header className="flex items-center justify-between gap-4 rounded-[24px] bg-white/85 px-6 py-4 shadow-sm backdrop-blur-xl border border-slate-100">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Staff panel</p>
        <h1 className="truncate text-xl font-black md:text-2xl">{labels[active]}</h1>
      </div>
      <div className="hidden h-11 min-w-64 flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-400 xl:flex">
        <Search className="h-4 w-4" />
        <span>Search staff workspace</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white md:inline-flex">it staff</span>
        <NotificationBell />
        <Link
          className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-extrabold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 sm:inline-flex"
          to="/dashboard"
        >
          Member View
        </Link>
        <Link
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-cyan-700"
          to="/volunteer"
        >
          Back to Website
        </Link>
      </div>
    </header>
  );

  return (
    <DashboardLayout sidebar={sidebar} topbar={topbarContent}>
      <div className="py-2">{children}</div>
    </DashboardLayout>
  );
}

function DashboardView() {
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAdminAnalytics(), getAnnouncements()])
      .then(([analyticsRows, announcementRows]) => {
        setAnalytics(analyticsRows);
        setAnnouncements(announcementRows);
      })
      .catch((requestError) => setError(requestError?.response?.data?.message || "Unable to load staff dashboard."));
  }, []);

  const stats = analytics?.summary || {};
  const statCards = [
    ["Pending memberships", stats.pendingMemberships ?? stats.pending_memberships, ShieldCheck, "text-amber-700 bg-amber-50"],
    ["Pending NGOs", stats.pendingNgos ?? stats.pending_ngos, HeartHandshake, "text-violet-700 bg-violet-50"],
    ["Camp requests", stats.campRequests ?? stats.camp_requests, FileText, "text-cyan-700 bg-cyan-50"],
    ["Certificates issued", stats.certificatesIssued ?? stats.certificates, Award, "text-rose-700 bg-rose-50"],
    ["Events", stats.events, CalendarDays, "text-emerald-700 bg-emerald-50"],
    ["Volunteers", stats.volunteers, Users, "text-slate-700 bg-slate-100"],
  ];
  const quickActions = [
    ["Verify Members", "/admin/volunteers", ShieldCheck],
    ["Issue Certificates", "/staff/events", Award],
    ["Review Camps", "/staff/camp-requests", FileText],
    ["CMS", "/staff/cms/initiatives", CalendarDays],
  ];

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p> : null}
      <section className="rounded-[28px] border border-white/70 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-950 p-6 text-white shadow-[0_24px_90px_rgba(15,23,42,0.2)]">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Operations desk</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Today’s verification queue</h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/65">
              Memberships, NGO approvals, camps, events, and certificate work in one compact staff view.
            </p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black capitalize backdrop-blur">
            Membership mode: {stats.membershipMode || stats.membership_mode || "free"}
          </span>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map(([label, value, Icon, tone]) => (
          <article className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur" key={label}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <strong className="mt-4 block text-4xl font-black">{value ?? 0}</strong>
          </article>
        ))}
      </div>
      <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <h2 className="text-lg font-black">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(([label, to, Icon]) => (
            <Link className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-black text-slate-800 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800" key={label} to={to}>
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black">Announcements</h2>
          <Megaphone className="h-5 w-5 text-cyan-700" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {announcements.length === 0 ? <p className="text-sm font-semibold text-slate-500 md:col-span-3">No announcements right now.</p> : null}
          {announcements.slice(0, 3).map((announcement) => (
            <article className="rounded-2xl bg-slate-50 p-4" key={announcement.id}>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-cyan-700">{announcement.priority} / {announcement.announcementType || announcement.announcement_type}</p>
              <h3 className="mt-2 font-black">{announcement.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-500">{announcement.message}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function VolunteersView() {
  const [volunteers, setVolunteers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setVolunteers(await getAdminVolunteers({ search }));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to load volunteers.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function setStatus(id, status) {
    await updateAdminVolunteerStatus(id, status);
    await load();
  }

  async function setPayment(id, status) {
    await updateAdminVolunteerPaymentStatus(id, status);
    await load();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
        <div>
          <h2 className="text-lg font-black">Volunteer Approvals</h2>
          <p className="text-sm font-semibold text-slate-500">Verify and reject volunteers. Role controls are hidden.</p>
        </div>
        <input
          className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-cyan-400 sm:w-72"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search volunteers"
          value={search}
        />
      </div>
      {error ? <p className="m-5 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p> : null}
      {loading ? <p className="p-5 text-sm font-bold text-slate-500">Loading volunteers...</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">College</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Membership</th>
              <th className="px-5 py-4">Payment</th>
              <th className="px-5 py-4">Transaction</th>
              <th className="px-5 py-4">Joined date</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {volunteers.map((volunteer) => (
              <tr key={volunteer.id}>
                <td className="px-5 py-4 font-black">{volunteer.fullName || volunteer.full_name}</td>
                <td className="px-5 py-4 font-semibold text-slate-600">{volunteer.email}</td>
                <td className="px-5 py-4 font-semibold text-slate-600">{volunteer.college || "-"}</td>
                <td className="px-5 py-4 font-semibold text-slate-600">{volunteer.role || "volunteer"}</td>
                <td className="px-5 py-4 font-semibold text-slate-600">{volunteer.membership_status || volunteer.membershipStatus}</td>
                <td className="px-5 py-4 font-semibold text-slate-600">{volunteer.payment_status || volunteer.paymentStatus}</td>
                <td className="px-5 py-4 font-semibold text-slate-600">{volunteer.transaction_id || volunteer.transactionId || "FREE"}</td>
                <td className="px-5 py-4 font-semibold text-slate-600">{formatDate(volunteer.joinedDate || volunteer.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700" onClick={() => setStatus(volunteer.id, "verified")} type="button">
                      Verify
                    </button>
                    <button className="rounded-full bg-cyan-100 px-3 py-2 text-xs font-black text-cyan-700" onClick={() => setPayment(volunteer.id, "paid")} type="button">
                      Verify Payment
                    </button>
                    <button className="rounded-full bg-orange-100 px-3 py-2 text-xs font-black text-orange-700" onClick={() => setPayment(volunteer.id, "failed")} type="button">
                      Reject Payment
                    </button>
                    <button className="rounded-full bg-rose-100 px-3 py-2 text-xs font-black text-rose-700" onClick={() => setStatus(volunteer.id, "rejected")} type="button">
                      Reject
                    </button>
                    <button className="rounded-full bg-amber-100 px-3 py-2 text-xs font-black text-amber-700" onClick={() => setStatus(volunteer.id, "under_review")} type="button">
                      Review
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FoundationModule({ active }) {
  const title = labels[active] || "Module";
  return (
    <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-600">Create / Edit</p>
        <h2 className="mt-2 text-xl font-black">{title}</h2>
        <label className="mt-5 block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Title / Name</span>
          <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" placeholder={`${title} title`} />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Description</span>
          <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" placeholder="Module content" />
        </label>
        <button className="mt-5 h-11 rounded-xl bg-slate-950 px-5 text-sm font-black text-white" type="button">
          Save
        </button>
      </form>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">List</p>
            <h2 className="mt-2 text-xl font-black">{title}</h2>
          </div>
          <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black" type="button">
            Create
          </button>
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-sm font-semibold text-slate-500">
          {title} staff module supports List, Create, Edit, and Delete for allowed content.
        </div>
        <div className="mt-4 flex gap-2">
          <button className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black" type="button">
            Edit
          </button>
          <button className="rounded-full bg-rose-100 px-4 py-2 text-xs font-black text-rose-700" type="button">
            Delete
          </button>
        </div>
      </div>
    </section>
  );
}

function MembershipSettingsView() {
  const [settings, setSettings] = useState({
    paymentsEnabled: false,
    membershipFee: 0,
    currency: "INR",
    membershipName: "Free Membership",
    upiQrUrl: "",
    paymentInstructions: "",
    isActive: true,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    getAdminMembershipSettings().then((data) => {
      if (data) setSettings(data);
    });
  }, []);

  function updateField(event) {
    const { checked, name, type, value } = event.target;
    setSettings((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setMessage("");
  }

  async function saveSettings(event) {
    event.preventDefault();
    const updated = await updateAdminMembershipSettings(settings);
    setSettings(updated);
    setMessage("Membership settings saved.");
  }

  return (
    <form className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={saveSettings}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-600">Membership</p>
      <h2 className="mt-2 text-xl font-black">Membership Payment Settings</h2>
      <label className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black">
        <input checked={Boolean(settings.paymentsEnabled)} name="paymentsEnabled" onChange={updateField} type="checkbox" />
        Enable paid membership registration
      </label>
      <label className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black">
        <input checked={Boolean(settings.isActive ?? settings.is_active ?? true)} name="isActive" onChange={updateField} type="checkbox" />
        Active membership plan
      </label>
      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Membership Name</span>
        <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="membershipName" onChange={updateField} value={settings.membershipName || settings.membership_name || ""} />
      </label>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Fee</span>
          <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="membershipFee" onChange={updateField} type="number" value={settings.membershipFee || 0} />
        </label>
        <label>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Currency</span>
          <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold uppercase outline-none" name="currency" onChange={updateField} value={settings.currency || "INR"} />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">UPI QR URL</span>
        <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="upiQrUrl" onChange={updateField} value={settings.upiQrUrl || ""} />
      </label>
      {settings.upiQrUrl ? <img alt="UPI QR preview" className="mt-4 h-40 w-40 rounded-xl bg-white object-cover" src={settings.upiQrUrl} /> : null}
      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Payment Instructions</span>
        <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="paymentInstructions" onChange={updateField} value={settings.paymentInstructions || settings.payment_instructions || settings.instructions || ""} />
      </label>
      <button className="mt-5 h-11 rounded-xl bg-slate-950 px-5 text-sm font-black text-white" type="submit">Save settings</button>
      {message ? <p className="mt-4 text-sm font-bold text-emerald-700">{message}</p> : null}
    </form>
  );
}

export default function StaffPanel({ initialActive = "dashboard" }) {
  const [active, setActive] = useState(initialActive);

  const content = useMemo(() => {
    if (active === "dashboard") return <DashboardView />;
    if (active === "volunteers") return <VolunteersView />;
    if (active === "settings") return <MembershipSettingsView />;
    return <FoundationModule active={active} />;
  }, [active]);

  return (
    <StaffLayout active={active} onSelect={setActive}>
      {content}
    </StaffLayout>
  );
}
