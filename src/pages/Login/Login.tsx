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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ---------- Brand rail (signature element lives here) ---------- */}

      <div className="relative hidden w-[42%] max-w-[520px] flex-col justify-between overflow-hidden bg-[#0B1220] px-12 py-10 lg:flex">

        {/* Ambient grid glow — pure decoration, kept quiet */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #2563EB 0%, transparent 45%), radial-gradient(circle at 80% 75%, #22D3EE 0%, transparent 40%)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <HiOutlineUserGroup size={20} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            Team Work
          </span>
        </div>

        <div className="relative">

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
            {today}
          </p>

          <h2 className="mt-4 max-w-xs text-[28px] font-bold leading-tight tracking-tight text-white">
            See who's checked in, before you check in.
          </h2>

          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            One line a day, from every teammate. No status meetings,
            no chasing people down.
          </p>

          {/* Signature: check-in pulse grid, mirrors the Team Status
              feature on the dashboard — dots light up in sequence to
              suggest teammates reporting in throughout the day. */}
          <div
            className="mt-8 grid grid-cols-6 gap-2.5"
            role="presentation"
            aria-hidden="true"
          >
            {Array.from({ length: 18 }).map((_, i) => {
              const lit = i % 3 !== 2;
              return (
                <span
                  key={i}
                  className={`checkin-dot h-2.5 w-2.5 rounded-full motion-safe:animate-[none] ${lit ? "bg-blue-500" : "bg-slate-700"
                    }`}
                  style={{
                    animationDelay: `${i * 140}ms`,
                  }}
                />
              );
            })}
          </div>

        </div>

        <p className="relative text-xs text-slate-600">
          Internal Team Portal
        </p>

        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .checkin-dot {
              animation: checkinPulse 3.6s ease-in-out infinite;
            }
          }
          @keyframes checkinPulse {
            0%, 100% { opacity: 0.55; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.15); }
          }
        `}</style>

      </div>

      {/* ---------- Form panel ---------- */}

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">

        <div className="w-full max-w-sm">

          {/* Compact brand mark for mobile only, rail is hidden below lg */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <HiOutlineUserGroup size={20} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Team Work
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to continue your daily work tracking.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash size={18} />
                  ) : (
                    <HiOutlineEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950"
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
            Team Report Tracker • Internal Team Portal
          </p>

        </div>

      </div>

    </div>
  );
}