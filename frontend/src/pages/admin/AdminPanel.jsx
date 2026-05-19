import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Award, Bell, Briefcase, CalendarDays, ClipboardList, Database, FileBadge, FileText, HeartHandshake, IdCard, Image, Mail, Megaphone, MessageSquare, Search, Settings, ShieldCheck, Star, UserCog, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import NotificationBell from "../../components/notifications/NotificationBell";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getAdminAuditLogs,
  getAdminAnalytics,
  getAdminMembershipSettings,
  getAnnouncements,
  getAdminVolunteers,
  updateAdminMembershipSettings,
  updateAdminVolunteerPaymentStatus,
  updateAdminVolunteerRole,
  updateAdminVolunteerStatus,
} from "../../services/api";

const navSections = [
  { title: "Dashboard", items: [{ key: "dashboard", label: "Dashboard" }] },
  {
    title: "Members",
    items: [
      { key: "volunteers", label: "Volunteers" },
      { key: "ngos", label: "NGOs" },
    ],
  },
  {
    title: "Content Management",
    items: [
      { key: "hero-sections", label: "Hero Sections" },
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
      { key: "templates", label: "Templates" },
    ],
  },
  {
    title: "Operations",
    items: [
      { key: "camp-requests", label: "Camp Requests" },
      { key: "announcements", label: "Announcements" },
      { key: "email-center", label: "Email Center" },
      { key: "notifications", label: "Notifications" },
    ],
  },
  {
    title: "System",
    items: [
      { key: "roles", label: "Roles" },
      { key: "users", label: "Users" },
      { key: "settings", label: "Settings" },
      { key: "audit-logs", label: "Audit Logs" },
    ],
  },
];

const moduleLabels = navSections.flatMap((section) => section.items).reduce((acc, item) => {
  acc[item.key] = item.label;
  return acc;
}, {});

const cmsModuleRoutes = {
  "hero-sections": "hero_sections",
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

const navIcons = {
  dashboard: Activity,
  volunteers: Users,
  ngos: HeartHandshake,
  "hero-sections": Image,
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
  templates: FileBadge,
  "camp-requests": ClipboardList,
  announcements: Megaphone,
  "email-center": Mail,
  notifications: Bell,
  roles: ShieldCheck,
  users: UserCog,
  settings: Settings,
  "audit-logs": Database,
};

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function StatusPill({ children }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-600">
      {children || "pending"}
    </span>
  );
}

