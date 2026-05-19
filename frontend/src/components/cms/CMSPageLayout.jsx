export default function CMSPageLayout({ children, moduleLabel, onCreate, roleLabel }) {
  return (
    <section className="min-w-0 flex-1 px-4 py-5 md:px-8">
      <header className="sticky top-4 z-30 rounded-[24px] border border-white/70 bg-white/88 px-16 py-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">{roleLabel} CMS</p>
            <h1 className="truncate text-xl font-black md:text-2xl">{moduleLabel}</h1>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-cyan-700" onClick={onCreate} type="button">
            Create
          </button>
        </div>
      </header>
      <div className="py-8">{children}</div>
    </section>
  );
}
