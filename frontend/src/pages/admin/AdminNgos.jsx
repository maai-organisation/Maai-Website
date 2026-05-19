import { CheckCircle2, Eye, Search, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getAdminNgos, updateAdminNgoStatus } from "../../services/api";

const initialFilters = { search: "", membershipStatus: "all", paymentStatus: "all" };

export default function AdminNgos() {
  const [ngos, setNgos] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [message, setMessage] = useState("");

  const loadNgos = useCallback(async (nextFilters) => {
    setNgos(await getAdminNgos(nextFilters));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => loadNgos(initialFilters).catch(() => setMessage("Unable to load NGOs.")), 0);
    return () => window.clearTimeout(timer);
  }, [loadNgos]);

  function updateFilter(event) {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    window.setTimeout(() => loadNgos(nextFilters).catch(() => setMessage("Unable to filter NGOs.")), 0);
  }

  async function changeStatus(id, status) {
    await updateAdminNgoStatus(id, status);
    setMessage(`NGO marked ${status}.`);
    await loadNgos(filters);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-950 md:p-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Admin NGO Panel</p>
          <h1 className="mt-1 text-2xl font-black">NGO Registrations</h1>
        </header>
        {message ? <p className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{message}</p> : null}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-200 p-5 md:grid-cols-[1fr_180px_180px]">
            <label className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-semibold outline-none" name="search" onChange={updateFilter} placeholder="Search NGOs" value={filters.search} />
            </label>
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="membershipStatus" onChange={updateFilter} value={filters.membershipStatus}>
              <option value="all">All status</option>
              <option value="under_review">Under review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
            <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="paymentStatus" onChange={updateFilter} value={filters.paymentStatus}>
              <option value="all">All payment</option>
              <option value="free">Free</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Organization</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">City</th>
                  <th className="px-5 py-4">Membership Status</th>
                  <th className="px-5 py-4">Payment Status</th>
                  <th className="px-5 py-4">Joined Date</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ngos.map((ngo) => (
                  <tr key={ngo.id}>
                    <td className="px-5 py-4 font-black">{ngo.organizationName}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{ngo.ngoType}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{ngo.city}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{ngo.membershipStatus}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{ngo.paymentStatus}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{ngo.joinedDate ? new Date(ngo.joinedDate).toLocaleDateString() : "-"}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black" onClick={() => setSelectedNgo(ngo)} type="button"><Eye className="inline h-3.5 w-3.5" /> View</button>
                        <button className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700" onClick={() => changeStatus(ngo.id, "verified")} type="button"><CheckCircle2 className="inline h-3.5 w-3.5" /> Verify</button>
                        <button className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700" onClick={() => changeStatus(ngo.id, "rejected")} type="button"><XCircle className="inline h-3.5 w-3.5" /> Reject</button>
                        <button className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700" onClick={() => changeStatus(ngo.id, "suspended")} type="button">Suspend</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {selectedNgo ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
            <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <button className="float-right rounded-full bg-slate-100 px-4 py-2 text-sm font-black" onClick={() => setSelectedNgo(null)} type="button">Close</button>
              <img alt="" className="h-32 w-full rounded-xl object-cover" src={selectedNgo.coverUrl || "https://placehold.co/1200x400?text=NGO"} />
              <h2 className="mt-5 text-2xl font-black">{selectedNgo.organizationName}</h2>
              <p className="mt-2 text-sm font-bold text-slate-500">{selectedNgo.email} / {selectedNgo.phone}</p>
              <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">{selectedNgo.description || selectedNgo.mission}</p>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
