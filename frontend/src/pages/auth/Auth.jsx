import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getMembershipSettings, getRoleRedirect, registerNgo, registerVolunteer } from "../../services/authService";

const backgroundImage = "https://i.postimg.cc/KvgKDb3x/Volunteerportalbg.jpg";

const signupInitialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  city: "",
  college: "",
  course: "",
  academicYear: "",
  skills: "",
  interests: "",
  bio: "",
  transactionId: "",
};

const loginInitialForm = {
  email: "",
  password: "",
  remember: true,
};

const ngoInitialForm = {
  organizationName: "",
  registrationNumber: "",
  ngoType: "healthcare",
  email: "",
  password: "",
  phone: "",
  website: "",
  city: "",
  state: "",
  address: "",
  mission: "",
  description: "",
  logoUrl: "",
  coverUrl: "",
};

const ngoSteps = [
  { label: "Organization", fields: ["organizationName", "registrationNumber", "ngoType"] },
  { label: "Contact", fields: ["email", "password", "phone", "website", "city", "state", "address"] },
  { label: "Profile", fields: ["mission", "description", "logoUrl", "coverUrl"] },
];

const signupSteps = [
  { label: "Account", fields: ["fullName", "email", "password", "confirmPassword"] },
  { label: "Personal", fields: ["phone", "city", "college", "course", "academicYear"] },
  { label: "Community", fields: ["skills", "interests", "bio", "transactionId"] },
];

const formVariants = {
  enter: { opacity: 0, x: 28, filter: "blur(6px)" },
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -28, filter: "blur(6px)" },
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function validateSignupStep(form, stepIndex, membershipSettings = null) {
  const errors = {};

  if (stepIndex === 0) {
    if (!form.fullName.trim()) errors.fullName = "Full name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    if (form.email.trim() && !isValidEmail(form.email)) errors.email = "Enter a valid email.";
    if (!form.password) errors.password = "Password is required.";
    if (form.password && form.password.length < 8) errors.password = "Use at least 8 characters.";
    if (!form.confirmPassword) errors.confirmPassword = "Confirm your password.";
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
  }

  if (stepIndex === 1) {
    if (!form.phone.trim()) errors.phone = "Phone is required.";
    if (!form.city.trim()) errors.city = "City is required.";
  }

  return errors;
}

function getStepForErrors(errors) {
  const firstKey = Object.keys(errors)[0];
  const index = signupSteps.findIndex((step) => step.fields.includes(firstKey));
  return index === -1 ? 0 : index;
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-xs font-semibold text-rose-600">{message}</p>;
}

