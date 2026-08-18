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
import { useState, type FormEvent } from "react";

import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

import { useQuery } from "@tanstack/react-query";
import { getLoginPreview } from "../../services/dashboard";

/* ========================================================================== */
/* Types                                                                      */
/* ========================================================================== */

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

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

function getInitials(name: string) {
  if (!name?.trim()) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

/* ========================================================================== */
/* Login                                                                      */
/* ========================================================================== */

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Live team preview                                                      */
  /* ---------------------------------------------------------------------- */

  const { data: previewResponse, isLoading: previewLoading } = useQuery({
    queryKey: ["login-preview"],

    queryFn: getLoginPreview,

    staleTime: 60 * 1000,

    retry: 1,
  });

  const preview: LoginPreview | null = previewResponse?.data ?? null;

  const stats = preview?.stats;

  const teamStatus = preview?.teamStatus ?? [];

  /* ---------------------------------------------------------------------- */
  /* Login                                                                   */
  /* ---------------------------------------------------------------------- */

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      toast.warning("Please enter email and password.");

      return;
    }

    try {
      setLoading(true);

      await login(trimmedEmail, password);

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Date                                                                    */
  /* ---------------------------------------------------------------------- */

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="
                relative
                min-h-screen
                overflow-hidden

                bg-slate-50
                text-slate-900

                transition-colors
                duration-300

                dark:bg-[#09090b]
                dark:text-zinc-100
            "
    >
      {/* =================================================================
                BACKGROUND
            ================================================================= */}

      <div
        className="
                    pointer-events-none
                    absolute
                    inset-0
                    overflow-hidden
                "
      >
        {/* Primary glow */}

        <div
          className="
                        absolute
                        left-1/3
                        top-[-300px]

                        h-[620px]
                        w-[620px]

                        -translate-x-1/2

                        rounded-full

                        bg-blue-500/[0.055]

                        blur-[130px]

                        dark:bg-blue-500/[0.075]
                    "
        />

        {/* Secondary glow */}

        <div
          className="
                        absolute
                        bottom-[-280px]
                        right-[-180px]

                        h-[500px]
                        w-[500px]

                        rounded-full

                        bg-indigo-500/[0.045]

                        blur-[120px]

                        dark:bg-indigo-500/[0.055]
                    "
        />

        {/* Subtle grid */}

        <div
          className="
                        absolute
                        inset-0

                        opacity-[0.018]

                        dark:opacity-[0.025]
                    "
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* =================================================================
                PAGE
            ================================================================= */}

      <div
        className="
                    relative
                    z-10

                    flex
                    min-h-screen
                    flex-col
                "
      >
        {/* =============================================================
                    TOP BAR
                ============================================================= */}

        <header
          className="
                        flex
                        items-center
                        justify-between

                        px-5
                        py-5

                        sm:px-8
                        sm:py-6

                        lg:px-10
                    "
        >
          {/* Brand */}

          <div
            className="
                            flex
                            items-center
                            gap-2.5
                        "
          >
            <div
              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center

                                rounded-xl

                                bg-gradient-to-br
                                from-blue-600
                                to-indigo-600

                                text-white

                                shadow-md
                                shadow-blue-500/20
                            "
            >
              <HiOutlineUserGroup size={18} />
            </div>

            <div>
              <p
                className="
                                    text-xs
                                    font-bold

                                    text-slate-900
                                    dark:text-white
                                "
              >
                Team Work
              </p>

              <p
                className="
                                    text-[9px]
                                    font-medium

                                    text-slate-400
                                    dark:text-zinc-500
                                "
              >
                Report Tracker
              </p>
            </div>
          </div>

          {/* Security label */}

          <div
            className="
                            hidden
                            items-center
                            gap-1.5

                            text-[10px]
                            font-medium

                            text-slate-400

                            sm:flex

                            dark:text-zinc-600
                        "
          >
            <HiOutlineShieldCheck size={13} />
            Secure internal portal
          </div>
        </header>

        {/* =============================================================
                    MAIN
                ============================================================= */}

        <main
          className="
                        flex
                        flex-1
                        items-center

                        px-5
                        pb-8
                        pt-4

                        sm:px-8
                        sm:pb-10

                        lg:px-10
                        lg:py-6
                    "
        >
          <div
            className="
                            mx-auto
                            grid
                            w-full
                            max-w-5xl

                            items-center

                            gap-12

                            lg:grid-cols-[1fr_390px]
                            lg:gap-16
                        "
          >
            {/* =====================================================
                            LEFT CONTENT
                        ===================================================== */}

            <section
              className="
                                hidden
                                lg:block

                                animate-[loginContentIn_500ms_ease-out]
                            "
            >
              {/* Eyebrow */}

              <div
                className="
                                    mb-5
                                    inline-flex
                                    items-center
                                    gap-2

                                    rounded-full

                                    border
                                    border-blue-200/70

                                    bg-blue-50/70

                                    px-3
                                    py-1.5

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

              {/* Heading */}

              <h1
                className="
                                    max-w-xl

                                    text-[42px]
                                    font-bold
                                    leading-[1.08]

                                    tracking-[-0.045em]

                                    text-slate-950

                                    dark:text-white
                                "
              >
                Daily work reporting,
                <span
                  className="
                                        block

                                        bg-gradient-to-r
                                        from-blue-600
                                        to-indigo-600

                                        bg-clip-text

                                        text-transparent

                                        dark:from-blue-400
                                        dark:to-indigo-400
                                    "
                >
                  made simple.
                </span>
              </h1>

              <p
                className="
                                    mt-5
                                    max-w-lg

                                    text-sm
                                    leading-6

                                    text-slate-500

                                    dark:text-zinc-500
                                "
              >
                One workspace for daily reports, team progress, and everything
                your team gets done.
              </p>

              {/* =================================================
                                LIVE TEAM PREVIEW
                            ================================================= */}

              <div
                className="
                                    mt-9
                                    w-full
                                    max-w-md
                                "
              >
                <div
                  className="
                                        overflow-hidden

                                        rounded-2xl

                                        border
                                        border-slate-200/80

                                        bg-white/70

                                        shadow-[0_24px_70px_-35px_rgba(15,23,42,0.22)]

                                        backdrop-blur-xl

                                        dark:border-zinc-800/80
                                        dark:bg-zinc-900/55

                                        dark:shadow-[0_24px_70px_-35px_rgba(0,0,0,0.8)]
                                    "
                >
                  {/* Preview header */}

                  <div
                    className="
                                            flex
                                            items-center
                                            justify-between

                                            border-b
                                            border-slate-200/70

                                            px-5
                                            py-4

                                            dark:border-zinc-800/70
                                        "
                  >
                    <div>
                      <div
                        className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                "
                      >
                        <span
                          className="
                                                        h-1.5
                                                        w-1.5
                                                        rounded-full
                                                        bg-blue-500
                                                    "
                        />

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
                      </div>

                      <p
                        className="
                                                    mt-1.5

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

                    <div
                      className="
                                                text-right
                                            "
                    >
                      {previewLoading ? (
                        <>
                          <div
                            className="
                                                            ml-auto
                                                            h-6
                                                            w-12

                                                            animate-pulse

                                                            rounded-md

                                                            bg-slate-100

                                                            dark:bg-zinc-800
                                                        "
                          />

                          <div
                            className="
                                                            mt-1
                                                            ml-auto
                                                            h-2
                                                            w-10

                                                            animate-pulse

                                                            rounded

                                                            bg-slate-100

                                                            dark:bg-zinc-800
                                                        "
                          />
                        </>
                      ) : (
                        <>
                          <p
                            className="
                                                            text-lg
                                                            font-bold
                                                            tracking-tight

                                                            text-slate-900

                                                            dark:text-white
                                                        "
                          >
                            {stats?.completion ?? 0}%
                          </p>

                          <p
                            className="
                                                            text-[8px]
                                                            font-semibold
                                                            uppercase
                                                            tracking-wider

                                                            text-slate-400

                                                            dark:text-zinc-500
                                                        "
                          >
                            complete
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* =================================================
                                        Progress
                                    ================================================= */}

                  <div
                    className="
                                            px-5
                                            pt-4
                                        "
                  >
                    <div
                      className="
                                                h-1.5
                                                overflow-hidden
                                                rounded-full

                                                bg-slate-100

                                                dark:bg-zinc-800
                                            "
                    >
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

                    <div
                      className="
                                                mt-2

                                                flex
                                                items-center
                                                justify-between
                                            "
                    >
                      <span
                        className="
                                                    text-[9px]
                                                    font-medium

                                                    text-slate-400

                                                    dark:text-zinc-600
                                                "
                      >
                        Team progress
                      </span>

                      <span
                        className="
                                                    text-[9px]
                                                    font-semibold

                                                    text-slate-500

                                                    dark:text-zinc-500
                                                "
                      >
                        {stats?.submitted ?? 0}
                        {" / "}
                        {stats?.totalMembers ?? 0}
                        {" submitted"}
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                                        Team members
                                    ================================================= */}

                  <div
                    className="
                                            px-3
                                            pb-3
                                            pt-3
                                        "
                  >
                    {previewLoading ? (
                      <div
                        className="
                                                    space-y-1
                                                "
                      >
                        {Array.from({
                          length: 3,
                        }).map((_, index) => (
                          <div
                            key={index}
                            className="
                                                                flex
                                                                items-center
                                                                justify-between

                                                                rounded-xl

                                                                px-2
                                                                py-2
                                                            "
                          >
                            <div
                              className="
                                                                    flex
                                                                    items-center
                                                                    gap-2.5
                                                                "
                            >
                              <div
                                className="
                                                                        h-7
                                                                        w-7

                                                                        animate-pulse

                                                                        rounded-lg

                                                                        bg-slate-100

                                                                        dark:bg-zinc-800
                                                                    "
                              />

                              <div
                                className="
                                                                        h-2.5
                                                                        w-20

                                                                        animate-pulse

                                                                        rounded

                                                                        bg-slate-100

                                                                        dark:bg-zinc-800
                                                                    "
                              />
                            </div>

                            <div
                              className="
                                                                    h-4
                                                                    w-14

                                                                    animate-pulse

                                                                    rounded-full

                                                                    bg-slate-100

                                                                    dark:bg-zinc-800
                                                                "
                            />
                          </div>
                        ))}
                      </div>
                    ) : teamStatus.length > 0 ? (
                      <div
                        className="
                                                    space-y-0.5
                                                "
                      >
                        {teamStatus.slice(0, 4).map((member, index) => (
                          <div
                            key={`${member.name}-${index}`}
                            className="
                                                                    flex
                                                                    items-center
                                                                    justify-between

                                                                    rounded-xl

                                                                    px-2
                                                                    py-2

                                                                    transition-colors

                                                                    hover:bg-slate-50

                                                                    dark:hover:bg-zinc-800/50
                                                                "
                          >
                            {/* Member */}

                            <div
                              className="
                                                                        flex
                                                                        min-w-0
                                                                        items-center
                                                                        gap-2.5
                                                                    "
                            >
                              <div
                                className="
                                                                            flex
                                                                            h-7
                                                                            w-7
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

                            {/* Status */}

                            {member.submitted ? (
                              <span
                                className="
                                                                            inline-flex
                                                                            shrink-0
                                                                            items-center
                                                                            gap-1.5

                                                                            text-[9px]
                                                                            font-semibold

                                                                            text-emerald-600

                                                                            dark:text-emerald-400
                                                                        "
                              >
                                <HiOutlineCheckCircle className="h-3.5 w-3.5" />
                                Submitted
                              </span>
                            ) : (
                              <span
                                className="
                                                                            inline-flex
                                                                            shrink-0
                                                                            items-center
                                                                            gap-1.5

                                                                            text-[9px]
                                                                            font-semibold

                                                                            text-amber-600

                                                                            dark:text-amber-400
                                                                        "
                              >
                                <HiOutlineClock className="h-3.5 w-3.5" />
                                Pending
                              </span>
                            )}
                          </div>
                        ))}

                        {teamStatus.length > 4 && (
                          <p
                            className="
                                                            px-2
                                                            pt-1

                                                            text-[9px]
                                                            font-medium

                                                            text-slate-400

                                                            dark:text-zinc-600
                                                        "
                          >
                            +{teamStatus.length - 4} more team members
                          </p>
                        )}
                      </div>
                    ) : (
                      <div
                        className="
                                                    px-2
                                                    py-5
                                                    text-center
                                                "
                      >
                        <p
                          className="
                                                        text-[10px]
                                                        font-medium

                                                        text-slate-400

                                                        dark:text-zinc-600
                                                    "
                        >
                          Team activity is unavailable right now.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                            LOGIN CARD
                        ===================================================== */}

            <section
              className="
                                w-full

                                animate-[loginFormIn_500ms_ease-out]
                            "
            >
              <div
                className="
                                    relative

                                    overflow-hidden

                                    rounded-2xl

                                    border
                                    border-slate-200/80

                                    bg-white/85

                                    p-6

                                    shadow-[0_25px_80px_-35px_rgba(15,23,42,0.25)]

                                    backdrop-blur-xl

                                    sm:p-7

                                    dark:border-zinc-800
                                    dark:bg-zinc-900/75

                                    dark:shadow-[0_25px_80px_-35px_rgba(0,0,0,0.8)]
                                "
              >
                {/* Top accent */}

                <div
                  className="
                                        absolute
                                        left-0
                                        right-0
                                        top-0
                                        h-px

                                        bg-gradient-to-r
                                        from-transparent
                                        via-blue-500/60
                                        to-transparent
                                    "
                />

                {/* Mobile brand */}

                <div
                  className="
                                        mb-7
                                        flex
                                        items-center
                                        gap-2.5

                                        lg:hidden
                                    "
                >
                  <div
                    className="
                                            flex
                                            h-9
                                            w-9
                                            items-center
                                            justify-center

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
                    <p
                      className="
                                                text-xs
                                                font-bold

                                                text-slate-900

                                                dark:text-white
                                            "
                    >
                      Team Work
                    </p>

                    <p
                      className="
                                                text-[9px]
                                                font-medium

                                                text-slate-400

                                                dark:text-zinc-500
                                            "
                    >
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

                  <h2
                    className="
                                            text-2xl
                                            font-bold

                                            tracking-[-0.03em]

                                            text-slate-950

                                            dark:text-white
                                        "
                  >
                    Welcome back
                  </h2>

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
                  className="
                                        mt-7
                                        space-y-5
                                    "
                >
                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="
                                                mb-2
                                                block

                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.12em]

                                                text-slate-600

                                                dark:text-zinc-400
                                            "
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={loading}
                      className="
                                                h-11
                                                w-full

                                                rounded-xl

                                                border
                                                border-slate-200

                                                bg-slate-50/70

                                                px-3.5

                                                text-sm

                                                text-slate-900

                                                outline-none

                                                transition

                                                placeholder:text-slate-400

                                                hover:border-slate-300

                                                focus:border-blue-500
                                                focus:bg-white
                                                focus:ring-4
                                                focus:ring-blue-500/10

                                                disabled:cursor-not-allowed
                                                disabled:opacity-60

                                                dark:border-zinc-800
                                                dark:bg-zinc-950/50
                                                dark:text-zinc-100
                                                dark:placeholder:text-zinc-600
                                                dark:hover:border-zinc-700
                                                dark:focus:border-blue-500
                                                dark:focus:bg-zinc-950
                                            "
                    />
                  </div>

                  {/* Password */}

                  <div>
                    <label
                      htmlFor="password"
                      className="
                                                mb-2
                                                block

                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.12em]

                                                text-slate-600

                                                dark:text-zinc-400
                                            "
                    >
                      Password
                    </label>

                    <div
                      className="
                                                relative
                                            "
                    >
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={loading}
                        className="
                                                    h-11
                                                    w-full

                                                    rounded-xl

                                                    border
                                                    border-slate-200

                                                    bg-slate-50/70

                                                    px-3.5
                                                    pr-11

                                                    text-sm

                                                    text-slate-900

                                                    outline-none

                                                    transition

                                                    placeholder:text-slate-400

                                                    hover:border-slate-300

                                                    focus:border-blue-500
                                                    focus:bg-white
                                                    focus:ring-4
                                                    focus:ring-blue-500/10

                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-60

                                                    dark:border-zinc-800
                                                    dark:bg-zinc-950/50
                                                    dark:text-zinc-100
                                                    dark:placeholder:text-zinc-600
                                                    dark:hover:border-zinc-700
                                                    dark:focus:border-blue-500
                                                    dark:focus:bg-zinc-950
                                                "
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        disabled={loading}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="
                                                    absolute
                                                    right-2
                                                    top-1/2

                                                    flex
                                                    h-8
                                                    w-8

                                                    -translate-y-1/2

                                                    items-center
                                                    justify-center

                                                    rounded-lg

                                                    text-slate-400

                                                    transition

                                                    hover:bg-slate-100
                                                    hover:text-slate-600

                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50

                                                    dark:text-zinc-600
                                                    dark:hover:bg-zinc-800
                                                    dark:hover:text-zinc-300
                                                "
                      >
                        {showPassword ? (
                          <HiOutlineEyeSlash size={17} />
                        ) : (
                          <HiOutlineEye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                                            group

                                            flex
                                            h-11
                                            w-full
                                            items-center
                                            justify-center
                                            gap-2

                                            rounded-xl

                                            bg-gradient-to-r
                                            from-blue-600
                                            to-indigo-600

                                            px-4

                                            text-xs
                                            font-semibold

                                            text-white

                                            shadow-lg
                                            shadow-blue-600/20

                                            transition-all
                                            duration-200

                                            hover:-translate-y-0.5
                                            hover:shadow-xl
                                            hover:shadow-blue-600/25

                                            active:translate-y-0

                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                            disabled:hover:translate-y-0
                                        "
                  >
                    {loading ? (
                      <>
                        <span
                          className="
                                                        h-4
                                                        w-4

                                                        animate-spin

                                                        rounded-full

                                                        border-2
                                                        border-white/30
                                                        border-t-white
                                                    "
                        />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <HiOutlineArrowRight
                          className="
                                                        h-4
                                                        w-4

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
                                        mt-6

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

        {/* =============================================================
                    FOOTER
                ============================================================= */}

        <footer
          className="
                        flex
                        items-center
                        justify-center

                        px-5
                        pb-5

                        text-center

                        text-[9px]
                        font-medium

                        text-slate-400

                        dark:text-zinc-600
                    "
        >
          © {new Date().getFullYear()} Team Work
          {" · "}
          Internal Team Portal
        </footer>
      </div>

      {/* =================================================================
                ANIMATIONS
            ================================================================= */}

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
                        scroll-behavior: auto !important;
                    }
                }
            `}</style>
    </div>
  );
}
