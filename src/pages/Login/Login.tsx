import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
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

  const { data: previewResponse, isLoading: previewLoading } = useQuery({
    queryKey: ["login-preview"],
    queryFn: getLoginPreview,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const preview: LoginPreview | null =
    previewResponse?.data ?? null;

  const stats = preview?.stats;
  const teamStatus = preview?.teamStatus ?? [];

  /*
   * ---------------------------------------------------------
   * LOGIN
   * ---------------------------------------------------------
   */

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    if (!email.trim() || !password.trim()) {
      toast.warning("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(email.trim(), password);

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#09090b] dark:text-zinc-100">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Main blue glow */}

        <div
          className="
            absolute left-1/2 top-[-280px]
            h-[600px] w-[600px]
            -translate-x-1/2
            rounded-full
            bg-blue-500/[0.07]
            blur-[120px]
            dark:bg-blue-500/[0.09]
          "
        />

        {/* Secondary glow */}

        <div
          className="
            absolute
            -bottom-[300px]
            -right-[180px]
            h-[550px] w-[550px]
            rounded-full
            bg-indigo-500/[0.05]
            blur-[120px]
            dark:bg-indigo-500/[0.06]
          "
        />

        {/* Very subtle grid */}

        <div
          className="
            absolute inset-0
            opacity-[0.025]
            dark:opacity-[0.035]
          "
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

      </div>

      {/* =====================================================
          PAGE
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen flex-col">

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header className="flex items-center justify-between px-6 py-5 sm:px-8 lg:px-12">

          {/* Brand */}

          <div className="flex items-center gap-2.5">

            <div
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-gradient-to-br
                from-blue-600
                to-indigo-600
                text-white
                shadow-lg
                shadow-blue-500/20
              "
            >
              <HiOutlineUserGroup size={17} />
            </div>

            <div>
              <p className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                Team Work
              </p>

              <p className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
                Report Tracker
              </p>
            </div>

          </div>

          {/* Status */}

          <div
            className="
              hidden items-center gap-2
              rounded-full
              border border-slate-200
              bg-white/70
              px-3 py-1.5
              text-[9px] font-semibold
              text-slate-500
              shadow-sm
              backdrop-blur-md
              sm:flex
              dark:border-zinc-800
              dark:bg-zinc-900/60
              dark:text-zinc-400
            "
          >

            <span className="relative flex h-1.5 w-1.5">

              <span
                className="
                  absolute
                  inline-flex
                  h-full w-full
                  animate-ping
                  rounded-full
                  bg-emerald-400
                  opacity-50
                "
              />

              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />

            </span>

            Workspace operational

          </div>

        </header>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 sm:py-12">

          <div
            className="
              grid w-full max-w-5xl
              grid-cols-1
              items-center
              gap-12
              lg:grid-cols-[1fr_420px]
              lg:gap-20
          "
          >

            {/* =================================================
                LEFT INFORMATION
            ================================================= */}

            <section
              className="
                hidden
                lg:block
                animate-[loginContentIn_0.55s_ease-out]
              "
            >

              {/* Small label */}

              <div
                className="
                  mb-5 inline-flex
                  items-center gap-2
                  rounded-full
                  border
                  border-blue-200/70
                  bg-blue-50/70
                  px-3 py-1.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-blue-600
                  backdrop-blur-md
                  dark:border-blue-500/20
                  dark:bg-blue-500/[0.08]
                  dark:text-blue-400
                "
              >

                <HiOutlineShieldCheck size={12} />

                Secure team workspace

              </div>



              <p
                className="
                  mt-5
                  max-w-md
                  text-sm
                  leading-relaxed
                  text-slate-500
                  dark:text-zinc-500
                "
              >
                One workspace for daily reports, team progress,
                and everything your team gets done.
              </p>

              {/* =================================================
                  LIVE TEAM SUMMARY
              ================================================= */}

              <div className="mt-10 max-w-md">

                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200/80
                    bg-white/65
                    shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)]
                    backdrop-blur-xl
                    dark:border-zinc-800/80
                    dark:bg-zinc-900/45
                    dark:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]
                  "
                >

                  {/* Preview header */}

                  <div
                    className="
                      flex items-center justify-between
                      border-b
                      border-slate-200/70
                      px-5 py-4
                      dark:border-zinc-800/70
                    "
                  >

                    <div>

                      <p
                        className="
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-slate-400
                          dark:text-zinc-500
                        "
                      >
                        Today's activity
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          font-semibold
                          text-slate-800
                          dark:text-zinc-200
                        "
                      >
                        {today}
                      </p>

                    </div>

                    {/* Completion */}

                    <div className="text-right">

                      {previewLoading ? (

                        <div className="h-6 w-12 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />

                      ) : (

                        <>

                          <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                            {stats?.completion ?? 0}%
                          </p>

                          <p className="text-[8px] font-semibold text-slate-400 dark:text-zinc-500">
                            complete
                          </p>

                        </>

                      )}

                    </div>

                  </div>

                  {/* Progress */}

                  <div className="px-5 pt-4">

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">

                      <div
                        className="
                          h-full
                          rounded-full
                          bg-gradient-to-r
                          from-blue-600
                          to-indigo-500
                          transition-all
                          duration-700
                        "
                        style={{
                          width: `${stats?.completion ?? 0}%`,
                        }}
                      />

                    </div>

                    <div className="mt-2 flex justify-between">

                      <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-600">
                        Team progress
                      </span>

                      <span className="text-[9px] font-semibold text-slate-500 dark:text-zinc-500">
                        {stats?.submitted ?? 0} /{" "}
                        {stats?.totalMembers ?? 0} submitted
                      </span>

                    </div>

                  </div>

                  {/* Team */}

                  <div className="space-y-1 px-3 py-4">

                    {previewLoading ? (

                      Array.from({ length: 4 }).map((_, index) => (

                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl px-2 py-2"
                        >

                          <div className="flex items-center gap-2.5">

                            <div className="h-7 w-7 animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800" />

                            <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />

                          </div>

                          <div className="h-4 w-12 animate-pulse rounded-full bg-slate-100 dark:bg-zinc-800" />

                        </div>

                      ))

                    ) : (

                      teamStatus.map((member, index) => (

                        <div
                          key={`${member.name}-${index}`}
                          className="
                            flex items-center
                            justify-between
                            rounded-xl
                            px-2
                            py-2
                            transition-colors
                            hover:bg-slate-50
                            dark:hover:bg-zinc-800/50
                          "
                        >

                          <div className="flex min-w-0 items-center gap-2.5">

                            <div
                              className="
                                flex h-7 w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-slate-100
                                text-[9px]
                                font-bold
                                text-slate-600
                                dark:bg-zinc-800
                                dark:text-zinc-300
                              "
                            >
                              {getInitials(member.name)}
                            </div>

                            <span
                              className="
                                truncate
                                text-[10px]
                                font-semibold
                                text-slate-700
                                dark:text-zinc-300
                              "
                            >
                              {member.name}
                            </span>

                          </div>

                          {member.submitted ? (

                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                bg-emerald-50
                                px-2
                                py-1
                                text-[8px]
                                font-bold
                                text-emerald-600
                                dark:bg-emerald-500/10
                                dark:text-emerald-400
                              "
                            >
                              <HiOutlineCheckCircle size={10} />
                              Submitted
                            </span>

                          ) : (

                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                bg-slate-100
                                px-2
                                py-1
                                text-[8px]
                                font-bold
                                text-slate-400
                                dark:bg-zinc-800
                                dark:text-zinc-500
                              "
                            >
                              <HiOutlineClock size={10} />
                              Pending
                            </span>

                          )}

                        </div>

                      ))

                    )}

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                LOGIN
            ================================================= */}

            <section
              className="
                w-full
                animate-[loginFormIn_0.5s_ease-out]
              "
            >

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-slate-200/80
                  bg-white/75
                  p-7
                  shadow-[0_24px_80px_-35px_rgba(15,23,42,0.25)]
                  backdrop-blur-2xl
                  sm:p-9
                  dark:border-zinc-800/80
                  dark:bg-zinc-900/55
                  dark:shadow-[0_24px_80px_-35px_rgba(0,0,0,0.8)]
                "
              >

                {/* Top accent */}

                <div
                  className="
                    absolute left-0 right-0 top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-blue-500/50
                    to-transparent
                  "
                />

                {/* Mobile logo */}

                <div className="mb-8 flex items-center gap-2.5 lg:hidden">

                  <div
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-blue-600
                      to-indigo-600
                      text-white
                      shadow-md
                      shadow-blue-500/20
                    "
                  >
                    <HiOutlineUserGroup size={17} />
                  </div>

                  <div>

                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Team Work
                    </p>

                    <p className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
                      Report Tracker
                    </p>

                  </div>

                </div>

                {/* Heading */}

                <div>

                  <p
                    className="
                      mb-2
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-blue-600
                      dark:text-blue-400
                    "
                  >
                    Team workspace
                  </p>

                  <h1
                    className="
                      text-2xl
                      font-bold
                      tracking-[-0.025em]
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Welcome back
                  </h1>

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-relaxed
                      text-slate-500
                      dark:text-zinc-500
                    "
                  >
                    Sign in to continue to your workspace.
                  </p>

                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                  onSubmit={handleLogin}
                  className="mt-7 space-y-5"
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
                      disabled={loading}
                      className="input"
                    />

                  </div>

                  {/* Password */}

                  <div>

                    <div className="mb-2 flex items-center justify-between">

                      <label
                        htmlFor="password"
                        className="label !mb-0"
                      >
                        Password
                      </label>

                    </div>

                    <div className="relative">

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        disabled={loading}
                        className="input pr-11"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (prev) => !prev
                          )
                        }
                        disabled={loading}
                        className="
                          absolute
                          right-2
                          top-1/2
                          flex h-8 w-8
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-lg
                          text-slate-400
                          transition-colors
                          hover:bg-slate-100
                          hover:text-slate-700
                          dark:text-zinc-500
                          dark:hover:bg-zinc-800
                          dark:hover:text-zinc-200
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

                  {/* Sign in */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group
                      inline-flex
                      h-11
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-zinc-900
                      text-xs
                      font-semibold
                      text-white
                      shadow-sm
                      transition-all
                      duration-200
                      hover:bg-zinc-800
                      hover:shadow-lg
                      active:scale-[0.99]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      dark:bg-white
                      dark:text-zinc-900
                      dark:hover:bg-zinc-100
                    "
                  >

                    {loading ? (

                      <>
                        <svg
                          className="h-3.5 w-3.5 animate-spin"
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

                        Signing in...
                      </>

                    ) : (

                      <>
                        Sign in

                        <HiOutlineArrowRight
                          className="
                            h-4 w-4
                            transition-transform
                            duration-200
                            group-hover:translate-x-1
                          "
                        />
                      </>

                    )}

                  </button>

                </form>

                {/* Security footer */}

                <div
                  className="
                    mt-7
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    border-t
                    border-slate-100
                    pt-5
                    text-[9px]
                    font-medium
                    text-slate-400
                    dark:border-zinc-800
                    dark:text-zinc-600
                  "
                >

                  <HiOutlineShieldCheck size={12} />

                  Secure internal workspace

                </div>

              </div>

            </section>

          </div>

        </main>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer
          className="
            flex
            items-center
            justify-center
            px-6
            pb-5
            text-[9px]
            font-medium
            text-slate-400
            dark:text-zinc-600
          "
        >
          © {new Date().getFullYear()} Team Work · Internal Team Portal
        </footer>

      </div>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>{`
        @keyframes loginContentIn {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes loginFormIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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