function TextField({ error, label, name, onChange, type = "text", value, rightSlot }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500 pl-2">
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
          className={`h-12 w-full min-w-0 bg-transparent py-3 pl-6 ${
  rightSlot ? "pr-24" : "pr-6"
} text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400`}
          name={name}
          onChange={onChange}
          type={type}
          value={value}
          placeholder={label}
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

function TextAreaField({ error, label, name, onChange, value }) {
  return (
    <label className="block min-w-0 md:col-span-2">
      <div
        className={`relative flex min-h-28 flex-col justify-end rounded-2xl border bg-white/90 px-5 pb-3 pt-2 shadow-sm transition-all duration-200 ${
          error
            ? "border-rose-300 ring-4 ring-rose-100"
            : "border-slate-200 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100"
        }`}
      >
        <span className="pointer-events-none absolute left-6 top-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>
        <textarea
          className="min-h-20 w-full min-w-0 resize-y bg-transparent px-1 text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
          name={name}
          onChange={onChange}
          value={value}
        />
      </div>
      <FieldError message={error} />
    </label>
  );
}

function ModeToggle({ mode, setMode }) {
  return (
    <div className="relative mb-8 grid h-12 grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-extrabold text-slate-500">
      <motion.div
        animate={{ x: mode === "login" ? "0%" : "100%" }}
        className="absolute left-1 top-1 h-10 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-sm"
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      />
      <button
        className={`relative z-10 rounded-xl transition ${mode === "login" ? "text-cyan-700" : ""}`}
        onClick={() => setMode("login")}
        type="button"
      >
        Login
      </button>
      <button
        className={`relative z-10 rounded-xl transition ${mode === "signup" ? "text-cyan-700" : ""}`}
        onClick={() => setMode("signup")}
        type="button"
      >
        Sign Up
      </button>
    </div>
  );
}

function SignupStepper({ activeStep }) {
  return (
    <div className="mb-7 flex items-start">
      {signupSteps.map((step, index) => {
        const active = index === activeStep;
        const done = index < activeStep;
        return (
          <div className="flex flex-1 items-center" key={step.label}>
            <div className="flex min-w-14 flex-col items-center">
              <div
                className={`grid h-9 w-9 place-items-center rounded-full text-xs font-black transition ${
                  active || done
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? "✓" : index + 1}
              </div>
              <span className={`mt-2 text-[10px] font-black uppercase tracking-[0.1em] ${active ? "text-cyan-700" : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
            {index < signupSteps.length - 1 ? (
              <div className="mb-5 h-0.5 flex-1 rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all ${
                    done ? "w-full" : "w-0"
                  }`}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, loginNgoAccount, loading } = useAuth();
  const rawMode = searchParams.get("mode");
  const queryMode = rawMode === "signup" || rawMode === "ngo-signup" || rawMode === "ngo-login" ? rawMode : "login";
  const mode = queryMode;
  const [loginForm, setLoginForm] = useState(loginInitialForm);
  const [signupForm, setSignupForm] = useState(signupInitialForm);
  const [ngoForm, setNgoForm] = useState(ngoInitialForm);
  const [signupStep, setSignupStep] = useState(0);
  const [ngoStep, setNgoStep] = useState(0);
  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  const [ngoErrors, setNgoErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);
  const [membershipSettings, setMembershipSettings] = useState({ paymentsEnabled: false });

  useEffect(() => {
    getMembershipSettings()
      .then((settings) => setMembershipSettings(settings || { paymentsEnabled: false }))
      .catch(() => setMembershipSettings({ paymentsEnabled: false }));
  }, []);

  useEffect(() => {
    console.log("Current step:", signupStep + 1);
  }, [signupStep]);

  function setMode(nextMode) {
    setMessage("");
    navigate(`/auth?mode=${nextMode}`, { replace: false });
  }

  function updateLoginField(event) {
    const { checked, name, type, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setLoginErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
  }

  function updateSignupField(event) {
    const { name, value } = event.target;
    setSignupForm((current) => ({ ...current, [name]: value }));
    setSignupErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
  }

  function updateNgoField(event) {
    const { name, value } = event.target;
    setNgoForm((current) => ({ ...current, [name]: value }));
    setNgoErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!loginForm.email.trim()) nextErrors.email = "Email is required.";
    if (!loginForm.password) nextErrors.password = "Password is required.";

    if (Object.keys(nextErrors).length > 0) {
      setLoginErrors(nextErrors);
      return;
    }

    try {
      const { user } = mode === "ngo-login"
        ? await loginNgoAccount({ email: loginForm.email, password: loginForm.password })
        : await login({ email: loginForm.email, password: loginForm.password });
      navigate(location.state?.from?.pathname || getRoleRedirect(user));
    } catch (error) {
      const payload = error?.response?.data;
      setLoginErrors(payload?.errors || {});
      setMessage(payload?.message || "Login failed. Please try again.");
    }
  }

  function validateNgoStep(stepIndex) {
    const errors = {};
    if (stepIndex === 0) {
      if (!ngoForm.organizationName.trim()) errors.organizationName = "Organization name is required.";
      if (!ngoForm.registrationNumber.trim()) errors.registrationNumber = "Registration number is required.";
    }
    if (stepIndex === 1) {
      if (!ngoForm.email.trim()) errors.email = "Email is required.";
      if (ngoForm.email.trim() && !isValidEmail(ngoForm.email)) errors.email = "Enter a valid email.";
      if (!ngoForm.password) errors.password = "Password is required.";
      if (ngoForm.password && ngoForm.password.length < 8) errors.password = "Use at least 8 characters.";
      if (!ngoForm.phone.trim()) errors.phone = "Phone is required.";
      if (!ngoForm.city.trim()) errors.city = "City is required.";
    }
    return errors;
  }

  function continueNgoSignup() {
    const nextErrors = validateNgoStep(ngoStep);
    if (Object.keys(nextErrors).length > 0) {
      setNgoErrors(nextErrors);
      return;
    }
    setNgoErrors({});
    setNgoStep((current) => Math.min(current + 1, ngoSteps.length - 1));
  }

  function backNgoSignup() {
    setNgoErrors({});
    setNgoStep((current) => Math.max(current - 1, 0));
  }

  async function handleNgoSignupSubmit(event) {
    event.preventDefault();
    const allErrors = ngoSteps.reduce((acc, _step, index) => ({ ...acc, ...validateNgoStep(index) }), {});
    if (Object.keys(allErrors).length > 0) {
      setNgoErrors(allErrors);
      const firstKey = Object.keys(allErrors)[0];
      setNgoStep(Math.max(ngoSteps.findIndex((step) => step.fields.includes(firstKey)), 0));
      return;
    }
    setIsSignupSubmitting(true);
    try {
      await registerNgo(ngoForm);
      await loginNgoAccount({ email: ngoForm.email, password: ngoForm.password });
      navigate("/ngo/dashboard", { replace: true });
    } catch (error) {
      setNgoErrors(error?.response?.data?.errors || {});
      setMessage(error?.response?.data?.message || "NGO registration failed.");
    } finally {
      setIsSignupSubmitting(false);
    }
  }

  function continueSignup() {
    console.log("Current step:", signupStep + 1);
    const nextErrors = validateSignupStep(signupForm, signupStep, membershipSettings);
    if (Object.keys(nextErrors).length > 0) {
      setSignupErrors(nextErrors);
      return;
    }
    setSignupErrors({});
    setSignupStep((current) => Math.min(current + 1, signupSteps.length - 1));
  }

  function backSignup() {
    setSignupErrors({});
    setSignupStep((current) => Math.max(current - 1, 0));
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();
    console.log("Current step:", signupStep + 1);
    if (signupStep < signupSteps.length - 1) {
      continueSignup();
      return;
    }

    const allErrors = signupSteps.reduce(
      (acc, _step, index) => ({ ...acc, ...validateSignupStep(signupForm, index, membershipSettings) }),
      {},
    );

    if (Object.keys(allErrors).length > 0) {
      setSignupErrors(allErrors);
      setSignupStep(getStepForErrors(allErrors));
      return;
    }

    setIsSignupSubmitting(true);
    setMessage("");
    try {
      await registerVolunteer(signupForm);
      await login({ email: signupForm.email, password: signupForm.password });
      setSignupForm(signupInitialForm);
      setSignupStep(0);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const payload = error?.response?.data;
      const nextErrors = payload?.errors || {};
      setSignupErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) setSignupStep(getStepForErrors(nextErrors));
      setMessage(payload?.message || "Registration failed. Please try again.");
    } finally {
      setIsSignupSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center overflow-x-hidden bg-gradient-to-br from-[#f5fbff] via-white to-[#fff5fb] px-5 py-8 text-slate-950 sm:px-6">
      <div className="pointer-events-none fixed -left-24 top-8 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 right-0 h-80 w-80 rounded-full bg-pink-200/35 blur-3xl" />

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 grid w-full max-w-[1120px] mx-4 sm:mx-6 overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-xl lg:h-[min(700px,calc(100vh-120px))] lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr] lg:shadow-[0_28px_100px_rgba(15,23,42,0.18)]"
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <aside className="relative order-2 flex h-[300px] min-w-0 items-center justify-center overflow-hidden lg:order-2 lg:h-auto lg:min-h-full">
          <img alt="" className="absolute inset-0 h-full w-full object-cover" src={backgroundImage} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,60,.55),rgba(100,40,170,.45))]" />
          <div className="absolute inset-0 z-[5] flex items-end justify-center p-6 text-center text-white sm:p-8 lg:items-center lg:p-12">
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-5 lg:max-w-[470px]">
            <p className="mb-1 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] backdrop-blur-xl">
              Volunteer Ecosystem
            </p>
            <h2 className="m-0 max-w-full text-4xl font-extrabold leading-[1.02] tracking-tight [overflow-wrap:break-word] [word-break:normal] sm:text-5xl lg:max-w-[470px] lg:text-6xl">
              Create measurable impact
            </h2>
            <p className="m-0 max-w-full text-lg font-semibold leading-[1.55] text-white/90 lg:max-w-[470px]">
              Join a trusted volunteer ecosystem.
            </p>
            <div className="mt-2 flex w-[300px] max-w-full flex-col items-center gap-3 rounded-[22px] border border-white/20 bg-white/15 p-[18px] text-center shadow-[0_18px_50px_rgba(15,23,42,0.22)] backdrop-blur-[16px]">
              <p className="m-0 text-sm font-bold text-white/90">
                {mode === "login" ? "New here?" : "Already have account?"}
              </p>
              <button
                className="inline-flex h-10 min-w-36 items-center justify-center rounded-full border-0 bg-white px-5 text-sm font-extrabold text-slate-950 shadow-sm transition hover:bg-cyan-50"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                type="button"
              >
                {mode === "login" ? "Create account" : "Sign In"}
              </button>
            </div>
            </div>
          </div>
        </aside>

        <div className="order-1 flex min-w-0 items-center justify-center overflow-y-auto bg-[#f7fbfd] px-6 py-8 sm:px-8 md:px-10 lg:order-1 lg:px-16 lg:py-14">
          <div className="w-full max-w-[460px]">
          <Link className="mb-7 flex items-center gap-3 font-black tracking-tight text-slate-950" to="/volunteer">
            <img alt="" aria-hidden="true" className="h-10 w-10 rounded-full shadow-sm" src="/Favicon.ico" />
            <span className="text-2xl">Maai organisation</span>
          </Link>

          {mode === "ngo-signup" || mode === "ngo-login" ? (
            <div className="mb-8 grid gap-2 rounded-2xl bg-slate-100 p-2 text-sm font-extrabold text-slate-600">
              <button className={mode === "ngo-login" ? "rounded-xl bg-white py-2 text-cyan-700" : "rounded-xl py-2"} onClick={() => setMode("ngo-login")} type="button">NGO Login</button>
              <button className={mode === "ngo-signup" ? "rounded-xl bg-white py-2 text-cyan-700" : "rounded-xl py-2"} onClick={() => setMode("ngo-signup")} type="button">NGO Registration</button>
            </div>
          ) : (
            <ModeToggle mode={mode} setMode={setMode} />
          )}

          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-600">
            {mode === "ngo-signup" ? "NGO Registration" : mode === "ngo-login" ? "NGO Login" : mode === "login" ? "Member Login" : "Volunteer Signup"}
          </p>
            <h1 className="mt-4 text-5xl font-black leading-[0.96] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-[64px]">
            {mode === "login" || mode === "ngo-login" ? "Welcome " : "Join the "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
              {mode === "login" || mode === "ngo-login" ? "Back" : mode === "ngo-signup" ? "Network" : "Movement"}
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base font-medium leading-7 text-slate-500">
            {mode === "login"
              ? "Continue your impact journey with Maai organisation."
              : mode === "ngo-login"
                ? "Access your NGO collaboration dashboard."
                : mode === "ngo-signup"
                  ? "Register your organization for partnerships, camp requests, and collaboration workflows."
              : "Become part of community-driven healthcare initiatives and meaningful field impact."}
          </p>

            <div className="mt-8">
            <AnimatePresence mode="wait">
              {mode === "login" || mode === "ngo-login" ? (
                <motion.form
                  animate="center"
                  className="grid gap-5"
                  exit="exit"
                  initial="enter"
                    key={mode}
                  onSubmit={handleLoginSubmit}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  variants={formVariants}
                >
                  <TextField
                    error={loginErrors.email}
                    label="Email"
                    name="email"
                    onChange={updateLoginField}
                    type="email"
                    value={loginForm.email}
                  />
                  <TextField
                    error={loginErrors.password}
                    label="Password"
                    name="password"
                    onChange={updateLoginField}
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
                    value={loginForm.password}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-semibold text-slate-500">
                    <label className="inline-flex items-center gap-3">
                      <input
                        checked={loginForm.remember}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-400"
                        name="remember"
                        onChange={updateLoginField}
                        type="checkbox"
                      />
                      Remember me
                    </label>
                    <button className="font-extrabold text-cyan-700 hover:text-blue-700" type="button">
                      Forgot password?
                    </button>
                  </div>

                  {message ? (
                    <p className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700">
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
                  <p className="text-sm font-semibold text-slate-500">
                    {mode === "ngo-login" ? "New NGO?" : "New member?"}{" "}
                    <button className="font-extrabold text-cyan-700" onClick={() => setMode(mode === "ngo-login" ? "ngo-signup" : "signup")} type="button">
                      {mode === "ngo-login" ? "Register NGO" : "Create account"}
                    </button>
                  </p>
                </motion.form>
              ) : mode === "ngo-signup" ? (
                <motion.form animate="center" exit="exit" initial="enter" key="ngo-signup" onSubmit={handleNgoSignupSubmit} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} variants={formVariants}>
                  <SignupStepper activeStep={ngoStep} />
                  <div className="grid gap-4 md:grid-cols-2">
                    {ngoStep === 0 ? (
                      <>
                        <TextField error={ngoErrors.organizationName} label="Organization Name" name="organizationName" onChange={updateNgoField} value={ngoForm.organizationName} />
                        <TextField error={ngoErrors.registrationNumber} label="Registration Number" name="registrationNumber" onChange={updateNgoField} value={ngoForm.registrationNumber} />
                        <label className="block">
                          <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500 pl-2">NGO Type</span>
                          <select className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-base font-semibold outline-none" name="ngoType" onChange={updateNgoField} value={ngoForm.ngoType}>
                            {["healthcare", "education", "community", "research", "environment", "other"].map((type) => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </label>
                      </>
                    ) : null}
                    {ngoStep === 1 ? (
                      <>
                        <TextField error={ngoErrors.email} label="Email" name="email" onChange={updateNgoField} type="email" value={ngoForm.email} />
                        <TextField error={ngoErrors.password} label="Password" name="password" onChange={updateNgoField} type="password" value={ngoForm.password} />
                        <TextField error={ngoErrors.phone} label="Phone" name="phone" onChange={updateNgoField} value={ngoForm.phone} />
                        <TextField error={ngoErrors.website} label="Website" name="website" onChange={updateNgoField} type="url" value={ngoForm.website} />
                        <TextField error={ngoErrors.city} label="City" name="city" onChange={updateNgoField} value={ngoForm.city} />
                        <TextField error={ngoErrors.state} label="State" name="state" onChange={updateNgoField} value={ngoForm.state} />
                        <TextAreaField error={ngoErrors.address} label="Address" name="address" onChange={updateNgoField} value={ngoForm.address} />
                      </>
                    ) : null}
                    {ngoStep === 2 ? (
                      <>
                        <TextAreaField error={ngoErrors.mission} label="Mission" name="mission" onChange={updateNgoField} value={ngoForm.mission} />
                        <TextAreaField error={ngoErrors.description} label="Description" name="description" onChange={updateNgoField} value={ngoForm.description} />
                        <TextField error={ngoErrors.logoUrl} label="Logo URL" name="logoUrl" onChange={updateNgoField} type="url" value={ngoForm.logoUrl} />
                        <TextField error={ngoErrors.coverUrl} label="Cover URL" name="coverUrl" onChange={updateNgoField} type="url" value={ngoForm.coverUrl} />
                      </>
                    ) : null}
                  </div>
                  {message ? <p className="mt-5 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700">{message}</p> : null}
                  <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-200/70 pt-5">
                    <button className={`h-12 shrink-0 rounded-full bg-slate-100 px-6 text-sm font-extrabold text-slate-600 ${ngoStep === 0 ? "invisible" : ""}`} onClick={backNgoSignup} type="button">Back</button>
                    {ngoStep < ngoSteps.length - 1 ? (
                      <button className="h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-7 text-sm font-extrabold text-white" onClick={continueNgoSignup} type="button">Continue</button>
                    ) : (
                      <button className="h-12 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 px-7 text-sm font-extrabold text-white disabled:opacity-70" disabled={isSignupSubmitting} type="submit">{isSignupSubmitting ? "Registering..." : "Register NGO"}</button>
                    )}
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  animate="center"
                  exit="exit"
                  initial="enter"
                  key="signup"
                  onSubmit={handleSignupSubmit}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  variants={formVariants}
                >
                  <SignupStepper activeStep={signupStep} />

                  <AnimatePresence mode="wait">
                    <motion.div
                      animate="center"
                      className="grid gap-4 md:grid-cols-2"
                      exit="exit"
                      initial="enter"
                      key={signupStep}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      variants={formVariants}
                    >
                      {signupStep === 0 ? (
                        <>
                          <TextField error={signupErrors.fullName} label="Full Name" name="fullName" onChange={updateSignupField} value={signupForm.fullName} />
                          <TextField error={signupErrors.email} label="Email" name="email" onChange={updateSignupField} type="email" value={signupForm.email} />
                          <TextField error={signupErrors.password} label="Password" name="password" onChange={updateSignupField} type="password" value={signupForm.password} />
                          <TextField error={signupErrors.confirmPassword} label="Confirm Password" name="confirmPassword" onChange={updateSignupField} type="password" value={signupForm.confirmPassword} />
                        </>
                      ) : null}

                      {signupStep === 1 ? (
                        <>
                          <TextField error={signupErrors.phone} label="Phone" name="phone" onChange={updateSignupField} value={signupForm.phone} />
                          <TextField error={signupErrors.city} label="City" name="city" onChange={updateSignupField} value={signupForm.city} />
                          <TextField error={signupErrors.college} label="College" name="college" onChange={updateSignupField} value={signupForm.college} />
                          <TextField error={signupErrors.course} label="Course" name="course" onChange={updateSignupField} value={signupForm.course} />
                          <TextField error={signupErrors.academicYear} label="Year" name="academicYear" onChange={updateSignupField} value={signupForm.academicYear} />
                        </>
                      ) : null}

                      {signupStep === 2 ? (
                        <>
                          <TextAreaField error={signupErrors.skills} label="Skills" name="skills" onChange={updateSignupField} value={signupForm.skills} />
                          <TextAreaField error={signupErrors.interests} label="Interests" name="interests" onChange={updateSignupField} value={signupForm.interests} />
                          <TextAreaField error={signupErrors.bio} label="Bio" name="bio" onChange={updateSignupField} value={signupForm.bio} />
                          {membershipSettings?.paymentsEnabled ? (
                            <div className="md:col-span-2 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
                              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{membershipSettings.membershipName || membershipSettings.membership_name || "Membership Fee"}</p>
                              <p className="mt-2 text-2xl font-black text-slate-950">{membershipSettings.currency || "INR"} {membershipSettings.membershipFee || 0}</p>
                              {membershipSettings.upiQrUrl ? (
                                <img alt="UPI QR" className="mt-4 h-36 w-36 rounded-2xl border border-white bg-white object-cover" src={membershipSettings.upiQrUrl} />
                              ) : null}
                              {membershipSettings.paymentInstructions || membershipSettings.instructions ? (
                                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{membershipSettings.paymentInstructions || membershipSettings.instructions}</p>
                              ) : null}
                              <div className="mt-4">
                                <TextField error={signupErrors.transactionId} label="Transaction ID" name="transactionId" onChange={updateSignupField} value={signupForm.transactionId} />
                              </div>
                            </div>
                          ) : (
                            <div className="md:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Membership</p>
                              <p className="mt-2 text-2xl font-black text-slate-950">Free</p>
                              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                                Continue registration now. Payment status will be saved as free with transaction ID FREE.
                              </p>
                            </div>
                          )}
                        </>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>

                  {message ? (
                    <p className="mt-5 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700">
                      {message}
                    </p>
                  ) : null}

                  <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-200/70 pt-5">
                    <button
                      className={`h-12 shrink-0 rounded-full bg-slate-100 px-6 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200 ${
                        signupStep === 0 ? "invisible" : ""
                      }`}
                      onClick={backSignup}
                      type="button"
                    >
                      Back
                    </button>

                    {signupStep < signupSteps.length - 1 ? (
                      <motion.button
                        className="h-12 shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-7 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20"
                        onClick={continueSignup}
                        type="button"
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Continue
                      </motion.button>
                    ) : (
                      <motion.button
                        className="h-12 shrink-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 px-7 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={isSignupSubmitting}
                        type="submit"
                        whileHover={isSignupSubmitting ? undefined : { y: -2, scale: 1.02 }}
                        whileTap={isSignupSubmitting ? undefined : { scale: 0.98 }}
                      >
                        {isSignupSubmitting ? "Registering..." : "Register"}
                      </motion.button>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>
      </motion.section>
    </main>
  );
}
