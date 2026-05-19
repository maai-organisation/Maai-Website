export default function CMSStatusBadge({ status }) {
  const classes = {
    draft: "bg-amber-100 text-amber-700",
    published: "bg-emerald-100 text-emerald-700",
    archived: "bg-slate-200 text-slate-600",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${classes[status] || classes.draft}`}>
      {status || "draft"}
    </span>
  );
}
