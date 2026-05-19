import { Link, useParams } from "react-router-dom";
import "../styles/home.css";

export default function InitiativeDetail() {
  const { slug } = useParams();

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Initiative</p>
        <h1 className="mt-2 text-3xl font-black">{slug || "initiative"}</h1>
        <p className="mt-3 text-sm font-semibold text-slate-500">
          Initiative detail pages are ready for CMS routing and can be expanded later.
        </p>
        <Link className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white" to="/volunteer">
          Back to Website
        </Link>
      </section>
    </main>
  );
}
