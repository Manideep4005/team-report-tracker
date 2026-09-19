import {
  useState,
  type FormEvent,
} from "react";

import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from "react-icons/hi2";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import PageTitle from "../../components/PageTitle";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await login(cleanEmail, password);

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Unable to sign in. Please check your credentials.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <PageTitle title="Login" />

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="
            absolute
            -right-40
            -top-40
            h-[520px]
            w-[520px]
            rounded-full
            bg-[var(--brand)]/8
            blur-[120px]
            dark:bg-[var(--brand)]/12
          "
        />

        <div
          className="
            absolute
            -bottom-48
            -left-40
            h-[480px]
            w-[480px]
            rounded-full
            bg-blue-500/8
            blur-[120px]
            dark:bg-blue-500/10
          "
        />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          relative
          z-10
          flex
          h-16
          items-center
          border-b
          border-[var(--border)]/60
          bg-[var(--surface)]/70
          px-5
          backdrop-blur-md
          sm:px-8
          lg:px-10
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-[var(--brand)]/10
              ring-1
              ring-[var(--brand)]/15
            "
          >
            <img
              src="/group.png"
              alt="Team Work"
              className="h-6 w-6 object-contain"
            />
          </div>

          <div className="leading-none">
            <p
              className="
                text-sm
                font-semibold
                tracking-tight
                text-[var(--text-primary)]
              "
            >
              Team Work
            </p>

            <p
              className="
                mt-1
                text-[9px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-[var(--text-muted)]
              "
            >
              Reporting System
            </p>
          </div>
        </div>
      </header>

      {/* =====================================================
          LOGIN AREA
      ===================================================== */}

      <section
        className="
          relative
          z-10
          flex
          min-h-[calc(100vh-4rem)]
          items-center
          justify-center
          px-4
          py-10
          sm:px-6
          sm:py-12
        "
      >
        <div className="w-full max-w-[420px]">
          {/* =================================================
              LOGIN PANEL
          ================================================= */}

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-[var(--border)]/70
              bg-[var(--surface)]
              shadow-[0_12px_40px_rgba(15,23,42,0.06)]
              dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]
            "
          >
            {/* Top brand line */}

            <div className="h-[3px] w-full bg-[var(--brand)]" />

            <div className="p-6 sm:p-8">
              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="mb-7">
                <div
                  className="
                    mb-5
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[var(--brand)]/10
                    text-[var(--brand)]
                  "
                >
                  <HiOutlineShieldCheck className="h-5 w-5" />
                </div>

                <h1
                  className="
                    text-xl
                    font-semibold
                    tracking-tight
                    text-[var(--text-primary)]
                    sm:text-[22px]
                  "
                >
                  Welcome back
                </h1>

                <p
                  className="
                    mt-1.5
                    text-sm
                    leading-5
                    text-[var(--text-muted)]
                  "
                >
                  Sign in to continue to Team Work.
                </p>
              </div>

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-xs
                      font-medium
                      text-[var(--text-secondary)]
                    "
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <HiOutlineEnvelope
                      className="
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        h-[18px]
                        w-[18px]
                        -translate-y-1/2
                        text-[var(--text-subtle)]
                      "
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      autoComplete="email"
                      placeholder="name@company.com"
                      disabled={loading}
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-[var(--border)]
                        bg-[var(--background)]
                        pl-10.5
                        pr-3.5
                        text-sm
                        text-[var(--text-primary)]
                        placeholder:text-[var(--text-subtle)]
                        outline-none
                        transition
                        duration-150
                        focus:border-[var(--brand)]
                        focus:ring-2
                        focus:ring-[var(--brand)]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    htmlFor="password"
                    className="
                      mb-2
                      block
                      text-xs
                      font-medium
                      text-[var(--text-secondary)]
                    "
                  >
                    Password
                  </label>

                  <div className="relative">
                    <HiOutlineLockClosed
                      className="
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        h-[18px]
                        w-[18px]
                        -translate-y-1/2
                        text-[var(--text-subtle)]
                      "
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={loading}
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-[var(--border)]
                        bg-[var(--background)]
                        pl-10.5
                        pr-11
                        text-sm
                        text-[var(--text-primary)]
                        placeholder:text-[var(--text-subtle)]
                        outline-none
                        transition
                        duration-150
                        focus:border-[var(--brand)]
                        focus:ring-2
                        focus:ring-[var(--brand)]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
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
                        rounded-md
                        text-[var(--text-subtle)]
                        transition
                        hover:bg-[var(--surface)]
                        hover:text-[var(--text-secondary)]
                      "
                    >
                      {showPassword ? (
                        <HiOutlineEyeSlash className="h-[18px] w-[18px]" />
                      ) : (
                        <HiOutlineEye className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* SIGN IN */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-[var(--brand)]
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    shadow-[var(--brand)]/20
                    transition
                    duration-150
                    hover:brightness-95
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
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

                      <HiOutlineArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* =================================================
                  SECURITY NOTE
              ================================================= */}

              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  border-t
                  border-[var(--border)]/60
                  pt-5
                "
              >
                <HiOutlineLockClosed
                  className="
                    h-3.5
                    w-3.5
                    text-[var(--brand)]/70
                  "
                />

                <span
                  className="
                    text-[11px]
                    text-[var(--text-muted)]
                  "
                >
                  Secured & encrypted access
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              px-1
            "
          >
            <span
              className="
                text-[11px]
                text-[var(--text-muted)]
              "
            >
              Team Work
            </span>

            <span
              className="
                text-[11px]
                text-[var(--text-muted)]
              "
            >
              © {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}