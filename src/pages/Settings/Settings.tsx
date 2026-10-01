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
} from "react-icons/hi2";

import {
  changePassword,
  getProfile,
  type Profile,
} from "../../services/profile";

import ProfileAvatarSettings from "../../components/ProfileAvatarSettings";
import { useAuth } from "../../context/AuthContext";
import PageTitle from "../../components/PageTitle";

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* ================================================================
     GET PROFILE
  ================================================================ */

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setProfileLoading(true);

        const response =
          await getProfile();

        if (
          mounted &&
          response.success
        ) {
          setProfile(response.data);
        }
      } catch (error: any) {
        if (mounted) {
          toast.error(
            error?.response?.data?.message ??
            "Unable to load profile."
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

  /* ================================================================
     PROFILE USER
  ================================================================ */

  const profileUser = user
    ? {
      ...user,
      name:
        profile?.name ??
        user.name,
      email:
        profile?.email ??
        user.email,
      avatarUrl:
        profile?.avatarUrl ??
        user.avatarUrl,
    }
    : null;

  /* ================================================================
     AVATAR UPDATE
  ================================================================ */

  function handleUserUpdated(
    updatedUser: typeof user
  ) {
    if (!updatedUser) {
      return;
    }

    updateUser(updatedUser);

    setProfile((current) =>
      current
        ? {
          ...current,
          avatarUrl:
            updatedUser.avatarUrl,
        }
        : current
    );
  }

  /* ================================================================
     PASSWORD MUTATION
  ================================================================ */

  const passwordMutation = useMutation({
    mutationFn: changePassword,

    onSuccess: (response) => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success(
        response.message
      );
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
        "Unable to change password."
      );
    },
  });

  /* ================================================================
     PASSWORD VALIDATION
  ================================================================ */

  const passwordChecks = useMemo(() => {
    return {
      length:
        newPassword.length >= 6,

      number:
        /\d/.test(newPassword),

      uppercase:
        /[A-Z]/.test(newPassword),

      special:
        /[^A-Za-z0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const passwordStrength = useMemo(() => {
    if (!newPassword) {
      return {
        label: "",
        value: 0,
      };
    }

    let score = 0;

    if (passwordChecks.length) {
      score++;
    }

    if (passwordChecks.number) {
      score++;
    }

    if (passwordChecks.uppercase) {
      score++;
    }

    if (passwordChecks.special) {
      score++;
    }

    if (score <= 1) {
      return {
        label: "Weak",
        value: 25,
      };
    }

    if (score === 2) {
      return {
        label: "Fair",
        value: 50,
      };
    }

    if (score === 3) {
      return {
        label: "Good",
        value: 75,
      };
    }

    return {
      label: "Strong",
      value: 100,
    };
  }, [
    newPassword,
    passwordChecks,
  ]);

  const passwordsMatch =
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    newPassword !== confirmPassword;

  /* ================================================================
     CHANGE PASSWORD
  ================================================================ */

  function handlePasswordChange() {
    if (!currentPassword) {
      toast.warning(
        "Enter current password."
      );

      return;
    }

    if (!newPassword) {
      toast.warning(
        "Enter new password."
      );

      return;
    }

    if (newPassword.length < 6) {
      toast.warning(
        "Password must be at least 6 characters."
      );

      return;
    }

    if (
      newPassword === currentPassword
    ) {
      toast.warning(
        "New password must be different from your current password."
      );

      return;
    }

    if (!confirmPassword) {
      toast.warning(
        "Confirm your new password."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      toast.warning(
        "Passwords do not match."
      );

      return;
    }

    passwordMutation.mutate({
      currentPassword,
      newPassword,
    });
  }

  return (
    <div
      className="
                mx-auto
                w-full
                max-w-6xl
                px-4
                py-5
                sm:px-6
                sm:py-7
                lg:px-8
            "
    >
      {/* ==================================================
                PAGE HEADER
            ================================================== */}

      <PageTitle title="Settings" />

      {/* ==================================================
                PROFILE CARD
            ================================================== */}

      <section
        className="
                    mt-6
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_4px_20px_rgba(15,23,42,0.035)]
                    dark:border-zinc-800
                    dark:bg-zinc-950
                    dark:shadow-none
                "
      >
        {/* HEADER */}

        <div
          className="
                        flex
                        items-center
                        gap-3
                        border-b
                        border-slate-100
                        px-5
                        py-4
                        sm:px-6
                        dark:border-zinc-800
                    "
        >
          <div
            className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-50
                            text-slate-500
                            dark:bg-zinc-900
                            dark:text-zinc-400
                        "
          >
            <HiOutlineUserCircle className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2
              className="
                                text-sm
                                font-bold
                                text-slate-800
                                dark:text-zinc-200
                            "
            >
              Profile
            </h2>

            <p
              className="
                                mt-0.5
                                text-[10px]
                                text-slate-400
                                dark:text-zinc-600
                            "
            >
              Your account information
            </p>
          </div>
        </div>

        {/* PROFILE CONTENT */}

        <div
          className="
                        grid
                        grid-cols-1
                        gap-8
                        px-5
                        py-6
                        md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]
                        md:items-center
                        md:gap-10
                        sm:px-6
                        sm:py-7
                    "
        >
          {/* ==================================================
                        PROFILE IMAGE
                    ================================================== */}

          <div className="min-w-0">
            {profileUser ? (
              <ProfileAvatarSettings
                user={profileUser}
                onUserUpdated={
                  handleUserUpdated
                }
              />
            ) : (
              <div
                className="
                                    h-28
                                    w-full
                                    animate-pulse
                                    rounded-xl
                                    bg-slate-100
                                    dark:bg-zinc-900
                                "
              />
            )}
          </div>

          {/* ==================================================
                        PROFILE DETAILS
                    ================================================== */}

          <div
            className="
                            min-w-0
                            border-t
                            border-slate-100
                            pt-6
                            md:border-l
                            md:border-t-0
                            md:pl-8
                            md:pt-0
                            dark:border-zinc-800
                        "
          >
            <div
              className="
                                mb-5
                                flex
                                items-center
                                justify-between
                            "
            >
              <div>
                <p
                  className="
                                        text-xs
                                        font-semibold
                                        text-slate-800
                                        dark:text-zinc-200
                                    "
                >
                  Account details
                </p>

                <p
                  className="
                                        mt-1
                                        text-[10px]
                                        text-slate-400
                                        dark:text-zinc-600
                                    "
                >
                  These details are
                  read-only.
                </p>
              </div>

              <span
                className="
                                    rounded-full
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-2.5
                                    py-1
                                    text-[9px]
                                    font-medium
                                    text-slate-500
                                    dark:border-zinc-800
                                    dark:bg-zinc-900
                                    dark:text-zinc-500
                                "
              >
                View only
              </span>
            </div>

            {profileLoading ? (
              <div className="space-y-4">
                <ProfileSkeleton />

                <ProfileSkeleton />
              </div>
            ) : (
              <div className="space-y-4">
                {/* NAME */}

                <ProfileDetail
                  icon={
                    <HiOutlineUserCircle className="h-4 w-4" />
                  }
                  label="Name"
                  value={
                    profile?.name ??
                    "—"
                  }
                />

                {/* EMAIL */}

                <ProfileDetail
                  icon={
                    <HiOutlineEnvelope className="h-4 w-4" />
                  }
                  label="Email"
                  value={
                    profile?.email ??
                    "—"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
                PASSWORD CARD
            ================================================== */}

      <section
        className="
                    mt-6
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_4px_20px_rgba(15,23,42,0.035)]
                    dark:border-zinc-800
                    dark:bg-zinc-950
                    dark:shadow-none
                "
      >
        {/* HEADER */}

        <div
          className="
                        flex
                        items-center
                        gap-3
                        border-b
                        border-slate-100
                        px-5
                        py-4
                        sm:px-6
                        dark:border-zinc-800
                    "
        >
          <div
            className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-50
                            text-slate-500
                            dark:bg-zinc-900
                            dark:text-zinc-400
                        "
          >
            <HiOutlineLockClosed className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <h2
              className="
                                text-sm
                                font-bold
                                text-slate-800
                                dark:text-zinc-200
                            "
            >
              Password settings
            </h2>

            <p
              className="
                                mt-0.5
                                text-[10px]
                                text-slate-400
                                dark:text-zinc-600
                            "
            >
              Choose a strong password
              that you don't use elsewhere.
            </p>
          </div>
        </div>

        {/* PASSWORD BODY */}

        <div
          className="
                        px-5
                        py-6
                        sm:px-6
                        sm:py-7
                    "
        >
          <div
            className="
                            grid
                            grid-cols-1
                            gap-5
                            lg:grid-cols-2
                        "
          >
            {/* CURRENT */}

            <div className="lg:col-span-2">
              <label
                htmlFor="current-password"
                className=" mb-1.5
                        block
                        "
              >
                Current Password
              </label>

              <PasswordInput
                id="current-password"
                value={
                  currentPassword
                }
                onChange={
                  setCurrentPassword
                }
                placeholder="Enter current password"
                visible={
                  showCurrentPassword
                }
                onToggle={() =>
                  setShowCurrentPassword(
                    (value) =>
                      !value
                  )
                }
              />
            </div>

            {/* NEW */}

            <div>
              <label
                htmlFor="new-password"
                className=" mb-1.5
                        block
                        "
              >
                New Password
              </label>

              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={
                  setNewPassword
                }
                placeholder="Enter new password"
                visible={
                  showNewPassword
                }
                onToggle={() =>
                  setShowNewPassword(
                    (value) =>
                      !value
                  )
                }
              />

              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="
                                                text-[9px]
                                                font-medium
                                                text-slate-400
                                                dark:text-zinc-600
                                            "
                    >
                      Password
                      strength
                    </span>

                    <span
                      className={`
                                                text-[9px]
                                                font-bold
                                                ${passwordStrength.value <=
                          25
                          ? "text-red-500"
                          : passwordStrength.value ===
                            50
                            ? "text-amber-500"
                            : passwordStrength.value ===
                              75
                              ? "text-blue-500"
                              : "text-emerald-500"
                        }
                                            `}
                    >
                      {
                        passwordStrength.label
                      }
                    </span>
                  </div>

                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3, 4].map(
                      (
                        segment
                      ) => {
                        const active =
                          passwordStrength.value >=
                          segment *
                          25;

                        return (
                          <div
                            key={
                              segment
                            }
                            className={`
                                                            h-1
                                                            flex-1
                                                            rounded-full
                                                            transition-all
                                                            ${active
                                ? passwordStrength.value <=
                                  25
                                  ? "bg-red-500"
                                  : passwordStrength.value ===
                                    50
                                    ? "bg-amber-500"
                                    : passwordStrength.value ===
                                      75
                                      ? "bg-blue-500"
                                      : "bg-emerald-500"
                                : "bg-slate-100 dark:bg-zinc-800"
                              }
                                                        `}
                          />
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRM */}

            <div>
              <label
                htmlFor="confirm-password"
                className=" mb-1.5
                        block
                        "
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  className=" h-10
                        w-full
                        border-slate-200
                        bg-white
                        px-3
                        text-[13px]
                        text-slate-800
                        outline-none
                        transition-all
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-slate-400
                        focus:ring-2
                        focus:ring-slate-100
                        dark:border-zinc-800
                        dark:bg-zinc-900
                        dark:text-zinc-100
                        dark:placeholder:text-zinc-600
                        dark:hover:border-zinc-700
                        dark:focus:border-zinc-700
                        dark:focus:ring-zinc-800"
                  placeholder="Confirm new password"
                />

                <div
                  className="
                                        absolute
                                        inset-y-0
                                        right-2
                                        flex
                                        items-center
                                        gap-1
                                    "
                >
                  {passwordsMatch && (
                    <HiOutlineCheckCircle
                      className="
                                                h-4
                                                w-4
                                                text-emerald-500
                                            "
                    />
                  )}

                  {passwordsDoNotMatch && (
                    <HiOutlineXCircle
                      className="
                                                h-4
                                                w-4
                                                text-red-500
                                            "
                    />
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) =>
                          !value
                      )
                    }
                    className="
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-lg
                                            text-slate-400
                                            transition
                                            hover:bg-slate-100
                                            hover:text-slate-600
                                            dark:text-zinc-600
                                            dark:hover:bg-zinc-800
                                            dark:hover:text-zinc-300
                                        "
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <HiOutlineEyeSlash className="h-4 w-4" />
                    ) : (
                      <HiOutlineEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {passwordsDoNotMatch && (
                <p
                  className="
                                        mt-1.5
                                        text-[10px]
                                        text-red-500
                                    "
                >
                  Passwords do not
                  match.
                </p>
              )}

              {passwordsMatch && (
                <p
                  className="
                                        mt-1.5
                                        text-[10px]
                                        text-emerald-500
                                    "
                >
                  Passwords match.
                </p>
              )}
            </div>
          </div>

          {/* ==================================================
                        REQUIREMENTS
                    ================================================== */}

          <div
            className="
                            mt-6
                            rounded-xl
                            border
                            border-slate-100
                            bg-slate-50/70
                            p-4
                            dark:border-zinc-800
                            dark:bg-zinc-900/40
                        "
          >
            <div
              className="
                                flex
                                flex-col
                                gap-1
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
            >
              <p
                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-500
                                    dark:text-zinc-500
                                "
              >
                Password requirements
              </p>

              <span
                className="
                                    text-[9px]
                                    text-slate-400
                                    dark:text-zinc-600
                                "
              >
                Use a combination of
                different characters
              </span>
            </div>

            <div
              className="
                                mt-4
                                grid
                                grid-cols-1
                                gap-3
                                sm:grid-cols-2
                            "
            >
              <PasswordRequirement
                valid={
                  passwordChecks.length
                }
                text="At least 6 characters"
              />

              <PasswordRequirement
                valid={
                  passwordChecks.number
                }
                text="At least one number"
              />

              <PasswordRequirement
                valid={
                  passwordChecks.uppercase
                }
                text="One uppercase letter"
              />

              <PasswordRequirement
                valid={
                  passwordChecks.special
                }
                text="One special character"
              />
            </div>
          </div>
        </div>

        {/* ==================================================
                    FOOTER
                ================================================== */}

        <div
          className="
                        flex
                        flex-col
                        gap-4
                        border-t
                        border-slate-100
                        bg-slate-50/40
                        px-5
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:px-6
                        dark:border-zinc-800
                        dark:bg-zinc-900/20
                    "
        >
          <p
            className="
                            max-w-xl
                            text-[10px]
                            leading-4
                            text-slate-400
                            dark:text-zinc-600
                        "
          >
            Your password will be updated
            immediately after confirmation.
          </p>

          <button
            type="button"
            onClick={
              handlePasswordChange
            }
            disabled={
              passwordMutation.isPending
            }
            className="
                            inline-flex
                            h-10
                            w-full
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-indigo-600
                            px-5
                            text-xs
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-indigo-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:w-auto
                        "
          >
            {passwordMutation.isPending
              ? "Updating..."
              : "Update Password"}
          </button>
        </div>
      </section>
    </div>
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
    <div>
      <div
        className="
                    mb-1.5
                    flex
                    items-center
                    gap-1.5
                "
      >
        <span
          className="
                        text-slate-400
                        dark:text-zinc-600
                    "
        >
          {icon}
        </span>

        <span
          className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        text-slate-400
                        dark:text-zinc-600
                    "
        >
          {label}
        </span>
      </div>

      <div
        className="
                    flex
                    min-h-11
                    min-w-0
                    items-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    px-3.5
                    text-sm
                    font-medium
                    text-slate-700
                    dark:border-zinc-800
                    dark:bg-zinc-900/50
                    dark:text-zinc-300
                "
      >
        <span className="truncate">
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
      <div
        className="
                    mb-1.5
                    h-3
                    w-16
                    animate-pulse
                    rounded
                    bg-slate-100
                    dark:bg-zinc-800
                "
      />

      <div
        className="
                    h-11
                    w-full
                    animate-pulse
                    rounded-xl
                    bg-slate-100
                    dark:bg-zinc-900
                "
      />
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
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={
          visible
            ? "text"
            : "password"
        }
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className=" h-10
                        w-full
                        border-slate-200
                        bg-white
                        px-3
                        text-[13px]
                        text-slate-800
                        outline-none
                        transition-all
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-slate-400
                        focus:ring-2
                        focus:ring-slate-100
                        dark:border-zinc-800
                        dark:bg-zinc-900
                        dark:text-zinc-100
                        dark:placeholder:text-zinc-600
                        dark:hover:border-zinc-700
                        dark:focus:border-zinc-700
                        dark:focus:ring-zinc-800"
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={onToggle}
        className="
                    absolute
                    inset-y-0
                    right-1
                    flex
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-400
                    transition
                    hover:text-slate-600
                    dark:text-zinc-600
                    dark:hover:text-zinc-300
                "
        aria-label={
          visible
            ? "Hide password"
            : "Show password"
        }
      >
        {visible ? (
          <HiOutlineEyeSlash className="h-4 w-4" />
        ) : (
          <HiOutlineEye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

/* ================================================================
   PASSWORD REQUIREMENT
================================================================ */

function PasswordRequirement({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className="
                flex
                min-w-0
                items-center
                gap-2
            "
    >
      {valid ? (
        <HiOutlineCheckCircle
          className="
                        h-3.5
                        w-3.5
                        shrink-0
                        text-emerald-500
                    "
        />
      ) : (
        <span
          className="
                        h-1.5
                        w-1.5
                        shrink-0
                        rounded-full
                        bg-slate-300
                        dark:bg-zinc-700
                    "
        />
      )}

      <span
        className={`
                    truncate
                    text-[10px]
                    ${valid
            ? "text-slate-600 dark:text-zinc-400"
            : "text-slate-400 dark:text-zinc-600"
          }
                `}
      >
        {text}
      </span>
    </div>
  );
}