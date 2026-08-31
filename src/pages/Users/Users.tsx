import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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

/*
 * CHANGE THIS IMPORT ONLY IF YOUR AUTH HOOK
 * LIVES SOMEWHERE ELSE.
 *
 * Expected:
 *
 * const { hasPermission } = useAuth();
 *
 * hasPermission("USER_CREATE")
 * hasPermission("USER_UPDATE")
 * hasPermission("USER_DELETE")
 * hasPermission("USER_PASSWORD_RESET")
 * hasPermission("USER_RESTORE")
 */
import { useAuth } from "../../context/AuthContext";


/* ================================================================
   TYPES
================================================================ */

type ModalType =
  | "create"
  | "edit"
  | "delete"
  | "reset"
  | "restore"
  | null;


/* ================================================================
   MODAL SHELL
================================================================ */

function Modal({
  children,
  onClose,
  maxWidth = "max-w-lg",
}: {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        bg-slate-950/45
        px-4
        py-6

        backdrop-blur-[2px]

        dark:bg-black/65
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`
          w-full
          ${maxWidth}

          max-h-[90vh]
          overflow-y-auto

          rounded-2xl

          border
          border-slate-200

          bg-white

          shadow-2xl

          dark:border-zinc-800
          dark:bg-zinc-950
        `}
      >
        {children}
      </div>
    </div>
  );
}


/* ================================================================
   MODAL HEADER
================================================================ */

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
    <div
      className="
        flex
        items-start
        justify-between
        gap-4

        border-b
        border-slate-100

        px-5
        py-4

        dark:border-zinc-900

        sm:px-6
        sm:py-5
      "
    >
      <div className="min-w-0">
        <h2
          className="
            text-base
            font-bold
            text-slate-950

            dark:text-white
          "
        >
          {title}
        </h2>

        {description && (
          <p
            className="
              mt-1
              text-xs
              leading-5
              text-slate-500

              dark:text-zinc-500
            "
          >
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center

          rounded-lg

          text-slate-400

          transition

          hover:bg-slate-100
          hover:text-slate-700

          dark:text-zinc-500
          dark:hover:bg-zinc-900
          dark:hover:text-zinc-200
        "
      >
        <HiOutlineXMark className="h-5 w-5" />
      </button>
    </div>
  );
}


/* ================================================================
   MODAL FOOTER
================================================================ */

function ModalFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        flex-col-reverse
        gap-2

        border-t
        border-slate-100

        px-5
        py-4

        sm:flex-row
        sm:justify-end

        dark:border-zinc-900

        sm:px-6
      "
    >
      {children}
    </div>
  );
}


/* ================================================================
   BUTTONS
================================================================ */

function SecondaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="
        inline-flex
        h-10
        items-center
        justify-center

        rounded-xl

        border
        border-slate-200

        bg-white

        px-4

        text-xs
        font-semibold

        text-slate-600

        transition

        hover:bg-slate-50
        hover:text-slate-900

        disabled:cursor-not-allowed
        disabled:opacity-50

        dark:border-zinc-800
        dark:bg-zinc-900
        dark:text-zinc-400

        dark:hover:bg-zinc-800
        dark:hover:text-zinc-200
      "
    >
      {children}
    </button>
  );
}


/* ================================================================
   INPUT
================================================================ */

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="
          mb-1.5
          block

          text-[11px]
          font-bold
          uppercase
          tracking-[0.08em]

          text-slate-500

          dark:text-zinc-500
        "
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="
          h-10
          w-full

          rounded-xl

          border
          border-slate-200

          bg-white

          px-3

          text-xs

          text-slate-800

          outline-none

          transition

          placeholder:text-slate-400

          focus:border-indigo-400
          focus:ring-2
          focus:ring-indigo-500/10

          dark:border-zinc-800
          dark:bg-zinc-900
          dark:text-zinc-200

          dark:placeholder:text-zinc-600

          dark:focus:border-indigo-500/50
        "
      />
    </div>
  );
}


/* ================================================================
   ROLE SELECT
================================================================ */

