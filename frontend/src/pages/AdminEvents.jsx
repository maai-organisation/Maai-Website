import { Award, CalendarDays, CheckCircle2, Edit3, Menu, Search, Trash2, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  addEventParticipant,
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  getEventVolunteers,
  getCMSItems,
  issueEventCertificates,
  removeEventParticipant,
  updateEvent,
  updateEventParticipant,
  updateEventStatus,
} from "../services/api";

const eventTypes = ["camp", "workshop", "awareness", "conference", "research", "meeting", "training", "other"];
const visibilities = ["public", "members_only", "internal"];
const statuses = ["draft", "published", "completed", "cancelled", "archived"];

const initialEvent = {
  title: "",
  slug: "",
  eventType: "camp",
  description: "",
  bannerUrl: "",
  location: "",
  startDatetime: "",
  endDatetime: "",
  capacity: "",
  visibility: "members_only",
  certificateEnabled: true,
  initiativeId: "",
  certificateTemplateId: "",
  status: "draft",
};

const initialParticipant = {
  volunteerId: "",
  participationStatus: "registered",
};

const initialFilters = { search: "", type: "all", status: "all", visibility: "all", certificateEnabled: "all" };

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function StatusPill({ status }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-600">
      {status || "draft"}
    </span>
  );
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [certificateTemplates, setCertificateTemplates] = useState([]);
  const [form, setForm] = useState(initialEvent);
  const [participantForm, setParticipantForm] = useState(initialParticipant);
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const baseEventPath = location.pathname.startsWith("/staff") ? "/staff/events" : "/admin/events";

  const issuedVolunteerIds = useMemo(
    () => new Set((selectedEvent?.certificates || []).map((certificate) => certificate.volunteerId)),
    [selectedEvent],
  );

  async function loadEvents(nextFilters = filters) {
    const data = await getEvents(nextFilters);
    setEvents(data);
    if (!selectedEvent && data[0]) setSelectedEvent(await getEvent(data[0].id));
  }

  async function refreshSelected(id = selectedEvent?.id) {
    if (!id) return;
    setSelectedEvent(await getEvent(id));
  }

  useEffect(() => {
    let ignore = false;
    const timer = window.setTimeout(() => {
      Promise.all([getEvents(initialFilters), getEventVolunteers(), getCMSItems("certificate-templates", { status: "published", limit: 100 })])
        .then(async ([nextEvents, nextVolunteers, nextTemplates]) => {
          if (ignore) return;
          setEvents(nextEvents);
          setVolunteers(nextVolunteers);
          setCertificateTemplates(nextTemplates.items || []);
          if (nextEvents[0]) {
            const event = await getEvent(nextEvents[0].id);
            if (!ignore) setSelectedEvent(event);
          }
        })
        .catch(() => {
          if (!ignore) setMessage("Unable to load events.");
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

  function updateForm(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "title" && !current.slug ? { slug: slugify(value) } : {}),
    }));
  }

  function updateFilter(event) {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    window.setTimeout(() => loadEvents(nextFilters).catch(() => setMessage("Unable to filter events.")), 0);
  }

  function editEvent(eventItem) {
    setSelectedEvent(eventItem);
    setForm({
      title: eventItem.title || "",
      slug: eventItem.slug || "",
      eventType: eventItem.eventType || eventItem.event_type || "other",
      description: eventItem.description || "",
      bannerUrl: eventItem.bannerUrl || eventItem.banner_url || "",
      location: eventItem.location || "",
      startDatetime: eventItem.startDatetime ? String(eventItem.startDatetime).slice(0, 16) : "",
      endDatetime: eventItem.endDatetime ? String(eventItem.endDatetime).slice(0, 16) : "",
      capacity: eventItem.capacity || "",
      visibility: eventItem.visibility || "members_only",
      certificateEnabled: Boolean(eventItem.certificateEnabled),
      initiativeId: eventItem.initiativeId || "",
      certificateTemplateId: eventItem.certificateTemplateId || eventItem.certificate_template_id || "",
      status: eventItem.status || "draft",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = { ...form, startDatetime: form.startDatetime || null, endDatetime: form.endDatetime || null };
    const saved = selectedEvent ? await updateEvent(selectedEvent.id, payload) : await createEvent(payload);
    setMessage(selectedEvent ? "Event updated." : "Event created.");
    setForm(initialEvent);
    setSelectedEvent(await getEvent(saved.id));
    await loadEvents();
  }

  async function handleStatus(status) {
    const updated = await updateEventStatus(selectedEvent.id, status);
    setMessage(`Event marked ${status}.`);
    setSelectedEvent(await getEvent(updated.id));
    await loadEvents();
  }

  async function handleDelete(id) {
    await deleteEvent(id);
    setSelectedEvent(null);
    setMessage("Event deleted.");
    await loadEvents();
  }

  async function handleAddParticipant(event) {
    event.preventDefault();
    await addEventParticipant(selectedEvent.id, participantForm);
    setParticipantForm(initialParticipant);
    setMessage("Participant saved.");
    await refreshSelected();
  }

  async function handleParticipantChange(participant, field, value) {
    await updateEventParticipant(selectedEvent.id, participant.id, {
      participationStatus: field === "participationStatus" ? value : participant.participationStatus,
    });
    setMessage("Participant updated.");
    await refreshSelected();
  }

  async function handleIssueCertificates() {
    await issueEventCertificates(selectedEvent.id, selectedCertificates);
    setMessage("Certificates issued as eligible.");
    setSelectedCertificates([]);
    await refreshSelected();
  }

  function toggleCertificateVolunteer(id) {
    setSelectedCertificates((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const sidebar = (
    <aside className="flex h-full w-[280px] shrink-0 flex-col bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
      <div className="flex items-center gap-3">
        <img alt="" className="h-10 w-10 rounded-2xl bg-white shadow-sm" src="/Favicon.ico" />
        <div>
          <p className="text-sm font-black">Maai Events</p>
          <p className="text-xs font-bold text-white/50">Operational core</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white/80">
          <Search className="h-4 w-4 text-white/40" />
          <input
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/40"
            name="search"
            onChange={updateFilter}
            placeholder="Search events"
            value={filters.search}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select className="h-11 rounded-2xl bg-white px-3 text-sm font-bold text-slate-900" name="type" onChange={updateFilter} value={filters.type}>
            <option value="all">All types</option>
            {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select className="h-11 rounded-2xl bg-white px-3 text-sm font-bold text-slate-900" name="status" onChange={updateFilter} value={filters.status}>
            <option value="all">All status</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select className="h-11 rounded-2xl bg-white px-3 text-sm font-bold text-slate-900" name="visibility" onChange={updateFilter} value={filters.visibility}>
            <option value="all">Visibility</option>
            {visibilities.map((visibility) => <option key={visibility} value={visibility}>{visibility}</option>)}
          </select>
          <select className="h-11 rounded-2xl bg-white px-3 text-sm font-bold text-slate-900" name="certificateEnabled" onChange={updateFilter} value={filters.certificateEnabled}>
            <option value="all">Certificates</option>
            <option value="enabled">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-3 overflow-y-auto pr-1">
        {loading ? <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white/60">Loading events...</p> : null}
        {events.map((event) => (
          <button
            className={`w-full rounded-2xl px-4 py-4 text-left text-sm font-bold transition ${
              selectedEvent?.id === event.id ? "bg-white text-slate-950 shadow-sm" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            key={event.id}
            onClick={() => { refreshSelected(event.id); setMobileMenuOpen(false); }}
            type="button"
          >
            <span className="block">{event.title}</span>
            <span className="mt-1 block text-xs opacity-60">{formatDate(event.startDatetime)}</span>
          </button>
        ))}
      </div>
    </aside>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-cyan-50/50 text-slate-950">
      <div className="flex min-h-screen">
        <div className="sticky top-0 hidden h-screen w-[280px] shrink-0 lg:block">
          {sidebar}
        </div>
        <div className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity lg:hidden ${mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setMobileMenuOpen(false)} />
        <div className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="relative h-full">
            <button className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white" onClick={() => setMobileMenuOpen(false)} type="button">
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </div>
        </div>

        <section className="min-w-0 flex-1 px-4 py-5 md:px-8">
          <header className="sticky top-4 z-30 flex items-center justify-between gap-4 rounded-[24px] border border-white/70 bg-white/88 px-4 py-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl md:px-6">
            <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-100 bg-white text-slate-700 lg:hidden" onClick={() => setMobileMenuOpen(true)} type="button">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Event Management</p>
              <h1 className="truncate text-xl font-black md:text-2xl">Events, participation, certificates</h1>
            </div>
            <div className="hidden h-11 min-w-64 flex-1 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-400 xl:flex">
              <Search className="h-4 w-4" />
              <span>Search events from the sidebar</span>
            </div>
            <button className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-cyan-700" onClick={() => { setSelectedEvent(null); setForm(initialEvent); }} type="button">
              <CalendarDays className="h-4 w-4" />
              New Event
            </button>
          </header>

          {message ? <p className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{message}</p> : null}

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <form className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-8" onSubmit={handleSubmit}>
              <h2 className="flex items-center gap-2 text-lg font-black"><Edit3 className="h-5 w-5" /> {selectedEvent ? "Edit event" : "Create event"}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Title</span>
                  <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="title" onChange={updateForm} value={form.title} />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Slug</span>
                  <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="slug" onChange={updateForm} value={form.slug} />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Event Type</span>
                  <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="eventType" onChange={updateForm} value={form.eventType}>
                    {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Location</span>
                  <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="location" onChange={updateForm} value={form.location} />
                </label>
                <label className="md:col-span-2">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Banner URL</span>
                  <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="bannerUrl" onChange={updateForm} type="url" value={form.bannerUrl} />
                </label>
                {form.bannerUrl ? <img alt="" className="h-40 rounded-xl object-cover md:col-span-2" src={form.bannerUrl} /> : null}
                <label className="md:col-span-2">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Description</span>
                  <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none" name="description" onChange={updateForm} value={form.description} />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Start DateTime</span>
                  <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="startDatetime" onChange={updateForm} type="datetime-local" value={form.startDatetime} />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">End DateTime</span>
                  <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="endDatetime" onChange={updateForm} type="datetime-local" value={form.endDatetime} />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Capacity</span>
                  <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="capacity" onChange={updateForm} type="number" value={form.capacity} />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Related Initiative</span>
                  <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="initiativeId" onChange={updateForm} placeholder="Initiative ID" value={form.initiativeId} />
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Certificate Template</span>
                  <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="certificateTemplateId" onChange={updateForm} value={form.certificateTemplateId}>
                    <option value="">Default template</option>
                    {certificateTemplates.map((template) => (
                      <option key={template.id} value={template.id}>{template.name} / {template.certificateType || template.certificate_type}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Visibility</span>
                  <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="visibility" onChange={updateForm} value={form.visibility}>
                    {visibilities.map((visibility) => <option key={visibility} value={visibility}>{visibility}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Status</span>
                  <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateForm} value={form.status}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
              </div>
              <label className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-black text-slate-700">
                <input checked={form.certificateEnabled} name="certificateEnabled" onChange={updateForm} type="checkbox" />
                Certificate Enabled
              </label>
              <button className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white" type="submit">
                {selectedEvent ? "Save Event" : "Create Event"}
              </button>
            </form>

            <div className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
              {selectedEvent ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black">{selectedEvent.title}</h2>
                      <p className="mt-2 text-sm font-semibold text-slate-500">{selectedEvent.location || "-"} / {formatDate(selectedEvent.startDatetime)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusPill status={selectedEvent.status} />
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-700">{selectedEvent.eventType}</span>
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-600">{selectedEvent.visibility}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-700" onClick={() => editEvent(selectedEvent)} type="button">Edit</button>
                      <button className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700" onClick={() => handleStatus("published")} type="button">Publish</button>
                      <button className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700" onClick={() => handleStatus("completed")} type="button">Complete</button>
                      <button className="rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-700" onClick={() => handleStatus("archived")} type="button">Archive</button>
                      <button className="rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-rose-700" onClick={() => handleDelete(selectedEvent.id)} type="button"><Trash2 className="inline h-4 w-4" /> Delete</button>
                    </div>
                  </div>

                  <section className="mt-8">
                    <h3 className="flex items-center gap-2 text-lg font-black"><Users className="h-5 w-5" /> Participants</h3>
                    <form className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_90px]" onSubmit={handleAddParticipant}>
                      <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold" name="volunteerId" onChange={(event) => setParticipantForm((current) => ({ ...current, volunteerId: event.target.value }))} value={participantForm.volunteerId}>
                        <option value="">Add participant</option>
                        {volunteers.map((volunteer) => <option key={volunteer.id} value={volunteer.id}>{volunteer.full_name} / {volunteer.email}</option>)}
                      </select>
                      <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold" name="participationStatus" onChange={(event) => setParticipantForm((current) => ({ ...current, participationStatus: event.target.value }))} value={participantForm.participationStatus}>
                        <option value="registered">registered</option>
                        <option value="participated">participated</option>
                        <option value="completed">completed</option>
                      </select>
                      <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-black text-white" type="submit"><UserPlus className="h-4 w-4" /> Add</button>
                    </form>

                    <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-100">
                      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Participation</th>
                            <th className="px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white font-semibold text-slate-600">
                          {(selectedEvent.participants || []).map((participant) => (
                            <tr className="transition hover:bg-cyan-50/40" key={participant.id}>
                              <td className="border-t border-slate-100 px-4 py-4">{participant.fullName}</td>
                              <td className="border-t border-slate-100 px-4 py-4">{participant.email}</td>
                              <td className="px-4 py-3">
                                <select className="h-9 rounded-lg border border-slate-200 px-2" onChange={(event) => handleParticipantChange(participant, "participationStatus", event.target.value)} value={participant.participationStatus || participant.attendanceStatus}>
                                  <option value="registered">registered</option>
                                  <option value="participated">participated</option>
                                  <option value="completed">completed</option>
                                </select>
                              </td>
                              <td className="border-t border-slate-100 px-4 py-4">
                                <button className="text-rose-600" onClick={() => removeEventParticipant(selectedEvent.id, participant.id).then(() => refreshSelected())} type="button">Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="flex items-center gap-2 text-lg font-black"><Award className="h-5 w-5" /> Certificates</h3>
                      <Link className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-700" to={`${baseEventPath}/${selectedEvent.id}/certificates`}>
                        Open certificate table
                      </Link>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {(selectedEvent.participants || []).map((participant) => (
                        <label className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 text-sm font-bold" key={participant.id}>
                          <span>
                            <span className="block">{participant.fullName}</span>
                            <span className="text-xs text-slate-400">{issuedVolunteerIds.has(participant.volunteerId) ? "Issued" : participant.participationStatus || participant.attendanceStatus}</span>
                          </span>
                          <input checked={selectedCertificates.includes(participant.volunteerId)} disabled={issuedVolunteerIds.has(participant.volunteerId)} onChange={() => toggleCertificateVolunteer(participant.volunteerId)} type="checkbox" />
                        </label>
                      ))}
                    </div>
                    <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white disabled:opacity-40" disabled={selectedCertificates.length === 0 || !selectedEvent.certificateEnabled} onClick={handleIssueCertificates} type="button">
                      <CheckCircle2 className="h-4 w-4" />
                      Issue Certificates
                    </button>
                  </section>
                </>
              ) : (
                <p className="text-sm font-bold text-slate-500">Select or create an event.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
