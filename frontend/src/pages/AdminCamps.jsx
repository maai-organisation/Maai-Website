import { CalendarDays, CheckCircle2, Clipboard, Download, MapPin, Plus, Search, Users, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { createEvent, getEvent, getEvents, updateEvent, updateEventParticipant, updateEventStatus } from "../services/api";

const campTypes = ["camp", "awareness", "training", "workshop", "conference", "research", "meeting", "other"];
const campStatuses = ["draft", "upcoming", "ongoing", "completed", "cancelled"];
const initialForm = {
  title: "",
  description: "",
  location: "",
  eventType: "camp",
  date: "",
  startTime: "",
  endTime: "",
  capacity: "",
  bannerUrl: "",
  whatsappGroupLink: "",
  registrationDeadline: "",
  volunteerInstructions: "",
  requiredSkills: "",
  certificateEnabled: true,
  status: "upcoming",
};

function formatDate(value) {
  if (!value) return "Date pending";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function eventDate(event) {
  return event.startDatetime || event.start_datetime || event.eventDate || event.event_date;
}

function campTabFor(camp) {
  const date = eventDate(camp) ? new Date(eventDate(camp)).getTime() : null;
  const now = Date.now();
  if (camp.status === "draft") return "draft";
  if (camp.status === "completed" || camp.status === "cancelled" || (date && date < now)) return "past";
  if (camp.status === "ongoing") return "ongoing";
  return "upcoming";
}

function statusClass(status) {
  if (status === "upcoming" || status === "published") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "ongoing") return "bg-cyan-50 text-cyan-700 ring-cyan-100";
  if (status === "draft") return "bg-sky-50 text-sky-700 ring-sky-100";
  if (status === "completed") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-amber-50 text-amber-700 ring-amber-100";
}

function toDateTime(date, time) {
  if (!date) return null;
  return `${date}T${time || "00:00"}`;
}

function AdminCampsShell({ children }) {
  return (
    <main className="min-h-screen bg-[#F6FAFB] p-4 text-slate-950 md:p-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-5">{children}</section>
    </main>
  );
}

function Hero({ onCreate, subtitle }) {
  return (
    <header className="overflow-hidden rounded-[24px] bg-gradient-to-br from-[#041C32] via-[#064663] to-[#0a3d5a] p-6 text-white shadow-[0_20px_60px_rgba(4,28,50,.24)] md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Maai Camps</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] md:text-4xl">Camps Management</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/60">{subtitle}</p>
        </div>
        {onCreate ? (
          <button className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20" onClick={onCreate} type="button">
            <Plus className="h-4 w-4" /> Create Camp
          </button>
        ) : null}
      </div>
    </header>
  );
}

function CampCard({ camp, basePath }) {
  return (
    <article className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_2px_16px_rgba(4,28,50,.07),0_1px_4px_rgba(4,28,50,.05)] transition hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(4,28,50,.13)]">
      <div className="h-36 bg-gradient-to-br from-cyan-50 via-white to-sky-50">
        {camp.bannerUrl || camp.banner_url ? <img alt="" className="h-full w-full object-cover" src={camp.bannerUrl || camp.banner_url} /> : null}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ring-1 ${statusClass(camp.status)}`}>{camp.status || "draft"}</span>
            <h2 className="mt-4 text-xl font-black tracking-[-0.02em] text-[#041C32]">{camp.title}</h2>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600"><CalendarDays className="h-5 w-5" /></div>
        </div>
        <div className="mt-5 grid gap-3 text-sm font-bold text-slate-500">
          <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-cyan-600" />{formatDate(eventDate(camp))}</span>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-600" />{camp.location || "Location pending"}</span>
          <span className="flex items-center gap-2"><Users className="h-4 w-4 text-cyan-600" />{camp.participantCount || camp.participant_count || 0} volunteers</span>
        </div>
        <Link className="mt-5 inline-flex rounded-full bg-gradient-to-r from-sky-500 to-teal-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-cyan-500/20" to={`${basePath}/${camp.id}`}>Open Details</Link>
      </div>
    </article>
  );
}

function CampForm({ onClose, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage("Camp Name is required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const saved = await createEvent({
        title: form.title,
        description: form.description,
        location: form.location,
        eventType: form.eventType,
        startDatetime: toDateTime(form.date, form.startTime),
        endDatetime: toDateTime(form.date, form.endTime),
        capacity: form.capacity,
        bannerUrl: form.bannerUrl,
        whatsappGroupLink: form.whatsappGroupLink,
        registrationDeadline: form.registrationDeadline || null,
        volunteerInstructions: form.volunteerInstructions,
        requiredSkills: form.requiredSkills,
        certificateEnabled: form.certificateEnabled,
        status: form.status,
        visibility: "members_only",
      });
      await onSaved(saved || { status: form.status });
      onClose();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Unable to create camp. Please check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4">
      <form className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl" onSubmit={submit}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-600">Create Camp</p>
            <h2 className="text-2xl font-black text-[#041C32]">New Maai Camp</h2>
          </div>
          <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black" onClick={onClose} type="button">Close</button>
        </div>
        {message ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</p> : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Camp Name *</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="title" onChange={updateField} value={form.title} /></label>
          <label className="md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Camp Description</span><textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none" name="description" onChange={updateField} value={form.description} /></label>
          <label><span className="text-xs font-black uppercase text-slate-500">Location</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="location" onChange={updateField} value={form.location} /></label>
          <label><span className="text-xs font-black uppercase text-slate-500">Camp Type</span><select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="eventType" onChange={updateField} value={form.eventType}>{campTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label><span className="text-xs font-black uppercase text-slate-500">Date</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="date" onChange={updateField} type="date" value={form.date} /></label>
          <label><span className="text-xs font-black uppercase text-slate-500">Start Time</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="startTime" onChange={updateField} type="time" value={form.startTime} /></label>
          <label><span className="text-xs font-black uppercase text-slate-500">End Time</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="endTime" onChange={updateField} type="time" value={form.endTime} /></label>
          <label><span className="text-xs font-black uppercase text-slate-500">Max Volunteers</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="capacity" onChange={updateField} type="number" value={form.capacity} /></label>
          <label className="md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Camp Banner Image</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="bannerUrl" onChange={updateField} value={form.bannerUrl} /></label>
          <label className="md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">WhatsApp Group Link</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="whatsappGroupLink" onChange={updateField} value={form.whatsappGroupLink} /></label>
          <label><span className="text-xs font-black uppercase text-slate-500">Registration Deadline</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="registrationDeadline" onChange={updateField} type="datetime-local" value={form.registrationDeadline} /></label>
          <label><span className="text-xs font-black uppercase text-slate-500">Camp Status</span><select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none" name="status" onChange={updateField} value={form.status}>{campStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label className="md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Volunteer Instructions</span><textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none" name="volunteerInstructions" onChange={updateField} value={form.volunteerInstructions} /></label>
          <label className="md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Required Skills</span><textarea className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none" name="requiredSkills" onChange={updateField} value={form.requiredSkills} /></label>
          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700"><input checked={form.certificateEnabled} name="certificateEnabled" onChange={updateField} type="checkbox" /> Certificate Eligible</label>
        </div>
        <button className="mt-5 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 px-6 py-3 text-sm font-black text-white disabled:opacity-60" disabled={saving} type="submit">
          {saving ? "Creating..." : "Create Camp"}
        </button>
      </form>
    </div>
  );
}

export default function AdminCamps() {
  const { id } = useParams();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff/camps" : "/admin/camps";
  const [camps, setCamps] = useState([]);
  const [camp, setCamp] = useState(null);
  const [tab, setTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [tabInitialized, setTabInitialized] = useState(false);

  async function loadCamps() {
    setCamps(await getEvents({ type: "camp", status: "all", direction: "asc" }));
  }
  async function handleCampSaved(saved) {
    await loadCamps();
    const status = saved?.status || "upcoming";
    setTab(status === "draft" ? "draft" : status === "completed" || status === "cancelled" ? "past" : status === "ongoing" ? "ongoing" : "upcoming");
    setMessage("Camp created successfully.");
  }
  async function loadCamp() {
    if (id) setCamp(await getEvent(id));
  }

  useEffect(() => {
    let ignore = false;
    (id ? getEvent(id) : getEvents({ type: "camp", status: "all", direction: "asc" }))
      .then((data) => { if (!ignore) id ? setCamp(data) : setCamps(data); })
      .catch(() => { if (!ignore) setMessage(id ? "Unable to load camp details." : "Unable to load camps."); });
    return () => { ignore = true; };
  }, [id]);

  const filteredCamps = useMemo(() => {
    return camps.filter((campItem) => {
      const matchesSearch = !search || `${campItem.title} ${campItem.location}`.toLowerCase().includes(search.toLowerCase());
      return matchesSearch && campTabFor(campItem) === tab;
    });
  }, [camps, search, tab]);

  useEffect(() => {
    if (id || tabInitialized || camps.length === 0) return;
    const activeTab = ["ongoing", "upcoming", "past", "draft"].find((key) => camps.some((campItem) => campTabFor(campItem) === key));
    if (activeTab) setTab(activeTab);
    setTabInitialized(true);
  }, [camps, id, tabInitialized]);

  async function changeParticipant(participant, status) {
    await updateEventParticipant(camp.id, participant.id, { participationStatus: status });
    setMessage(`Volunteer ${status}.`);
    await loadCamp();
  }

  async function markCompleted() {
    await updateEventStatus(camp.id, "completed");
    setMessage("Camp completed. Eligible certificates were created.");
    await loadCamp();
  }

  function participantRows(statuses) {
    return (camp?.participants || []).filter((item) => statuses.includes(item.participationStatus || item.participation_status));
  }

  function exportCsv() {
    const rows = [["Name", "Phone", "College", "Status"], ...(camp?.participants || []).map((item) => [item.fullName || item.full_name || "", item.phone || "", item.college || "", item.participationStatus || item.participation_status || "pending"])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `maai-camp-${camp?.id || "participants"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyAllNumbers() {
    const phones = (camp?.participants || []).map((item) => item.phone).filter(Boolean).join("\n");
    if (phones) await navigator.clipboard?.writeText(phones);
    setMessage("Copied to clipboard.");
  }

  if (id) {
    const pending = participantRows(["pending"]);
    const approved = participantRows(["approved", "registered", "participated", "completed"]);
    return (
      <AdminCampsShell>
        <Hero subtitle="Approve registrations, review camp information, and export volunteer contacts." />
        {message ? <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-700">{message}</div> : null}
        {!camp ? <div className="rounded-[20px] bg-white p-6 font-bold text-slate-500 shadow-sm">Loading camp details...</div> : (
          <>
            <section className="rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(4,28,50,.07)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ring-1 ${statusClass(camp.status)}`}>{camp.status}</span>
                  <h2 className="mt-3 text-2xl font-black text-[#041C32]">{camp.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">{camp.description || "No description added."}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-black text-white" onClick={markCompleted} type="button">Mark Completed</button>
                  <Link className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-600" to={basePath}>Back to Camps</Link>
                </div>
              </div>
              <div className="mt-5 grid gap-3 text-sm font-bold text-slate-600 md:grid-cols-3">
                <span className="rounded-2xl bg-slate-50 p-4"><CalendarDays className="mb-2 h-4 w-4 text-cyan-600" />{formatDate(eventDate(camp))}</span>
                <span className="rounded-2xl bg-slate-50 p-4"><MapPin className="mb-2 h-4 w-4 text-cyan-600" />{camp.location || "Location pending"}</span>
                <span className="rounded-2xl bg-slate-50 p-4"><Users className="mb-2 h-4 w-4 text-cyan-600" />{approved.length} approved volunteers</span>
              </div>
            </section>

            <ParticipantTable onAction={changeParticipant} rows={pending} title="Pending Volunteers" />
            <section className="rounded-[20px] border border-slate-200/80 bg-white shadow-[0_2px_16px_rgba(4,28,50,.07)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <h3 className="text-lg font-black text-[#041C32]">Approved Volunteers</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full bg-cyan-50 px-4 py-2 text-xs font-black text-cyan-700" onClick={copyAllNumbers} type="button"><Clipboard className="inline h-3.5 w-3.5" /> Copy All Numbers</button>
                  <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white" onClick={exportCsv} type="button"><Download className="inline h-3.5 w-3.5" /> Export CSV</button>
                </div>
              </div>
              <ParticipantTable compact rows={approved} />
            </section>
          </>
        )}
      </AdminCampsShell>
    );
  }

  return (
    <AdminCampsShell>
      <Hero onCreate={() => setFormOpen(true)} subtitle="Create and manage camp events using the existing Maai event system." />
      {formOpen ? <CampForm onClose={() => setFormOpen(false)} onSaved={handleCampSaved} /> : null}
      {message ? <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-700">{message}</div> : null}
      <section className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_2px_16px_rgba(4,28,50,.07)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap rounded-2xl bg-slate-100 p-1">
            {[["ongoing", "Ongoing Camps"], ["upcoming", "Upcoming Camps"], ["past", "Past Camps"], ["draft", "Draft Camps"]].map(([key, label]) => (
              <button className={`rounded-xl px-4 py-2 text-sm font-black ${tab === key ? "bg-white text-[#041C32] shadow-sm" : "text-slate-500"}`} key={key} onClick={() => setTab(key)} type="button">{label}</button>
            ))}
          </div>
          <label className="relative md:w-80"><Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" /><input className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold outline-none focus:border-cyan-400" onChange={(event) => setSearch(event.target.value)} placeholder="Search camps" value={search} /></label>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredCamps.map((campItem) => <CampCard basePath={basePath} camp={campItem} key={campItem.id} />)}</div>
      {filteredCamps.length === 0 ? <div className="rounded-[20px] bg-white p-8 text-center font-bold text-slate-400 shadow-sm">No camps found for this view.</div> : null}
    </AdminCampsShell>
  );
}

function ParticipantTable({ compact = false, onAction, rows, title }) {
  const table = (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">College</th><th className="px-5 py-4">Status</th>{!compact ? <th className="px-5 py-4">Actions</th> : null}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((participant) => (
            <tr key={participant.id}>
              <td className="px-5 py-4 font-black">{participant.fullName || participant.full_name}</td>
              <td className="px-5 py-4 font-semibold text-slate-600">{participant.phone || "-"}</td>
              <td className="px-5 py-4 font-semibold text-slate-600">{participant.college || "-"}</td>
              <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">{participant.participationStatus || participant.participation_status || "pending"}</span></td>
              {!compact ? (
                <td className="px-5 py-4"><div className="flex gap-2"><button className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700" onClick={() => onAction(participant, "approved")} type="button"><CheckCircle2 className="inline h-3.5 w-3.5" /> Approve</button><button className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700" onClick={() => onAction(participant, "rejected")} type="button"><XCircle className="inline h-3.5 w-3.5" /> Reject</button></div></td>
              ) : null}
            </tr>
          ))}
          {rows.length === 0 ? <tr><td className="px-5 py-8 text-center font-bold text-slate-400" colSpan={compact ? 4 : 5}>No volunteers in this list.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
  if (compact) return table;
  return <section className="rounded-[20px] border border-slate-200/80 bg-white shadow-[0_2px_16px_rgba(4,28,50,.07)]"><h3 className="border-b border-slate-100 p-5 text-lg font-black text-[#041C32]">{title}</h3>{table}</section>;
}
