export default function CMSActionsDropdown({ item, onArchive, onDefault, onDelete, onEdit, onFeature, onPublish, onUnfeature }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black" onClick={() => onEdit(item)} type="button">
        Edit
      </button>
      <button className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700" onClick={() => onPublish(item)} type="button">
        Publish
      </button>
      <button className="rounded-full bg-amber-100 px-3 py-2 text-xs font-black text-amber-700" onClick={() => onArchive(item)} type="button">
        Archive
      </button>
      {onFeature && !item.featured ? (
        <button className="rounded-full bg-cyan-100 px-3 py-2 text-xs font-black text-cyan-700" onClick={() => onFeature(item)} type="button">
          Feature
        </button>
      ) : null}
      {onUnfeature && item.featured ? (
        <button className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" onClick={() => onUnfeature(item)} type="button">
          Unfeature
        </button>
      ) : null}
      {onDefault && !(item.isDefault || item.is_default) ? (
        <button className="rounded-full bg-cyan-100 px-3 py-2 text-xs font-black text-cyan-700" onClick={() => onDefault(item)} type="button">
          Set Default
        </button>
      ) : null}
      <button className="rounded-full bg-rose-100 px-3 py-2 text-xs font-black text-rose-700" onClick={() => onDelete(item)} type="button">
        Delete
      </button>
    </div>
  );
}
