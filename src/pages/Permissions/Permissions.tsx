import {
    useEffect,
    useState,
} from "react";

import {
    HiOutlineShieldCheck,
    HiOutlinePlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
} from "react-icons/hi2";

import {
    getPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    type Permission,
} from "../../services/permission";

import { useAuth } from "../../context/AuthContext";

export default function Permissions() {

    const {
        hasPermission,
    } = useAuth();

    const [permissions, setPermissions] =
        useState<Permission[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [showModal, setShowModal] =
        useState(false);

    const [editingPermission, setEditingPermission] =
        useState<Permission | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<Permission | null>(null);

    async function loadPermissions() {

        try {
            setLoading(true);
            setError(null);

            const response =
                await getPermissions();

            setPermissions(
                response.data
            );

        } catch (err: any) {

            setError(
                err?.response?.data?.message ||
                "Failed to load permissions"
            );

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPermissions();
    }, []);

    function openCreate() {
        setEditingPermission(null);
        setShowModal(true);
    }

    function openEdit(permission: Permission) {
        setEditingPermission(permission);
        setShowModal(true);
    }

    async function handleSave(data: {
        code: string;
        name: string;
        description: string;
    }) {

        if (editingPermission) {

            await updatePermission(
                editingPermission.id,
                data
            );

        } else {

            await createPermission(data);
        }

        setShowModal(false);
        setEditingPermission(null);

        await loadPermissions();
    }

    async function handleDelete() {

        if (!deleteTarget) return;

        try {

            await deletePermission(
                deleteTarget.id
            );

            setDeleteTarget(null);

            await loadPermissions();

        } catch (err: any) {

            alert(
                err?.response?.data?.message ||
                "Unable to delete permission"
            );
        }
    }

    return (
        <div className="mx-auto max-w-6xl py-2 sm:py-4">

            {/* Header */}

            <div className="flex flex-col gap-4 border-b border-slate-200/50 pb-5 dark:border-zinc-800/50 sm:flex-row sm:items-end sm:justify-between">

                <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-300">
                        <HiOutlineShieldCheck size={18} />
                    </div>

                    <div>

                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                            Permissions
                        </h1>

                        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                            Manage system permissions and access capabilities.
                        </p>

                    </div>

                </div>

                {hasPermission("PERMISSION_CREATE") && (
                    <button
                        onClick={openCreate}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        <HiOutlinePlus size={16} />
                        Add Permission
                    </button>
                )}

            </div>

            {/* Content */}

            <div className="mt-6">

                {loading ? (

                    <PermissionSkeleton />

                ) : error ? (

                    <div className="card p-8 text-center">

                        <p className="text-sm text-red-500">
                            {error}
                        </p>

                        <button
                            onClick={loadPermissions}
                            className="btn-secondary mt-4"
                        >
                            Try Again
                        </button>

                    </div>

                ) : permissions.length === 0 ? (

                    <div className="card p-10 text-center">

                        <p className="text-sm text-slate-500 dark:text-zinc-500">
                            No permissions found.
                        </p>

                    </div>

                ) : (

                    <div className="card overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead>
                                    <tr className="border-b border-slate-200/70 dark:border-zinc-800">

                                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-600">
                                            Permission
                                        </th>

                                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-600">
                                            Description
                                        </th>

                                        <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-600">
                                            Roles
                                        </th>

                                        <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-600">
                                            Actions
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {permissions.map(
                                        (permission) => (
                                            <tr
                                                key={permission.id}
                                                className="border-b border-slate-100 last:border-0 dark:border-zinc-800/60"
                                            >

                                                <td className="px-5 py-4">

                                                    <div>

                                                        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                                            {permission.name}
                                                        </p>

                                                        <code className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-zinc-900 dark:text-zinc-500">
                                                            {permission.code}
                                                        </code>

                                                    </div>

                                                </td>

                                                <td className="max-w-sm px-5 py-4">

                                                    <p className="truncate text-xs text-slate-500 dark:text-zinc-500">
                                                        {permission.description ||
                                                            "No description"}
                                                    </p>

                                                </td>

                                                <td className="px-5 py-4 text-center">

                                                    <span className="badge-primary">
                                                        {permission._count?.roles ?? 0}
                                                    </span>

                                                </td>

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        {hasPermission(
                                                            "PERMISSION_UPDATE"
                                                        ) && (
                                                                <button
                                                                    onClick={() =>
                                                                        openEdit(
                                                                            permission
                                                                        )
                                                                    }
                                                                    className="icon-btn"
                                                                    title="Edit permission"
                                                                >
                                                                    <HiOutlinePencilSquare
                                                                        size={16}
                                                                    />
                                                                </button>
                                                            )}

                                                        {hasPermission(
                                                            "PERMISSION_DELETE"
                                                        ) && (
                                                                <button
                                                                    onClick={() =>
                                                                        setDeleteTarget(
                                                                            permission
                                                                        )
                                                                    }
                                                                    className="icon-btn-danger"
                                                                    title="Delete permission"
                                                                >
                                                                    <HiOutlineTrash
                                                                        size={16}
                                                                    />
                                                                </button>
                                                            )}

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </div>

            {showModal && (
                <PermissionModal
                    permission={editingPermission}
                    onClose={() => {
                        setShowModal(false);
                        setEditingPermission(null);
                    }}
                    onSave={handleSave}
                />
            )}

            {deleteTarget && (
                <DeletePermissionModal
                    permission={deleteTarget}
                    onClose={() =>
                        setDeleteTarget(null)
                    }
                    onConfirm={handleDelete}
                />
            )}

        </div>
    );
}

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

    const [code, setCode] =
        useState(permission?.code ?? "");

    const [name, setName] =
        useState(permission?.name ?? "");

    const [description, setDescription] =
        useState(permission?.description ?? "");

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    async function submit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        if (!code.trim()) {
            setError(
                "Permission code is required"
            );
            return;
        }

        if (!name.trim()) {
            setError(
                "Permission name is required"
            );
            return;
        }

        try {

            setSaving(true);
            setError("");

            await onSave({
                code: code.trim().toUpperCase(),
                name: name.trim(),
                description: description.trim(),
            });

        } catch (err: any) {

            setError(
                err?.response?.data?.message ||
                "Failed to save permission"
            );

        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                <div className="border-b border-slate-100 px-5 py-4 dark:border-zinc-800">

                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        {permission
                            ? "Edit Permission"
                            : "Create Permission"}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                        {permission
                            ? "Update permission details."
                            : "Create a new system permission."}
                    </p>

                </div>

                <form
                    onSubmit={submit}
                    className="space-y-4 p-5"
                >

                    <div>

                        <label className="label">
                            Permission Code
                        </label>

                        <input
                            value={code}
                            onChange={(e) =>
                                setCode(
                                    e.target.value
                                )
                            }
                            placeholder="REPORT_EXPORT"
                            className="input"
                            disabled={saving}
                        />

                        <p className="mt-1 text-[10px] text-slate-400">
                            Use uppercase letters, numbers and underscores.
                        </p>

                    </div>

                    <div>

                        <label className="label">
                            Name
                        </label>

                        <input
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            placeholder="Export Reports"
                            className="input"
                            disabled={saving}
                        />

                    </div>

                    <div>

                        <label className="label">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            placeholder="Allow users to export reports"
                            rows={3}
                            className="input resize-none"
                            disabled={saving}
                        />

                    </div>

                    {error && (
                        <p className="text-xs font-medium text-red-500">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">

                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : permission
                                    ? "Update Permission"
                                    : "Create Permission"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

function DeletePermissionModal({
    permission,
    onClose,
    onConfirm,
}: {
    permission: Permission;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {

    const [deleting, setDeleting] =
        useState(false);

    async function confirm() {

        try {

            setDeleting(true);

            await onConfirm();

        } finally {

            setDeleting(false);
        }
    }

    const assignedRoles =
        permission._count?.roles ?? 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">

                    <HiOutlineTrash size={19} />

                </div>

                <h2 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                    Delete Permission?
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-zinc-500">

                    You are about to delete{" "}

                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                        {permission.name}
                    </span>

                    .

                </p>

                {assignedRoles > 0 ? (

                    <div className="mt-4 rounded-xl bg-amber-50 px-3 py-3 text-xs text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">

                        This permission is currently assigned to{" "}
                        <strong>
                            {assignedRoles}
                        </strong>{" "}
                        {assignedRoles === 1
                            ? "role"
                            : "roles"}.

                        <br />

                        It cannot be deleted until it is removed from those roles.

                    </div>

                ) : (

                    <div className="mt-4 rounded-xl bg-red-50 px-3 py-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">

                        This action cannot be undone.

                    </div>

                )}

                <div className="mt-5 flex justify-end gap-2">

                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={deleting}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={confirm}
                        disabled={
                            deleting ||
                            assignedRoles > 0
                        }
                        className="btn-danger"
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete"}
                    </button>

                </div>

            </div>

        </div>
    );
}

function PermissionSkeleton() {
    return (
        <div className="card overflow-hidden">
            <div className="animate-pulse">

                {/* Header skeleton */}
                <div className="flex items-center border-b border-slate-200/70 px-5 py-3 dark:border-zinc-800">
                    <div className="h-2.5 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="ml-auto h-2.5 w-16 rounded bg-slate-200 dark:bg-zinc-800" />
                </div>

                {/* Rows */}
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center border-b border-slate-100 px-5 py-4 last:border-0 dark:border-zinc-800/60"
                    >
                        {/* Permission */}
                        <div className="w-1/4 space-y-2">
                            <div className="h-3 w-28 rounded bg-slate-200 dark:bg-zinc-800" />
                            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                        </div>

                        {/* Description */}
                        <div className="w-1/3">
                            <div className="h-3 w-40 rounded bg-slate-200 dark:bg-zinc-800" />
                        </div>

                        {/* Roles */}
                        <div className="flex w-1/5 justify-center">
                            <div className="h-5 w-8 rounded-full bg-slate-200 dark:bg-zinc-800" />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-1 justify-end gap-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                            <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}