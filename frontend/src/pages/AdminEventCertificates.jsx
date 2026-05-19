import { Award, CheckCircle2, RotateCcw, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  bulkRevokeEventCertificates,
  getEventCertificates,
  issueEventCertificates,
  revokeEventCertificate,
} from "../services/api";

const initialFilters = {
  search: "",
  membershipStatus: "all",
  certificateStatus: "all",
  claimed: "all",
};

export default function AdminEventCertificates() {
  const { id } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const eventsPath = location.pathname.startsWith("/staff") ? "/staff/events" : "/admin/events";

  async function loadCertificates(nextFilters = filters) {
    const data = await getEventCertificates(id, nextFilters);
    setEvent(data.event);
    setRecipients(data.recipients || []);
  }

  useEffect(() => {
    let ignore = false;
    const timer = window.setTimeout(() => {
      getEventCertificates(id, initialFilters)
        .then((data) => {
          if (ignore) return;
          setEvent(data.event);
          setRecipients(data.recipients || []);
        })
        .catch(() => {
          if (!ignore) setMessage("Unable to load certificate recipients.");
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [id]);

  function updateFilter(eventTarget) {
    const { name, value } = eventTarget.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    window.setTimeout(() => loadCertificates(nextFilters).catch(() => setMessage("Unable to filter recipients.")), 0);
  }

  function toggleVolunteer(volunteerId) {
    setSelected((current) => (current.includes(volunteerId) ? current.filter((idValue) => idValue !== volunteerId) : [...current, volunteerId]));
  }

  function toggleAll() {
    const visibleIds = recipients.map((recipient) => recipient.volunteerId);
    setSelected((current) => (current.length === visibleIds.length ? [] : visibleIds));
  }

  async function handleIssue() {
    await issueEventCertificates(id, selected);
    setMessage("Certificates issued as eligible.");
    setSelected([]);
    await loadCertificates();
  }

  async function handleBulkRevoke() {
    await bulkRevokeEventCertificates(id, selected);
    setMessage("Selected certificates revoked.");
    setSelected([]);
    await loadCertificates();
  }

  async function handleRevoke(certificateId) {
    await revokeEventCertificate(id, certificateId);
    setMessage("Certificate revoked.");
    await loadCertificates();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-950 md:p-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Link className="text-sm font-black text-cyan-700" to={eventsPath}>
            Back to events
          </Link>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Manual Certificate Issuance</p>
              <h1 className="mt-1 text-2xl font-black">{event?.title || "Event Certificates"}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-40"
                disabled={selected.length === 0}
                onClick={handleIssue}
                type="button"
              >
                <CheckCircle2 className="h-4 w-4" />
                Issue selected
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 disabled:opacity-40"
                disabled={selected.length === 0}
                onClick={handleBulkRevoke}
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
                Revoke selected
              </button>
            </div>
          </div>
        </header>

        {message ? <p className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{message}</p> : null}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-200 p-5 md:grid-cols-[1fr_170px_170px_160px]">
            <label className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-semibold outline-none"
                name="search"
                onChange={updateFilter}
                placeholder="Search volunteers"
                value={filters.search}
              />
            </label>
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="membershipStatus" onChange={updateFilter} value={filters.membershipStatus}>
              <option value="all">Membership</option>
              <option value="under_review">Under review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="certificateStatus" onChange={updateFilter} value={filters.certificateStatus}>
              <option value="all">Certificate</option>
              <option value="none">Not issued</option>
              <option value="eligible">Eligible</option>
              <option value="claimed">Claimed</option>
              <option value="revoked">Revoked</option>
            </select>
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="claimed" onChange={updateFilter} value={filters.claimed}>
              <option value="all">Claim state</option>
              <option value="claimed">Claimed</option>
              <option value="unclaimed">Unclaimed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">
                    <input checked={recipients.length > 0 && selected.length === recipients.length} onChange={toggleAll} type="checkbox" />
                  </th>
                  <th className="px-5 py-4">Volunteer</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Membership Status</th>
                  <th className="px-5 py-4">Certificate Status</th>
                  <th className="px-5 py-4">Issued Date</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-5 py-10 text-center font-bold text-slate-500" colSpan="7">Loading recipients...</td>
                  </tr>
                ) : null}
                {!loading && recipients.map((recipient) => (
                  <tr key={recipient.volunteerId}>
                    <td className="px-5 py-4">
                      <input checked={selected.includes(recipient.volunteerId)} onChange={() => toggleVolunteer(recipient.volunteerId)} type="checkbox" />
                    </td>
                    <td className="px-5 py-4 font-black text-slate-900">{recipient.fullName}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{recipient.email}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{recipient.membershipStatus || "-"}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-600">
                        {recipient.certificateStatus || "not issued"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{recipient.issuedAt ? new Date(recipient.issuedAt).toLocaleDateString() : "-"}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-black text-cyan-700"
                          onClick={() => issueEventCertificates(id, [recipient.volunteerId]).then(() => loadCertificates())}
                          type="button"
                        >
                          <Award className="h-3.5 w-3.5" />
                          Issue
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700 disabled:opacity-40"
                          disabled={!recipient.certificateId}
                          onClick={() => handleRevoke(recipient.certificateId)}
                          type="button"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && recipients.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-center font-bold text-slate-500" colSpan="7">No volunteers found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
