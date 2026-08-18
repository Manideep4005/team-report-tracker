import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

import { changePassword } from "../../services/profile";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        error?.response?.data?.message ?? "Unable to change password.",
      );
    },
  });

  const passwordChecks = useMemo(() => {
    return {
      length: newPassword.length >= 6,

      number: /\d/.test(newPassword),

      uppercase: /[A-Z]/.test(newPassword),

      special: /[^A-Za-z0-9]/.test(newPassword),
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
  }, [newPassword, passwordChecks]);

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const passwordsDoNotMatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

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
        "New password must be different from your current password.",
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
                max-w-[900px]
                px-4
                py-6
                sm:px-6
                sm:py-8
                lg:px-8
            "
    >
      {/* ==================================================
                PAGE HEADER
            ================================================== */}

      {/* ==================================================
                SECURITY FORM
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
        {/* FORM HEADER */}

        <div
          className="
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
                            items-center
                            gap-3
                        "
          >
            <div
              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                bg-slate-50
                                text-slate-500
                                dark:bg-zinc-900
                                dark:text-zinc-400
                            "
            >
              <HiOutlineLockClosed
                className="
                                    h-4
                                    w-4
                                "
              />
            </div>

            <div>
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
                Choose a strong password that you don't use elsewhere.
              </p>
            </div>
          </div>
        </div>

        {/* FORM BODY */}

        <div
          className="
                        px-5
                        py-5
                        sm:px-6
                        sm:py-6
                    "
        >
          <div
            className="
                            grid
                            grid-cols-1
                            gap-5
                            md:grid-cols-2
                        "
          >
            {/* CURRENT PASSWORD */}

            <div
              className="
                                md:col-span-2
                            "
            >
              <label htmlFor="current-password" className="label">
                Current Password
              </label>

              <PasswordInput
                id="current-password"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter current password"
                visible={showCurrentPassword}
                onToggle={() => setShowCurrentPassword((value) => !value)}
              />
            </div>

            {/* NEW PASSWORD */}

            <div>
              <label htmlFor="new-password" className="label">
                New Password
              </label>

              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter new password"
                visible={showNewPassword}
                onToggle={() => setShowNewPassword((value) => !value)}
              />

              {/* STRENGTH */}

              {newPassword && (
                <div
                  className="
                                        mt-3
                                    "
                >
                  <div
                    className="
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
                      Password strength
                    </span>

                    <span
                      className={`
                                                text-[9px]
                                                font-bold
                                                ${
                                                  passwordStrength.value <= 25
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
                      {passwordStrength.label}
                    </span>
                  </div>

                  <div
                    className="
                                            mt-1.5
                                            flex
                                            gap-1
                                        "
                  >
                    {[1, 2, 3, 4].map((segment) => {
                      const active = passwordStrength.value >= segment * 25;

                      return (
                        <div
                          key={segment}
                          className={`
                                                            h-1
                                                            flex-1
                                                            rounded-full
                                                            transition-all
                                                            ${
                                                              active
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
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label htmlFor="confirm-password" className="label">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="
                                        input
                                        pr-20
                                    "
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
                    onClick={() => setShowConfirmPassword((value) => !value)}
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
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <HiOutlineEyeSlash
                        className="
                                                    h-4
                                                    w-4
                                                "
                      />
                    ) : (
                      <HiOutlineEye
                        className="
                                                    h-4
                                                    w-4
                                                "
                      />
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
                  Passwords do not match.
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

          {/* PASSWORD REQUIREMENTS */}

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

            <div
              className="
                                mt-3
                                grid
                                grid-cols-1
                                gap-2
                                sm:grid-cols-2
                            "
            >
              <PasswordRequirement
                valid={passwordChecks.length}
                text="At least 6 characters"
              />

              <PasswordRequirement
                valid={passwordChecks.number}
                text="At least one number"
              />

              <PasswordRequirement
                valid={passwordChecks.uppercase}
                text="One uppercase letter"
              />

              <PasswordRequirement
                valid={passwordChecks.special}
                text="One special character"
              />
            </div>
          </div>
        </div>

        {/* ACTION FOOTER */}

        <div
          className="
                        flex
                        flex-col-reverse
                        gap-3
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
                            text-[10px]
                            leading-4
                            text-slate-400
                            dark:text-zinc-600
                        "
          >
            Your password will be updated immediately after confirmation.
          </p>

          <button
            type="button"
            onClick={handlePasswordChange}
            disabled={passwordMutation.isPending}
            className="
                            inline-flex
                            h-10
                            w-full
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
            {passwordMutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </div>
      </section>
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
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
                    input
                    pr-12
                "
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
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <HiOutlineEyeSlash
            className="
                            h-4
                            w-4
                        "
          />
        ) : (
          <HiOutlineEye
            className="
                            h-4
                            w-4
                        "
          />
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
                    text-[10px]
                    ${
                      valid
                        ? `
                                text-slate-600
                                dark:text-zinc-400
                            `
                        : `
                                text-slate-400
                                dark:text-zinc-600
                            `
                    }
                `}
      >
        {text}
      </span>
    </div>
  );
}
