import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Menu, X } from "lucide-react";
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

const fallbackModules = [
  { key: "social-links", label: "Social Links" },
  { key: "team", label: "Team" },
  { key: "mentors", label: "Mentors" },
  { key: "initiatives", label: "Initiatives" },
  { key: "reels", label: "Reels" },
  { key: "testimonials", label: "Testimonials" },
  { key: "careers", label: "Careers" },
  { key: "id-templates", label: "ID Card Templates" },
  { key: "certificate-templates", label: "Certificate Templates" },
  { key: "email-templates", label: "Email Templates" },
  { key: "hero_sections", label: "Hero Sections" },
];

function CMSLayout({ activeModule, children, modules, roleLabel, setActiveModule }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const sidebar = (
    <aside className="flex h-full w-[280px] shrink-0 flex-col bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
      <div className="flex items-center gap-3">
        <img alt="" className="h-10 w-10 rounded-2xl bg-white shadow-sm" src="/Favicon.ico" />
        <div>
          <p className="text-sm font-black">Maai CMS</p>
          <p className="text-xs font-bold text-white/50">{roleLabel.toUpperCase()}</p>
        </div>
      </div>
      <nav className="mt-8 overflow-y-auto pr-1">
        <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Modules</p>
        <div className="grid gap-1">
          {modules.map((module) => (
            <button
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                activeModule === module.key ? "bg-white text-slate-950 shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              key={module.key}
              onClick={() => { setActiveModule(module.key); closeMobileMenu(); }}
              type="button"
            >
              {module.label}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-cyan-50/50 text-slate-950">
      <div className="flex min-h-screen">
        <div className="sticky top-0 hidden h-screen w-[280px] shrink-0 lg:block">
          {sidebar}
        </div>
        <div className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity lg:hidden ${mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={closeMobileMenu} />
        <div className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="relative h-full">
            <button className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white" onClick={closeMobileMenu} type="button">
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </div>
        </div>
        <button className="fixed left-4 top-9 z-40 grid h-11 w-11 place-items-center rounded-2xl border border-slate-100 bg-white text-slate-700 shadow-lg lg:hidden" onClick={() => setMobileMenuOpen(true)} type="button">
          <Menu className="h-5 w-5" />
        </button>
        {children}
      </div>
    </main>
  );
}

export default function CMSConsole({ defaultModule = "social-links", roleLabel = "Admin" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedModule = searchParams.get("module") || defaultModule;
  const [activeModule, setActiveModuleState] = useState(requestedModule);
  const [modules, setModules] = useState(fallbackModules);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [organization, setOrganization] = useState("all");
  const [category, setCategory] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [initiativeId, setInitiativeId] = useState("all");
  const [rating, setRating] = useState("all");
  const [roleType, setRoleType] = useState("all");
  const [department, setDepartment] = useState("");
  const [sort, setSort] = useState("order_index");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formItem, setFormItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const activeConfig = useMemo(
    () => modules.find((module) => module.key === activeModule) || modules[0] || fallbackModules[0],
    [activeModule, modules],
  );

  const totalPages = Math.max(Math.ceil((meta.total || 0) / (meta.limit || 10)), 1);

  const setActiveModule = useCallback(
    (moduleKey) => {
      setActiveModuleState(moduleKey);
      setSearch("");
      setStatus("all");
      setFeatured("all");
      setOrganization("all");
      setCategory("all");
      setVisibility("all");
      setPlatform("all");
      setInitiativeId("all");
      setRating("all");
      setRoleType("all");
      setDepartment("");
      setSort("order_index");
      setMeta((current) => ({ ...current, page: 1 }));
      setSearchParams({ module: moduleKey });
    },
    [setSearchParams],
  );

  const loadModules = useCallback(async () => {
    try {
      const data = await getCMSModules();
      if (Array.isArray(data) && data.length > 0) {
        setModules(data);
        if (!data.some((module) => module.key === activeModule)) {
          setActiveModule(data[0].key);
        }
      }
    } catch {
      setModules(fallbackModules);
      if (!fallbackModules.some((module) => module.key === activeModule)) {
        setActiveModule("social-links");
      }
    }
  }, [activeModule, setActiveModule]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getCMSItems(activeModule, {
        search,
        status,
        featured,
        organization,
        category,
        visibility,
        platform,
        initiativeId,
        rating,
        roleType,
        department,
        sort,
        page: meta.page,
        limit: meta.limit,
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
    const timer = window.setTimeout(loadModules, 0);
    return () => window.clearTimeout(timer);
  }, [loadModules]);

  useEffect(() => {
    const timer = window.setTimeout(loadItems, 0);
    return () => window.clearTimeout(timer);
  }, [loadItems]);

  function openCreate() {
    setFormItem(null);
    setFormOpen(true);
  }

  function openEdit(item) {
    setFormItem(item);
    setFormOpen(true);
  }

  async function saveItem(payload) {
    if (formItem) {
      await updateCMSItem(activeModule, formItem.id, payload);
    } else {
      await createCMSItem(activeModule, payload);
    }
    setFormOpen(false);
    setFormItem(null);
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

  function updateSearch(value) {
    setSearch(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updateStatus(value) {
    setStatus(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updateFeatured(value) {
    setFeatured(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updateOrganization(value) {
    setOrganization(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updateCategory(value) {
    setCategory(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updateVisibility(value) {
    setVisibility(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updatePlatform(value) {
    setPlatform(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updateInitiativeId(value) {
    setInitiativeId(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updateRating(value) {
    setRating(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updateRoleType(value) {
    setRoleType(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updateDepartment(value) {
    setDepartment(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function updateSort(value) {
    setSort(value);
    setMeta((current) => ({ ...current, page: 1 }));
  }

  function changePage(nextPage) {
    setMeta((current) => ({ ...current, page: Math.min(Math.max(nextPage, 1), totalPages) }));
  }

  return (
    <CMSLayout activeModule={activeConfig.key} modules={modules} roleLabel={roleLabel} setActiveModule={setActiveModule}>
      <CMSPageLayout moduleLabel={activeConfig.label} onCreate={openCreate} roleLabel={roleLabel}>
        <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700"
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
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500">Loading CMS entries...</div>
        ) : (
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
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-sm font-bold text-slate-500">
            Page {meta.page || 1} of {totalPages} / {meta.total || 0} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black disabled:opacity-40"
              disabled={(meta.page || 1) <= 1}
              onClick={() => changePage((meta.page || 1) - 1)}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-40"
              disabled={(meta.page || 1) >= totalPages}
              onClick={() => changePage((meta.page || 1) + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </CMSPageLayout>

      {formOpen ? (
        <CMSFormModal
          item={formItem}
          moduleKey={activeConfig.key}
          moduleLabel={activeConfig.label}
          onClose={() => setFormOpen(false)}
          onSubmit={saveItem}
        />
      ) : null}
      {deleteItem ? <CMSDeleteModal item={deleteItem} onCancel={() => setDeleteItem(null)} onConfirm={confirmDelete} /> : null}
    </CMSLayout>
  );
}
