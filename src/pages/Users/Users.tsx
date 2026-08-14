import {
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineUserPlus,
    HiOutlineUsers,
} from "react-icons/hi2";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getRoles, type Role } from "../../services/role";
import {
    createUser,
    updateUser,
    type CreateUserPayload,
} from "../../services/user";
import { toast } from "sonner";

import {
    getUsers,
    deleteUser,
    type ManagedUser,
} from "../../services/user";

import { useAuth } from "../../context/AuthContext";

export default function Users() {
    const {
        hasPermission,
    } = useAuth();

    const [createOpen, setCreateOpen] = useState(false);

    const [editUser, setEditUser] =
        useState<ManagedUser | null>(null);

    const [deleteUserTarget, setDeleteUserTarget] =
        useState<ManagedUser | null>(null);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await getUsers();
            return response.data;
        },
    });

    const { data: roles = [] } = useQuery<Role[]>({
        queryKey: ["roles"],
        queryFn: async () => {
            const response = await getRoles();
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateUserPayload) =>
            createUser(payload),

        onSuccess: (response) => {
            toast.success(response.message);

            setCreateOpen(false);

            refetch();
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ??
                "Unable to create user."
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
                email: string;
                roleId: string;
            };
        }) => updateUser(id, payload),

        onSuccess: (response) => {
            toast.success(response.message);

            setEditUser(null);

            refetch();
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ??
                "Unable to update user."
            );
        },
    });

    const users = data ?? [];

    function handleDelete(user: ManagedUser) {
        setDeleteUserTarget(user);
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 sm:py-4">

            {/* Header */}

            <div className="flex flex-col gap-4 border-b border-slate-200/50 pb-5 dark:border-zinc-800/50 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-300">
                            <HiOutlineUsers size={18} />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                                Users
                            </h1>

                            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                                Manage team members and their roles.
                            </p>
                        </div>
                    </div>
                </div>

                {hasPermission("USER_CREATE") && (
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="btn-primary w-full justify-center gap-2 text-xs font-semibold sm:w-auto"
                    >
                        <HiOutlineUserPlus size={15} />
                        Add User
                    </button>
                )}

            </div>

            {/* Content */}

            <div className="mt-6">

                {isLoading ? (
                    <UsersSkeleton />
                ) : isError ? (
                    <UsersError
                        error={error}
                        onRetry={() => refetch()}
                    />
                ) : users.length === 0 ? (
                    <EmptyUsers />
                ) : (
                    <>
                        {/* Desktop / tablet table */}
                        <div className="card hidden overflow-hidden sm:block">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[640px]">

                                    <thead>
                                        <tr className="border-b border-slate-200/70 dark:border-zinc-800/70">
                                            <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                                User
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                                Email
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                                Role
                                            </th>

                                            <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {users.map((user) => (
                                            <UserRow
                                                key={user.id}
                                                user={user}
                                                canUpdate={hasPermission("USER_UPDATE")}
                                                canDelete={hasPermission("USER_DELETE")}
                                                onEdit={setEditUser}
                                                onDelete={handleDelete}
                                            />
                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                        {/* Mobile card list */}
                        <div className="flex flex-col gap-3 sm:hidden">
                            {users.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    canUpdate={hasPermission("USER_UPDATE")}
                                    canDelete={hasPermission("USER_DELETE")}
                                    onEdit={setEditUser}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </>
                )}

            </div>
            {createOpen && (
                <CreateUserModal
                    roles={roles}
                    loading={createMutation.isPending}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={(payload) =>
                        createMutation.mutate(payload)
                    }
                />
            )}

            {editUser && (
                <EditUserModal
                    user={editUser}
                    roles={roles}
                    loading={updateMutation.isPending}
                    onClose={() => setEditUser(null)}
                    onSubmit={(payload) =>
                        updateMutation.mutate({
                            id: editUser.id,
                            payload,
                        })
                    }
                />
            )}

            {deleteUserTarget && (
                <DeleteUserModal
                    user={deleteUserTarget}
                    onClose={() => setDeleteUserTarget(null)}
                    onConfirm={async () => {
                        try {
                            await deleteUser(deleteUserTarget.id);

                            toast.success(
                                "User deleted successfully."
                            );

                            setDeleteUserTarget(null);

                            refetch();
                        } catch (error: any) {
                            toast.error(
                                error?.response?.data?.message ??
                                "Unable to delete user."
                            );
                        }
                    }}
                />
            )}
        </div>
    );
}

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function UserRow({
    user,
    canUpdate,
    canDelete,
    onEdit,
    onDelete,
}: {
    user: ManagedUser;
    canUpdate: boolean;
    canDelete: boolean;
    onEdit: (user: ManagedUser) => void;
    onDelete: (user: ManagedUser) => void;
}) {
    const initials = getInitials(user.name);

    return (
        <tr className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60 dark:border-zinc-800/60 dark:hover:bg-zinc-900/40">

            <td className="px-5 py-4">
                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                        {initials}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800 dark:text-zinc-200">
                            {user.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                            Joined{" "}
                            {new Date(
                                user.createdAt
                            ).toLocaleDateString("en-IN")}
                        </p>
                    </div>

                </div>
            </td>

            <td className="px-5 py-4">
                <span className="text-xs text-slate-600 dark:text-zinc-400">
                    {user.email}
                </span>
            </td>

            <td className="px-5 py-4">
                <span className="badge-primary">
                    {user.role.name}
                </span>
            </td>

            <td className="px-5 py-4">

                <div className="flex justify-end gap-2">

                    {canUpdate && (
                        <button
                            onClick={() => onEdit(user)}
                            className="btn-secondary h-8 px-2.5"
                            title="Edit user"
                        >
                            <HiOutlinePencilSquare size={14} />
                        </button>
                    )}

                    {canDelete && (
                        <button
                            onClick={() => onDelete(user)}
                            className="inline-flex h-8 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-2.5 text-red-500 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                            title="Delete user"
                        >
                            <HiOutlineTrash size={14} />
                        </button>
                    )}

                </div>

            </td>

        </tr>
    );
}

function UserCard({
    user,
    canUpdate,
    canDelete,
    onEdit,
    onDelete,
}: {
    user: ManagedUser;
    canUpdate: boolean;
    canDelete: boolean;
    onEdit: (user: ManagedUser) => void;
    onDelete: (user: ManagedUser) => void;
}) {
    const initials = getInitials(user.name);

    return (
        <div className="card flex flex-col gap-3 p-4">

            <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                    {initials}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {user.name}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-zinc-400">
                        {user.email}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                        Joined{" "}
                        {new Date(
                            user.createdAt
                        ).toLocaleDateString("en-IN")}
                    </p>
                </div>

                <span className="badge-primary shrink-0">
                    {user.role.name}
                </span>

            </div>

            {(canUpdate || canDelete) && (
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-zinc-800">

                    {canUpdate && (
                        <button
                            onClick={() => onEdit(user)}
                            className="btn-secondary h-8 flex-1 gap-1.5 text-[11px]"
                        >
                            <HiOutlinePencilSquare size={13} />
                            Edit
                        </button>
                    )}

                    {canDelete && (
                        <button
                            onClick={() => onDelete(user)}
                            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                            <HiOutlineTrash size={13} />
                            Delete
                        </button>
                    )}

                </div>
            )}

        </div>
    );
}

function EmptyUsers() {
    return (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-500">
                <HiOutlineUsers size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                No users found
            </h3>

            <p className="mt-1 max-w-xs text-xs text-slate-400 dark:text-zinc-500">
                There are no team members to display.
            </p>

        </div>
    );
}

function UsersSkeleton() {
    return (
        <div className="space-y-3 sm:space-y-0">

            {/* Desktop skeleton */}
            <div className="card hidden overflow-hidden sm:block">
                <div className="space-y-0">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex animate-pulse items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-zinc-800"
                        >
                            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-zinc-800" />

                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-32 rounded bg-slate-200 dark:bg-zinc-800" />
                                <div className="h-2.5 w-48 rounded bg-slate-100 dark:bg-zinc-900" />
                            </div>

                            <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-zinc-800" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile skeleton */}
            <div className="flex flex-col gap-3 sm:hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="card flex animate-pulse items-center gap-3 p-4"
                    >
                        <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200 dark:bg-zinc-800" />

                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-28 rounded bg-slate-200 dark:bg-zinc-800" />
                            <div className="h-2.5 w-36 rounded bg-slate-100 dark:bg-zinc-900" />
                        </div>

                        <div className="h-6 w-16 shrink-0 rounded-full bg-slate-200 dark:bg-zinc-800" />
                    </div>
                ))}
            </div>

        </div>
    );
}

function CreateUserModal({
    roles,
    loading,
    onClose,
    onSubmit,
}: {
    roles: Role[];
    loading: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateUserPayload) => void;
}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("");

    function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        if (!name.trim()) {
            toast.warning("Enter user name.");
            return;
        }

        if (!email.trim()) {
            toast.warning("Enter email address.");
            return;
        }

        if (!password) {
            toast.warning("Enter password.");
            return;
        }

        if (password.length < 6) {
            toast.warning(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (!roleId) {
            toast.warning("Select a role.");
            return;
        }

        onSubmit({
            name: name.trim(),
            email: email.trim(),
            password,
            roleId,
        });
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                <div className="border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Add User
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                        Create a new team member account.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 p-5"
                >

                    <div>
                        <label className="label">
                            Name
                        </label>

                        <input
                            className="input"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Enter name"
                        />
                    </div>

                    <div>
                        <label className="label">
                            Email
                        </label>

                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="you@company.com"
                        />
                    </div>

                    <div>
                        <label className="label">
                            Password
                        </label>

                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter password"
                        />
                    </div>

                    <div>
                        <label className="label">
                            Role
                        </label>

                        <select
                            className="input"
                            value={roleId}
                            onChange={(e) =>
                                setRoleId(e.target.value)
                            }
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

                    <div className="flex flex-col-reverse justify-end gap-2 pt-3 sm:flex-row">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="btn-secondary text-xs"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary text-xs"
                        >
                            {loading
                                ? "Creating..."
                                : "Create User"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

function UsersError({
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
                <HiOutlineUsers size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                {status === 403
                    ? "Access denied"
                    : "Unable to load users"}
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400 dark:text-zinc-500">
                {status === 403
                    ? "You don't have permission to view team members."
                    : message ??
                    "Something went wrong while loading users."}
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

function EditUserModal({
    user,
    roles,
    loading,
    onClose,
    onSubmit,
}: {
    user: ManagedUser;
    roles: Role[];
    loading: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        name: string;
        email: string;
        roleId: string;
    }) => void;
}) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [roleId, setRoleId] = useState(user.roleId);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!name.trim()) {
            toast.warning("Enter user name.");
            return;
        }

        if (!email.trim()) {
            toast.warning("Enter email address.");
            return;
        }

        if (!roleId) {
            toast.warning("Select a role.");
            return;
        }

        onSubmit({
            name: name.trim(),
            email: email.trim(),
            roleId,
        });
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                <div className="border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Edit User
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                        Update account details and role.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 p-5"
                >
                    <div>
                        <label className="label">
                            Name
                        </label>

                        <input
                            className="input"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className="label">
                            Email
                        </label>

                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className="label">
                            Role
                        </label>

                        <select
                            className="input"
                            value={roleId}
                            onChange={(e) =>
                                setRoleId(e.target.value)
                            }
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

                    <div className="flex flex-col-reverse justify-end gap-2 pt-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="btn-secondary text-xs"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary text-xs"
                        >
                            {loading
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteUserModal({
    user,
    onClose,
    onConfirm,
}: {
    user: ManagedUser;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [loading, setLoading] = useState(false);

    async function handleConfirm() {
        if (loading) return;

        setLoading(true);

        try {
            await onConfirm();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                {/* Header */}

                <div className="p-5">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
                            <HiOutlineTrash size={18} />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Delete user?
                            </h2>

                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                                    {user.name}
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </div>

                    </div>

                </div>

                {/* Actions */}

                <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-zinc-800 sm:flex-row">

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
                        onClick={handleConfirm}
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Deleting..."
                            : "Delete User"}
                    </button>

                </div>

            </div>
        </div>
    );
}