import {
    HiOutlinePencilSquare,
    HiOutlineShieldCheck,
    HiOutlineTrash,
    HiOutlinePlus,
} from "react-icons/hi2";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    type Role,
    type Permission,
} from "../../services/role";

import { useAuth } from "../../context/AuthContext";

export default function Roles() {
    const { hasPermission } = useAuth();

    const [deleteTarget, setDeleteTarget] =
        useState<Role | null>(null);

    const [createOpen, setCreateOpen] =
        useState(false);

    const [editRole, setEditRole] =
        useState<Role | null>(null);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            const response = await getRoles();
            return response.data;
        },
    });

    const {
        data: permissionData,
        isLoading: permissionsLoading,
    } = useQuery({
        queryKey: ["permissions"],
        queryFn: async () => {
            const response = await getPermissions();
            return response.data;
        },
    });

    const permissions = permissionData ?? [];

    const roles = data ?? [];



    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            deleteRole(id),

        onSuccess: (response) => {
            toast.success(response.message);

            setDeleteTarget(null);

            refetch();
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ??
                "Unable to delete role."
            );
        },
    });

    const createMutation = useMutation({
        mutationFn: createRole,

        onSuccess: (response) => {
            toast.success(response.message);

            setCreateOpen(false);

            refetch();
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ??
                "Unable to create role."
            );
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: {
                name: string;
                description?: string;
                permissionIds: string[];
            };
        }) => updateRole(id, payload),

        onSuccess: (response) => {
            toast.success(response.message);

            setEditRole(null);

            refetch();
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ??
                "Unable to update role."
            );
        },
    });

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
                            Roles
                        </h1>

                        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                            Manage roles and their permissions.
                        </p>
                    </div>

                </div>

                {hasPermission("ROLE_CREATE") && (
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="btn-primary gap-2 text-xs font-semibold"
                    >
                        <HiOutlinePlus size={15} />
                        Add Role
                    </button>
                )}

            </div>

            {/* Content */}

            <div className="mt-6">

                {isLoading ? (
                    <RolesSkeleton />
                ) : isError ? (
                    <RolesError
                        error={error}
                        onRetry={() => refetch()}
                    />
                ) : roles.length === 0 ? (
                    <EmptyRoles />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                        {roles.map((role) => (
                            <RoleCard
                                key={role.id}
                                role={role}
                                canUpdate={hasPermission("ROLE_UPDATE")}
                                canDelete={hasPermission("ROLE_DELETE")}
                                onEdit={setEditRole}
                                onDelete={setDeleteTarget}
                            />
                        ))}

                    </div>
                )}

            </div>

            {/* Delete modal */}

            {deleteTarget && (
                <DeleteRoleModal
                    role={deleteTarget}
                    loading={deleteMutation.isPending}
                    onClose={() =>
                        setDeleteTarget(null)
                    }
                    onConfirm={() =>
                        deleteMutation.mutate(
                            deleteTarget.id
                        )
                    }
                />
            )}
            {createOpen && (
                <CreateRoleModal
                    permissions={permissions}
                    permissionsLoading={permissionsLoading}
                    loading={createMutation.isPending}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={(payload) =>
                        createMutation.mutate(payload)
                    }
                />
            )}

            {editRole && (
                <EditRoleModal
                    role={editRole}
                    permissions={permissions}
                    permissionsLoading={permissionsLoading}
                    loading={updateMutation.isPending}
                    onClose={() => setEditRole(null)}
                    onSubmit={(payload) =>
                        updateMutation.mutate({
                            id: editRole.id,
                            payload,
                        })
                    }
                />
            )}
        </div>
    );
}

