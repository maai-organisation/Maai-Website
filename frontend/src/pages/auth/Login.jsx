import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getRoleRedirect } from "../../services/authService";

const backgroundImage = "https://i.postimg.cc/KvgKDb3x/Volunteerportalbg.jpg";

const initialForm = {
  email: "",
  password: "",
  remember: true,
};

function TextField({ error, label, name, onChange, type = "text", value, rightSlot }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500 pl-1">
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-2xl border bg-white/90 shadow-sm transition-all duration-200 ${
          error
            ? "border-rose-300 ring-4 ring-rose-100"
            : "border-slate-200 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100"
        }`}
      >
        <input
          className={`h-12 w-full min-w-0 bg-transparent py-3 pl-5 ${
  rightSlot ? "pr-24" : "pr-5"
} text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400`}
          name={name}
          onChange={onChange}
          placeholder={label}
          type={type}
          value={value}
        />
        {rightSlot && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function updateField(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!form.password) nextErrors.password = "Password is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const { user } = await login({ email: form.email, password: form.password });
      navigate(location.state?.from?.pathname || getRoleRedirect(user));
    } catch (error) {
      const payload = error?.response?.data;
      setErrors(payload?.errors || {});
      setMessage(payload?.message || "Login failed. Please try again.");
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f8fb] px-6 py-10 text-slate-950">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="fixed inset-0 bg-gradient-to-br from-[#f5fbff]/90 via-white/82 to-[#fff5fb]/86" />

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto grid min-h-[760px] w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/60 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.16)] lg:grid-cols-[1.02fr_0.98fr]"
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex min-w-0 flex-col justify-center bg-[#f7fbfd] px-8 py-10 sm:px-12 lg:px-14">
          <Link className="mb-10 flex items-center gap-3 font-black tracking-tight text-slate-950" to="/volunteer">
            <img alt="" aria-hidden="true" className="h-10 w-10 rounded-full shadow-sm" src="/Favicon.ico" />
            <span className="text-2xl">Maai organisation</span>
          </Link>

          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-600">Member Login</p>
          <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950">
            Welcome{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
              Back
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base font-medium leading-7 text-slate-500">
            Continue your impact journey with Maai organisation.
          </p>

          <form className="mt-10 grid gap-5" onSubmit={handleSubmit}>
            <TextField
              error={errors.email}
              label="Email"
              name="email"
              onChange={updateField}
              type="email"
              value={form.email}
            />
            <TextField
              error={errors.password}
              label="Password"
              name="password"
              onChange={updateField}
              rightSlot={
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-extrabold text-cyan-700 transition hover:bg-cyan-50"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              }
              type={showPassword ? "text" : "password"}
              value={form.password}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-semibold text-slate-500">
              <label className="inline-flex items-center gap-3">
                <input
                  checked={form.remember}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-400"
                  name="remember"
                  onChange={updateField}
                  type="checkbox"
                />
                Remember me
              </label>
              <button className="font-extrabold text-cyan-700 hover:text-blue-700" type="button">
                Forgot password?
              </button>
            </div>

            {message ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-bold text-rose-700">
                {message}
              </p>
            ) : null}

            <motion.button
              className="mt-3 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 px-8 text-base font-extrabold text-white shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              type="submit"
              whileHover={loading ? undefined : { y: -2, scale: 1.02 }}
              whileTap={loading ? undefined : { scale: 0.98 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>
        </div>

        <aside className="relative hidden overflow-hidden lg:block">
  <img
    alt=""
    className="absolute inset-0 h-full w-full object-cover"
    src={backgroundImage}
  />

  <div className="absolute inset-0 bg-gradient-to-br from-[#0f172acc] via-[#1e3a8aa8] to-[#9333ea85]" />

  <div className="absolute inset-0 flex items-center justify-center p-12 z-10">

    <div className="flex w-full max-w-[520px] flex-col items-center text-center">

      <span className="
        mb-8
        rounded-full
        border border-white/20
        bg-white/10
        px-5 py-2
        text-xs
        font-extrabold
        uppercase
        tracking-[0.18em]
        backdrop-blur-xl
      ">
        Volunteer Ecosystem
      </span>

      <h2 className="
        text-6xl
        font-black
        leading-[0.92]
        tracking-[-0.04em]
        text-white
      ">
        Create measurable impact
      </h2>

      <p className="
        mt-7
        max-w-[430px]
        text-lg
        leading-8
        text-white/80
      ">
        Join a trusted community of volunteers supporting
        healthcare outreach, field camps and local care initiatives.
      </p>

      <div className="
        mt-10
        w-full
        rounded-[28px]
        border border-white/20
        bg-white/10
        p-6
        backdrop-blur-xl
      ">
        <p className="text-sm font-bold text-white/70">
          New here?
        </p>

        <div className="
          mt-4
          flex
          items-center
          justify-between
        ">
          <div>
            <p className="text-xl font-black">
              Create account
            </p>

            <p className="text-sm text-white/70">
              Join Maai organisation
            </p>
          </div>

          <Link
            to="/auth?mode=signup"
            className="
              rounded-full
              bg-white
              px-6 py-3
              text-sm
              font-extrabold
              text-slate-950
            "
          >
            Register
          </Link>
        </div>

      </div>

    </div>

  </div>
</aside>
      </motion.section>
    </main>
  );
}