function RoleSelect({
  value,
  onChange,
  roles,
}: {
  value: string;
  onChange: (value: string) => void;
  roles: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
}) {
  return (
    <div>
      <label
        className="
          mb-1.5
          block

          text-[11px]
          font-bold
          uppercase
          tracking-[0.08em]

          text-slate-500

          dark:text-zinc-500
        "
      >
        Role
        <span className="ml-1 text-red-500">*</span>
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        required
        className="
          h-10
          w-full

          rounded-xl

          border
          border-slate-200

          bg-white

          px-3

          text-xs

          text-slate-800

          outline-none

          focus:border-indigo-400
          focus:ring-2
          focus:ring-indigo-500/10

          dark:border-zinc-800
          dark:bg-zinc-900
          dark:text-zinc-200
        "
      >
        <option value="">
          Select role
        </option>

        {roles.map((role) => (
          <option
            key={role.id}
            value={role.id}
          >
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
      title: "Delete user",
      description:
        "This will deactivate the user account. The account can be restored later.",
      action: "Delete User",
      loading: "Deleting...",
      icon: HiOutlineTrash,
      iconWrapper:
        "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
      button:
        "bg-red-600 hover:bg-red-700",
    },

    reset: {
      title: "Reset password",
      description:
        "The user's password will be reset to the default password.",
      action: "Reset Password",
      loading: "Resetting...",
      icon: HiOutlineKey,
      iconWrapper:
        "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      button:
        "bg-amber-600 hover:bg-amber-700",
    },

    restore: {
      title: "Restore user",
      description:
        "This will reactivate the user's account and restore access.",
      action: "Restore User",
      loading: "Restoring...",
      icon: HiOutlineArrowPath,
      iconWrapper:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      button:
        "bg-emerald-600 hover:bg-emerald-700",
    },
  }[type];

  const Icon = config.icon;

  return (
    <Modal
      onClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
      maxWidth="max-w-md"
    >
      <div className="p-5 sm:p-6">

        <div className="flex items-start gap-4">

          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center

              rounded-xl

              ${config.iconWrapper}
            `}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">

            <h2
              className="
                text-base
                font-bold

                text-slate-950

                dark:text-white
              "
            >
              {config.title}
            </h2>

            <p
              className="
                mt-1.5

                text-xs
                leading-5

                text-slate-500

                dark:text-zinc-500
              "
            >
              {config.description}
            </p>

          </div>

        </div>


        <div
          className="
            mt-5

            rounded-xl

            border
            border-slate-100

            bg-slate-50

            px-4
            py-3

            dark:border-zinc-900
            dark:bg-zinc-900/50
          "
        >
          <p
            className="
              text-xs
              font-semibold

              text-slate-800

              dark:text-zinc-200
            "
          >
            {user.name}
          </p>

          <p
            className="
              mt-0.5
              break-all
              text-[11px]

              text-slate-400

              dark:text-zinc-600
            "
          >
            {user.email}
          </p>
        </div>

      </div>


      <ModalFooter>

        <SecondaryButton
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </SecondaryButton>

        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`
            inline-flex
            h-10
            items-center
            justify-center
            gap-2

            rounded-xl

            px-4

            text-xs
            font-semibold

            text-white

            transition

            disabled:cursor-not-allowed
            disabled:opacity-50

            ${config.button}
          `}
        >
          {type === "restore" && (
            <HiOutlineArrowPath
              className={`
                h-4
                w-4

                ${loading ? "animate-spin" : ""}
              `}
            />
          )}

          {type === "delete" && (
            <HiOutlineTrash className="h-4 w-4" />
          )}

          {type === "reset" && (
            <HiOutlineKey className="h-4 w-4" />
          )}

          {loading
            ? config.loading
            : config.action}
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
  roles: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateUserPayload
  ) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
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
      email: email.trim(),
      roleId,
    });
  };

  return (
    <Modal
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <ModalHeader
        title="Add user"
        description="Create a new user account and assign a role."
        onClose={onClose}
      />

      <form onSubmit={handleSubmit}>

        <div className="space-y-4 p-5 sm:p-6">

          <FormInput
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Enter user name"
            required
          />

          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter email address"
            required
          />

          <RoleSelect
            value={roleId}
            onChange={setRoleId}
            roles={roles}
          />

          <div
            className="
              rounded-xl

              border
              border-indigo-100

              bg-indigo-50/60

              px-4
              py-3

              dark:border-indigo-500/20
              dark:bg-indigo-500/5
            "
          >
            <p
              className="
                text-[11px]
                font-semibold

                text-indigo-700

                dark:text-indigo-400
              "
            >
              Default password
            </p>

            <p
              className="
                mt-1
                text-xs

                text-indigo-600/80

                dark:text-indigo-400/70
              "
            >
              The new user will receive the system
              default password.
            </p>
          </div>

        </div>


        <ModalFooter>

          <SecondaryButton
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </SecondaryButton>

          <button
            type="submit"
            disabled={loading}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2

              rounded-xl

              bg-indigo-600

              px-4

              text-xs
              font-semibold

              text-white

              transition

              hover:bg-indigo-700

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <HiOutlineUserPlus className="h-4 w-4" />

            {loading
              ? "Creating..."
              : "Create User"}
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
  roles: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    payload: UpdateUserPayload
  ) => void;
}) {
  const [name, setName] =
    useState(user.name);

  const [email, setEmail] =
    useState(user.email);

  const [roleId, setRoleId] =
    useState(user.roleId);

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
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
      email: email.trim(),
      roleId,
    });
  };

  return (
    <Modal
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <ModalHeader
        title="Edit user"
        description="Update the user's account information and role."
        onClose={onClose}
      />

      <form onSubmit={handleSubmit}>

        <div className="space-y-4 p-5 sm:p-6">

          <FormInput
            label="Name"
            value={name}
            onChange={setName}
            required
          />

          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />

          <RoleSelect
            value={roleId}
            onChange={setRoleId}
            roles={roles}
          />

        </div>

        <ModalFooter>

          <SecondaryButton
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </SecondaryButton>

          <button
            type="submit"
            disabled={loading}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2

              rounded-xl

              bg-indigo-600

              px-4

              text-xs
              font-semibold

              text-white

              transition

              hover:bg-indigo-700

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <HiOutlinePencilSquare className="h-4 w-4" />

            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>

        </ModalFooter>

      </form>
    </Modal>
  );
}


/* ================================================================
   USER CARD
================================================================ */

function UserCard({
  user,
  inactive = false,

  canUpdate,
  canDelete,
  canResetPassword,
  canRestore,

  onEdit,
  onDelete,
  onResetPassword,
  onRestore,

  restoring,
  deleting,
  resetting,
}: {
  user: ManagedUser;

  inactive?: boolean;

  canUpdate: boolean;
  canDelete: boolean;
  canResetPassword: boolean;
  canRestore: boolean;

  onEdit?: (user: ManagedUser) => void;
  onDelete?: (user: ManagedUser) => void;
  onResetPassword?: (user: ManagedUser) => void;
  onRestore?: (user: ManagedUser) => void;

  restoring?: boolean;
  deleting?: boolean;
  resetting?: boolean;
}) {
  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  return (
    <article
      className={`
        overflow-hidden
        rounded-2xl
        border
        bg-white

        shadow-[0_3px_18px_rgba(15,23,42,0.04)]

        transition-all
        duration-200

        dark:bg-zinc-950
        dark:shadow-none

        ${inactive
          ? `
              border-amber-200/80
              bg-amber-50/[0.18]

              hover:border-amber-300
              hover:shadow-[0_8px_24px_rgba(245,158,11,0.07)]

              dark:border-amber-500/20
              dark:bg-amber-500/[0.025]
            `
          : `
              border-slate-200/80

              hover:-translate-y-0.5
              hover:border-slate-300
              hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]

              dark:border-zinc-800
              dark:hover:border-zinc-700
            `
        }
      `}
    >

      {/* HEADER */}

      <div
        className="
          flex
          min-w-0
          items-start
          gap-3

          border-b
          border-slate-100

          px-4
          py-4

          dark:border-zinc-900

          sm:px-5
        "
      >

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-full

            text-[11px]
            font-bold

            ${inactive
              ? `
                  bg-amber-100
                  text-amber-700

                  dark:bg-amber-500/10
                  dark:text-amber-400
                `
              : `
                  bg-indigo-50
                  text-indigo-600

                  dark:bg-indigo-500/10
                  dark:text-indigo-400
                `
            }
          `}
        >
          {initials}
        </div>


        <div className="min-w-0 flex-1">

          <div
            className="
              flex
              min-w-0
              flex-wrap
              items-center
              gap-2
            "
          >

            <p
              className="
                min-w-0
                max-w-full
                truncate

                text-sm
                font-bold

                text-slate-900

                dark:text-white
              "
            >
              {user.name}
            </p>

            {inactive ? (
              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1

                  rounded-full

                  border
                  border-amber-200

                  bg-amber-50

                  px-2
                  py-0.5

                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.08em]

                  text-amber-700

                  dark:border-amber-500/20
                  dark:bg-amber-500/10
                  dark:text-amber-400
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-amber-500
                  "
                />

                Inactive
              </span>
            ) : (
              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1

                  rounded-full

                  border
                  border-emerald-200

                  bg-emerald-50

                  px-2
                  py-0.5

                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.08em]

                  text-emerald-700

                  dark:border-emerald-500/20
                  dark:bg-emerald-500/10
                  dark:text-emerald-400
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-emerald-500
                  "
                />

                Active
              </span>
            )}

          </div>


          <p
            className="
              mt-1

              break-all

              text-[11px]

              text-slate-400

              dark:text-zinc-600
            "
          >
            {user.email}
          </p>

        </div>

      </div>


      {/* DETAILS */}

      <div
        className="
          grid
          grid-cols-1
          gap-3

          px-4
          py-4

          sm:grid-cols-2
          sm:px-5
        "
      >

        <div
          className="
            min-w-0
            rounded-xl

            border
            border-slate-100

            bg-slate-50/70

            px-3
            py-2.5

            dark:border-zinc-900
            dark:bg-zinc-900/50
          "
        >
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.1em]

              text-slate-400

              dark:text-zinc-600
            "
          >
            Role
          </p>

          <p
            className="
              mt-1
              truncate

              text-xs
              font-semibold

              text-slate-700

              dark:text-zinc-300
            "
          >
            {user.role?.name ?? "No role"}
          </p>
        </div>


        <div
          className="
            min-w-0
            rounded-xl

            border
            border-slate-100

            bg-slate-50/70

            px-3
            py-2.5

            dark:border-zinc-900
            dark:bg-zinc-900/50
          "
        >
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.1em]

              text-slate-400

              dark:text-zinc-600
            "
          >
            Created
          </p>

          <p
            className="
              mt-1

              text-xs
              font-semibold

              text-slate-700

              dark:text-zinc-300
            "
          >
            {new Date(
              user.createdAt
            ).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </p>
        </div>

      </div>


      {/* ACTIONS */}

      {(inactive
        ? canRestore
        : canUpdate ||
        canDelete ||
        canResetPassword) && (

          <div
            className="
            flex
            flex-wrap
            gap-2

            border-t
            border-slate-100

            px-4
            py-3

            dark:border-zinc-900

            sm:px-5
          "
          >

            {inactive ? (

              canRestore && (
                <button
                  type="button"
                  disabled={restoring}
                  onClick={() =>
                    onRestore?.(user)
                  }
                  className="
                  inline-flex
                  min-w-0
                  flex-1
                  h-9

                  items-center
                  justify-center
                  gap-1.5

                  rounded-xl

                  border
                  border-emerald-200

                  bg-emerald-50

                  px-3

                  text-[11px]
                  font-semibold

                  text-emerald-700

                  transition

                  hover:border-emerald-300
                  hover:bg-emerald-100

                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  dark:border-emerald-500/20
                  dark:bg-emerald-500/10
                  dark:text-emerald-400
                "
                >
                  <HiOutlineArrowPath
                    className={`
                    h-4
                    w-4

                    ${restoring
                        ? "animate-spin"
                        : ""
                      }
                  `}
                  />

                  {restoring
                    ? "Restoring..."
                    : "Restore User"}
                </button>
              )

            ) : (

              <>

                {canUpdate && (
                  <button
                    type="button"
                    onClick={() =>
                      onEdit?.(user)
                    }
                    className="
                    inline-flex
                    min-w-[90px]
                    flex-1
                    h-9

                    items-center
                    justify-center
                    gap-1.5

                    rounded-xl

                    border
                    border-slate-200

                    bg-white

                    px-3

                    text-[11px]
                    font-semibold

                    text-slate-600

                    transition

                    hover:border-slate-300
                    hover:bg-slate-50
                    hover:text-slate-900

                    dark:border-zinc-800
                    dark:bg-zinc-900
                    dark:text-zinc-400

                    dark:hover:border-zinc-700
                    dark:hover:bg-zinc-800
                    dark:hover:text-zinc-200
                  "
                  >
                    <HiOutlinePencilSquare
                      className="h-4 w-4"
                    />

                    Edit
                  </button>
                )}


                {canResetPassword && (
                  <button
                    type="button"
                    disabled={resetting}
                    onClick={() =>
                      onResetPassword?.(user)
                    }
                    className="
                    inline-flex
                    min-w-[90px]
                    flex-1
                    h-9

                    items-center
                    justify-center
                    gap-1.5

                    rounded-xl

                    border
                    border-slate-200

                    bg-white

                    px-3

                    text-[11px]
                    font-semibold

                    text-slate-600

                    transition

                    hover:border-slate-300
                    hover:bg-slate-50
                    hover:text-slate-900

                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    dark:border-zinc-800
                    dark:bg-zinc-900
                    dark:text-zinc-400

                    dark:hover:border-zinc-700
                    dark:hover:bg-zinc-800
                    dark:hover:text-zinc-200
                  "
                  >
                    <HiOutlineKey
                      className="h-4 w-4"
                    />

                    {resetting
                      ? "Resetting..."
                      : "Reset"}
                  </button>
                )}


                {canDelete && (
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() =>
                      onDelete?.(user)
                    }
                    className="
                    inline-flex
                    min-w-[90px]
                    flex-1
                    h-9

                    items-center
                    justify-center
                    gap-1.5

                    rounded-xl

                    border
                    border-red-200

                    bg-red-50

                    px-3

                    text-[11px]
                    font-semibold

                    text-red-600

                    transition

                    hover:border-red-300
                    hover:bg-red-100

                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    dark:border-red-500/20
                    dark:bg-red-500/10
                    dark:text-red-400

                    dark:hover:bg-red-500/15
                  "
                  >
                    <HiOutlineTrash
                      className="h-4 w-4"
                    />

                    {deleting
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                )}

              </>

            )}

          </div>

        )}

    </article>
  );
}