function CreateRoleModal({
    permissions,
    permissionsLoading,
    loading,
    onClose,
    onSubmit,
}: {
    permissions: Permission[];
    permissionsLoading: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        name: string;
        description?: string;
        permissionIds: string[];
    }) => void;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] =
        useState<string[]>([]);

    function togglePermission(id: string) {
        setSelectedPermissions((current) =>
            current.includes(id)
                ? current.filter(
                    (permissionId) =>
                        permissionId !== id
                )
                : [...current, id]
        );
    }

    function handleSubmit() {
        if (!name.trim()) {
            toast.warning("Role name is required.");
            return;
        }

        onSubmit({
            name: name.trim(),
            description:
                description.trim() || undefined,
            permissionIds: selectedPermissions,
        });
    }

    function selectAll() {
        setSelectedPermissions(
            permissions.map(
                (permission) => permission.id
            )
        );
    }

    function clearAll() {
        setSelectedPermissions([]);
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                {/* Header */}

                <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">

                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Create Role
                        </h2>

                        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                            Create a role and assign its permissions.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                    >
                        Close
                    </button>

                </div>

                {/* Body */}

                <div className="overflow-y-auto p-5">

                    <div className="grid gap-5">

                        {/* Role name */}

                        <div>
                            <label className="label">
                                Role Name
                            </label>

                            <input
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="e.g. TEAM_LEAD"
                                className="input"
                            />
                        </div>

                        {/* Description */}

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
                                placeholder="Describe what this role can do..."
                                rows={3}
                                className="input resize-none"
                            />
                        </div>

                        {/* Permissions */}

                        <div>

                            <div className="mb-3 flex items-center justify-between">

                                <div>
                                    <label className="label mb-0">
                                        Permissions
                                    </label>

                                    <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-600">
                                        {selectedPermissions.length}{" "}
                                        of{" "}
                                        {permissions.length}{" "}
                                        selected
                                    </p>
                                </div>

                                <div className="flex gap-2">

                                    <button
                                        type="button"
                                        onClick={selectAll}
                                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        Select all
                                    </button>

                                    <span className="text-slate-300 dark:text-zinc-700">
                                        /
                                    </span>

                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300"
                                    >
                                        Clear
                                    </button>

                                </div>

                            </div>

                            {permissionsLoading ? (
                                <div className="rounded-xl border border-slate-200 p-5 text-center text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
                                    Loading permissions...
                                </div>
                            ) : (
                                <div className="grid gap-2 sm:grid-cols-2">

                                    {permissions.map(
                                        (permission) => {
                                            const selected =
                                                selectedPermissions.includes(
                                                    permission.id
                                                );

                                            return (
                                                <button
                                                    type="button"
                                                    key={permission.id}
                                                    onClick={() =>
                                                        togglePermission(
                                                            permission.id
                                                        )
                                                    }
                                                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${selected
                                                        ? "border-blue-200 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/20"
                                                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900"
                                                        }`}
                                                >
                                                    <span
                                                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px] font-bold ${selected
                                                            ? "border-blue-600 bg-blue-600 text-white"
                                                            : "border-slate-300 dark:border-zinc-700"
                                                            }`}
                                                    >
                                                        {selected
                                                            ? "✓"
                                                            : ""}
                                                    </span>

                                                    <span className="min-w-0">

                                                        <span className="block text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                                                            {
                                                                permission.code
                                                            }
                                                        </span>

                                                        <span className="mt-0.5 block text-[10px] text-slate-400 dark:text-zinc-500">
                                                            {
                                                                permission.name
                                                            }
                                                        </span>

                                                    </span>

                                                </button>
                                            );
                                        }
                                    )}

                                </div>
                            )}

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-zinc-800">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="btn-secondary text-xs"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary text-xs"
                    >
                        {loading
                            ? "Creating..."
                            : "Create Role"}
                    </button>

                </div>

            </div>
        </div>
    );
}

