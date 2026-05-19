import { AlertTriangle, Mail, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getCMSItems, getEmailLogs, sendEmail } from "../services/api";

const initialForm = {
  audience: "all",
  emailType: "announcement",
  subject: "",
};

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminEmailCenter() {
  const [logs, setLogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const [logRows, templateResponse] = await Promise.all([
      getEmailLogs(),
      getCMSItems("email-templates", { status: "all", limit: 100, sort: "email_type" }),
    ]);
    setLogs(logRows);
    setTemplates(templateResponse.items || []);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => load().catch(() => setMessage("Unable to load email center.")), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
  }

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    try {
      const result = await sendEmail({
        audience: form.audience,
        emailType: form.emailType,
        subject: form.subject,
        useTemplate: true,
      });
      setMessage(`Email run complete: ${result.sent} sent, ${result.failed} failed, ${result.queued} queued.`);
      setForm(initialForm);
      await load();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Email could not be sent.");
    } finally {
      setSending(false);
    }
  }

  const failures = logs.filter((log) => log.status === "failed");

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-950 md:p-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Communications</p>
              <h1 className="mt-1 text-2xl font-black">Email Center</h1>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Mail className="h-6 w-6" />
            </span>
          </div>
        </header>

        {message ? <p className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{message}</p> : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[380px_1fr]">
          <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submit}>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Manual send</p>
            <h2 className="mt-2 text-xl font-black">Announcement email</h2>
            <label className="mt-5 block">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Audience</span>
              <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="audience" onChange={updateField} value={form.audience}>
                <option value="all">All</option>
                <option value="volunteers">Volunteers</option>
                <option value="ngos">NGOs</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Template</span>
              <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" name="emailType" onChange={updateField} value={form.emailType}>
                {[...new Set(templates.map((template) => template.emailType || template.email_type))].filter(Boolean).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
                {templates.length === 0 ? <option value="announcement">announcement</option> : null}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Announcement Name</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none" name="subject" onChange={updateField} placeholder="Appears as {{event_name}}" value={form.subject} />
            </label>
            <button className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white disabled:opacity-50" disabled={sending} type="submit">
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : "Send email"}
            </button>
          </form>

          <section className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-3">
              <Stat label="Recent emails" value={logs.length} />
              <Stat label="Failures" value={failures.length} tone="rose" />
              <Stat label="Templates" value={templates.length} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 p-5">
                <h2 className="text-lg font-black">Recent emails</h2>
                {failures.length > 0 ? <span className="inline-flex items-center gap-2 text-sm font-black text-rose-700"><AlertTriangle className="h-4 w-4" /> Failures found</span> : null}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Recipient</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Subject</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-5 py-4 font-semibold text-slate-600">{log.recipient_email}</td>
                        <td className="px-5 py-4 font-semibold text-slate-600">{log.email_type}</td>
                        <td className="px-5 py-4 font-black">{log.subject || "-"}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${log.status === "failed" ? "bg-rose-50 text-rose-700" : log.status === "sent" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{log.status}</span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-600">{formatDate(log.sent_at || log.created_at)}</td>
                      </tr>
                    ))}
                    {logs.length === 0 ? (
                      <tr><td className="px-5 py-10 text-center text-sm font-bold text-slate-500" colSpan="5">No email logs yet.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, tone = "cyan", value }) {
  return (
    <article className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${tone === "rose" ? "text-rose-700" : "text-cyan-700"}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <strong className="mt-2 block text-3xl font-black">{value}</strong>
    </article>
  );
}