/* ================================================================
   SKELETON
================================================================ */

function UserSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl

        border
        border-slate-200

        bg-white

        dark:border-zinc-800
        dark:bg-zinc-950
      "
    >
      <div className="animate-pulse">

        <div
          className="
            flex
            items-center
            gap-3

            border-b
            border-slate-100

            px-5
            py-4

            dark:border-zinc-900
          "
        >
          <div
            className="
              h-10
              w-10
              rounded-full

              bg-slate-200

              dark:bg-zinc-800
            "
          />

          <div className="flex-1 space-y-2">

            <div
              className="
                h-3
                w-28
                rounded

                bg-slate-200

                dark:bg-zinc-800
              "
            />

            <div
              className="
                h-2.5
                w-40
                rounded

                bg-slate-100

                dark:bg-zinc-900
              "
            />

          </div>

        </div>


        <div
          className="
            grid
            gap-3
            p-5

            sm:grid-cols-2
          "
        >
          <div
            className="
              h-14
              rounded-xl

              bg-slate-100

              dark:bg-zinc-900
            "
          />

          <div
            className="
              h-14
              rounded-xl

              bg-slate-100

              dark:bg-zinc-900
            "
          />
        </div>

      </div>
    </div>
  );
}


/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({
  inactive,
}: {
  inactive: boolean;
}) {
  return (
    <div
      className="
        flex
        min-h-[220px]

        flex-col
        items-center
        justify-center

        rounded-2xl

        border
        border-dashed
        border-slate-200

        bg-white/60

        px-6

        text-center

        dark:border-zinc-800
        dark:bg-zinc-950/40
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center

          rounded-xl

          bg-slate-100

          text-slate-400

          dark:bg-zinc-900
          dark:text-zinc-600
        "
      >
        <HiOutlineUserGroup className="h-5 w-5" />
      </div>

      <h3
        className="
          mt-4

          text-sm
          font-bold

          text-slate-900

          dark:text-white
        "
      >
        {inactive
          ? "No inactive users"
          : "No active users"}
      </h3>

      <p
        className="
          mt-1.5

          max-w-[320px]

          text-xs
          leading-5

          text-slate-400

          dark:text-zinc-600
        "
      >
        {inactive
          ? "Deleted users will appear here and can be restored."
          : "There are currently no active users."}
      </p>
    </div>
  );
}


