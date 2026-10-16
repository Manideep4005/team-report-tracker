import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlinePencilSquare,
  HiOutlineKey,
  HiOutlineTrash,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineEnvelope,
  HiOutlineAtSymbol,
  HiOutlineShieldCheck,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

import {
  getUsers,
  getInactiveUsers,
  restoreUser,
  deleteUser,
  resetUserPassword,
  createUser,
  updateUser,
} from "../../services/user";

import type {
  ManagedUser,
  CreateUserPayload,
  UpdateUserPayload,
} from "../../services/user";
import PageTitle from "../../components/PageTitle";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../../components/UserAvatar";

/* ================================================================
   TYPES & HELPERS
================================================================ */

type ModalType = "create" | "edit" | "delete" | "reset" | "restore" | null;

type RoleOption = {
  id: string;
  name: string;
  description?: string | null;
};

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;
const USERNAME_ERROR =
  "Username must be 3–30 characters and contain only letters, numbers, dots, underscores, or hyphens.";

const NO_ROLE = "No role";

/* Each role gets a stable color theme derived from its name.
   Classes are written out in full so Tailwind can detect them. */

const THEMES = [
  {
    soft: "bg-indigo-50/70 dark:bg-indigo-500/[0.07]",
    pill: "bg-indigo-100/80 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    ring: "ring-indigo-500/30",
    dot: "bg-indigo-500",
  },
  {
    soft: "bg-emerald-50/70 dark:bg-emerald-500/[0.07]",
    pill: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    ring: "ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  {
    soft: "bg-amber-50/70 dark:bg-amber-500/[0.07]",
    pill: "bg-amber-100/80 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    ring: "ring-amber-500/30",
    dot: "bg-amber-500",
  },
  {
    soft: "bg-rose-50/70 dark:bg-rose-500/[0.07]",
    pill: "bg-rose-100/80 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    ring: "ring-rose-500/30",
    dot: "bg-rose-500",
  },
  {
    soft: "bg-sky-50/70 dark:bg-sky-500/[0.07]",
    pill: "bg-sky-100/80 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    ring: "ring-sky-500/30",
    dot: "bg-sky-500",
  },
  {
    soft: "bg-fuchsia-50/70 dark:bg-fuchsia-500/[0.07]",
    pill: "bg-fuchsia-100/80 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    ring: "ring-fuchsia-500/30",
    dot: "bg-fuchsia-500",
  },
];

const NEUTRAL_THEME = {
  soft: "bg-slate-50 dark:bg-zinc-900/60",
  pill: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400",
  ring: "ring-slate-400/30",
  dot: "bg-slate-400",
};

function getTheme(roleName: string) {
  if (roleName === NO_ROLE) return NEUTRAL_THEME;

  let hash = 0;
  for (let i = 0; i < roleName.length; i++) {
    hash = (hash * 31 + roleName.charCodeAt(i)) >>> 0;
  }

  return THEMES[hash % THEMES.length];
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function firstName(name: string): string {
  return name.split(" ")[0] || name;
}

/* Round avatar wrapper that hosts the existing UserAvatar component. */

function Avatar({
  user,
  inactive,
  size,
  showStatus = true,
}: {
  user: ManagedUser;
  inactive: boolean;
  size: "sm" | "md" | "lg";
  showStatus?: boolean;
}) {
  const dimension =
    size === "lg"
      ? "h-16 w-16 text-base"
      : size === "md"
        ? "h-10 w-10 text-[11px]"
        : "h-6 w-6 text-[9px]";

  const dot =
    size === "lg"
      ? "h-4 w-4 ring-[3px]"
      : size === "md"
        ? "h-3 w-3 ring-2"
        : "hidden";

  return (
    <div className="relative shrink-0">
      <div
        className={`overflow-hidden rounded-full font-bold ${dimension} ${
          inactive
            ? "bg-amber-100 text-amber-700 opacity-75 grayscale dark:bg-amber-500/10 dark:text-amber-400"
            : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
        }`}
      >
        <div className="flex h-full w-full items-center justify-center">
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
        </div>
      </div>

      {showStatus && (
        <span
          aria-hidden="true"
          className={`absolute bottom-0 right-0 rounded-full ring-white dark:ring-zinc-950 ${dot} ${
            inactive ? "bg-amber-500" : "bg-emerald-500"
          }`}
        />
      )}
    </div>
  );
}

/* ================================================================
   MODAL SHELL
================================================================ */

function Modal({
  children,
  onClose,
  maxWidth = "max-w-lg",
}: {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4 dark:bg-black/60"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950`}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-5 sm:px-6">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
      >
        <HiOutlineXMark className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}

function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6 dark:border-zinc-800">
      {children}
    </div>
  );
}

