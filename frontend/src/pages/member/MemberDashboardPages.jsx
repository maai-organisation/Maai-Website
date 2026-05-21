/**
 * Maai Organisation — Member Dashboard Pages (Redesigned)
 *
 * All logic, hooks, APIs, state, forms are preserved exactly.
 * Only the visual layer is replaced to match Dashboard.jsx design language.
 *
 * Design tokens reused from Dashboard.jsx:
 *   --maai-navy, --maai-ocean, --maai-sky, --maai-cyan, --maai-teal
 *   --shadow-card, --shadow-lift, --radius-card, --transition
 */

import {
  Award,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  User,
  Users,
  Phone,
  MapPin,
  GraduationCap,
  Zap,
  Heart,
  Download,
  Eye,
  CheckCheck,
  Search,
  ChevronRight,
  Bell,
  AlertCircle,
  Shield,
  IdCard,
  ClipboardList,
  Send,
  FileCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  claimCertificate,
  getAnnouncements,
  getCertificateDownloadUrl,
  getCertificatePreviewUrl,
  getCertificates,
  getIdCardDownloadUrl,
  getIdCardPreviewUrl,
  getEvents,
  getMyCamp,
  getMyCamps,
  getMyEvents,
  getMyIdCard,
  markAnnouncementRead,
  registerEvent,
  requestVolunteerCamp,
} from "../../services/api";