function EditRoleModal({
    role,
    permissions,
    permissionsLoading,
    loading,
    onClose,
    onSubmit,
}: {
    role: Role;
    permissions: Permission[];
    permissionsLoading: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        name: string;
        description?: string;
        permissionIds: string[];
    }) => void;
}) {
    const [name, setName] =
        useState(role.name);

    const [description, setDescription] =
        useState(role.description ?? "");

    const [selectedPermissions, setSelectedPermissions] =
        useState<string[]>([]);

    useEffect(() => {
        if (
            !permissions.length ||
            !role.permissions.length
        ) {
            return;
        }

        const rolePermissionCodes =
            new Set(
                role.permissions.map(
                    (permission) => permission.code
                )
            );

        const selectedIds =
            permissions
                .filter((permission) =>
                    rolePermissionCodes.has(
                        permission.code
                    )
                )
                .map(
                    (permission) =>
                        permission.id
                );

        setSelectedPermissions(selectedIds);
    }, [role, permissions]);

    function togglePermission(id: string) {
        setSelectedPermissions((current) =>
            current.includes(id)
                ? current.filter(
                    (permissionId) =>
                        permissionId !== id
                )
                : [...current, id]
        );
    }

    function selectAll() {
        setSelectedPermissions(
            permissions.map(
                (permission) => permission.id
            )
        );
    }

    function clearAll() {
        setSelectedPermissions([]);
    }

    function handleSubmit() {
        if (!name.trim()) {
            toast.warning(
                "Role name is required."
            );
            return;
        }

        onSubmit({
            name: name.trim(),
            description:
                description.trim() || undefined,
            permissionIds: selectedPermissions,
        });
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                {/* Header */}

                <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">

                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Edit Role
                        </h2>

                        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                            Update role details and permissions.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                    >
                        Close
                    </button>

                </div>

                {/* Body */}

                <div className="overflow-y-auto p-5">

                    <div className="grid gap-5">

                        {/* Role name */}

                        <div>
                            <label className="label">
                                Role Name
                            </label>

                            <input
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                className="input"
                            />
                        </div>

                        {/* Description */}

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
                                rows={3}
                                className="input resize-none"
                            />
                        </div>

                        {/* Permissions */}

                        <div>

                            <div className="mb-3 flex items-center justify-between">

                                <div>
                                    <label className="label mb-0">
                                        Permissions
                                    </label>

                                    <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-600">
                                        {selectedPermissions.length}{" "}
                                        of{" "}
                                        {permissions.length}{" "}
                                        selected
                                    </p>
                                </div>

                                <div className="flex gap-2">

                                    <button
                                        type="button"
                                        onClick={selectAll}
                                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        Select all
                                    </button>

                                    <span className="text-slate-300 dark:text-zinc-700">
                                        /
                                    </span>

                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300"
                                    >
                                        Clear
                                    </button>

                                </div>

                            </div>

                            {permissionsLoading ? (
                                <div className="rounded-xl border border-slate-200 p-5 text-center text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
                                    Loading permissions...
                                </div>
                            ) : (
                                <div className="grid gap-2 sm:grid-cols-2">

                                    {permissions.map(
                                        (permission) => {
                                            const selected =
                                                selectedPermissions.includes(
                                                    permission.id
                                                );

                                            return (
                                                <button
                                                    type="button"
                                                    key={permission.id}
                                                    onClick={() =>
                                                        togglePermission(
                                                            permission.id
                                                        )
                                                    }
                                                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${selected
                                                        ? "border-blue-200 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/20"
                                                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900"
                                                        }`}
                                                >
                                                    <span
                                                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px] font-bold ${selected
                                                            ? "border-blue-600 bg-blue-600 text-white"
                                                            : "border-slate-300 dark:border-zinc-700"
                                                            }`}
                                                    >
                                                        {selected
                                                            ? "✓"
                                                            : ""}
                                                    </span>

                                                    <span className="min-w-0">

                                                        <span className="block text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                                                            {
                                                                permission.code
                                                            }
                                                        </span>

                                                        <span className="mt-0.5 block text-[10px] text-slate-400 dark:text-zinc-500">
                                                            {
                                                                permission.name
                                                            }
                                                        </span>

                                                    </span>

                                                </button>
                                            );
                                        }
                                    )}

                                </div>
                            )}

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-zinc-800">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="btn-secondary text-xs"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary text-xs"
                    >
                        {loading
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </div>

            </div>
        </div>
    );
}

