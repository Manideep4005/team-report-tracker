import {
  HiOutlinePencilSquare,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineExclamationTriangle,
  HiOutlineUsers,
  HiOutlineKey,
  HiOutlineChartPie,
  HiOutlineCheck,
} from "react-icons/hi2";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

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
import PageTitle from "../../components/PageTitle";

/* ================================================================
   HELPERS
================================================================ */

type RolePayload = {
  name: string;
  description?: string;
  permissionIds: string[];
};

function getGroupKey(code: string): string {
  const index = code.indexOf("_");
  if (index <= 0) return "GENERAL";
  return code.slice(0, index).toUpperCase();
}

function formatGroupLabel(key: string): string {
  return key.charAt(0) + key.slice(1).toLowerCase();
}

/* Each role gets a stable color theme derived from its name.
   Classes are written out in full so Tailwind can detect them. */

const THEMES = [
  {
    avatar: "bg-gradient-to-br from-indigo-500 to-violet-500",
    soft: "bg-indigo-50/70 dark:bg-indigo-500/[0.07]",
    bar: "bg-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
    ring: "ring-indigo-500/30",
  },
  {
    avatar: "bg-gradient-to-br from-emerald-500 to-teal-500",
    soft: "bg-emerald-50/70 dark:bg-emerald-500/[0.07]",
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/30",
  },
  {
    avatar: "bg-gradient-to-br from-amber-500 to-orange-500",
    soft: "bg-amber-50/70 dark:bg-amber-500/[0.07]",
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/30",
  },
  {
    avatar: "bg-gradient-to-br from-rose-500 to-pink-500",
    soft: "bg-rose-50/70 dark:bg-rose-500/[0.07]",
    bar: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/30",
  },
  {
    avatar: "bg-gradient-to-br from-sky-500 to-blue-500",
    soft: "bg-sky-50/70 dark:bg-sky-500/[0.07]",
    bar: "bg-sky-500",
    text: "text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/30",
  },
  {
    avatar: "bg-gradient-to-br from-fuchsia-500 to-purple-500",
    soft: "bg-fuchsia-50/70 dark:bg-fuchsia-500/[0.07]",
    bar: "bg-fuchsia-500",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    ring: "ring-fuchsia-500/30",
  },
];

function getTheme(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return THEMES[hash % THEMES.length];
}

