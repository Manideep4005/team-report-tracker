import { useEffect, useState, type FormEvent } from "react";

import {
  HiOutlineShieldCheck,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineCircleStack,
} from "react-icons/hi2";

import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  type Permission,
} from "../../services/permission";

import { useAuth } from "../../context/AuthContext";

/* ================================================================
   MAIN PAGE
================================================================ */

export default function Permissions() {
  const { hasPermission } = useAuth();

  /* ============================================================
       STATE
    ============================================================ */

  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null,
  );

  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);

  /* ============================================================
       LOAD
    ============================================================ */

  async function loadPermissions() {
    try {
      setLoading(true);
      setError(null);

      const response = await getPermissions();

      setPermissions(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load permissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPermissions();
  }, []);

  /* ============================================================
       MODALS
    ============================================================ */

  function openCreate() {
    setEditingPermission(null);
    setShowModal(true);
  }

  function openEdit(permission: Permission) {
    setEditingPermission(permission);

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingPermission(null);
  }

  /* ============================================================
       SAVE
    ============================================================ */

  async function handleSave(data: {
    code: string;
    name: string;
    description: string;
  }) {
    if (editingPermission) {
      await updatePermission(editingPermission.id, data);
    } else {
      await createPermission(data);
    }

    closeModal();

    await loadPermissions();
  }

  /* ============================================================
       DELETE
    ============================================================ */

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    await deletePermission(deleteTarget.id);

    setDeleteTarget(null);

    await loadPermissions();
  }

  /* ============================================================
       STATS
    ============================================================ */

  const totalPermissions = permissions.length;

  const assignedPermissions = permissions.filter(
    (permission) => (permission._count?.roles ?? 0) > 0,
  ).length;

  const unusedPermissions = permissions.filter(
    (permission) => (permission._count?.roles ?? 0) === 0,
  ).length;

  /* ============================================================
       RENDER
    ============================================================ */

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
      {/* ==================================================
                HEADER
            ================================================== */}

      <div
        className="
                    flex
                    flex-col
                    gap-5
                    border-b
                    border-slate-200/80
                    pb-5
                    dark:border-zinc-800/80
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                    sm:pb-6
                "
      >
        <div className="min-w-0">
          <div
            className="
                            mb-3
                            flex
                            items-center
                            gap-2
                        "
          ></div>

          <div
            className="
                            flex
                            flex-wrap
                            items-center
                            gap-3
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
              Permissions
            </h1>

            {!loading && (
              <span
                className="
                                    inline-flex
                                    h-7
                                    items-center
                                    rounded-full
                                    border
                                    border-indigo-100
                                    bg-indigo-50
                                    px-2.5
                                    text-[10px]
                                    font-bold
                                    text-indigo-600
                                    dark:border-indigo-500/20
                                    dark:bg-indigo-500/10
                                    dark:text-indigo-400
                                "
              >
                {totalPermissions}{" "}
                {totalPermissions === 1 ? "permission" : "permissions"}
              </span>
            )}
          </div>

          <p
            className="
                            mt-1.5
                            text-sm
                            text-slate-500
                            dark:text-zinc-500
                        "
          >
            Control what users and roles can access.
          </p>
        </div>

        {hasPermission("PERMISSION_CREATE") && (
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
                            shadow-indigo-600/20
                            transition-all
                            hover:bg-indigo-700
                            hover:shadow-md
                            active:scale-[0.98]
                            sm:w-auto
                        "
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add Permission
          </button>
        )}
      </div>

      {/* ==================================================
                STATS
            ================================================== */}

      {!loading && !error && permissions.length > 0 && (
        <div
          className="
                            mt-5
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-3
                        "
        >
          <PermissionStat
            icon={<HiOutlineShieldCheck />}
            label="Total permissions"
            value={totalPermissions}
          />

          <PermissionStat
            icon={<HiOutlineUsers />}
            label="Assigned"
            value={assignedPermissions}
          />

          <PermissionStat
            icon={<HiOutlineCircleStack />}
            label="Unused"
            value={unusedPermissions}
          />
        </div>
      )}

      {/* ==================================================
                CONTENT
            ================================================== */}

      <div className="mt-5">
        {loading ? (
          <PermissionSkeleton />
        ) : error ? (
          <PermissionError message={error} onRetry={loadPermissions} />
        ) : permissions.length === 0 ? (
          <PermissionEmpty
            canCreate={hasPermission("PERMISSION_CREATE")}
            onCreate={openCreate}
          />
        ) : (
          <div
            className="
                            grid
                            gap-4
                            sm:grid-cols-2
                            xl:grid-cols-3
                        "
          >
            {permissions.map((permission) => (
              <PermissionCard
                key={permission.id}
                permission={permission}
                canUpdate={hasPermission("PERMISSION_UPDATE")}
                canDelete={hasPermission("PERMISSION_DELETE")}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* ==================================================
                CREATE / EDIT MODAL
            ================================================== */}

      {showModal && (
        <PermissionModal
          permission={editingPermission}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {/* ==================================================
                DELETE MODAL
            ================================================== */}

      {deleteTarget && (
        <DeletePermissionModal
          permission={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* ================================================================
   STAT
================================================================ */

function PermissionStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div
      className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                dark:border-zinc-800
                dark:bg-zinc-950
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
                    bg-indigo-50
                    text-indigo-600
                    dark:bg-indigo-500/10
                    dark:text-indigo-400
                "
      >
        <span className="h-4 w-4">{icon}</span>
      </div>

      <div>
        <p
          className="
                        text-[18px]
                        font-bold
                        leading-none
                        text-slate-900
                        dark:text-white
                    "
        >
          {value}
        </p>

        <p
          className="
                        mt-1
                        text-[10px]
                        font-medium
                        text-slate-400
                        dark:text-zinc-600
                    "
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   PERMISSION CARD
================================================================ */

function PermissionCard({
  permission,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: {
  permission: Permission;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
}) {
  const roleCount = permission._count?.roles ?? 0;

  return (
    <div
      className="
                flex
                min-h-[218px]
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_3px_16px_rgba(15,23,42,0.035)]
                transition-all
                duration-200
                hover:-translate-y-[1px]
                hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]
                dark:border-zinc-800
                dark:bg-zinc-950
                dark:shadow-none
            "
    >
      {/* ==================================================
                BODY
            ================================================== */}

      <div className="flex-1 p-5">
        <div
          className="
                        flex
                        items-start
                        justify-between
                        gap-3
                    "
        >
          <div className="min-w-0">
            <h2
              className="
                                break-words
                                text-[14px]
                                font-bold
                                leading-5
                                tracking-tight
                                text-slate-900
                                dark:text-white
                            "
            >
              {permission.name}
            </h2>

            <code
              className="
                                mt-2
                                inline-flex
                                max-w-full
                                truncate
                                rounded-md
                                border
                                border-slate-200
                                bg-slate-50
                                px-2
                                py-1
                                text-[9px]
                                font-semibold
                                text-slate-500
                                dark:border-zinc-800
                                dark:bg-zinc-900
                                dark:text-zinc-500
                            "
            >
              {permission.code}
            </code>
          </div>

          <div
            className={`
                            flex
                            h-8
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-lg
                            px-2.5
                            text-[9px]
                            font-bold

                            ${
                              roleCount > 0
                                ? `
                                        bg-indigo-50
                                        text-indigo-600
                                        dark:bg-indigo-500/10
                                        dark:text-indigo-400
                                    `
                                : `
                                        bg-slate-50
                                        text-slate-400
                                        dark:bg-zinc-900
                                        dark:text-zinc-600
                                    `
                            }
                        `}
          >
            <HiOutlineUsers className="h-3.5 w-3.5" />

            {roleCount}
          </div>
        </div>

        {/* DESCRIPTION */}

        <p
          className="
                        mt-5
                        line-clamp-3
                        min-h-[48px]
                        text-[11px]
                        leading-4
                        text-slate-500
                        dark:text-zinc-500
                    "
        >
          {permission.description || "No description provided."}
        </p>

        {/* USAGE */}

        <div
          className="
                        mt-5
                        flex
                        items-center
                        gap-2
                    "
        >
          {roleCount > 0 ? (
            <>
              <span
                className="
                                    flex
                                    h-5
                                    w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-emerald-50
                                    text-emerald-600
                                    dark:bg-emerald-500/10
                                    dark:text-emerald-400
                                "
              >
                <HiOutlineCheckCircle className="h-3.5 w-3.5" />
              </span>

              <span
                className="
                                    text-[10px]
                                    font-medium
                                    text-slate-500
                                    dark:text-zinc-500
                                "
              >
                Used by{" "}
                <strong
                  className="
                                        font-semibold
                                        text-slate-700
                                        dark:text-zinc-300
                                    "
                >
                  {roleCount}
                </strong>{" "}
                {roleCount === 1 ? "role" : "roles"}
              </span>
            </>
          ) : (
            <>
              <span
                className="
                                    flex
                                    h-5
                                    w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-slate-100
                                    text-slate-400
                                    dark:bg-zinc-900
                                    dark:text-zinc-600
                                "
              >
                <HiOutlineCircleStack className="h-3.5 w-3.5" />
              </span>

              <span
                className="
                                    text-[10px]
                                    font-medium
                                    text-slate-400
                                    dark:text-zinc-600
                                "
              >
                Not assigned to any role
              </span>
            </>
          )}
        </div>
      </div>

      {/* ==================================================
                ACTIONS
            ================================================== */}

      {(canUpdate || canDelete) && (
        <div
          className="
                        flex
                        items-center
                        justify-end
                        gap-2
                        border-t
                        border-slate-100
                        px-5
                        py-3
                        dark:border-zinc-800
                    "
        >
          {canUpdate && (
            <button
              type="button"
              onClick={() => onEdit(permission)}
              className="
                                inline-flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                text-slate-500
                                shadow-sm
                                transition
                                hover:border-indigo-200
                                hover:bg-indigo-50
                                hover:text-indigo-600
                                dark:border-zinc-800
                                dark:bg-zinc-900
                                dark:text-zinc-500
                                dark:hover:border-indigo-500/30
                                dark:hover:bg-indigo-500/10
                                dark:hover:text-indigo-400
                            "
              title="Edit permission"
            >
              <HiOutlinePencilSquare className="h-4 w-4" />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(permission)}
              className="
                                inline-flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-red-100
                                bg-red-50
                                text-red-500
                                transition
                                hover:bg-red-100
                                dark:border-red-900/30
                                dark:bg-red-950/20
                                dark:text-red-400
                                dark:hover:bg-red-950/40
                            "
              title="Delete permission"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MODAL BACKDROP
================================================================ */

function ModalBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="
                fixed
                inset-0
                z-[100]
                flex
                items-end
                justify-center
                bg-slate-950/35
                p-0
                backdrop-blur-sm
                sm:items-center
                sm:p-4
                dark:bg-black/60
            "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

/* ================================================================
   CREATE / EDIT MODAL
================================================================ */

function PermissionModal({
  permission,
  onClose,
  onSave,
}: {
  permission: Permission | null;
  onClose: () => void;
  onSave: (data: {
    code: string;
    name: string;
    description: string;
  }) => Promise<void>;
}) {
  const [code, setCode] = useState(permission?.code ?? "");

  const [name, setName] = useState(permission?.name ?? "");

  const [description, setDescription] = useState(permission?.description ?? "");

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();

    setError("");

    if (!code.trim()) {
      setError("Permission code is required.");

      return;
    }

    if (!/^[A-Z0-9_]+$/i.test(code.trim())) {
      setError("Code can contain only letters, numbers and underscores.");

      return;
    }

    if (!name.trim()) {
      setError("Permission name is required.");

      return;
    }

    try {
      setSaving(true);

      await onSave({
        code: code.trim().toUpperCase(),

        name: name.trim(),

        description: description.trim(),
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save permission.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div
        className="
                    flex
                    max-h-[94vh]
                    w-full
                    flex-col
                    overflow-hidden
                    rounded-t-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                    sm:max-h-[90vh]
                    sm:max-w-lg
                    sm:rounded-2xl
                    dark:border-zinc-800
                    dark:bg-zinc-950
                "
      >
        {/* HEADER */}

        <div
          className="
                        flex
                        shrink-0
                        items-start
                        justify-between
                        border-b
                        border-slate-200
                        px-5
                        py-4
                        dark:border-zinc-800
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
              <div
                className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-indigo-50
                                    text-indigo-600
                                    dark:bg-indigo-500/10
                                    dark:text-indigo-400
                                "
              >
                <HiOutlineShieldCheck className="h-4 w-4" />
              </div>

              <h2
                className="
                                    text-sm
                                    font-bold
                                    text-slate-900
                                    dark:text-white
                                "
              >
                {permission ? "Edit Permission" : "Create Permission"}
              </h2>
            </div>

            <p
              className="
                                mt-2
                                text-xs
                                text-slate-500
                                dark:text-zinc-500
                            "
            >
              {permission
                ? "Update permission details and access information."
                : "Create a permission that can be assigned to roles."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
                            inline-flex
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

        {/* BODY */}

        <form
          onSubmit={submit}
          className="
                        min-h-0
                        overflow-y-auto
                    "
        >
          <div
            className="
                            space-y-5
                            p-5
                        "
          >
            {/* CODE */}

            <div>
              <label className="label">Permission Code</label>

              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="REPORT_EXPORT"
                className="
                                    input
                                    font-mono
                                    text-xs
                                    uppercase
                                "
                disabled={saving}
                autoFocus
              />

              <p
                className="
                                    mt-1.5
                                    text-[10px]
                                    text-slate-400
                                    dark:text-zinc-600
                                "
              >
                Use uppercase letters, numbers and underscores.
              </p>
            </div>

            {/* NAME */}

            <div>
              <label className="label">Permission Name</label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Export Reports"
                className="input"
                disabled={saving}
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="label">Description</label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Allow users to export reports."
                rows={4}
                className="
                                    input
                                    resize-none
                                "
                disabled={saving}
              />
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                                    rounded-lg
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-3
                                    py-2.5
                                    text-xs
                                    font-medium
                                    text-red-600
                                    dark:border-red-900/30
                                    dark:bg-red-950/20
                                    dark:text-red-400
                                "
              >
                {error}
              </div>
            )}
          </div>

          {/* FOOTER */}

          <div
            className="
                            flex
                            shrink-0
                            flex-col-reverse
                            gap-2
                            border-t
                            border-slate-200
                            px-5
                            py-4
                            dark:border-zinc-800
                            sm:flex-row
                            sm:justify-end
                        "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                                btn-secondary
                                w-full
                                text-xs
                                sm:w-auto
                            "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                                btn-primary
                                w-full
                                text-xs
                                sm:w-auto
                            "
            >
              {saving
                ? "Saving..."
                : permission
                  ? "Save Changes"
                  : "Create Permission"}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ================================================================
   DELETE MODAL
================================================================ */

function DeletePermissionModal({
  permission,
  onClose,
  onConfirm,
}: {
  permission: Permission;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const roleCount = permission._count?.roles ?? 0;

  async function confirmDelete() {
    try {
      setDeleting(true);

      await onConfirm();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Unable to delete permission.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div
        className="
                    w-full
                    rounded-t-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                    sm:max-w-sm
                    sm:rounded-2xl
                    dark:border-zinc-800
                    dark:bg-zinc-950
                "
      >
        <div className="p-5">
          <div
            className="
                            flex
                            items-start
                            justify-between
                        "
          >
            <div
              className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-red-50
                                text-red-500
                                dark:bg-red-950/30
                                dark:text-red-400
                            "
            >
              <HiOutlineTrash className="h-5 w-5" />
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="
                                inline-flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                hover:bg-slate-100
                                dark:text-zinc-500
                                dark:hover:bg-zinc-900
                            "
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>

          <h2
            className="
                            mt-4
                            text-sm
                            font-bold
                            text-slate-900
                            dark:text-white
                        "
          >
            Delete permission?
          </h2>

          <p
            className="
                            mt-2
                            text-xs
                            leading-5
                            text-slate-500
                            dark:text-zinc-500
                        "
          >
            You are about to delete{" "}
            <span
              className="
                                font-semibold
                                text-slate-700
                                dark:text-zinc-300
                            "
            >
              {permission.name}
            </span>
            .
          </p>

          {roleCount > 0 ? (
            <div
              className="
                                mt-4
                                rounded-xl
                                border
                                border-amber-200
                                bg-amber-50
                                px-3
                                py-3
                                text-[11px]
                                leading-4
                                text-amber-700
                                dark:border-amber-900/30
                                dark:bg-amber-950/20
                                dark:text-amber-400
                            "
            >
              This permission is currently assigned to{" "}
              <strong>{roleCount}</strong> {roleCount === 1 ? "role" : "roles"}.
              <br />
              Remove it from those roles before deleting it.
            </div>
          ) : (
            <div
              className="
                                mt-4
                                rounded-xl
                                border
                                border-red-100
                                bg-red-50
                                px-3
                                py-3
                                text-[11px]
                                text-red-600
                                dark:border-red-900/30
                                dark:bg-red-950/20
                                dark:text-red-400
                            "
            >
              This action cannot be undone.
            </div>
          )}
        </div>

        <div
          className="
                        flex
                        flex-col-reverse
                        gap-2
                        border-t
                        border-slate-200
                        px-5
                        py-4
                        dark:border-zinc-800
                        sm:flex-row
                        sm:justify-end
                    "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="
                            btn-secondary
                            w-full
                            text-xs
                            sm:w-auto
                        "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={confirmDelete}
            disabled={deleting || roleCount > 0}
            className="
                            inline-flex
                            h-9
                            w-full
                            items-center
                            justify-center
                            rounded-lg
                            bg-red-600
                            px-4
                            text-xs
                            font-semibold
                            text-white
                            transition
                            hover:bg-red-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:w-auto
                        "
          >
            {deleting ? "Deleting..." : "Delete Permission"}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ================================================================
   EMPTY
================================================================ */

function PermissionEmpty({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div
      className="
                flex
                min-h-[320px]
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
        <HiOutlineShieldCheck className="h-6 w-6" />
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
        No permissions yet
      </h3>

      <p
        className="
                    mt-1
                    max-w-sm
                    text-xs
                    leading-5
                    text-slate-400
                    dark:text-zinc-600
                "
      >
        Create your first permission to start defining access capabilities.
      </p>

      {canCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="
                        mt-5
                        inline-flex
                        h-9
                        items-center
                        gap-2
                        rounded-lg
                        bg-indigo-600
                        px-4
                        text-xs
                        font-semibold
                        text-white
                        hover:bg-indigo-700
                    "
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add Permission
        </button>
      )}
    </div>
  );
}

/* ================================================================
   ERROR
================================================================ */

function PermissionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="
                flex
                min-h-[300px]
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
        <HiOutlineShieldCheck className="h-6 w-6" />
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
        Unable to load permissions
      </h3>

      <p
        className="
                    mt-1
                    max-w-sm
                    text-xs
                    leading-5
                    text-slate-500
                    dark:text-zinc-500
                "
      >
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="
                    mt-5
                    inline-flex
                    h-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-xs
                    font-semibold
                    text-slate-600
                    shadow-sm
                    hover:bg-slate-50
                    dark:border-zinc-800
                    dark:bg-zinc-900
                    dark:text-zinc-400
                "
      >
        Try again
      </button>
    </div>
  );
}

/* ================================================================
   SKELETON
================================================================ */

function PermissionSkeleton() {
  return (
    <div
      className="
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-3
            "
    >
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="
                        min-h-[218px]
                        animate-pulse
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-5
                        dark:border-zinc-800
                        dark:bg-zinc-950
                    "
        >
          <div
            className="
                            flex
                            justify-between
                        "
          >
            <div className="space-y-2">
              <div
                className="
                                    h-4
                                    w-28
                                    rounded
                                    bg-slate-200
                                    dark:bg-zinc-800
                                "
              />

              <div
                className="
                                    h-5
                                    w-24
                                    rounded-md
                                    bg-slate-200
                                    dark:bg-zinc-800
                                "
              />
            </div>

            <div
              className="
                                h-8
                                w-10
                                rounded-lg
                                bg-slate-200
                                dark:bg-zinc-800
                            "
            />
          </div>

          <div
            className="
                            mt-6
                            space-y-2
                        "
          >
            <div
              className="
                                h-2.5
                                w-full
                                rounded
                                bg-slate-100
                                dark:bg-zinc-900
                            "
            />

            <div
              className="
                                h-2.5
                                w-4/5
                                rounded
                                bg-slate-100
                                dark:bg-zinc-900
                            "
            />
          </div>

          <div
            className="
                            mt-6
                            h-5
                            w-28
                            rounded
                            bg-slate-200
                            dark:bg-zinc-800
                        "
          />
        </div>
      ))}
    </div>
  );
}
