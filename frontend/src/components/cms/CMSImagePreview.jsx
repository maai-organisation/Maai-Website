export default function CMSImagePreview({ url }) {
  if (!url) {
    return <div className="grid h-28 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-xs font-bold text-slate-400">Image URL preview</div>;
  }

  return (
    <img
      alt=""
      className="h-28 w-full rounded-2xl border border-slate-200 object-cover"
      src={url}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}
