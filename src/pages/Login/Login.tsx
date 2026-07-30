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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-3 dark:bg-slate-950 sm:p-5 lg:p-8">

      <div className="flex w-full max-w-6xl items-stretch gap-5 lg:gap-8">

        {/* ---------- Hero panel ---------- */}

        <div className="relative hidden w-[46%] max-w-[480px] flex-col justify-between overflow-hidden rounded-[24px] bg-[#0B1220] p-9 lg:flex lg:p-11">

          {/* Fine line grid — restricted to the panel, very subtle */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #2563EB 0%, transparent 70%)" }}
          />

          {/* Brand mark */}
          <div className="relative flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
              <HiOutlineUserGroup size={16} />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-white">
              Team Work
            </span>
          </div>

          {/* Typographic hero */}
          <div className="relative py-10">
            <h2 className="text-[34px] font-semibold leading-[1.15] tracking-tight text-white">
              Every report,
              <br />
              one place.
            </h2>
            <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-slate-400">
              Track submissions across the whole team without chasing a single spreadsheet.
            </p>

            {/* Signature: single sparkline, not a mockup dashboard */}
            <div className="mt-9">
              <svg viewBox="0 0 240 64" className="h-16 w-full max-w-[260px]" fill="none">
                <defs>
                  <linearGradient id="sparkGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>
                <path
                  d="M4 46 C 30 46, 34 20, 58 24 S 90 50, 116 40 S 150 10, 178 16 S 216 34, 236 12"
                  stroke="url(#sparkGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="login-spark"
                />
                <circle cx="236" cy="12" r="3.5" fill="#22D3EE" />
                <circle cx="236" cy="12" r="3.5" fill="#22D3EE" className="login-spark-dot" />
              </svg>
              <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                Weekly submissions, trending up
              </p>
            </div>
          </div>

          {/* Footer: date + status */}
          <div className="relative flex items-center justify-between border-t border-white/[0.06] pt-5">
            <div>
              <p className="text-[13px] font-medium text-white">{today}</p>
              <p className="mt-0.5 text-[12px] text-slate-500">Internal Team Portal</p>
            </div>
            {/* <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-slate-400">All systems normal</span>
            </div> */}
          </div>

          <style>{`
            .login-spark {
              stroke-dasharray: 320;
              stroke-dashoffset: 320;
              animation: sparkDraw 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            .login-spark-dot {
              animation: sparkPulse 2.2s ease-in-out 1.4s infinite;
            }
            @keyframes sparkDraw {
              to { stroke-dashoffset: 0; }
            }
            @keyframes sparkPulse {
              0%, 100% { opacity: 1; r: 3.5; }
              50% { opacity: 0; r: 8; }
            }
            @media (prefers-reduced-motion: reduce) {
              .login-spark { stroke-dashoffset: 0; animation: none; }
              .login-spark-dot { animation: none; }
            }
          `}</style>

        </div>

        {/* ---------- Form panel ---------- */}

        <div className="flex flex-1 items-center justify-center">

          <div className="w-full max-w-sm animate-[loginFadeIn_0.4s_ease-out] rounded-[24px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 sm:p-9">

            {/* Compact brand mark for mobile only */}
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
                <HiOutlineUserGroup size={16} />
              </div>
              <span className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white">
                Team Work
              </span>
            </div>

            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              Sign in to log or review today&rsquo;s reports.
            </p>

            <form onSubmit={handleLogin} className="mt-7 space-y-3.5">

              {/* Email */}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-medium text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[14px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                />
              </div>

              {/* Password */}

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-[12.5px] font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-[14px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <HiOutlineEyeSlash size={17} /> : <HiOutlineEye size={17} />}
                  </button>
                </div>
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="!mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
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

            <p className="mt-8 text-center text-[12px] text-slate-400 dark:text-slate-600">
              Team Report Tracker
            </p>

          </div>

        </div>

      </div>

      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}