/* ================================================================
   BUTTONS & INPUTS
================================================================ */

function SecondaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-full items-center justify-center rounded-lg px-4 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:text-zinc-400 dark:hover:bg-zinc-900"
    >
      {children}
    </button>
  );
}

const labelClass =
  "mb-1.5 block text-xs font-medium text-slate-600 dark:text-zinc-400";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:hover:border-zinc-700 dark:focus:border-indigo-500/50";

const primaryButtonClass =
  "inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  hint,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  prefix?: string;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400 dark:text-zinc-600">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className={`${inputClass} ${prefix ? "pl-7" : ""}`}
        />
      </div>

      {hint && (
        <p className="mt-1.5 text-[11px] text-slate-400 dark:text-zinc-600">
          {hint}
        </p>
      )}
    </div>
  );
}

function RoleSelect({
  value,
  onChange,
  roles,
}: {
  value: string;
  onChange: (value: string) => void;
  roles: RoleOption[];
}) {
  return (
    <div>
      <label className={labelClass}>
        Role
        <span className="ml-0.5 text-red-500">*</span>
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className={inputClass}
      >
        <option value="">Select role</option>

        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ================================================================
   CONFIRMATION MODAL
================================================================ */

function ConfirmModal({
  type,
  user,
  loading,
  onCancel,
  onConfirm,
}: {
  type: "delete" | "reset" | "restore";
  user: ManagedUser;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const config = {
    delete: {
      title: "Delete user?",
      description:
        "This will deactivate the account. You can restore it later.",
      action: "Delete user",
      loading: "Deleting...",
      icon: HiOutlineTrash,
      iconWrapper:
        "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
      button: "bg-red-600 hover:bg-red-700",
    },
    reset: {
      title: "Reset password?",
      description: "The password will be reset to the default password.",
      action: "Reset password",
      loading: "Resetting...",
      icon: HiOutlineKey,
      iconWrapper:
        "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      button: "bg-amber-600 hover:bg-amber-700",
    },
    restore: {
      title: "Restore user?",
      description: "This will reactivate the account and restore access.",
      action: "Restore user",
      loading: "Restoring...",
      icon: HiOutlineArrowPath,
      iconWrapper:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      button: "bg-emerald-600 hover:bg-emerald-700",
    },
  }[type];

  const Icon = config.icon;

  return (
    <Modal
      onClose={() => {
        if (!loading) onCancel();
      }}
      maxWidth="max-w-sm"
    >
      <div className="p-5 sm:p-6">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${config.iconWrapper}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
          {config.title}
        </h2>

        <p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-zinc-400">
          {config.description}
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-zinc-900/60">
          <Avatar
            user={user}
            inactive={type === "restore"}
            size="md"
            showStatus={false}
          />

          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-slate-900 dark:text-zinc-100">
              {user.name}
              {user.username && (
                <span className="ml-1.5 font-normal text-slate-400 dark:text-zinc-500">
                  @{user.username}
                </span>
              )}
            </p>

            <p className="truncate text-xs text-slate-500 dark:text-zinc-500">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <ModalFooter>
        <SecondaryButton onClick={onCancel} disabled={loading}>
          Cancel
        </SecondaryButton>

        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${config.button}`}
        >
          {type === "restore" && (
            <HiOutlineArrowPath
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          )}
          {loading ? config.loading : config.action}
        </button>
      </ModalFooter>
    </Modal>
  );
}

/* ================================================================
   CREATE USER MODAL
================================================================ */

function CreateUserModal({
  roles,
  loading,
  onClose,
  onSubmit,
}: {
  roles: RoleOption[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => void;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!username.trim()) {
      toast.error("Username is required.");
      return;
    }

    if (!USERNAME_REGEX.test(username.trim())) {
      toast.error(USERNAME_ERROR);
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    if (!roleId) {
      toast.error("Please select a role.");
      return;
    }

    onSubmit({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      roleId,
    });
  };

  return (
    <Modal
      onClose={() => {
        if (!loading) onClose();
      }}
    >
      <ModalHeader
        title="Add user"
        description="Create a new account and assign a role."
        onClose={onClose}
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 px-5 py-4 sm:px-6">
          <FormInput
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Full name"
            required
          />

          <FormInput
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="username"
            prefix="@"
            hint="3–30 characters: letters, numbers, dots, underscores or hyphens."
            required
          />

          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="name@company.com"
            required
          />

          <RoleSelect value={roleId} onChange={setRoleId} roles={roles} />

          <div className="flex items-start gap-2.5 rounded-lg bg-indigo-50/70 px-3.5 py-3 text-xs leading-5 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            <HiOutlineKey className="mt-0.5 h-4 w-4 shrink-0" />
            <p>The new user will receive the system default password.</p>
          </div>
        </div>

        <ModalFooter>
          <SecondaryButton onClick={onClose} disabled={loading}>
            Cancel
          </SecondaryButton>

          <button
            type="submit"
            disabled={loading}
            className={primaryButtonClass}
          >
            <HiOutlineUserPlus className="h-4 w-4" />
            {loading ? "Creating..." : "Create user"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ================================================================
   EDIT USER MODAL
================================================================ */

function EditUserModal({
  user,
  roles,
  loading,
  onClose,
  onSubmit,
}: {
  user: ManagedUser;
  roles: RoleOption[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateUserPayload) => void;
}) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username ?? "");
  const [email, setEmail] = useState(user.email);
  const [roleId, setRoleId] = useState(user.roleId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!username.trim()) {
      toast.error("Username is required.");
      return;
    }

    if (!USERNAME_REGEX.test(username.trim())) {
      toast.error(USERNAME_ERROR);
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    if (!roleId) {
      toast.error("Please select a role.");
      return;
    }

    onSubmit({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      roleId,
    });
  };

  return (
    <Modal
      onClose={() => {
        if (!loading) onClose();
      }}
    >
      <ModalHeader
        title="Edit user"
        description="Update account information and role."
        onClose={onClose}
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 px-5 py-4 sm:px-6">
          <FormInput label="Name" value={name} onChange={setName} required />

          <FormInput
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="username"
            prefix="@"
            hint="3–30 characters: letters, numbers, dots, underscores or hyphens."
            required
          />

          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />

          <RoleSelect value={roleId} onChange={setRoleId} roles={roles} />
        </div>

        <ModalFooter>
          <SecondaryButton onClick={onClose} disabled={loading}>
            Cancel
          </SecondaryButton>

          <button
            type="submit"
            disabled={loading}
            className={primaryButtonClass}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ================================================================
   LEFT PANE ITEMS
================================================================ */

function UserListItem({
  user,
  inactive,
  active,
  onSelect,
}: {
  user: ManagedUser;
  inactive: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const theme = getTheme(user.role?.name ?? NO_ROLE);

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
          active
            ? `bg-white shadow-sm ring-1 ${theme.ring} dark:bg-zinc-900`
            : "hover:bg-slate-100/70 dark:hover:bg-zinc-900/60"
        }`}
      >
        <Avatar user={user} inactive={inactive} size="md" />

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-[13.5px] font-medium ${
              active
                ? "text-slate-900 dark:text-white"
                : "text-slate-700 dark:text-zinc-300"
            }`}
          >
            {user.name}
          </p>

          <p className="mt-0.5 truncate text-[11.5px] text-slate-400 dark:text-zinc-500">
            {user.username ? `@${user.username}` : user.email}
          </p>
        </div>
      </button>
    </li>
  );
}

function UserChip({
  user,
  inactive,
  active,
  onSelect,
}: {
  user: ManagedUser;
  inactive: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const theme = getTheme(user.role?.name ?? NO_ROLE);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium transition ${
        active
          ? `bg-white text-slate-900 shadow-sm ring-1 ${theme.ring} dark:bg-zinc-900 dark:text-white`
          : "bg-slate-100 text-slate-600 dark:bg-zinc-900/70 dark:text-zinc-400"
      }`}
    >
      <Avatar user={user} inactive={inactive} size="sm" showStatus={false} />
      {firstName(user.name)}
    </button>
  );
}

/* ================================================================
   RIGHT PANE: USER DETAIL
================================================================ */

function UserDetail({
  user,
  inactive,
  canUpdate,
  canDelete,
  canResetPassword,
  canRestore,
  resetting,
  onEdit,
  onDelete,
  onResetPassword,
  onRestore,
}: {
  user: ManagedUser;
  inactive: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canResetPassword: boolean;
  canRestore: boolean;
  resetting: boolean;
  onEdit: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
  onResetPassword: (user: ManagedUser) => void;
  onRestore: (user: ManagedUser) => void;
}) {
  const roleName = user.role?.name ?? NO_ROLE;
  const theme = getTheme(roleName);

  const showActions = inactive ? canRestore : canResetPassword || canDelete;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* header */}
      <div className={`px-5 pb-5 pt-5 sm:px-7 sm:pt-6 ${theme.soft}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar user={user} inactive={inactive} size="lg" />

            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {user.name}
              </h2>

              <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-zinc-400">
                {user.username ? `@${user.username}` : user.email}
              </p>

              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  inactive
                    ? "bg-amber-100/80 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                    : "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    inactive ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
                {inactive ? "Inactive" : "Active"}
              </span>
            </div>
          </div>

          {!inactive && canUpdate && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(user)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <HiOutlinePencilSquare className="h-4 w-4" />
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* stats */}
      <dl className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 dark:divide-zinc-800 dark:border-zinc-800">
        <DetailStat
          icon={<HiOutlineShieldCheck className="h-4 w-4" />}
          label="Role"
        >
          <span
            className={`inline-flex max-w-full items-center truncate rounded-md px-2 py-0.5 text-[13px] font-semibold ${theme.pill}`}
          >
            {roleName}
          </span>
        </DetailStat>

        <DetailStat
          icon={<HiOutlineCheckCircle className="h-4 w-4" />}
          label="Status"
        >
          {inactive ? "Inactive" : "Active"}
        </DetailStat>

        <DetailStat
          icon={<HiOutlineCalendarDays className="h-4 w-4" />}
          label="Joined"
        >
          {formatDate(user.createdAt)}
        </DetailStat>
      </dl>

      {/* account details */}
      <div className="px-5 py-6 sm:px-7">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Account details
        </h3>

        <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500">
          How this person signs in and is contacted.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <InfoTile
            icon={<HiOutlineEnvelope className="h-4 w-4" />}
            label="Email"
            value={user.email}
            soft={theme.soft}
          />

          <InfoTile
            icon={<HiOutlineAtSymbol className="h-4 w-4" />}
            label="Username"
            value={user.username ? `@${user.username}` : "Not set"}
            soft={theme.soft}
          />
        </div>
      </div>

      {/* account actions */}
      {showActions && (
        <div className="border-t border-slate-100 px-5 py-6 sm:px-7 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Account actions
          </h3>

          <div className="mt-4 space-y-2">
            {inactive ? (
              <ActionRow
                title="Restore access"
                description="Reactivate this account so the person can sign in again."
              >
                <button
                  type="button"
                  onClick={() => onRestore(user)}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-[13px] font-semibold text-white transition hover:bg-emerald-500"
                >
                  <HiOutlineArrowPath className="h-4 w-4" />
                  Restore
                </button>
              </ActionRow>
            ) : (
              <>
                {canResetPassword && (
                  <ActionRow
                    title="Reset password"
                    description="Set the password back to the system default."
                  >
                    <button
                      type="button"
                      disabled={resetting}
                      onClick={() => onResetPassword(user)}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <HiOutlineKey className="h-4 w-4" />
                      {resetting ? "Resetting..." : "Reset"}
                    </button>
                  </ActionRow>
                )}

                {canDelete && (
                  <ActionRow
                    title="Delete user"
                    description="Deactivate the account. You can restore it later."
                  >
                    <button
                      type="button"
                      onClick={() => onDelete(user)}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-red-50 px-3.5 text-[13px] font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                      Delete
                    </button>
                  </ActionRow>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailStat({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 px-4 py-4 text-center sm:px-7 sm:text-left">
      <dt className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 sm:justify-start dark:text-zinc-500">
        {icon}
        {label}
      </dt>

      <dd className="mt-1.5 truncate text-sm font-semibold text-slate-900 dark:text-white">
        {children}
      </dd>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
  soft,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  soft: string;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${soft}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm dark:bg-zinc-800 dark:text-zinc-500">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">{label}</p>

        <p className="mt-0.5 break-all text-[13px] font-medium text-slate-800 dark:text-zinc-200">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-slate-50/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-900/40">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-900 dark:text-zinc-100">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

/* ================================================================
   SKELETON / EMPTY / ERROR
================================================================ */

function UsersSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-7">
      <div className="space-y-2">
        <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-900" />

        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-3 p-2.5"
          >
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-zinc-800" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
              <div className="h-2.5 w-32 rounded bg-slate-100 dark:bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>

      <div className="h-[460px] animate-pulse rounded-2xl border border-slate-200/80 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/40" />
    </div>
  );
}

function EmptyState({ inactive }: { inactive: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-20 text-center dark:border-zinc-800">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
        <HiOutlineUserGroup className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
        {inactive ? "No inactive users" : "No active users"}
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-zinc-500">
        {inactive
          ? "Deleted users will appear here and can be restored."
          : "There are currently no active users."}
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200/70 bg-red-50/40 px-6 py-14 text-center dark:border-red-500/20 dark:bg-red-500/5">
      <HiOutlineExclamationTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />

      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
        Unable to load users
      </h3>

      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
        Something went wrong while loading the users.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Try again
      </button>
    </div>
  );
}

/* ================================================================
   USERS SCREEN
================================================================ */

export default function Users() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  /* PERMISSIONS */

  const canCreate = hasPermission("USER_CREATE");
  const canUpdate = hasPermission("USER_UPDATE");
  const canDelete = hasPermission("USER_DELETE");
  const canResetPassword = hasPermission("USER_PASSWORD_RESET");
  const canRestore = hasPermission("USER_RESTORE");

  /* STATE */

  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [targetUser, setTargetUser] = useState<ManagedUser | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  /* ACTIVE USERS */

  const {
    data: activeData,
    isLoading: activeLoading,
    isError: activeError,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ["users", "active"],
    queryFn: getUsers,
    enabled: !showInactive,
  });

  /* INACTIVE USERS */

  const {
    data: inactiveData,
    isLoading: inactiveLoading,
    isError: inactiveError,
    refetch: refetchInactive,
  } = useQuery({
    queryKey: ["users", "inactive"],
    queryFn: getInactiveUsers,
    enabled: showInactive,
  });

  /* ROLES (replace with your existing getRoles() service if you have one) */

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { default: api } = await import("../../services/api");

      const response = await api.get<{
        success: boolean;
        data: RoleOption[];
      }>("/api/roles");

      return response.data;
    },
    enabled: modal === "create" || modal === "edit",
  });

  const roles = rolesData?.data ?? [];

  /* MUTATIONS */

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),

    onSuccess: () => {
      toast.success("User created successfully.");
      setModal(null);
      queryClient.invalidateQueries({ queryKey: ["users", "active"] });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to create user.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),

    onSuccess: () => {
      toast.success("User updated successfully.");
      setModal(null);
      setTargetUser(null);
      queryClient.invalidateQueries({ queryKey: ["users", "active"] });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to update user.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),

    onSuccess: () => {
      toast.success("User deleted successfully.");
      setModal(null);
      setTargetUser(null);
      setActiveUserId(null);
      queryClient.invalidateQueries({ queryKey: ["users", "active"] });
      queryClient.invalidateQueries({ queryKey: ["users", "inactive"] });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to delete user.");
    },
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => resetUserPassword(id),

    onSuccess: () => {
      toast.success("Password reset successfully.");
      setModal(null);
      setTargetUser(null);
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Unable to reset password.",
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreUser(id),

    onSuccess: () => {
      toast.success("User restored successfully.");
      setModal(null);
      setTargetUser(null);
      setActiveUserId(null);
      queryClient.invalidateQueries({ queryKey: ["users", "inactive"] });
      queryClient.invalidateQueries({ queryKey: ["users", "active"] });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Unable to restore user.");
    },
  });

  /* DATA */

  const users: ManagedUser[] = useMemo(
    () =>
      showInactive ? (inactiveData?.data ?? []) : (activeData?.data ?? []),
    [showInactive, inactiveData, activeData],
  );

  /*
   * Searches the currently loaded server response by
   * name, username, email and role.
   */
  const visibleUsers = useMemo(() => {
    const value = search.trim().toLowerCase().replace(/^@/, "");

    if (!value) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(value) ||
        (user.username ?? "").toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        (user.role?.name ?? "").toLowerCase().includes(value),
    );
  }, [users, search]);

  const selectedUser = useMemo(
    () =>
      users.find((user) => user.id === activeUserId) ??
      visibleUsers[0] ??
      users[0] ??
      null,
    [users, visibleUsers, activeUserId],
  );

  const isLoading = showInactive ? inactiveLoading : activeLoading;
  const isError = showInactive ? inactiveError : activeError;

  function switchStatus(inactive: boolean) {
    setShowInactive(inactive);
    setSearch("");
    setActiveUserId(null);
  }

  /* MODAL HANDLERS */

  const openCreate = () => {
    if (!canCreate) return;
    setTargetUser(null);
    setModal("create");
  };

  const openEdit = (user: ManagedUser) => {
    if (!canUpdate) return;
    setTargetUser(user);
    setModal("edit");
  };

  const openDelete = (user: ManagedUser) => {
    if (!canDelete) return;
    setTargetUser(user);
    setModal("delete");
  };

  const openReset = (user: ManagedUser) => {
    if (!canResetPassword) return;
    setTargetUser(user);
    setModal("reset");
  };

  const openRestore = (user: ManagedUser) => {
    if (!canRestore) return;
    setTargetUser(user);
    setModal("restore");
  };

  const closeModal = () => {
    if (
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      resetMutation.isPending ||
      restoreMutation.isPending
    ) {
      return;
    }

    setModal(null);
    setTargetUser(null);
  };

  /* RENDER */

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageTitle title="Users" />

      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {showInactive
              ? "Deleted accounts. Select a person to restore their access."
              : "Manage people, their roles and account access."}
          </p>
        </div>

        {!showInactive && canCreate && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-500 active:scale-[0.98] sm:w-auto"
          >
            <HiOutlineUserPlus className="h-4 w-4" />
            New user
          </button>
        )}
      </header>

      {/* CONTENT */}
      <div className="mt-7">
        {isLoading ? (
          <UsersSkeleton />
        ) : isError ? (
          <ErrorState
            onRetry={() => {
              void (showInactive ? refetchInactive() : refetchActive());
            }}
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-7">
            {/* ------------------- LEFT: USER LIST ------------------- */}
            <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
              <div
                role="tablist"
                className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-zinc-900"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={!showInactive}
                  onClick={() => switchStatus(false)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                    !showInactive
                      ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200"
                  }`}
                >
                  Active
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={showInactive}
                  onClick={() => switchStatus(true)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                    showInactive
                      ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200"
                  }`}
                >
                  Inactive
                </button>
              </div>

              <div className="relative mt-3">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-indigo-500/50"
                />
              </div>

              {users.length === 0 ? null : visibleUsers.length === 0 ? (
                <p className="px-2 py-8 text-center text-xs text-slate-400 dark:text-zinc-600">
                  No users match "{search}".
                </p>
              ) : (
                <>
                  <p className="mt-3 px-1 text-xs text-slate-400 dark:text-zinc-600">
                    {visibleUsers.length}{" "}
                    {visibleUsers.length === 1 ? "user" : "users"}
                  </p>

                  {/* mobile / tablet: horizontal scroller */}
                  <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
                    {visibleUsers.map((user) => (
                      <UserChip
                        key={user.id}
                        user={user}
                        inactive={showInactive}
                        active={user.id === selectedUser?.id}
                        onSelect={() => setActiveUserId(user.id)}
                      />
                    ))}
                  </div>

                  {/* desktop: vertical list */}
                  <ul className="mt-2 hidden space-y-1.5 lg:block lg:max-h-[calc(100vh-20rem)] lg:overflow-y-auto lg:pr-1">
                    {visibleUsers.map((user) => (
                      <UserListItem
                        key={user.id}
                        user={user}
                        inactive={showInactive}
                        active={user.id === selectedUser?.id}
                        onSelect={() => setActiveUserId(user.id)}
                      />
                    ))}
                  </ul>
                </>
              )}
            </aside>

            {/* ------------------- RIGHT: DETAIL --------------------- */}
            <section className="min-w-0">
              {selectedUser ? (
                <UserDetail
                  key={selectedUser.id}
                  user={selectedUser}
                  inactive={showInactive}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  canResetPassword={canResetPassword}
                  canRestore={canRestore}
                  resetting={
                    resetMutation.isPending &&
                    resetMutation.variables === selectedUser.id
                  }
                  onEdit={openEdit}
                  onDelete={openDelete}
                  onResetPassword={openReset}
                  onRestore={openRestore}
                />
              ) : (
                <EmptyState inactive={showInactive} />
              )}
            </section>
          </div>
        )}
      </div>

      {/* MODALS */}

      {modal === "create" && (
        <CreateUserModal
          roles={roles}
          loading={createMutation.isPending}
          onClose={closeModal}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}

      {modal === "edit" && targetUser && (
        <EditUserModal
          user={targetUser}
          roles={roles}
          loading={updateMutation.isPending}
          onClose={closeModal}
          onSubmit={(payload) => {
            updateMutation.mutate({
              id: targetUser.id,
              payload,
            });
          }}
        />
      )}

      {modal === "delete" && targetUser && (
        <ConfirmModal
          type="delete"
          user={targetUser}
          loading={deleteMutation.isPending}
          onCancel={closeModal}
          onConfirm={() => deleteMutation.mutate(targetUser.id)}
        />
      )}

      {modal === "reset" && targetUser && (
        <ConfirmModal
          type="reset"
          user={targetUser}
          loading={resetMutation.isPending}
          onCancel={closeModal}
          onConfirm={() => resetMutation.mutate(targetUser.id)}
        />
      )}

      {modal === "restore" && targetUser && (
        <ConfirmModal
          type="restore"
          user={targetUser}
          loading={restoreMutation.isPending}
          onCancel={closeModal}
          onConfirm={() => restoreMutation.mutate(targetUser.id)}
        />
      )}
    </div>
  );
}