function roleInitials(name: string): string {
  const parts = name.split(/[\s_-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return letters.join("") || "?";
}

function RoleAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "md" | "lg";
}) {
  const theme = getTheme(name);

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-semibold text-white shadow-sm ${theme.avatar} ${
        size === "lg"
          ? "h-12 w-12 rounded-2xl text-sm"
          : "h-9 w-9 rounded-xl text-xs"
      }`}
    >
      {roleInitials(name)}
    </div>
  );
}

/* ================================================================
   MAIN PAGE
================================================================ */

export default function Roles() {
  const { hasPermission, refreshUser } = useAuth();

  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  /* ---------------------------- ROLES ---------------------------- */

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await getRoles();
      return response.data;
    },
  });

  /* ------------------------- PERMISSIONS ------------------------- */

  const { data: permissionData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await getPermissions();
      return response.data;
    },
  });

  const permissions = useMemo(() => permissionData ?? [], [permissionData]);
  const roles = useMemo(() => data ?? [], [data]);

  /* ---------------------------- DELETE --------------------------- */

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),

    onSuccess: (response) => {
      toast.success(response.message);
      setDeleteTarget(null);
      refetch();
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Unable to delete role.");
    },
  });

  /* ---------------------------- CREATE --------------------------- */

  const createMutation = useMutation({
    mutationFn: createRole,

    onSuccess: (response) => {
      toast.success(response.message);
      setCreateOpen(false);
      refetch();
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Unable to create role.");
    },
  });

  /* ---------------------------- UPDATE --------------------------- */

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RolePayload }) =>
      updateRole(id, payload),

    onSuccess: async (response) => {
      // Close the edit modal first.
      setEditRole(null);

      // Refresh the roles list.
      await refetch();

      // Refresh the authenticated user so AuthContext receives the
      // latest role / permission information from the backend.
      await refreshUser();

      toast.success(response.message);
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Unable to update role.");
    },
  });

  /* ----------------------- SEARCH + SELECTION -------------------- */

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return roles;

    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        (role.description ?? "").toLowerCase().includes(query),
    );
  }, [roles, search]);

  const selectedRole = useMemo(
    () =>
      roles.find((role) => role.id === selectedId) ??
      filteredRoles[0] ??
      roles[0] ??
      null,
    [roles, filteredRoles, selectedId],
  );

  const canCreate = hasPermission("ROLE_CREATE");
  const canUpdate = hasPermission("ROLE_UPDATE");
  const canDelete = hasPermission("ROLE_DELETE");

  /* ---------------------------- RENDER --------------------------- */

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageTitle title="Roles" />

      {/* HEADER */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Roles
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Decide what each group of people can do.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-500 active:scale-[0.98] sm:w-auto"
          >
            <HiOutlinePlus className="h-4 w-4" />
            New role
          </button>
        )}
      </header>

      {/* CONTENT */}
      <div className="mt-7">
        {isLoading ? (
          <RolesSkeleton />
        ) : isError ? (
          <RolesError error={error} onRetry={() => refetch()} />
        ) : roles.length === 0 ? (
          <EmptyRoles
            canCreate={canCreate}
            onCreate={() => setCreateOpen(true)}
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-7">
            {/* ------------------- LEFT: ROLE LIST ------------------- */}
            <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search roles"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-indigo-500/50"
                />
              </div>

              {filteredRoles.length === 0 ? (
                <p className="px-2 py-8 text-center text-xs text-slate-400 dark:text-zinc-600">
                  No roles match "{search}".
                </p>
              ) : (
                <>
                  {/* mobile / tablet: horizontal scroller */}
                  <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
                    {filteredRoles.map((role) => (
                      <RoleChip
                        key={role.id}
                        role={role}
                        active={role.id === selectedRole?.id}
                        onSelect={() => setSelectedId(role.id)}
                      />
                    ))}
                  </div>

                  {/* desktop: vertical list */}
                  <ul className="mt-3 hidden space-y-1.5 lg:block">
                    {filteredRoles.map((role) => (
                      <RoleListItem
                        key={role.id}
                        role={role}
                        active={role.id === selectedRole?.id}
                        onSelect={() => setSelectedId(role.id)}
                      />
                    ))}
                  </ul>
                </>
              )}
            </aside>

            {/* ------------------- RIGHT: DETAIL --------------------- */}
            <section className="min-w-0">
              {selectedRole && (
                <RoleDetail
                  key={selectedRole.id}
                  role={selectedRole}
                  permissions={permissions}
                  permissionsLoading={permissionsLoading}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onEdit={setEditRole}
                  onDelete={setDeleteTarget}
                />
              )}
            </section>
          </div>
        )}
      </div>

      {/* DELETE */}
      {deleteTarget && (
        <DeleteRoleModal
          role={deleteTarget}
          loading={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        />
      )}

      {/* CREATE */}
      {createOpen && (
        <RoleModal
          role={null}
          permissions={permissions}
          permissionsLoading={permissionsLoading}
          loading={createMutation.isPending}
          onClose={() => setCreateOpen(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}

      {/* EDIT */}
      {editRole && (
        <RoleModal
          role={editRole}
          permissions={permissions}
          permissionsLoading={permissionsLoading}
          loading={updateMutation.isPending}
          onClose={() => setEditRole(null)}
          onSubmit={(payload) =>
            updateMutation.mutate({ id: editRole.id, payload })
          }
        />
      )}
    </div>
  );
}

/* ================================================================
   LEFT PANE ITEMS
================================================================ */

function RoleListItem({
  role,
  active,
  onSelect,
}: {
  role: Role;
  active: boolean;
  onSelect: () => void;
}) {
  const theme = getTheme(role.name);
  const userCount = role._count?.users ?? 0;

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
        <RoleAvatar name={role.name} />

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-[13.5px] font-medium ${
              active
                ? "text-slate-900 dark:text-white"
                : "text-slate-700 dark:text-zinc-300"
            }`}
          >
            {role.name}
          </p>

          <p className="mt-0.5 truncate text-[11.5px] text-slate-400 dark:text-zinc-500">
            {userCount} {userCount === 1 ? "user" : "users"} ·{" "}
            {role.permissions.length}{" "}
            {role.permissions.length === 1 ? "permission" : "permissions"}
          </p>
        </div>
      </button>
    </li>
  );
}

