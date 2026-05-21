/**
 * AdminVolunteers.jsx — Redesigned to match the Maai Dashboard design system.
 * Matches the DM Sans typography, navy/cyan color tokens, card styles, and
 * topbar/layout conventions from Dashboard.jsx.
 *
 * All data-fetching logic is preserved exactly. Only the visual layer changes.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminVolunteers,
  updateAdminVolunteerPaymentStatus,
  updateAdminVolunteerStatus,
} from "../../services/api";
import {
  Users,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  LayoutDashboard,
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  ShieldX,
  Eye,
  RefreshCw,
} from "lucide-react";

/* ─── Design tokens (injected once) ──────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

  :root {
    --maai-navy:   #041C32;
    --maai-ocean:  #064663;
    --maai-sky:    #0EA5E9;
    --maai-cyan:   #06B6D4;
    --maai-teal:   #14B8A6;
    --maai-surf:   #E0F7FA;
    --maai-mist:   #F0FAFB;
    --radius-card: 20px;
    --radius-pill: 9999px;
    --shadow-card: 0 2px 16px rgba(4,28,50,.07), 0 1px 4px rgba(4,28,50,.05);
    --shadow-lift: 0 8px 32px rgba(4,28,50,.13), 0 2px 8px rgba(4,28,50,.07);
    --transition:  all .2s cubic-bezier(.4,0,.2,1);
  }

  .av-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #F6FAFB;
    color: var(--maai-navy);
    min-height: 100vh;
  }

  /* ── Page header ── */
  .av-page-header {
    background: linear-gradient(135deg, var(--maai-navy) 0%, var(--maai-ocean) 100%);
    padding: 32px 40px 28px;
    position: relative;
    overflow: hidden;
  }
  .av-page-header::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 55% 80% at 90% 50%, rgba(6,182,212,.16) 0%, transparent 70%),
      radial-gradient(ellipse 35% 60% at 10% 80%, rgba(14,165,233,.1) 0%, transparent 60%);
    pointer-events: none;
  }
  .av-header-dot-grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,.045) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }
  .av-header-inner {
    position: relative; z-index: 1;
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .av-header-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(6,182,212,.18); border: 1px solid rgba(6,182,212,.35);
    color: #67E8F9; font-size: 11px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    padding: 4px 14px; border-radius: var(--radius-pill); margin-bottom: 14px;
  }
  .av-header-eyebrow svg { width: 12px; height: 12px; }
  .av-header-title {
    font-size: 28px; font-weight: 800; color: #fff;
    letter-spacing: -.02em; line-height: 1.15; margin-bottom: 6px;
  }
  .av-header-sub {
    font-size: 13.5px; color: rgba(255,255,255,.5); line-height: 1.6;
  }
  .av-header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .av-btn-ghost {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.16);
    color: rgba(255,255,255,.85); font-family: inherit;
    font-size: 13px; font-weight: 600;
    padding: 9px 18px; border-radius: var(--radius-pill);
    text-decoration: none; cursor: pointer; transition: var(--transition);
  }
  .av-btn-ghost:hover { background: rgba(255,255,255,.15); color: #fff; }
  .av-btn-ghost svg { width: 14px; height: 14px; }
  .av-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg, var(--maai-sky), var(--maai-teal));
    color: #fff; font-family: inherit; font-size: 13px; font-weight: 700;
    padding: 9px 20px; border-radius: var(--radius-pill);
    border: none; cursor: pointer; text-decoration: none; transition: var(--transition);
  }
  .av-btn-primary:hover { opacity: .88; transform: translateY(-1px); }
  .av-btn-primary svg { width: 14px; height: 14px; }

  /* ── Stat strip ── */
  .av-stats-strip {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    padding: 24px 40px 0;
  }
  .av-stat-card {
    background: #fff; border-radius: var(--radius-card);
    border: 1px solid rgba(4,28,50,.07);
    padding: 18px 20px; display: flex; align-items: center; gap: 14px;
    box-shadow: var(--shadow-card); transition: var(--transition);
  }
  .av-stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lift); }
  .av-stat-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;
  }
  .av-stat-icon svg { width: 20px; height: 20px; }
  .av-stat-value {
    font-size: 26px; font-weight: 800; letter-spacing: -.02em; line-height: 1;
    color: var(--maai-navy);
  }
  .av-stat-label {
    font-size: 11px; font-weight: 600; letter-spacing: .07em;
    text-transform: uppercase; color: #94A3B8; margin-top: 4px;
  }

  /* ── Filter bar ── */
  .av-filters-wrap { padding: 20px 40px 0; }
  .av-filters {
    background: #fff; border-radius: var(--radius-card);
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: var(--shadow-card);
    padding: 16px 20px;
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  }
  .av-filter-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 11.5px; font-weight: 700; letter-spacing: .06em;
    text-transform: uppercase; color: #94A3B8; flex-shrink: 0;
  }
  .av-filter-label svg { width: 14px; height: 14px; }
  .av-filter-divider { width: 1px; height: 28px; background: rgba(4,28,50,.08); flex-shrink: 0; }
  .av-search-wrap {
    display: flex; align-items: center; gap: 9px;
    background: #F6FAFB; border: 1.5px solid rgba(4,28,50,.1);
    border-radius: 12px; padding: 0 14px; height: 40px;
    flex: 1; min-width: 180px; max-width: 280px;
    transition: var(--transition);
  }
  .av-search-wrap:focus-within {
    border-color: var(--maai-sky);
    box-shadow: 0 0 0 3px rgba(14,165,233,.12);
  }
  .av-search-wrap svg { width: 14px; height: 14px; color: #94A3B8; flex-shrink: 0; }
  .av-search-wrap input {
    border: none; outline: none; background: transparent;
    font-family: inherit; font-size: 13.5px; color: var(--maai-navy); width: 100%;
  }
  .av-search-wrap input::placeholder { color: #94A3B8; }
  .av-select-wrap { position: relative; }
  .av-select-wrap svg.chevron {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    width: 13px; height: 13px; color: #94A3B8; pointer-events: none;
  }
  .av-select {
    appearance: none; -webkit-appearance: none;
    background: #F6FAFB; border: 1.5px solid rgba(4,28,50,.1);
    border-radius: 12px; padding: 0 34px 0 12px; height: 40px;
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: var(--maai-navy); cursor: pointer; outline: none;
    transition: var(--transition);
  }
  .av-select:focus {
    border-color: var(--maai-sky);
    box-shadow: 0 0 0 3px rgba(14,165,233,.12);
  }

  /* ── Table section ── */
  .av-table-wrap { padding: 20px 40px 48px; }
  .av-table-card {
    background: #fff; border-radius: var(--radius-card);
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: var(--shadow-card); overflow: hidden;
  }
  .av-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid rgba(4,28,50,.06);
  }
  .av-table-title-row { display: flex; align-items: center; gap: 10px; }
  .av-table-icon {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, rgba(14,165,233,.12), rgba(6,182,212,.12));
    display: grid; place-items: center;
  }
  .av-table-icon svg { width: 16px; height: 16px; color: var(--maai-sky); }
  .av-table-title { font-size: 14.5px; font-weight: 700; color: var(--maai-navy); }
  .av-count-badge {
    background: rgba(14,165,233,.1); color: var(--maai-sky);
    font-size: 11px; font-weight: 700; letter-spacing: .06em;
    padding: 3px 10px; border-radius: var(--radius-pill);
    border: 1px solid rgba(14,165,233,.2);
  }

  .av-scroll { overflow-x: auto; }
  table.av-table {
    width: 100%; min-width: 1060px;
    border-collapse: collapse; text-align: left;
  }
  .av-table thead tr {
    background: #F8FAFC;
    border-bottom: 1px solid rgba(4,28,50,.06);
  }
  .av-table th {
    padding: 12px 18px;
    font-size: 10.5px; font-weight: 700; letter-spacing: .1em;
    text-transform: uppercase; color: #94A3B8;
    white-space: nowrap;
  }
  .av-table tbody tr {
    border-bottom: 1px solid rgba(4,28,50,.05);
    transition: background .15s;
  }
  .av-table tbody tr:last-child { border-bottom: none; }
  .av-table tbody tr:hover { background: rgba(240,250,251,.7); }
  .av-table td { padding: 14px 18px; font-size: 13.5px; vertical-align: middle; }

  .av-name { font-weight: 700; color: var(--maai-navy); }
  .av-email { font-weight: 500; color: #64748B; }
  .av-muted { font-weight: 500; color: #64748B; }

  /* ── Badges ── */
  .av-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: var(--radius-pill);
    font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
    white-space: nowrap;
  }
  .av-badge svg { width: 11px; height: 11px; }
  .av-badge-verified  { background: #ECFDF5; color: #059669; }
  .av-badge-rejected  { background: #FEF2F2; color: #DC2626; }
  .av-badge-review    { background: #FFF7ED; color: #D97706; }
  .av-badge-paid      { background: #ECFDF5; color: #059669; }
  .av-badge-free      { background: #F1F5F9; color: #64748B; }
  .av-badge-pending   { background: #FFF7ED; color: #D97706; }
  .av-badge-failed    { background: #FEF2F2; color: #DC2626; }

  /* ── Action buttons ── */
  .av-actions { display: flex; flex-wrap: wrap; gap: 6px; }
  .av-action-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 10px;
    font-family: inherit; font-size: 11.5px; font-weight: 700;
    border: none; cursor: pointer; transition: var(--transition);
    white-space: nowrap;
  }
  .av-action-btn svg { width: 11px; height: 11px; }
  .av-action-btn:hover { transform: translateY(-1px); }

  .av-btn-view    { background: #F1F5F9; color: #475569; }
  .av-btn-view:hover { background: #E2E8F0; }

  .av-btn-verify-pay  { background: rgba(6,182,212,.1); color: #0891B2; }
  .av-btn-verify-pay:hover { background: rgba(6,182,212,.2); }

  .av-btn-reject-pay  { background: rgba(249,115,22,.1); color: #C2410C; }
  .av-btn-reject-pay:hover { background: rgba(249,115,22,.2); }

  .av-btn-verify-mem  { background: rgba(16,185,129,.1); color: #047857; }
  .av-btn-verify-mem:hover { background: rgba(16,185,129,.2); }

  .av-btn-reject-mem  { background: rgba(239,68,68,.1); color: #B91C1C; }
  .av-btn-reject-mem:hover { background: rgba(239,68,68,.2); }

  .av-btn-suspend     { background: rgba(245,158,11,.1); color: #B45309; }
  .av-btn-suspend:hover { background: rgba(245,158,11,.2); }

  /* ── Empty / loading states ── */
  .av-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 24px; text-align: center;
  }
  .av-empty-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: var(--maai-surf); display: grid; place-items: center; margin-bottom: 14px;
  }
  .av-empty-icon svg { width: 24px; height: 24px; color: var(--maai-cyan); }
  .av-empty-title { font-size: 15px; font-weight: 700; color: var(--maai-navy); }
  .av-empty-sub   { font-size: 13px; color: #94A3B8; margin-top: 5px; }

  .av-error {
    margin: 16px 24px; padding: 14px 18px;
    background: #FEF2F2; border: 1px solid rgba(239,68,68,.2);
    border-radius: 14px; font-size: 13px; font-weight: 600; color: #B91C1C;
  }

  .av-loading {
    padding: 28px 24px; font-size: 13.5px; font-weight: 600;
    color: #94A3B8; display: flex; align-items: center; gap: 8px;
  }
  .av-loading svg { width: 15px; height: 15px; animation: av-spin 1s linear infinite; }
  @keyframes av-spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .av-page-header { padding: 28px 20px 24px; }
    .av-stats-strip { grid-template-columns: repeat(2, 1fr); padding: 20px 20px 0; }
    .av-filters-wrap { padding: 16px 20px 0; }
    .av-table-wrap   { padding: 16px 20px 40px; }
  }
  @media (max-width: 560px) {
    .av-stats-strip { grid-template-columns: 1fr 1fr; }
    .av-header-title { font-size: 22px; }
  }
`;

function StyleInjector() {
  useEffect(() => {
    const id = "av-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = css;
      document.head.appendChild(tag);
    }
  }, []);
  return null;
}

/* ─── Constants ───────────────────────────────────────────────── */
const membershipStatuses = ["all", "under_review", "verified", "rejected"];
const paymentStatuses    = ["all", "free", "pending", "paid", "failed"];

/* ─── Helpers ─────────────────────────────────────────────────── */
function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function uniqueOptions(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort();
}

function MembershipBadge({ status }) {
  const s = status || "under_review";
  if (s === "verified")
    return <span className="av-badge av-badge-verified"><CheckCircle2 />{s}</span>;
  if (s === "rejected")
    return <span className="av-badge av-badge-rejected"><XCircle />{s}</span>;
  return <span className="av-badge av-badge-review"><Clock />under review</span>;
}

function PaymentBadge({ status }) {
  const s = status || "free";
  if (s === "paid")    return <span className="av-badge av-badge-paid"><CheckCircle2 />{s}</span>;
  if (s === "failed")  return <span className="av-badge av-badge-failed"><XCircle />{s}</span>;
  if (s === "pending") return <span className="av-badge av-badge-pending"><Clock />{s}</span>;
  return <span className="av-badge av-badge-free">{s}</span>;
}

/* ─── Main component ──────────────────────────────────────────── */
export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    membershipStatus: "all",
    paymentStatus: "all",
    college: "all",
    city: "all",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(true);

  const colleges = useMemo(() => uniqueOptions(volunteers, "college"), [volunteers]);
  const cities   = useMemo(() => uniqueOptions(volunteers, "city"),    [volunteers]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setVolunteers(await getAdminVolunteers(filters));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load volunteers.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = window.setTimeout(load, 0);
    return () => window.clearTimeout(t);
  }, [load]);

  function updateFilter(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function setMembership(id, membershipStatus) {
    await updateAdminVolunteerStatus(id, membershipStatus);
    await load();
  }

  async function setPayment(id, paymentStatus) {
    await updateAdminVolunteerPaymentStatus(id, paymentStatus);
    await load();
  }

  /* Derived stats */
  const totalCount    = volunteers.length;
  const verifiedCount = volunteers.filter((v) => (v.membership_status || v.membershipStatus) === "verified").length;
  const pendingCount  = volunteers.filter((v) => (v.membership_status || v.membershipStatus) === "under_review").length;
  const paidCount     = volunteers.filter((v) => (v.payment_status || v.paymentStatus) === "paid").length;

  return (
    <>
      <StyleInjector />
      <div className="av-root">

        {/* ── Page header ── */}
        <div className="av-page-header">
          <div className="av-header-dot-grid" />
          <div className="av-header-inner">
            <div>
              <div className="av-header-eyebrow">
                <ShieldCheck />Admin Panel
              </div>
              <h1 className="av-header-title">Volunteer Verification</h1>
              <p className="av-header-sub">Review, verify and manage all volunteer memberships and payments.</p>
            </div>
            <div className="av-header-actions">
              <Link className="av-btn-ghost" to="/admin">
                <LayoutDashboard />Admin Dashboard
              </Link>
              <Link className="av-btn-primary" to="/volunteer">
                <ArrowLeft />Back to Website
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="av-stats-strip">
          <div className="av-stat-card">
            <div className="av-stat-icon" style={{ background: "linear-gradient(135deg, rgba(14,165,233,.12), rgba(6,182,212,.12))" }}>
              <Users style={{ color: "#0EA5E9" }} />
            </div>
            <div>
              <div className="av-stat-value">{totalCount}</div>
              <div className="av-stat-label">Total Volunteers</div>
            </div>
          </div>
          <div className="av-stat-card">
            <div className="av-stat-icon" style={{ background: "linear-gradient(135deg, rgba(16,185,129,.12), rgba(20,184,166,.12))" }}>
              <CheckCircle2 style={{ color: "#10B981" }} />
            </div>
            <div>
              <div className="av-stat-value">{verifiedCount}</div>
              <div className="av-stat-label">Verified Members</div>
            </div>
          </div>
          <div className="av-stat-card">
            <div className="av-stat-icon" style={{ background: "linear-gradient(135deg, rgba(245,158,11,.12), rgba(251,191,36,.12))" }}>
              <Clock style={{ color: "#F59E0B" }} />
            </div>
            <div>
              <div className="av-stat-value">{pendingCount}</div>
              <div className="av-stat-label">Under Review</div>
            </div>
          </div>
          <div className="av-stat-card">
            <div className="av-stat-icon" style={{ background: "linear-gradient(135deg, rgba(139,92,246,.12), rgba(168,85,247,.12))" }}>
              <CreditCard style={{ color: "#8B5CF6" }} />
            </div>
            <div>
              <div className="av-stat-value">{paidCount}</div>
              <div className="av-stat-label">Paid Members</div>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="av-filters-wrap">
          <div className="av-filters">
            <span className="av-filter-label"><SlidersHorizontal />Filters</span>
            <div className="av-filter-divider" />

            <div className="av-search-wrap">
              <Search />
              <input
                name="search"
                onChange={updateFilter}
                placeholder="Search name or email…"
                value={filters.search}
              />
            </div>

            <div className="av-select-wrap">
              <select className="av-select" name="membershipStatus" onChange={updateFilter} value={filters.membershipStatus}>
                {membershipStatuses.map((s) => (
                  <option key={s} value={s}>{s === "all" ? "All memberships" : s.replace("_", " ")}</option>
                ))}
              </select>
              <ChevronDown className="chevron" />
            </div>

            <div className="av-select-wrap">
              <select className="av-select" name="paymentStatus" onChange={updateFilter} value={filters.paymentStatus}>
                {paymentStatuses.map((s) => (
                  <option key={s} value={s}>{s === "all" ? "All payments" : s}</option>
                ))}
              </select>
              <ChevronDown className="chevron" />
            </div>

            <div className="av-select-wrap">
              <select className="av-select" name="college" onChange={updateFilter} value={filters.college}>
                <option value="all">All colleges</option>
                {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="chevron" />
            </div>

            <div className="av-select-wrap">
              <select className="av-select" name="city" onChange={updateFilter} value={filters.city}>
                <option value="all">All cities</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="chevron" />
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="av-table-wrap">
          <div className="av-table-card">
            <div className="av-table-header">
              <div className="av-table-title-row">
                <div className="av-table-icon"><Users /></div>
                <span className="av-table-title">All Volunteers</span>
                {!loading && <span className="av-count-badge">{volunteers.length} records</span>}
              </div>
            </div>

            {error && <div className="av-error">{error}</div>}

            {loading && (
              <div className="av-loading">
                <RefreshCw />Loading volunteers…
              </div>
            )}

            <div className="av-scroll">
              <table className="av-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>College</th>
                    <th>Membership</th>
                    <th>Payment</th>
                    <th>Transaction ID</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((v) => (
                    <tr key={v.id}>
                      <td className="av-name">{v.fullName || v.full_name}</td>
                      <td className="av-email">{v.email}</td>
                      <td className="av-muted">{v.college || "—"}</td>
                      <td>
                        <MembershipBadge status={v.membership_status || v.membershipStatus} />
                      </td>
                      <td>
                        <PaymentBadge status={v.payment_status || v.paymentStatus} />
                      </td>
                      <td className="av-muted">{v.transaction_id || v.transactionId || "FREE"}</td>
                      <td className="av-muted">{formatDate(v.joinedDate || v.createdAt)}</td>
                      <td>
                        <div className="av-actions">
                          <button className="av-action-btn av-btn-view" type="button">
                            <Eye />View
                          </button>
                          <button
                            className="av-action-btn av-btn-verify-pay"
                            onClick={() => setPayment(v.id, "paid")}
                            type="button"
                          >
                            <CheckCircle2 />Verify Pay
                          </button>
                          <button
                            className="av-action-btn av-btn-reject-pay"
                            onClick={() => setPayment(v.id, "failed")}
                            type="button"
                          >
                            <XCircle />Reject Pay
                          </button>
                          <button
                            className="av-action-btn av-btn-verify-mem"
                            onClick={() => setMembership(v.id, "verified")}
                            type="button"
                          >
                            <ShieldCheck />Verify
                          </button>
                          <button
                            className="av-action-btn av-btn-reject-mem"
                            onClick={() => setMembership(v.id, "rejected")}
                            type="button"
                          >
                            <ShieldX />Reject
                          </button>
                          <button
                            className="av-action-btn av-btn-suspend"
                            onClick={() => setMembership(v.id, "under_review")}
                            type="button"
                          >
                            <Clock />Suspend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && volunteers.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        <div className="av-empty">
                          <div className="av-empty-icon"><Users /></div>
                          <div className="av-empty-title">No volunteers found</div>
                          <div className="av-empty-sub">Try adjusting your filters or search terms.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}