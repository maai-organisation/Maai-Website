import { CheckCircle2, Eye, Search, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { convertCampRequestToEvent, getCampRequests, reviewCampRequest } from "../services/api";

const initialFilters = { search: "", type: "all", status: "all", city: "", state: "" };

export default function AdminCampRegistrations() {
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = useCallback(async (nextFilters) => {
    setRequests(await getCampRequests(nextFilters));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => loadRequests(initialFilters).catch(() => setMessage("Unable to load camp requests.")), 0);
    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  function updateFilter(event) {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    window.setTimeout(() => loadRequests(nextFilters).catch(() => setMessage("Unable to filter camp requests.")), 0);
  }

  async function review(id, status) {
    await reviewCampRequest(id, { status, reviewNotes: notes });
    setMessage(`Camp request ${status}.`);
    setNotes("");
    await loadRequests(filters);
  }

  async function convert(id) {
    const data = await convertCampRequestToEvent(id);
    setMessage(`Event created from camp request #${data.eventId}.`);
    await loadRequests(filters);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-950 md:p-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Camp Requests</p>
          <h1 className="mt-1 text-2xl font-black">NGO Camp Review</h1>
        </header>
        {message ? <p className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{message}</p> : null}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-200 p-5 md:grid-cols-[1fr_150px_150px_130px_130px]">
            <label className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-semibold outline-none" name="search" onChange={updateFilter} placeholder="Search title, NGO, location" value={filters.search} />
            </label>
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="type" onChange={updateFilter} value={filters.type}>
              <option value="all">All types</option>
              {["health", "awareness", "screening", "research", "education", "community", "other"].map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="status" onChange={updateFilter} value={filters.status}>
              <option value="all">All status</option>
              {["submitted", "under_review", "approved", "rejected", "completed"].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <input className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="city" onChange={updateFilter} placeholder="City" value={filters.city} />
            <input className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="state" onChange={updateFilter} placeholder="State" value={filters.state} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">NGO</th>
                  <th className="px-5 py-4">Camp</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Beneficiaries</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-5 py-4 font-semibold text-slate-600">{request.ngoName || "-"}</td>
                    <td className="px-5 py-4 font-black">{request.title}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{request.campType}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{request.location}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{request.expectedBeneficiaries || "-"}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">{request.status}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black" onClick={() => { setSelectedRequest(request); setNotes(request.reviewNotes || ""); }} type="button"><Eye className="inline h-3.5 w-3.5" /> View</button>
                        <button className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700" onClick={() => review(request.id, "approved")} type="button"><CheckCircle2 className="inline h-3.5 w-3.5" /> Approve</button>
                        <button className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700" onClick={() => review(request.id, "rejected")} type="button"><XCircle className="inline h-3.5 w-3.5" /> Reject</button>
                        <button className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-black text-cyan-700 disabled:opacity-40" disabled={request.status !== "approved"} onClick={() => convert(request.id)} type="button">Convert to Event</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedRequest ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
            <section className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
              <button className="float-right rounded-full bg-slate-100 px-4 py-2 text-sm font-black" onClick={() => setSelectedRequest(null)} type="button">Close</button>
              <h2 className="text-2xl font-black">{selectedRequest.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{selectedRequest.description}</p>
              <label className="mt-5 block">
                <span className="text-xs font-black uppercase text-slate-500">Review Notes</span>
                <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" onChange={(event) => setNotes(event.target.value)} value={notes} />
              </label>
              <div className="mt-4 flex gap-2">
                <button className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700" onClick={() => review(selectedRequest.id, "approved")} type="button">Approve</button>
                <button className="rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-rose-700" onClick={() => review(selectedRequest.id, "rejected")} type="button">Reject</button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
