import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminVolunteers,
  updateAdminVolunteerPaymentStatus,
  updateAdminVolunteerStatus,
} from "../../services/api";

const membershipStatuses = ["all", "under_review", "verified", "rejected"];
const paymentStatuses = ["all", "free", "pending", "paid", "failed"];

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function statusClass(status) {
  if (status === "verified") return "bg-emerald-100 text-emerald-700";
  if (status === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function Badge({ children, type = "membership" }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${
        type === "membership" ? statusClass(children) : "bg-slate-100 text-slate-600"
      }`}
    >
      {children || "-"}
    </span>
  );
}

function uniqueOptions(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort();
}

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    membershipStatus: "all",
    paymentStatus: "all",
    college: "all",
    city: "all",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const colleges = useMemo(() => uniqueOptions(volunteers, "college"), [volunteers]);
  const cities = useMemo(() => uniqueOptions(volunteers, "city"), [volunteers]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setVolunteers(await getAdminVolunteers(filters));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Unable to load volunteers.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function setMembership(id, membershipStatus) {
    await updateAdminVolunteerStatus(id, membershipStatus);
    await load();
  }

  async function setPayment(id, paymentStatus) {
    await updateAdminVolunteerPaymentStatus(id, paymentStatus);
    await load();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-950 md:p-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-black">Volunteer Verification</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm" to="/admin">
              Admin Dashboard
            </Link>
            <Link className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white" to="/volunteer">
              Back to Website
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5">
          <input
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-cyan-400"
            name="search"
            onChange={updateFilter}
            placeholder="Search name or email"
            value={filters.search}
          />
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="membershipStatus" onChange={updateFilter} value={filters.membershipStatus}>
            {membershipStatuses.map((status) => (
              <option key={status} value={status}>{status === "all" ? "All memberships" : status}</option>
            ))}
          </select>
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="paymentStatus" onChange={updateFilter} value={filters.paymentStatus}>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>{status === "all" ? "All payments" : status}</option>
            ))}
          </select>
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="college" onChange={updateFilter} value={filters.college}>
            <option value="all">All colleges</option>
            {colleges.map((college) => <option key={college} value={college}>{college}</option>)}
          </select>
          <select className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold" name="city" onChange={updateFilter} value={filters.city}>
            <option value="all">All cities</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {error ? <p className="m-5 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p> : null}
          {loading ? <p className="p-5 text-sm font-bold text-slate-500">Loading volunteers...</p> : null}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">College</th>
                  <th className="px-5 py-4">Membership Status</th>
                  <th className="px-5 py-4">Payment Status</th>
                  <th className="px-5 py-4">Transaction ID</th>
                  <th className="px-5 py-4">Joined Date</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {volunteers.map((volunteer) => (
                  <tr key={volunteer.id}>
                    <td className="px-5 py-4 font-black">{volunteer.fullName || volunteer.full_name}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{volunteer.email}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{volunteer.college || "-"}</td>
                    <td className="px-5 py-4">
                      <Badge>{volunteer.membership_status || volunteer.membershipStatus}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge type="payment">{volunteer.payment_status || volunteer.paymentStatus}</Badge>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{volunteer.transaction_id || volunteer.transactionId || "FREE"}</td>
                    <td className="px-5 py-4 font-semibold text-slate-600">{formatDate(volunteer.joinedDate || volunteer.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black" type="button">
                          View
                        </button>
                        <button className="rounded-full bg-cyan-100 px-3 py-2 text-xs font-black text-cyan-700" onClick={() => setPayment(volunteer.id, "paid")} type="button">
                          Verify Payment
                        </button>
                        <button className="rounded-full bg-orange-100 px-3 py-2 text-xs font-black text-orange-700" onClick={() => setPayment(volunteer.id, "failed")} type="button">
                          Reject Payment
                        </button>
                        <button className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700" onClick={() => setMembership(volunteer.id, "verified")} type="button">
                          Verify Member
                        </button>
                        <button className="rounded-full bg-rose-100 px-3 py-2 text-xs font-black text-rose-700" onClick={() => setMembership(volunteer.id, "rejected")} type="button">
                          Reject Member
                        </button>
                        <button className="rounded-full bg-amber-100 px-3 py-2 text-xs font-black text-amber-700" onClick={() => setMembership(volunteer.id, "under_review")} type="button">
                          Suspend Member
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && volunteers.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-sm font-bold text-slate-500" colSpan={8}>
                      No volunteers found.
                    </td>
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
