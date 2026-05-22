import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NgoRegister from "./NgoRegister";
import { useAuth } from "../../hooks/useAuth";
import { registerNgo } from "../../services/authService";

const loginInitial = { email: "", password: "" };

export default function NgoAuth() {
  const navigate = useNavigate();
  const { loginNgoAccount, loading: loginLoading } = useAuth();
  const [tab, setTab] = useState("login");
  const [loginForm, setLoginForm] = useState(loginInitial);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [registering, setRegistering] = useState(false);

  function updateLogin(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
  }

  async function submitLogin(event) {
    event.preventDefault();
    setMessage("");
    try {
      await loginNgoAccount(loginForm);
      navigate("/ngo-dashboard", { replace: true });
    } catch (error) {
      setErrors(error?.response?.data?.errors || {});
      setMessage(error?.response?.data?.message || "Unable to sign in.");
    }
  }

  async function submitRegistration(payload) {
    setRegistering(true);
    setErrors({});
    setMessage("");
    try {
      await registerNgo(payload);
      await loginNgoAccount({ email: payload.email, password: payload.password });
      navigate("/ngo-dashboard", { replace: true });
    } catch (error) {
      setErrors(error?.response?.data?.errors || {});
      setMessage(error?.response?.data?.message || "NGO registration could not be completed.");
    } finally {
      setRegistering(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F6FAFB] px-4 py-6 text-[#041C32] sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_28px_100px_rgba(4,28,50,0.14)] lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative min-h-[360px] bg-[#041C32] p-8 text-white lg:min-h-screen lg:p-10">
          <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" src="https://i.postimg.cc/Zq9K4FPh/NGOpag-Bg.png" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#041C32]/95 via-[#064663]/84 to-cyan-700/72" />
          <div className="relative z-10 flex h-full flex-col">
            <Link className="flex items-center gap-3 text-white" to="/ngo">
              <img alt="" className="h-11 w-11 rounded-2xl bg-white object-cover" src="/Favicon.ico" />
              <span className="text-xl font-black">Maai organisation</span>
            </Link>
            <div className="my-auto py-12">
              <p className="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">NGO Partner Portal</p>
              <h1 className="mt-6 max-w-xl text-5xl font-black leading-none tracking-tight lg:text-6xl">Build healthcare impact with Maai.</h1>
              <p className="mt-5 max-w-lg text-base font-semibold leading-7 text-white/74">
                Register your organisation, request camps, and manage collaboration workflows from one focused workspace.
              </p>
            </div>
          </div>
        </aside>

        <div className="max-h-none overflow-y-auto bg-[#F6FAFB] p-5 sm:p-8 lg:max-h-screen lg:p-10">
          <div className="mb-7 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-black text-slate-500">
            <button className={`rounded-xl py-3 transition ${tab === "login" ? "bg-white text-cyan-700 shadow-sm" : ""}`} onClick={() => { setTab("login"); setMessage(""); }} type="button">
              NGO Login
            </button>
            <button className={`rounded-xl py-3 transition ${tab === "register" ? "bg-white text-cyan-700 shadow-sm" : ""}`} onClick={() => { setTab("register"); setMessage(""); }} type="button">
              Register Organisation
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form animate={{ opacity: 1, y: 0 }} className="mx-auto grid max-w-xl gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(4,28,50,0.07)]" exit={{ opacity: 0, y: -10 }} initial={{ opacity: 0, y: 10 }} key="login" onSubmit={submitLogin}>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Welcome back</p>
                  <h2 className="mt-2 text-3xl font-black">NGO Login</h2>
                </div>
                <label>
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Email</span>
                  <input className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" name="email" onChange={updateLogin} type="email" value={loginForm.email} />
                  {errors.email ? <p className="mt-1 text-xs font-bold text-rose-600">{errors.email}</p> : null}
                </label>
                <label>
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Password</span>
                  <input className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" name="password" onChange={updateLogin} type="password" value={loginForm.password} />
                  {errors.password ? <p className="mt-1 text-xs font-bold text-rose-600">{errors.password}</p> : null}
                </label>
                {message ? <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">{message}</p> : null}
                <button className="h-14 rounded-2xl bg-[#041C32] px-6 py-4 text-sm font-black text-white disabled:opacity-60" disabled={loginLoading} type="submit">
                  {loginLoading ? "Signing in..." : "Sign In"}
                </button>
              </motion.form>
            ) : (
              <motion.div animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} initial={{ opacity: 0, y: 10 }} key="register">
                <NgoRegister errors={errors} loading={registering} message={message} onSubmit={submitRegistration} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
