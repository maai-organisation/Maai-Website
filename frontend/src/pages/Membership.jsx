import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMembershipSettings } from "../services/authService";

function formatFee(settings) {
  if (!settings?.paymentsEnabled) return "Free";
  return `${settings.currency || "INR"} ${Number(settings.membershipFee || settings.membership_fee || 0).toLocaleString("en-IN")}`;
}

export default function Membership() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    getMembershipSettings()
      .then((data) => {
        if (!ignore) setSettings(data);
      })
      .catch(() => {
        if (!ignore) setSettings({ paymentsEnabled: false, membershipName: "Free Membership", membershipFee: 0, currency: "INR" });
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const instructions = settings?.paymentInstructions || settings?.payment_instructions || settings?.instructions;

  return (
    <main className="bg-slate-50 px-5 py-16 text-slate-950">
      <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Maai Membership</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">{settings?.membershipName || settings?.membership_name || "Free Membership"}</h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-600">
            The platform works in free mode today and is ready for manual UPI verification whenever paid memberships are enabled.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-cyan-700" to="/auth?mode=signup">
              Continue Registration
            </Link>
            <Link className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700" to="/auth">
              Member Login
            </Link>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? <p className="text-sm font-bold text-slate-500">Loading membership details...</p> : null}
          {!loading ? (
            <>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Membership Fee</p>
              <p className="mt-2 text-3xl font-black">{formatFee(settings)}</p>
              {settings?.paymentsEnabled && settings?.upiQrUrl ? (
                <img alt="UPI QR" className="mt-5 aspect-square w-44 rounded-2xl border border-slate-100 bg-slate-50 object-cover" src={settings.upiQrUrl} />
              ) : null}
              {instructions ? <p className="mt-5 whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">{instructions}</p> : null}
              {!settings?.paymentsEnabled ? (
                <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  Payments are currently disabled. Registration is free and reviewed manually.
                </p>
              ) : null}
            </>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
