import {
  Archive,
  Bell,
  CalendarClock,
  Edit,
  Eye,
  LayoutDashboard,
  Megaphone,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  getAdminAnnouncements,
  getEvents,
  updateAdminAnnouncement,
  updateAdminAnnouncementStatus,
} from "../services/api";

/* ─── Design tokens ─────────────────────────────────────────────────────────── */
const C = {
  bg:        "#F0F4F8",
  card:      "#FFFFFF",
  navy:      "#0B1E33",
  navyMid:   "#0D3050",
  navyLight: "#0E4272",
  accent:    "#00C2CB",
  accentSoft:"#E0F9FA",
  text:      "#0B1E33",
  muted:     "#64748B",
  border:    "rgba(11,30,51,.10)",
  shadow:    "0 2px 20px rgba(11,30,51,.08)",
  shadowLg:  "0 12px 48px rgba(11,30,51,.16)",
};

const pill = (bg, color, border) => ({
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "2px 10px", borderRadius: 999, fontSize: 10,
  fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase",
  background: bg, color, border: `1.5px solid ${border}`,
});

const priorityStyle = (p) => {
  if (p === "urgent")    return pill("#FFF0F0", "#C0392B", "#FFC5C5");
  if (p === "important") return pill("#FFFBEA", "#92600A", "#FFE082");
  return pill("#E8FAFB", "#076E74", "#9AE8EC");
};

const statusStyle = (s) => {
  if (s === "published") return pill("#EAFAF1", "#1A7A45", "#A8E6C3");
  if (s === "archived")  return pill("#F1F3F5", "#526070", "#C8D6E2");
  return pill("#EEF4FF", "#2B5BE0", "#BCCEFF");
};

const typeStyle = () => pill("#F5F0FF", "#5B30CC", "#D4C0FF");
const audienceStyle = () => pill("#F0F8FF", "#1A6BA0", "#B3DCFF");

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const initialForm = {
  title: "", message: "", announcementType: "general", audience: "all",
  eventId: "", priority: "info", sendEmail: false, publishAt: "", expireAt: "", status: "draft",
};
const announcementTypes = ["general", "membership", "event", "camp", "certificate", "system"];
const audiences         = ["all", "volunteers", "ngos", "admins", "event_participants"];
const priorities        = ["info", "important", "urgent"];
const statuses          = ["draft", "published", "archived"];

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function audienceLabel(value) {
  return value === "event_participants" ? "event participants" : value;
}

/* ─── Sub-components ─────────────────────────────────────────────────────────── */
function StatCard({ label, value, Icon, from, to }) {
  return (
    <div style={{
      background: C.card, borderRadius: 20, border: `1px solid ${C.border}`,
      boxShadow: C.shadow, padding: "20px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      transition: "transform .2s, box-shadow .2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = C.shadowLg; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = C.shadow; }}
    >
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{label}</p>
        <p style={{ fontSize: 34, fontWeight: 900, color: C.text, lineHeight: 1 }}>{value}</p>
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        display: "grid", placeItems: "center",
        boxShadow: `0 6px 20px ${from}55`,
      }}>
        <Icon size={20} color="#fff" />
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", height: 44, borderRadius: 12,
  border: `1.5px solid ${C.border}`, background: "#F8FAFC",
  padding: "0 14px", fontSize: 13, fontWeight: 600, color: C.text,
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color .15s, box-shadow .15s",
};
const labelStyle = {
  fontSize: 11, fontWeight: 800, letterSpacing: ".12em",
  textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 6,
};

function Field({ label, children }) {
  return <label style={{ display: "block" }}><span style={labelStyle}>{label}</span>{children}</label>;
}

