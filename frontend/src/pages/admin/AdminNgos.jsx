/**
 * AdminNgos.jsx — Redesigned to match the Maai Dashboard design system.
 * Same DM Sans typography, navy/cyan tokens, card styles, and hero header
 * as Dashboard.jsx and AdminVolunteers.jsx.
 *
 * All data-fetching and state logic is preserved exactly.
 */

import { CheckCircle2, Eye, XCircle, Search, SlidersHorizontal, ChevronDown, Building2, ShieldCheck, Clock, RefreshCw, X, MapPin, Mail, Phone, Globe, LayoutDashboard } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminNgos, updateAdminNgoStatus } from "../../services/api";

const initialFilters = { search: "", membershipStatus: "all", paymentStatus: "all" };

/* ─── Design tokens ───────────────────────────────────────────── */
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

  .an-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #F6FAFB;
    color: var(--maai-navy);
    min-height: 100vh;
  }

  /* ── Page header ── */
  .an-page-header {
    background: linear-gradient(135deg, var(--maai-navy) 0%, var(--maai-ocean) 100%);
    padding: 32px 40px 28px;
    position: relative;
    overflow: hidden;
  }
  .an-page-header::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 55% 80% at 90% 50%, rgba(20,184,166,.16) 0%, transparent 70%),
      radial-gradient(ellipse 35% 60% at 10% 80%, rgba(6,182,212,.12) 0%, transparent 60%);
    pointer-events: none;
  }
  .an-header-dot-grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,.045) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }
  .an-header-inner {
    position: relative; z-index: 1;
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .an-header-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(20,184,166,.18); border: 1px solid rgba(20,184,166,.35);
    color: #5EEAD4; font-size: 11px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    padding: 4px 14px; border-radius: var(--radius-pill); margin-bottom: 14px;
  }
  .an-header-eyebrow svg { width: 12px; height: 12px; }
  .an-header-title {
    font-size: 28px; font-weight: 800; color: #fff;
    letter-spacing: -.02em; line-height: 1.15; margin-bottom: 6px;
  }
  .an-header-sub {
    font-size: 13.5px; color: rgba(255,255,255,.5); line-height: 1.6;
  }
  .an-dashboard-link {
    display: inline-flex; align-items: center; gap: 8px;
    min-height: 40px; padding: 0 16px;
    border-radius: 9999px;
    background: rgba(255,255,255,.1);
    border: 1px solid rgba(255,255,255,.16);
    color: #fff; text-decoration: none;
    font-size: 13px; font-weight: 800;
    transition: var(--transition);
  }
  .an-dashboard-link:hover {
    background: rgba(255,255,255,.16);
    transform: translateY(-1px);
  }
  .an-dashboard-link svg { width: 15px; height: 15px; }

  /* ── Stats strip ── */
  .an-stats-strip {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    padding: 24px 40px 0;
  }
  .an-stat-card {
    background: #fff; border-radius: var(--radius-card);
    border: 1px solid rgba(4,28,50,.07);
    padding: 18px 20px; display: flex; align-items: center; gap: 14px;
    box-shadow: var(--shadow-card); transition: var(--transition);
  }
  .an-stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lift); }
  .an-stat-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;
  }
  .an-stat-icon svg { width: 20px; height: 20px; }
  .an-stat-value {
    font-size: 26px; font-weight: 800; letter-spacing: -.02em; line-height: 1;
    color: var(--maai-navy);
  }
  .an-stat-label {
    font-size: 11px; font-weight: 600; letter-spacing: .07em;
    text-transform: uppercase; color: #94A3B8; margin-top: 4px;
  }

  /* ── Filter bar ── */
  .an-filters-wrap { padding: 20px 40px 0; }
  .an-filters {
    background: #fff; border-radius: var(--radius-card);
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: var(--shadow-card);
    padding: 16px 20px;
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  }
  .an-filter-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 11.5px; font-weight: 700; letter-spacing: .06em;
    text-transform: uppercase; color: #94A3B8; flex-shrink: 0;
  }
  .an-filter-label svg { width: 14px; height: 14px; }
  .an-filter-divider { width: 1px; height: 28px; background: rgba(4,28,50,.08); flex-shrink: 0; }
  .an-search-wrap {
    display: flex; align-items: center; gap: 9px;
    background: #F6FAFB; border: 1.5px solid rgba(4,28,50,.1);
    border-radius: 12px; padding: 0 14px; height: 40px;
    flex: 1; min-width: 180px; max-width: 280px;
    transition: var(--transition);
  }
  .an-search-wrap:focus-within {
    border-color: var(--maai-sky);
    box-shadow: 0 0 0 3px rgba(14,165,233,.12);
  }
  .an-search-wrap svg { width: 14px; height: 14px; color: #94A3B8; flex-shrink: 0; }
  .an-search-wrap input {
    border: none; outline: none; background: transparent;
    font-family: inherit; font-size: 13.5px; color: var(--maai-navy); width: 100%;
  }
  .an-search-wrap input::placeholder { color: #94A3B8; }
  .an-select-wrap { position: relative; }
  .an-select-wrap svg.chevron {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    width: 13px; height: 13px; color: #94A3B8; pointer-events: none;
  }
  .an-select {
    appearance: none; -webkit-appearance: none;
    background: #F6FAFB; border: 1.5px solid rgba(4,28,50,.1);
    border-radius: 12px; padding: 0 34px 0 12px; height: 40px;
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: var(--maai-navy); cursor: pointer; outline: none;
    transition: var(--transition);
  }
  .an-select:focus {
    border-color: var(--maai-sky);
    box-shadow: 0 0 0 3px rgba(14,165,233,.12);
  }

  /* ── Toast message ── */
  .an-toast {
    margin: 16px 40px 0;
    padding: 12px 18px;
    background: rgba(6,182,212,.08); border: 1px solid rgba(6,182,212,.25);
    border-radius: 14px; font-size: 13px; font-weight: 600; color: #0891B2;
    display: flex; align-items: center; gap: 8px;
  }
  .an-toast svg { width: 15px; height: 15px; flex-shrink: 0; }

  /* ── Table section ── */
  .an-table-wrap { padding: 20px 40px 48px; }
  .an-table-card {
    background: #fff; border-radius: var(--radius-card);
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: var(--shadow-card); overflow: hidden;
  }
  .an-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid rgba(4,28,50,.06);
  }
  .an-table-title-row { display: flex; align-items: center; gap: 10px; }
  .an-table-icon {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, rgba(20,184,166,.12), rgba(6,182,212,.12));
    display: grid; place-items: center;
  }
  .an-table-icon svg { width: 16px; height: 16px; color: var(--maai-teal); }
  .an-table-title { font-size: 14.5px; font-weight: 700; color: var(--maai-navy); }
  .an-count-badge {
    background: rgba(20,184,166,.1); color: #0D9488;
    font-size: 11px; font-weight: 700; letter-spacing: .06em;
    padding: 3px 10px; border-radius: var(--radius-pill);
    border: 1px solid rgba(20,184,166,.2);
  }

  .an-scroll { overflow-x: auto; }
  table.an-table {
    width: 100%; min-width: 900px;
    border-collapse: collapse; text-align: left;
  }
  .an-table thead tr {
    background: #F8FAFC;
    border-bottom: 1px solid rgba(4,28,50,.06);
  }
  .an-table th {
    padding: 12px 18px;
    font-size: 10.5px; font-weight: 700; letter-spacing: .1em;
    text-transform: uppercase; color: #94A3B8; white-space: nowrap;
  }
  .an-table tbody tr {
    border-bottom: 1px solid rgba(4,28,50,.05);
    transition: background .15s;
  }
  .an-table tbody tr:last-child { border-bottom: none; }
  .an-table tbody tr:hover { background: rgba(240,250,251,.7); }
  .an-table td { padding: 14px 18px; font-size: 13.5px; vertical-align: middle; }

  .an-org-name { font-weight: 700; color: var(--maai-navy); }
  .an-muted { font-weight: 500; color: #64748B; }

  /* ── Badges ── */
  .an-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: var(--radius-pill);
    font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
    white-space: nowrap;
  }
  .an-badge svg { width: 11px; height: 11px; }
  .an-badge-verified  { background: #ECFDF5; color: #059669; }
  .an-badge-rejected  { background: #FEF2F2; color: #DC2626; }
  .an-badge-review    { background: #FFF7ED; color: #D97706; }
  .an-badge-suspended { background: #F1F5F9; color: #64748B; }
  .an-badge-paid      { background: #ECFDF5; color: #059669; }
  .an-badge-free      { background: #F1F5F9; color: #64748B; }
  .an-badge-pending   { background: #FFF7ED; color: #D97706; }
  .an-badge-failed    { background: #FEF2F2; color: #DC2626; }

  /* ── Action buttons ── */
  .an-actions { display: flex; flex-wrap: wrap; gap: 6px; }
  .an-action-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 10px;
    font-family: inherit; font-size: 11.5px; font-weight: 700;
    border: none; cursor: pointer; transition: var(--transition);
    white-space: nowrap;
  }
  .an-action-btn svg { width: 11px; height: 11px; }
  .an-action-btn:hover { transform: translateY(-1px); }

  .an-btn-view    { background: #F1F5F9; color: #475569; }
  .an-btn-view:hover { background: #E2E8F0; }
  .an-btn-verify  { background: rgba(16,185,129,.1); color: #047857; }
  .an-btn-verify:hover { background: rgba(16,185,129,.2); }
  .an-btn-reject  { background: rgba(239,68,68,.1); color: #B91C1C; }
  .an-btn-reject:hover { background: rgba(239,68,68,.2); }
  .an-btn-suspend { background: rgba(100,116,139,.1); color: #475569; }
  .an-btn-suspend:hover { background: rgba(100,116,139,.2); }

  /* ── Empty / loading states ── */
  .an-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 24px; text-align: center;
  }
  .an-empty-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: var(--maai-surf); display: grid; place-items: center; margin-bottom: 14px;
  }
  .an-empty-icon svg { width: 24px; height: 24px; color: var(--maai-teal); }
  .an-empty-title { font-size: 15px; font-weight: 700; color: var(--maai-navy); }
  .an-empty-sub   { font-size: 13px; color: #94A3B8; margin-top: 5px; }

  .an-loading {
    padding: 28px 24px; font-size: 13.5px; font-weight: 600;
    color: #94A3B8; display: flex; align-items: center; gap: 8px;
  }
  .an-loading svg { width: 15px; height: 15px; animation: an-spin 1s linear infinite; }
  @keyframes an-spin { to { transform: rotate(360deg); } }

  /* ── Modal ── */
  .an-modal-backdrop {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(4,28,50,.55); backdrop-filter: blur(6px);
    display: grid; place-items: center; padding: 20px;
  }
  .an-modal {
    background: #fff; border-radius: 24px;
    box-shadow: 0 24px 80px rgba(4,28,50,.22);
    width: 100%; max-width: 600px;
    max-height: 90vh; overflow-y: auto;
    position: relative;
  }
  .an-modal-cover {
    width: 100%; height: 160px; object-fit: cover;
    border-radius: 24px 24px 0 0; display: block;
    background: linear-gradient(135deg, var(--maai-navy), var(--maai-ocean));
  }
  .an-modal-cover-placeholder {
    width: 100%; height: 160px;
    border-radius: 24px 24px 0 0;
    background: linear-gradient(135deg, var(--maai-navy) 0%, var(--maai-ocean) 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .an-modal-cover-placeholder svg { width: 40px; height: 40px; color: rgba(255,255,255,.25); }
  .an-modal-body { padding: 24px 28px 32px; }
  .an-modal-close {
    position: absolute; top: 14px; right: 14px;
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,.25);
    display: grid; place-items: center; cursor: pointer;
    transition: var(--transition);
  }
  .an-modal-close:hover { background: rgba(255,255,255,.28); }
  .an-modal-close svg { width: 15px; height: 15px; color: #fff; }
  .an-modal-name {
    font-size: 22px; font-weight: 800; letter-spacing: -.02em;
    color: var(--maai-navy); margin-bottom: 6px;
  }
  .an-modal-meta {
    display: flex; flex-wrap: wrap; gap: 14px; margin: 14px 0 18px;
  }
  .an-modal-meta-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 500; color: #64748B;
  }
  .an-modal-meta-item svg { width: 14px; height: 14px; color: var(--maai-teal); }
  .an-modal-desc-label {
    font-size: 10.5px; font-weight: 700; letter-spacing: .1em;
    text-transform: uppercase; color: #94A3B8; margin-bottom: 8px;
  }
  .an-modal-desc {
    font-size: 13.5px; color: #475569; line-height: 1.7;
    background: #F8FAFC; border-radius: 14px; padding: 16px;
    border: 1px solid rgba(4,28,50,.06);
  }
  .an-modal-status-row {
    display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;
  }
  .an-modal-chip {
    flex: 1; min-width: 100px;
    background: var(--maai-mist); border-radius: 14px;
    padding: 12px 14px; border: 1px solid rgba(4,28,50,.06);
  }
  .an-modal-chip-label {
    font-size: 10px; font-weight: 700; letter-spacing: .1em;
    text-transform: uppercase; color: #94A3B8; margin-bottom: 4px;
  }
  .an-modal-chip-value {
    font-size: 13px; font-weight: 700; color: var(--maai-navy);
  }
  .an-modal-actions {
    display: flex; gap: 8px; margin-top: 22px; flex-wrap: wrap;
  }
  .an-modal-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: var(--radius-pill);
    font-family: inherit; font-size: 13px; font-weight: 700;
    border: none; cursor: pointer; transition: var(--transition);
  }
  .an-modal-btn svg { width: 14px; height: 14px; }
  .an-modal-btn:hover { transform: translateY(-1px); }
  .an-modal-btn-verify  { background: rgba(16,185,129,.1); color: #047857; }
  .an-modal-btn-verify:hover { background: rgba(16,185,129,.18); }
  .an-modal-btn-reject  { background: rgba(239,68,68,.1); color: #B91C1C; }
  .an-modal-btn-reject:hover { background: rgba(239,68,68,.18); }
  .an-modal-btn-suspend { background: rgba(100,116,139,.1); color: #475569; }
  .an-modal-btn-suspend:hover { background: rgba(100,116,139,.18); }
  .an-modal-btn-close   { background: var(--maai-navy); color: #fff; margin-left: auto; }
  .an-modal-btn-close:hover { opacity: .88; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .an-page-header  { padding: 28px 20px 24px; }
    .an-stats-strip  { grid-template-columns: repeat(2, 1fr); padding: 20px 20px 0; }
    .an-filters-wrap { padding: 16px 20px 0; }
    .an-table-wrap   { padding: 16px 20px 40px; }
    .an-toast        { margin: 16px 20px 0; }
  }
  @media (max-width: 560px) {
    .an-stats-strip { grid-template-columns: 1fr 1fr; }
    .an-header-title { font-size: 22px; }
  }
`;

function StyleInjector() {
  useEffect(() => {
    const id = "an-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = css;
      document.head.appendChild(tag);
    }
  }, []);
  return null;
}

/* ─── Badge helpers ───────────────────────────────────────────── */
function MembershipBadge({ status }) {
  const s = status || "under_review";
  if (s === "verified")  return <span className="an-badge an-badge-verified"><CheckCircle2 />{s}</span>;
  if (s === "rejected")  return <span className="an-badge an-badge-rejected"><XCircle />{s}</span>;
  if (s === "suspended") return <span className="an-badge an-badge-suspended">{s}</span>;
  return <span className="an-badge an-badge-review"><Clock />under review</span>;
}

function PaymentBadge({ status }) {
  const s = status || "free";
  if (s === "paid")    return <span className="an-badge an-badge-paid"><CheckCircle2 />{s}</span>;
  if (s === "failed")  return <span className="an-badge an-badge-failed"><XCircle />{s}</span>;
  if (s === "pending") return <span className="an-badge an-badge-pending"><Clock />{s}</span>;
  return <span className="an-badge an-badge-free">{s}</span>;
}

/* ─── Main component ──────────────────────────────────────────── */
export default function AdminNgos() {
  const [ngos, setNgos]               = useState([]);
  const [filters, setFilters]         = useState(initialFilters);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [message, setMessage]         = useState("");
  const [loading, setLoading]         = useState(true);

  const loadNgos = useCallback(async (nextFilters) => {
    setLoading(true);
    try {
      setNgos(await getAdminNgos(nextFilters));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () => loadNgos(initialFilters).catch(() => setMessage("Unable to load NGOs.")),
      0
    );
    return () => window.clearTimeout(timer);
  }, [loadNgos]);

  function updateFilter(event) {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    window.setTimeout(
      () => loadNgos(nextFilters).catch(() => setMessage("Unable to filter NGOs.")),
      0
    );
  }

  async function changeStatus(id, status) {
    await updateAdminNgoStatus(id, status);
    setMessage(`NGO marked ${status}.`);
    await loadNgos(filters);
  }

  /* Derived stats */
  const total     = ngos.length;
  const verified  = ngos.filter((n) => n.membershipStatus === "verified").length;
  const pending   = ngos.filter((n) => n.membershipStatus === "under_review").length;
  const paid      = ngos.filter((n) => n.paymentStatus === "paid").length;

  return (
    <>
      <StyleInjector />
      <div className="an-root">

        {/* ── Page header ── */}
        <div className="an-page-header">
          <div className="an-header-dot-grid" />
          <div className="an-header-inner">
            <div>
              <div className="an-header-eyebrow">
                <Building2 />Admin NGO Panel
              </div>
              <h1 className="an-header-title">NGO Registrations</h1>
              <p className="an-header-sub">Review, verify and manage all registered NGO partnerships.</p>
            </div>
            <Link className="an-dashboard-link" to="/admin">
              <LayoutDashboard />
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="an-stats-strip">
          <div className="an-stat-card">
            <div className="an-stat-icon" style={{ background: "linear-gradient(135deg, rgba(20,184,166,.12), rgba(6,182,212,.12))" }}>
              <Building2 style={{ color: "#14B8A6" }} />
            </div>
            <div>
              <div className="an-stat-value">{total}</div>
              <div className="an-stat-label">Total NGOs</div>
            </div>
          </div>
          <div className="an-stat-card">
            <div className="an-stat-icon" style={{ background: "linear-gradient(135deg, rgba(16,185,129,.12), rgba(20,184,166,.12))" }}>
              <CheckCircle2 style={{ color: "#10B981" }} />
            </div>
            <div>
              <div className="an-stat-value">{verified}</div>
              <div className="an-stat-label">Verified</div>
            </div>
          </div>
          <div className="an-stat-card">
            <div className="an-stat-icon" style={{ background: "linear-gradient(135deg, rgba(245,158,11,.12), rgba(251,191,36,.12))" }}>
              <Clock style={{ color: "#F59E0B" }} />
            </div>
            <div>
              <div className="an-stat-value">{pending}</div>
              <div className="an-stat-label">Under Review</div>
            </div>
          </div>
          <div className="an-stat-card">
            <div className="an-stat-icon" style={{ background: "linear-gradient(135deg, rgba(139,92,246,.12), rgba(168,85,247,.12))" }}>
              <ShieldCheck style={{ color: "#8B5CF6" }} />
            </div>
            <div>
              <div className="an-stat-value">{paid}</div>
              <div className="an-stat-label">Paid Members</div>
            </div>
          </div>
        </div>

        {/* ── Toast ── */}
        {message && (
          <div className="an-toast">
            <CheckCircle2 />{message}
          </div>
        )}

        {/* ── Filters ── */}
        <div className="an-filters-wrap">
          <div className="an-filters">
            <span className="an-filter-label"><SlidersHorizontal />Filters</span>
            <div className="an-filter-divider" />

            <div className="an-search-wrap">
              <Search />
              <input
                name="search"
                onChange={updateFilter}
                placeholder="Search NGOs…"
                value={filters.search}
              />
            </div>

            <div className="an-select-wrap">
              <select className="an-select" name="membershipStatus" onChange={updateFilter} value={filters.membershipStatus}>
                <option value="all">All status</option>
                <option value="under_review">Under review</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
              <ChevronDown className="chevron" />
            </div>

            <div className="an-select-wrap">
              <select className="an-select" name="paymentStatus" onChange={updateFilter} value={filters.paymentStatus}>
                <option value="all">All payment</option>
                <option value="free">Free</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
              <ChevronDown className="chevron" />
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="an-table-wrap">
          <div className="an-table-card">
            <div className="an-table-header">
              <div className="an-table-title-row">
                <div className="an-table-icon"><Building2 /></div>
                <span className="an-table-title">All NGOs</span>
                {!loading && <span className="an-count-badge">{ngos.length} records</span>}
              </div>
            </div>

            {loading && (
              <div className="an-loading">
                <RefreshCw />Loading NGOs…
              </div>
            )}

            <div className="an-scroll">
              <table className="an-table">
                <thead>
                  <tr>
                    <th>Organisation</th>
                    <th>Type</th>
                    <th>City</th>
                    <th>Membership</th>
                    <th>Payment</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map((ngo) => (
                    <tr key={ngo.id}>
                      <td className="an-org-name">{ngo.organizationName}</td>
                      <td className="an-muted">{ngo.ngoType || "—"}</td>
                      <td className="an-muted">{ngo.city || "—"}</td>
                      <td><MembershipBadge status={ngo.membershipStatus} /></td>
                      <td><PaymentBadge status={ngo.paymentStatus} /></td>
                      <td className="an-muted">
                        {ngo.joinedDate
                          ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(ngo.joinedDate))
                          : "—"}
                      </td>
                      <td>
                        <div className="an-actions">
                          <button
                            className="an-action-btn an-btn-view"
                            onClick={() => setSelectedNgo(ngo)}
                            type="button"
                          >
                            <Eye />View
                          </button>
                          <button
                            className="an-action-btn an-btn-verify"
                            onClick={() => changeStatus(ngo.id, "verified")}
                            type="button"
                          >
                            <CheckCircle2 />Verify
                          </button>
                          <button
                            className="an-action-btn an-btn-reject"
                            onClick={() => changeStatus(ngo.id, "rejected")}
                            type="button"
                          >
                            <XCircle />Reject
                          </button>
                          <button
                            className="an-action-btn an-btn-suspend"
                            onClick={() => changeStatus(ngo.id, "suspended")}
                            type="button"
                          >
                            <Clock />Suspend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && ngos.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="an-empty">
                          <div className="an-empty-icon"><Building2 /></div>
                          <div className="an-empty-title">No NGOs found</div>
                          <div className="an-empty-sub">Try adjusting your filters or search terms.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Detail modal ── */}
        {selectedNgo && (
          <div className="an-modal-backdrop" onClick={() => setSelectedNgo(null)}>
            <div className="an-modal" onClick={(e) => e.stopPropagation()}>

              {/* Cover image or gradient placeholder */}
              {selectedNgo.coverUrl ? (
                <img
                  alt={selectedNgo.organizationName}
                  className="an-modal-cover"
                  src={selectedNgo.coverUrl}
                />
              ) : (
                <div className="an-modal-cover-placeholder">
                  <Building2 />
                </div>
              )}

              <button
                className="an-modal-close"
                onClick={() => setSelectedNgo(null)}
                type="button"
              >
                <X />
              </button>

              <div className="an-modal-body">
                <h2 className="an-modal-name">{selectedNgo.organizationName}</h2>

                <div className="an-modal-meta">
                  {selectedNgo.email && (
                    <span className="an-modal-meta-item"><Mail />{selectedNgo.email}</span>
                  )}
                  {selectedNgo.phone && (
                    <span className="an-modal-meta-item"><Phone />{selectedNgo.phone}</span>
                  )}
                  {selectedNgo.city && (
                    <span className="an-modal-meta-item"><MapPin />{selectedNgo.city}</span>
                  )}
                  {selectedNgo.website && (
                    <span className="an-modal-meta-item"><Globe />{selectedNgo.website}</span>
                  )}
                </div>

                {(selectedNgo.description || selectedNgo.mission) && (
                  <>
                    <div className="an-modal-desc-label">About</div>
                    <div className="an-modal-desc">
                      {selectedNgo.description || selectedNgo.mission}
                    </div>
                  </>
                )}

                <div className="an-modal-status-row">
                  {[
                    ["Membership", selectedNgo.membershipStatus || "—"],
                    ["Payment",    selectedNgo.paymentStatus    || "—"],
                    ["Type",       selectedNgo.ngoType          || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="an-modal-chip">
                      <div className="an-modal-chip-label">{label}</div>
                      <div className="an-modal-chip-value">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="an-modal-actions">
                  <button
                    className="an-modal-btn an-modal-btn-verify"
                    onClick={() => { changeStatus(selectedNgo.id, "verified"); setSelectedNgo(null); }}
                    type="button"
                  >
                    <CheckCircle2 />Verify
                  </button>
                  <button
                    className="an-modal-btn an-modal-btn-reject"
                    onClick={() => { changeStatus(selectedNgo.id, "rejected"); setSelectedNgo(null); }}
                    type="button"
                  >
                    <XCircle />Reject
                  </button>
                  <button
                    className="an-modal-btn an-modal-btn-suspend"
                    onClick={() => { changeStatus(selectedNgo.id, "suspended"); setSelectedNgo(null); }}
                    type="button"
                  >
                    <Clock />Suspend
                  </button>
                  <button
                    className="an-modal-btn an-modal-btn-close"
                    onClick={() => setSelectedNgo(null)}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
