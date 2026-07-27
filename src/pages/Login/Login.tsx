import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineUserGroup } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();

    if (loading) return;

    if (!email.trim() || !password.trim()) {
      toast.warning("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-3 dark:bg-slate-950 sm:p-5 lg:p-8">

      {/* Ambient page texture — a faint dot grid across the whole canvas,
          so the two panels read as one composition rather than a 50/50 split */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(100,116,139,0.16) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(37,99,235,0.12) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(34,211,238,0.10) 0%, transparent 40%)",
        }}
      />

      <div className="relative flex w-full max-w-6xl items-stretch gap-5 lg:gap-8">

        {/* ---------- Visual panel ---------- */}

        <div className="group relative hidden w-[44%] max-w-[460px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#0B1220] p-8 shadow-2xl shadow-slate-900/20 ring-1 ring-white/[0.06] lg:flex lg:p-9">

          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 10%, rgba(37,99,235,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 90%, rgba(34,211,238,0.22) 0%, transparent 45%)",
            }}
          />

          {/* Brand mark */}
          <div className="relative flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <HiOutlineUserGroup size={17} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              Team Work
            </span>
          </div>

          {/* Floating glass composition */}
          <div className="relative flex flex-1 items-center justify-center py-10">

            <div className="absolute h-44 w-44 rounded-full bg-blue-500/25 blur-3xl" />

            {/* Back card — abstract bars */}
            <div className="absolute left-1 top-2 w-36 -rotate-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl backdrop-blur-md transition-transform duration-700 ease-out group-hover:-rotate-3">
              <div className="flex h-16 items-end gap-1.5">
                <span className="h-[40%] w-2 rounded-full bg-gradient-to-t from-blue-500 to-cyan-400" />
                <span className="h-[65%] w-2 rounded-full bg-gradient-to-t from-blue-500 to-cyan-400" />
                <span className="h-[45%] w-2 rounded-full bg-gradient-to-t from-blue-500 to-cyan-400" />
                <span className="h-[85%] w-2 rounded-full bg-gradient-to-t from-blue-500 to-cyan-400" />
                <span className="h-[55%] w-2 rounded-full bg-gradient-to-t from-blue-500 to-cyan-400" />
                <span className="h-[70%] w-2 rounded-full bg-gradient-to-t from-blue-500 to-cyan-400" />
              </div>
            </div>

            {/* Front card — progress ring */}
            <div className="relative z-10 w-[168px] translate-x-9 translate-y-3 rotate-3 rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-md transition-transform duration-700 ease-out group-hover:rotate-1">
              <svg viewBox="0 0 100 100" className="h-24 w-24">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="264"
                  strokeDashoffset="74"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
                <text x="50" y="56" textAnchor="middle" className="fill-white text-[22px] font-semibold">
                  72%
                </text>
              </svg>
            </div>

            {/* Floating dots */}
            <span className="login-dot absolute left-8 bottom-6 h-1.5 w-1.5 rounded-full bg-cyan-400" style={{ animationDelay: "0ms" }} />
            <span className="login-dot absolute right-10 top-3 h-1 w-1 rounded-full bg-blue-400" style={{ animationDelay: "600ms" }} />
            <span className="login-dot absolute right-2 bottom-14 h-1.5 w-1.5 rounded-full bg-blue-300" style={{ animationDelay: "1200ms" }} />

          </div>

          {/* Date */}
          <div className="relative">

            <p className="mt-2 text-[22px] font-semibold leading-tight tracking-tight text-white">
              {today}
            </p>
            <p className="mt-5 text-xs text-slate-600">
              Internal Team Portal
            </p>
          </div>

          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .login-dot { animation: loginTwinkle 3.2s ease-in-out infinite; }
            }
            @keyframes loginTwinkle {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.6); }
            }
          `}</style>

        </div>

        {/* ---------- Form panel ---------- */}

        <div className="flex flex-1 items-center justify-center">

          <div className="w-full max-w-sm animate-[loginFadeIn_0.5s_ease-out] rounded-[28px] border border-slate-200/70 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/60 dark:shadow-none sm:p-9">

            {/* Compact brand mark for mobile only */}
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/30">
                <HiOutlineUserGroup size={17} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                Team Work
              </span>
            </div>

            <h1 className="mb-8 text-[26px] font-semibold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>

            <form onSubmit={handleLogin} className="space-y-4">

              {/* Email */}

              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full rounded-2xl border border-slate-200 bg-white/70 px-4 pb-2.5 pt-5 text-[15px] text-slate-900 outline-none transition-all duration-200 placeholder-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white dark:focus:bg-slate-800/70 dark:focus:ring-blue-500/15"
                />
                <label
                  htmlFor="email"
                  className="pointer-events-none absolute left-4 top-2 text-[11px] font-medium text-blue-600 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-blue-500 dark:text-blue-400 dark:peer-placeholder-shown:text-slate-500"
                >
                  Email address
                </label>
              </div>

              {/* Password */}

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full rounded-2xl border border-slate-200 bg-white/70 px-4 pb-2.5 pt-5 pr-12 text-[15px] text-slate-900 outline-none transition-all duration-200 placeholder-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white dark:focus:bg-slate-800/70 dark:focus:ring-blue-500/15"
                />
                <label
                  htmlFor="password"
                  className="pointer-events-none absolute left-4 top-2 text-[11px] font-medium text-blue-600 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-blue-500 dark:text-blue-400 dark:peer-placeholder-shown:text-slate-500"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash size={18} />
                  ) : (
                    <HiOutlineEye size={18} />
                  )}
                </button>
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:focus-visible:ring-offset-slate-950"
              >
                {loading && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {loading ? "Signing in..." : "Sign in"}
              </button>

            </form>

            <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
              Team Report Tracker
            </p>

          </div>

        </div>

      </div>

      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

    </div>
  );
}