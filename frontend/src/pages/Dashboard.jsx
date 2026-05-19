import {
  Award,
  Briefcase,
  ClipboardPlus,
  Crown,
  LayoutDashboard,
  LogOut,
  CalendarDays,
  CheckCircle2,
  IdCard,
  Megaphone,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  claimCertificate,
  getCertificatePreviewUrl,
  getCertificateDownloadUrl,
  getCertificates,
  getCareers,
  getAnnouncements,
  getIdCardDownloadUrl,
  getIdCardPreviewUrl,
  getMyIdCard,
  getMyCamp,
  getMyCamps,
  getMyEvents,
  requestVolunteerCamp,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "../components/notifications/NotificationBell";
import DashboardLayout from "../layouts/DashboardLayout";

const navigationItems = [
  { label: "Dashboard", path: "/volunteer/dashboard", icon: LayoutDashboard },
  { label: "Profile", path: "/volunteer/profile", icon: User },
  { label: "My ID Card", path: "/volunteer/id-card", icon: Award },
  { label: "Certificates", path: "/volunteer/certificates", icon: Award },
  { label: "My Camps", path: "/dashboard/my-camps", icon: CalendarDays },
  { label: "Career Opportunities", path: "/volunteer/careers", icon: Briefcase },
  { label: "Request Camp", path: "/volunteer/request-camp", icon: ClipboardPlus },
];

const limitedNavigationItems = [
  { label: "Dashboard", path: "/volunteer/dashboard", icon: LayoutDashboard },
];

function PageShell({ children }) {
  return (
    <div className="w-full max-w-none space-y-8">
      {children}
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-black text-slate-900">{value || "Not available"}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm">
        <Megaphone className="h-5 w-5 text-slate-300" />
      </div>
      <p className="max-w-xs text-xs font-semibold leading-5 text-slate-400">{text}</p>
    </div>
  );
}

function AnnouncementsWidget({ announcements }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-50">
            <Megaphone className="h-3.5 w-3.5 text-cyan-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Announcements</h3>
        </div>
        <Link
          className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
          to="/volunteer/announcements"
        >
          View all →
        </Link>
      </div>
 
      {announcements.length === 0 ? (
        <EmptyState text="No announcements right now. Updates will appear here for members." />
      ) : (
        <div className="flex flex-col gap-2">
          {announcements.slice(0, 3).map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-slate-100 bg-white p-4 transition hover:border-cyan-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-700">
                  {a.priority || "update"}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {a.announcementType || a.announcement_type || "announcement"}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800">{a.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-400">{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function UnderReviewPage({ onLogout, user }) {
  return (
    <div className="grid min-h-[calc(100vh-160px)] place-items-center py-8">
      <section className="w-full max-w-2xl rounded-[32px] border border-white/70 bg-white/85 p-8 text-center shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <p className="mx-auto w-fit rounded-full bg-cyan-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-700">
          Maai membership
        </p>
        <h2 className="mt-6 text-4xl font-black tracking-tight">Account Under Review</h2>
        <p className="mx-auto mt-4 max-w-lg text-base font-bold leading-7 text-slate-600">
          Your account is being reviewed and verified by the Maai organisation team.
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-6 text-slate-500">
          Once verification is complete, you will be able to access certificates, opportunities, camp requests, and all member features.
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-6 text-slate-500">
          This review is completed for every member to protect the Maai community from bots, spam, and malicious activity. You can still contact us by email if you need help.
        </p>
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          <Badge label="Membership status" value={user?.membership_status || user?.membershipStatus || "under_review"} />
          <Badge label="Payment status" value={user?.payment_status || user?.paymentStatus || "free"} />
          <Badge label="Transaction ID" value={user?.transaction_id || user?.transactionId || "FREE"} />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-extrabold text-white transition hover:bg-cyan-700"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
          <a
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            href="mailto:maai.organisation@gmail.com"
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
}

function DashboardPage({ user }) {
  const [certificates, setCertificates] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
 
  useEffect(() => {
    let ignore = false;
    Promise.all([getCertificates(), getMyEvents(), getAnnouncements()])
      .then(([certs, evts, anns]) => {
        if (!ignore) {
          setCertificates(certs);
          setEvents(evts);
          setAnnouncements(anns);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCertificates([]);
          setEvents([]);
          setAnnouncements([]);
        }
      });
    return () => { ignore = true; };
  }, []);
 
  const completedFields = [
    user?.full_name || user?.fullName,
    user?.email,
    user?.phone,
    user?.city,
    user?.college,
    user?.course,
    user?.skills,
    user?.interests,
  ].filter(Boolean).length;
 
  const profileCompletion = Math.round((completedFields / 8) * 100);
  const displayName = user?.full_name || user?.fullName || "Member";
  const role = (user?.role || "volunteer").toUpperCase();
 
  const participatedEvents = events.filter((e) =>
    ["participated", "completed"].includes(
      e.participationStatus || e.attendanceStatus || e.status
    )
  ).length;
 
  const pendingCerts = certificates.filter((c) => c.status !== "claimed").length;
 
  const stats = [
    {
      label: "Tasks Done",
      value: 12,
      sub: "+3 this week",
      icon: CheckCircle2,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Certificates",
      value: certificates.length,
      sub: pendingCerts > 0 ? `${pendingCerts} pending` : "All claimed",
      icon: Award,
      accent: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      label: "Camps Attended",
      value: participatedEvents,
      sub: participatedEvents === 0 ? "Register now" : "Great work!",
      icon: CalendarDays,
      accent: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "My Camps",
      value: events.length,
      sub: events.length === 0 ? "Create one" : "View all",
      icon: ClipboardPlus,
      accent: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];
 
  const quickActions = [
    { label: "View ID", href: "/volunteer/id-card", icon: IdCard },
    { label: "Certificates", href: "/volunteer/certificates", icon: Award },
    { label: "My Camps", href: "/dashboard/my-camps", icon: CalendarDays },
    { label: "Profile", href: "/volunteer/profile", icon: User },
  ];
 
  return (
    <PageShell>
 
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #0f2a3a 60%, #083344 100%)",
        }}
      >
        {/* decorative circles */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }}
        />
 
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* left */}
          <div>
            <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              {role}
            </span>
            <h1 className="mt-3 text-2xl font-black leading-tight text-white md:text-3xl">
              Welcome back,<br />
              <span className="text-cyan-400">{displayName}</span>
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Track your certificates, camps and membership from one place.
            </p>
          </div>
 
          {/* profile completion */}
          <div
            className="shrink-0 rounded-xl p-5 md:w-56"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Profile
              </p>
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mt-2 text-3xl font-black text-white">{profileCompletion}%</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {profileCompletion === 100 ? "Profile complete!" : "Complete your profile"}
            </p>
          </div>
        </div>
      </div>
 
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, accent, bg }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-100 bg-white p-5 transition hover:shadow-md"
          >
            <div className={`mb-4 inline-grid h-9 w-9 place-items-center rounded-xl ${bg}`}>
              <Icon className={`h-4 w-4 ${accent}`} />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className={`mt-1 text-xs font-bold ${accent}`}>{sub}</p>
          </div>
        ))}
      </div>
 
      {/* ── Announcements + Quick Actions ── */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
 
        {/* Announcements */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <AnnouncementsWidget announcements={announcements} />
        </div>
 
        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100">
              <Sparkles className="h-3.5 w-3.5 text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                to={href}
                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 py-4 text-center transition hover:border-cyan-200 hover:bg-cyan-50"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm transition group-hover:bg-cyan-100">
                  <Icon className="h-4 w-4 text-slate-500 transition group-hover:text-cyan-600" />
                </div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-cyan-700">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
 
      </div>
 
    </PageShell>
  );
}

function ProfilePage({ user }) {
  const fields = [
    ["Full name", user?.full_name || user?.fullName],
    ["Email", user?.email],
    ["Phone", user?.phone],
    ["City", user?.city],
    ["College", user?.college],
    ["Course", user?.course],
    ["Academic year", user?.academicYear || user?.academic_year],
    ["Skills", user?.skills],
    ["Interests", user?.interests],
    ["Membership status", user?.membership_status || user?.membershipStatus],
    ["Payment status", user?.payment_status || user?.paymentStatus],
  ];

  return (
    <PageShell>
      <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(([label, value]) => (
            <div className="rounded-2xl bg-white/80 p-4" key={label}>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">{label}</p>
              <p className="mt-2 text-sm font-bold text-slate-800">{value || "Not provided"}</p>
            </div>
          ))}
        </div>
        <button
          className="mt-6 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-cyan-700"
          type="button"
        >
          Edit Profile
        </button>
      </div>
    </PageShell>
  );
}

function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [message, setMessage] = useState("");

  async function loadCertificates() {
    setCertificates(await getCertificates());
  }

  useEffect(() => {
    let ignore = false;
    getCertificates()
      .then((data) => {
        if (!ignore) setCertificates(data);
      })
      .catch(() => {
        if (!ignore) setMessage("Unable to load certificates.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleClaim(id) {
    try {
      await claimCertificate(id);
      setMessage("Certificate claimed successfully.");
      await loadCertificates();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to claim certificate.");
    }
  }

  const membershipCertificates = certificates.filter(
    (certificate) => certificate.certificateType === "membership"
  );
  const eventCertificates = certificates.filter(
    (certificate) => certificate.certificateType !== "membership"
  );

  return (
    <PageShell>
      <div className="grid gap-6">
        <section>
          <h3 className="text-xl font-black">Membership Certificate</h3>
          <div className="mt-4 grid gap-4">
            {membershipCertificates.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6">
                <p className="text-sm font-semibold text-slate-500">
                  Membership certificate unlocks after verification.
                </p>
              </div>
            ) : null}
            {membershipCertificates.map((certificate) => (
              <div
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-6"
                key={certificate.id}
              >
                <div>
                  <h4 className="text-lg font-black">Membership Certificate</h4>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {certificate.status} · {certificate.verificationCode}
                  </p>
                </div>
                {certificate.status === "eligible" ? (
                  <button
                    className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-cyan-700"
                    onClick={() => handleClaim(certificate.id)}
                    type="button"
                  >
                    Claim Certificate
                  </button>
                ) : (
                  <a
                    className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-cyan-700"
                    href={getCertificateDownloadUrl(certificate.id)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-black">Event Certificates</h3>
          <div className="mt-4 grid gap-4">
            {eventCertificates.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8">
                <h4 className="text-lg font-black">No certificates available yet</h4>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Eligible event certificates will appear after an admin issues them.
                </p>
              </div>
            ) : null}
            {eventCertificates.map((certificate) => (
              <div
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-6"
                key={certificate.id}
              >
                <div>
                  <h4 className="text-lg font-black">{certificate.eventTitle}</h4>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {certificate.status} · {certificate.verificationCode}
                  </p>
                </div>
                {certificate.status === "eligible" ? (
                  <button
                    className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-cyan-700"
                    onClick={() => handleClaim(certificate.id)}
                    type="button"
                  >
                    Claim Certificate
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <a
                      className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
                      href={getCertificatePreviewUrl(certificate.id)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Preview
                    </a>
                    <a
                      className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-cyan-700"
                      href={getCertificateDownloadUrl(certificate.id)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {message ? <p className="text-sm font-bold text-slate-600">{message}</p> : null}
      </div>
    </PageShell>
  );
}

function IdCardSide({ card, side = "front" }) {
  const template = card?.template || {};
  const background =
    side === "front" ? template.frontBackgroundUrl : template.backBackgroundUrl;

  return (
    <div
      className="relative aspect-[1.62/1] overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg"
      style={
        background
          ? {
              backgroundImage: `linear-gradient(rgba(15,23,42,0.58), rgba(15,23,42,0.58)), url(${background})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
            {template.headerText || "Maai Membership Card"}
          </p>
          <h3 className="mt-3 text-2xl font-black">
            {side === "front" ? card.fullName : "Organization Details"}
          </h3>
        </div>
        {template.logoUrl ? (
          <img
            alt=""
            className="h-14 w-14 rounded-full bg-white object-cover p-1"
            src={template.logoUrl}
          />
        ) : null}
      </div>
      {side === "front" ? (
        <div className="absolute bottom-6 left-6 right-6 grid gap-3 sm:grid-cols-[92px_1fr]">
          <div className="grid h-24 w-24 place-items-center rounded-2xl border border-white/40 bg-white/20 text-xs font-black uppercase text-white/80">
            Photo
          </div>
          <div className="grid content-end gap-1 text-sm font-bold">
            <p>Membership No: {card.membershipNumber}</p>
            <p>Role: {card.role}</p>
            <p>Status: {card.membershipStatus}</p>
            <p>Verify: {card.verificationCode}</p>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-6 left-6 right-6 grid gap-4 sm:grid-cols-[120px_1fr]">
          <div className="grid h-28 w-28 place-items-center rounded-2xl border border-white/40 bg-white/20 text-xs font-black uppercase text-white/80">
            QR
          </div>
          <div className="grid content-end gap-2 text-sm font-semibold leading-6">
            <p>Maai organisation volunteer ID card.</p>
            <p>{template.footerText || "If found, please contact Maai organisation."}</p>
            <p className="font-black">Verification: {card.verificationCode}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function IdCardPage() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    getMyIdCard()
      .then((data) => {
        if (!ignore) setCard(data);
      })
      .catch((error) => {
        if (!ignore)
          setMessage(error?.response?.data?.message || "Unable to load ID card.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <PageShell>
      {loading ? (
        <p className="text-sm font-bold text-slate-500">Loading ID card...</p>
      ) : null}
      {!loading && !card ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6">
          <p className="text-sm font-semibold text-slate-500">
            Your ID card unlocks after membership verification.
          </p>
        </div>
      ) : null}
      {card ? (
        <div className="grid gap-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <IdCardSide card={card} />
            <IdCardSide card={card} side="back" />
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
              href={getIdCardPreviewUrl()}
              rel="noreferrer"
              target="_blank"
            >
              Preview
            </a>
            <a
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-cyan-700"
              href={getIdCardDownloadUrl()}
              rel="noreferrer"
              target="_blank"
            >
              Download PDF
            </a>
          </div>
        </div>
      ) : null}
      {message ? (
        <p className="mt-4 text-sm font-bold text-rose-600">{message}</p>
      ) : null}
    </PageShell>
  );
}

function CareerPage() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    const timer = window.setTimeout(() => {
      getCareers()
        .then((data) => {
          if (!ignore) setCareers(data);
        })
        .catch(() => {
          if (!ignore) setMessage("Unable to load opportunities right now.");
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 0);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <PageShell>
      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6">
          <p className="text-sm font-semibold text-slate-500">Loading opportunities...</p>
        </div>
      ) : null}
      {message ? <p className="mb-4 text-sm font-bold text-rose-600">{message}</p> : null}
      {!loading && careers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6">
          <h3 className="text-lg font-black">No opportunities are open right now</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            Published openings from the Careers CMS will appear here.
          </p>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {careers.map((career) => (
          <div
            className="rounded-3xl border border-slate-100 bg-slate-50/80 p-6"
            key={career.id || career.slug || career.title}
          >
            {career.imageUrl || career.image_url ? (
              <img
                alt={career.title}
                className="mb-5 h-36 w-full rounded-2xl object-cover"
                loading="lazy"
                src={career.imageUrl || career.image_url}
              />
            ) : null}
            <h3 className="text-xl font-black">{career.title}</h3>
            <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-cyan-700">
              {career.department || "Maai"} /{" "}
              {career.roleType || career.role_type || "volunteer"}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              {career.description}
            </p>
            {career.requirements ? (
              <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
                Requirements: {career.requirements}
              </p>
            ) : null}
            <a
              className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-cyan-700"
              href={
                career.applicationFormUrl ||
                career.application_form_url ||
                "mailto:maai.organisation@gmail.com"
              }
            >
              Apply
            </a>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function formatCampDate(value) {
  if (!value) return "Date pending";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function normalizeCampStatus(camp) {
  return (
    camp.participationStatus ||
    camp.participation_status ||
    camp.status ||
    "registered"
  );
}

function CampCard({ camp }) {
  const certificateStatus = camp.certificateStatus || camp.certificate_status || "none";

  return (
    <Link
      className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
      to={`/dashboard/my-camps/${camp.id}`}
    >
      <div className="h-40 bg-slate-200">
        {camp.bannerUrl || camp.banner_url ? (
          <img
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            src={camp.bannerUrl || camp.banner_url}
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-cyan-100 via-white to-pink-100 text-sm font-black uppercase tracking-[0.16em] text-cyan-700">
            Maai Camp
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-700">
            {camp.eventType || camp.event_type || "camp"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">
            {normalizeCampStatus(camp)}
          </span>
        </div>
        <h3 className="mt-4 text-xl font-black">{camp.campTitle || camp.title}</h3>
        <div className="mt-3 grid gap-1 text-sm font-semibold text-slate-500">
          <p>{formatCampDate(camp.startDatetime || camp.start_datetime || camp.date)}</p>
          <p>{camp.location || "Location pending"}</p>
        </div>
        <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
          Certificate:{" "}
          <span className="capitalize text-cyan-700">
            {certificateStatus === "none" ? "No certificate" : certificateStatus}
          </span>
        </p>
      </div>
    </Link>
  );
}

function CampSection({ empty, items, title }) {
  return (
    <section>
      <h3 className="mb-4 text-xl font-black">{title}</h3>
      {items.length === 0 ? <EmptyState text={empty} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((camp) => (
          <CampCard
            camp={camp}
            key={`${camp.id}-${camp.certificateId || "camp"}`}
          />
        ))}
      </div>
    </section>
  );
}

function MyCampsPage() {
  const [camps, setCamps] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [filters, setFilters] = useState({ filter: "all", search: "" });

  async function loadCamps(nextFilters = filters) {
    const params = {
      ...(nextFilters.search ? { search: nextFilters.search } : {}),
      ...(nextFilters.filter !== "all" ? { filter: nextFilters.filter } : {}),
    };
    setCamps(await getMyCamps(params));
    setNow(Date.now());
  }

  useEffect(() => {
    let ignore = false;
    const timer = window.setTimeout(() => {
      getMyCamps()
        .then((data) => {
          if (!ignore) setCamps(data);
          if (!ignore) setNow(Date.now());
        })
        .catch(() => {
          if (!ignore) setMessage("Unable to load your camps.");
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 0);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, []);

  function updateFilter(event) {
    const nextFilters = { ...filters, [event.target.name]: event.target.value };
    setFilters(nextFilters);
    window.setTimeout(
      () => loadCamps(nextFilters).catch(() => setMessage("Unable to filter camps.")),
      0
    );
  }

  const upcoming = camps.filter(
    (camp) =>
      normalizeCampStatus(camp) === "registered" &&
      (!camp.startDatetime || new Date(camp.startDatetime).getTime() >= now)
  );
  const completed = camps.filter((camp) =>
    ["participated", "completed"].includes(normalizeCampStatus(camp))
  );
  const past = camps.filter(
    (camp) =>
      camp.endDatetime &&
      new Date(camp.endDatetime).getTime() < now &&
      !completed.includes(camp)
  );
  const certificatesEarned = camps.filter(
    (camp) => camp.certificateId && camp.certificateStatus !== "revoked"
  ).length;

  return (
    <PageShell>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Camps Attended", completed.length, CheckCircle2],
          ["Certificates Earned", certificatesEarned, Award],
          ["Upcoming Camps", upcoming.length, CalendarDays],
        ].map(([label, value, Icon]) => (
          <article
            className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5"
            key={label}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                {label}
              </p>
              <Icon className="h-5 w-5 text-cyan-700" />
            </div>
            <p className="mt-4 text-3xl font-black">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-3 rounded-3xl border border-slate-100 bg-slate-50/80 p-4 md:grid-cols-[1fr_220px]">
        <input
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          name="search"
          onChange={updateFilter}
          placeholder="Search by event name or location"
          value={filters.search}
        />
        <select
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-cyan-400"
          name="filter"
          onChange={updateFilter}
          value={filters.filter}
        >
          <option value="all">All camps</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="certificates">Certificates Available</option>
          <option value="no_certificate">No Certificate</option>
        </select>
      </div>

      {loading ? (
        <p className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm font-semibold text-slate-500">
          Loading camps...
        </p>
      ) : null}
      {message ? <p className="mb-4 text-sm font-bold text-rose-600">{message}</p> : null}
      {!loading && camps.length === 0 ? (
        <div className="mt-6">
          <EmptyState text="No camps attended yet. Join upcoming initiatives to begin your journey." />
        </div>
      ) : null}
      {!loading && camps.length > 0 ? (
        <div className="mt-8 grid gap-8">
          <CampSection
            empty="No upcoming camps registered yet."
            items={upcoming}
            title="Upcoming Camps"
          />
          <CampSection
            empty="Completed camps will appear after participation is marked."
            items={completed}
            title="Completed Camps"
          />
          <CampSection
            empty="Past participation will appear here as your history grows."
            items={past.length ? past : camps}
            title="Past Participation"
          />
        </div>
      ) : null}
    </PageShell>
  );
}

function MyCampDetailPage() {
  const { id } = useParams();
  const [camp, setCamp] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadCamp() {
    setCamp(await getMyCamp(id));
  }

  useEffect(() => {
    let ignore = false;
    getMyCamp(id)
      .then((data) => {
        if (!ignore) setCamp(data);
      })
      .catch((error) => {
        if (!ignore)
          setMessage(
            error?.response?.data?.message || "Unable to load camp details."
          );
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleClaim() {
    try {
      await claimCertificate(camp.certificateId);
      setMessage("Certificate claimed successfully.");
      await loadCamp();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to claim certificate.");
    }
  }

  return (
    <PageShell>
      {loading ? <EmptyState text="Loading camp details..." /> : null}
      {message ? (
        <p className="mb-4 text-sm font-bold text-slate-600">{message}</p>
      ) : null}
      {camp ? (
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="h-72 bg-slate-200">
              {camp.bannerUrl || camp.banner_url ? (
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={camp.bannerUrl || camp.banner_url}
                />
              ) : (
                <div className="grid h-full place-items-center bg-gradient-to-br from-cyan-100 via-white to-pink-100 text-sm font-black uppercase tracking-[0.16em] text-cyan-700">
                  Maai Camp
                </div>
              )}
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold leading-7 text-slate-600">
                {camp.description || "No description available."}
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Badge
                  label="Date"
                  value={formatCampDate(
                    camp.startDatetime || camp.start_datetime || camp.date
                  )}
                />
                <Badge label="Location" value={camp.location || "Location pending"} />
                <Badge
                  label="Participation Status"
                  value={normalizeCampStatus(camp)}
                />
                <Badge
                  label="Certificate Status"
                  value={camp.certificateStatus || "No certificate"}
                />
                <Badge label="Related NGO" value={camp.ngoName || "Future ready"} />
              </div>
              {camp.certificateId ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {camp.certificateStatus === "eligible" ? (
                    <button
                      className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-cyan-700"
                      onClick={handleClaim}
                      type="button"
                    >
                      Claim Certificate
                    </button>
                  ) : null}
                  {camp.certificateStatus !== "revoked" ? (
                    <a
                      className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
                      href={getCertificateDownloadUrl(camp.certificateId)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Download Certificate
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <Link
            className="w-fit rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
            to="/dashboard/my-camps"
          >
            Back to My Camps
          </Link>
        </div>
      ) : null}
    </PageShell>
  );
}

function RequestCampPage() {
  const [form, setForm] = useState({
    campName: "",
    location: "",
    campType: "",
    beneficiaries: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await requestVolunteerCamp(form);
      setMessage("Camp request submitted successfully.");
      setForm({
        campName: "",
        location: "",
        campType: "",
        beneficiaries: "",
        description: "",
      });
    } catch (error) {
      const payload = error?.response?.data;
      setErrors(payload?.errors || {});
      setMessage(payload?.message || "Unable to submit camp request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell>
      <form
        className="grid gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-6"
        onSubmit={handleSubmit}
      >
        {[
          ["Camp Name", "campName"],
          ["Location", "location"],
          ["Type", "campType"],
          ["Expected beneficiaries", "beneficiaries"],
        ].map(([label, name]) => (
          <label className="block" key={name}>
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
              {label}
            </span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm font-semibold outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              name={name}
              onChange={updateField}
              value={form[name]}
            />
            {errors[name] ? (
              <p className="mt-2 text-xs font-semibold text-rose-600">{errors[name]}</p>
            ) : null}
          </label>
        ))}
        <label className="block">
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
            Description
          </span>
          <textarea
            className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            name="description"
            onChange={updateField}
            value={form.description}
          />
          {errors.description ? (
            <p className="mt-2 text-xs font-semibold text-rose-600">{errors.description}</p>
          ) : null}
        </label>
        {message ? <p className="text-sm font-bold text-slate-600">{message}</p> : null}
        <button
          className="w-fit rounded-full bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </PageShell>
  );
}

function renderPage(page, user, isLimitedMember, handleLogout) {
  if (isLimitedMember) return <UnderReviewPage onLogout={handleLogout} user={user} />;
  if (page === "profile") return <ProfilePage user={user} />;
  if (page === "id-card") return <IdCardPage />;
  if (page === "certificates") return <CertificatesPage />;
  if (page === "events" || page === "my-camps") return <MyCampsPage />;
  if (page === "my-camp-detail") return <MyCampDetailPage />;
  if (page === "careers") return <CareerPage />;
  if (page === "request-camp") return <RequestCampPage />;
  return <DashboardPage user={user} />;
}

export default function Dashboard({ page = "dashboard" }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayName = user?.full_name || user?.fullName || "Member";
  const isSuperadmin = user?.role === "superadmin";
  const isItStaff = user?.role === "it_staff";
  const isLimitedMember =
    user?.role === "volunteer" &&
    (user?.membership_status || user?.membershipStatus) !== "verified";
  const visibleNavigationItems = isSuperadmin
    ? [...navigationItems, { label: "God Mode", path: "/admin", icon: Crown }]
    : isItStaff
    ? [...navigationItems, { label: "Staff Panel", path: "/staff", icon: Crown }]
    : isLimitedMember
    ? limitedNavigationItems
    : navigationItems;

  function handleLogout() {
    logout();
    navigate("/auth?mode=login");
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const sidebarContent = (
    <div className="flex h-full flex-col p-6 w-full">
      <Link
        className="flex items-center gap-3 font-black tracking-tight"
        onClick={closeMobileMenu}
        to="/volunteer"
      >
        <img
          alt=""
          aria-hidden="true"
          className="h-10 w-10 rounded-2xl shadow-sm border border-slate-100"
          src="/Favicon.ico"
        />
        <span className="text-lg">Maai organisation</span>
      </Link>
      <nav className="mt-10 grid gap-2 text-sm font-bold text-slate-500">
        {visibleNavigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 transition duration-200 ${
                  isActive
                    ? "bg-cyan-50 text-cyan-700 shadow-sm"
                    : "hover:bg-slate-50 hover:text-slate-900"
                }`
              }
              key={item.path}
              onClick={closeMobileMenu}
              to={item.path}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto rounded-3xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
          Signed in as
        </p>
        <p className="mt-2 text-sm font-black text-slate-900">{displayName}</p>
        <p className="mt-1 text-xs font-bold capitalize text-cyan-700">
          {user?.role || "volunteer"}
        </p>
      </div>
    </div>
  );

  const topbarContent = (
    <header className="flex items-center justify-end gap-4 px-2 py-1">
      <div className="mr-auto hidden h-11 min-w-64 max-w-xl flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-400 xl:flex">
        <Search className="h-4 w-4" />
        <span>Search dashboard</span>
      </div>
      <div className="relative flex shrink-0 items-center gap-3">
        <span className="hidden rounded-full bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-700 md:inline-flex">
          {user?.role || "volunteer"}
        </span>
        {isSuperadmin ? (
          <Link
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] sm:inline-flex"
            to="/admin"
          >
            <Crown className="h-4 w-4" />
            God Mode
          </Link>
        ) : null}
        {isItStaff ? (
          <Link
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] sm:inline-flex"
            to="/staff"
          >
            <Crown className="h-4 w-4" />
            Staff Panel
          </Link>
        ) : null}
        <NotificationBell />
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-sm font-black text-white shadow-lg shadow-cyan-500/20">
          {displayName.slice(0, 1).toUpperCase()}
        </div>
        <button
          className="hidden h-11 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-cyan-700 md:inline-flex"
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );

  return (
    <DashboardLayout sidebar={sidebarContent} topbar={topbarContent}>
      {renderPage(page, user, isLimitedMember, handleLogout)}
    </DashboardLayout>
  );
}