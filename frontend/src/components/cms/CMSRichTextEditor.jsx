export default function CMSRichTextEditor({ label = "Description", name = "description", onChange, value }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <textarea
        className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-400"
        name={name}
        onChange={onChange}
        value={value || ""}
      />
    </label>
  );
}
