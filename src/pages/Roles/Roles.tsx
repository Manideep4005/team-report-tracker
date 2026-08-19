import {
  HiOutlinePencilSquare,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineXMark,
} from "react-icons/hi2";

import { useEffect, useState, type FormEvent } from "react";

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

/* ================================================================
   MAIN PAGE
================================================================ */

export default function Roles() {
  const {
    hasPermission,
    refreshUser,
  } = useAuth();

  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const [editRole, setEditRole] = useState<Role | null>(null);

  /* ============================================================
       ROLES
    ============================================================ */

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["roles"],

    queryFn: async () => {
      const response = await getRoles();

      return response.data;
    },
  });

  /* ============================================================
       PERMISSIONS
    ============================================================ */

  const { data: permissionData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions"],

    queryFn: async () => {
      const response = await getPermissions();

      return response.data;
    },
  });

  const permissions = permissionData ?? [];

  const roles = data ?? [];

  /* ============================================================
       DELETE
    ============================================================ */

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

  /* ============================================================
       CREATE
    ============================================================ */

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

  /* ============================================================
       UPDATE
    ============================================================ */

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

    onSuccess: async (response) => {

      /*
       * First close the edit modal.
       */

      setEditRole(null);


      /*
       * Refresh the roles list.
       */

      await refetch();


      /*
       * IMPORTANT:
       *
       * Refresh the currently authenticated user.
       *
       * This causes AuthContext to receive the
       * latest role/permission information from
       * the backend.
       */

      await refreshUser();


      toast.success(
        response.message
      );

    },

    onError: (error: any) => {

      toast.error(
        error?.response?.data?.message ??
        "Unable to update role."
      );

    },
  });

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
              Roles
            </h1>

            {!isLoading && (
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
                {roles.length} {roles.length === 1 ? "role" : "roles"}
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
            Manage roles and their permissions.
          </p>
        </div>

        {hasPermission("ROLE_CREATE") && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
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
            Add Role
          </button>
        )}
      </div>

      {/* ==================================================
                CONTENT
            ================================================== */}

      <div className="mt-6">
        {isLoading ? (
          <RolesSkeleton />
        ) : isError ? (
          <RolesError error={error} onRetry={() => refetch()} />
        ) : roles.length === 0 ? (
          <EmptyRoles />
        ) : (
          <div
            className="
                            grid
                            gap-4
                            sm:grid-cols-2
                            xl:grid-cols-3
                        "
          >
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

      {/* ==================================================
                DELETE
            ================================================== */}

      {deleteTarget && (
        <DeleteRoleModal
          role={deleteTarget}
          loading={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        />
      )}

      {/* ==================================================
                CREATE
            ================================================== */}

      {createOpen && (
        <CreateRoleModal
          permissions={permissions}
          permissionsLoading={permissionsLoading}
          loading={createMutation.isPending}
          onClose={() => setCreateOpen(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}

      {/* ==================================================
                EDIT
            ================================================== */}

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

/* ================================================================
   ROLE CARD
================================================================ */

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
  const userCount = role._count?.users ?? 0;

  return (
    <div
      className="
                flex
                min-h-[238px]
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
                CARD BODY
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
            <div
              className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            "
            >
              <h2
                className="
                                    truncate
                                    text-[14px]
                                    font-bold
                                    tracking-tight
                                    text-slate-900
                                    dark:text-white
                                "
              >
                {role.name}
              </h2>

              <span
                className="
                                    inline-flex
                                    shrink-0
                                    items-center
                                    rounded-full
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-2
                                    py-0.5
                                    text-[9px]
                                    font-bold
                                    text-slate-500
                                    dark:border-zinc-800
                                    dark:bg-zinc-900
                                    dark:text-zinc-500
                                "
              >
                {userCount} {userCount === 1 ? "user" : "users"}
              </span>
            </div>

            <p
              className="
                                mt-1.5
                                line-clamp-2
                                min-h-[32px]
                                text-[11px]
                                leading-4
                                text-slate-500
                                dark:text-zinc-500
                            "
            >
              {role.description || "No description provided."}
            </p>
          </div>

          <div
            className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-50
                            text-slate-400
                            dark:bg-zinc-900
                            dark:text-zinc-600
                        "
          >
            <HiOutlineShieldCheck className="h-4 w-4" />
          </div>
        </div>

        {/* ==================================================
                    PERMISSIONS
                ================================================== */}

        <div className="mt-5">
          <div
            className="
                            mb-2
                            flex
                            items-center
                            justify-between
                        "
          >
            <p
              className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-slate-400
                                dark:text-zinc-600
                            "
            >
              Permissions
            </p>

            <span
              className="
                                text-[9px]
                                font-medium
                                text-slate-400
                                dark:text-zinc-600
                            "
            >
              {role.permissions.length}
            </span>
          </div>

          <div
            className="
                            flex
                            max-h-[72px]
                            flex-wrap
                            gap-1.5
                            overflow-hidden
                        "
          >
            {role.permissions.slice(0, 4).map((permission) => (
              <span
                key={permission.id}
                className="
                                            inline-flex
                                            max-w-full
                                            truncate
                                            rounded-md
                                            border
                                            border-indigo-100
                                            bg-indigo-50
                                            px-2
                                            py-1
                                            text-[9px]
                                            font-semibold
                                            text-indigo-600
                                            dark:border-indigo-500/20
                                            dark:bg-indigo-500/10
                                            dark:text-indigo-400
                                        "
              >
                {permission.code}
              </span>
            ))}

            {role.permissions.length > 5 && (
              <span
                className="
                                    inline-flex
                                    items-center
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
                +{role.permissions.length - 5}
              </span>
            )}

            {role.permissions.length === 0 && (
              <span
                className="
                                    text-[10px]
                                    text-slate-400
                                    dark:text-zinc-600
                                "
              >
                No permissions assigned
              </span>
            )}
          </div>
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
              onClick={() => onEdit(role)}
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
              title="Edit role"
            >
              <HiOutlinePencilSquare className="h-4 w-4" />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(role)}
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
              title="Delete role"
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
                bg-slate-950/30
                p-0
                backdrop-blur-sm
                sm:items-center
                sm:p-4
                dark:bg-black/55
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
   CREATE ROLE MODAL
================================================================ */

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

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  function togglePermission(id: string) {
    setSelectedPermissions((current) =>
      current.includes(id)
        ? current.filter((permissionId) => permissionId !== id)
        : [...current, id],
    );
  }

  function selectAll() {
    setSelectedPermissions(permissions.map((permission) => permission.id));
  }

  function clearAll() {
    setSelectedPermissions([]);
  }

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();

    if (!name.trim()) {
      toast.warning("Role name is required.");

      return;
    }

    onSubmit({
      name: name.trim(),

      description: description.trim() || undefined,

      permissionIds: selectedPermissions,
    });
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
                    sm:max-w-2xl
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
            <h2
              className="
                                text-sm
                                font-bold
                                text-slate-900
                                dark:text-white
                            "
            >
              Create Role
            </h2>

            <p
              className="
                                mt-1
                                text-xs
                                text-slate-500
                                dark:text-zinc-500
                            "
            >
              Create a role and assign its permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
                            inline-flex
                            h-8
                            w-8
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
          onSubmit={handleSubmit}
          className="
                        flex
                        min-h-0
                        flex-1
                        flex-col
                    "
        >
          <div
            className="
                            min-h-0
                            flex-1
                            overflow-y-auto
                            p-5
                        "
          >
            <div className="space-y-5">
              {/* NAME */}

              <div>
                <label className="label">Role Name</label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. TEAM_LEAD"
                  className="input"
                  autoFocus
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="label">Description</label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe what this role can do..."
                  rows={3}
                  className="
                                        input
                                        resize-none
                                    "
                />
              </div>

              {/* PERMISSIONS */}

              <PermissionSelector
                permissions={permissions}
                permissionsLoading={permissionsLoading}
                selectedPermissions={selectedPermissions}
                onToggle={togglePermission}
                onSelectAll={selectAll}
                onClearAll={clearAll}
              />
            </div>
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
              disabled={loading}
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
              disabled={loading}
              className="
                                btn-primary
                                w-full
                                text-xs
                                sm:w-auto
                            "
            >
              {loading ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ================================================================
   EDIT ROLE MODAL
================================================================ */

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
  const [name, setName] = useState(role.name);

  const [description, setDescription] = useState(role.description ?? "");

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  /* ============================================================
       LOAD EXISTING PERMISSIONS
    ============================================================ */

  useEffect(() => {
    if (!permissions.length || !role.permissions.length) {
      return;
    }

    const rolePermissionCodes = new Set(
      role.permissions.map((permission) => permission.code),
    );

    const selectedIds = permissions
      .filter((permission) => rolePermissionCodes.has(permission.code))
      .map((permission) => permission.id);

    setSelectedPermissions(selectedIds);
  }, [role, permissions]);

  function togglePermission(id: string) {
    setSelectedPermissions((current) =>
      current.includes(id)
        ? current.filter((permissionId) => permissionId !== id)
        : [...current, id],
    );
  }

  function selectAll() {
    setSelectedPermissions(permissions.map((permission) => permission.id));
  }

  function clearAll() {
    setSelectedPermissions([]);
  }

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();

    if (!name.trim()) {
      toast.warning("Role name is required.");

      return;
    }

    onSubmit({
      name: name.trim(),

      description: description.trim() || undefined,

      permissionIds: selectedPermissions,
    });
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
                    sm:max-w-2xl
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
            <h2
              className="
                                text-sm
                                font-bold
                                text-slate-900
                                dark:text-white
                            "
            >
              Edit Role
            </h2>

            <p
              className="
                                mt-1
                                text-xs
                                text-slate-500
                                dark:text-zinc-500
                            "
            >
              Update role details and permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
                            inline-flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            dark:text-zinc-500
                            dark:hover:bg-zinc-900
                        "
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}

        <form
          onSubmit={handleSubmit}
          className="
                        flex
                        min-h-0
                        flex-1
                        flex-col
                    "
        >
          <div
            className="
                            min-h-0
                            flex-1
                            overflow-y-auto
                            p-5
                        "
          >
            <div className="space-y-5">
              {/* NAME */}

              <div>
                <label className="label">Role Name</label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="input"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="label">Description</label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="
                                        input
                                        resize-none
                                    "
                />
              </div>

              {/* PERMISSIONS */}

              <PermissionSelector
                permissions={permissions}
                permissionsLoading={permissionsLoading}
                selectedPermissions={selectedPermissions}
                onToggle={togglePermission}
                onSelectAll={selectAll}
                onClearAll={clearAll}
              />
            </div>
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
              disabled={loading}
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
              disabled={loading}
              className="
                                btn-primary
                                w-full
                                text-xs
                                sm:w-auto
                            "
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ================================================================
   PERMISSION SELECTOR
================================================================ */

function PermissionSelector({
  permissions,
  permissionsLoading,
  selectedPermissions,
  onToggle,
  onSelectAll,
  onClearAll,
}: {
  permissions: Permission[];
  permissionsLoading: boolean;
  selectedPermissions: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  return (
    <div>
      {/* HEADER */}

      <div
        className="
                    mb-3
                    flex
                    flex-wrap
                    items-end
                    justify-between
                    gap-3
                "
      >
        <div>
          <label className="label mb-0">Permissions</label>

          <p
            className="
                            mt-1
                            text-[10px]
                            text-slate-400
                            dark:text-zinc-600
                        "
          >
            {selectedPermissions.length} of {permissions.length} selected
          </p>
        </div>

        <div
          className="
                        flex
                        items-center
                        gap-2
                    "
        >
          <button
            type="button"
            onClick={onSelectAll}
            className="
                            text-[11px]
                            font-semibold
                            text-indigo-600
                            hover:text-indigo-700
                            dark:text-indigo-400
                        "
          >
            Select all
          </button>

          <span
            className="
                            text-slate-300
                            dark:text-zinc-700
                        "
          >
            /
          </span>

          <button
            type="button"
            onClick={onClearAll}
            className="
                            text-[11px]
                            font-semibold
                            text-slate-500
                            hover:text-slate-800
                            dark:text-zinc-500
                            dark:hover:text-zinc-300
                        "
          >
            Clear
          </button>
        </div>
      </div>

      {/* LIST */}

      {permissionsLoading ? (
        <div
          className="
                        flex
                        min-h-[180px]
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        text-xs
                        text-slate-400
                        dark:border-zinc-800
                        dark:text-zinc-500
                    "
        >
          Loading permissions...
        </div>
      ) : permissions.length === 0 ? (
        <div
          className="
                        rounded-xl
                        border
                        border-dashed
                        border-slate-200
                        p-8
                        text-center
                        text-xs
                        text-slate-400
                        dark:border-zinc-800
                        dark:text-zinc-600
                    "
        >
          No permissions available.
        </div>
      ) : (
        <div
          className="
                        grid
                        gap-2
                        sm:grid-cols-2
                    "
        >
          {permissions.map((permission) => {
            const selected = selectedPermissions.includes(permission.id);

            return (
              <button
                type="button"
                key={permission.id}
                onClick={() => onToggle(permission.id)}
                className={`
                                        flex
                                        min-h-[64px]
                                        items-start
                                        gap-3
                                        rounded-xl
                                        border
                                        p-3
                                        text-left
                                        transition-all
                                        duration-150

                                        ${selected
                    ? `
                                                    border-indigo-200
                                                    bg-indigo-50/70
                                                    shadow-sm
                                                    shadow-indigo-500/5
                                                    dark:border-indigo-500/30
                                                    dark:bg-indigo-500/10
                                                `
                    : `
                                                    border-slate-200
                                                    bg-white
                                                    hover:border-slate-300
                                                    hover:bg-slate-50
                                                    dark:border-zinc-800
                                                    dark:bg-zinc-900/40
                                                    dark:hover:bg-zinc-900
                                                `
                  }
                                    `}
              >
                {/* CHECKBOX */}

                <span
                  className={`
                                            mt-0.5
                                            flex
                                            h-4
                                            w-4
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded
                                            border
                                            text-[9px]
                                            font-bold

                                            ${selected
                      ? `
                                                        border-indigo-600
                                                        bg-indigo-600
                                                        text-white
                                                    `
                      : `
                                                        border-slate-300
                                                        bg-white
                                                        dark:border-zinc-700
                                                        dark:bg-zinc-950
                                                    `
                    }
                                        `}
                >
                  {selected ? "✓" : ""}
                </span>

                {/* TEXT */}

                <span
                  className="
                                            min-w-0
                                        "
                >
                  <span
                    className="
                                                block
                                                break-words
                                                text-[10px]
                                                font-bold
                                                leading-4
                                                text-slate-800
                                                dark:text-zinc-200
                                            "
                  >
                    {permission.code}
                  </span>

                  <span
                    className="
                                                mt-0.5
                                                block
                                                text-[10px]
                                                leading-4
                                                text-slate-400
                                                dark:text-zinc-500
                                            "
                  >
                    {permission.name}
                  </span>
                </span>
              </button>
            );
          })}
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
        {/* HEADER */}

        <div
          className="
                        flex
                        items-start
                        justify-between
                        p-5
                    "
        >
          <div
            className="
                            flex
                            items-start
                            gap-3
                        "
          >
            <div
              className="
                                flex
                                h-10
                                w-10
                                shrink-0
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

            <div>
              <h2
                className="
                                    text-sm
                                    font-bold
                                    text-slate-900
                                    dark:text-white
                                "
              >
                Delete role?
              </h2>

              <p
                className="
                                    mt-1
                                    text-xs
                                    leading-5
                                    text-slate-500
                                    dark:text-zinc-500
                                "
              >
                Are you sure you want to delete{" "}
                <span
                  className="
                                        font-semibold
                                        text-slate-700
                                        dark:text-zinc-300
                                    "
                >
                  {role.name}
                </span>
                ?
              </p>

              {role._count?.users && role._count.users > 0 && (
                <p
                  className="
                                            mt-2
                                            text-[10px]
                                            font-medium
                                            leading-4
                                            text-red-500
                                            dark:text-red-400
                                        "
                >
                  This role is currently assigned to {role._count.users}{" "}
                  {role._count.users === 1 ? "user" : "users"}.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
                            inline-flex
                            h-8
                            w-8
                            shrink-0
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

        {/* FOOTER */}

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
            disabled={loading}
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
            onClick={onConfirm}
            disabled={loading}
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
            {loading ? "Deleting..." : "Delete Role"}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ================================================================
   SKELETON
================================================================ */

function RolesSkeleton() {
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
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="
                        min-h-[238px]
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
                            h-4
                            w-32
                            rounded
                            bg-slate-200
                            dark:bg-zinc-800
                        "
          />

          <div
            className="
                            mt-3
                            h-3
                            w-48
                            rounded
                            bg-slate-100
                            dark:bg-zinc-900
                        "
          />

          <div
            className="
                            mt-6
                            flex
                            gap-2
                        "
          >
            <div
              className="
                                h-6
                                w-20
                                rounded-md
                                bg-slate-200
                                dark:bg-zinc-800
                            "
            />

            <div
              className="
                                h-6
                                w-24
                                rounded-md
                                bg-slate-200
                                dark:bg-zinc-800
                            "
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   EMPTY
================================================================ */

function EmptyRoles() {
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
        No roles found
      </h3>

      <p
        className="
                    mt-1
                    text-xs
                    text-slate-400
                    dark:text-zinc-600
                "
      >
        Create a role to get started.
      </p>
    </div>
  );
}

/* ================================================================
   ERROR
================================================================ */

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
        {status === 403 ? "Access denied" : "Unable to load roles"}
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
        {status === 403
          ? "You don't have permission to view roles."
          : (message ?? "Something went wrong while loading roles.")}
      </p>

      {status !== 403 && (
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
      )}
    </div>
  );
}
