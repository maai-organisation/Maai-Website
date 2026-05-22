/**
 * Maai Organisation — Premium Dashboard Redesign
 *
 * Drop-in replacement for Dashboard.jsx
 * All data fetching / auth hooks are preserved exactly as before.
 * Only the visual layer is replaced.
 *
 * Dependencies already in your project:
 *   lucide-react, react-router-dom, framer-motion (new — install if missing)
 *
 * Install framer-motion if not present:
 *   npm install framer-motion
 */

import {
  Award,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardPlus,
  Clock,
  Crown,
  ExternalLink,
  Heart,
  IdCard,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
  Zap,
  ChevronRight,
  Activity,
  Globe,
  Shield,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  getCertificates,
  getAnnouncements,
  getEvents,
  getMyCamps,
  getMyEvents,
  registerEvent,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "../components/notifications/NotificationBell";
import {
  AnnouncementsPage,
  CertificatesPage,
  EventsPage,
  GodModePage,
  IdCardPage,
  MyCampDetailPage,
  MyCampsPage,
  ProfilePage,
  RequestCampPage,
} from "./member/MemberDashboardPages";
import Careers from "./Careers";

const MAAI_LOGO_URL = "https://i.postimg.cc/G90qB7wj/maai-Logo-(2).png";

/* ─── Design tokens ──────────────────────────────────────────── */
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

  .maai-root {
    display: flex;
    min-height: 100dvh;
    overflow-x: hidden;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: var(--sidebar-w);
    height: 100dvh;
    min-height: 0;
    background: var(--maai-navy);
    display: flex;
    flex-direction: column;
    padding: 0;
    position: fixed;
    left: 0; top: 0;
    z-index: 50;
    transition: transform .3s cubic-bezier(.4,0,.2,1);
    overflow: hidden;
  }
  .sidebar-nav {
    padding: 10px 0;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
  }
  .sidebar-nav::-webkit-scrollbar { display: none; }
  .sidebar-logo {
    display: flex; align-items: center; gap: 12px;
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,.08);
  }
  .sidebar-logo-icon {
    width: 80px; height: 80px; border-radius: 0;
    background: transparent;
    display: grid; place-items: center; flex-shrink: 0;
    overflow: hidden;
  }
  .sidebar-logo-icon img { width: 100%; height: 100%; object-fit: contain; }
  .sidebar-logo-text { color: #fff; font-weight: 700; font-size: 15px; line-height: 1.3; letter-spacing: -.01em; }
  .sidebar-logo-sub  { color: rgba(255,255,255,.4); font-size: 11px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }

  .sidebar-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
    color: rgba(255,255,255,.28); padding: 20px 20px 8px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 14px; margin: 1px 10px;
    border-radius: 12px; font-size: 13.5px; font-weight: 500;
    color: rgba(255,255,255,.55); text-decoration: none;
    transition: var(--transition); position: relative; overflow: hidden;
  }
  .nav-item:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.9); }
  .nav-item.active {
    background: linear-gradient(135deg, rgba(14,165,233,.25), rgba(6,182,212,.18));
    color: #fff;
    box-shadow: inset 0 0 0 1px rgba(14,165,233,.3);
  }
  .nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: linear-gradient(to bottom, var(--maai-sky), var(--maai-teal));
  }
  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; opacity: .7; }
  .nav-item.active svg { opacity: 1; }

  .sidebar-user {
    margin-top: auto; padding: 16px;
    border-top: 1px solid rgba(255,255,255,.08);
  }
  .sidebar-utility {
    padding: 10px 0 14px;
    border-top: 1px solid rgba(255,255,255,.08);
  }
  .sidebar-user-card {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,.06); border-radius: 14px;
    padding: 12px 14px; border: 1px solid rgba(255,255,255,.08);
  }
  .sidebar-avatar {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, var(--maai-sky), var(--maai-teal));
    display: grid; place-items: center;
    font-weight: 800; font-size: 14px; color: #fff; flex-shrink: 0;
  }
  .sidebar-user-name { font-size: 13px; font-weight: 600; color: #fff; line-height: 1.3; }
  .sidebar-user-role { font-size: 11px; color: var(--maai-cyan); font-weight: 600; text-transform: capitalize; margin-top: 1px; }

  /* ── Topbar ── */
  .topbar {
    position: sticky; top: 0; z-index: 30;
    background: rgba(246,250,251,.88); backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(4,28,50,.07);
    display: flex; align-items: center; gap: 16px;
    padding: 12px 32px;
  }
  .topbar-search {
    display: flex; align-items: center; gap: 10px;
    background: #fff; border: 1px solid rgba(4,28,50,.1);
    border-radius: 12px; padding: 0 16px; height: 40px;
    flex: 1; max-width: 360px;
  }
  .topbar-search input {
    border: none; outline: none; background: transparent;
    font-size: 13.5px; color: var(--maai-navy); font-family: inherit; width: 100%;
  }
  .topbar-search input::placeholder { color: #94A3B8; }
  .topbar-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
  .role-badge {
    background: rgba(14,165,233,.1); color: var(--maai-sky);
    font-size: 11px; font-weight: 700; letter-spacing: .07em;
    text-transform: uppercase; padding: 5px 12px; border-radius: 9999px;
    border: 1px solid rgba(14,165,233,.2);
  }
  .god-mode-btn {
    background: linear-gradient(135deg, #0EA5E9, #14B8A6);
    color: #fff; font-size: 12px; font-weight: 700;
    padding: 7px 16px; border-radius: 9999px; border: none;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    text-decoration: none; transition: var(--transition);
  }
  .god-mode-btn:hover { opacity: .88; transform: translateY(-1px); }
  .topbar-avatar {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--maai-sky), var(--maai-teal));
    display: grid; place-items: center;
    font-weight: 800; font-size: 14px; color: #fff;
    cursor: pointer; border: 2px solid rgba(14,165,233,.3);
  }
  .logout-btn {
    display: flex; align-items: center; gap: 7px;
    background: rgba(4,28,50,.06); border: 1px solid rgba(4,28,50,.1);
    border-radius: 10px; padding: 8px 14px;
    font-size: 13px; font-weight: 600; color: #475569;
    cursor: pointer; transition: var(--transition);
  }
  .logout-btn:hover { background: #FEF2F2; color: #EF4444; border-color: rgba(239,68,68,.25); }
  .logout-btn svg { width: 15px; height: 15px; }

  /* ── Main ── */
  .main-content {
    margin-left: var(--sidebar-w);
    flex: 1; min-width: 0; min-height: 100dvh; display: flex; flex-direction: column;
  }
  .page-body {
    width: 100%;
    padding: 28px 32px 48px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* ── Hero ── */
  .hero {
    border-radius: 24px; overflow: hidden; position: relative;
    background: linear-gradient(135deg, #041C32 0%, #064663 55%, #0a3d5a 100%);
    padding: 36px 40px; display: grid; grid-template-columns: 1fr 280px; gap: 24px;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(6,182,212,.18) 0%, transparent 70%),
                radial-gradient(ellipse 40% 60% at 20% 80%, rgba(14,165,233,.12) 0%, transparent 60%);
    pointer-events: none;
  }
  .hero-dot-grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }
  .hero-left { position: relative; z-index: 1; }
  .hero-role-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(6,182,212,.18); border: 1px solid rgba(6,182,212,.35);
    color: #67E8F9; font-size: 11px; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 9999px; margin-bottom: 18px;
  }
  .hero-role-pill svg { width: 12px; height: 12px; }
  .hero-title {
    font-size: 30px; font-weight: 800; color: #fff;
    line-height: 1.15; letter-spacing: -.02em; margin-bottom: 10px;
  }
  .hero-title span { color: var(--maai-cyan); }
  .hero-sub { font-size: 14px; color: rgba(255,255,255,.55); line-height: 1.7; max-width: 420px; }
  .hero-status-row { display: flex; align-items: center; gap: 12px; margin-top: 22px; flex-wrap: wrap; }
  .hero-status-chip {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
    color: rgba(255,255,255,.75); font-size: 12px; font-weight: 500;
    padding: 6px 14px; border-radius: 9999px;
  }
  .hero-status-chip .dot { width: 6px; height: 6px; border-radius: 9999px; background: #4ADE80; flex-shrink: 0; }

  .hero-right { position: relative; z-index: 1; }
  .profile-card {
    background: rgba(255,255,255,.07); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,.13); border-radius: 18px;
    padding: 22px;
  }
  .profile-card-label { font-size: 10.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.38); margin-bottom: 6px; }
  .profile-pct { font-size: 42px; font-weight: 800; color: #fff; line-height: 1; margin-bottom: 4px; }
  .profile-pct span { font-size: 18px; font-weight: 500; color: rgba(255,255,255,.5); }
  .profile-bar-bg { height: 6px; border-radius: 9999px; background: rgba(255,255,255,.12); margin: 14px 0; overflow: hidden; }
  .profile-bar-fill { height: 100%; border-radius: 9999px; background: linear-gradient(90deg, var(--maai-sky), var(--maai-teal)); transition: width .8s ease; }
  .profile-complete-msg { font-size: 12px; color: rgba(255,255,255,.45); }
  .profile-complete-msg.done { color: #4ADE80; }
  .hero-cta-row { display: flex; gap: 10px; margin-top: 16px; }
  .hero-cta {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 700;
    cursor: pointer; text-decoration: none; transition: var(--transition); border: none;
  }
  .hero-cta.primary { background: linear-gradient(135deg, var(--maai-sky), var(--maai-teal)); color: #fff; }
  .hero-cta.primary:hover { opacity: .88; transform: translateY(-1px); }
  .hero-cta.ghost { background: rgba(255,255,255,.1); color: rgba(255,255,255,.8); border: 1px solid rgba(255,255,255,.15); }
  .hero-cta.ghost:hover { background: rgba(255,255,255,.16); }
  .hero-cta svg { width: 14px; height: 14px; }

  /* ── Stat cards ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .stat-card {
    background: #fff; border-radius: var(--radius-card); border: 1px solid rgba(4,28,50,.07);
    padding: 22px 22px 18px; display: flex; flex-direction: column;
    transition: var(--transition); cursor: default;
    box-shadow: var(--shadow-card);
  }
  .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lift); }
  .stat-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
  .stat-icon {
    width: 42px; height: 42px; border-radius: 12px;
    display: grid; place-items: center;
  }
  .stat-icon svg { width: 20px; height: 20px; }
  .stat-trend {
    display: flex; align-items: center; gap: 4px;
    font-size: 11.5px; font-weight: 700;
    padding: 4px 10px; border-radius: 9999px;
  }
  .stat-trend svg { width: 12px; height: 12px; }
  .stat-trend.up   { background: #ECFDF5; color: #059669; }
  .stat-trend.warn { background: #FFF7ED; color: #D97706; }
  .stat-value { font-size: 34px; font-weight: 800; line-height: 1; letter-spacing: -.02em; color: var(--maai-navy); }
  .stat-label { font-size: 11.5px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: #94A3B8; margin-top: 6px; }
  .stat-mini-bar { height: 4px; border-radius: 9999px; background: rgba(4,28,50,.07); margin-top: 14px; overflow: hidden; }
  .stat-mini-fill { height: 100%; border-radius: 9999px; transition: width .8s ease; }

  /* ── Two-col bottom section ── */
  .bottom-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }

  /* ── Announcements ── */
  .panel {
    background: #fff; border-radius: var(--radius-card); border: 1px solid rgba(4,28,50,.07);
    overflow: hidden; box-shadow: var(--shadow-card);
  }
  .panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid rgba(4,28,50,.06);
  }
  .panel-title-row { display: flex; align-items: center; gap: 9px; }
  .panel-icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: grid; place-items: center;
  }
  .panel-icon svg { width: 15px; height: 15px; }
  .panel-title { font-size: 14px; font-weight: 700; color: var(--maai-navy); }
  .panel-view-all {
    font-size: 12px; font-weight: 600; color: var(--maai-sky);
    text-decoration: none; display: flex; align-items: center; gap: 4px;
    transition: var(--transition);
  }
  .panel-view-all:hover { color: var(--maai-ocean); }
  .panel-view-all svg { width: 12px; height: 12px; }
  .panel-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }

  .ann-card {
    border: 1px solid rgba(4,28,50,.07); border-radius: 14px; padding: 14px;
    transition: var(--transition); cursor: default; position: relative;
  }
  .ann-card:hover { border-color: rgba(14,165,233,.25); background: rgba(224,247,250,.3); }
  .ann-card.unread { border-color: rgba(6,182,212,.35); background: rgba(224,247,250,.22); }
  .ann-card.read { opacity: .78; }
  .ann-unread-dot { position: absolute; right: 14px; top: 14px; width: 8px; height: 8px; border-radius: 9999px; background: #EF4444; box-shadow: 0 0 0 4px #FEF2F2; }
  .ann-chips { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
  .chip {
    font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 9999px;
  }
  .chip.priority-important { background: #FEF3C7; color: #92400E; }
  .chip.priority-update    { background: rgba(14,165,233,.1); color: #0369A1; }
  .chip.type               { background: rgba(4,28,50,.05); color: #64748B; }
  .ann-title { font-size: 13.5px; font-weight: 700; color: var(--maai-navy); margin-bottom: 4px; }
  .ann-body  { font-size: 12.5px; color: #64748B; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .ann-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
  .ann-time { font-size: 11px; color: #94A3B8; font-weight: 500; }
  .ann-action {
    font-size: 11.5px; font-weight: 700; color: var(--maai-sky);
    display: flex; align-items: center; gap: 4px; text-decoration: none;
  }
  .ann-action svg { width: 11px; height: 11px; }

  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; }
  .empty-icon { width: 52px; height: 52px; border-radius: 14px; background: var(--maai-surf); display: grid; place-items: center; margin-bottom: 12px; }
  .empty-icon svg { width: 22px; height: 22px; color: var(--maai-cyan); }
  .empty-title { font-size: 14px; font-weight: 700; color: var(--maai-navy); }
  .empty-sub   { font-size: 12.5px; color: #94A3B8; margin-top: 4px; line-height: 1.5; max-width: 220px; }

  /* ── Quick actions ── */
  .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .action-card {
    display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
    background: #fff; border: 1px solid rgba(4,28,50,.07); border-radius: 16px;
    padding: 16px 16px 14px; text-decoration: none;
    transition: var(--transition); cursor: pointer; box-shadow: var(--shadow-card);
  }
  .action-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lift); border-color: rgba(14,165,233,.25); }
  .action-icon { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; }
  .action-icon svg { width: 16px; height: 16px; }
  .action-label { font-size: 13px; font-weight: 700; color: var(--maai-navy); }
  .action-sub   { font-size: 11px; color: #94A3B8; margin-top: 1px; }

  /* ── Impact summary ── */
  .impact-panel { background: linear-gradient(135deg, #041C32, #064663); border-radius: var(--radius-card); padding: 22px; }
  .impact-title { font-size: 13.5px; font-weight: 700; color: rgba(255,255,255,.9); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .impact-title svg { width: 15px; height: 15px; color: var(--maai-cyan); }
  .impact-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
  .impact-row:last-child { border-bottom: none; }
  .impact-row-left { display: flex; align-items: center; gap: 10px; }
  .impact-dot { width: 8px; height: 8px; border-radius: 9999px; flex-shrink: 0; }
  .impact-key { font-size: 12.5px; color: rgba(255,255,255,.55); font-weight: 500; }
  .impact-val { font-size: 16px; font-weight: 800; color: #fff; }

  /* ── Achievements ── */
  .achievements-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .badge-card {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    background: #fff; border: 1px solid rgba(4,28,50,.07); border-radius: 14px;
    padding: 16px 10px; box-shadow: var(--shadow-card); transition: var(--transition);
  }
  .badge-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lift); }
  .badge-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; }
  .badge-icon svg { width: 22px; height: 22px; }
  .badge-name { font-size: 11.5px; font-weight: 700; color: var(--maai-navy); text-align: center; }
  .badge-locked { opacity: .35; filter: grayscale(1); }

  /* ── Under review ── */
  .review-wrap { display: grid; place-items: center; min-height: 70vh; }
  .review-card {
    background: #fff; border: 1px solid rgba(4,28,50,.08); border-radius: 28px;
    padding: 48px 40px; max-width: 580px; width: 100%; text-align: center;
    box-shadow: var(--shadow-lift);
  }
  .review-badge-row { display: flex; gap: 12px; margin: 28px 0 0; }
  .review-meta-chip { flex: 1; background: var(--maai-mist); border-radius: 14px; padding: 14px 12px; }
  .review-meta-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #94A3B8; }
  .review-meta-value { font-size: 13px; font-weight: 700; color: var(--maai-navy); margin-top: 4px; }

  /* ── Mobile overlay ── */
  .mobile-menu-btn {
    display: none; position: fixed; top: 16px; left: 16px; z-index: 60;
    width: 42px; height: 42px; border-radius: 12px;
    background: #fff; border: 1px solid rgba(4,28,50,.1);
    box-shadow: var(--shadow-card); cursor: pointer;
    align-items: center; justify-content: center;
  }
  .sidebar-overlay {
    display: none; position: fixed; inset: 0; background: rgba(4,28,50,.45);
    backdrop-filter: blur(4px); z-index: 49;
  }

  @media (max-width: 1200px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .hero { grid-template-columns: 1fr; }
    .hero-right { display: none; }
    .bottom-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 900px) {
    .main-content { margin-left: 0; }
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .mobile-menu-btn { display: flex; }
    .sidebar-overlay { display: block; }
    .page-body { padding: 16px 16px 40px; }
    .topbar { padding: 10px 16px 10px 64px; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr; }
    .actions-grid { grid-template-columns: 1fr; }
    .achievements-grid { grid-template-columns: repeat(3, 1fr); }
    .hero { padding: 24px 20px; }
  }
`;

/* ─── Static mock data (replace with real API) ───────────────── */
const NAV_ITEMS = [
  { label: "Dashboard",          path: "/volunteer/dashboard",   icon: LayoutDashboard, group: "main" },
  { label: "Profile",            path: "/volunteer/profile",     icon: User,            group: "main" },
  { label: "My ID Card",         path: "/volunteer/id-card",     icon: IdCard,          group: "main" },
  { label: "Certificates",       path: "/volunteer/certificates",icon: Award,           group: "main" },
  { label: "Events",             path: "/volunteer/events",      icon: CalendarDays,    group: "activities" },
  { label: "My Camps",           path: "/dashboard/my-camps",    icon: CalendarDays,    group: "activities" },
  { label: "Career Opportunities",path: "/volunteer/careers",    icon: Briefcase,       group: "activities" },
  { label: "Request Camp",       path: "/volunteer/request-camp",icon: ClipboardPlus,   group: "activities" },
  { label: "Announcements",      path: "/volunteer/announcements", icon: Megaphone,     group: "activities" },
];

const QUICK_ACTIONS = [
  { id: 1, label: "View ID Card",    sub: "Download badge",   icon: IdCard,      href: "/volunteer/id-card",    bg: "#EFF6FF", color: "#3B82F6" },
  { id: 2, label: "Certificates",   sub: "View & claim",     icon: Award,       href: "/volunteer/certificates",bg: "#F0FDF4", color: "#16A34A" },
  { id: 3, label: "My Camps",       sub: "Upcoming events",  icon: CalendarDays,href: "/dashboard/my-camps",   bg: "#FFF7ED", color: "#EA580C" },
  { id: 4, label: "Edit Profile",   sub: "Update details",   icon: User,        href: "/volunteer/profile",    bg: "#FDF4FF", color: "#9333EA" },
  { id: 5, label: "Apply for Event",sub: "Browse camps",     icon: Globe,       href: "/volunteer/careers",    bg: "#ECFDF5", color: "#059669" },
  { id: 6, label: "Request Camp",   sub: "Organise one",     icon: ClipboardPlus,href:"/volunteer/request-camp",bg:"#FEF2F2",  color: "#DC2626" },
];

const BADGES = [
  { id: 1, name: "First Volunteer",icon: Star,       bg: "#FFF7ED", color: "#EA580C", earned: true  },
  { id: 2, name: "Camp Leader",    icon: Shield,     bg: "#EFF6FF", color: "#3B82F6", earned: true  },
  { id: 3, name: "100 Hours",      icon: Clock,      bg: "#F0FDF4", color: "#16A34A", earned: false },
  { id: 4, name: "Mentor",         icon: Users,      bg: "#FDF4FF", color: "#9333EA", earned: false },
  { id: 5, name: "Impact Hero",    icon: Heart,      bg: "#FEF2F2", color: "#DC2626", earned: false },
  { id: 6, name: "Top Achiever",   icon: Target,     bg: "#ECFDF5", color: "#059669", earned: false },
];

/* ─── Utility ────────────────────────────────────────────────── */
function calcCompletion(user) {
  const fields = [
    user?.full_name || user?.fullName,
    user?.email, user?.phone, user?.city,
    user?.college, user?.course, user?.skills, user?.interests,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StyleInjector() {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function Sidebar({ items, displayName, role, onClose, isOpen }) {
  const groups = {
    main:       items.filter(i => i.group === "main"),
    activities: items.filter(i => i.group === "activities"),
    special:    items.filter(i => !i.group || i.group === "special"),
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} style={{ display: "block" }} />
      )}
      <aside className={`sidebar${isOpen ? " open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <img alt="Maai" src={MAAI_LOGO_URL} />
          </div>
          <div>
            <div className="sidebar-logo-text">Maai</div>
            <div className="sidebar-logo-sub">Organisation</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          {groups.main.map(item => <NavItem key={item.path} item={item} onClick={onClose} />)}

          <div className="sidebar-section-label">Activities</div>
          {groups.activities.map(item => <NavItem key={item.path} item={item} onClick={onClose} />)}

          {groups.special.length > 0 && (
            <>
              <div className="sidebar-section-label">Admin</div>
              {groups.special.map(item => <NavItem key={item.path} item={item} onClick={onClose} />)}
            </>
          )}
        </nav>

        <div className="sidebar-utility">
          <Link className="nav-item" onClick={onClose} to="/volunteer">
            <Globe />
            Back to Website
          </Link>
        </div>

        {/* User card */}
        <div className="sidebar-user">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">{displayName[0]?.toUpperCase()}</div>
            <div>
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">{role || "volunteer"}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
    >
      <Icon />
      {item.label}
    </NavLink>
  );
}

function Topbar({ displayName, role, isSuperadmin, isItStaff, navItems, onLogout }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function searchDashboard(event) {
    event.preventDefault();
    const term = query.trim().toLowerCase();
    if (!term) return;
    const aliases = [
      { label: "achievements badges impact", path: "/volunteer/dashboard" },
      { label: "events available register events for you", path: "/volunteer/events" },
      { label: "upcoming camps registered camps my camps camps attended", path: "/volunteer/my-camps" },
      { label: "id card membership card badge", path: "/volunteer/id-card" },
      { label: "career jobs opportunities", path: "/volunteer/careers" },
      { label: "request camp organise camp", path: "/volunteer/request-camp" },
      { label: "announcements messages updates", path: "/volunteer/announcements" },
    ];
    const match = [...navItems, ...aliases].find((item) => {
      const haystack = `${item.label || ""} ${item.path || ""}`.toLowerCase();
      return haystack.includes(term) || term.split(/\s+/).some((word) => haystack.includes(word));
    });
    if (match?.path) {
      navigate(match.path);
      setQuery("");
    }
  }

  return (
    <div className="topbar">
      <form className="topbar-search" onSubmit={searchDashboard}>
        <Search style={{ width: 15, height: 15, color: "#94A3B8", flexShrink: 0 }} />
        <input onChange={(event) => setQuery(event.target.value)} placeholder="Search dashboard..." value={query} />
      </form>
      <div className="topbar-right">
        <span className="role-badge">{role || "volunteer"}</span>
        {isSuperadmin && (
          <Link to="/admin" className="god-mode-btn">
            <Crown style={{ width: 14, height: 14 }} />
            God Mode
          </Link>
        )}
        {isItStaff && (
          <Link to="/staff" className="god-mode-btn">
            <Crown style={{ width: 14, height: 14 }} />
            Staff Panel
          </Link>
        )}
        <NotificationBell />
        <div className="topbar-avatar">{displayName[0]?.toUpperCase()}</div>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut />
          Logout
        </button>
      </div>
    </div>
  );
}

function Hero({ displayName, role, membershipStatus, profileCompletion }) {
  return (
    <section className="hero">
      <div className="hero-dot-grid" />
      <div className="hero-left">
        <div className="hero-role-pill">
          <Sparkles />
          {membershipStatus === "verified" ? `Certified ${role}` : membershipStatus || role}
        </div>
        <h1 className="hero-title">
          Welcome back,<br />
          <span>{displayName}</span>
        </h1>
        <p className="hero-sub">
          Track your certificates, camps, volunteer hours and community impact — all in one place.
        </p>
        <div className="hero-status-row">
          <div className="hero-status-chip">
            <span className="dot" />
            Membership Active
          </div>
          <div className="hero-status-chip">
            <CheckCircle2 style={{ width: 12, height: 12 }} />
            Verified Member
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="profile-card">
          <div className="profile-card-label">Profile Completion</div>
          <div className="profile-pct">{profileCompletion}<span>%</span></div>
          <div className="profile-bar-bg">
            <div className="profile-bar-fill" style={{ width: `${profileCompletion}%` }} />
          </div>
          <div className={`profile-complete-msg${profileCompletion >= 100 ? " done" : ""}`}>
            {profileCompletion >= 100 ? "✓ Profile complete!" : `${100 - profileCompletion}% remaining`}
          </div>
          <div className="hero-cta-row">
            <Link to="/volunteer/profile" className="hero-cta primary">
              <User />
              Edit Profile
            </Link>
            <Link to="/volunteer/id-card" className="hero-cta ghost">
              <IdCard />
              ID Card
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, value, label, trend, trendUp, fill, iconBg, iconColor, barWidth, href }) {
  const content = (
    <>
      <div className="stat-card-top">
        <div className="stat-icon" style={{ background: iconBg }}>
          <Icon style={{ color: iconColor }} />
        </div>
        <div className={`stat-trend ${trendUp ? "up" : "warn"}`}>
          <TrendingUp />
          {trend}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-mini-bar">
        <div className="stat-mini-fill" style={{ width: `${barWidth}%`, background: fill }} />
      </div>
    </>
  );

  return href ? (
    <Link className="stat-card" style={{ textDecoration: "none" }} to={href}>{content}</Link>
  ) : (
    <article className="stat-card">{content}</article>
  );
}

function AnnouncementsPanel({ announcements }) {
  const unreadCount = announcements.filter((item) => !item.isRead && !item.is_read).length;
  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-header">
        <div className="panel-title-row">
          <div className="panel-icon" style={{ background: "rgba(14,165,233,.1)" }}>
            <Megaphone style={{ color: "#0EA5E9" }} />
          </div>
          <span className="panel-title">Announcements</span>
          {unreadCount > 0 ? <span className="chip priority-important">{unreadCount} unread</span> : null}
        </div>
        <Link to="/volunteer/announcements" className="panel-view-all">
          View all <ChevronRight />
        </Link>
      </div>
      <div className="panel-body">
        {announcements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Megaphone /></div>
            <div className="empty-title">All caught up</div>
            <div className="empty-sub">No new announcements. Updates will appear here.</div>
          </div>
        ) : announcements.slice(0, 4).map(a => {
          const isRead = a.isRead || a.is_read;
          return (
          <div key={a.id} className={`ann-card ${isRead ? "read" : "unread"}`}>
            {!isRead ? <span className="ann-unread-dot" /> : null}
            <div className="ann-chips">
              <span className={`chip priority-${(a.priority || "update").toLowerCase()}`}>
                {a.priority || "update"}
              </span>
              <span className="chip type">
                {a.announcementType || a.announcement_type || "general"}
              </span>
            </div>
            <div className="ann-title">{a.title}</div>
            <div className="ann-body">{a.message}</div>
            <div className="ann-footer">
              <span className="ann-time">{a.createdAt || a.created_at ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(a.createdAt || a.created_at)) : "Just now"}</span>
              <Link to="/volunteer/announcements" className="ann-action">Read more <ExternalLink /></Link>
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}

function QuickActionsPanel() {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title-row">
          <div className="panel-icon" style={{ background: "rgba(20,184,166,.1)" }}>
            <Zap style={{ color: "#14B8A6" }} />
          </div>
          <span className="panel-title">Quick Actions</span>
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <div className="actions-grid">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <Link key={action.id} to={action.href} className="action-card">
                <div className="action-icon" style={{ background: action.bg }}>
                  <Icon style={{ color: action.color }} />
                </div>
                <div>
                  <div className="action-label">{action.label}</div>
                  <div className="action-sub">{action.sub}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EventsForYouPanel({ events, onRegister, busyId }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title-row">
          <div className="panel-icon" style={{ background: "rgba(6,182,212,.1)" }}>
            <CalendarDays style={{ color: "#06B6D4" }} />
          </div>
          <span className="panel-title">Upcoming Events</span>
        </div>
        <Link to="/volunteer/events" className="panel-view-all">View all <ChevronRight /></Link>
      </div>
      <div className="panel-body">
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><CalendarDays /></div>
            <div className="empty-title">No upcoming events</div>
            <div className="empty-sub">Published events will appear here.</div>
          </div>
        ) : events.slice(0, 3).map((event) => (
          <div key={event.id} className="ann-card">
            <div className="ann-chips">
              <span className="chip type">{event.eventType || event.event_type || "event"}</span>
              <span className="chip priority-info">{event.status || "published"}</span>
            </div>
            <div className="ann-title">{event.title}</div>
            <div className="ann-body">
              {event.startDatetime || event.start_datetime || event.eventDate ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(event.startDatetime || event.start_datetime || event.eventDate)) : "Date pending"}
              {" · "}
              {event.location || "Location pending"}
            </div>
            <div className="ann-footer">
              <span className="ann-time">{event.capacity ? `${event.seatsAvailable ?? event.seats_available ?? event.capacity} seats left` : "Open seats"}</span>
              <button className="ann-action" disabled={busyId === event.id} onClick={() => onRegister(event.id)} style={{ background: "none", border: 0, cursor: "pointer" }} type="button">
                {busyId === event.id ? "Registering..." : "Register"} <ExternalLink />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactPanel({ certs, events }) {
  const rows = [
    { key: "Volunteer Hours",   value: "24h",     dot: "#0EA5E9" },
    { key: "Certificates",      value: certs,     dot: "#14B8A6" },
    { key: "Camps Attended",    value: events,    dot: "#A855F7" },
    { key: "Patients Reached",  value: "300+",    dot: "#F59E0B" },
  ];
  return (
    <div className="impact-panel">
      <div className="impact-title">
        <Activity />
        Impact Summary
      </div>
      {rows.map(r => (
        <div key={r.key} className="impact-row">
          <div className="impact-row-left">
            <div className="impact-dot" style={{ background: r.dot }} />
            <span className="impact-key">{r.key}</span>
          </div>
          <span className="impact-val">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function AchievementsPanel() {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title-row">
          <div className="panel-icon" style={{ background: "rgba(234,179,8,.12)" }}>
            <Star style={{ color: "#CA8A04" }} />
          </div>
          <span className="panel-title">Achievements</span>
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <div className="achievements-grid">
          {BADGES.map(b => {
            const Icon = b.icon;
            return (
              <div key={b.id} className={`badge-card${b.earned ? "" : " badge-locked"}`}>
                <div className="badge-icon" style={{ background: b.bg }}>
                  <Icon style={{ color: b.color }} />
                </div>
                <div className="badge-name">{b.name}</div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 11.5, color: "#94A3B8", textAlign: "center", marginTop: 14 }}>
          2 of 6 badges earned
        </p>
      </div>
    </div>
  );
}

/* ─── Page: Dashboard ────────────────────────────────────────── */
function DashboardPage({ user }) {
  const [certificates, setCertificates] = useState([]);
  const [events, setEvents]             = useState([]);
  const [myCamps, setMyCamps]           = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [registeringId, setRegisteringId] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getCertificates(), getMyEvents(), getMyCamps(), getEvents({ type: "camp", status: "all", direction: "asc" }), getAnnouncements()])
      .then(([c, e, camps, allEvents, a]) => {
        if (alive) {
          const registeredIds = new Set(e.map((item) => Number(item.id || item.eventId)));
          setCertificates(c);
          setEvents(e);
          setMyCamps(camps);
          setAvailableEvents(allEvents.filter((event) => (event.eventType || event.event_type) === "camp" && !registeredIds.has(Number(event.id)) && (!(event.startDatetime || event.start_datetime || event.eventDate) || new Date(event.startDatetime || event.start_datetime || event.eventDate).getTime() >= Date.now())));
          setAnnouncements(a);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const profileCompletion = calcCompletion(user);
  const displayName       = user?.full_name || user?.fullName || "Member";
  const role              = (user?.role || "volunteer").toLowerCase();
  const membershipStatus  = user?.membership_status || user?.membershipStatus || "verified";

  const participatedEvents = events.filter(e =>
    ["participated","completed"].includes(e.participationStatus || e.attendanceStatus || e.status)
  ).length;

  const pendingCerts = certificates.filter(c =>
    !["claimed","downloaded"].includes(c.status)
  ).length;
  const upcomingCamps = myCamps.filter(c => {
    const date = c.startDatetime || c.start_datetime || c.date;
    return ["approved", "registered"].includes(c.participationStatus || c.participation_status || c.status) && (!date || new Date(date).getTime() >= Date.now());
  }).length;

  async function handleRegisterEvent(id) {
    try {
      setRegisteringId(id);
      await registerEvent(id);
      const [nextEvents, nextMine, nextCamps] = await Promise.all([getEvents({ type: "camp", status: "all", direction: "asc" }), getMyEvents(), getMyCamps()]);
      const registeredIds = new Set(nextMine.map((item) => Number(item.id || item.eventId)));
      setEvents(nextMine);
      setMyCamps(nextCamps);
      setAvailableEvents(nextEvents.filter((event) => (event.eventType || event.event_type) === "camp" && !registeredIds.has(Number(event.id)) && (!(event.startDatetime || event.start_datetime || event.eventDate) || new Date(event.startDatetime || event.start_datetime || event.eventDate).getTime() >= Date.now())));
    } catch {
      // Keep the dashboard quiet; the full Events page shows detailed registration errors.
    } finally {
      setRegisteringId(null);
    }
  }

  const STATS = [
    { icon: Star,         value: certificates.length + participatedEvents, label: "Achievements", trend: "Live total", trendUp: true, fill: "linear-gradient(90deg,#0EA5E9,#06B6D4)", iconBg: "#EFF6FF", iconColor: "#3B82F6", barWidth: 72 },
    { icon: Award,        value: certificates.length, label: "Certificates",  trend: `${pendingCerts} pending`, trendUp: true, fill: "linear-gradient(90deg,#14B8A6,#10B981)", iconBg: "#F0FDF4", iconColor: "#16A34A", barWidth: 55 },
    { icon: CalendarDays, value: participatedEvents, label: "Camps Attended", trend: "Register now",  trendUp: false, fill: "linear-gradient(90deg,#A855F7,#7C3AED)", iconBg: "#FDF4FF", iconColor: "#9333EA", barWidth: 30 },
    { icon: Heart,        value: upcomingCamps,      label: "Upcoming Camps", trend: "Open my camps", trendUp: true,  fill: "linear-gradient(90deg,#F59E0B,#EF4444)", iconBg: "#FFF7ED", iconColor: "#EA580C", barWidth: Math.min(upcomingCamps * 20, 100), href: "/volunteer/my-camps" },
  ];

  return (
    <>
      <Hero
        displayName={displayName}
        role={role}
        membershipStatus={membershipStatus}
        profileCompletion={profileCompletion}
      />

      {/* Stats */}
      <div className="stats-grid">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Middle section */}
      <div className="bottom-grid">
        {/* Left: Announcements + Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <AnnouncementsPanel announcements={announcements} />
          <EventsForYouPanel busyId={registeringId} events={availableEvents} onRegister={handleRegisterEvent} />
          <QuickActionsPanel />
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ImpactPanel certs={certificates.length} events={participatedEvents} />
          <AchievementsPanel />
        </div>
      </div>
    </>
  );
}

/* ─── Page: Under review ──────────────────────────────────────── */
function UnderReviewPage({ onLogout, user }) {
  return (
    <div className="review-wrap">
      <div className="review-card">
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(14,165,233,.1)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <Clock style={{ width: 28, height: 28, color: "#0EA5E9" }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#0EA5E9", background: "rgba(14,165,233,.08)", padding: "5px 16px", borderRadius: 9999, border: "1px solid rgba(14,165,233,.2)" }}>
          Maai Membership
        </span>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 20, letterSpacing: "-.02em", color: "#041C32" }}>Account Under Review</h2>
        <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, maxWidth: 440, margin: "12px auto 0" }}>
          Your account is being verified by the Maai team. Once approved you'll unlock full access to certificates, camps and all member features.
        </p>
        <div className="review-badge-row">
          {[
            ["Status", user?.membership_status || user?.membershipStatus || "under_review"],
            ["Payment", user?.payment_status || user?.paymentStatus || "free"],
            ["Transaction", user?.transaction_id || user?.transactionId || "FREE"],
          ].map(([l, v]) => (
            <div key={l} className="review-meta-chip">
              <div className="review-meta-label">{l}</div>
              <div className="review-meta-value">{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 28, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onLogout} style={{ background: "#041C32", color: "#fff", border: "none", borderRadius: 9999, padding: "11px 28px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>
            Logout
          </button>
          <a href="mailto:maai.organisation@gmail.com" style={{ background: "#fff", border: "1px solid rgba(4,28,50,.15)", borderRadius: 9999, padding: "11px 28px", fontWeight: 700, fontSize: 13.5, color: "#041C32", textDecoration: "none" }}>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Route renderer (preserved from original) ──────────────── */
// Import these at the top of your actual file alongside the other imports:
// import ProfilePage, IdCardPage, etc. from their respective files.
// This file only fully implements DashboardPage.
// The other pages are rendered as-is by the switch below.
function renderPage(page, user, isLimitedMember, handleLogout) {
  if (isLimitedMember) return <UnderReviewPage onLogout={handleLogout} user={user} />;
  if (page === "profile")        return <ProfilePage user={user} />;
  if (page === "id-card")        return <IdCardPage />;
  if (page === "certificates")   return <CertificatesPage />;
  if (page === "events")         return <EventsPage />;
  if (page === "my-camps")       return <MyCampsPage />;
  if (page === "my-camp-detail") return <MyCampDetailPage />;
  if (page === "careers")        return <Careers />;
  if (page === "request-camp")   return <RequestCampPage />;
  if (page === "announcements")  return <AnnouncementsPage />;
  if (page === "god-mode")       return <GodModePage />;
  return <DashboardPage user={user} />;
}

/* ─── Root export ────────────────────────────────────────────── */
export default function Dashboard({ page = "dashboard" }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName  = user?.full_name || user?.fullName || "Member";
  const role         = user?.role || "volunteer";
  const isSuperadmin = role === "superadmin";
  const isItStaff    = role === "it_staff";
  const isLimitedMember =
    role === "volunteer" &&
    (user?.membership_status || user?.membershipStatus) !== "verified";

  const navItems = isSuperadmin
    ? [...NAV_ITEMS, { label: "God Mode", path: "/volunteer/god-mode", icon: Crown, group: "special" }]
    : isItStaff
    ? [...NAV_ITEMS, { label: "Staff Panel", path: "/staff", icon: Crown, group: "special" }]
    : isLimitedMember
    ? NAV_ITEMS.filter(i => i.path === "/volunteer/dashboard")
    : NAV_ITEMS;

  function handleLogout() {
    logout();
    navigate("/auth?mode=login");
  }

  return (
    <>
      <StyleInjector />
      <div className="maai-root">

        {/* Mobile hamburger */}
        {!sidebarOpen && (
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu style={{ width: 20, height: 20 }} />
          </button>
        )}

        <Sidebar
          items={navItems}
          displayName={displayName}
          role={role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="main-content">
          <Topbar
            displayName={displayName}
            role={role}
            isSuperadmin={isSuperadmin}
            isItStaff={isItStaff}
            navItems={navItems}
            onLogout={handleLogout}
          />
          <div className="page-body">
            {/*
              Replace the JSX below with your actual page imports:

              {renderPage(page, user, isLimitedMember, handleLogout,
                ProfilePage, IdCardPage, CertificatesPage, MyCampsPage,
                MyCampDetailPage, CareerPage, RequestCampPage)}
            */}
            {renderPage(page, user, isLimitedMember, handleLogout)}
          </div>
        </div>

      </div>
    </>
  );
}

/*
 * ─── HOW TO INTEGRATE ────────────────────────────────────────────
 *
 * 1. Replace your src/pages/Dashboard.jsx with this file.
 *
 * 2. Keep all your existing imports at the top:
 *    import { useAuth } from "../hooks/useAuth";
 *    import { getCertificates, getMyEvents, getAnnouncements } from "../services/api";
 *    import NotificationBell from "../components/notifications/NotificationBell";
 *    + all page components (ProfilePage, IdCardPage, etc.)
 *
 * 3. Delete DashboardLayout.jsx — layout is now self-contained here.
 *
 * 4. Delete the old Sidebar.jsx, Topbar.jsx, DashboardHero.jsx,
 *    StatsGrid.jsx, QuickActions.jsx, AnnouncementsPanel.jsx —
 *    all rebuilt here as inline components.
 *
 * 5. Add Google Fonts to your index.html <head>:
 *    <link rel="preconnect" href="https://fonts.googleapis.com">
 *    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *    (the @import in StyleInjector handles the rest at runtime)
 *
 * 6. Optional: install framer-motion for enhanced animations:
 *    npm install framer-motion
 *    Then wrap stat cards and panels in <motion.div> with variants.
 *
 * ─────────────────────────────────────────────────────────────────
 */