/* ─── Page CSS injected once ─────────────────────────────────── */
const PAGE_CSS = `
  /* Reuse Dashboard tokens */
  .mp-shell { display: flex; flex-direction: column; gap: 24px; width: 100%; }

  /* Section header */
  .mp-section-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .mp-section-title {
    font-size: 18px; font-weight: 800; color: var(--maai-navy, #041C32);
    letter-spacing: -.01em; display: flex; align-items: center; gap: 9px;
  }
  .mp-section-title-icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: grid; place-items: center;
  }
  .mp-section-title-icon svg { width: 16px; height: 16px; }

  /* ── Profile Hero ── */
  .mp-profile-hero {
    border-radius: 24px; overflow: hidden; position: relative;
    background: linear-gradient(135deg, #041C32 0%, #064663 55%, #0a3d5a 100%);
    padding: 36px 40px;
  }
  .mp-profile-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(6,182,212,.18) 0%, transparent 70%),
                radial-gradient(ellipse 40% 60% at 20% 80%, rgba(14,165,233,.12) 0%, transparent 60%);
    pointer-events: none;
  }
  .mp-profile-hero-dot {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px);
    background-size: 24px 24px; pointer-events: none;
  }
  .mp-profile-hero-inner {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 28px; flex-wrap: wrap;
  }
  .mp-avatar-lg {
    width: 84px; height: 84px; border-radius: 22px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(14,165,233,.35), rgba(6,182,212,.25));
    border: 2px solid rgba(255,255,255,.18); backdrop-filter: blur(8px);
    display: grid; place-items: center;
    font-size: 32px; font-weight: 900; color: #fff;
    box-shadow: 0 8px 32px rgba(0,0,0,.25);
  }
  .mp-profile-info { flex: 1; }
  .mp-profile-name {
    font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -.02em; line-height: 1.15;
  }
  .mp-profile-email { font-size: 14px; color: rgba(255,255,255,.55); margin-top: 4px; }
  .mp-profile-chips { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
  .mp-stat-chip {
    background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.14);
    border-radius: 9999px; padding: 6px 16px;
    display: flex; flex-direction: column; align-items: center; min-width: 80px;
  }
  .mp-stat-chip-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.45); }
  .mp-stat-chip-value { font-size: 13px; font-weight: 700; color: #fff; margin-top: 2px; text-transform: capitalize; }
  .mp-stat-chip-value.verified { color: #4ADE80; }
  .mp-stat-chip-value.pending  { color: #FBBF24; }

  /* ── Info card (used in Profile, IdCard) ── */
  .mp-card {
    background: #fff; border-radius: 20px;
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: 0 2px 16px rgba(4,28,50,.07), 0 1px 4px rgba(4,28,50,.05);
    padding: 24px;
  }
  .mp-card-head {
    display: flex; align-items: center; gap: 10px;
    padding-bottom: 16px; margin-bottom: 16px;
    border-bottom: 1px solid rgba(4,28,50,.06);
  }
  .mp-card-head-icon {
    width: 34px; height: 34px; border-radius: 9px;
    display: grid; place-items: center;
  }
  .mp-card-head-icon svg { width: 16px; height: 16px; }
  .mp-card-title { font-size: 14px; font-weight: 700; color: var(--maai-navy, #041C32); }

  /* Info field */
  .mp-field { display: flex; flex-direction: column; gap: 3px; padding: 12px 0; border-bottom: 1px solid rgba(4,28,50,.05); }
  .mp-field:last-child { border-bottom: none; padding-bottom: 0; }
  .mp-field-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #94A3B8; }
  .mp-field-value { font-size: 14px; font-weight: 600; color: var(--maai-navy, #041C32); }

  /* Chips row */
  .mp-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
  .mp-chip {
    padding: 5px 14px; border-radius: 9999px;
    font-size: 12px; font-weight: 700;
  }
  .mp-chip-cyan { background: rgba(6,182,212,.1); color: #0891B2; border: 1px solid rgba(6,182,212,.2); }
  .mp-chip-slate { background: rgba(100,116,139,.08); color: #475569; border: 1px solid rgba(100,116,139,.15); }
  .mp-chip-green { background: #ECFDF5; color: #059669; border: 1px solid rgba(5,150,105,.2); }
  .mp-chip-amber { background: #FFF7ED; color: #D97706; border: 1px solid rgba(217,119,6,.2); }
  .mp-chip-red   { background: #FEF2F2; color: #DC2626; border: 1px solid rgba(220,38,38,.2); }
  .mp-chip-blue  { background: #EFF6FF; color: #3B82F6; border: 1px solid rgba(59,130,246,.2); }

  /* ── Two column grid ── */
  .mp-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 900px) { .mp-2col { grid-template-columns: 1fr; } }

  /* ── Certificate cards ── */
  .mp-cert-card {
    background: #fff; border-radius: 20px;
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: 0 2px 16px rgba(4,28,50,.07), 0 1px 4px rgba(4,28,50,.05);
    padding: 20px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    transition: all .2s cubic-bezier(.4,0,.2,1);
    flex-wrap: wrap;
  }
  .mp-cert-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(4,28,50,.13), 0 2px 8px rgba(4,28,50,.07); }
  .mp-cert-left { display: flex; align-items: center; gap: 16px; }
  .mp-cert-icon {
    width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
    display: grid; place-items: center;
    background: linear-gradient(135deg, rgba(6,182,212,.12), rgba(20,184,166,.08));
    border: 1px solid rgba(6,182,212,.2);
  }
  .mp-cert-icon svg { width: 22px; height: 22px; color: #0891B2; }
  .mp-cert-title { font-size: 15px; font-weight: 700; color: var(--maai-navy, #041C32); }
  .mp-cert-sub   { font-size: 12px; color: #94A3B8; margin-top: 3px; }
  .mp-cert-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  /* Action buttons */
  .mp-btn-primary {
    background: linear-gradient(135deg, #0EA5E9, #14B8A6);
    color: #fff; font-size: 12.5px; font-weight: 700;
    padding: 8px 18px; border-radius: 9999px; border: none;
    cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
    transition: all .2s cubic-bezier(.4,0,.2,1);
    white-space: nowrap;
  }
  .mp-btn-primary:hover { opacity: .88; transform: translateY(-1px); }
  .mp-btn-primary svg { width: 13px; height: 13px; }

  .mp-btn-ghost {
    background: #fff; color: var(--maai-navy, #041C32);
    font-size: 12.5px; font-weight: 700;
    padding: 8px 18px; border-radius: 9999px;
    border: 1px solid rgba(4,28,50,.12);
    cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
    transition: all .2s cubic-bezier(.4,0,.2,1);
    white-space: nowrap;
  }
  .mp-btn-ghost:hover { border-color: #0EA5E9; color: #0EA5E9; }
  .mp-btn-ghost svg { width: 13px; height: 13px; }

  /* ── Search + filter bar ── */
  .mp-filter-bar {
    background: #fff; border-radius: 16px;
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: 0 2px 8px rgba(4,28,50,.05);
    padding: 14px 18px;
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  }
  .mp-search-wrap {
    flex: 1; min-width: 180px;
    display: flex; align-items: center; gap: 10px;
    background: #F8FAFC; border: 1px solid rgba(4,28,50,.09);
    border-radius: 10px; padding: 0 14px; height: 38px;
  }
  .mp-search-wrap svg { width: 15px; height: 15px; color: #94A3B8; flex-shrink: 0; }
  .mp-search-wrap input {
    border: none; outline: none; background: transparent;
    font-size: 13px; color: var(--maai-navy, #041C32); font-family: inherit; width: 100%;
  }
  .mp-search-wrap input::placeholder { color: #CBD5E1; }
  .mp-select {
    height: 38px; padding: 0 14px; border-radius: 10px;
    border: 1px solid rgba(4,28,50,.09); background: #F8FAFC;
    font-size: 13px; font-weight: 600; color: var(--maai-navy, #041C32);
    font-family: inherit; outline: none; cursor: pointer;
  }
  .mp-select:focus { border-color: #0EA5E9; }

  /* ── Tab bar ── */
  .mp-tabs { display: flex; gap: 4px; background: #F1F5F9; border-radius: 12px; padding: 4px; width: fit-content; }
  .mp-tab {
    padding: 7px 18px; border-radius: 9px; font-size: 13px; font-weight: 700;
    border: none; background: transparent; cursor: pointer;
    color: #64748B; transition: all .18s ease;
  }
  .mp-tab.active { background: #fff; color: var(--maai-navy, #041C32); box-shadow: 0 1px 4px rgba(4,28,50,.1); }

  /* ── Camp card ── */
  .mp-camp-card {
    background: #fff; border-radius: 20px;
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: 0 2px 16px rgba(4,28,50,.07), 0 1px 4px rgba(4,28,50,.05);
    overflow: hidden; text-decoration: none; display: block; cursor: pointer;
    transition: all .2s cubic-bezier(.4,0,.2,1);
  }
  .mp-camp-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(4,28,50,.13), 0 2px 8px rgba(4,28,50,.07); }
  .mp-camp-card:focus-visible { outline: 3px solid rgba(6,182,212,.35); outline-offset: 3px; }
  .mp-camp-img {
    height: 144px; background: linear-gradient(135deg, #E0F7FA, #fff, #FCE7F3);
    display: grid; place-items: center; overflow: hidden;
    font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; color: #0891B2;
  }
  .mp-camp-img img { width: 100%; height: 100%; object-fit: cover; }
  .mp-camp-body { padding: 18px 20px; }
  .mp-camp-chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 10px; }
  .mp-camp-title { font-size: 16px; font-weight: 800; color: var(--maai-navy, #041C32); margin-bottom: 8px; }
  .mp-camp-meta { display: flex; flex-direction: column; gap: 4px; }
  .mp-camp-meta-row { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #64748B; font-weight: 500; }
  .mp-camp-meta-row svg { width: 13px; height: 13px; color: #94A3B8; flex-shrink: 0; }
  .mp-cert-status-bar {
    margin-top: 12px; padding: 10px 14px; border-radius: 10px; background: #F8FAFC;
    border: 1px solid rgba(4,28,50,.06);
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; font-weight: 700; color: #64748B;
  }
  .mp-cert-status-bar span { color: #0891B2; text-transform: capitalize; }

  /* ── Mini stat cards (Camps page) ── */
  .mp-mini-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  @media (max-width: 700px) { .mp-mini-stats { grid-template-columns: 1fr; } }
  .mp-mini-stat {
    background: #fff; border-radius: 16px;
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: 0 2px 8px rgba(4,28,50,.05);
    padding: 18px 20px; display: flex; align-items: center; gap: 14px;
  }
  .mp-mini-stat-icon {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    display: grid; place-items: center;
  }
  .mp-mini-stat-icon svg { width: 20px; height: 20px; }
  .mp-mini-stat-value { font-size: 28px; font-weight: 800; color: var(--maai-navy, #041C32); line-height: 1; letter-spacing: -.02em; }
  .mp-mini-stat-label { font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: .07em; margin-top: 3px; }

  /* ── Camp grid ── */
  .mp-camp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  @media (max-width: 1100px) { .mp-camp-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px)  { .mp-camp-grid { grid-template-columns: 1fr; } }

  /* ── Announcement card ── */
  .mp-ann-card {
    background: #fff; border-radius: 20px;
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: 0 2px 16px rgba(4,28,50,.07), 0 1px 4px rgba(4,28,50,.05);
    padding: 20px 24px;
    transition: all .2s cubic-bezier(.4,0,.2,1);
    display: flex; gap: 16px; align-items: flex-start;
    position: relative; cursor: pointer;
  }
  .mp-ann-card:hover { border-color: rgba(14,165,233,.25); background: rgba(224,247,250,.15); }
  .mp-ann-card.unread { border-color: rgba(6,182,212,.38); box-shadow: 0 8px 28px rgba(6,182,212,.12); }
  .mp-ann-card.read { opacity: .82; }
  .mp-ann-icon {
    width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
    display: grid; place-items: center;
  }
  .mp-ann-icon svg { width: 18px; height: 18px; }
  .mp-ann-body { flex: 1; }
  .mp-ann-chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 8px; }
  .mp-ann-title { font-size: 15px; font-weight: 700; color: var(--maai-navy, #041C32); margin-bottom: 6px; }
  .mp-ann-msg   { font-size: 13px; color: #64748B; line-height: 1.6; }
  .mp-ann-msg.collapsed { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .mp-ann-footer { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
  .mp-ann-time  { font-size: 11.5px; color: #94A3B8; font-weight: 500; }
  .mp-ann-read-dot { position: absolute; right: 18px; top: 18px; width: 9px; height: 9px; border-radius: 9999px; background: #EF4444; box-shadow: 0 0 0 4px #FEF2F2; }

  /* ── Empty state ── */
  .mp-empty {
    background: #fff; border-radius: 20px;
    border: 1.5px dashed rgba(4,28,50,.12);
    padding: 40px 20px; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .mp-empty-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: #F0FAFB; display: grid; place-items: center;
  }
  .mp-empty-icon svg { width: 22px; height: 22px; color: #06B6D4; }
  .mp-empty-title { font-size: 14px; font-weight: 700; color: var(--maai-navy, #041C32); }
  .mp-empty-sub   { font-size: 12.5px; color: #94A3B8; line-height: 1.5; max-width: 240px; }

  /* ── Loading state ── */
  .mp-loading {
    background: #fff; border-radius: 16px;
    border: 1px solid rgba(4,28,50,.07);
    padding: 24px; font-size: 13px; font-weight: 600; color: #94A3B8;
    display: flex; align-items: center; gap: 10px;
  }
  .mp-loading-dot {
    width: 8px; height: 8px; border-radius: 9999px;
    background: #06B6D4; animation: mp-pulse 1.2s ease-in-out infinite;
  }
  @keyframes mp-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  /* ── Request Camp form ── */
  .mp-form-card {
    background: #fff; border-radius: 20px;
    border: 1px solid rgba(4,28,50,.07);
    box-shadow: 0 2px 16px rgba(4,28,50,.07), 0 1px 4px rgba(4,28,50,.05);
    padding: 28px;
  }
  .mp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  @media (max-width: 700px) { .mp-form-grid { grid-template-columns: 1fr; } }
  .mp-form-field { display: flex; flex-direction: column; gap: 7px; }
  .mp-form-full  { grid-column: 1 / -1; }
  .mp-label {
    font-size: 10.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
    color: #64748B;
  }
  .mp-input {
    height: 44px; border-radius: 12px;
    border: 1.5px solid rgba(4,28,50,.1); background: #FAFBFC;
    padding: 0 14px; font-size: 13.5px; font-family: inherit;
    font-weight: 500; color: var(--maai-navy, #041C32); outline: none;
    transition: all .18s ease;
  }
  .mp-input:focus { border-color: #0EA5E9; background: #fff; box-shadow: 0 0 0 4px rgba(14,165,233,.08); }
  .mp-input.error { border-color: #EF4444; background: #FFF8F8; }
  .mp-textarea {
    border-radius: 12px;
    border: 1.5px solid rgba(4,28,50,.1); background: #FAFBFC;
    padding: 12px 14px; font-size: 13.5px; font-family: inherit;
    font-weight: 500; color: var(--maai-navy, #041C32); outline: none;
    resize: vertical; min-height: 120px;
    transition: all .18s ease;
  }
  .mp-textarea:focus { border-color: #0EA5E9; background: #fff; box-shadow: 0 0 0 4px rgba(14,165,233,.08); }
  .mp-err { font-size: 12px; color: #EF4444; font-weight: 600; }
  .mp-success-banner {
    background: #ECFDF5; border: 1px solid rgba(5,150,105,.2);
    border-radius: 12px; padding: 12px 18px;
    font-size: 13px; font-weight: 700; color: #059669;
    display: flex; align-items: center; gap: 8px;
  }
  .mp-success-banner svg { width: 15px; height: 15px; }
  .mp-error-banner {
    background: #FEF2F2; border: 1px solid rgba(220,38,38,.2);
    border-radius: 12px; padding: 12px 18px;
    font-size: 13px; font-weight: 700; color: #DC2626;
    display: flex; align-items: center; gap: 8px;
  }
  .mp-error-banner svg { width: 15px; height: 15px; }

  /* ── ID Card ── */
  .mp-idcard {
    border-radius: 24px; overflow: hidden;
    background: var(--maai-navy, #041C32);
    position: relative; aspect-ratio: 1.62/1;
    padding: 26px; color: #fff;
    box-shadow: 0 8px 40px rgba(4,28,50,.25), 0 2px 8px rgba(4,28,50,.15);
  }
  .mp-idcard-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 90% at 80% 20%, rgba(6,182,212,.22) 0%, transparent 60%),
                radial-gradient(ellipse 50% 60% at 10% 90%, rgba(14,165,233,.15) 0%, transparent 55%);
    pointer-events: none;
  }
  .mp-idcard-dot {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px);
    background-size: 20px 20px; pointer-events: none;
  }
  .mp-idcard-inner { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
  .mp-idcard-header { display: flex; align-items: flex-start; justify-content: space-between; }
  .mp-idcard-org { font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #67E8F9; margin-bottom: 6px; }
  .mp-idcard-name { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -.01em; }
  .mp-idcard-logo { width: 46px; height: 46px; border-radius: 50%; background: rgba(255,255,255,.12); border: 1.5px solid rgba(255,255,255,.25); object-fit: cover; display: grid; place-items: center; }
  .mp-idcard-logo-placeholder { display: grid; place-items: center; }
  .mp-idcard-logo-placeholder svg { width: 22px; height: 22px; color: rgba(255,255,255,.5); }
  .mp-idcard-footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
  .mp-idcard-photo {
    width: 64px; height: 72px; border-radius: 10px;
    background: rgba(255,255,255,.1); border: 1.5px solid rgba(255,255,255,.2);
    display: grid; place-items: center; flex-shrink: 0;
    font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.4);
  }
  .mp-idcard-qr {
    width: 72px; height: 72px; border-radius: 10px;
    background: rgba(255,255,255,.1); border: 1.5px solid rgba(255,255,255,.2);
    display: grid; place-items: center; flex-shrink: 0;
    font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.4);
  }
  .mp-idcard-details { display: flex; flex-direction: column; gap: 4px; }
  .mp-idcard-row { font-size: 11.5px; color: rgba(255,255,255,.7); font-weight: 500; }
  .mp-idcard-row strong { color: #fff; font-weight: 700; }

  /* ── God Mode redirect placeholder ── */
  .mp-godmode-wrap { display: grid; place-items: center; min-height: 40vh; }
  .mp-godmode-card {
    background: linear-gradient(135deg, #041C32, #064663);
    border-radius: 24px; padding: 48px 40px; text-align: center;
    border: 1px solid rgba(14,165,233,.2);
    box-shadow: 0 8px 40px rgba(4,28,50,.3);
  }
  .mp-godmode-icon {
    width: 72px; height: 72px; border-radius: 20px;
    background: linear-gradient(135deg, #0EA5E9, #14B8A6);
    display: grid; place-items: center; margin: 0 auto 20px;
    box-shadow: 0 8px 24px rgba(14,165,233,.35);
  }
  .mp-godmode-icon svg { width: 30px; height: 30px; color: #fff; }
  .mp-godmode-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -.01em; margin-bottom: 8px; }
  .mp-godmode-sub   { font-size: 14px; color: rgba(255,255,255,.5); }

  /* Page-header with gradient accent line */
  .mp-page-header {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(4,28,50,.07);
    margin-bottom: 4px;
  }
  .mp-page-title { font-size: 22px; font-weight: 800; color: var(--maai-navy, #041C32); letter-spacing: -.01em; }
  .mp-page-subtitle { font-size: 13px; color: #94A3B8; margin-top: 3px; }

  /* Notification dot */
  .mp-unread-dot {
    width: 8px; height: 8px; border-radius: 9999px; background: #EF4444;
    position: absolute; top: 4px; right: 4px;
  }

  /* Divider with label */
  .mp-divider { display: flex; align-items: center; gap: 12px; margin: 4px 0; }
  .mp-divider-line { flex: 1; height: 1px; background: rgba(4,28,50,.07); }
  .mp-divider-label { font-size: 11px; font-weight: 700; color: #94A3B8; letter-spacing: .07em; text-transform: uppercase; white-space: nowrap; }
`;

