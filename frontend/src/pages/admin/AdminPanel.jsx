/**
 * Maai Admin Panel — Redesigned to match Member Dashboard visual language
 *
 * Drop-in replacement for AdminPanel.jsx
 * All data fetching / auth hooks preserved exactly.
 * Visual layer rebuilt to match Dashboard.jsx design tokens, fonts, and style.
 *
 * Font: DM Sans (matches member dashboard)
 * Colors: --maai-navy, --maai-ocean, --maai-sky, --maai-cyan, --maai-teal (same tokens)
 * Sidebar: Same dark navy, same nav-item active gradient, same user card pattern
 * Cards: Same shadow, radius, border style as stat-card / panel in Dashboard.jsx
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, Award, Bell, Briefcase, CalendarDays, ClipboardList, Database,
  FileBadge, FileText, HeartHandshake, IdCard, Image, Mail, Megaphone,
  MessageSquare, Search, Settings, ShieldCheck, Star, UserCog, Users, X, Menu,
  Zap,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import NotificationBell from "../../components/notifications/NotificationBell";
import {
  getAdminAuditLogs, getAdminAnalytics, getAdminMembershipSettings,
  getAnnouncements, getAdminVolunteers, updateAdminMembershipSettings,
  updateAdminVolunteerPaymentStatus, updateAdminVolunteerRole, updateAdminVolunteerStatus,
} from "../../services/api";

const MAAI_LOGO_URL = "https://i.postimg.cc/G90qB7wj/maai-Logo-(2).png";

/* ─── Design tokens (mirrors Dashboard.jsx exactly) ─────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

  :root {
    --maai-navy:   #041C32;
    --maai-ocean:  #064663;
    --maai-sky:    #0EA5E9;
    --maai-cyan:   #06B6D4;
    --maai-teal:   #14B8A6;
    --maai-surf:   #E0F7FA;
    --maai-mist:   #F0FAFB;
    --sidebar-w:   270px;
    --radius-card: 20px;
    --radius-pill: 9999px;
    --shadow-card: 0 2px 16px rgba(4,28,50,.07), 0 1px 4px rgba(4,28,50,.05);
    --shadow-lift: 0 8px 32px rgba(4,28,50,.13), 0 2px 8px rgba(4,28,50,.07);
    --transition:  all .2s cubic-bezier(.4,0,.2,1);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'DM Sans', system-ui, sans-serif; background: #F6FAFB; color: var(--maai-navy); }

  /* ── Admin root ── */
  .admin-root { display: flex; min-height: 100vh; }

  /* ── Sidebar (matches Dashboard.jsx .sidebar exactly) ── */
  .admin-sidebar {
    width: var(--sidebar-w);
    min-height: 100vh;
    background: var(--maai-navy);
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0; top: 0;
    z-index: 50;
    transition: transform .3s cubic-bezier(.4,0,.2,1);
    overflow-y: auto;
  }
  .admin-sidebar-logo {
    display: flex; align-items: center; gap: 12px;
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,.08);
    flex-shrink: 0;
  }
  .admin-sidebar-logo-icon {
    width: 80px; height: 80px; border-radius: 0;
    background: transparent;
    display: grid; place-items: center; flex-shrink: 0;
    overflow: hidden;
  }
  .admin-sidebar-logo-icon img { width: 100%; height: 100%; object-fit: contain; }
  .admin-sidebar-logo-text { color: #fff; font-weight: 700; font-size: 15px; line-height: 1.3; letter-spacing: -.01em; }
  .admin-sidebar-logo-sub  { color: rgba(255,255,255,.4); font-size: 11px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }

  .admin-sidebar-nav { padding: 12px 10px; flex: 1; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }

  .admin-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
    color: rgba(255,255,255,.28); padding: 16px 10px 6px;
  }

  /* Matches .nav-item from Dashboard.jsx */
  .admin-nav-item {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 14px; margin: 1px 0;
    border-radius: 12px; font-size: 13.5px; font-weight: 500;
    color: rgba(255,255,255,.55); text-decoration: none;
    transition: var(--transition); position: relative; overflow: hidden;
    border: none; background: transparent; cursor: pointer; width: 100%; text-align: left;
    font-family: inherit;
  }
  .admin-nav-item:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.9); }
  .admin-nav-item.active {
    background: linear-gradient(135deg, rgba(14,165,233,.25), rgba(6,182,212,.18));
    color: #fff;
    box-shadow: inset 0 0 0 1px rgba(14,165,233,.3);
  }
  .admin-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: linear-gradient(to bottom, var(--maai-sky), var(--maai-teal));
  }
  .admin-nav-item svg { width: 16px; height: 16px; flex-shrink: 0; opacity: .7; }
  .admin-nav-item.active svg { opacity: 1; }

  /* User card at the bottom of sidebar */
  .admin-sidebar-user {
    margin-top: auto; padding: 16px;
    border-top: 1px solid rgba(255,255,255,.08);
    flex-shrink: 0;
  }
  .admin-sidebar-user-card {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,.06); border-radius: 14px;
    padding: 12px 14px; border: 1px solid rgba(255,255,255,.08);
  }
  .admin-sidebar-avatar {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, var(--maai-sky), var(--maai-teal));
    display: grid; place-items: center;
    font-weight: 800; font-size: 14px; color: #fff; flex-shrink: 0;
  }
  .admin-sidebar-user-name { font-size: 13px; font-weight: 600; color: #fff; line-height: 1.3; }
  .admin-sidebar-user-role { font-size: 11px; color: var(--maai-cyan); font-weight: 600; text-transform: capitalize; margin-top: 1px; }

  /* ── Topbar (matches Dashboard.jsx .topbar) ── */
  .admin-topbar {
    position: sticky; top: 0; z-index: 30;
    background: rgba(246,250,251,.88); backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(4,28,50,.07);
    display: flex; align-items: center; gap: 16px;
    padding: 12px 32px;
  }
  .admin-topbar-title-group { min-width: 0; }
  .admin-topbar-eyebrow {
    font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
    color: var(--maai-cyan); margin-bottom: 2px;
  }
  .admin-topbar-title { font-size: 20px; font-weight: 800; color: var(--maai-navy); letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .admin-topbar-search {
    display: flex; align-items: center; gap: 10px;
    background: #fff; border: 1px solid rgba(4,28,50,.1);
    border-radius: 12px; padding: 0 16px; height: 40px;
    flex: 1; max-width: 360px;
  }
  .admin-topbar-search input {
    border: none; outline: none; background: transparent;
    font-size: 13.5px; color: var(--maai-navy); font-family: inherit; width: 100%;
  }
  .admin-topbar-search input::placeholder { color: #94A3B8; }
  .admin-topbar-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
  .admin-role-badge {
    background: rgba(14,165,233,.1); color: var(--maai-sky);
    font-size: 11px; font-weight: 700; letter-spacing: .07em;
    text-transform: uppercase; padding: 5px 12px; border-radius: 9999px;
    border: 1px solid rgba(14,165,233,.2);
  }
  .admin-link-btn {
    display: flex; align-items: center; gap: 6px;
    background: rgba(4,28,50,.06); border: 1px solid rgba(4,28,50,.1);
    border-radius: 10px; padding: 8px 14px;
    font-size: 13px; font-weight: 600; color: #475569;
    cursor: pointer; transition: var(--transition); text-decoration: none;
  }
  .admin-link-btn:hover { background: #FEF2F2; color: #EF4444; border-color: rgba(239,68,68,.25); }
  .admin-cta-btn {
    background: linear-gradient(135deg, var(--maai-sky), var(--maai-teal));
    color: #fff; font-size: 12px; font-weight: 700;
    padding: 8px 16px; border-radius: 9999px; border: none;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    text-decoration: none; transition: var(--transition); font-family: inherit;
  }
  .admin-cta-btn:hover { opacity: .88; transform: translateY(-1px); }

  /* ── Main content ── */
  .admin-main {
    margin-left: var(--sidebar-w);
    flex: 1; min-height: 100vh; display: flex; flex-direction: column;
  }
  .admin-page-body { padding: 28px 32px 48px; display: flex; flex-direction: column; gap: 24px; }

  /* ── Command center hero (matches Dashboard.jsx .hero pattern) ── */
  .admin-hero {
    border-radius: 24px; overflow: hidden; position: relative;
    background: linear-gradient(135deg, #041C32 0%, #064663 55%, #0a3d5a 100%);
    padding: 36px 40px;
  }
  .admin-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(6,182,212,.18) 0%, transparent 70%),
                radial-gradient(ellipse 40% 60% at 20% 80%, rgba(14,165,233,.12) 0%, transparent 60%);
    pointer-events: none;
  }
  .admin-hero-dot-grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }
  .admin-hero-inner { position: relative; z-index: 1; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 20px; }
  .admin-hero-eyebrow {
    font-size: 10px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase;
    color: var(--maai-cyan); margin-bottom: 12px;
  }
  .admin-hero-title { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -.02em; line-height: 1.1; margin-bottom: 12px; }
  .admin-hero-sub { font-size: 14px; color: rgba(255,255,255,.55); line-height: 1.7; max-width: 520px; }
  .admin-hero-health {
    min-width: 200px; border-radius: 18px;
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.08); backdrop-filter: blur(12px);
    padding: 16px 20px;
  }
  .admin-hero-health-label { font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.45); margin-bottom: 6px; }
  .admin-hero-health-status { font-size: 24px; font-weight: 800; color: #fff; text-transform: capitalize; }
  .admin-hero-health-actions { font-size: 13px; font-weight: 600; color: #67E8F9; margin-top: 4px; }

  /* ── Stat cards (matches .stat-card from Dashboard.jsx) ── */
  .admin-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .admin-stat-card {
    background: #fff; border-radius: var(--radius-card); border: 1px solid rgba(4,28,50,.07);
    padding: 22px 22px 18px;
    transition: var(--transition); cursor: default;
    box-shadow: var(--shadow-card);
  }
  .admin-stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lift); }
  .admin-stat-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
  .admin-stat-label { font-size: 11px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: #94A3B8; }
  .admin-stat-icon { width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; }
  .admin-stat-icon svg { width: 20px; height: 20px; color: #fff; }
  .admin-stat-value { font-size: 38px; font-weight: 800; line-height: 1; letter-spacing: -.02em; color: var(--maai-navy); }

  /* ── Panel (matches Dashboard.jsx .panel) ── */
  .admin-panel {
    background: #fff; border-radius: var(--radius-card); border: 1px solid rgba(4,28,50,.07);
    overflow: hidden; box-shadow: var(--shadow-card);
  }
  .admin-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid rgba(4,28,50,.06);
  }
  .admin-panel-title { font-size: 15px; font-weight: 700; color: var(--maai-navy); }
  .admin-panel-body { padding: 20px 22px; }

  /* Charts panel */
  .admin-chart-grid { display: grid; grid-template-columns: 1.35fr 0.65fr; gap: 20px; }
  .admin-mini-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

  /* ── Volunteer table ── */
  .admin-table-wrap { overflow-x: auto; }
  .admin-table { width: 100%; min-width: 1100px; border-collapse: separate; border-spacing: 0; text-align: left; font-size: 13.5px; }
  .admin-table thead th {
    padding: 12px 18px; font-size: 10.5px; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; color: #94A3B8;
    background: #F8FAFC; border-bottom: 1px solid rgba(4,28,50,.07);
  }
  .admin-table tbody tr { transition: background .15s; }
  .admin-table tbody tr:hover { background: rgba(6,182,212,.03); }
  .admin-table tbody td { padding: 14px 18px; border-bottom: 1px solid rgba(4,28,50,.05); color: #334155; font-weight: 500; }
  .admin-table tbody td.bold { font-weight: 700; color: var(--maai-navy); }

  .admin-pill {
    display: inline-flex; align-items: center;
    border-radius: 9999px; padding: 3px 11px;
    font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    background: rgba(4,28,50,.06); color: #475569;
  }

  /* Action buttons row */
  .admin-action-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .admin-btn {
    border: none; border-radius: 9999px; padding: 6px 14px;
    font-size: 11.5px; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: var(--transition);
  }
  .admin-btn-neutral { background: rgba(4,28,50,.06); color: #475569; }
  .admin-btn-neutral:hover { background: rgba(4,28,50,.12); }
  .admin-btn-cyan   { background: rgba(6,182,212,.12); color: #0891B2; }
  .admin-btn-cyan:hover { background: rgba(6,182,212,.22); }
  .admin-btn-green  { background: rgba(16,185,129,.12); color: #059669; }
  .admin-btn-green:hover { background: rgba(16,185,129,.22); }
  .admin-btn-rose   { background: rgba(244,63,94,.1); color: #E11D48; }
  .admin-btn-rose:hover { background: rgba(244,63,94,.2); }
  .admin-btn-amber  { background: rgba(245,158,11,.1); color: #D97706; }
  .admin-btn-amber:hover { background: rgba(245,158,11,.2); }

  /* Role select */
  .admin-select {
    height: 34px; border-radius: 10px; border: 1px solid rgba(4,28,50,.1);
    padding: 0 12px; font-size: 13px; font-weight: 600; font-family: inherit;
    background: #fff; color: var(--maai-navy); cursor: pointer; outline: none;
    transition: border-color .15s;
  }
  .admin-select:focus { border-color: var(--maai-sky); }

  /* Volunteer search */
  .admin-search-input {
    height: 42px; border-radius: 12px; border: 1px solid rgba(4,28,50,.1);
    padding: 0 16px; font-size: 13.5px; font-family: inherit; font-weight: 500;
    background: #fff; color: var(--maai-navy); outline: none; width: 280px;
    transition: border-color .2s;
  }
  .admin-search-input:focus { border-color: var(--maai-sky); }

  /* Settings form */
  .admin-form-label { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #64748B; display: block; margin-bottom: 6px; }
  .admin-form-input {
    height: 42px; width: 100%; border-radius: 12px; border: 1px solid rgba(4,28,50,.1);
    padding: 0 14px; font-size: 13.5px; font-family: inherit; font-weight: 500;
    color: var(--maai-navy); background: #fff; outline: none; transition: border-color .2s;
  }
  .admin-form-input:focus { border-color: var(--maai-sky); }
  .admin-form-textarea {
    width: 100%; border-radius: 12px; border: 1px solid rgba(4,28,50,.1);
    padding: 12px 14px; font-size: 13.5px; font-family: inherit; font-weight: 500;
    color: var(--maai-navy); background: #fff; outline: none; transition: border-color .2s; min-height: 110px; resize: vertical;
  }
  .admin-form-textarea:focus { border-color: var(--maai-sky); }
  .admin-checkbox-row {
    display: flex; align-items: center; gap: 12px;
    background: #F8FAFC; border: 1px solid rgba(4,28,50,.07); border-radius: 14px;
    padding: 14px 16px; font-size: 14px; font-weight: 600; color: var(--maai-navy);
    cursor: pointer;
  }
  .admin-save-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--maai-navy); color: #fff; border: none; border-radius: 12px;
    padding: 12px 24px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: var(--transition);
  }
  .admin-save-btn:hover { background: var(--maai-ocean); transform: translateY(-1px); box-shadow: var(--shadow-lift); }

  /* CMS Foundation module */
  .admin-cms-grid { display: grid; grid-template-columns: 360px 1fr; gap: 20px; }

  /* Announcements */
  .admin-ann-card {
    border-radius: 14px; padding: 16px;
    border: 1px solid rgba(4,28,50,.07); transition: var(--transition);
    background: #fff;
  }
  .admin-ann-card:hover { border-color: rgba(14,165,233,.25); background: rgba(224,247,250,.3); }
  .admin-ann-type { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--maai-sky); margin-bottom: 8px; }
  .admin-ann-title { font-size: 14px; font-weight: 700; color: var(--maai-navy); margin-bottom: 6px; }
  .admin-ann-body { font-size: 13px; color: #64748B; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

  /* Audit logs */
  .admin-log-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid rgba(4,28,50,.05); }
  .admin-log-row:last-child { border-bottom: none; }
  .admin-log-action { font-size: 13.5px; font-weight: 600; color: var(--maai-navy); }
  .admin-log-time { font-size: 12px; font-weight: 500; color: #94A3B8; white-space: nowrap; }

  /* System health chips */
  .admin-health-chip {
    display: flex; align-items: center; gap: 12px;
    background: #F8FAFC; border-radius: 14px; padding: 14px 16px;
    border: 1px solid rgba(4,28,50,.06);
  }
  .admin-health-icon { width: 40px; height: 40px; border-radius: 11px; background: #fff; display: grid; place-items: center; box-shadow: var(--shadow-card); flex-shrink: 0; }
  .admin-health-icon svg { width: 18px; height: 18px; color: var(--maai-cyan); }
  .admin-health-label { font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #94A3B8; }
  .admin-health-value { font-size: 14px; font-weight: 700; color: var(--maai-navy); margin-top: 2px; text-transform: capitalize; }

  /* Empty states */
  .admin-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 48px 20px; text-align: center;
  }
  .admin-empty-icon { width: 52px; height: 52px; border-radius: 14px; background: var(--maai-surf); display: grid; place-items: center; margin-bottom: 12px; }
  .admin-empty-icon svg { width: 22px; height: 22px; color: var(--maai-cyan); }
  .admin-empty-text { font-size: 14px; font-weight: 600; color: #94A3B8; }

  /* Mobile */
  .admin-mobile-btn {
    display: none; position: fixed; top: 16px; left: 16px; z-index: 60;
    width: 42px; height: 42px; border-radius: 12px;
    background: #fff; border: 1px solid rgba(4,28,50,.1);
    box-shadow: var(--shadow-card); cursor: pointer; align-items: center; justify-content: center;
  }
  .admin-sidebar-overlay {
    display: none; position: fixed; inset: 0; background: rgba(4,28,50,.45);
    backdrop-filter: blur(4px); z-index: 49;
  }

  @media (max-width: 1280px) {
    .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .admin-chart-grid  { grid-template-columns: 1fr; }
    .admin-mini-grid   { grid-template-columns: 1fr 1fr; }
    .admin-cms-grid    { grid-template-columns: 1fr; }
    .admin-topbar-search { display: none; }
  }
  @media (max-width: 900px) {
    .admin-main { margin-left: 0; }
    .admin-sidebar { transform: translateX(-100%); }
    .admin-sidebar.open { transform: translateX(0); }
    .admin-mobile-btn { display: flex; }
    .admin-sidebar-overlay { display: block; }
    .admin-page-body { padding: 16px 16px 40px; }
    .admin-topbar { padding: 10px 16px 10px 64px; }
    .admin-stats-grid { grid-template-columns: 1fr 1fr; }
    .admin-mini-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .admin-stats-grid { grid-template-columns: 1fr; }
  }
`;

function StyleInjector() {
  useEffect(() => {
    const id = "maai-admin-styles";
    if (document.getElementById(id)) return;
    const tag = document.createElement("style");
    tag.id = id;
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => tag.remove();
  }, []);
  return null;
}

/* ─── Nav config ─────────────────────────────────────────────────────────── */
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
      { key: "camps", label: "Camps" },
      { key: "certificates", label: "Certificates" },
      { key: "templates", label: "Templates" },
    ],
  },
  {
    title: "Operations",
    items: [
      { key: "camp-requests", label: "Camp Requests" },
    ],
  },
  {
    title: "Communications",
    items: [
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

const moduleLabels = navSections.flatMap((s) => s.items).reduce((acc, item) => {
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
  camps: ClipboardList,
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
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
function AdminSidebar({ active, onSelect, isOpen, onClose, user }) {
  const displayName = user?.full_name || user?.fullName || "Admin";
  const initials = displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      {isOpen && (
        <div className="admin-sidebar-overlay" onClick={onClose} />
      )}
      <aside className={`admin-sidebar${isOpen ? " open" : ""}`}>
        {/* Logo */}
        <Link className="admin-sidebar-logo" style={{ textDecoration: "none" }} to="/volunteer">
          <div className="admin-sidebar-logo-icon">
            <img alt="Maai" src={MAAI_LOGO_URL} />
          </div>
          <div>
            <div className="admin-sidebar-logo-text">Maai Admin</div>
            <div className="admin-sidebar-logo-sub">Superadmin</div>
          </div>
          {isOpen && (
            <button
              onClick={(e) => { e.preventDefault(); onClose(); }}
              style={{ marginLeft: "auto", background: "rgba(255,255,255,.1)", border: "none", borderRadius: 9999, width: 32, height: 32, display: "grid", placeItems: "center", cursor: "pointer", color: "#fff" }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </Link>

        {/* Nav */}
        <nav className="admin-sidebar-nav">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="admin-section-label">{section.title}</div>
              {section.items.map((item) => {
                const Icon = navIcons[item.key] || FileText;
                const isActive = active === item.key;

                // Items with dedicated routes become Links
                if (item.key === "volunteers") {
                  return (
                    <Link key={item.key} className={`admin-nav-item${isActive ? " active" : ""}`} to="/admin/volunteers">
                      <Icon /><span>{item.label}</span>
                    </Link>
                  );
                }
                if (item.key === "ngos") {
                  return (
                    <Link key={item.key} className={`admin-nav-item${isActive ? " active" : ""}`} to="/admin/ngos">
                      <Icon /><span>{item.label}</span>
                    </Link>
                  );
                }
                if (item.key === "events") {
                  return (
                    <Link key={item.key} className={`admin-nav-item${isActive ? " active" : ""}`} to="/admin/events">
                      <Icon /><span>{item.label}</span>
                    </Link>
                  );
                }
                if (item.key === "camps") {
                  return (
                    <Link key={item.key} className={`admin-nav-item${isActive ? " active" : ""}`} to="/admin/camps">
                      <Icon /><span>{item.label}</span>
                    </Link>
                  );
                }
                if (item.key === "camp-requests") {
                  return (
                    <Link key={item.key} className={`admin-nav-item${isActive ? " active" : ""}`} to="/admin/camp-requests">
                      <Icon /><span>{item.label}</span>
                    </Link>
                  );
                }
                if (item.key === "announcements") {
                  return (
                    <Link key={item.key} className={`admin-nav-item${isActive ? " active" : ""}`} to="/admin/communications/announcements">
                      <Icon /><span>{item.label}</span>
                    </Link>
                  );
                }
                if (item.key === "email-center") {
                  return (
                    <Link key={item.key} className={`admin-nav-item${isActive ? " active" : ""}`} to="/admin/communications/email">
                      <Icon /><span>{item.label}</span>
                    </Link>
                  );
                }
                if (cmsModuleRoutes[item.key]) {
                  const cmsTo =
                    item.key === "social-links" ? "/admin/cms/social-links" :
                    item.key === "team" ? "/admin/cms/team" :
                    item.key === "mentors" ? "/admin/cms/mentors" :
                    item.key === "initiatives" ? "/admin/cms/initiatives" :
                    item.key === "reels" ? "/admin/cms/reels" :
                    item.key === "testimonials" ? "/admin/cms/testimonials" :
                    item.key === "careers" ? "/admin/cms/careers" :
                    item.key === "id-templates" ? "/admin/cms/id-templates" :
                    item.key === "certificate-templates" ? "/admin/cms/certificate-templates" :
                    `/admin/cms?module=${cmsModuleRoutes[item.key]}`;
                  return (
                    <Link key={item.key} className={`admin-nav-item${isActive ? " active" : ""}`} to={cmsTo}>
                      <Icon /><span>{item.label}</span>
                    </Link>
                  );
                }
                // Button-based navigation (no dedicated route yet)
                return (
                  <button
                    key={item.key}
                    className={`admin-nav-item${isActive ? " active" : ""}`}
                    onClick={() => { onSelect(item.key); onClose(); }}
                  >
                    <Icon /><span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User card at the bottom */}
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-user-card">
            <div className="admin-sidebar-avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="admin-sidebar-user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
              <div className="admin-sidebar-user-role">Superadmin</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ─── Topbar ──────────────────────────────────────────────────────────────── */
function AdminTopbar({ active }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function searchAdmin(event) {
    event.preventDefault();
    const term = query.trim().toLowerCase();
    if (!term) return;
    const routeMap = {
      dashboard: "/admin",
      volunteers: "/admin/volunteers",
      members: "/admin/volunteers",
      ngos: "/admin/ngos",
      events: "/admin/events",
      camps: "/admin/camps",
      "camp requests": "/admin/camp-requests",
      announcements: "/admin/communications/announcements",
      email: "/admin/communications/email",
      "email center": "/admin/communications/email",
      settings: "/admin/settings/membership",
      certificates: "/admin/events",
      templates: "/admin/cms/certificate-templates",
      "id card": "/admin/cms/id-templates",
      social: "/admin/cms/social-links",
      careers: "/admin/cms/careers",
      team: "/admin/cms/team",
      mentors: "/admin/cms/mentors",
      initiatives: "/admin/cms/initiatives",
      reels: "/admin/cms/reels",
      testimonials: "/admin/cms/testimonials",
    };
    const navMatch = navSections.flatMap((section) => section.items).find((item) => {
      const haystack = `${item.label} ${item.key}`.toLowerCase();
      return haystack.includes(term) || term.split(/\s+/).some((word) => haystack.includes(word));
    });
    const directKey = Object.keys(routeMap).find((key) => key.includes(term) || term.includes(key));
    const path = routeMap[directKey] || routeMap[navMatch?.key] || routeMap[(navMatch?.label || "").toLowerCase()];
    if (path) {
      navigate(path);
      setQuery("");
    }
  }

  return (
    <div className="admin-topbar">
      <div className="admin-topbar-title-group">
        <div className="admin-topbar-eyebrow">God Panel</div>
        <div className="admin-topbar-title">{moduleLabels[active] || "Dashboard"}</div>
      </div>

      <form className="admin-topbar-search" onSubmit={searchAdmin}>
        <Search style={{ width: 15, height: 15, color: "#94A3B8", flexShrink: 0 }} />
        <input onChange={(event) => setQuery(event.target.value)} placeholder="Search admin workspace..." value={query} />
      </form>

      <div className="admin-topbar-right">
        <span className="admin-role-badge">Superadmin</span>
        <NotificationBell />
        <Link className="admin-link-btn" to="/dashboard">
          Member View
        </Link>
        <Link className="admin-cta-btn" to="/volunteer">
          <Zap style={{ width: 13, height: 13 }} />
          Back to Website
        </Link>
      </div>
    </div>
  );
}

/* ─── Layout wrapper ──────────────────────────────────────────────────────── */
function AdminLayout({ active, onSelect, children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <StyleInjector />
      <div className="admin-root">
        <button className="admin-mobile-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu style={{ width: 20, height: 20 }} />
        </button>

        <AdminSidebar
          active={active}
          onSelect={onSelect}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
        />

        <div className="admin-main">
          <AdminTopbar active={active} />
          <div className="admin-page-body">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Shared components ───────────────────────────────────────────────────── */
function StatusPill({ children }) {
  return (
    <span className="admin-pill">{children || "pending"}</span>
  );
}

function EmptyPanel({ label }) {
  return (
    <div className="admin-empty">
      <div className="admin-empty-icon">
        <Activity />
      </div>
      <p className="admin-empty-text">{label}</p>
    </div>
  );
}

function MiniBarChart({ color, data, title }) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <span className="admin-panel-title">{title}</span>
      </div>
      <div className="admin-panel-body" style={{ paddingTop: 16 }}>
        <div style={{ width: "100%", minHeight: 300, height: 300 }}>
          {data.length === 0 ? (
            <EmptyPanel label={`No ${title.toLowerCase()} data yet.`} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(4,28,50,.1)", boxShadow: "0 4px 16px rgba(4,28,50,.1)", fontSize: 13 }} />
                <Bar dataKey="count" fill={color} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard View ──────────────────────────────────────────────────────── */
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
      .catch((err) => setError(err?.response?.data?.message || "Unable to load analytics."));
  }, []);

  const summary = analytics?.summary || {};
  const charts = analytics?.charts || {};
  const health = analytics?.systemHealth || {};

  const pendingActions = health.pendingActions ?? (
    Number(summary.pendingMemberships || summary.pending_memberships || 0) +
    Number(summary.pendingNgos || summary.pending_ngos || 0) +
    Number(summary.pendingCampRequests || summary.pending_camp_requests || 0)
  );

  const statCards = [
    { label: "Total Volunteers",  value: summary.volunteers,                                               Icon: Users,        gradient: "linear-gradient(135deg,#0EA5E9,#06B6D4)" },
    { label: "Verified Members",  value: summary.verifiedMembers ?? summary.verified_members,              Icon: ShieldCheck,  gradient: "linear-gradient(135deg,#10B981,#14B8A6)" },
    { label: "NGOs",              value: summary.ngos,                                                     Icon: HeartHandshake, gradient: "linear-gradient(135deg,#A855F7,#7C3AED)" },
    { label: "Events",            value: summary.events,                                                   Icon: CalendarDays, gradient: "linear-gradient(135deg,#F59E0B,#EF4444)" },
    { label: "Certificates",      value: summary.certificatesIssued ?? summary.certificates,              Icon: Award,        gradient: "linear-gradient(135deg,#F43F5E,#EC4899)" },
    { label: "Camp Requests",     value: summary.campRequests ?? summary.camp_requests,                   Icon: ClipboardList, gradient: "linear-gradient(135deg,#475569,#1E293B)" },
  ];

  const pieData = (charts.membershipBreakdown || []).map((item) => ({
    name: item.status || "unknown",
    value: Number(item.count || 0),
  }));
  const pieColors = ["#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#6366F1"];

  return (
    <>
      {error && (
        <div style={{ background: "#FFF1F2", border: "1px solid rgba(244,63,94,.2)", borderRadius: 14, padding: "14px 18px", color: "#E11D48", fontWeight: 600, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Hero */}
      <div className="admin-hero">
        <div className="admin-hero-dot-grid" />
        <div className="admin-hero-inner">
          <div>
            <div className="admin-hero-eyebrow">Operational Analytics</div>
            <div className="admin-hero-title">Maai Command Center</div>
            <div className="admin-hero-sub">
              Live membership, NGO, event, certificate, and camp request signals for production oversight.
            </div>
          </div>
          <div className="admin-hero-health">
            <div className="admin-hero-health-label">System Health</div>
            <div className="admin-hero-health-status">{health.databaseStatus || summary.databaseStatus || "Online"}</div>
            <div className="admin-hero-health-actions">{pendingActions} pending actions</div>
            <Link
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
              to="/admin/communications/announcements"
            >
              <Megaphone style={{ width: 16, height: 16 }} />
              Announcements
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="admin-stats-grid">
        {statCards.map(({ label, value, Icon, gradient }) => (
          <div className="admin-stat-card" key={label}>
            <div className="admin-stat-card-top">
              <div className="admin-stat-label">{label}</div>
              <div className="admin-stat-icon" style={{ background: gradient }}>
                <Icon />
              </div>
            </div>
            <div className="admin-stat-value">{value ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Growth chart + pie */}
      <div className="admin-chart-grid">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <span className="admin-panel-title">Volunteer Growth</span>
          </div>
          <div className="admin-panel-body">
            <div style={{ width: "100%", minHeight: 300, height: 300 }}>
              {(charts.volunteerGrowth || []).length === 0 ? (
                <EmptyPanel label="No volunteer growth data yet." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={charts.volunteerGrowth}>
                    <defs>
                      <linearGradient id="vgFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(4,28,50,.1)", fontSize: 13 }} />
                    <Area type="monotone" dataKey="count" stroke="#0891B2" fill="url(#vgFill)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <span className="admin-panel-title">Membership Status</span>
          </div>
          <div className="admin-panel-body">
            <div style={{ width: "100%", minHeight: 300, height: 300 }}>
              {pieData.length === 0 ? (
                <EmptyPanel label="No membership records yet." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={52} outerRadius={84} paddingAngle={4}>
                      {pieData.map((entry, i) => (
                        <Cell fill={pieColors[i % pieColors.length]} key={entry.name} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(4,28,50,.1)", fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
              {pieData.map((item, i) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC", borderRadius: 10, padding: "8px 12px" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, textTransform: "capitalize", color: pieColors[i % pieColors.length] }}>{item.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mini bar charts */}
      <div className="admin-mini-grid">
        <MiniBarChart data={charts.certificateGrowth || []} title="Certificates Issued" color="#F43F5E" />
        <MiniBarChart data={charts.eventsByMonth || []} title="Events by Month" color="#F59E0B" />
        <MiniBarChart data={charts.campRequests || []} title="Camp Requests" color="#475569" />
      </div>

      {/* Recent activity + system health */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <div className="admin-panel">
          <div className="admin-panel-header">
            <span className="admin-panel-title">Recent Activity</span>
          </div>
          <div className="admin-panel-body">
            {(analytics?.recentActivity || []).length === 0 ? (
              <EmptyPanel label="No admin activity yet." />
            ) : (
              analytics.recentActivity.map((item) => (
                <div className="admin-log-row" key={item.id}>
                  <span className="admin-log-action">
                    <strong>{item.actor_name || item.actor_email || "System"}</strong> — {item.action} on {item.entity_type}
                  </span>
                  <span className="admin-log-time">{formatDate(item.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <span className="admin-panel-title">System Health</span>
          </div>
          <div className="admin-panel-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Database Status", health.databaseStatus || summary.databaseStatus || "online", Database],
              ["Pending Actions", pendingActions, Activity],
              ["Membership Mode", health.membershipMode || summary.membershipMode || "free", ShieldCheck],
            ].map(([label, value, Icon]) => (
              <div className="admin-health-chip" key={label}>
                <div className="admin-health-icon"><Icon /></div>
                <div>
                  <div className="admin-health-label">{label}</div>
                  <div className="admin-health-value">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <span className="admin-panel-title">Announcements</span>
          <Megaphone style={{ width: 18, height: 18, color: "#06B6D4" }} />
        </div>
        <div className="admin-panel-body">
          {announcements.length === 0 ? (
            <EmptyPanel label="No announcements right now." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {announcements.slice(0, 3).map((a) => (
                <div className="admin-ann-card" key={a.id}>
                  <div className="admin-ann-type">{a.priority} / {a.announcementType || a.announcement_type}</div>
                  <div className="admin-ann-title">{a.title}</div>
                  <div className="admin-ann-body">{a.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Volunteers View ─────────────────────────────────────────────────────── */
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
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load volunteers.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function setStatus(id, status) { await updateAdminVolunteerStatus(id, status); await load(); }
  async function setPayment(id, status) { await updateAdminVolunteerPaymentStatus(id, status); await load(); }
  async function setRole(id, role) { await updateAdminVolunteerRole(id, role); await load(); }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <div className="admin-panel-title">Volunteers</div>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>Verify, reject, and promote members.</div>
        </div>
        <input
          className="admin-search-input"
          placeholder="Search volunteers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div style={{ margin: "16px 22px", background: "#FFF1F2", borderRadius: 12, padding: "12px 16px", color: "#E11D48", fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}
      {loading && (
        <div style={{ padding: "20px 22px", fontSize: 13.5, color: "#94A3B8", fontWeight: 600 }}>Loading volunteers…</div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {["Name", "Email", "College", "Role", "Membership", "Payment", "Transaction", "Joined", "Actions"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {volunteers.map((v) => {
              const isSelf = Number(v.id) === Number(user?.id);
              return (
                <tr key={v.id}>
                  <td className="bold">{v.fullName || v.full_name}</td>
                  <td>{v.email}</td>
                  <td>{v.college || "—"}</td>
                  <td>
                    <select
                      className="admin-select"
                      disabled={isSelf}
                      value={v.role || "volunteer"}
                      onChange={(e) => setRole(v.id, e.target.value)}
                    >
                      <option value="volunteer">volunteer</option>
                      <option value="it_staff">it_staff</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                  </td>
                  <td><StatusPill>{v.membership_status || v.membershipStatus}</StatusPill></td>
                  <td>{v.payment_status || v.paymentStatus}</td>
                  <td>{v.transaction_id || v.transactionId || "FREE"}</td>
                  <td>{formatDate(v.joinedDate || v.createdAt)}</td>
                  <td>
                    <div className="admin-action-row">
                      <button className="admin-btn admin-btn-neutral" type="button">View</button>
                      <button className="admin-btn admin-btn-cyan" type="button" onClick={() => setPayment(v.id, "paid")}>Verify Payment</button>
                      <button className="admin-btn admin-btn-amber" type="button" onClick={() => setPayment(v.id, "failed")}>Reject Payment</button>
                      <button className="admin-btn admin-btn-green" type="button" onClick={() => setStatus(v.id, "verified")}>Verify</button>
                      <button className="admin-btn admin-btn-rose" type="button" onClick={() => setStatus(v.id, "rejected")}>Reject</button>
                      <button className="admin-btn admin-btn-amber" type="button" onClick={() => setStatus(v.id, "under_review")}>Review</button>
                      <button className="admin-btn admin-btn-cyan" type="button" disabled={isSelf} onClick={() => setRole(v.id, "it_staff")}>Promote</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Foundation (CMS) Module ─────────────────────────────────────────────── */
function FoundationModule({ active }) {
  const title = moduleLabels[active] || "Module";
  return (
    <div className="admin-cms-grid">
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#06B6D4", marginBottom: 2 }}>Create / Edit</div>
            <div className="admin-panel-title">{title}</div>
          </div>
        </div>
        <div className="admin-panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="admin-form-label">Title / Name</label>
            <input className="admin-form-input" placeholder={`${title} title`} />
          </div>
          <div>
            <label className="admin-form-label">Description</label>
            <textarea className="admin-form-textarea" placeholder="Module content" />
          </div>
          <button className="admin-save-btn" type="button" style={{ alignSelf: "flex-start" }}>
            Save {title}
          </button>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 2 }}>List</div>
            <div className="admin-panel-title">{title}</div>
          </div>
          <button className="admin-btn admin-btn-neutral" type="button">Create</button>
        </div>
        <div className="admin-panel-body">
          <div style={{ border: "1.5px dashed rgba(4,28,50,.12)", borderRadius: 14, padding: "40px 24px", textAlign: "center", color: "#94A3B8", fontSize: 13.5, fontWeight: 600 }}>
            {title} CMS is ready for List, Create, Edit, and Delete wiring.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="admin-btn admin-btn-neutral" type="button">Edit</button>
            <button className="admin-btn admin-btn-rose" type="button">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Audit Logs View ─────────────────────────────────────────────────────── */
function AuditLogsView() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getAdminAuditLogs().then(setLogs).catch(() => setLogs([]));
  }, []);

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <span className="admin-panel-title">Audit Logs</span>
      </div>
      <div className="admin-panel-body">
        {logs.length === 0 ? (
          <EmptyPanel label="No audit logs found." />
        ) : (
          logs.map((log) => (
            <div className="admin-log-row" key={log.id}>
              <span className="admin-log-action">
                <strong>{log.actor_name || log.actor_email || "System"}</strong>: {log.action} {log.entity_type}
              </span>
              <span className="admin-log-time">{formatDate(log.created_at)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Membership Settings View ────────────────────────────────────────────── */
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
    getAdminMembershipSettings().then((data) => { if (data) setSettings(data); });
  }, []);

  function updateField(e) {
    const { checked, name, type, value } = e.target;
    setSettings((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    setMessage("");
  }

  async function saveSettings(e) {
    e.preventDefault();
    const updated = await updateAdminMembershipSettings(settings);
    setSettings(updated);
    setMessage("Settings saved successfully.");
  }

  return (
    <div className="admin-panel" style={{ maxWidth: 680 }}>
      <div className="admin-panel-header">
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#06B6D4", marginBottom: 2 }}>Membership</div>
          <span className="admin-panel-title">Payment Settings</span>
        </div>
      </div>
      <form className="admin-panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={saveSettings}>
        <label className="admin-checkbox-row">
          <input type="checkbox" name="paymentsEnabled" checked={Boolean(settings.paymentsEnabled)} onChange={updateField} />
          Enable paid membership registration
        </label>
        <label className="admin-checkbox-row">
          <input type="checkbox" name="isActive" checked={Boolean(settings.isActive ?? settings.is_active ?? true)} onChange={updateField} />
          Active membership plan
        </label>
        <div>
          <label className="admin-form-label">Membership Name</label>
          <input className="admin-form-input" name="membershipName" value={settings.membershipName || settings.membership_name || ""} onChange={updateField} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label className="admin-form-label">Membership Fee</label>
            <input className="admin-form-input" type="number" name="membershipFee" value={settings.membershipFee || 0} onChange={updateField} />
          </div>
          <div>
            <label className="admin-form-label">Currency</label>
            <input className="admin-form-input" name="currency" value={settings.currency || "INR"} onChange={updateField} />
          </div>
        </div>
        <div>
          <label className="admin-form-label">UPI QR URL</label>
          <input className="admin-form-input" name="upiQrUrl" value={settings.upiQrUrl || ""} onChange={updateField} />
        </div>
        {settings.upiQrUrl && (
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: "1px solid rgba(4,28,50,.07)" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 10 }}>Live QR Preview</div>
            <img alt="UPI QR preview" src={settings.upiQrUrl} style={{ width: 140, height: 140, borderRadius: 12, objectFit: "cover", background: "#fff" }} />
          </div>
        )}
        <div>
          <label className="admin-form-label">Payment Instructions</label>
          <textarea className="admin-form-textarea" name="paymentInstructions" value={settings.paymentInstructions || settings.payment_instructions || settings.instructions || ""} onChange={updateField} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="admin-save-btn" type="submit">Save Settings</button>
          {message && <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>{message}</span>}
        </div>
      </form>
    </div>
  );
}

/* ─── Root export ─────────────────────────────────────────────────────────── */
export default function AdminPanel({ initialActive = "dashboard" }) {
  const { user } = useAuth();
  const [active, setActive] = useState(initialActive);

  const content = useMemo(() => {
    if (active === "dashboard") return <DashboardView />;
    if (active === "volunteers") return <VolunteersView />;
    if (active === "audit-logs") return <AuditLogsView />;
    if (active === "settings") return <MembershipSettingsView />;
    return <FoundationModule active={active} />;
  }, [active]);

  return (
    <AdminLayout active={active} onSelect={setActive} user={user}>
      {content}
    </AdminLayout>
  );
}