function RoleCard({
    role,
    canUpdate,
    canDelete,
    onEdit,
    onDelete,
}: {
    role: Role;
    canUpdate: boolean;
    canDelete: boolean;
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
}) {
    return (
        <div className="card flex flex-col">

            <div className="p-5">

                <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                        <div className="flex items-center gap-2">

                            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                {role.name}
                            </h2>

                            <span className="badge">
                                {role._count?.users ?? 0}{" "}
                                {role._count?.users === 1
                                    ? "user"
                                    : "users"}
                            </span>

                        </div>

                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
                            {role.description ||
                                "No description provided."}
                        </p>

                    </div>

                    <HiOutlineShieldCheck
                        className="shrink-0 text-slate-300 dark:text-zinc-700"
                        size={20}
                    />

                </div>

                <div className="mt-5">

                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Permissions
                    </p>

                    <div className="flex flex-wrap gap-1.5">

                        {role.permissions
                            .slice(0, 5)
                            .map((permission) => (
                                <span
                                    key={permission.id}
                                    className="badge-primary"
                                >
                                    {permission.code}
                                </span>
                            ))}

                        {role.permissions.length > 5 && (
                            <span className="badge">
                                +{role.permissions.length - 5}
                            </span>
                        )}

                        {role.permissions.length === 0 && (
                            <span className="text-[11px] text-slate-400 dark:text-zinc-600">
                                No permissions
                            </span>
                        )}

                    </div>

                </div>

            </div>

            {(canUpdate || canDelete) && (
                <div className="mt-auto flex justify-end gap-2 border-t border-slate-100 px-5 py-3 dark:border-zinc-800/60">

                    {canUpdate && (
                        <button
                            onClick={() => onEdit(role)}
                            className="btn-secondary h-8 px-2.5"
                            title="Edit role"
                        >
                            <HiOutlinePencilSquare size={14} />
                        </button>
                    )}

                    {canDelete && (
                        <button
                            onClick={() => onDelete(role)}
                            className="inline-flex h-8 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-2.5 text-red-500 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                            title="Delete role"
                        >
                            <HiOutlineTrash size={14} />
                        </button>
                    )}

                </div>
            )}

        </div>
    );
}

function DeleteRoleModal({
    role,
    loading,
    onClose,
    onConfirm,
}: {
    role: Role;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                <div className="p-5">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
                            <HiOutlineTrash size={18} />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Delete role?
                            </h2>

                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                                    {role.name}
                                </span>
                                ?
                            </p>

                            {role._count?.users &&
                                role._count.users > 0 && (
                                    <p className="mt-2 text-[11px] font-medium text-red-500">
                                        This role is currently
                                        assigned to{" "}
                                        {role._count.users}{" "}
                                        {role._count.users === 1
                                            ? "user"
                                            : "users"}.
                                    </p>
                                )}
                        </div>

                    </div>

                </div>

                <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-zinc-800">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="btn-secondary text-xs"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Deleting..."
                            : "Delete Role"}
                    </button>

                </div>

            </div>
        </div>
    );
}

function RolesSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="card animate-pulse p-5"
                >
                    <div className="h-4 w-32 rounded bg-slate-200 dark:bg-zinc-800" />

                    <div className="mt-3 h-3 w-48 rounded bg-slate-100 dark:bg-zinc-900" />

                    <div className="mt-6 flex gap-2">
                        <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-zinc-800" />
                        <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-zinc-800" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyRoles() {
    return (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-500">
                <HiOutlineShieldCheck size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                No roles found
            </h3>

            <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                Create a role to get started.
            </p>

        </div>
    );
}

function RolesError({
    error,
    onRetry,
}: {
    error: unknown;
    onRetry: () => void;
}) {
    const axiosError = error as any;

    const status =
        axiosError?.response?.status;

    const message =
        axiosError?.response?.data?.message;

    return (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
                <HiOutlineShieldCheck size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                {status === 403
                    ? "Access denied"
                    : "Unable to load roles"}
            </h3>

            <p className="mt-1 max-w-sm text-xs text-slate-400 dark:text-zinc-500">
                {status === 403
                    ? "You don't have permission to view roles."
                    : message ??
                    "Something went wrong while loading roles."}
            </p>

            {status !== 403 && (
                <button
                    onClick={onRetry}
                    className="btn-secondary mt-5 text-xs"
                >
                    Try again
                </button>
            )}

        </div>
    );
}