/* ─── Inject CSS once ────────────────────────────────────────── */
let cssInjected = false;
function ensureCSS() {
  if (cssInjected) return;
  const tag = document.createElement("style");
  tag.textContent = PAGE_CSS;
  document.head.appendChild(tag);
  cssInjected = true;
}

/* ─── Shell ──────────────────────────────────────────────────── */
export function PageShell({ children }) {
  ensureCSS();
  return <div className="mp-shell">{children}</div>;
}

/* ─── Loading / Empty helpers ─────────────────────────────────── */
function Loading({ text = "Loading..." }) {
  return (
    <div className="mp-loading">
      <div className="mp-loading-dot" />
      {text}
    </div>
  );
}

function Empty({ icon: Icon = Megaphone, title, sub }) {
  return (
    <div className="mp-empty">
      <div className="mp-empty-icon"><Icon /></div>
      {title && <p className="mp-empty-title">{title}</p>}
      {sub   && <p className="mp-empty-sub">{sub}</p>}
    </div>
  );
}

/* ─── Status chip helpers ─────────────────────────────────────── */
function statusChipClass(status) {
  const s = (status || "").toLowerCase();
  if (["claimed","downloaded","completed","participated","verified","active"].some(k => s.includes(k))) return "mp-chip mp-chip-green";
  if (["eligible","upcoming","registered"].some(k => s.includes(k))) return "mp-chip mp-chip-cyan";
  if (["pending","under_review"].some(k => s.includes(k))) return "mp-chip mp-chip-amber";
  if (["revoked","cancelled","expired"].some(k => s.includes(k))) return "mp-chip mp-chip-red";
  return "mp-chip mp-chip-slate";
}

