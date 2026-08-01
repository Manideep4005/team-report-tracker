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
    // Full-bleed, edge to edge — one screen, not a card centered on a page.
    <div className="flex min-h-screen w-full bg-white dark:bg-[#09090b]">

      {/* ---------- Left half: fills the entire left side of the viewport ---------- */}

      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#09090b] px-14 py-12 lg:flex xl:px-20 border-r border-zinc-900">

        {/* Fine line grid, subtle, contained to this half only */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #2563EB 0%, transparent 70%)" }}
        />

        {/* Brand mark */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <HiOutlineUserGroup size={16} />
          </div>
          <span className="text-xs font-bold tracking-tight text-white">
            Team Work
          </span>
        </div>

        {/* Typographic hero — the centerpiece of this half, not a floating widget */}
        <div className="relative max-w-sm">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            Every report,
            <br />
            one place.
          </h2>
          <p className="mt-4 text-xs leading-relaxed text-zinc-400">
            Track submissions across the whole team without chasing a single spreadsheet.
          </p>

          {/* Signature: single sparkline, sits directly on the panel — no card around it */}
          <div className="mt-10">
            <svg viewBox="0 0 240 64" className="h-16 w-full max-w-[240px]" fill="none">
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
              <circle cx="236" cy="12" r="3" fill="#22D3EE" />
              <circle cx="236" cy="12" r="3" fill="#22D3EE" className="login-spark-dot" />
            </svg>
            <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
              Weekly submissions, trending up
            </p>
          </div>
        </div>

        {/* Footer: date + status, flush with the panel edge */}
        <div className="relative flex items-center justify-between border-t border-white/[0.05] pt-6">
          <div>
            <p className="text-xs font-semibold text-white">{today}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-zinc-500">Internal Team Portal</p>
          </div>
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
            0%, 100% { opacity: 1; r: 3; }
            50% { opacity: 0; r: 7; }
          }
          @media (prefers-reduced-motion: reduce) {
            .login-spark { stroke-dashoffset: 0; animation: none; }
            .login-spark-dot { animation: none; }
          }
        `}</style>

      </div>

      {/* ---------- Right half: form sits directly on the page, no card, no border ---------- */}

      <div className="flex w-full flex-col justify-center px-8 sm:px-16 lg:w-1/2 lg:px-20 xl:px-24">

        <div className="w-full max-w-[340px] animate-[loginFadeIn_0.4s_ease-out]">

          {/* Compact brand mark for mobile only */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <HiOutlineUserGroup size={16} />
            </div>
            <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
              Team Work
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Welcome back
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-zinc-500">
            Sign in to log or review today&rsquo;s reports.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">

            {/* Email */}

            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            {/* Password */}

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-650 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <HiOutlineEyeSlash size={16} /> : <HiOutlineEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary !mt-6 w-full py-2.5 text-xs font-semibold"
            >
              {loading && (
                <svg className="mr-1.5 h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
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

          <p className="mt-12 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-650">
            Team Report Tracker
          </p>

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