function RoleChip({
  role,
  active,
  onSelect,
}: {
  role: Role;
  active: boolean;
  onSelect: () => void;
}) {
  const theme = getTheme(role.name);

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
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ${theme.avatar}`}
      >
        {roleInitials(role.name)}
      </span>
      {role.name}
    </button>
  );
}

/* ================================================================
   RIGHT PANE: ROLE DETAIL
================================================================ */

function RoleDetail({
  role,
  permissions,
  permissionsLoading,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: {
  role: Role;
  permissions: Permission[];
  permissionsLoading: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}) {
  const theme = getTheme(role.name);

  const [onlyGranted, setOnlyGranted] = useState(false);

  const userCount = role._count?.users ?? 0;
  const grantedCount = role.permissions.length;
  const totalCount = permissions.length || grantedCount;
  const coverage =
    totalCount === 0 ? 0 : Math.round((grantedCount / totalCount) * 100);

  const grantedCodes = useMemo(
    () => new Set(role.permissions.map((permission) => permission.code)),
    [role.permissions],
  );

  /* Group every known permission; fall back to the role's own
     permissions while the full list is still loading. */
  const groups = useMemo(() => {
    const source: { id: string; code: string; name: string }[] =
      permissions.length > 0 ? permissions : role.permissions;

    const map = new Map<string, typeof source>();

    for (const permission of source) {
      const key = getGroupKey(permission.code);
      const list = map.get(key);
      if (list) list.push(permission);
      else map.set(key, [permission]);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => {
        const sorted = [...items].sort((a, b) => a.code.localeCompare(b.code));
        const granted = sorted.filter((item) => grantedCodes.has(item.code));

        return {
          key,
          all: sorted,
          granted: granted.length,
          visible: onlyGranted ? granted : sorted,
        };
      })
      .filter((group) => group.visible.length > 0);
  }, [permissions, role.permissions, grantedCodes, onlyGranted]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* header */}
      <div className={`px-5 pb-5 pt-5 sm:px-7 sm:pt-6 ${theme.soft}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <RoleAvatar name={role.name} size="lg" />

            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {role.name}
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600 dark:text-zinc-400">
                {role.description || "No description provided."}
              </p>
            </div>
          </div>

          {(canUpdate || canDelete) && (
            <div className="flex shrink-0 items-center gap-2">
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => onEdit(role)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <HiOutlinePencilSquare className="h-4 w-4" />
                  Edit
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(role)}
                  title="Delete role"
                  aria-label={`Delete ${role.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* stats */}
      <dl className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 dark:divide-zinc-800 dark:border-zinc-800">
        <DetailStat
          icon={<HiOutlineUsers className="h-4 w-4" />}
          label="Users"
          value={userCount}
        />

        <DetailStat
          icon={<HiOutlineKey className="h-4 w-4" />}
          label="Permissions"
          value={`${grantedCount}/${totalCount}`}
        />

        <DetailStat
          icon={<HiOutlineChartPie className="h-4 w-4" />}
          label="Access"
          value={`${coverage}%`}
        />
      </dl>

      {/* permissions */}
      <div className="px-5 py-6 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              What this role can do
            </h3>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500">
              Granted permissions are highlighted.
            </p>
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-zinc-900">
            {[
              { label: "All", value: false },
              { label: "Granted", value: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setOnlyGranted(option.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  onlyGranted === option.value
                    ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {permissionsLoading && permissions.length === 0 ? (
          <div className="mt-5 space-y-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-900"
              />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center dark:border-zinc-800">
            <HiOutlineShieldCheck className="mx-auto h-6 w-6 text-slate-300 dark:text-zinc-700" />

            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
              No permissions assigned
            </p>

            <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-600">
              Edit this role to grant some access.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {groups.map((group) => {
              const percent = Math.round(
                (group.granted / group.all.length) * 100,
              );

              return (
                <div key={group.key}>
                  <div className="flex items-center gap-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      {formatGroupLabel(group.key)}
                    </h4>

                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all ${theme.bar}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <span className="text-[11px] font-medium tabular-nums text-slate-400 dark:text-zinc-500">
                      {group.granted}/{group.all.length}
                    </span>
                  </div>

                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {group.visible.map((permission) => {
                      const granted = grantedCodes.has(permission.code);

                      return (
                        <li
                          key={permission.id}
                          title={permission.code}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                            granted
                              ? theme.soft
                              : "bg-slate-50/60 dark:bg-zinc-900/40"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              granted
                                ? `${theme.bar} text-white`
                                : "border border-slate-200 text-transparent dark:border-zinc-700"
                            }`}
                          >
                            <HiOutlineCheck className="h-3 w-3 stroke-[3]" />
                          </span>

                          <span className="min-w-0">
                            <span
                              className={`block truncate text-[13px] ${
                                granted
                                  ? "font-medium text-slate-900 dark:text-zinc-100"
                                  : "text-slate-400 dark:text-zinc-600"
                              }`}
                            >
                              {permission.name}
                            </span>

                            <span
                              className={`block truncate font-mono text-[10.5px] ${
                                granted
                                  ? theme.text
                                  : "text-slate-300 dark:text-zinc-700"
                              }`}
                            >
                              {permission.code}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="px-4 py-4 text-center sm:px-7 sm:text-left">
      <dt className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 sm:justify-start dark:text-zinc-500">
        {icon}
        {label}
      </dt>

      <dd className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
        {value}
      </dd>
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
   CREATE / EDIT ROLE MODAL (shared)
================================================================ */

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:hover:border-zinc-700 dark:focus:border-indigo-500/50";

const labelClass =
  "mb-1.5 block text-xs font-medium text-slate-600 dark:text-zinc-400";

function RoleModal({
  role,
  permissions,
  permissionsLoading,
  loading,
  onClose,
  onSubmit,
}: {
  role: Role | null;
  permissions: Permission[];
  permissionsLoading: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: RolePayload) => void;
}) {
  const isEdit = role !== null;

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selected, setSelected] = useState<string[]>([]);

  /* Preselect the role's existing permissions once permissions load. */
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current || !role || permissions.length === 0) return;

    const codes = new Set(
      role.permissions.map((permission) => permission.code),
    );

    setSelected(
      permissions
        .filter((permission) => codes.has(permission.code))
        .map((permission) => permission.id),
    );

    initialised.current = true;
  }, [role, permissions]);

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();

    if (!name.trim()) {
      toast.warning("Role name is required.");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      permissionIds: selected,
    });
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* header */}
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-1 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {isEdit ? "Edit role" : "New role"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500">
              {isEdit
                ? "Update this role's details and permissions."
                : "Name the role and choose what it can access."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          >
            <HiOutlineXMark className="h-[18px] w-[18px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 sm:px-6">
            <div>
              <label htmlFor="role-name" className={labelClass}>
                Name
              </label>

              <input
                id="role-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. TEAM_LEAD"
                disabled={loading}
                autoFocus
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="role-description" className={labelClass}>
                Description
                <span className="ml-1.5 font-normal text-slate-400 dark:text-zinc-600">
                  Optional
                </span>
              </label>

              <textarea
                id="role-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what this role can do"
                rows={2}
                disabled={loading}
                className={`${inputClass} h-auto resize-none py-2.5 leading-5`}
              />
            </div>

            <PermissionPicker
              permissions={permissions}
              loading={permissionsLoading}
              selected={selected}
              onChange={setSelected}
            />
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 w-full rounded-lg px-4 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 sm:w-auto dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save changes"
                  : "Create role"}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ================================================================
   PERMISSION PICKER (grouped, searchable)
================================================================ */

function PermissionPicker({
  permissions,
  loading,
  selected,
  onChange,
}: {
  permissions: Permission[];
  loading: boolean;
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = q
      ? permissions.filter(
          (permission) =>
            permission.code.toLowerCase().includes(q) ||
            permission.name.toLowerCase().includes(q),
        )
      : permissions;

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
  }, [permissions, query]);

  function toggle(id: string) {
    onChange(
      selectedSet.has(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id],
    );
  }

  function toggleGroup(items: Permission[]) {
    const ids = items.map((item) => item.id);
    const allSelected = ids.every((id) => selectedSet.has(id));

    if (allSelected) {
      const remove = new Set(ids);
      onChange(selected.filter((id) => !remove.has(id)));
    } else {
      onChange(Array.from(new Set([...selected, ...ids])));
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-medium text-slate-600 dark:text-zinc-400">
            Permissions
          </h3>

          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-zinc-600">
            {selected.length} of {permissions.length} selected
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-[11px] font-medium">
          <button
            type="button"
            onClick={() =>
              onChange(permissions.map((permission) => permission.id))
            }
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Select all
          </button>

          <button
            type="button"
            onClick={() => onChange([])}
            className="text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-slate-200 text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
          Loading permissions...
        </div>
      ) : permissions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-zinc-800 dark:text-zinc-600">
          No permissions available.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800">
          <div className="relative border-b border-slate-200 dark:border-zinc-800">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter permissions"
              className="h-9 w-full bg-transparent pl-9 pr-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {groups.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-400 dark:text-zinc-600">
                No matches.
              </p>
            ) : (
              groups.map((group) => {
                const groupSelected = group.items.filter((item) =>
                  selectedSet.has(item.id),
                ).length;

                const allSelected = groupSelected === group.items.length;

                return (
                  <div key={group.key}>
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-50 px-3 py-1.5 dark:bg-zinc-900">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        {formatGroupLabel(group.key)}
                        <span className="ml-1.5 font-normal normal-case tracking-normal text-slate-400 dark:text-zinc-600">
                          {groupSelected}/{group.items.length}
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleGroup(group.items)}
                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        {allSelected ? "Clear" : "Select all"}
                      </button>
                    </div>

                    {group.items.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex cursor-pointer items-start gap-3 px-3 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900/60"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSet.has(permission.id)}
                          onChange={() => toggle(permission.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                        />

                        <span className="min-w-0">
                          <span className="block text-[13px] text-slate-800 dark:text-zinc-200">
                            {permission.name}
                          </span>

                          <span className="block break-all font-mono text-[10.5px] text-slate-400 dark:text-zinc-500">
                            {permission.code}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   DELETE ROLE MODAL
================================================================ */

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
  const userCount = role._count?.users ?? 0;

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="w-full rounded-t-2xl border border-slate-200/80 bg-white p-5 shadow-2xl sm:max-w-sm sm:rounded-2xl sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
          <HiOutlineTrash className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
          Delete role?
        </h2>

        <p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-zinc-400">
          <span className="font-medium text-slate-700 dark:text-zinc-200">
            {role.name}
          </span>{" "}
          will be removed. This action cannot be undone.
        </p>

        {userCount > 0 && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-4 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            This role is currently assigned to {userCount}{" "}
            {userCount === 1 ? "user" : "users"}.
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-9 w-full rounded-lg px-4 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 sm:w-auto dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-red-600 px-4 text-[13px] font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ================================================================
   SKELETON / EMPTY / ERROR
================================================================ */

function RolesSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-7">
      <div className="space-y-2">
        <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-900" />

        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-3 p-2.5"
          >
            <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-zinc-800" />

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

function EmptyRoles({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-20 text-center dark:border-zinc-800">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
        <HiOutlineShieldCheck className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
        No roles yet
      </h3>

      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
        Create a role to start granting access.
      </p>

      {canCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-semibold text-white transition hover:bg-indigo-500"
        >
          <HiOutlinePlus className="h-4 w-4" />
          New role
        </button>
      )}
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
  const status = axiosError?.response?.status;
  const message = axiosError?.response?.data?.message;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200/70 bg-red-50/40 px-6 py-14 text-center dark:border-red-500/20 dark:bg-red-500/5">
      <HiOutlineExclamationTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />

      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
        {status === 403 ? "Access denied" : "Unable to load roles"}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-zinc-400">
        {status === 403
          ? "You don't have permission to view roles."
          : (message ?? "Something went wrong while loading roles.")}
      </p>

      {status !== 403 && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Try again
        </button>
      )}
    </div>
  );
}