function ActionBtn({ onClick, color, bg, hoverBg, Icon: Ic, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} type="button" style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer",
      fontSize: 11, fontWeight: 800, letterSpacing: ".04em",
      background: hov ? hoverBg : bg, color,
      transition: "background .15s, transform .1s",
      transform: hov ? "scale(1.04)" : "scale(1)",
    }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <Ic size={12} />{children}
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function AdminAnnouncements({ roleLabel = "Admin" }) {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents]               = useState([]);
  const [filters, setFilters]             = useState({ search: "", audience: "any", status: "all" });
  const [form, setForm]                   = useState(initialForm);
  const [editing, setEditing]             = useState(null);
  const [previewing, setPreviewing]       = useState(null);
  const [formOpen, setFormOpen]           = useState(false);
  const [message, setMessage]             = useState("");
  const [loading, setLoading]             = useState(false);
  const isStaffView = String(roleLabel).toLowerCase() === "staff";
  const dashboardPath = isStaffView ? "/staff" : "/admin";
  const dashboardLabel = isStaffView ? "Staff Dashboard" : "Admin Dashboard";

  const loadAnnouncements = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    try { setAnnouncements(await getAdminAnnouncements(nextFilters)); }
    catch (error) { setMessage(error?.response?.data?.message || "Unable to load announcements."); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadAnnouncements(), 0);
    getEvents({ limit: 100 }).then(setEvents).catch(() => setEvents([]));
    return () => window.clearTimeout(timer);
  }, [loadAnnouncements]);

  const stats = useMemo(() => {
    const now = Date.now();
    return {
      total:     announcements.length,
      unread:    announcements.reduce((sum, item) => sum + Number(item.unreadCount || item.unread_count || 0), 0),
      urgent:    announcements.filter((item) => item.priority === "urgent").length,
      scheduled: announcements.filter((item) => item.status === "draft" && item.publishAt && new Date(item.publishAt).getTime() > now).length,
    };
  }, [announcements]);

  function updateFilter(e) {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    setFilters(next);
    window.setTimeout(() => loadAnnouncements(next), 0);
  }
  function updateForm(e) {
    const { checked, name, type, value } = e.target;
    setForm((c) => ({ ...c, [name]: type === "checkbox" ? checked : value }));
    setMessage("");
  }
  function openCreate() { setEditing(null); setForm(initialForm); setFormOpen(true); }
  function openEdit(item) {
    setEditing(item);
    setForm({
      title: item.title || "", message: item.message || item.body || "",
      announcementType: item.announcementType || item.announcement_type || "general",
      audience: item.audience || "all", eventId: item.eventId || item.event_id || "",
      priority: item.priority || "info", sendEmail: Boolean(item.sendEmail || item.send_email),
      publishAt: toDatetimeLocal(item.publishAt || item.publish_at),
      expireAt:  toDatetimeLocal(item.expireAt  || item.expire_at),
      status: item.status || "draft",
    });
    setFormOpen(true);
  }
  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, eventId: form.audience === "event_participants" ? form.eventId : null };
    const response = editing ? await updateAdminAnnouncement(editing.id, payload) : await createAdminAnnouncement(payload);
    const meta = response?.meta || {};
    setMessage(`${editing ? "Announcement updated" : "Announcement saved"}. ${meta.notificationsCreated || 0} notifications, ${meta.emailsQueued || 0} email attempts.`);
    setFormOpen(false); setEditing(null); setForm(initialForm);
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

  /* ── Render ── */
  return (
    <main style={{ minHeight: "100vh", background: C.bg, padding: "28px 24px", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        select, input, textarea { font-family: inherit; }
        input:focus, select:focus, textarea:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accent}22 !important; outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #C8D6E2; border-radius: 99px; }
        .ann-card:hover { transform: translateY(-2px); box-shadow: ${C.shadowLg} !important; }
        .ann-card { transition: transform .2s, box-shadow .2s; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 24 }}>

        {/* ── Hero header ── */}
        <header style={{
          borderRadius: 24, overflow: "hidden", position: "relative",
          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 50%, ${C.navyLight} 100%)`,
          padding: "36px 40px", color: "#fff",
          boxShadow: "0 20px 60px rgba(11,30,51,.28)",
        }}>
          {/* decorative circles */}
          <div style={{ position:"absolute", top:-60, right:80, width:200, height:200, borderRadius:"50%", background:"rgba(0,194,203,.13)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-40, right:-20, width:140, height:140, borderRadius:"50%", background:"rgba(0,194,203,.08)", pointerEvents:"none" }} />

          <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:10, fontWeight:900, letterSpacing:".22em", textTransform:"uppercase", color: C.accent, marginBottom:10 }}>
                {roleLabel} Communications
              </p>
              <h1 style={{ fontSize:36, fontWeight:900, margin:0, lineHeight:1.1, letterSpacing:"-.5px" }}>Announcement Center</h1>
              <p style={{ marginTop:10, fontSize:13, fontWeight:500, color:"rgba(255,255,255,.6)", maxWidth:520, lineHeight:1.7 }}>
                Broadcast updates to members, staff, NGOs, or event participants using the existing Maai notification and email system.
              </p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", justifyContent:"flex-end" }}>
              <Link to={dashboardPath} style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:"rgba(255,255,255,.12)", color:"#fff", textDecoration:"none",
                border:"1px solid rgba(255,255,255,.22)", borderRadius:14, padding:"12px 18px",
                fontSize:13, fontWeight:900, cursor:"pointer", flexShrink:0,
                boxShadow:"0 8px 24px rgba(0,0,0,.12)",
              }}>
                <LayoutDashboard size={16} /> {dashboardLabel}
              </Link>
              <button onClick={openCreate} type="button" style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background: C.accent, color: C.navy,
                border:"none", borderRadius:14, padding:"12px 22px",
                fontSize:13, fontWeight:900, cursor:"pointer", flexShrink:0,
                boxShadow:"0 8px 24px rgba(0,194,203,.35)",
                transition:"transform .15s, box-shadow .15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(0,194,203,.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,194,203,.35)"; }}
              >
                <Plus size={16} /> Compose
              </button>
            </div>
          </div>
        </header>

        {/* ── Stat cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:16 }}>
          <StatCard label="Total"     value={stats.total}     Icon={Megaphone}    from="#0EA5E9" to="#06B6D4" />
          <StatCard label="Unread"    value={stats.unread}    Icon={Bell}         from="#06B6D4" to="#14B8A6" />
          <StatCard label="Urgent"    value={stats.urgent}    Icon={Send}         from="#F43F5E" to="#FB923C" />
          <StatCard label="Scheduled" value={stats.scheduled} Icon={CalendarClock} from="#8B5CF6" to="#3B82F6" />
        </div>

        {/* ── Message banner ── */}
        {message && (
          <div style={{
            background:"#E8FAFB", border:`1.5px solid ${C.accent}55`, borderRadius:14,
            padding:"12px 18px", fontSize:13, fontWeight:700, color:"#076E74",
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            {message}
            <button onClick={() => setMessage("")} type="button" style={{ background:"none", border:"none", cursor:"pointer", color: C.muted, lineHeight:1 }}><X size={14} /></button>
          </div>
        )}

        {/* ── Search + filters ── */}
        <div style={{
          background: C.card, borderRadius: 20, border:`1px solid ${C.border}`,
          boxShadow: C.shadow, padding:"18px 20px",
          display:"grid", gridTemplateColumns:"1fr auto auto", gap:12, alignItems:"center",
        }}>
          <div style={{ position:"relative" }}>
            <Search size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color: C.muted, pointerEvents:"none" }} />
            <input
              name="search" value={filters.search} onChange={updateFilter}
              placeholder="Search announcements…"
              style={{ ...inputStyle, paddingLeft:40 }}
            />
          </div>
          <select name="audience" value={filters.audience} onChange={updateFilter} style={{ ...inputStyle, width:"auto", minWidth:150 }}>
            <option value="any">All audiences</option>
            {audiences.map((v) => <option key={v} value={v}>{audienceLabel(v)}</option>)}
          </select>
          <select name="status" value={filters.status} onChange={updateFilter} style={{ ...inputStyle, width:"auto", minWidth:140 }}>
            <option value="all">All statuses</option>
            {statuses.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* ── Announcement list ── */}
        <div style={{ display:"grid", gap:12 }}>
          {loading && (
            <div style={{ background: C.card, borderRadius:20, padding:"40px 24px", textAlign:"center", color: C.muted, fontSize:13, fontWeight:700 }}>
              Loading announcements…
            </div>
          )}
          {!loading && announcements.length === 0 && (
            <div style={{ background: C.card, borderRadius:20, padding:"56px 24px", textAlign:"center" }}>
              <Megaphone size={36} style={{ color:"#C8D6E2", marginBottom:12 }} />
              <p style={{ color: C.muted, fontSize:14, fontWeight:700, margin:0 }}>No announcements found.</p>
            </div>
          )}
          {announcements.map((item) => (
            <article key={item.id} className="ann-card" style={{
              background: C.card, borderRadius:20, border:`1px solid ${C.border}`,
              boxShadow: C.shadow, padding:"20px 24px",
            }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20, flexWrap:"wrap" }}>
                {/* Left: content */}
                <div style={{ flex:1, minWidth:0 }}>
                  {/* Pills row */}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                    <span style={priorityStyle(item.priority)}>{item.priority}</span>
                    <span style={audienceStyle()}>{audienceLabel(item.audience)}</span>
                    <span style={typeStyle()}>{item.announcementType || item.announcement_type}</span>
                    <span style={statusStyle(item.status)}>{item.status}</span>
                  </div>
                  <h2 style={{ fontSize:18, fontWeight:900, margin:"0 0 8px", letterSpacing:"-.2px", lineHeight:1.2 }}>{item.title}</h2>
                  <p style={{ fontSize:13, fontWeight:500, color: C.muted, margin:"0 0 14px", lineHeight:1.7, maxWidth:700 }}>
                    {item.message || item.body}
                  </p>
                  {/* Meta */}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:16, fontSize:11, fontWeight:700, color:"#94A3B8" }}>
                    <span>📅 Publish: {formatDate(item.publishAt || item.publish_at)}</span>
                    <span>⏳ Expire: {formatDate(item.expireAt || item.expire_at)}</span>
                    {(item.eventId || item.event_id) && <span>🎫 Event #{item.eventId || item.event_id}</span>}
                    <span>👁 {Number(item.unreadCount || item.unread_count || 0)} unread</span>
                  </div>
                </div>

                {/* Right: actions */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, flexShrink:0, alignItems:"flex-start", paddingTop:2 }}>
                  <ActionBtn onClick={() => setPreviewing(item)} Icon={Eye}     color="#475569" bg="#F1F5F9" hoverBg="#E2E8F0">Preview</ActionBtn>
                  <ActionBtn onClick={() => openEdit(item)}     Icon={Edit}    color="#475569" bg="#F1F5F9" hoverBg="#E2E8F0">Edit</ActionBtn>
                  <ActionBtn onClick={() => changeStatus(item, "published")} Icon={Send}  color="#166534" bg="#DCFCE7" hoverBg="#BBF7D0">Publish</ActionBtn>
                  <ActionBtn onClick={() => changeStatus(item, "archived")}  Icon={Archive} color="#92400E" bg="#FEF3C7" hoverBg="#FDE68A">Archive</ActionBtn>
                  <ActionBtn onClick={() => remove(item)}       Icon={Trash2} color="#9F1239" bg="#FFE4E6" hoverBg="#FECDD3">Delete</ActionBtn>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ── Compose / Edit modal ── */}
      {formOpen && (
        <div style={{
          position:"fixed", inset:0, zIndex:100,
          background:"rgba(11,30,51,.65)", backdropFilter:"blur(6px)",
          display:"grid", placeItems:"center", padding:20,
        }}>
          <form onSubmit={submit} style={{
            background: C.card, borderRadius:24, padding:"32px 36px",
            width:"100%", maxWidth:740, maxHeight:"92vh", overflowY:"auto",
            boxShadow:"0 32px 80px rgba(11,30,51,.28)",
          }}>
            {/* Modal header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, paddingBottom:20, borderBottom:`1px solid ${C.border}` }}>
              <div>
                <p style={{ fontSize:10, fontWeight:900, letterSpacing:".18em", textTransform:"uppercase", color: C.accent, marginBottom:6 }}>Compose</p>
                <h2 style={{ fontSize:24, fontWeight:900, margin:0 }}>{editing ? "Edit Announcement" : "New Announcement"}</h2>
              </div>
              <button onClick={() => setFormOpen(false)} type="button" style={{ width:36, height:36, borderRadius:10, border:"none", background:"#F1F5F9", color: C.muted, cursor:"pointer", display:"grid", placeItems:"center" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display:"grid", gap:18 }}>
              <Field label="Title">
                <input name="title" value={form.title} onChange={updateForm} style={inputStyle} />
              </Field>
              <Field label="Message">
                <textarea name="message" value={form.message} onChange={updateForm} style={{ ...inputStyle, height:120, resize:"vertical", padding:"10px 14px" }} />
              </Field>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:14 }}>
                <Field label="Type">
                  <select name="announcementType" value={form.announcementType} onChange={updateForm} style={inputStyle}>
                    {announcementTypes.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Audience">
                  <select name="audience" value={form.audience} onChange={updateForm} style={inputStyle}>
                    {audiences.map((v) => <option key={v} value={v}>{audienceLabel(v)}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select name="priority" value={form.priority} onChange={updateForm} style={inputStyle}>
                    {priorities.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
              </div>

              {form.audience === "event_participants" && (
                <Field label="Selected Event">
                  <select name="eventId" value={form.eventId} onChange={updateForm} style={inputStyle}>
                    <option value="">Select event</option>
                    {events.map((e) => <option key={e.id} value={e.id}>{e.title || e.name || `Event #${e.id}`}</option>)}
                  </select>
                </Field>
              )}

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:14 }}>
                <Field label="Publish Date">
                  <input name="publishAt" type="datetime-local" value={form.publishAt} onChange={updateForm} style={inputStyle} />
                </Field>
                <Field label="Expire Date">
                  <input name="expireAt" type="datetime-local" value={form.expireAt} onChange={updateForm} style={inputStyle} />
                </Field>
                <Field label="Status">
                  <select name="status" value={form.status} onChange={updateForm} style={inputStyle}>
                    {statuses.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
              </div>

              <label style={{ display:"flex", alignItems:"center", gap:10, background: C.accentSoft, borderRadius:12, padding:"12px 16px", cursor:"pointer" }}>
                <input type="checkbox" name="sendEmail" checked={Boolean(form.sendEmail)} onChange={updateForm} style={{ accentColor: C.accent, width:16, height:16 }} />
                <span style={{ fontSize:13, fontWeight:700, color:"#076E74" }}>Send announcement body by email</span>
              </label>
            </div>

            <button type="submit" style={{
              marginTop:24, display:"inline-flex", alignItems:"center", gap:8,
              background: C.navy, color:"#fff", border:"none", borderRadius:14,
              padding:"12px 24px", fontSize:13, fontWeight:900, cursor:"pointer",
              boxShadow:"0 6px 20px rgba(11,30,51,.25)", transition:"transform .15s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform=""}
            >
              <Megaphone size={16} /> Save Announcement
            </button>
          </form>
        </div>
      )}

      {/* ── Preview modal ── */}
      {previewing && (
        <div style={{
          position:"fixed", inset:0, zIndex:100,
          background:"rgba(11,30,51,.65)", backdropFilter:"blur(6px)",
          display:"grid", placeItems:"center", padding:20,
        }}>
          <article style={{ background: C.card, borderRadius:24, padding:"32px 36px", width:"100%", maxWidth:640, boxShadow:"0 32px 80px rgba(11,30,51,.28)" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:20 }}>
              <div>
                <p style={{ fontSize:10, fontWeight:900, letterSpacing:".18em", textTransform:"uppercase", color: C.accent, marginBottom:6 }}>Preview</p>
                <h2 style={{ fontSize:22, fontWeight:900, margin:0 }}>{previewing.title}</h2>
              </div>
              <button onClick={() => setPreviewing(null)} type="button" style={{ width:36, height:36, borderRadius:10, border:"none", background:"#F1F5F9", color: C.muted, cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0 }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
              <span style={priorityStyle(previewing.priority)}>{previewing.priority}</span>
              <span style={audienceStyle()}>{audienceLabel(previewing.audience)}</span>
              <span style={typeStyle()}>{previewing.announcementType || previewing.announcement_type}</span>
              <span style={statusStyle(previewing.status)}>{previewing.status}</span>
            </div>
            <p style={{ fontSize:13, fontWeight:500, color: C.muted, lineHeight:1.8, whiteSpace:"pre-wrap", margin:0 }}>
              {previewing.message || previewing.body}
            </p>
          </article>
        </div>
      )}
    </main>
  );
}
