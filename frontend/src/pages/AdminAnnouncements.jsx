import { Archive, Edit, Megaphone, Plus, Search, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  getAdminAnnouncements,
  updateAdminAnnouncement,
  updateAdminAnnouncementStatus,
} from "../services/api";

const initialForm = {
  title: "",
  message: "",
  announcementType: "general",
  audience: "all",
  priority: "info",
  sendEmail: false,
  publishAt: "",
  expireAt: "",
  status: "draft",
};

const announcementTypes = ["general", "membership", "event", "camp", "certificate", "system"];
const audiences = ["volunteers", "ngos", "all", "admins"];
const priorities = ["info", "important", "urgent"];
const statuses = ["draft", "published", "archived"];

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function AdminAnnouncements({ roleLabel = "Admin" }) {
  const [announcements, setAnnouncements] = useState([]);
  const [filters, setFilters] = useState({ search: "", audience: "any", status: "all" });
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAnnouncements = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    try {
      setAnnouncements(await getAdminAnnouncements(nextFilters));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to load announcements.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadAnnouncements(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAnnouncements]);

  function updateFilter(event) {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    window.setTimeout(() => loadAnnouncements(nextFilters), 0);
  }

  function updateForm(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setMessage("");
  }

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      title: item.title || "",
      message: item.message || item.body || "",
      announcementType: item.announcementType || item.announcement_type || "general",
      audience: item.audience || "all",
      priority: item.priority || "info",
      sendEmail: Boolean(item.sendEmail || item.send_email),
      publishAt: toDatetimeLocal(item.publishAt || item.publish_at),
      expireAt: toDatetimeLocal(item.expireAt || item.expire_at),
      status: item.status || "draft",
    });
    setFormOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    const response = editing ? await updateAdminAnnouncement(editing.id, form) : await createAdminAnnouncement(form);
    const meta = response?.meta || {};
    setMessage(
      `${editing ? "Announcement updated" : "Announcement saved"}. ${meta.notificationsCreated || 0} notifications, ${meta.emailsQueued || 0} email attempts.`,
    );
    setFormOpen(false);
    setEditing(null);
    setForm(initialForm);
    await loadAnnouncements(filters);
  }

  async function changeStatus(item, status) {
    const response = await updateAdminAnnouncementStatus(item.id, status);
    const meta = response?.meta || {};
    setMessage(`${status === "published" ? "Published" : status === "archived" ? "Archived" : "Updated"}. ${meta.notificationsCreated || 0} notifications created.`);
    await loadAnnouncements(filters);
  }

  async function remove(item) {
    await deleteAdminAnnouncement(item.id);
    setMessage("Announcement archived.");
    await loadAnnouncements(filters);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-950 md:p-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">{roleLabel} Communications</p>
              <h1 className="mt-1 text-2xl font-black">Announcements</h1>
            </div>
            <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white" onClick={openCreate} type="button">
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        </header>

        {message ? <p className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{message}</p> : null}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-200 p-5 md:grid-cols-[1fr_170px_170px]">
            <label className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-semibold outline-none" name="search" onChange={updateFilter} placeholder="Search announcements" value={filters.search} />
            </label>
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="audience" onChange={updateFilter} value={filters.audience}>
              <option value="any">All audiences</option>
              {audiences.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateFilter} value={filters.status}>
              <option value="all">All statuses</option>
              {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Audience</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Publish Date</th>
                  <th className="px-5 py-4">Expire Date</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {announcements.map((item) => (
                  <tr key={item.id}>
                    <td className="max-w-sm px-5 py-4">
                      <p className="font-black">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{item.message || item.body}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{item.announcementType || item.announcement_type}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{item.audience}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">{item.priority}</span></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase text-cyan-700">{item.status}</span></td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{formatDate(item.publishAt || item.publish_at)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{formatDate(item.expireAt || item.expire_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black" onClick={() => openEdit(item)} type="button"><Edit className="inline h-3.5 w-3.5" /> Edit</button>
                        <button className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700" onClick={() => changeStatus(item, "published")} type="button"><Send className="inline h-3.5 w-3.5" /> Publish</button>
                        <button className="rounded-full bg-amber-100 px-3 py-2 text-xs font-black text-amber-700" onClick={() => changeStatus(item, "archived")} type="button"><Archive className="inline h-3.5 w-3.5" /> Archive</button>
                        <button className="rounded-full bg-rose-100 px-3 py-2 text-xs font-black text-rose-700" onClick={() => remove(item)} type="button"><Trash2 className="inline h-3.5 w-3.5" /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {announcements.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-sm font-bold text-slate-500" colSpan="8">
                      {loading ? "Loading announcements..." : "No announcements found."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {formOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <form className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onSubmit={submit}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-600">Announcement Form</p>
                <h2 className="text-xl font-black">{editing ? "Edit" : "Create"} Announcement</h2>
              </div>
              <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black" onClick={() => setFormOpen(false)} type="button">Close</button>
            </div>

            <div className="mt-5 grid gap-4">
              <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Title</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="title" onChange={updateForm} value={form.title} /></label>
              <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Message</span><textarea className="mt-2 min-h-36 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold leading-6 outline-none" name="message" onChange={updateForm} value={form.message} /></label>
              <div className="grid gap-4 md:grid-cols-3">
                <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Announcement Type</span><select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="announcementType" onChange={updateForm} value={form.announcementType}>{announcementTypes.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Audience</span><select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="audience" onChange={updateForm} value={form.audience}>{audiences.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
                <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Priority</span><select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="priority" onChange={updateForm} value={form.priority}>{priorities.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Publish Date</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="publishAt" onChange={updateForm} type="datetime-local" value={form.publishAt} /></label>
                <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Expire Date</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="expireAt" onChange={updateForm} type="datetime-local" value={form.expireAt} /></label>
                <label><span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span><select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateForm} value={form.status}>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              </div>
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">
                <input checked={Boolean(form.sendEmail)} name="sendEmail" onChange={updateForm} type="checkbox" />
                Send Email Toggle
              </label>
            </div>
            <button className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white" type="submit">
              <Megaphone className="h-4 w-4" />
              Save
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
