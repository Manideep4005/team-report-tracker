import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUserCircle,
  HiOutlineEnvelope,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

import {
  changePassword,
  getProfile,
  type Profile,
} from "../../services/profile";

import ProfileAvatarSettings from "../../components/ProfileAvatarSettings";
import { useAuth } from "../../context/AuthContext";
import PageTitle from "../../components/PageTitle";

type Tab = "profile" | "security";

const TABS: { id: Tab; label: string; hint: string; icon: React.ReactNode }[] = [
  {
    id: "profile",
    label: "Profile",
    hint: "Photo & account info",
    icon: <HiOutlineUserCircle className="h-5 w-5" />,
  },
  {
    id: "security",
    label: "Security",
    hint: "Password & protection",
    icon: <HiOutlineShieldCheck className="h-5 w-5" />,
  },
];

const INPUT_CLASS = `
  h-12 w-full rounded-xl border border-slate-200 bg-white pl-4
  text-sm text-slate-800 outline-none transition-all
  placeholder:text-slate-400 hover:border-slate-300
  focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100
  dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100
  dark:placeholder:text-zinc-600 dark:hover:border-zinc-700
  dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20
`;

const LABEL_CLASS =
  "mb-2 block text-xs font-semibold text-slate-700 dark:text-zinc-300";

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [tab, setTab] = useState<Tab>("profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ------------------------------ GET PROFILE ------------------------------ */

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setProfileLoading(true);
        const response = await getProfile();

        if (mounted && response.success) {
          setProfile(response.data);
        }
      } catch (error: any) {
        if (mounted) {
          toast.error(
            error?.response?.data?.message ?? "Unable to load profile."
          );
        }
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------ PROFILE USER ----------------------------- */

  const profileUser = user
    ? {
      ...user,
      name: profile?.name ?? user.name,
      email: profile?.email ?? user.email,
      avatarUrl: profile?.avatarUrl ?? user.avatarUrl,
    }
    : null;

  /* ------------------------------ AVATAR UPDATE ---------------------------- */

  function handleUserUpdated(updatedUser: typeof user) {
    if (!updatedUser) {
      return;
    }

    updateUser(updatedUser);

    setProfile((current) =>
      current ? { ...current, avatarUrl: updatedUser.avatarUrl } : current
    );
  }

  /* ---------------------------- PASSWORD MUTATION -------------------------- */

  const passwordMutation = useMutation({
    mutationFn: changePassword,

    onSuccess: (response) => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success(response.message);
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Unable to change password."
      );
    },
  });

  /* --------------------------- PASSWORD VALIDATION ------------------------- */

  const passwordChecks = useMemo(
    () => ({
      length: newPassword.length >= 6,
      number: /\d/.test(newPassword),
      uppercase: /[A-Z]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    }),
    [newPassword]
  );

  const passwordStrength = useMemo(() => {
    if (!newPassword) {
      return { label: "", value: 0 };
    }

    let score = 0;
    if (passwordChecks.length) score++;
    if (passwordChecks.number) score++;
    if (passwordChecks.uppercase) score++;
    if (passwordChecks.special) score++;

    if (score <= 1) return { label: "Weak", value: 25 };
    if (score === 2) return { label: "Fair", value: 50 };
    if (score === 3) return { label: "Good", value: 75 };
    return { label: "Strong", value: 100 };
  }, [newPassword, passwordChecks]);

  const strengthText =
    passwordStrength.value <= 25
      ? "text-red-500"
      : passwordStrength.value === 50
        ? "text-amber-500"
        : passwordStrength.value === 75
          ? "text-blue-500"
          : "text-emerald-500";

  const strengthBar =
    passwordStrength.value <= 25
      ? "bg-red-500"
      : passwordStrength.value === 50
        ? "bg-amber-500"
        : passwordStrength.value === 75
          ? "bg-blue-500"
          : "bg-emerald-500";

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const passwordsDoNotMatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  /* ----------------------------- CHANGE PASSWORD --------------------------- */

  function handlePasswordChange() {
    if (!currentPassword) {
      toast.warning("Enter current password.");
      return;
    }

    if (!newPassword) {
      toast.warning("Enter new password.");
      return;
    }

    if (newPassword.length < 6) {
      toast.warning("Password must be at least 6 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      toast.warning(
        "New password must be different from your current password."
      );
      return;
    }

    if (!confirmPassword) {
      toast.warning("Confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning("Passwords do not match.");
      return;
    }

    passwordMutation.mutate({ currentPassword, newPassword });
  }

  /* --------------------------------- RENDER -------------------------------- */

  const displayName = profile?.name ?? user?.name ?? "";
  const displayEmail = profile?.email ?? user?.email ?? "";
  const avatarUrl = profile?.avatarUrl ?? user?.avatarUrl;
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <PageTitle title="Settings" />

      {/* ============================== HERO ============================== */}

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-white dark:border-zinc-800 dark:from-indigo-500/10 dark:via-zinc-950 dark:to-zinc-950">
        <div className="relative flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 ring-2 ring-white dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-zinc-900 sm:h-14 sm:w-14 sm:text-xl">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>

          <div className="min-w-0 flex-1">
            {profileLoading && !displayName ? (
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
                <div className="h-3 w-48 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
              </div>
            ) : (
              <>
                <h2 className="truncate text-sm font-bold text-slate-800 sm:text-base dark:text-zinc-100">
                  {displayName || "Your account"}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-500">
                  <HiOutlineEnvelope className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{displayEmail || "—"}</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================= NAV + CONTENT ========================= */}

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        {/* NAV: pills on small screens, sidebar on desktop */}
        <nav
          aria-label="Settings sections"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          {TABS.map((item) => {
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition lg:w-full ${active
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  }`}
              >
                {item.icon}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {item.label}
                  </span>
                  <span className="hidden text-[11px] opacity-70 lg:block">
                    {item.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* CONTENT */}
        <div className="min-w-0">
          {tab === "profile" && (
            <div className="space-y-6">
              <Panel
                title="Profile photo"
                subtitle="Upload or change the picture shown across your account."
              >
                {profileUser ? (
                  <ProfileAvatarSettings
                    user={profileUser}
                    onUserUpdated={handleUserUpdated}
                  />
                ) : (
                  <div className="h-28 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-900" />
                )}
              </Panel>

              <Panel
                title="Account details"
                subtitle="These details are read-only."
                badge="View only"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {profileLoading ? (
                    <>
                      <ProfileSkeleton />
                      <ProfileSkeleton />
                    </>
                  ) : (
                    <>
                      <ProfileDetail
                        icon={<HiOutlineUserCircle className="h-4 w-4" />}
                        label="Name"
                        value={profile?.name ?? "—"}
                      />
                      <ProfileDetail
                        icon={<HiOutlineEnvelope className="h-4 w-4" />}
                        label="Email"
                        value={profile?.email ?? "—"}
                      />
                    </>
                  )}
                </div>
              </Panel>
            </div>
          )}

          {tab === "security" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordChange();
              }}
              noValidate
              className="space-y-6"
            >
              <Panel
                title="Change password"
                subtitle="Choose a strong password that you don't use elsewhere."
                icon={<HiOutlineLockClosed className="h-4 w-4" />}
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label htmlFor="current-password" className={LABEL_CLASS}>
                      Current Password
                    </label>
                    <PasswordInput
                      id="current-password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      placeholder="Enter current password"
                      visible={showCurrentPassword}
                      onToggle={() => setShowCurrentPassword((v) => !v)}
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="new-password" className={LABEL_CLASS}>
                      New Password
                    </label>
                    <PasswordInput
                      id="new-password"
                      value={newPassword}
                      onChange={setNewPassword}
                      placeholder="Enter new password"
                      visible={showNewPassword}
                      onToggle={() => setShowNewPassword((v) => !v)}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="confirm-password" className={LABEL_CLASS}>
                      Confirm Password
                    </label>
                    <PasswordInput
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="Confirm new password"
                      visible={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword((v) => !v)}
                      autoComplete="new-password"
                      status={
                        passwordsMatch ? (
                          <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : passwordsDoNotMatch ? (
                          <HiOutlineXCircle className="h-5 w-5 text-red-500" />
                        ) : null
                      }
                    />

                    {passwordsDoNotMatch && (
                      <p className="mt-1.5 text-xs text-red-500">
                        Passwords do not match.
                      </p>
                    )}

                    {passwordsMatch && (
                      <p className="mt-1.5 text-xs text-emerald-500">
                        Passwords match.
                      </p>
                    )}
                  </div>
                </div>

                {/* STRENGTH */}
                {newPassword && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400 dark:text-zinc-600">
                        Password strength
                      </span>
                      <span className={`text-xs font-bold ${strengthText}`}>
                        {passwordStrength.label}
                      </span>
                    </div>

                    <div className="mt-2 flex gap-1.5">
                      {[1, 2, 3, 4].map((segment) => (
                        <div
                          key={segment}
                          className={`h-1.5 flex-1 rounded-full transition-all ${passwordStrength.value >= segment * 25
                              ? strengthBar
                              : "bg-slate-100 dark:bg-zinc-800"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* REQUIREMENT CHIPS */}
                <div className="mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500">
                    Password requirements
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <RequirementChip
                      valid={passwordChecks.length}
                      text="6+ characters"
                    />
                    <RequirementChip
                      valid={passwordChecks.number}
                      text="A number"
                    />
                    <RequirementChip
                      valid={passwordChecks.uppercase}
                      text="Uppercase letter"
                    />
                    <RequirementChip
                      valid={passwordChecks.special}
                      text="Special character"
                    />
                  </div>
                </div>
              </Panel>

              {/* ACTION BAR */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400 dark:text-zinc-600">
                  Your password will be updated immediately after confirmation.
                </p>

                <button
                  type="submit"
                  disabled={passwordMutation.isPending}
                  className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {passwordMutation.isPending
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PANEL
================================================================ */

function Panel({
  title,
  subtitle,
  badge,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.035)] sm:p-7 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
              {icon}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-600">
              {subtitle}
            </p>
          </div>
        </div>

        {badge && (
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
            {badge}
          </span>
        )}
      </div>

      {children}
    </section>
  );
}

/* ================================================================
   PROFILE DETAIL
================================================================ */

function ProfileDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-slate-400 dark:text-zinc-600">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-zinc-600">
          {label}
        </span>
      </div>

      <div className="flex min-h-12 min-w-0 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-medium text-slate-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
        <span className="truncate" title={value}>
          {value}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   PROFILE SKELETON
================================================================ */

function ProfileSkeleton() {
  return (
    <div>
      <div className="mb-1.5 h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
      <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-900" />
    </div>
  );
}

/* ================================================================
   PASSWORD INPUT
================================================================ */

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  autoComplete,
  status,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  autoComplete?: string;
  status?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} ${status ? "pr-20" : "pr-12"}`}
        placeholder={placeholder}
      />

      <div className="absolute inset-y-0 right-2 flex items-center gap-1">
        {status}

        <button
          type="button"
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <HiOutlineEyeSlash className="h-4 w-4" />
          ) : (
            <HiOutlineEye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   REQUIREMENT CHIP
================================================================ */

function RequirementChip({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${valid
          ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "border-slate-200 bg-slate-50 text-slate-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
        }`}
    >
      {valid ? (
        <HiOutlineCheckCircle className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-zinc-700" />
      )}
      {text}
    </span>
  );
}