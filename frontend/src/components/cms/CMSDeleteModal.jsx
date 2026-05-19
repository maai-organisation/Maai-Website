export default function CMSDeleteModal({ item, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">Delete</p>
        <h2 className="mt-2 text-xl font-black">Delete {item?.title}?</h2>
        <p className="mt-3 text-sm font-semibold text-slate-500">This CMS entry will be removed permanently.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-full bg-slate-100 px-5 py-2 text-sm font-black" onClick={onCancel} type="button">Cancel</button>
          <button className="rounded-full bg-rose-600 px-5 py-2 text-sm font-black text-white" onClick={onConfirm} type="button">Delete</button>
        </div>
      </section>
    </div>
  );
}
