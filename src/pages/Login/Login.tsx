import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineArrowTrendingUp,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getLoginPreview } from "../../services/dashboard";

interface TeamMember {
  name: string;
  submitted: boolean;
}

interface LoginPreview {
  date: string;
  stats: {
    submitted: number;
    pending: number;
    totalMembers: number;
    completion: number;
  };
  teamStatus: TeamMember[];
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
   * ---------------------------------------------------------
   * REAL TEAM PREVIEW
   * ---------------------------------------------------------
   */

  const {
    data: previewResponse,
    isLoading: previewLoading,
  } = useQuery({
    queryKey: ["login-preview"],
    queryFn: getLoginPreview,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const preview: LoginPreview | null =
    previewResponse?.data ?? null;

  /*
   * ---------------------------------------------------------
   * LOGIN
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * DATE
   * ---------------------------------------------------------
   */

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  /*
   * ---------------------------------------------------------
   * PREVIEW DATA
   * ---------------------------------------------------------
   */

  const stats = preview?.stats;

  const teamStatus = preview?.teamStatus ?? [];

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-[#09090b]">

      {/* =====================================================
          LEFT — REAL TEAM PREVIEW
      ===================================================== */}

      <div
        className="
          relative hidden w-1/2 flex-col justify-between
          overflow-hidden border-r border-zinc-900
          bg-[#09090b] px-12 py-10
          lg:flex xl:px-16
        "
      >

        {/* Background grid */}

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Blue ambient glow */}

        <div
          className="
            pointer-events-none absolute
            -right-40 -top-40
            h-[500px] w-[500px]
            rounded-full
            opacity-20
            blur-3xl
          "
          style={{
            background:
              "radial-gradient(circle, #2563EB 0%, transparent 70%)",
          }}
        />

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="relative flex items-center gap-2.5">

          <div
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl
              bg-gradient-to-r from-blue-600 to-indigo-600
              text-white
              shadow-lg shadow-blue-500/20
            "
          >
            <HiOutlineUserGroup size={17} />
          </div>

          <div>
            <p className="text-xs font-bold tracking-tight text-white">
              Team Work
            </p>

            <p className="text-[9px] font-medium text-zinc-500">
              Report Tracker
            </p>
          </div>

        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <div className="relative max-w-[500px]">

          <div className="mb-7">

            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1">

              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="
                    absolute inline-flex h-full w-full
                    animate-ping rounded-full
                    bg-emerald-400 opacity-60
                  "
                />

                <span
                  className="
                    relative inline-flex h-1.5 w-1.5
                    rounded-full bg-emerald-400
                  "
                />
              </span>

              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                Live team status
              </span>

            </div>


            <p className="mt-3 max-w-sm text-xs leading-relaxed text-zinc-500">
              Track today's work submissions across the team,
              all in one place.
            </p>

          </div>

          {/* =================================================
              REAL DASHBOARD PREVIEW CARD
          ================================================= */}

          <div
            className="
              overflow-hidden rounded-2xl
              border border-white/[0.07]
              bg-white/[0.035]
              shadow-2xl shadow-black/20
              backdrop-blur-xl
            "
          >

            {/* Card header */}

            <div
              className="
                flex items-center justify-between
                border-b border-white/[0.06]
                px-5 py-4
              "
            >

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                  Today
                </p>

                <p className="mt-0.5 text-xs font-semibold text-zinc-200">
                  {today}
                </p>

              </div>

              <div
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-lg
                  bg-blue-500/10
                  text-blue-400
                "
              >
                <HiOutlineArrowTrendingUp size={16} />
              </div>

            </div>

            {/* =================================================
                PROGRESS
            ================================================= */}

            <div className="px-5 pt-5">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Team progress
                  </p>

                  <div className="mt-1 flex items-baseline gap-1.5">

                    {previewLoading ? (
                      <div className="h-7 w-12 animate-pulse rounded bg-white/[0.06]" />
                    ) : (
                      <span className="text-2xl font-bold tracking-tight text-white">
                        {stats?.completion ?? 0}%
                      </span>
                    )}

                  </div>

                </div>

                <div className="text-right">

                  {previewLoading ? (
                    <div className="h-4 w-16 animate-pulse rounded bg-white/[0.06]" />
                  ) : (
                    <p className="text-[10px] font-semibold text-zinc-500">
                      {stats?.submitted ?? 0} of{" "}
                      {stats?.totalMembers ?? 0} submitted
                    </p>
                  )}

                </div>

              </div>

              {/* Progress bar */}

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                <div
                  className="
                    h-full rounded-full
                    bg-gradient-to-r
                    from-blue-600 to-cyan-400
                    transition-all duration-700 ease-out
                  "
                  style={{
                    width: `${stats?.completion ?? 0}%`,
                  }}
                />

              </div>

            </div>

            {/* =================================================
                TEAM MEMBERS
            ================================================= */}

            <div className="px-5 py-4">

              <div className="space-y-1">

                {previewLoading ? (

                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="
                        flex items-center justify-between
                        rounded-xl px-2.5 py-2
                      "
                    >

                      <div className="flex items-center gap-2.5">

                        <div
                          className="
                            h-7 w-7 animate-pulse
                            rounded-lg bg-white/[0.06]
                          "
                        />

                        <div
                          className="
                            h-3 w-24 animate-pulse
                            rounded bg-white/[0.06]
                          "
                        />

                      </div>

                      <div
                        className="
                          h-4 w-12 animate-pulse
                          rounded-full bg-white/[0.06]
                        "
                      />

                    </div>
                  ))

                ) : teamStatus.length > 0 ? (

                  teamStatus.map((member, index) => (

                    <div
                      key={`${member.name}-${index}`}
                      className="
                        group flex items-center justify-between
                        rounded-xl px-2.5 py-2
                        transition-colors
                        hover:bg-white/[0.035]
                      "
                    >

                      <div className="flex min-w-0 items-center gap-2.5">

                        {/* Avatar */}

                        <div
                          className="
                            flex h-7 w-7 shrink-0
                            items-center justify-center
                            rounded-lg
                            bg-gradient-to-br
                            from-zinc-700 to-zinc-800
                            text-[9px] font-bold
                            text-zinc-300
                            ring-1 ring-white/[0.06]
                          "
                        >
                          {getInitials(member.name)}
                        </div>

                        {/* Name */}

                        <span
                          className="
                            truncate text-[11px]
                            font-semibold text-zinc-300
                            transition-colors
                            group-hover:text-white
                          "
                        >
                          {member.name}
                        </span>

                      </div>

                      {/* Status */}

                      {member.submitted ? (

                        <span
                          className="
                            inline-flex items-center gap-1
                            rounded-full
                            bg-emerald-400/10
                            px-2 py-1
                            text-[8px] font-bold
                            text-emerald-400
                          "
                        >
                          <HiOutlineCheckCircle size={11} />
                          Submitted
                        </span>

                      ) : (

                        <span
                          className="
                            inline-flex items-center gap-1
                            rounded-full
                            bg-white/[0.05]
                            px-2 py-1
                            text-[8px] font-bold
                            text-zinc-500
                          "
                        >
                          <HiOutlineClock size={10} />
                          Pending
                        </span>

                      )}

                    </div>

                  ))

                ) : (

                  <div className="py-5 text-center">

                    <p className="text-[10px] font-medium text-zinc-600">
                      No team data available
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* =================================================
                CARD FOOTER
            ================================================= */}

            {!previewLoading && stats && (

              <div
                className="
                  flex items-center justify-between
                  border-t border-white/[0.06]
                  bg-white/[0.015]
                  px-5 py-3
                "
              >

                <div className="flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                  <span className="text-[9px] font-medium text-zinc-500">
                    {stats.pending === 0
                      ? "Everyone has submitted"
                      : `${stats.pending} ${stats.pending === 1
                        ? "report"
                        : "reports"
                      } pending`}
                  </span>

                </div>

                <span className="text-[9px] font-bold text-zinc-600">
                  LIVE
                </span>

              </div>

            )}

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            relative flex items-center
            justify-between
            border-t border-white/[0.05]
            pt-5
          "
        >

          <div>

            <p className="text-[10px] font-semibold text-zinc-400">
              Internal Team Workspace
            </p>

            <p className="mt-0.5 text-[9px] font-medium text-zinc-600">
              Secure reporting portal
            </p>

          </div>

          <div
            className="
              flex items-center gap-1.5
              text-[9px] font-semibold
              text-emerald-500/80
            "
          >

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            Operational

          </div>

        </div>

      </div>

      {/* =====================================================
          RIGHT — LOGIN
      ===================================================== */}

      <div
        className="
          flex w-full flex-col justify-center
          px-8 sm:px-16
          lg:w-1/2 lg:px-20
          xl:px-24
        "
      >

        <div
          className="
            w-full max-w-[340px]
            animate-[loginFadeIn_0.4s_ease-out]
          "
        >

          {/* Mobile brand */}

          <div className="mb-10 flex items-center gap-2.5 lg:hidden">

            <div
              className="
                flex h-8 w-8 items-center justify-center
                rounded-xl
                bg-gradient-to-r from-blue-600 to-indigo-600
                text-white
                shadow-md shadow-blue-500/20
              "
            >
              <HiOutlineUserGroup size={16} />
            </div>

            <div>

              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                Team Work
              </span>

              <p className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
                Report Tracker
              </p>

            </div>

          </div>

          {/* Heading */}

          <div>

            <p
              className="
                mb-2 text-[10px]
                font-bold uppercase
                tracking-[0.15em]
                text-blue-600
                dark:text-blue-400
              "
            >
              Team Workspace
            </p>

            <h1
              className="
                text-xl font-bold
                tracking-tight
                text-slate-900
                dark:text-white
                sm:text-2xl
              "
            >
              Welcome back
            </h1>

            <p
              className="
                mt-1.5 text-xs
                font-medium
                text-slate-500
                dark:text-zinc-500
              "
            >
              Sign in to log or review today&rsquo;s reports.
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-4"
          >

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="label"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="input"
              />

            </div>

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="label"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="input pr-10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="
                    absolute right-2.5 top-1/2
                    flex h-7 w-7
                    -translate-y-1/2
                    items-center justify-center
                    rounded-lg
                    text-slate-400
                    transition-colors
                    hover:bg-slate-100
                    hover:text-slate-650
                    dark:hover:bg-zinc-800
                    dark:hover:text-zinc-300
                  "
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash size={16} />
                  ) : (
                    <HiOutlineEye size={16} />
                  )}
                </button>

              </div>

            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="
                btn-primary
                !mt-6 w-full
                py-2.5
                text-xs font-semibold
              "
            >

              {loading && (

                <svg
                  className="
                    mr-1.5 h-3.5 w-3.5
                    animate-spin
                  "
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
                    d="
                      M4 12a8 8 0 018-8V0C5.373
                      0 0 5.373 0 12h4z
                    "
                  />

                </svg>

              )}

              {loading
                ? "Signing in..."
                : "Sign in"}

            </button>

          </form>





        </div>

      </div>

      {/* =====================================================
          ANIMATION
      ===================================================== */}

      <style>{`
        @keyframes loginFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

    </div>
  );
}


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}