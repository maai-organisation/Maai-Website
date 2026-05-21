/**
 * CMSConsole.jsx — Redesigned to match the Maai Dashboard design system.
 * Same DM Sans typography, navy/cyan tokens, sidebar style, and card patterns
 * as Dashboard.jsx, AdminVolunteers.jsx, and AdminNgos.jsx.
 *
 * All data-fetching, state, and module logic preserved exactly.
 * Added: Admin Dashboard nav button.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Globe,
  ChevronRight,
  Plus,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Layers,
} from "lucide-react";
import CMSDeleteModal from "../../components/cms/CMSDeleteModal";
import CMSFormModal from "../../components/cms/CMSFormModal";
import CMSPageLayout from "../../components/cms/CMSPageLayout";
import CMSTable from "../../components/cms/CMSTable";
import {
  createCMSItem,
  deleteCMSItem,
  getCMSItems,
  getCMSModules,
  updateCMSItem,
  updateCMSItemDefault,
  updateCMSItemFeatured,
  updateCMSItemStatus,
} from "../../services/api";

/* ─── Fallback modules ────────────────────────────────────────── */
const fallbackModules = [
  { key: "social-links",            label: "Social Links" },
  { key: "team",                    label: "Team" },
  { key: "mentors",                 label: "Mentors" },
  { key: "initiatives",             label: "Initiatives" },
  { key: "reels",                   label: "Reels" },
  { key: "testimonials",            label: "Testimonials" },
  { key: "careers",                 label: "Careers" },
  { key: "id-templates",            label: "ID Card Templates" },
  { key: "certificate-templates",   label: "Certificate Templates" },
  { key: "email-templates",         label: "Email Templates" },
  { key: "hero_sections",           label: "Hero Sections" },
];

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
    --sidebar-w:   270px;
    --radius-card: 20px;
    --radius-pill: 9999px;
    --shadow-card: 0 2px 16px rgba(4,28,50,.07), 0 1px 4px rgba(4,28,50,.05);
    --shadow-lift: 0 8px 32px rgba(4,28,50,.13), 0 2px 8px rgba(4,28,50,.07);
    --transition:  all .2s cubic-bezier(.4,0,.2,1);
  }

  .cms-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #F6FAFB;
    color: var(--maai-navy);
    min-height: 100vh;
    display: flex;
  }

  /* ── Sidebar ── */
  .cms-sidebar {
    width: var(--sidebar-w);
    min-height: 100vh;
    background: var(--maai-navy);
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0; top: 0;
    z-index: 40;
    box-shadow: 4px 0 32px rgba(4,28,50,.18);
    transition: transform .3s cubic-bezier(.4,0,.2,1);
  }
  .cms-sidebar-logo {
    display: flex; align-items: center; gap: 12px;
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,.08);
    flex-shrink: 0;
  }
  .cms-sidebar-logo-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, var(--maai-sky), var(--maai-teal));
    display: grid; place-items: center; flex-shrink: 0;
    overflow: hidden;
  }
  .cms-sidebar-logo-icon img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
  .cms-sidebar-logo-text { color: #fff; font-weight: 700; font-size: 15px; line-height: 1.3; letter-spacing: -.01em; }
  .cms-sidebar-logo-sub  { color: rgba(255,255,255,.4); font-size: 11px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; margin-top: 1px; }

  .cms-sidebar-nav {
    flex: 1; overflow-y: auto; padding: 16px 10px 8px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.1) transparent;
  }
  .cms-sidebar-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
    color: rgba(255,255,255,.28); padding: 8px 10px 8px; margin-bottom: 2px;
  }
  .cms-nav-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 12px; border-radius: 12px;
    font-size: 13.5px; font-weight: 500;
    color: rgba(255,255,255,.55);
    cursor: pointer; border: none; width: 100%;
    text-align: left; background: transparent;
    transition: var(--transition); margin-bottom: 1px;
    font-family: inherit; position: relative; overflow: hidden;
  }
  .cms-nav-item:hover {
    background: rgba(255,255,255,.07);
    color: rgba(255,255,255,.9);
  }
  .cms-nav-item.active {
    background: linear-gradient(135deg, rgba(14,165,233,.22), rgba(6,182,212,.15));
    color: #fff;
    box-shadow: inset 0 0 0 1px rgba(14,165,233,.28);
  }
  .cms-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: linear-gradient(to bottom, var(--maai-sky), var(--maai-teal));
  }
  .cms-nav-item svg { width: 13px; height: 13px; opacity: .5; flex-shrink: 0; }
  .cms-nav-item.active svg { opacity: 1; }

  .cms-sidebar-footer {
    padding: 12px 10px 16px;
    border-top: 1px solid rgba(255,255,255,.08);
    flex-shrink: 0;
  }
  .cms-sidebar-link {
    display: flex; align-items: center; gap: 9px;
    padding: 10px 12px; border-radius: 12px;
    font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,.55); text-decoration: none;
    transition: var(--transition); margin-bottom: 2px;
  }
  .cms-sidebar-link:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.9); }
  .cms-sidebar-link svg { width: 15px; height: 15px; flex-shrink: 0; }
  .cms-sidebar-link.highlight {
    background: linear-gradient(135deg, rgba(14,165,233,.15), rgba(6,182,212,.1));
    color: #67E8F9;
    border: 1px solid rgba(14,165,233,.2);
    margin-top: 4px;
  }
  .cms-sidebar-link.highlight:hover { background: linear-gradient(135deg, rgba(14,165,233,.25), rgba(6,182,212,.2)); color: #fff; }

  /* Mobile overlay & hamburger */
  .cms-mobile-btn {
    display: none;
    position: fixed; left: 16px; top: 16px; z-index: 50;
    width: 42px; height: 42px; border-radius: 12px;
    background: #fff; border: 1px solid rgba(4,28,50,.1);
    box-shadow: var(--shadow-card); cursor: pointer;
    align-items: center; justify-content: center;
  }
  .cms-mobile-btn svg { width: 20px; height: 20px; }
  .cms-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(4,28,50,.48); backdrop-filter: blur(4px);
    z-index: 39;
  }

  /* ── Main content ── */
  .cms-main {
    margin-left: var(--sidebar-w);
    flex: 1; min-height: 100vh;
    display: flex; flex-direction: column;
  }

  /* ── Topbar ── */
  .cms-topbar {
    position: sticky; top: 0; z-index: 30;
    background: rgba(246,250,251,.9); backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(4,28,50,.07);
    padding: 14px 32px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
  }
  .cms-topbar-left { display: flex; align-items: center; gap: 10px; }
  .cms-topbar-module-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(14,165,233,.08); border: 1px solid rgba(14,165,233,.18);
    color: var(--maai-sky); font-size: 11px; font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase;
    padding: 4px 12px; border-radius: var(--radius-pill);
  }
  .cms-topbar-module-pill svg { width: 12px; height: 12px; }
  .cms-topbar-title {
    font-size: 18px; font-weight: 800; letter-spacing: -.01em;
    color: var(--maai-navy);
  }
  .cms-topbar-right { display: flex; align-items: center; gap: 8px; }
  .cms-topbar-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: #fff; border: 1px solid rgba(4,28,50,.12);
    border-radius: var(--radius-pill);
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: #475569; padding: 8px 16px;
    cursor: pointer; text-decoration: none; transition: var(--transition);
  }
  .cms-topbar-btn-ghost:hover { border-color: rgba(14,165,233,.35); color: var(--maai-sky); }
  .cms-topbar-btn-ghost svg { width: 14px; height: 14px; }
  .cms-topbar-btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, var(--maai-sky), var(--maai-teal));
    color: #fff; font-family: inherit; font-size: 13px; font-weight: 700;
    padding: 8px 18px; border-radius: var(--radius-pill);
    border: none; cursor: pointer; text-decoration: none; transition: var(--transition);
  }
  .cms-topbar-btn-primary:hover { opacity: .88; transform: translateY(-1px); }
  .cms-topbar-btn-primary svg { width: 14px; height: 14px; }

  /* ── Page body ── */
  .cms-body { padding: 28px 32px 48px; display: flex; flex-direction: column; gap: 20px; }

  /* ── Error / loading cards ── */
  .cms-error {
    padding: 14px 18px;
    background: #FEF2F2; border: 1px solid rgba(239,68,68,.2);
    border-radius: 14px; font-size: 13px; font-weight: 600; color: #B91C1C;
    display: flex; align-items: center; gap: 8px;
  }
  .cms-error svg { width: 15px; height: 15px; flex-shrink: 0; }
  .cms-loading {
    background: #fff; border-radius: var(--radius-card);
    border: 1px solid rgba(4,28,50,.07); box-shadow: var(--shadow-card);
    padding: 32px 24px; font-size: 13.5px; font-weight: 600;
    color: #94A3B8; display: flex; align-items: center; gap: 10px;
  }
  .cms-loading svg { width: 16px; height: 16px; animation: cms-spin 1s linear infinite; }
  @keyframes cms-spin { to { transform: rotate(360deg); } }

  /* ── Pagination ── */
  .cms-pagination {
    background: #fff; border-radius: var(--radius-card);
    border: 1px solid rgba(4,28,50,.07); box-shadow: var(--shadow-card);
    padding: 14px 20px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap;
  }
  .cms-pagination-info {
    font-size: 13px; font-weight: 600; color: #64748B;
  }
  .cms-pagination-info strong { color: var(--maai-navy); }
  .cms-pagination-btns { display: flex; align-items: center; gap: 8px; }
  .cms-page-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border-radius: var(--radius-pill);
    font-family: inherit; font-size: 13px; font-weight: 700;
    border: none; cursor: pointer; transition: var(--transition);
  }
  .cms-page-btn:disabled { opacity: .38; cursor: not-allowed; pointer-events: none; }
  .cms-page-btn-prev { background: #F1F5F9; color: #475569; }
  .cms-page-btn-prev:hover:not(:disabled) { background: #E2E8F0; }
  .cms-page-btn-next { background: var(--maai-navy); color: #fff; }
  .cms-page-btn-next:hover:not(:disabled) { background: var(--maai-ocean); }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .cms-main { margin-left: 0; }
    .cms-sidebar { transform: translateX(-100%); }
    .cms-sidebar.open { transform: translateX(0); z-index: 50; }
    .cms-overlay.open { display: block; }
    .cms-mobile-btn { display: flex; }
    .cms-topbar { padding: 12px 16px 12px 68px; }
    .cms-body { padding: 20px 16px 40px; }
  }
  @media (max-width: 600px) {
    .cms-topbar-title { font-size: 15px; }
  }
`;

function StyleInjector() {
  useEffect(() => {
    const id = "cms-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = css;
      document.head.appendChild(tag);
    }
  }, []);
  return null;
}

/* ─── Layout ──────────────────────────────────────────────────── */
function CMSLayout({ activeModule, children, modules, onOpen, roleLabel, setActiveModule, sidebarOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`cms-overlay${sidebarOpen ? " open" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`cms-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div className="cms-sidebar-logo">
          <div className="cms-sidebar-logo-icon">
            <img alt="Maai" src="/Favicon.ico" />
          </div>
          <div>
            <div className="cms-sidebar-logo-text">Maai CMS</div>
            <div className="cms-sidebar-logo-sub">{roleLabel}</div>
          </div>
        </div>

        {/* Module nav */}
        <nav className="cms-sidebar-nav">
          <div className="cms-sidebar-section-label">Modules</div>
          {modules.map((module) => (
            <button
              className={`cms-nav-item${activeModule === module.key ? " active" : ""}`}
              key={module.key}
              onClick={() => { setActiveModule(module.key); onClose(); }}
              type="button"
            >
              <span>{module.label}</span>
              <ChevronRight />
            </button>
          ))}
        </nav>

        {/* Footer links */}
        <div className="cms-sidebar-footer">
          <Link className="cms-sidebar-link" to="/admin">
            <LayoutDashboard />Admin Dashboard
          </Link>
          <Link className="cms-sidebar-link" to="/dashboard">
            <Users />Member View
          </Link>
          <Link className="cms-sidebar-link highlight" to="/volunteer">
            <Globe />Back to Website
          </Link>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button className="cms-mobile-btn" onClick={onOpen} type="button">
        <Menu />
      </button>

      {children}
    </>
  );
}

/* ─── Main export ─────────────────────────────────────────────── */
export default function CMSConsole({ defaultModule = "social-links", roleLabel = "Admin" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedModule = searchParams.get("module") || defaultModule;
  const [activeModule, setActiveModuleState] = useState(requestedModule);
  const [modules, setModules]   = useState(fallbackModules);
  const [items, setItems]       = useState([]);
  const [meta, setMeta]         = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("all");
  const [featured, setFeatured] = useState("all");
  const [organization, setOrganization] = useState("all");
  const [category, setCategory] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [initiativeId, setInitiativeId] = useState("all");
  const [rating, setRating]     = useState("all");
  const [roleType, setRoleType] = useState("all");
  const [department, setDepartment] = useState("");
  const [sort, setSort]         = useState("order_index");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [formItem, setFormItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeConfig = useMemo(
    () => modules.find((m) => m.key === activeModule) || modules[0] || fallbackModules[0],
    [activeModule, modules],
  );

  const totalPages = Math.max(Math.ceil((meta.total || 0) / (meta.limit || 10)), 1);

  const setActiveModule = useCallback(
    (moduleKey) => {
      setActiveModuleState(moduleKey);
      setSearch(""); setStatus("all"); setFeatured("all");
      setOrganization("all"); setCategory("all"); setVisibility("all");
      setPlatform("all"); setInitiativeId("all"); setRating("all");
      setRoleType("all"); setDepartment(""); setSort("order_index");
      setMeta((c) => ({ ...c, page: 1 }));
      setSearchParams({ module: moduleKey });
    },
    [setSearchParams],
  );

  const loadModules = useCallback(async () => {
    try {
      const data = await getCMSModules();
      if (Array.isArray(data) && data.length > 0) {
        setModules(data);
        if (!data.some((m) => m.key === activeModule)) setActiveModule(data[0].key);
      }
    } catch {
      setModules(fallbackModules);
      if (!fallbackModules.some((m) => m.key === activeModule)) setActiveModule("social-links");
    }
  }, [activeModule, setActiveModule]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getCMSItems(activeModule, {
        search, status, featured, organization, category,
        visibility, platform, initiativeId, rating, roleType,
        department, sort, page: meta.page, limit: meta.limit,
      });
      setItems(response.items);
      setMeta(response.meta);
    } catch (err) {
      setError(err?.response?.data?.message || "CMS entries could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [activeModule, category, department, featured, initiativeId, meta.limit, meta.page, organization, platform, rating, roleType, search, sort, status, visibility]);

  useEffect(() => {
    const t = window.setTimeout(loadModules, 0);
    return () => window.clearTimeout(t);
  }, [loadModules]);

  useEffect(() => {
    const t = window.setTimeout(loadItems, 0);
    return () => window.clearTimeout(t);
  }, [loadItems]);

  function openCreate() { setFormItem(null); setFormOpen(true); }
  function openEdit(item) { setFormItem(item); setFormOpen(true); }

  async function saveItem(payload) {
    if (formItem) { await updateCMSItem(activeModule, formItem.id, payload); }
    else { await createCMSItem(activeModule, payload); }
    setFormOpen(false); setFormItem(null);
    await loadItems();
  }

  async function changeStatus(item, nextStatus) {
    await updateCMSItemStatus(activeModule, item.id, nextStatus);
    await loadItems();
  }

  async function changeFeatured(item, nextFeatured) {
    await updateCMSItemFeatured(activeModule, item.id, nextFeatured);
    await loadItems();
  }

  async function changeDefault(item) {
    await updateCMSItemDefault(activeModule, item.id);
    await loadItems();
  }

  async function confirmDelete() {
    if (!deleteItem) return;
    await deleteCMSItem(activeModule, deleteItem.id);
    setDeleteItem(null);
    await loadItems();
  }

  const updateSearch     = (v) => { setSearch(v);     setMeta((c) => ({ ...c, page: 1 })); };
  const updateStatus     = (v) => { setStatus(v);     setMeta((c) => ({ ...c, page: 1 })); };
  const updateFeatured   = (v) => { setFeatured(v);   setMeta((c) => ({ ...c, page: 1 })); };
  const updateOrganization=(v) => { setOrganization(v);setMeta((c) => ({ ...c, page: 1 })); };
  const updateCategory   = (v) => { setCategory(v);   setMeta((c) => ({ ...c, page: 1 })); };
  const updateVisibility = (v) => { setVisibility(v); setMeta((c) => ({ ...c, page: 1 })); };
  const updatePlatform   = (v) => { setPlatform(v);   setMeta((c) => ({ ...c, page: 1 })); };
  const updateInitiativeId=(v) => { setInitiativeId(v);setMeta((c) => ({ ...c, page: 1 })); };
  const updateRating     = (v) => { setRating(v);     setMeta((c) => ({ ...c, page: 1 })); };
  const updateRoleType   = (v) => { setRoleType(v);   setMeta((c) => ({ ...c, page: 1 })); };
  const updateDepartment = (v) => { setDepartment(v); setMeta((c) => ({ ...c, page: 1 })); };
  const updateSort       = (v) => { setSort(v);       setMeta((c) => ({ ...c, page: 1 })); };
  const changePage = (n) =>
    setMeta((c) => ({ ...c, page: Math.min(Math.max(n, 1), totalPages) }));

  return (
    <>
      <StyleInjector />
      <div className="cms-root">
        <CMSLayout
          activeModule={activeConfig.key}
          modules={modules}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
          roleLabel={roleLabel}
          setActiveModule={setActiveModule}
          sidebarOpen={sidebarOpen}
        >
          {/* ── Main content ── */}
          <div className="cms-main">

            {/* Topbar */}
            <div className="cms-topbar">
              <div className="cms-topbar-left">
                <div className="cms-topbar-module-pill">
                  <Layers />CMS
                </div>
                <span className="cms-topbar-title">{activeConfig.label}</span>
              </div>

              <div className="cms-topbar-right">
                <Link className="cms-topbar-btn-ghost" to="/admin">
                  <LayoutDashboard />Admin Dashboard
                </Link>
                <Link className="cms-topbar-btn-ghost" to="/dashboard">
                  <Users />Member View
                </Link>
                <Link className="cms-topbar-btn-ghost" to="/volunteer">
                  <ArrowLeft />Website
                </Link>
                <button className="cms-topbar-btn-primary" onClick={openCreate} type="button">
                  <Plus />New {activeConfig.label}
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="cms-body">
              {error && (
                <div className="cms-error">
                  <AlertCircle />{error}
                </div>
              )}

              {loading ? (
                <div className="cms-loading">
                  <RefreshCw />Loading CMS entries…
                </div>
              ) : (
                <CMSPageLayout moduleLabel={activeConfig.label} onCreate={openCreate} roleLabel={roleLabel}>
                  <CMSTable
                    items={items}
                    onArchive={(item) => changeStatus(item, "archived")}
                    onDelete={setDeleteItem}
                    onEdit={openEdit}
                    onPublish={(item) => changeStatus(item, "published")}
                    onSearch={updateSearch}
                    onSort={updateSort}
                    onStatus={updateStatus}
                    onFeatured={updateFeatured}
                    onOrganization={updateOrganization}
                    onCategory={updateCategory}
                    onVisibility={updateVisibility}
                    onPlatform={updatePlatform}
                    onInitiative={updateInitiativeId}
                    onRating={updateRating}
                    onRoleType={updateRoleType}
                    onDepartment={updateDepartment}
                    onFeature={(item) => changeFeatured(item, true)}
                    onDefault={changeDefault}
                    onUnfeature={(item) => changeFeatured(item, false)}
                    search={search}
                    featured={featured}
                    organization={organization}
                    category={category}
                    visibility={visibility}
                    platform={platform}
                    initiativeId={initiativeId}
                    rating={rating}
                    roleType={roleType}
                    department={department}
                    sort={sort}
                    status={status}
                    moduleKey={activeConfig.key}
                  />
                </CMSPageLayout>
              )}

              {/* Pagination */}
              <div className="cms-pagination">
                <p className="cms-pagination-info">
                  Page <strong>{meta.page || 1}</strong> of <strong>{totalPages}</strong>
                  {" "}·{" "}<strong>{meta.total || 0}</strong> entries
                </p>
                <div className="cms-pagination-btns">
                  <button
                    className="cms-page-btn cms-page-btn-prev"
                    disabled={(meta.page || 1) <= 1}
                    onClick={() => changePage((meta.page || 1) - 1)}
                    type="button"
                  >
                    Previous
                  </button>
                  <button
                    className="cms-page-btn cms-page-btn-next"
                    disabled={(meta.page || 1) >= totalPages}
                    onClick={() => changePage((meta.page || 1) + 1)}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CMSLayout>

        {formOpen && (
          <CMSFormModal
            item={formItem}
            moduleKey={activeConfig.key}
            moduleLabel={activeConfig.label}
            onClose={() => setFormOpen(false)}
            onSubmit={saveItem}
          />
        )}
        {deleteItem && (
          <CMSDeleteModal
            item={deleteItem}
            onCancel={() => setDeleteItem(null)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    </>
  );
}