function priorityChipClass(priority) {
  const p = (priority || "").toLowerCase();
  if (p === "high" || p === "urgent") return "mp-chip mp-chip-red";
  if (p === "medium") return "mp-chip mp-chip-amber";
  if (p === "low") return "mp-chip mp-chip-slate";
  return "mp-chip mp-chip-cyan";
}

function annIcon(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("event") || t.includes("camp")) return { Icon: CalendarDays, bg: "#EFF6FF", color: "#3B82F6" };
  if (t.includes("alert") || t.includes("urgent")) return { Icon: AlertCircle, bg: "#FEF2F2", color: "#DC2626" };
  if (t.includes("achieve") || t.includes("award")) return { Icon: Award, bg: "#F0FDF4", color: "#16A34A" };
  return { Icon: Bell, bg: "rgba(6,182,212,.1)", color: "#0891B2" };
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE PAGE
═══════════════════════════════════════════════════════════════ */
export function ProfilePage({ user }) {
  const stats = [
    { label: "Membership", value: user?.membership_status || user?.membershipStatus || "Pending" },
    { label: "Role",        value: user?.role || "Volunteer" },
    { label: "Certificates",value: user?.certificatesCount || 0 },
  ];

  const skills =
    typeof user?.skills === "string" ? user.skills.split(",").map(s => s.trim()).filter(Boolean) : user?.skills || [];
  const interests =
    typeof user?.interests === "string" ? user.interests.split(",").map(s => s.trim()).filter(Boolean) : user?.interests || [];

  const initials = (user?.full_name || user?.fullName || "M")[0].toUpperCase();

  return (
    <PageShell>
      {/* Hero */}
      <div className="mp-profile-hero">
        <div className="mp-profile-hero-dot" />
        <div className="mp-profile-hero-inner">
          <div className="mp-avatar-lg">{initials}</div>
          <div className="mp-profile-info">
            <h1 className="mp-profile-name">{user?.full_name || user?.fullName || "Member"}</h1>
            <p className="mp-profile-email">{user?.email}</p>
            <div className="mp-profile-chips">
              {stats.map(s => (
                <div className="mp-stat-chip" key={s.label}>
                  <span className="mp-stat-chip-label">{s.label}</span>
                  <span className={`mp-stat-chip-value ${s.label === "Membership" ? (String(s.value).toLowerCase().includes("verif") ? "verified" : "pending") : ""}`}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column info cards */}
      <div className="mp-2col">

        {/* Personal Information */}
        <div className="mp-card">
          <div className="mp-card-head">
            <div className="mp-card-head-icon" style={{ background: "rgba(14,165,233,.1)" }}>
              <User style={{ color: "#0EA5E9" }} />
            </div>
            <span className="mp-card-title">Personal Information</span>
          </div>
          {[
            { label: "Phone", value: user?.phone, Icon: Phone },
            { label: "City",  value: user?.city,  Icon: MapPin },
          ].map(({ label, value }) => (
            <div className="mp-field" key={label}>
              <span className="mp-field-label">{label}</span>
              <span className="mp-field-value">{value || "Not provided"}</span>
            </div>
          ))}
        </div>

        {/* Academic Information */}
        <div className="mp-card">
          <div className="mp-card-head">
            <div className="mp-card-head-icon" style={{ background: "rgba(20,184,166,.1)" }}>
              <GraduationCap style={{ color: "#14B8A6" }} />
            </div>
            <span className="mp-card-title">Academic Information</span>
          </div>
          {[
            { label: "College", value: user?.college },
            { label: "Course",  value: user?.course  },
          ].map(({ label, value }) => (
            <div className="mp-field" key={label}>
              <span className="mp-field-label">{label}</span>
              <span className="mp-field-value">{value || "Not provided"}</span>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="mp-card">
          <div className="mp-card-head">
            <div className="mp-card-head-icon" style={{ background: "rgba(99,102,241,.1)" }}>
              <Zap style={{ color: "#6366F1" }} />
            </div>
            <span className="mp-card-title">Skills</span>
          </div>
          {skills.length === 0 ? (
            <p style={{ fontSize: 13, color: "#94A3B8" }}>No skills added yet.</p>
          ) : (
            <div className="mp-chips">
              {skills.map(skill => (
                <span className="mp-chip mp-chip-cyan" key={skill}>{skill.trim()}</span>
              ))}
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="mp-card">
          <div className="mp-card-head">
            <div className="mp-card-head-icon" style={{ background: "rgba(249,115,22,.1)" }}>
              <Heart style={{ color: "#F97316" }} />
            </div>
            <span className="mp-card-title">Interests</span>
          </div>
          {interests.length === 0 ? (
            <p style={{ fontSize: 13, color: "#94A3B8" }}>No interests added yet.</p>
          ) : (
            <div className="mp-chips">
              {interests.map(item => (
                <span className="mp-chip mp-chip-slate" key={item}>{item.trim()}</span>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CERTIFICATES PAGE
═══════════════════════════════════════════════════════════════ */
export function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [message, setMessage]           = useState("");
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadCertificates() {
    setCertificates(await getCertificates());
  }

  useEffect(() => {
    let ignore = false;
    getCertificates()
      .then(data => { if (!ignore) setCertificates(data); })
      .catch(()  => { if (!ignore) setMessage("Unable to load certificates."); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
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

  const membershipCerts = certificates.filter(c => c.certificateType === "membership");
  const eventCerts      = certificates.filter(c => c.certificateType !== "membership");

  function filterCerts(list) {
    return list.filter(c => {
      const matchSearch = !search ||
        (c.eventTitle || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.verificationCode || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || (c.status || "").toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    });
  }

  return (
    <PageShell>
      {/* Page header */}
      <div className="mp-page-header">
        <div>
          <h1 className="mp-page-title">Certificates</h1>
          <p className="mp-page-subtitle">Your achievement records and downloadable certificates</p>
        </div>
        <span className="mp-chip mp-chip-cyan">{certificates.length} Total</span>
      </div>

      {/* Filter bar */}
      <div className="mp-filter-bar">
        <div className="mp-search-wrap">
          <Search />
          <input
            placeholder="Search by title or verification code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="mp-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="eligible">Eligible</option>
          <option value="claimed">Claimed</option>
          <option value="downloaded">Downloaded</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {loading && <Loading text="Fetching your certificates…" />}
      {message && (
        <div className={message.toLowerCase().includes("success") ? "mp-success-banner" : "mp-error-banner"}>
          {message.toLowerCase().includes("success") ? <CheckCheck /> : <AlertCircle />}
          {message}
        </div>
      )}

      {/* Membership Certificate */}
      <section>
        <div className="mp-section-head">
          <div className="mp-section-title">
            <div className="mp-section-title-icon" style={{ background: "rgba(6,182,212,.1)" }}>
              <Award style={{ color: "#06B6D4" }} />
            </div>
            Membership Certificate
          </div>
        </div>
        {!loading && filterCerts(membershipCerts).length === 0 ? (
          <Empty
            icon={Award}
            title="No membership certificate yet"
            sub="Your membership certificate unlocks after verification."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filterCerts(membershipCerts).map(cert => (
              <CertCard key={cert.id} certificate={cert} onClaim={handleClaim} title="Membership Certificate" />
            ))}
          </div>
        )}
      </section>

      {/* Event Certificates */}
      <section>
        <div className="mp-section-head">
          <div className="mp-section-title">
            <div className="mp-section-title-icon" style={{ background: "rgba(20,184,166,.1)" }}>
              <FileCheck style={{ color: "#14B8A6" }} />
            </div>
            Event Certificates
          </div>
        </div>
        {!loading && filterCerts(eventCerts).length === 0 ? (
          <Empty
            icon={FileCheck}
            title="No event certificates yet"
            sub="Eligible certificates will appear after an admin issues them."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filterCerts(eventCerts).map(cert => (
              <CertCard key={cert.id} certificate={cert} onClaim={handleClaim} title={cert.eventTitle} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function CertCard({ certificate, onClaim, title }) {
  return (
    <div className="mp-cert-card">
      <div className="mp-cert-left">
        <div className="mp-cert-icon"><Award /></div>
        <div>
          <p className="mp-cert-title">{title || "Certificate"}</p>
          <p className="mp-cert-sub">Code: {certificate.verificationCode || "—"}</p>
          <div className="mp-chips" style={{ marginTop: 6 }}>
            <span className={statusChipClass(certificate.status)}>
              {certificate.status || "unknown"}
            </span>
          </div>
        </div>
      </div>
      <div className="mp-cert-right">
        {certificate.status === "eligible" ? (
          <button className="mp-btn-primary" onClick={() => onClaim(certificate.id)} type="button">
            <CheckCheck /> Claim
          </button>
        ) : (
          <>
            <a className="mp-btn-ghost" href={getCertificatePreviewUrl(certificate.id)} rel="noreferrer" target="_blank">
              <Eye /> Preview
            </a>
            <a className="mp-btn-primary" href={getCertificateDownloadUrl(certificate.id)} rel="noreferrer" target="_blank">
              <Download /> Download
            </a>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ID CARD PAGE
═══════════════════════════════════════════════════════════════ */
function IdCardSide({ card, side = "front" }) {
  const template   = card?.template || {};
  const background = side === "front" ? template.frontBackgroundUrl : template.backBackgroundUrl;

  return (
    <div
      className="mp-idcard"
      style={background ? {
        backgroundImage: `linear-gradient(rgba(4,28,50,0.72), rgba(4,28,50,0.72)), url(${background})`,
        backgroundSize: "cover", backgroundPosition: "center",
      } : undefined}
    >
      <div className="mp-idcard-bg" />
      <div className="mp-idcard-dot" />
      <div className="mp-idcard-inner">
        <div className="mp-idcard-header">
          <div>
            <p className="mp-idcard-org">{template.headerText || "Maai Membership Card"}</p>
            <p className="mp-idcard-name">{side === "front" ? card.fullName : "Organisation Details"}</p>
          </div>
          <div className="mp-idcard-logo">
            {template.logoUrl
              ? <img src={template.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              : <div className="mp-idcard-logo-placeholder"><Shield /></div>
            }
          </div>
        </div>

        {side === "front" ? (
          <div className="mp-idcard-footer">
            <div className="mp-idcard-photo">Photo</div>
            <div className="mp-idcard-details">
              <p className="mp-idcard-row">No: <strong>{card.membershipNumber}</strong></p>
              <p className="mp-idcard-row">Role: <strong style={{ textTransform: "capitalize" }}>{card.role}</strong></p>
              <p className="mp-idcard-row">Status: <strong style={{ color: "#4ADE80" }}>{card.membershipStatus}</strong></p>
              <p className="mp-idcard-row">Verify: <strong>{card.verificationCode}</strong></p>
            </div>
          </div>
        ) : (
          <div className="mp-idcard-footer">
            <div className="mp-idcard-qr">QR</div>
            <div className="mp-idcard-details">
              <p className="mp-idcard-row">Maai Organisation Volunteer ID Card.</p>
              <p className="mp-idcard-row">{template.footerText || "If found, please contact Maai Organisation."}</p>
              <p className="mp-idcard-row">Verify: <strong>{card.verificationCode}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function IdCardPage() {
  const [card, setCard]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    getMyIdCard()
      .then(data  => { if (!ignore) setCard(data); })
      .catch(error => { if (!ignore) setMessage(error?.response?.data?.message || "Unable to load ID card."); })
      .finally(()  => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  return (
    <PageShell>
      <div className="mp-page-header">
        <div>
          <h1 className="mp-page-title">My ID Card</h1>
          <p className="mp-page-subtitle">Your official Maai volunteer identification</p>
        </div>
      </div>

      {loading && <Loading text="Loading your ID card…" />}

      {!loading && !card && (
        <Empty
          icon={IdCard}
          title="ID card not yet issued"
          sub="Your ID card unlocks after membership verification by the Maai team."
        />
      )}

      {card && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="mp-2col">
            <IdCardSide card={card} />
            <IdCardSide card={card} side="back" />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="mp-btn-ghost" href={getIdCardPreviewUrl()} rel="noreferrer" target="_blank">
              <Eye /> Preview
            </a>
            <a className="mp-btn-primary" href={getIdCardDownloadUrl()} rel="noreferrer" target="_blank">
              <Download /> Download PDF
            </a>
          </div>
        </div>
      )}

      {message && <div className="mp-error-banner"><AlertCircle />{message}</div>}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HELPER: date format
═══════════════════════════════════════════════════════════════ */
function formatCampDate(value) {
  if (!value) return "Date pending";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}
function normalizeCampStatus(camp) {
  return camp.participationStatus || camp.participation_status || camp.status || "registered";
}

/* ═══════════════════════════════════════════════════════════════
   MY CAMPS PAGE
═══════════════════════════════════════════════════════════════ */
function CampCard({ camp }) {
  const certStatus = camp.certificateStatus || camp.certificate_status || "none";
  const status     = normalizeCampStatus(camp);
  const approved = ["approved", "registered", "participated", "completed"].includes(status);
  const navigate = useNavigate();
  const detailsPath = `/dashboard/my-camps/${camp.id}`;

  function openDetails() {
    navigate(detailsPath);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails();
    }
  }

  return (
    <div className="mp-camp-card" onClick={openDetails} onKeyDown={handleKeyDown} role="button" tabIndex={0}>
      <div className="mp-camp-img">
        {camp.bannerUrl || camp.banner_url
          ? <img alt="" src={camp.bannerUrl || camp.banner_url} />
          : "Maai Camp"
        }
      </div>
      <div className="mp-camp-body">
        <div className="mp-camp-chips">
          <span className="mp-chip mp-chip-cyan" style={{ fontSize: 10 }}>
            {camp.eventType || camp.event_type || "camp"}
          </span>
          <span className={statusChipClass(status)} style={{ fontSize: 10 }}>
            {status}
          </span>
        </div>
        <p className="mp-camp-title">{camp.campTitle || camp.title}</p>
        <div className="mp-camp-meta">
          <div className="mp-camp-meta-row">
            <CalendarDays />
            {formatCampDate(camp.startDatetime || camp.start_datetime || camp.date)}
          </div>
          <div className="mp-camp-meta-row">
            <MapPin />
            {camp.location || "Location pending"}
          </div>
        </div>
        <div className="mp-cert-status-bar">
          Certificate: <span>{certStatus === "none" ? "No certificate" : certStatus}</span>
        </div>
        {approved && camp.whatsappGroupLink ? (
          <a className="mp-btn-primary" href={camp.whatsappGroupLink} onClick={(event) => event.stopPropagation()} rel="noreferrer" style={{ marginTop: 12 }} target="_blank">
            Join Camp Group
          </a>
        ) : null}
      </div>
    </div>
  );
}

function CampSection({ items, title }) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="mp-divider" style={{ marginBottom: 14 }}>
        <div className="mp-divider-line" />
        <span className="mp-divider-label">{title}</span>
        <div className="mp-divider-line" />
      </div>
      <div className="mp-camp-grid">
        {items.map(camp => (
          <CampCard camp={camp} key={`${camp.id}-${camp.certificateId || "c"}`} />
        ))}
      </div>
    </section>
  );
}

export function MyCampsPage() {
  const [camps, setCamps]       = useState([]);
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(true);
  const [now, setNow]           = useState(0);
  const [filters, setFilters]   = useState({ filter: "all", search: "" });

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
        .then(data => { if (!ignore) setCamps(data); if (!ignore) setNow(Date.now()); })
        .catch(()   => { if (!ignore) setMessage("Unable to load your camps."); })
        .finally(() => { if (!ignore) setLoading(false); });
    }, 0);
    return () => { ignore = true; window.clearTimeout(timer); };
  }, []);

  function updateFilter(event) {
    const nextFilters = { ...filters, [event.target.name]: event.target.value };
    setFilters(nextFilters);
    window.setTimeout(() => loadCamps(nextFilters).catch(() => setMessage("Unable to filter camps.")), 0);
  }

  const pending   = camps.filter(c => normalizeCampStatus(c) === "pending");
  const upcoming  = camps.filter(c => ["approved","registered"].includes(normalizeCampStatus(c)) && (!c.startDatetime || new Date(c.startDatetime).getTime() >= now));
  const completed = camps.filter(c => ["participated","completed"].includes(normalizeCampStatus(c)));
  const past      = camps.filter(c => c.endDatetime && new Date(c.endDatetime).getTime() < now && !completed.includes(c));
  const certsEarned = camps.filter(c => c.certificateId && c.certificateStatus !== "revoked").length;

  return (
    <PageShell>
      <div className="mp-page-header">
        <div>
          <h1 className="mp-page-title">My Camps</h1>
          <p className="mp-page-subtitle">Track your registered and completed volunteer events</p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="mp-mini-stats">
        {[
          { label: "Camps Attended",   value: completed.length,  Icon: CheckCircle2, bg: "#ECFDF5", color: "#16A34A" },
          { label: "Certificates",     value: certsEarned,       Icon: Award,        bg: "#F0F9FF", color: "#0284C7" },
          { label: "Upcoming Camps",   value: upcoming.length,   Icon: CalendarDays, bg: "#FFF7ED", color: "#EA580C" },
        ].map(({ label, value, Icon, bg, color }) => (
          <div className="mp-mini-stat" key={label}>
            <div className="mp-mini-stat-icon" style={{ background: bg }}>
              <Icon style={{ color }} />
            </div>
            <div>
              <p className="mp-mini-stat-value">{value}</p>
              <p className="mp-mini-stat-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="mp-filter-bar">
        <div className="mp-search-wrap">
          <Search />
          <input
            name="search"
            placeholder="Search by event name or location…"
            value={filters.search}
            onChange={updateFilter}
          />
        </div>
        <select className="mp-select" name="filter" value={filters.filter} onChange={updateFilter}>
          <option value="all">All camps</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="certificates">Certificates Available</option>
          <option value="no_certificate">No Certificate</option>
        </select>
      </div>

      {loading && <Loading text="Loading your camps…" />}
      {message && <div className="mp-error-banner"><AlertCircle />{message}</div>}

      {!loading && camps.length === 0 && (
        <Empty
          icon={CalendarDays}
          title="No camps yet"
          sub="Join upcoming initiatives to begin your journey."
        />
      )}

      {!loading && camps.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {upcoming.length  > 0 && <CampSection items={upcoming}  title="Upcoming Camps"    empty="" />}
          {pending.length   > 0 && <CampSection items={pending}   title="Pending Approval"  empty="" />}
          {completed.length > 0 && <CampSection items={completed} title="Completed Camps"   empty="" />}
          {past.length      > 0 && <CampSection items={past}      title="Past Participation" empty="" />}
          {upcoming.length === 0 && completed.length === 0 && past.length === 0 && (
            <CampSection items={camps} title="All Camps" empty="" />
          )}
        </div>
      )}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MY CAMP DETAIL PAGE
═══════════════════════════════════════════════════════════════ */
function eventDateValue(event) {
  return event.startDatetime || event.start_datetime || event.eventDate || event.event_date;
}

function seatsLabel(event) {
  if (!event.capacity) return "Open seats";
  const left = event.seatsAvailable ?? event.seats_available ?? Math.max(Number(event.capacity) - Number(event.participantCount || event.participant_count || 0), 0);
  return `${left} of ${event.capacity} seats`;
}

function EventCard({ event, onRegister, busy }) {
  const alreadyRegistered = event.isRegistered || event.is_registered;
  const isPast = eventDateValue(event) && new Date(eventDateValue(event)).getTime() < Date.now();
  return (
    <article className="mp-camp-card">
      <div className="mp-camp-img">
        {event.bannerUrl || event.banner_url ? <img alt="" src={event.bannerUrl || event.banner_url} /> : "Maai Event"}
      </div>
      <div className="mp-camp-body">
        <div className="mp-camp-chips">
          <span className="mp-chip mp-chip-cyan" style={{ fontSize: 10 }}>{event.eventType || event.event_type || "event"}</span>
          <span className={statusChipClass(event.status)} style={{ fontSize: 10 }}>{event.status || "published"}</span>
        </div>
        <p className="mp-camp-title">{event.title}</p>
        <div className="mp-camp-meta">
          <div className="mp-camp-meta-row"><CalendarDays />{formatCampDate(eventDateValue(event))}</div>
          <div className="mp-camp-meta-row"><MapPin />{event.location || "Location pending"}</div>
          <div className="mp-camp-meta-row"><Users />{seatsLabel(event)}</div>
        </div>
        <div style={{ marginTop: 14 }}>
          {alreadyRegistered ? (
            <Link className="mp-btn-ghost" to="/volunteer/my-camps"><CheckCheck /> Registered</Link>
          ) : (
            <button className="mp-btn-primary" disabled={busy || isPast} onClick={() => onRegister(event.id)} type="button">
              <Send /> {busy ? "Registering..." : isPast ? "Closed" : "Register"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function EventsPage() {
  const [events, setEvents] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [tab, setTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function loadEvents() {
    const [allEvents, myEvents] = await Promise.all([
      getEvents({ type: "camp", status: "all", direction: "asc" }),
      getMyEvents(),
    ]);
    const registeredIds = new Set(myEvents.map((item) => Number(item.id || item.eventId)));
    setRegistered(myEvents);
    setEvents(allEvents.map((item) => ({ ...item, isRegistered: item.isRegistered || registeredIds.has(Number(item.id)) })));
  }

  useEffect(() => {
    let ignore = false;
    loadEvents()
      .catch(() => { if (!ignore) setMessage("Unable to load events."); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  async function handleRegister(id) {
    try {
      setBusyId(id);
      await registerEvent(id);
      setMessage("Registration submitted for approval.");
      await loadEvents();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to register for this event.");
    } finally {
      setBusyId(null);
    }
  }

  const now = Date.now();
  const registeredIds = new Set(registered.map((item) => Number(item.id || item.eventId)));
  const myStatus = new Map(registered.map((item) => [Number(item.id || item.eventId), item.participationStatus || item.participation_status || item.attendanceStatus]));
  const availableEvents = events.filter((event) => (event.eventType || event.event_type) === "camp" && !registeredIds.has(Number(event.id)) && (!eventDateValue(event) || new Date(eventDateValue(event)).getTime() >= now));
  const pendingEvents = events.filter((event) => myStatus.get(Number(event.id)) === "pending");
  const registeredEvents = events.filter((event) => ["approved", "registered"].includes(myStatus.get(Number(event.id))) && (!eventDateValue(event) || new Date(eventDateValue(event)).getTime() >= now));
  const pastEvents = events.filter((event) => eventDateValue(event) && new Date(eventDateValue(event)).getTime() < now);
  const activeList = tab === "pending" ? pendingEvents : tab === "upcoming" ? registeredEvents : tab === "past" ? pastEvents : availableEvents;

  return (
    <PageShell>
      <div className="mp-page-header">
        <div>
          <h1 className="mp-page-title">Events</h1>
          <p className="mp-page-subtitle">Find upcoming Maai events and manage your registrations.</p>
        </div>
      </div>

      <div className="mp-tabs">
        {[
          ["available", "Available Camps"],
          ["pending", "Pending Approval"],
          ["upcoming", "Upcoming Camps"],
          ["past", "Past Camps"],
        ].map(([key, label]) => (
          <button className={`mp-tab${tab === key ? " active" : ""}`} key={key} onClick={() => setTab(key)} type="button">{label}</button>
        ))}
      </div>

      {message && <div className="mp-error-banner"><AlertCircle />{message}</div>}
      {loading && <Loading text="Loading events..." />}
      {!loading && activeList.length === 0 ? <Empty icon={CalendarDays} title="No events here yet" sub="New Maai events will appear as soon as they are published." /> : null}
      {!loading && activeList.length > 0 ? (
        <div className="mp-camp-grid">
          {activeList.map((event) => <EventCard busy={busyId === event.id} event={event} key={event.id} onRegister={handleRegister} />)}
        </div>
      ) : null}
    </PageShell>
  );
}

export function MyCampDetailPage() {
  const { id }                  = useParams();
  const [camp, setCamp]         = useState(null);
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(true);

  async function loadCamp() { setCamp(await getMyCamp(id)); }

  useEffect(() => {
    let ignore = false;
    getMyCamp(id)
      .then(data  => { if (!ignore) setCamp(data); })
      .catch(error => { if (!ignore) setMessage(error?.response?.data?.message || "Unable to load camp details."); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
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
      {loading && <Loading text="Loading camp details…" />}
      {message && (
        <div className={message.toLowerCase().includes("success") ? "mp-success-banner" : "mp-error-banner"}>
          {message.toLowerCase().includes("success") ? <CheckCheck /> : <AlertCircle />}
          {message}
        </div>
      )}

      {camp && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Banner */}
          <div style={{ borderRadius: 20, overflow: "hidden", height: 240, background: "linear-gradient(135deg,#E0F7FA,#fff,#FCE7F3)" }}>
            {camp.bannerUrl || camp.banner_url
              ? <img alt="" src={camp.bannerUrl || camp.banner_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ height: "100%", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".12em", color: "#0891B2" }}>Maai Camp</div>
            }
          </div>

          {/* Info card */}
          <div className="mp-card">
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, marginBottom: 20 }}>
              {camp.description || "No description available."}
            </p>
            <div className="mp-2col" style={{ gap: 12 }}>
              {[
                { label: "Date",                value: formatCampDate(camp.startDatetime || camp.start_datetime || camp.date) },
                { label: "Location",            value: camp.location || "Location pending" },
                { label: "Participation Status",value: normalizeCampStatus(camp) },
                { label: "Certificate Status",  value: camp.certificateStatus || "No certificate" },
                { label: "Instructions",        value: camp.volunteerInstructions || camp.volunteer_instructions || "Instructions will be shared soon." },
                { label: "Requirements",        value: camp.requiredSkills || camp.required_skills || "No special requirements listed." },
                { label: "Coordinator Contact", value: camp.coordinatorContact || camp.coordinator_contact || "Not shared yet." },
                { label: "Related NGO",         value: camp.ngoName || "Future ready" },
              ].map(({ label, value }) => (
                <div className="mp-field" key={label} style={{ borderBottom: "none", padding: 0 }}>
                  <span className="mp-field-label">{label}</span>
                  <span className="mp-field-value" style={{ textTransform: "capitalize" }}>{value}</span>
                </div>
              ))}
            </div>

            {camp.certificateId && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(4,28,50,.07)" }}>
                {camp.certificateStatus === "eligible" && (
                  <button className="mp-btn-primary" onClick={handleClaim} type="button">
                    <CheckCheck /> Claim Certificate
                  </button>
                )}
                {camp.certificateStatus !== "revoked" && (
                  <a className="mp-btn-ghost" href={getCertificateDownloadUrl(camp.certificateId)} rel="noreferrer" target="_blank">
                    <Download /> Download Certificate
                  </a>
                )}
              </div>
            )}
            {["approved", "registered", "participated", "completed"].includes(normalizeCampStatus(camp)) && camp.whatsappGroupLink ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(4,28,50,.07)" }}>
                <a className="mp-btn-primary" href={camp.whatsappGroupLink} rel="noreferrer" target="_blank">
                  <Send /> Join Camp Group
                </a>
              </div>
            ) : null}
          </div>

          <Link
            to="/dashboard/my-camps"
            className="mp-btn-ghost"
            style={{ width: "fit-content" }}
          >
            <ChevronRight style={{ transform: "rotate(180deg)" }} /> Back to My Camps
          </Link>
        </div>
      )}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REQUEST CAMP PAGE
═══════════════════════════════════════════════════════════════ */
export function RequestCampPage() {
  const [form, setForm]           = useState({ campName: "", location: "", campType: "", beneficiaries: "", description: "" });
  const [message, setMessage]     = useState("");
  const [errors, setErrors]       = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm(cur => ({ ...cur, [name]: value }));
    setErrors(cur => ({ ...cur, [name]: "" }));
    setMessage(""); setIsSuccess(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true); setMessage(""); setIsSuccess(false);
    try {
      await requestVolunteerCamp(form);
      setMessage("Camp request submitted successfully.");
      setIsSuccess(true);
      setForm({ campName: "", location: "", campType: "", beneficiaries: "", description: "" });
    } catch (error) {
      const payload = error?.response?.data;
      setErrors(payload?.errors || {});
      setMessage(payload?.message || "Unable to submit camp request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fields = [
    { label: "Camp Name",            name: "campName",      placeholder: "e.g. Health Awareness Drive" },
    { label: "Location",             name: "location",      placeholder: "e.g. Navi Mumbai" },
    { label: "Camp Type",            name: "campType",      placeholder: "e.g. Medical, Education, Environment" },
    { label: "Expected Beneficiaries",name:"beneficiaries", placeholder: "e.g. 200 patients" },
  ];

  return (
    <PageShell>
      <div className="mp-page-header">
        <div>
          <h1 className="mp-page-title">Request a Camp</h1>
          <p className="mp-page-subtitle">Submit a new volunteer camp initiative for review</p>
        </div>
      </div>

      <form className="mp-form-card" onSubmit={handleSubmit}>
        {/* Section: Camp Details */}
        <div style={{ marginBottom: 20 }}>
          <div className="mp-card-head" style={{ marginBottom: 18 }}>
            <div className="mp-card-head-icon" style={{ background: "rgba(6,182,212,.1)" }}>
              <ClipboardList style={{ color: "#06B6D4" }} />
            </div>
            <span className="mp-card-title">Camp Details</span>
          </div>
          <div className="mp-form-grid">
            {fields.map(({ label, name, placeholder }) => (
              <div className="mp-form-field" key={name}>
                <label className="mp-label" htmlFor={name}>{label}</label>
                <input
                  id={name}
                  className={`mp-input${errors[name] ? " error" : ""}`}
                  name={name}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={updateField}
                />
                {errors[name] && <p className="mp-err">{errors[name]}</p>}
              </div>
            ))}
            <div className="mp-form-field mp-form-full">
              <label className="mp-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="mp-textarea"
                name="description"
                placeholder="Describe the camp, its goals, and how volunteers can help…"
                value={form.description}
                onChange={updateField}
              />
              {errors.description && <p className="mp-err">{errors.description}</p>}
            </div>
          </div>
        </div>

        {isSuccess && message && (
          <div className="mp-success-banner" style={{ marginBottom: 16 }}>
            <CheckCheck />{message}
          </div>
        )}
        {!isSuccess && message && (
          <div className="mp-error-banner" style={{ marginBottom: 16 }}>
            <AlertCircle />{message}
          </div>
        )}

        <button
          className="mp-btn-primary"
          disabled={isSubmitting}
          type="submit"
          style={{ opacity: isSubmitting ? .7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
        >
          <Send />
          {isSubmitting ? "Submitting…" : "Submit Request"}
        </button>
      </form>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANNOUNCEMENTS PAGE
═══════════════════════════════════════════════════════════════ */
export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [message, setMessage]             = useState("");
  const [tab, setTab]                     = useState("all");
  const [expanded, setExpanded]           = useState({});

  useEffect(() => {
    let ignore = false;
    getAnnouncements()
      .then(data => { if (!ignore) setAnnouncements(data); })
      .catch(()   => { if (!ignore) setMessage("Unable to load announcements."); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const filtered = announcements.filter(a => {
    if (tab === "important") return ["high","urgent", "important"].includes((a.priority || "").toLowerCase());
    if (tab === "unread") return !a.isRead && !a.is_read;
    return true;
  });
  const unreadCount = announcements.filter((a) => !a.isRead && !a.is_read).length;

  async function openAnnouncement(ann) {
    setExpanded((current) => ({ ...current, [ann.id]: !current[ann.id] }));
    if (ann.isRead || ann.is_read) return;
    try {
      const read = await markAnnouncementRead(ann.id);
      setAnnouncements((current) =>
        current.map((item) =>
          item.id === ann.id
            ? { ...item, isRead: true, is_read: true, readAt: read?.readAt, read_at: read?.readAt || read?.read_at }
            : item,
        ),
      );
    } catch {
      // Keep the local list untouched if the read marker fails.
    }
  }

  return (
    <PageShell>
      <div className="mp-page-header">
        <div>
          <h1 className="mp-page-title">Announcements</h1>
          <p className="mp-page-subtitle">Stay updated with the latest from Maai Organisation</p>
        </div>
        <div className="mp-chips">
          {announcements.length > 0 && <span className="mp-chip mp-chip-cyan">{announcements.length} Updates</span>}
          {unreadCount > 0 && <span className="mp-chip mp-chip-red">{unreadCount} Unread</span>}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="mp-tabs">
          {[["all","All"],["unread","Unread"],["important","Important"]].map(([key,label]) => (
            <button key={key} className={`mp-tab${tab === key ? " active" : ""}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>
      </div>

      {loading && <Loading text="Loading announcements…" />}
      {message && <div className="mp-error-banner"><AlertCircle />{message}</div>}

      {!loading && filtered.length === 0 && (
        <Empty
          icon={Bell}
          title="No announcements yet"
          sub="Updates and notices for members will appear here."
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(ann => {
          const { Icon, bg, color } = annIcon(ann.announcementType || ann.announcement_type || "");
          const isRead = ann.isRead || ann.is_read;
          const isOpen = Boolean(expanded[ann.id]);
          return (
            <article className={`mp-ann-card ${isRead ? "read" : "unread"}`} key={ann.id} onClick={() => openAnnouncement(ann)} role="button" tabIndex={0}>
              {!isRead ? <span className="mp-ann-read-dot" /> : null}
              <div className="mp-ann-icon" style={{ background: bg }}>
                <Icon style={{ color }} />
              </div>
              <div className="mp-ann-body">
                <div className="mp-ann-chips">
                  <span className={priorityChipClass(ann.priority)} style={{ fontSize: 10 }}>
                    {ann.priority || "update"}
                  </span>
                  <span className="mp-chip mp-chip-slate" style={{ fontSize: 10 }}>
                    {ann.announcementType || ann.announcement_type || "announcement"}
                  </span>
                </div>
                <h4 className="mp-ann-title">{ann.title}</h4>
                <p className={`mp-ann-msg${isOpen ? "" : " collapsed"}`}>{ann.message}</p>
                {ann.createdAt || ann.created_at ? (
                  <div className="mp-ann-footer">
                    <span className="mp-ann-time">
                      {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" })
                        .format(new Date(ann.createdAt || ann.created_at))}
                    </span>
                    {ann.readAt || ann.read_at ? (
                      <span className="mp-ann-time">Read {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(ann.readAt || ann.read_at))}</span>
                    ) : null}
                    <span className="mp-ann-time">{isOpen ? "Click to collapse" : "Click to open"}</span>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GOD MODE PAGE  (logic preserved — just redirects to /admin)
═══════════════════════════════════════════════════════════════ */
export function GodModePage() {
  return <Navigate replace to="/admin" />;
}
