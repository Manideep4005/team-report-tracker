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
  HiOutlineBuildingOffice,
} from "react-icons/hi2";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";

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
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--text-primary)]">
      {/* Animated gradient orbs - Light & Dark aware */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Primary glow - top right */}
        <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[var(--brand)]/10 dark:bg-[var(--brand)]/20 blur-[140px] animate-pulse" />

        {/* Secondary glow - bottom left */}
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-[120px] animate-pulse animation-delay-2000" />

        {/* Accent glow - center */}
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-[100px] animate-pulse animation-delay-1000" />

        {/* Subtle grid - Light & Dark */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.03] dark:opacity-[0.06]" />

        {/* Floating particles - decorative */}
        <div className="absolute left-[10%] top-[20%] h-1 w-1 rounded-full bg-[var(--brand)]/20 blur-[1px]" />
        <div className="absolute right-[15%] top-[30%] h-1.5 w-1.5 rounded-full bg-blue-400/15 blur-[1px]" />
        <div className="absolute left-[20%] bottom-[25%] h-1 w-1 rounded-full bg-purple-400/15 blur-[1px]" />
        <div className="absolute right-[25%] bottom-[35%] h-1.5 w-1.5 rounded-full bg-[var(--brand)]/20 blur-[1px]" />
      </div>

      {/* Header - Glassmorphism */}
      <header className="absolute left-0 right-0 top-0 z-20 flex h-20 items-center justify-between border-b border-[var(--border)]/30 px-6 backdrop-blur-xl bg-[var(--surface)]/30 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-blue-0  shadow-lg shadow-[var(--brand)]/20">
            <img src="/group.png" className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              Team Work
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Reporting System
            </p>
          </div>
        </div>


      </header>

      {/* Main Content */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 pb-12 pt-24">
        <div className="w-full max-w-[400px]">


          {/* Login Card - Premium Glassmorphism */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]/30 bg-[var(--surface)]/40 shadow-2xl shadow-black/5 dark:shadow-black/40 backdrop-blur-xl">
            {/* Card gradient border glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--brand)]/5 via-transparent to-blue-500/5 pointer-events-none" />

            {/* Top accent line */}
            <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--brand)]/50 to-transparent" />

            <div className="relative p-6 sm:p-8">
              {/* Icon with glassmorphism */}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)]/10 border border-[var(--brand)]/10 shadow-lg shadow-[var(--brand)]/5 backdrop-blur-sm">
                <HiOutlineShieldCheck className="h-6 w-6 text-[var(--brand)]" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Sign in to access your reports and analytics
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    Email address
                  </label>
                  <div className="relative group">
                    <HiOutlineEnvelope className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-subtle)] transition-colors group-focus-within:text-[var(--brand)]" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      placeholder="name@company.com"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-[var(--border)]/50 bg-[var(--surface)]/50 pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--brand)]/50 focus:bg-[var(--surface)]/80 focus:shadow-[0_0_30px_-12px_var(--brand)]/20 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]"
                    >
                      Password
                    </label>

                  </div>
                  <div className="relative group">
                    <HiOutlineLockClosed className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-subtle)] transition-colors group-focus-within:text-[var(--brand)]" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-[var(--border)]/50 bg-[var(--surface)]/50 pl-11 pr-12 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--brand)]/50 focus:bg-[var(--surface)]/80 focus:shadow-[0_0_30px_-12px_var(--brand)]/20 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-subtle)] transition-colors hover:bg-[var(--surface)]/50 hover:text-[var(--text-secondary)]"
                    >
                      {showPassword ? (
                        <HiOutlineEyeSlash className="h-5 w-5" />
                      ) : (
                        <HiOutlineEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[var(--brand)] to-blue-600 text-sm font-semibold tracking-wide text-white shadow-lg shadow-[var(--brand)]/20 transition-all duration-200 hover:shadow-[var(--brand)]/40 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer note - Glassmorphism */}
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-[var(--border)]/30 pt-5">
                <HiOutlineLockClosed className="h-3.5 w-3.5 text-[var(--brand)]/70" />
                <span className="text-xs text-[var(--text-muted)]">
                  Secured & encrypted access
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between px-1">
            <span className="text-[11px] text-[var(--text-muted)]">Team Work</span>
            <span className="text-[11px] text-[var(--text-muted)]">
              © {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}