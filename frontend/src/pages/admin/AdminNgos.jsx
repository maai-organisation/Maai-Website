import { Building2, CheckCircle2, Clock, Eye, LayoutDashboard, Mail, MapPin, Phone, RefreshCw, Search, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminNgos, updateAdminNgoStatus } from "../../services/api";

const tabs = [
  ["pending", "Pending", Clock],
  ["approved", "Approved", CheckCircle2],
  ["rejected", "Rejected", XCircle],
];

function statusLabel(ngo) {
  if (ngo.status) return ngo.status;
  if (ngo.membershipStatus === "verified") return "approved";
  if (ngo.membershipStatus === "rejected") return "rejected";
  return "pending";
}

function StatusBadge({ status }) {
  const tone = {
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    rejected: "bg-rose-50 text-rose-700 ring-rose-100",
    pending: "bg-amber-50 text-amber-700 ring-amber-100",
  }[status] || "bg-slate-100 text-slate-700 ring-slate-200";

  return <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ring-1 ${tone}`}>{status}</span>;
}

export default function AdminNgos() {
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedNgo, setSelectedNgo] = useState(null);

  const loadNgos = useCallback(async () => {
    setLoading(true);
    try {
      setNgos(await getAdminNgos({ status: activeTab, search }));
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadNgos().catch(() => {
        setNgos([]);
        setMessage("Unable to load NGO registrations.");
      });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [loadNgos]);

  const counts = useMemo(() => {
    const next = { pending: 0, approved: 0, rejected: 0 };
    ngos.forEach((ngo) => {
      const status = statusLabel(ngo);
      next[status] = (next[status] || 0) + 1;
    });
    return next;
  }, [ngos]);

  async function changeStatus(id, status) {
    await updateAdminNgoStatus(id, status);
    setMessage(`NGO marked ${status}.`);
    setSelectedNgo(null);
    await loadNgos();
  }

  return (
    <main className="min-h-screen bg-[#F6FAFB] text-[#041C32]">
      <header className="bg-gradient-to-br from-[#041C32] to-[#064663] px-5 py-8 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/12 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
              <Building2 className="h-4 w-4" />
              Admin NGO Panel
            </p>
            <h1 className="mt-4 text-3xl font-black">NGO Registrations</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/62">
              Review partner organisations and move registrations through pending, approved, and rejected states.
            </p>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/16" to="/admin">
            <LayoutDashboard className="h-4 w-4" />
            Admin Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-6 md:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          {tabs.map(([key, label, Icon]) => (
            <button className={`rounded-2xl border p-5 text-left shadow-[0_16px_45px_rgba(4,28,50,0.06)] transition ${activeTab === key ? "border-cyan-200 bg-white" : "border-white bg-white/72 hover:bg-white"}`} key={key} onClick={() => setActiveTab(key)} type="button">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-black">{label}</span>
                <Icon className="h-5 w-5 text-cyan-700" />
              </div>
              <p className="mt-3 text-3xl font-black">{counts[key] || (activeTab === key ? ngos.length : 0)}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white bg-white p-4 shadow-[0_16px_45px_rgba(4,28,50,0.06)]">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 px-4 sm:max-w-md">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input className="h-11 min-w-0 flex-1 text-sm font-semibold outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search organisation, city, email" value={search} />
          </div>
          <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#041C32] px-4 text-sm font-black text-white" onClick={loadNgos} type="button">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {message ? <p className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-800">{message}</p> : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-white bg-white shadow-[0_18px_55px_rgba(4,28,50,0.07)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Organisation</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Work Areas</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-5 py-8 text-sm font-bold text-slate-500" colSpan={6}>Loading NGOs...</td>
                  </tr>
                ) : null}
                {!loading && ngos.map((ngo) => {
                  const status = statusLabel(ngo);
                  return (
                    <tr className="align-top" key={ngo.id}>
                      <td className="px-5 py-4">
                        <p className="font-black">{ngo.organisationName || ngo.organizationName}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{ngo.registrationNumber || ngo.registration_number || "Registration pending"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        <p>{ngo.email}</p>
                        <p className="mt-1">{ngo.phone || "-"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">{[ngo.city, ngo.state].filter(Boolean).join(", ") || "-"}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">{Array.isArray(ngo.workAreas) ? ngo.workAreas.join(", ") : ngo.workAreas || "-"}</td>
                      <td className="px-5 py-4"><StatusBadge status={status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" onClick={() => setSelectedNgo(ngo)} type="button">
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          {status !== "approved" ? (
                            <button className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700" onClick={() => changeStatus(ngo.id, "approved")} type="button">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </button>
                          ) : null}
                          {status !== "rejected" ? (
                            <button className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700" onClick={() => changeStatus(ngo.id, "rejected")} type="button">
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && ngos.length === 0 ? (
                  <tr>
                    <td className="px-5 py-12 text-center text-sm font-bold text-slate-500" colSpan={6}>No NGO registrations found in this tab.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedNgo ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#041C32]/55 p-4 backdrop-blur-sm" onClick={() => setSelectedNgo(null)}>
          <article className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-[0_30px_100px_rgba(4,28,50,0.28)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 bg-[#041C32] p-6 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Organisation Profile</p>
                <h2 className="mt-2 text-2xl font-black">{selectedNgo.organisationName || selectedNgo.organizationName}</h2>
              </div>
              <button className="grid h-9 w-9 place-items-center rounded-full bg-white/10" onClick={() => setSelectedNgo(null)} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-5 p-6">
              <div className="grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2">
                <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-cyan-700" />{selectedNgo.email || "-"}</span>
                <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan-700" />{selectedNgo.phone || "-"}</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-700" />{[selectedNgo.city, selectedNgo.state, selectedNgo.country].filter(Boolean).join(", ") || "-"}</span>
                <StatusBadge status={statusLabel(selectedNgo)} />
              </div>
              <Detail label="Founder" value={[selectedNgo.founderName, selectedNgo.designation].filter(Boolean).join(", ")} />
              <Detail label="Address" value={selectedNgo.address} />
              <Detail label="Work Areas" value={Array.isArray(selectedNgo.workAreas) ? selectedNgo.workAreas.join(", ") : selectedNgo.workAreas} />
              <Detail label="Target Population" value={selectedNgo.targetPopulation} />
              <Detail label="Districts Served" value={selectedNgo.districtsServed} />
              <Detail label="Existing Collaborations" value={selectedNgo.existingCollaborations} />
              <div className="flex flex-wrap gap-2 pt-2">
                <button className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white" onClick={() => changeStatus(selectedNgo.id, "approved")} type="button">Approve</button>
                <button className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-black text-white" onClick={() => changeStatus(selectedNgo.id, "rejected")} type="button">Reject</button>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{value || "-"}</p>
    </div>
  );
}
