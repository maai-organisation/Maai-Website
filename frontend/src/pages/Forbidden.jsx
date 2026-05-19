import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
      <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 text-center shadow-2xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300">403</p>
        <h1 className="mt-4 text-4xl font-black">Access denied</h1>
        <p className="mt-4 text-sm font-semibold leading-6 text-white/70">
          This area is restricted to Maai superadmins.
        </p>
        <Link
          className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-extrabold text-slate-950"
          to="/dashboard"
        >
          Go back
        </Link>
      </section>
    </main>
  );
}
