import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AuthLayout({ children, eyebrow, subtitle, title }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f8fbff] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_82%_78%,rgba(236,72,153,0.10),transparent_34%)]" />
      <div className="pointer-events-none absolute left-[-10rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-12rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-pink-300/20 blur-3xl" />

      <nav className="relative z-20 mx-auto mt-6 flex h-[72px] w-[calc(100%-2rem)] max-w-6xl items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 shadow-sm backdrop-blur-xl sm:px-6">
        <Link className="flex items-center gap-3 font-extrabold tracking-[-0.02em] text-slate-950" to="/volunteer">
          <img alt="" aria-hidden="true" className="h-9 w-9 rounded-full shadow-sm" src="/Favicon.ico" />
          <span className="hidden sm:inline">Maai organisation</span>
          <span className="sm:hidden">Maai</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:text-cyan-700" to="/volunteer/login">
            Login
          </Link>
          <Link
            className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:text-cyan-700"
            to="/volunteer"
          >
            Back Home
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-6 lg:px-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 22 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex rounded-full border border-cyan-200/80 bg-white/70 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyan-700 shadow-sm backdrop-blur-xl">
            {eyebrow}
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-slate-950 lg:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-500">{subtitle}</p>
        </motion.div>

        {children}
      </section>

      <footer className="relative z-10 px-6 pb-8 text-center text-sm font-semibold text-slate-400">
        <p>Maai organisation member ecosystem</p>
      </footer>
    </main>
  );
}
