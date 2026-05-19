const inputClass =
  "peer h-14 w-full min-w-0 rounded-2xl border border-slate-200 bg-white/90 px-5 pb-1.5 pt-5 text-base font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

const textareaClass =
  "peer min-h-[116px] w-full min-w-0 resize-y rounded-2xl border border-slate-200 bg-white/90 px-5 pb-4 pt-6 text-base font-medium leading-6 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

function Label({ label }) {
  return (
    <span className="pointer-events-none absolute left-5 top-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 transition-all duration-200 peer-focus:text-cyan-600">
      {label}
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-xs font-semibold text-rose-600">{message}</p>;
}

export function AuthInput({ error, label, name, onChange, type = "text", value }) {
  return (
    <label className="block min-w-0">
      <div className="relative">
        <input
          className={`${inputClass} ${error ? "border-rose-300 focus:border-rose-300 focus:shadow-[0_0_0_5px_rgba(251,113,133,0.14)]" : ""}`}
          name={name}
          onChange={onChange}
          placeholder={label}
          type={type}
          value={value}
        />
        <Label label={label} />
      </div>
      <FieldError message={error} />
    </label>
  );
}

export function AuthSelect({ children, error, label, name, onChange, value }) {
  return (
    <label className="block min-w-0">
      <div className="relative">
        <select
          className={`${inputClass} appearance-none ${error ? "border-rose-300 focus:border-rose-300 focus:shadow-[0_0_0_5px_rgba(251,113,133,0.14)]" : ""}`}
          name={name}
          onChange={onChange}
          value={value}
        >
          {children}
        </select>
        <Label label={label} />
        <span className="pointer-events-none absolute right-5 top-6 text-sm font-bold text-slate-400">v</span>
      </div>
      <FieldError message={error} />
    </label>
  );
}

export function AuthTextarea({ error, label, name, onChange, value }) {
  return (
    <label className="block min-w-0">
      <div className="relative">
        <textarea
          className={`${textareaClass} ${error ? "border-rose-300 focus:border-rose-300 focus:shadow-[0_0_0_5px_rgba(251,113,133,0.14)]" : ""}`}
          name={name}
          onChange={onChange}
          placeholder={label}
          value={value}
        />
        <Label label={label} />
      </div>
      <FieldError message={error} />
    </label>
  );
}
