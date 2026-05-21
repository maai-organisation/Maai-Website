import { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";

const fields = [
  "full_name",
  "membership_number",
  "college",
  "role",
  "status",
  "verification_code",
  "barcode",
  "qr",
  "issue_date",
];

const sampleValues = {
  full_name: "John Doe",
  membership_number: "MAAI-VOL-0014",
  college: "Demo College",
  role: "Volunteer",
  status: "Verified",
  verification_code: "MAAI-ID-A1B2C3",
  barcode: "|||| ||| ||||",
  qr: "QR",
  issue_date: "20 May 2026",
};

const defaultField = {
  enabled: true,
  x: 120,
  y: 220,
  width: 260,
  height: 44,
  fontSize: 28,
  color: "#000000",
  side: "front",
};

function normalizeConfig(config = {}) {
  return Object.fromEntries(
    Object.entries(config || {}).map(([key, value]) => [
      key,
      {
        ...defaultField,
        ...(key === "qr" ? { width: 96, height: 96, fontSize: 18, type: "qr" } : {}),
        ...(key === "barcode" ? { width: 260, height: 46, fontSize: 18, type: "barcode" } : {}),
        ...(value || {}),
      },
    ]),
  );
}

export default function VisualTemplateEditor({ backImageUrl, fieldConfig, frontImageUrl, onChange }) {
  const [selected, setSelected] = useState("full_name");
  const [side, setSide] = useState("front");
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);
  const config = useMemo(() => normalizeConfig(fieldConfig), [fieldConfig]);
  const visibleFields = Object.entries(config).filter(([, item]) => (item.side || "front") === side && item.enabled !== false);
  const imageUrl = side === "back" ? backImageUrl : frontImageUrl;

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const updateScale = () => setScale(canvasRef.current.offsetWidth / 1200 || 1);
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  function commit(nextConfig) {
    onChange(nextConfig);
  }

function updateField(name, patch) {
    commit({
      ...config,
      [name]: {
        ...(config[name] || defaultField),
        ...patch,
      },
    });
  }

  function removeField(name) {
    const nextConfig = { ...config };
    delete nextConfig[name];
    commit(nextConfig);
    const nextSelected = fields.find((field) => field !== name && nextConfig[field]);
    if (nextSelected) setSelected(nextSelected);
  }

  function resetField(name) {
    setSelected(name);
    updateField(name, {
      ...defaultField,
      ...(name === "qr" ? { width: 96, height: 96, fontSize: 18, type: "qr" } : {}),
      ...(name === "barcode" ? { width: 260, height: 46, fontSize: 18, type: "barcode" } : {}),
      side,
    });
  }

  function duplicateField(name) {
    const base = config[name] || defaultField;
    let copyName = `${name}_copy`;
    let index = 2;
    while (config[copyName]) {
      copyName = `${name}_copy_${index}`;
      index += 1;
    }
    commit({
      ...config,
      [copyName]: {
        ...base,
        enabled: base.enabled !== false,
        x: (Number(base.x) || 0) + 24,
        y: (Number(base.y) || 0) + 24,
      },
    });
    setSelected(copyName);
  }

  function addField(name, x = 120, y = 220) {
    setSelected(name);
    setSide((config[name] || {}).side || side);
    updateField(name, {
      ...defaultField,
      ...(name === "qr" ? { width: 96, height: 96, fontSize: 18, type: "qr" } : {}),
      ...(name === "barcode" ? { width: 260, height: 46, fontSize: 18, type: "barcode" } : {}),
      ...(config[name] || {}),
      enabled: true,
      x,
      y,
      side,
    });
  }

  function handleDrop(event) {
    event.preventDefault();
    const name = event.dataTransfer.getData("field-name");
    if (!name) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    addField(name, Math.round((event.clientX - bounds.left) / scale), Math.round((event.clientY - bounds.top) / scale));
  }

  const selectedConfig = config[selected] || defaultField;
  const selectableFields = Object.keys(config).length ? Object.keys(config) : fields;

  return (
    <div className="grid gap-4 lg:grid-cols-[160px_1fr_220px]">
      <aside className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-black">
          {["front", "back"].map((item) => (
            <button className={`flex-1 rounded-md px-2 py-1 ${side === item ? "bg-white text-cyan-700 shadow" : "text-slate-500"}`} key={item} onClick={() => setSide(item)} type="button">
              {item}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-2">
          {fields.map((name) => {
            const item = config[name];
            const enabled = item ? item.enabled !== false : false;
            return (
              <div className={`rounded-lg border p-2 ${selected === name ? "border-cyan-500 bg-cyan-50" : "border-slate-200"}`} key={name}>
                <label className="flex items-center gap-2 text-xs font-black text-slate-700">
                  <input checked={enabled} onChange={(event) => (item ? updateField(name, { enabled: event.target.checked }) : addField(name))} type="checkbox" />
                  <span className="min-w-0 flex-1 truncate">{name}</span>
                </label>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  <button className="rounded-md bg-slate-100 px-2 py-1 text-left text-[11px] font-bold text-slate-500" draggable onClick={() => addField(name)} onDragStart={(event) => event.dataTransfer.setData("field-name", name)} type="button">
                    Place
                  </button>
                  <button className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500" disabled={!item} onClick={() => resetField(name)} type="button">
                    Reset
                  </button>
                  <button className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 disabled:opacity-40" disabled={!item} onClick={() => removeField(name)} type="button">
                    Del
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <div className="rounded-xl border border-slate-200 bg-slate-100 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Template Image Editor</p>
          <a className="text-xs font-black text-cyan-700 underline" href={imageUrl} rel="noreferrer" target="_blank">Preview image</a>
        </div>
        <div
          ref={canvasRef}
          className="relative aspect-[1200/850] overflow-hidden rounded-lg border border-slate-200 bg-white"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          {imageUrl ? <img alt="" className="absolute inset-0 h-full w-full select-none object-fill" draggable={false} src={imageUrl} /> : null}
          {visibleFields.map(([name, item]) => (
            <Rnd
              bounds="parent"
              key={name}
              onClick={() => setSelected(name)}
              onDragStop={(_event, data) => updateField(name, { x: Math.round(data.x / scale), y: Math.round(data.y / scale) })}
              onResizeStop={(_event, _direction, ref, _delta, position) => updateField(name, {
                height: Math.round(ref.offsetHeight / scale),
                width: Math.round(ref.offsetWidth / scale),
                x: Math.round(position.x / scale),
                y: Math.round(position.y / scale),
              })}
              position={{ x: (Number(item.x) || 0) * scale, y: (Number(item.y) || 0) * scale }}
              size={{ width: (Number(item.width) || 160) * scale, height: (Number(item.height) || 42) * scale }}
            >
              <div
                className={`grid h-full w-full place-items-center overflow-hidden border-2 bg-white/60 px-2 text-center font-black shadow-sm ${selected === name ? "border-cyan-500" : "border-slate-900/50"}`}
                style={{ color: item.color || "#000000", fontSize: (Number(item.fontSize) || 18) * scale }}
              >
                {sampleValues[name] || name}
              </div>
            </Rnd>
          ))}
        </div>
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Selected Field</p>
        <select className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-2 text-sm font-bold" onChange={(event) => setSelected(event.target.value)} value={selected}>
          {selectableFields.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <div className="mt-3 grid gap-2">
          <label className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs font-black text-slate-700">
            <input checked={selectedConfig.enabled !== false} onChange={(event) => updateField(selected, { enabled: event.target.checked })} type="checkbox" />
            Visible
          </label>
          {[
            ["x", "X"],
            ["y", "Y"],
            ["width", "Width"],
            ["height", "Height"],
            ["fontSize", "Font size"],
          ].map(([key, label]) => (
            <label className="text-xs font-bold text-slate-500" key={key}>
              {label}
              <input className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm font-bold text-slate-900" onChange={(event) => updateField(selected, { [key]: Number(event.target.value) })} type="number" value={selectedConfig[key] || 0} />
            </label>
          ))}
          <label className="text-xs font-bold text-slate-500">
            Color
            <input className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2" onChange={(event) => updateField(selected, { color: event.target.value })} type="color" value={selectedConfig.color || "#000000"} />
          </label>
          <label className="text-xs font-bold text-slate-500">
            Side
            <select className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2 text-sm font-bold text-slate-900" onChange={(event) => updateField(selected, { side: event.target.value })} value={selectedConfig.side || "front"}>
              <option value="front">front</option>
              <option value="back">back</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" onClick={() => resetField(selected)} type="button">Reset</button>
            <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" onClick={() => duplicateField(selected)} type="button">Duplicate</button>
            <button className="col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-black text-rose-700" onClick={() => removeField(selected)} type="button">Delete field</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