/* ================================================================
   ERROR
================================================================ */

function ErrorState() {
  return (
    <div
      className="
        flex
        min-h-[220px]

        flex-col
        items-center
        justify-center

        rounded-2xl

        border
        border-red-200

        bg-red-50/50

        px-6

        text-center

        dark:border-red-500/20
        dark:bg-red-500/5
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center

          rounded-xl

          bg-red-100

          text-red-500

          dark:bg-red-500/10
          dark:text-red-400
        "
      >
        <HiOutlineExclamationTriangle className="h-5 w-5" />
      </div>

      <h3
        className="
          mt-4

          text-sm
          font-bold

          text-slate-900

          dark:text-white
        "
      >
        Unable to load users
      </h3>

      <p
        className="
          mt-2

          text-xs

          text-slate-500

          dark:text-zinc-500
        "
      >
        Something went wrong while loading the users.
      </p>
    </div>
  );
}


/* ================================================================
   USERS SCREEN
================================================================ */

export default function Users() {

  const queryClient =
    useQueryClient();

  const { hasPermission } =
    useAuth();


  /* ==============================================================
     PERMISSIONS
  ============================================================== */

  const canCreate =
    hasPermission("USER_CREATE");

  const canUpdate =
    hasPermission("USER_UPDATE");

  const canDelete =
    hasPermission("USER_DELETE");

  const canResetPassword =
    hasPermission(
      "USER_PASSWORD_RESET"
    );

  const canRestore =
    hasPermission("USER_RESTORE");


  /* ==============================================================
     STATE
  ============================================================== */

  const [search, setSearch] =
    useState("");

  const [showInactive, setShowInactive] =
    useState(false);

  const [modal, setModal] =
    useState<ModalType>(null);

  const [selectedUser, setSelectedUser] =
    useState<ManagedUser | null>(null);


  /* ==============================================================
     ACTIVE USERS
  ============================================================== */

  const {
    data: activeData,
    isLoading: activeLoading,
    isError: activeError,
  } = useQuery({
    queryKey: ["users", "active"],
    queryFn: getUsers,
    enabled: !showInactive,
  });


  /* ==============================================================
     INACTIVE USERS
  ============================================================== */

  const {
    data: inactiveData,
    isLoading: inactiveLoading,
    isError: inactiveError,
  } = useQuery({
    queryKey: ["users", "inactive"],
    queryFn: getInactiveUsers,
    enabled: showInactive,
  });


  /* ==============================================================
     ROLES
     --------------------------------------------------------------
     If you already have getRoles() in your role service,
     replace this query with that service.
  ============================================================== */

  const {
    data: rolesData,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      /*
       * Replace this with your existing getRoles()
       * service if you already have one.
       *
       * Expected backend response:
       *
       * {
       *   success: true,
       *   data: [...]
       * }
       */

      const { default: api } =
        await import("../../services/api");

      const response =
        await api.get<{
          success: boolean;
          data: Array<{
            id: string;
            name: string;
            description?: string | null;
          }>;
        }>("/api/roles");

      return response.data;
    },

    enabled:
      modal === "create" ||
      modal === "edit",
  });


  const roles =
    rolesData?.data ?? [];


  /* ==============================================================
     CREATE MUTATION
  ============================================================== */

  const createMutation =
    useMutation({
      mutationFn: (
        payload: CreateUserPayload
      ) =>
        createUser(payload),

      onSuccess: () => {

        toast.success(
          "User created successfully."
        );

        setModal(null);

        queryClient.invalidateQueries({
          queryKey: ["users", "active"],
        });

      },

      onError: (error: any) => {

        toast.error(
          error?.response?.data?.message ||
          "Unable to create user."
        );

      },
    });


  /* ==============================================================
     UPDATE MUTATION
  ============================================================== */

  const updateMutation =
    useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string;
        payload: UpdateUserPayload;
      }) =>
        updateUser(id, payload),

      onSuccess: () => {

        toast.success(
          "User updated successfully."
        );

        setModal(null);
        setSelectedUser(null);

        queryClient.invalidateQueries({
          queryKey: ["users", "active"],
        });

      },

      onError: (error: any) => {

        toast.error(
          error?.response?.data?.message ||
          "Unable to update user."
        );

      },
    });


  /* ==============================================================
     DELETE MUTATION
  ============================================================== */

  const deleteMutation =
    useMutation({
      mutationFn: (id: string) =>
        deleteUser(id),

      onSuccess: () => {

        toast.success(
          "User deleted successfully."
        );

        setModal(null);
        setSelectedUser(null);

        queryClient.invalidateQueries({
          queryKey: ["users", "active"],
        });

        queryClient.invalidateQueries({
          queryKey: ["users", "inactive"],
        });

      },

      onError: (error: any) => {

        toast.error(
          error?.response?.data?.message ||
          "Unable to delete user."
        );

      },
    });


  /* ==============================================================
     RESET PASSWORD MUTATION
  ============================================================== */

  const resetMutation =
    useMutation({
      mutationFn: (id: string) =>
        resetUserPassword(id),

      onSuccess: () => {

        toast.success(
          "Password reset successfully."
        );

        setModal(null);
        setSelectedUser(null);

      },

      onError: (error: any) => {

        toast.error(
          error?.response?.data?.message ||
          "Unable to reset password."
        );

      },
    });


  /* ==============================================================
     RESTORE MUTATION
  ============================================================== */

  const restoreMutation =
    useMutation({
      mutationFn: (id: string) =>
        restoreUser(id),

      onSuccess: () => {

        toast.success(
          "User restored successfully."
        );

        setModal(null);
        setSelectedUser(null);

        queryClient.invalidateQueries({
          queryKey: ["users", "inactive"],
        });

        queryClient.invalidateQueries({
          queryKey: ["users", "active"],
        });

      },

      onError: (error: any) => {

        toast.error(
          error?.response?.data?.message ||
          "Unable to restore user."
        );

      },
    });


  /* ==============================================================
     DATA
  ============================================================== */

  const users =
    showInactive
      ? inactiveData?.data ?? []
      : activeData?.data ?? [];


  /*
   * This is only searching the currently loaded
   * server response.
   *
   * Since ACTIVE and INACTIVE are separate APIs,
   * we never load inactive users when the active
   * screen is being displayed.
   *
   * If the API becomes paginated/searchable later,
   * this search should also move completely
   * to the backend.
   */

  const visibleUsers =
    users.filter(
      (user: ManagedUser) => {

        const value =
          search.trim().toLowerCase();

        if (!value) {
          return true;
        }

        return (
          user.name
            .toLowerCase()
            .includes(value) ||

          user.email
            .toLowerCase()
            .includes(value) ||

          user.role?.name
            ?.toLowerCase()
            .includes(value)
        );
      }
    );


  const isLoading =
    showInactive
      ? inactiveLoading
      : activeLoading;

  const isError =
    showInactive
      ? inactiveError
      : activeError;


  /* ==============================================================
     MODAL HANDLERS
  ============================================================== */

  const openCreate =
    () => {

      if (!canCreate) {
        return;
      }

      setSelectedUser(null);
      setModal("create");
    };


  const openEdit =
    (user: ManagedUser) => {

      if (!canUpdate) {
        return;
      }

      setSelectedUser(user);
      setModal("edit");
    };


  const openDelete =
    (user: ManagedUser) => {

      if (!canDelete) {
        return;
      }

      setSelectedUser(user);
      setModal("delete");
    };


  const openReset =
    (user: ManagedUser) => {

      if (!canResetPassword) {
        return;
      }

      setSelectedUser(user);
      setModal("reset");
    };


  const openRestore =
    (user: ManagedUser) => {

      if (!canRestore) {
        return;
      }

      setSelectedUser(user);
      setModal("restore");
    };


  const closeModal =
    () => {

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
      setSelectedUser(null);
    };


  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1180px]

        px-4
        py-5

        sm:px-6
        sm:py-7

        lg:px-8
        lg:py-8
      "
    >

      {/* ==========================================================
          HEADER
      ========================================================== */}

      <div
        className="
          border-b
          border-slate-200/80

          pb-5

          dark:border-zinc-800/80

          sm:pb-6
        "
      >

        <div
          className="
            flex
            flex-col
            gap-5

            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          <div className="min-w-0">

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >

              <h1
                className="
                  text-[26px]
                  font-bold
                  tracking-[-0.035em]

                  text-slate-950

                  dark:text-white

                  sm:text-3xl
                "
              >
                Users
              </h1>


              <span
                className={`
                  rounded-full

                  border

                  px-2.5
                  py-1

                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.08em]

                  ${showInactive
                    ? `
                        border-amber-200
                        bg-amber-50
                        text-amber-700

                        dark:border-amber-500/20
                        dark:bg-amber-500/10
                        dark:text-amber-400
                      `
                    : `
                        border-emerald-200
                        bg-emerald-50
                        text-emerald-700

                        dark:border-emerald-500/20
                        dark:bg-emerald-500/10
                        dark:text-emerald-400
                      `
                  }
                `}
              >
                {showInactive
                  ? "Inactive"
                  : "Active"}
              </span>

            </div>


            <p
              className="
                mt-1.5

                max-w-[620px]

                text-sm
                leading-5

                text-slate-500

                dark:text-zinc-500
              "
            >
              {showInactive
                ? "View deleted accounts and restore access when needed."
                : "Manage active users, roles, passwords, and account access."}
            </p>

          </div>


          {/* CREATE */}

          {!showInactive &&
            canCreate && (

              <button
                type="button"
                onClick={openCreate}
                className="
                  inline-flex
                  h-10
                  w-full

                  items-center
                  justify-center
                  gap-2

                  rounded-xl

                  bg-indigo-600

                  px-4

                  text-xs
                  font-semibold

                  text-white

                  shadow-sm

                  transition

                  hover:bg-indigo-700

                  sm:w-auto
                "
              >
                <HiOutlineUserPlus
                  className="h-4 w-4"
                />

                Add User
              </button>

            )}

        </div>


        {/* ========================================================
            CONTROLS
        ======================================================== */}

        <div
          className="
            mt-5

            flex
            flex-col
            gap-3

            sm:flex-row
            sm:items-center
          "
        >

          {/* SEARCH */}

          <div
            className="
              relative
              min-w-0
              flex-1
            "
          >

            <HiOutlineMagnifyingGlass
              className="
                pointer-events-none

                absolute
                left-3.5
                top-1/2

                h-4
                w-4

                -translate-y-1/2

                text-slate-400

                dark:text-zinc-600
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={
                showInactive
                  ? "Search inactive users..."
                  : "Search users..."
              }
              className="
                h-10
                w-full

                rounded-xl

                border
                border-slate-200

                bg-white

                pl-10
                pr-10

                text-xs

                text-slate-800

                outline-none

                transition

                placeholder:text-slate-400

                focus:border-indigo-400
                focus:ring-2
                focus:ring-indigo-500/10

                dark:border-zinc-800
                dark:bg-zinc-950
                dark:text-zinc-200

                dark:placeholder:text-zinc-600

                dark:focus:border-indigo-500/50
              "
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  absolute
                  right-3
                  top-1/2

                  -translate-y-1/2

                  text-slate-400

                  hover:text-slate-700

                  dark:text-zinc-600
                  dark:hover:text-zinc-300
                "
                aria-label="Clear search"
              >
                <HiOutlineXMark
                  className="h-4 w-4"
                />
              </button>
            )}

          </div>


          {/* STATUS */}

          <div
            className="
              grid
              w-full
              grid-cols-2

              rounded-xl

              border
              border-slate-200

              bg-white

              p-1

              sm:w-auto
              sm:shrink-0

              dark:border-zinc-800
              dark:bg-zinc-950
            "
          >

            <button
              type="button"
              onClick={() => {
                setShowInactive(false);
                setSearch("");
              }}
              className={`
                h-8

                rounded-lg

                px-3

                text-[10px]
                font-semibold

                transition

                sm:px-4

                ${!showInactive
                  ? `
                      bg-indigo-600
                      text-white
                      shadow-sm
                    `
                  : `
                      text-slate-500

                      hover:bg-slate-100
                      hover:text-slate-800

                      dark:text-zinc-500
                      dark:hover:bg-zinc-900
                      dark:hover:text-zinc-200
                    `
                }
              `}
            >
              Active
            </button>


            <button
              type="button"
              onClick={() => {
                setShowInactive(true);
                setSearch("");
              }}
              className={`
                h-8

                rounded-lg

                px-3

                text-[10px]
                font-semibold

                transition

                sm:px-4

                ${showInactive
                  ? `
                      bg-amber-500
                      text-white
                      shadow-sm
                    `
                  : `
                      text-slate-500

                      hover:bg-slate-100
                      hover:text-slate-800

                      dark:text-zinc-500
                      dark:hover:bg-zinc-900
                      dark:hover:text-zinc-200
                    `
                }
              `}
            >
              Inactive
            </button>

          </div>

        </div>

      </div>


      {/* ==========================================================
          CONTENT
      ========================================================== */}

      <div className="mt-6 sm:mt-7">

        {isLoading ? (

          <div
            className="
              grid
              grid-cols-1
              gap-4

              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <UserSkeleton
                  key={item}
                />
              )
            )}
          </div>

        ) : isError ? (

          <ErrorState />

        ) : visibleUsers.length === 0 ? (

          <EmptyState
            inactive={showInactive}
          />

        ) : (

          <>

            {/* SUMMARY */}

            <div
              className="
                mb-4

                flex
                flex-wrap
                items-center
                justify-between
                gap-2
              "
            >

              <p
                className="
                  text-[11px]
                  font-medium

                  text-slate-400

                  dark:text-zinc-600
                "
              >
                {visibleUsers.length}{" "}
                {visibleUsers.length === 1
                  ? "user"
                  : "users"}{" "}
                displayed
              </p>


              {search && (
                <p
                  className="
                    text-[10px]

                    text-slate-400

                    dark:text-zinc-600
                  "
                >
                  Search results for{" "}
                  <span
                    className="
                      font-semibold

                      text-slate-600

                      dark:text-zinc-400
                    "
                  >
                    "{search}"
                  </span>
                </p>
              )}

            </div>


            {/* GRID */}

            <div
              className="
                grid
                grid-cols-1
                gap-4

                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {visibleUsers.map(
                (user: ManagedUser) => (

                  <UserCard
                    key={user.id}

                    user={user}

                    inactive={
                      showInactive
                    }

                    canUpdate={
                      canUpdate
                    }

                    canDelete={
                      canDelete
                    }

                    canResetPassword={
                      canResetPassword
                    }

                    canRestore={
                      canRestore
                    }

                    onEdit={
                      openEdit
                    }

                    onDelete={
                      openDelete
                    }

                    onResetPassword={
                      openReset
                    }

                    onRestore={
                      openRestore
                    }

                    restoring={
                      restoreMutation.isPending &&
                      restoreMutation.variables ===
                      user.id
                    }

                    deleting={
                      deleteMutation.isPending &&
                      deleteMutation.variables ===
                      user.id
                    }

                    resetting={
                      resetMutation.isPending &&
                      resetMutation.variables ===
                      user.id
                    }
                  />

                )
              )}

            </div>

          </>

        )}

      </div>


      {/* ==========================================================
          CREATE MODAL
      ========================================================== */}

      {modal === "create" && (
        <CreateUserModal
          roles={roles}

          loading={
            createMutation.isPending
          }

          onClose={closeModal}

          onSubmit={(payload) =>
            createMutation.mutate(
              payload
            )
          }
        />
      )}


      {/* ==========================================================
          EDIT MODAL
      ========================================================== */}

      {modal === "edit" &&
        selectedUser && (

          <EditUserModal
            user={selectedUser}

            roles={roles}

            loading={
              updateMutation.isPending
            }

            onClose={closeModal}

            onSubmit={(payload) =>
              updateMutation.mutate({
                id: selectedUser.id,
                payload,
              })
            }
          />

        )}


      {/* ==========================================================
          DELETE MODAL
      ========================================================== */}

      {modal === "delete" &&
        selectedUser && (

          <ConfirmModal
            type="delete"

            user={selectedUser}

            loading={
              deleteMutation.isPending
            }

            onCancel={closeModal}

            onConfirm={() =>
              deleteMutation.mutate(
                selectedUser.id
              )
            }
          />

        )}


      {/* ==========================================================
          RESET PASSWORD MODAL
      ========================================================== */}

      {modal === "reset" &&
        selectedUser && (

          <ConfirmModal
            type="reset"

            user={selectedUser}

            loading={
              resetMutation.isPending
            }

            onCancel={closeModal}

            onConfirm={() =>
              resetMutation.mutate(
                selectedUser.id
              )
            }
          />

        )}


      {/* ==========================================================
          RESTORE MODAL
      ========================================================== */}

      {modal === "restore" &&
        selectedUser && (

          <ConfirmModal
            type="restore"

            user={selectedUser}

            loading={
              restoreMutation.isPending
            }

            onCancel={closeModal}

            onConfirm={() =>
              restoreMutation.mutate(
                selectedUser.id
              )
            }
          />

        )}

    </div>
  );
}