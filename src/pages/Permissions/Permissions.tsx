import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  HiOutlineShieldCheck,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  type Permission,
} from "../../services/permission";

import { useAuth } from "../../context/AuthContext";
import PageTitle from "../../components/PageTitle";

/* ================================================================
   TYPES & HELPERS
================================================================ */

type Filter = "all" | "assigned" | "unused";

type PermissionGroup = {
  key: string;
  items: Permission[];
};

function getGroupKey(code: string): string {
  const index = code.indexOf("_");
  if (index <= 0) return "GENERAL";
  return code.slice(0, index).toUpperCase();
}

function formatGroupLabel(key: string): string {
  return key.charAt(0) + key.slice(1).toLowerCase();
}

/* ================================================================
   MAIN PAGE
================================================================ */

export default function Permissions() {
  const { hasPermission } = useAuth();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);

  /* ---------------------------- LOAD ---------------------------- */

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

  /* --------------------------- MODALS --------------------------- */

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

  /* ---------------------------- SAVE ---------------------------- */

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

  /* --------------------------- DELETE --------------------------- */

  async function handleDelete() {
    if (!deleteTarget) return;

    await deletePermission(deleteTarget.id);
    setDeleteTarget(null);
    await loadPermissions();
  }

  /* ---------------------------- STATS --------------------------- */

  const total = permissions.length;
  const assigned = permissions.filter((p) => (p._count?.roles ?? 0) > 0).length;
  const unused = total - assigned;

  /* ------------------- FILTER + GROUP (derived) ------------------ */

  const groups = useMemo<PermissionGroup[]>(() => {
    const query = search.trim().toLowerCase();

    const filtered = permissions.filter((permission) => {
      const roleCount = permission._count?.roles ?? 0;

      if (filter === "assigned" && roleCount === 0) return false;
      if (filter === "unused" && roleCount > 0) return false;

      if (!query) return true;

      return (
        permission.name.toLowerCase().includes(query) ||
        permission.code.toLowerCase().includes(query) ||
        (permission.description ?? "").toLowerCase().includes(query)
      );
    });

    const map = new Map<string, Permission[]>();

    for (const permission of filtered) {
      const key = getGroupKey(permission.code);
      const list = map.get(key);
      if (list) list.push(permission);
      else map.set(key, [permission]);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => ({
        key,
        items: [...items].sort((a, b) => a.code.localeCompare(b.code)),
      }));
  }, [permissions, search, filter]);

  const canCreate = hasPermission("PERMISSION_CREATE");
  const canUpdate = hasPermission("PERMISSION_UPDATE");
  const canDelete = hasPermission("PERMISSION_DELETE");

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: total },
    { key: "assigned", label: "In use", count: assigned },
    { key: "unused", label: "Unused", count: unused },
  ];

  /* --------------------------- RENDER --------------------------- */

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageTitle title="Permissions" />

      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Permissions
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {loading || error ? (
              "Control what users and roles can access."
            ) : (
              <>
                {total} {total === 1 ? "permission" : "permissions"}
                <span className="mx-1.5 text-slate-300 dark:text-zinc-700">
                  ·
                </span>
                {assigned} in use
                <span className="mx-1.5 text-slate-300 dark:text-zinc-700">
                  ·
                </span>
                {unused} unused
              </>
            )}
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-[13px] font-medium text-white transition hover:bg-slate-700 active:scale-[0.98] sm:w-auto dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add permission
          </button>
        )}
      </header>

      {/* TOOLBAR */}
      {!loading && !error && total > 0 && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or code"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
            />
          </div>

          <div
            role="tablist"
            className="inline-flex w-full rounded-lg bg-slate-100 p-0.5 sm:w-auto dark:bg-zinc-900"
          >
            {filters.map((item) => {
              const active = filter === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(item.key)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition sm:flex-none ${
                    active
                      ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200"
                  }`}
                >
                  {item.label}
                  <span className="ml-1.5 text-slate-400 dark:text-zinc-500">
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="mt-6">
        {loading ? (
          <PermissionSkeleton />
        ) : error ? (
          <PermissionError message={error} onRetry={loadPermissions} />
        ) : total === 0 ? (
          <PermissionEmpty canCreate={canCreate} onCreate={openCreate} />
        ) : groups.length === 0 ? (
          <NoResults
            onClear={() => {
              setSearch("");
              setFilter("all");
            }}
          />
        ) : (
          <div className="space-y-7">
            {groups.map((group) => (
              <section key={group.key}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {formatGroupLabel(group.key)}
                  </h2>
                  <span className="text-xs text-slate-400 dark:text-zinc-600">
                    {group.items.length}
                  </span>
                </div>

                <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:divide-zinc-800/80 dark:border-zinc-800 dark:bg-zinc-950">
                  {group.items.map((permission) => (
                    <PermissionRow
                      key={permission.id}
                      permission={permission}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <PermissionModal
          permission={editingPermission}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

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
   ROW
================================================================ */

function PermissionRow({
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
  const inUse = roleCount > 0;

  return (
    <li className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/80 sm:gap-4 sm:px-5 dark:hover:bg-zinc-900/40">
      {/* status dot */}
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${
          inUse ? "bg-emerald-500" : "bg-slate-300 dark:bg-zinc-700"
        }`}
      />

      {/* text */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <h3 className="text-[13.5px] font-medium text-slate-900 dark:text-zinc-100">
            {permission.name}
          </h3>

          <code className="truncate font-mono text-[11px] text-slate-400 dark:text-zinc-500">
            {permission.code}
          </code>
        </div>

        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-500">
          {permission.description || "No description"}
        </p>
      </div>

      {/* usage */}
      <span
        className={`hidden shrink-0 text-xs sm:inline ${
          inUse
            ? "text-slate-600 dark:text-zinc-300"
            : "text-slate-400 dark:text-zinc-600"
        }`}
      >
        {inUse
          ? `${roleCount} ${roleCount === 1 ? "role" : "roles"}`
          : "Unused"}
      </span>

      {/* actions */}
      {(canUpdate || canDelete) && (
        <div className="flex shrink-0 items-center gap-0.5 transition-opacity sm:opacity-0 sm:focus-within:opacity-100 sm:group-hover:opacity-100">
          {canUpdate && (
            <button
              type="button"
              onClick={() => onEdit(permission)}
              title="Edit permission"
              aria-label={`Edit ${permission.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <HiOutlinePencilSquare className="h-4 w-4" />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(permission)}
              title="Delete permission"
              aria-label={`Delete ${permission.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </li>
  );
}

/* ================================================================
   MODAL BACKDROP
================================================================ */

function ModalBackdrop({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
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
      {children}
    </div>
  );
}

/* ================================================================
   CREATE / EDIT MODAL
================================================================ */

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:hover:border-zinc-700 dark:focus:border-zinc-600 dark:focus:ring-zinc-800";

const labelClass =
  "mb-1.5 block text-xs font-medium text-slate-600 dark:text-zinc-400";

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
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl sm:max-w-md sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* header */}
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-1 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {permission ? "Edit permission" : "New permission"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500">
              {permission
                ? "Update the details of this permission."
                : "Create a permission that can be assigned to roles."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          >
            <HiOutlineXMark className="h-[18px] w-[18px]" />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
            <div>
              <label htmlFor="permission-code" className={labelClass}>
                Code
              </label>

              <input
                id="permission-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="REPORT_EXPORT"
                disabled={saving}
                autoFocus
                className={`${inputClass} font-mono text-[12px] uppercase tracking-wide placeholder:font-sans placeholder:normal-case placeholder:tracking-normal`}
              />

              <p className="mt-1.5 text-[11px] text-slate-400 dark:text-zinc-600">
                Letters, numbers and underscores. The part before the first
                underscore is used to group permissions.
              </p>
            </div>

            <div>
              <label htmlFor="permission-name" className={labelClass}>
                Name
              </label>

              <input
                id="permission-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Export reports"
                disabled={saving}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="permission-description" className={labelClass}>
                Description
                <span className="ml-1.5 font-normal text-slate-400 dark:text-zinc-600">
                  Optional
                </span>
              </label>

              <textarea
                id="permission-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Allow users to export reports."
                rows={3}
                disabled={saving}
                className={`${inputClass} h-auto resize-none py-2.5 leading-5`}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <HiOutlineExclamationTriangle className="mt-px h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 px-5 pb-5 pt-2 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-9 w-full rounded-lg px-4 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 sm:w-auto dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-slate-900 px-4 text-[13px] font-medium text-white transition hover:bg-slate-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {saving
                ? "Saving..."
                : permission
                  ? "Save changes"
                  : "Create permission"}
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
  const [error, setError] = useState("");

  const roleCount = permission._count?.roles ?? 0;

  async function confirmDelete() {
    try {
      setDeleting(true);
      setError("");

      await onConfirm();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to delete permission.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="w-full rounded-t-2xl border border-slate-200/80 bg-white p-5 shadow-2xl sm:max-w-sm sm:rounded-2xl sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
          <HiOutlineTrash className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
          Delete permission?
        </h2>

        <p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-zinc-400">
          <span className="font-medium text-slate-700 dark:text-zinc-200">
            {permission.name}
          </span>{" "}
          will be removed.{" "}
          {roleCount > 0
            ? `It is assigned to ${roleCount} ${
                roleCount === 1 ? "role" : "roles"
              }. Remove it from those roles first.`
            : "This action cannot be undone."}
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="h-9 w-full rounded-lg px-4 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 sm:w-auto dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={confirmDelete}
            disabled={deleting || roleCount > 0}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-red-600 px-4 text-[13px] font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ================================================================
   EMPTY / NO RESULTS / ERROR
================================================================ */

function PermissionEmpty({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-6 py-16 text-center dark:border-zinc-800">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-600">
        <HiOutlineShieldCheck className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
        No permissions yet
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-zinc-500">
        Create your first permission to start defining access capabilities.
      </p>

      {canCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-[13px] font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add permission
        </button>
      )}
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <HiOutlineMagnifyingGlass className="h-6 w-6 text-slate-300 dark:text-zinc-700" />

      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
        No matching permissions
      </h3>

      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
        Try a different search or filter.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-4 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Clear filters
      </button>
    </div>
  );
}

function PermissionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200/70 bg-red-50/40 px-6 py-14 text-center dark:border-red-500/20 dark:bg-red-500/5">
      <HiOutlineExclamationTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />

      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
        Unable to load permissions
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-zinc-400">
        {message}
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
   SKELETON
================================================================ */

function PermissionSkeleton() {
  return (
    <div className="space-y-7">
      {[4, 3].map((rows, groupIndex) => (
        <div key={groupIndex}>
          <div className="mb-2 h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />

          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:divide-zinc-800/80 dark:border-zinc-800 dark:bg-zinc-950">
            {Array.from({ length: rows }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-4 px-5 py-4"
              >
                <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-zinc-800" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 rounded bg-slate-200 dark:bg-zinc-800" />
                  <div className="h-2.5 w-64 max-w-full rounded bg-slate-100 dark:bg-zinc-900" />
                </div>

                <div className="hidden h-3 w-12 rounded bg-slate-100 sm:block dark:bg-zinc-900" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