function AdminLayout({ active, children, onSelect }) {
  const getNavItemClass = (collapsed) => `flex min-h-12 w-full items-center rounded-2xl text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 ${
    collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3 text-left"
  }`;
  const renderNavLabel = (item, collapsed) => {
    const Icon = navIcons[item.key] || FileText;
    return (
      <>
        <Icon className="h-5 w-5 shrink-0" />
        <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
      </>
    );
  };
  const sidebar = ({ collapsed = false } = {}) => (
    <div className={`flex h-full w-full flex-col ${collapsed ? "items-center p-4" : "p-6"}`}>
      <Link
        aria-label="Maai Admin"
        className={`flex items-center font-black tracking-tight ${collapsed ? "justify-center" : "gap-3"}`}
        title={collapsed ? "Maai Admin" : undefined}
        to="/volunteer"
      >
        <img alt="" className="h-10 w-10 rounded-2xl border border-slate-100 bg-white shadow-sm" src="/Favicon.ico" />
        <div className={collapsed ? "sr-only" : ""}>
          <span className="block text-lg">Maai Admin</span>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700">Superadmin</span>
        </div>
      </Link>
      <nav className={`mt-8 grid gap-6 overflow-y-auto ${collapsed ? "w-full pr-0" : "pr-1"}`}>
        {navSections.map((section) => (
          <section key={section.title}>
            <p className={`mb-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ${collapsed ? "sr-only" : ""}`}>{section.title}</p>
            <div className="grid gap-1">
              {section.items.map((item) => (
                item.key === "volunteers" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} title={collapsed ? item.label : undefined} to="/admin/volunteers">{renderNavLabel(item, collapsed)}</Link>
                ) : item.key === "ngos" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} title={collapsed ? item.label : undefined} to="/admin/ngos">{renderNavLabel(item, collapsed)}</Link>
                ) : item.key === "events" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} title={collapsed ? item.label : undefined} to="/admin/events">{renderNavLabel(item, collapsed)}</Link>
                ) : item.key === "camp-requests" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} title={collapsed ? item.label : undefined} to="/admin/camp-requests">{renderNavLabel(item, collapsed)}</Link>
                ) : item.key === "announcements" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} title={collapsed ? item.label : undefined} to="/admin/communications/announcements">{renderNavLabel(item, collapsed)}</Link>
                ) : item.key === "email-center" ? (
                  <Link aria-label={item.label} className={getNavItemClass(collapsed)} key={item.key} title={collapsed ? item.label : undefined} to="/admin/communications/email">{renderNavLabel(item, collapsed)}</Link>
                ) : cmsModuleRoutes[item.key] ? (
                  <Link
                    aria-label={item.label}
                    className={getNavItemClass(collapsed)}
                    key={item.key}
                    title={collapsed ? item.label : undefined}
                    to={
                      item.key === "social-links"
                        ? "/admin/cms/social-links"
                        : item.key === "team"
                          ? "/admin/cms/team"
                          : item.key === "mentors"
                            ? "/admin/cms/mentors"
                            : item.key === "initiatives"
                              ? "/admin/cms/initiatives"
                              : item.key === "reels"
                                ? "/admin/cms/reels"
                                : item.key === "testimonials"
                                  ? "/admin/cms/testimonials"
                                  : item.key === "careers"
                                    ? "/admin/cms/careers"
                                    : item.key === "id-templates"
                                      ? "/admin/cms/id-templates"
                                      : item.key === "certificate-templates"
                                        ? "/admin/cms/certificate-templates"
                                        : `/admin/cms?module=${cmsModuleRoutes[item.key]}`
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
                      active === item.key ? "bg-cyan-50 text-cyan-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                    key={item.key}
                    onClick={() => onSelect(item.key)}
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
    </div>
  );

  const topbarContent = (
    <header className="flex items-center justify-between gap-4 rounded-[24px] border border-white/80 bg-white/92 px-6 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">God panel</p>
        <h1 className="truncate text-xl font-black md:text-2xl">{moduleLabels[active]}</h1>
      </div>
      <div className="hidden h-11 min-w-64 flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-400 xl:flex">
        <Search className="h-4 w-4" />
        <span>Search admin workspace</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white md:inline-flex">superadmin</span>
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
      .catch((requestError) => setError(requestError?.response?.data?.message || "Unable to load analytics."));
  }, []);

  const summary = analytics?.summary || {};
  const charts = analytics?.charts || {};
  const statCards = [
    ["Total Volunteers", summary.volunteers, Users, "from-cyan-500 to-blue-500"],
    ["Verified Members", summary.verifiedMembers ?? summary.verified_members, ShieldCheck, "from-emerald-500 to-teal-500"],
    ["NGOs", summary.ngos, HeartHandshake, "from-violet-500 to-fuchsia-500"],
    ["Events", summary.events, CalendarDays, "from-amber-500 to-orange-500"],
    ["Certificates", summary.certificatesIssued ?? summary.certificates, Award, "from-rose-500 to-pink-500"],
    ["Camp Requests", summary.campRequests ?? summary.camp_requests, FileText, "from-slate-700 to-slate-950"],
  ];
  const health = analytics?.systemHealth || {};
  const pendingActions = health.pendingActions ?? (
    Number(summary.pendingMemberships || summary.pending_memberships || 0) +
    Number(summary.pendingNgos || summary.pending_ngos || 0) +
    Number(summary.pendingCampRequests || summary.pending_camp_requests || 0)
  );
  const pieData = (charts.membershipBreakdown || []).map((item) => ({ name: item.status || "unknown", value: Number(item.count || 0) }));
  const pieColors = ["#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#6366f1"];

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p> : null}
      <section className="overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-[0_24px_90px_rgba(15,23,42,0.22)]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Operational analytics</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Maai command center</h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/65">
              Live membership, NGO, event, certificate, and camp request signals for production oversight.
            </p>
          </div>
          <div className="grid min-w-56 gap-2 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-white/50">System health</span>
            <strong className="text-2xl font-black capitalize">{health.databaseStatus || summary.databaseStatus || "online"}</strong>
            <span className="text-sm font-bold text-cyan-100">{pendingActions} pending actions</span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map(([label, value, Icon, gradient]) => (
          <article className="min-h-36 rounded-[24px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]" key={label}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
              <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <strong className="mt-4 block text-4xl font-black">{value ?? 0}</strong>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="text-lg font-black">Volunteer growth</h2>
          <div className="mt-5 h-72">
            {(charts.volunteerGrowth || []).length === 0 ? (
              <EmptyPanel label="No volunteer growth data yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.volunteerGrowth}>
                  <defs>
                    <linearGradient id="volunteerGrowth" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#0891b2" fill="url(#volunteerGrowth)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="text-lg font-black">Membership status</h2>
          <div className="mt-5 h-72">
            {pieData.length === 0 ? (
              <EmptyPanel label="No membership records yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={58} outerRadius={92} paddingAngle={4}>
                    {pieData.map((entry, index) => (
                      <Cell fill={pieColors[index % pieColors.length]} key={entry.name} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid gap-2">
            {pieData.map((item, index) => (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold" key={item.name}>
                <span className="capitalize" style={{ color: pieColors[index % pieColors.length] }}>{item.name}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <MiniBarChart data={charts.certificateGrowth || []} title="Certificates issued" color="#f43f5e" />
        <MiniBarChart data={charts.eventsByMonth || []} title="Events by month" color="#f59e0b" />
        <MiniBarChart data={charts.campRequests || []} title="Camp requests" color="#0f172a" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="rounded-[28px] border border-white/70 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <h2 className="text-lg font-black">Recent activity</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {(analytics?.recentActivity || []).length === 0 ? (
            <p className="py-8 text-sm font-semibold text-slate-500">No admin activity yet.</p>
          ) : (
            analytics.recentActivity.map((item) => (
              <div className="grid gap-1 py-3 text-sm md:grid-cols-[1fr_auto]" key={item.id}>
                <p className="font-bold">
                  {item.actor_name || item.actor_email || "System"} performed {item.action} on {item.entity_type}
                </p>
                <span className="font-semibold text-slate-400">{formatDate(item.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </section>
        <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="text-lg font-black">System health</h2>
          {[
            ["Database status", health.databaseStatus || summary.databaseStatus || "online", Database],
            ["Pending actions", pendingActions, Activity],
            ["Membership mode", health.membershipMode || summary.membershipMode || "free", ShieldCheck],
          ].map(([label, value, Icon]) => (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4" key={label}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-cyan-700 shadow-sm">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-black capitalize">{value}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
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

function EmptyPanel({ label }) {
  return (
    <div className="grid h-full place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
      <p className="px-6 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

function MiniBarChart({ color, data, title }) {
  return (
    <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-5 h-56">
        {data.length === 0 ? (
          <EmptyPanel label={`No ${title.toLowerCase()} data yet.`} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

function VolunteersView() {
  const { user } = useAuth();
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

  async function setRole(id, role) {
    await updateAdminVolunteerRole(id, role);
    await load();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
        <div>
          <h2 className="text-lg font-black">Volunteers</h2>
          <p className="text-sm font-semibold text-slate-500">Verify, reject, and promote members.</p>
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
      <div className="overflow-x-auto rounded-b-[28px]">
        <table className="w-full min-w-[1120px] border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
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
          <tbody className="bg-white">
            {volunteers.map((volunteer) => {
              const isSelf = Number(volunteer.id) === Number(user?.id);
              return (
                <tr className="transition hover:bg-cyan-50/40" key={volunteer.id}>
                  <td className="border-t border-slate-100 px-5 py-5 font-black">{volunteer.fullName || volunteer.full_name}</td>
                  <td className="border-t border-slate-100 px-5 py-5 font-semibold text-slate-600">{volunteer.email}</td>
                  <td className="border-t border-slate-100 px-5 py-5 font-semibold text-slate-600">{volunteer.college || "-"}</td>
                  <td className="border-t border-slate-100 px-5 py-5">
                    <select
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold"
                      disabled={isSelf}
                      onChange={(event) => setRole(volunteer.id, event.target.value)}
                      value={volunteer.role || "volunteer"}
                    >
                      <option value="volunteer">volunteer</option>
                      <option value="it_staff">it_staff</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                  </td>
                  <td className="border-t border-slate-100 px-5 py-5">
                    <StatusPill>{volunteer.membership_status || volunteer.membershipStatus}</StatusPill>
                  </td>
                  <td className="border-t border-slate-100 px-5 py-5 font-semibold text-slate-600">{volunteer.payment_status || volunteer.paymentStatus}</td>
                  <td className="border-t border-slate-100 px-5 py-5 font-semibold text-slate-600">{volunteer.transaction_id || volunteer.transactionId || "FREE"}</td>
                  <td className="border-t border-slate-100 px-5 py-5 font-semibold text-slate-600">{formatDate(volunteer.joinedDate || volunteer.createdAt)}</td>
                  <td className="border-t border-slate-100 px-5 py-5">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black" type="button">
                        View
                      </button>
                      <button className="rounded-full bg-cyan-100 px-3 py-2 text-xs font-black text-cyan-700" onClick={() => setPayment(volunteer.id, "paid")} type="button">
                        Verify Payment
                      </button>
                      <button className="rounded-full bg-orange-100 px-3 py-2 text-xs font-black text-orange-700" onClick={() => setPayment(volunteer.id, "failed")} type="button">
                        Reject Payment
                      </button>
                      <button className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700" onClick={() => setStatus(volunteer.id, "verified")} type="button">
                        Verify
                      </button>
                      <button className="rounded-full bg-rose-100 px-3 py-2 text-xs font-black text-rose-700" onClick={() => setStatus(volunteer.id, "rejected")} type="button">
                        Reject
                      </button>
                      <button className="rounded-full bg-amber-100 px-3 py-2 text-xs font-black text-amber-700" onClick={() => setStatus(volunteer.id, "under_review")} type="button">
                        Review
                      </button>
                      <button className="rounded-full bg-cyan-100 px-3 py-2 text-xs font-black text-cyan-700" disabled={isSelf} onClick={() => setRole(volunteer.id, "it_staff")} type="button">
                        Promote
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FoundationModule({ active }) {
  const title = moduleLabels[active] || "Module";
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
          Save foundation
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
          {title} CMS foundation is ready for List, Create, Edit, and Delete wiring.
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

function AuditLogsView() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getAdminAuditLogs().then(setLogs).catch(() => setLogs([]));
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">Audit Logs</h2>
      <div className="mt-4 divide-y divide-slate-100">
        {logs.length === 0 ? (
          <p className="py-8 text-sm font-semibold text-slate-500">No audit logs found.</p>
        ) : (
          logs.map((log) => (
            <div className="grid gap-1 py-3 text-sm md:grid-cols-[1fr_auto]" key={log.id}>
              <p className="font-bold">
                {log.actor_name || log.actor_email || "System"}: {log.action} {log.entity_type}
              </p>
              <span className="font-semibold text-slate-400">{formatDate(log.created_at)}</span>
            </div>
          ))
        )}
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
      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-600">Future payments</p>
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
      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Membership Fee</span>
        <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="membershipFee" onChange={updateField} type="number" value={settings.membershipFee || 0} />
      </label>
        <label className="mt-4 block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Currency</span>
          <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold uppercase outline-none" name="currency" onChange={updateField} value={settings.currency || "INR"} />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">UPI QR URL</span>
        <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="upiQrUrl" onChange={updateField} value={settings.upiQrUrl || ""} />
      </label>
      {settings.upiQrUrl ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Live QR Preview</span>
          <img alt="UPI QR preview" className="mt-3 h-40 w-40 rounded-xl bg-white object-cover" src={settings.upiQrUrl} />
        </div>
      ) : null}
      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Instructions</span>
        <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="paymentInstructions" onChange={updateField} value={settings.paymentInstructions || settings.payment_instructions || settings.instructions || ""} />
      </label>
      <button className="mt-5 h-11 rounded-xl bg-slate-950 px-5 text-sm font-black text-white" type="submit">
        Save settings
      </button>
      {message ? <p className="mt-4 text-sm font-bold text-emerald-700">{message}</p> : null}
    </form>
  );
}

export default function AdminPanel({ initialActive = "dashboard" }) {
  const [active, setActive] = useState(initialActive);

  const content = useMemo(() => {
    if (active === "dashboard") return <DashboardView />;
    if (active === "volunteers") return <VolunteersView />;
    if (active === "audit-logs") return <AuditLogsView />;
    if (active === "settings") return <MembershipSettingsView />;
    return <FoundationModule active={active} />;
  }, [active]);

  return (
    <AdminLayout active={active} onSelect={setActive}>
      {content}
    </AdminLayout>
  );
}
