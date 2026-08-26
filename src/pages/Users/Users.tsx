import {
  HiOutlineKey,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineUserPlus,
  HiOutlineUsers,
  HiOutlineXMark,
} from "react-icons/hi2";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  getRoles,
  type Role,
} from "../../services/role";

import {
  createUser,
  updateUser,
  getUsers,
  deleteUser,
  resetUserPassword,
  type CreateUserPayload,
  type ManagedUser,
} from "../../services/user";

import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";


/* ================================================================
   MAIN USERS PAGE
================================================================ */

export default function Users() {

  const {
    hasPermission,
  } = useAuth();


  /* ============================================================
     MODAL STATE
  ============================================================ */

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);


  const [
    editUser,
    setEditUser,
  ] = useState<ManagedUser | null>(
    null
  );


  const [
    deleteUserTarget,
    setDeleteUserTarget,
  ] = useState<ManagedUser | null>(
    null
  );


  const [
    resetPasswordTarget,
    setResetPasswordTarget,
  ] = useState<ManagedUser | null>(
    null
  );


  /* ============================================================
     USERS
  ============================================================ */

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({

    queryKey: [
      "users",
    ],

    queryFn: async () => {

      const response =
        await getUsers();

      return response.data;

    },

  });


  /* ============================================================
     ROLES
  ============================================================ */

  const {
    data: roles = [],
  } = useQuery<Role[]>({

    queryKey: [
      "roles",
    ],

    queryFn: async () => {

      const response =
        await getRoles();

      return response.data;

    },

  });


  /* ============================================================
     CREATE USER
  ============================================================ */

  const createMutation =
    useMutation({

      mutationFn: (
        payload: CreateUserPayload
      ) =>
        createUser(
          payload
        ),

      onSuccess: (
        response
      ) => {

        toast.success(
          response.message
        );

        setCreateOpen(
          false
        );

        refetch();

      },

      onError: (
        error: any
      ) => {

        toast.error(
          error?.response?.data?.message ??
          "Unable to create user."
        );

      },

    });


  /* ============================================================
     UPDATE USER
  ============================================================ */

  const updateMutation =
    useMutation({

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

      }) =>
        updateUser(
          id,
          payload
        ),

      onSuccess: (
        response
      ) => {

        toast.success(
          response.message
        );

        setEditUser(
          null
        );

        refetch();

      },

      onError: (
        error: any
      ) => {

        toast.error(
          error?.response?.data?.message ??
          "Unable to update user."
        );

      },

    });


  /* ============================================================
     RESET PASSWORD
  ============================================================ */

  const resetPasswordMutation =
    useMutation({

      mutationFn: (
        userId: string
      ) =>
        resetUserPassword(
          userId
        ),

      onSuccess: (
        response
      ) => {

        toast.success(
          response.message
        );

        setResetPasswordTarget(
          null
        );

      },

      onError: (
        error: any
      ) => {

        toast.error(
          error?.response?.data?.message ??
          "Unable to reset password."
        );

      },

    });


  /* ============================================================
     DELETE USER
  ============================================================ */

  const deleteMutation =
    useMutation({

      mutationFn: (
        userId: string
      ) =>
        deleteUser(
          userId
        ),

      onSuccess: (
        response
      ) => {

        toast.success(
          response.message
        );

        setDeleteUserTarget(
          null
        );

        refetch();

      },

      onError: (
        error: any
      ) => {

        toast.error(
          error?.response?.data?.message ??
          "Unable to delete user."
        );

      },

    });


  const users =
    data ?? [];


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
                PAGE HEADER
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

        <div
          className="
                        min-w-0
                    "
        >

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
              Users
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
                {users.length}{" "}

                {
                  users.length === 1
                    ? "member"
                    : "members"
                }

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
            Manage team members and their roles.
          </p>

        </div>


        {/* ==================================================
                    ADD USER
                ================================================== */}

        {hasPermission(
          "USER_CREATE"
        ) && (

            <button
              type="button"
              onClick={() =>
                setCreateOpen(
                  true
                )
              }
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
                            duration-200
                            hover:bg-indigo-700
                            hover:shadow-md
                            active:scale-[0.98]
                            sm:w-auto
                        "
            >

              <HiOutlineUserPlus
                className="
                                h-4
                                w-4
                            "
              />

              Add User

            </button>

          )}

      </div>


      {/* ==================================================
                CONTENT
            ================================================== */}

      <div
        className="
                    mt-6
                "
      >

        {isLoading ? (

          <UsersSkeleton />

        ) : isError ? (

          <UsersError
            error={error}
            onRetry={() =>
              refetch()
            }
          />

        ) : users.length === 0 ? (

          <EmptyUsers />

        ) : (

          <>

            {/* ==================================================
                            DESKTOP
                        ================================================== */}

            <div
              className="
                                hidden
                                overflow-hidden
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                shadow-[0_3px_18px_rgba(15,23,42,0.035)]
                                dark:border-zinc-800
                                dark:bg-zinc-950
                                dark:shadow-none
                                sm:block
                            "
            >

              <div
                className="
                                    overflow-x-auto
                                "
              >

                <table
                  className="
                                        w-full
                                        min-w-[760px]
                                    "
                >

                  <thead>

                    <tr
                      className="
                                                border-b
                                                border-slate-200
                                                bg-slate-50/70
                                                dark:border-zinc-800
                                                dark:bg-zinc-900/40
                                            "
                    >

                      <th
                        className="
                                                    px-5
                                                    py-3.5
                                                    text-left
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-slate-400
                                                    dark:text-zinc-500
                                                "
                      >
                        User
                      </th>


                      <th
                        className="
                                                    px-5
                                                    py-3.5
                                                    text-left
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-slate-400
                                                    dark:text-zinc-500
                                                "
                      >
                        Email
                      </th>


                      <th
                        className="
                                                    px-5
                                                    py-3.5
                                                    text-left
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-slate-400
                                                    dark:text-zinc-500
                                                "
                      >
                        Role
                      </th>


                      <th
                        className="
                                                    w-[160px]
                                                    px-5
                                                    py-3.5
                                                    text-right
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-[0.12em]
                                                    text-slate-400
                                                    dark:text-zinc-500
                                                "
                      >
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {users.map(
                      (user) => (

                        <UserRow

                          key={
                            user.id
                          }

                          user={
                            user
                          }

                          canUpdate={
                            hasPermission(
                              "USER_UPDATE"
                            )
                          }

                          canDelete={
                            hasPermission(
                              "USER_DELETE"
                            )
                          }

                          canResetPassword={
                            hasPermission(
                              "USER_PASSWORD_RESET"
                            )
                          }

                          onEdit={
                            setEditUser
                          }

                          onDelete={
                            setDeleteUserTarget
                          }

                          onResetPassword={
                            setResetPasswordTarget
                          }

                        />

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* ==================================================
                            MOBILE
                        ================================================== */}

            <div
              className="
                                flex
                                flex-col
                                gap-3
                                sm:hidden
                            "
            >

              {users.map(
                (user) => (

                  <UserCard

                    key={
                      user.id
                    }

                    user={
                      user
                    }

                    canUpdate={
                      hasPermission(
                        "USER_UPDATE"
                      )
                    }

                    canDelete={
                      hasPermission(
                        "USER_DELETE"
                      )
                    }

                    canResetPassword={
                      hasPermission(
                        "USER_PASSWORD_RESET"
                      )
                    }

                    onEdit={
                      setEditUser
                    }

                    onDelete={
                      setDeleteUserTarget
                    }

                    onResetPassword={
                      setResetPasswordTarget
                    }

                  />

                )
              )}

            </div>

          </>

        )}

      </div>


      {/* ==================================================
                CREATE MODAL
            ================================================== */}

      {createOpen && (

        <CreateUserModal

          roles={
            roles
          }

          loading={
            createMutation.isPending
          }

          onClose={() =>
            setCreateOpen(
              false
            )
          }

          onSubmit={(
            payload
          ) =>
            createMutation.mutate(
              payload
            )
          }

        />

      )}


      {/* ==================================================
                EDIT MODAL
            ================================================== */}

      {editUser && (

        <EditUserModal

          user={
            editUser
          }

          roles={
            roles
          }

          loading={
            updateMutation.isPending
          }

          onClose={() =>
            setEditUser(
              null
            )
          }

          onSubmit={(
            payload
          ) =>
            updateMutation.mutate({

              id:
                editUser.id,

              payload,

            })
          }

        />

      )}


      {/* ==================================================
                DELETE MODAL
            ================================================== */}

      {deleteUserTarget && (

        <DeleteUserModal

          user={
            deleteUserTarget
          }

          loading={
            deleteMutation.isPending
          }

          onClose={() =>
            setDeleteUserTarget(
              null
            )
          }

          onConfirm={() =>
            deleteMutation.mutate(
              deleteUserTarget.id
            )
          }

        />

      )}


      {/* ==================================================
                RESET PASSWORD MODAL
            ================================================== */}

      {resetPasswordTarget && (

        <ResetPasswordModal

          user={
            resetPasswordTarget
          }

          loading={
            resetPasswordMutation.isPending
          }

          onClose={() =>
            setResetPasswordTarget(
              null
            )
          }

          onConfirm={() =>
            resetPasswordMutation.mutate(
              resetPasswordTarget.id
            )
          }

        />

      )}

    </div>

  );
}


/* ================================================================
   INITIALS
================================================================ */

function getInitials(
  name: string
) {

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]
    )
    .join("")
    .toUpperCase();

}


/* ================================================================
   DESKTOP ROW
================================================================ */

function UserRow({
  user,
  canUpdate,
  canDelete,
  canResetPassword,
  onEdit,
  onDelete,
  onResetPassword,
}: {
  user: ManagedUser;

  canUpdate: boolean;

  canDelete: boolean;

  canResetPassword: boolean;

  onEdit: (
    user: ManagedUser
  ) => void;

  onDelete: (
    user: ManagedUser
  ) => void;

  onResetPassword: (
    user: ManagedUser
  ) => void;
}) {

  const initials =
    getInitials(
      user.name
    );


  return (

    <tr
      className="
                border-b
                border-slate-100
                transition-colors
                last:border-0
                hover:bg-slate-50/60
                dark:border-zinc-800/60
                dark:hover:bg-zinc-900/40
            "
    >

      {/* USER */}

      <td
        className="
                    px-5
                    py-4
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
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-indigo-600
                            text-[11px]
                            font-bold
                            text-white
                        "
          >
            {initials}
          </div>


          <div
            className="
                            min-w-0
                        "
          >

            <p
              className="
                                truncate
                                text-xs
                                font-bold
                                text-slate-900
                                dark:text-zinc-100
                            "
            >
              {user.name}
            </p>


            <p
              className="
                                mt-0.5
                                text-[10px]
                                text-slate-400
                                dark:text-zinc-600
                            "
            >
              Joined{" "}

              {new Date(
                user.createdAt
              ).toLocaleDateString(
                "en-IN"
              )}

            </p>

          </div>

        </div>

      </td>


      {/* EMAIL */}

      <td
        className="
                    px-5
                    py-4
                "
      >

        <span
          className="
                        text-xs
                        text-slate-600
                        dark:text-zinc-400
                    "
        >
          {user.email}
        </span>

      </td>


      {/* ROLE */}

      <td
        className="
                    px-5
                    py-4
                "
      >

        <RoleBadge
          role={
            user.role.name
          }
        />

      </td>


      {/* ACTIONS */}

      <td
        className="
                    px-5
                    py-4
                "
      >

        <div
          className="
                        flex
                        justify-end
                        gap-2
                    "
        >

          {/* EDIT */}

          {canUpdate && (

            <button
              type="button"
              onClick={() =>
                onEdit(
                  user
                )
              }
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
                                transition-all
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
              title="Edit user"
            >

              <HiOutlinePencilSquare
                className="
                                    h-4
                                    w-4
                                "
              />

            </button>

          )}


          {/* RESET PASSWORD */}

          {canResetPassword && (

            <button
              type="button"
              onClick={() =>
                onResetPassword(
                  user
                )
              }
              className="
                                inline-flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-amber-100
                                bg-amber-50
                                text-amber-600
                                shadow-sm
                                transition-all
                                hover:bg-amber-100
                                dark:border-amber-500/20
                                dark:bg-amber-500/10
                                dark:text-amber-400
                                dark:hover:bg-amber-500/20
                            "
              title="Reset password"
            >

              <HiOutlineKey
                className="
                                    h-4
                                    w-4
                                "
              />

            </button>

          )}


          {/* DELETE */}

          {canDelete && (

            <button
              type="button"
              onClick={() =>
                onDelete(
                  user
                )
              }
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
                                transition-all
                                hover:bg-red-100
                                dark:border-red-900/30
                                dark:bg-red-950/20
                                dark:text-red-400
                                dark:hover:bg-red-950/40
                            "
              title="Delete user"
            >

              <HiOutlineTrash
                className="
                                    h-4
                                    w-4
                                "
              />

            </button>

          )}

        </div>

      </td>

    </tr>

  );
}


/* ================================================================
   MOBILE CARD
================================================================ */

function UserCard({
  user,
  canUpdate,
  canDelete,
  canResetPassword,
  onEdit,
  onDelete,
  onResetPassword,
}: {
  user: ManagedUser;

  canUpdate: boolean;

  canDelete: boolean;

  canResetPassword: boolean;

  onEdit: (
    user: ManagedUser
  ) => void;

  onDelete: (
    user: ManagedUser
  ) => void;

  onResetPassword: (
    user: ManagedUser
  ) => void;
}) {

  const initials =
    getInitials(
      user.name
    );


  return (

    <div
      className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_3px_14px_rgba(15,23,42,0.03)]
                dark:border-zinc-800
                dark:bg-zinc-950
                dark:shadow-none
            "
    >

      <div
        className="
                    flex
                    items-start
                    gap-3
                    p-4
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
                        rounded-full
                        bg-indigo-600
                        text-[11px]
                        font-bold
                        text-white
                    "
        >
          {initials}
        </div>


        <div
          className="
                        min-w-0
                        flex-1
                    "
        >

          <div
            className="
                            flex
                            items-center
                            justify-between
                            gap-2
                        "
          >

            <p
              className="
                                truncate
                                text-sm
                                font-bold
                                text-slate-900
                                dark:text-white
                            "
            >
              {user.name}
            </p>


            <RoleBadge
              role={
                user.role.name
              }
            />

          </div>


          <p
            className="
                            mt-1
                            truncate
                            text-[11px]
                            text-slate-500
                            dark:text-zinc-500
                        "
          >
            {user.email}
          </p>


          <p
            className="
                            mt-1
                            text-[10px]
                            text-slate-400
                            dark:text-zinc-600
                        "
          >
            Joined{" "}

            {new Date(
              user.createdAt
            ).toLocaleDateString(
              "en-IN"
            )}

          </p>

        </div>

      </div>


      {(canUpdate ||
        canResetPassword ||
        canDelete) && (

          <div
            className="
                        flex
                        gap-2
                        border-t
                        border-slate-100
                        px-4
                        py-3
                        dark:border-zinc-800
                    "
          >

            {/* EDIT */}

            {canUpdate && (

              <button
                type="button"
                onClick={() =>
                  onEdit(
                    user
                  )
                }
                className="
                                inline-flex
                                h-8
                                flex-1
                                items-center
                                justify-center
                                gap-1.5
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                text-[11px]
                                font-semibold
                                text-slate-600
                                transition
                                hover:bg-slate-50
                                dark:border-zinc-800
                                dark:bg-zinc-900
                                dark:text-zinc-400
                            "
              >

                <HiOutlinePencilSquare
                  className="
                                    h-3.5
                                    w-3.5
                                "
                />

                Edit

              </button>

            )}


            {/* RESET */}

            {canResetPassword && (

              <button
                type="button"
                onClick={() =>
                  onResetPassword(
                    user
                  )
                }
                className="
                                inline-flex
                                h-8
                                flex-1
                                items-center
                                justify-center
                                gap-1.5
                                rounded-lg
                                border
                                border-amber-100
                                bg-amber-50
                                text-[11px]
                                font-semibold
                                text-amber-600
                                transition
                                hover:bg-amber-100
                                dark:border-amber-500/20
                                dark:bg-amber-500/10
                                dark:text-amber-400
                            "
              >

                <HiOutlineKey
                  className="
                                    h-3.5
                                    w-3.5
                                "
                />

                Reset

              </button>

            )}


            {/* DELETE */}

            {canDelete && (

              <button
                type="button"
                onClick={() =>
                  onDelete(
                    user
                  )
                }
                className="
                                inline-flex
                                h-8
                                flex-1
                                items-center
                                justify-center
                                gap-1.5
                                rounded-lg
                                border
                                border-red-100
                                bg-red-50
                                text-[11px]
                                font-semibold
                                text-red-500
                                dark:border-red-900/30
                                dark:bg-red-950/20
                                dark:text-red-400
                            "
              >

                <HiOutlineTrash
                  className="
                                    h-3.5
                                    w-3.5
                                "
                />

                Delete

              </button>

            )}

          </div>

        )}

    </div>

  );
}


/* ================================================================
   ROLE BADGE
================================================================ */

function RoleBadge({
  role,
}: {
  role: string;
}) {

  const normalized =
    role.toUpperCase();


  const isAdmin =
    normalized.includes(
      "ADMIN"
    );


  return (

    <span
      className={`
                inline-flex
                shrink-0
                items-center
                rounded-full
                border
                px-2.5
                py-1
                text-[9px]
                font-bold
                uppercase
                tracking-[0.08em]

                ${isAdmin
          ? `
                            border-violet-100
                            bg-violet-50
                            text-violet-600
                            dark:border-violet-500/20
                            dark:bg-violet-500/10
                            dark:text-violet-400
                        `
          : `
                            border-indigo-100
                            bg-indigo-50
                            text-indigo-600
                            dark:border-indigo-500/20
                            dark:bg-indigo-500/10
                            dark:text-indigo-400
                        `
        }
            `}
    >
      {role}
    </span>

  );
}


/* ================================================================
   EMPTY USERS
================================================================ */

function EmptyUsers() {

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

        <HiOutlineUsers
          className="
                        h-6
                        w-6
                    "
        />

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
        No users found
      </h3>


      <p
        className="
                    mt-1
                    max-w-xs
                    text-xs
                    leading-5
                    text-slate-400
                    dark:text-zinc-600
                "
      >
        There are no team members to display yet.
      </p>

    </div>

  );
}


/* ================================================================
   SKELETON
================================================================ */

function UsersSkeleton() {

  return (

    <>

      {/* DESKTOP */}

      <div
        className="
                    hidden
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    sm:block
                    dark:border-zinc-800
                    dark:bg-zinc-950
                "
      >

        <div
          className="
                        h-12
                        animate-pulse
                        border-b
                        border-slate-200
                        bg-slate-50
                        dark:border-zinc-800
                        dark:bg-zinc-900
                    "
        />


        {Array.from({
          length: 4,
        }).map(
          (_, index) => (

            <div
              key={
                index
              }
              className="
                                flex
                                animate-pulse
                                items-center
                                gap-4
                                border-b
                                border-slate-100
                                px-5
                                py-4
                                last:border-0
                                dark:border-zinc-800
                            "
            >

              <div
                className="
                                    h-9
                                    w-9
                                    rounded-full
                                    bg-slate-200
                                    dark:bg-zinc-800
                                "
              />


              <div
                className="
                                    flex-1
                                    space-y-2
                                "
              >

                <div
                  className="
                                        h-3
                                        w-32
                                        rounded
                                        bg-slate-200
                                        dark:bg-zinc-800
                                    "
                />


                <div
                  className="
                                        h-2.5
                                        w-48
                                        rounded
                                        bg-slate-100
                                        dark:bg-zinc-900
                                    "
                />

              </div>


              <div
                className="
                                    h-6
                                    w-20
                                    rounded-full
                                    bg-slate-200
                                    dark:bg-zinc-800
                                "
              />

            </div>

          )
        )}

      </div>


      {/* MOBILE */}

      <div
        className="
                    flex
                    flex-col
                    gap-3
                    sm:hidden
                "
      >

        {Array.from({
          length: 4,
        }).map(
          (_, index) => (

            <div
              key={
                index
              }
              className="
                                flex
                                animate-pulse
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-4
                                dark:border-zinc-800
                                dark:bg-zinc-950
                            "
            >

              <div
                className="
                                    h-10
                                    w-10
                                    shrink-0
                                    rounded-full
                                    bg-slate-200
                                    dark:bg-zinc-800
                                "
              />


              <div
                className="
                                    flex-1
                                    space-y-2
                                "
              >

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
                                        w-36
                                        rounded
                                        bg-slate-100
                                        dark:bg-zinc-900
                                    "
                />

              </div>

            </div>

          )
        )}

      </div>

    </>

  );
}


/* ================================================================
   ERROR
================================================================ */

function UsersError({
  error,
  onRetry,
}: {
  error: unknown;

  onRetry: () => void;
}) {

  const axiosError =
    error as any;


  const status =
    axiosError?.response?.status;


  const message =
    axiosError?.response?.data?.message;


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

        <HiOutlineUsers
          className="
                        h-6
                        w-6
                    "
        />

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
        {
          status === 403
            ? "Access denied"
            : "Unable to load users"
        }
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
        {
          status === 403
            ? "You don't have permission to view team members."
            : (
              message ??
              "Something went wrong while loading users."
            )
        }
      </p>


      {status !== 403 && (

        <button
          type="button"
          onClick={
            onRetry
          }
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

  useEffect(
    () => {

      function handleKeyDown(
        event: KeyboardEvent
      ) {

        if (
          event.key ===
          "Escape"
        ) {

          onClose();

        }

      }


      document.addEventListener(
        "keydown",
        handleKeyDown
      );


      return () => {

        document.removeEventListener(
          "keydown",
          handleKeyDown
        );

      };

    },
    [
      onClose,
    ]
  );


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
      onMouseDown={
        (
          event
        ) => {

          if (
            event.target ===
            event.currentTarget
          ) {

            onClose();

          }

        }
      }
    >

      {children}

    </div>

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
  roles: Role[];

  loading: boolean;

  onClose: () => void;

  onSubmit: (
    payload: CreateUserPayload
  ) => void;
}) {

  const [
    name,
    setName,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    roleId,
    setRoleId,
  ] = useState("");


  function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();


    if (
      !name.trim()
    ) {

      toast.warning(
        "Enter user name."
      );

      return;

    }


    if (
      !email.trim()
    ) {

      toast.warning(
        "Enter email address."
      );

      return;

    }


    if (
      !roleId
    ) {

      toast.warning(
        "Select a role."
      );

      return;

    }


    onSubmit({

      name:
        name.trim(),

      email:
        email.trim(),

      roleId,

    });

  }


  return (

    <ModalBackdrop
      onClose={
        onClose
      }
    >

      <div
        className="
                    max-h-[92vh]
                    w-full
                    overflow-y-auto
                    rounded-t-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                    sm:max-w-md
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
              Add User
            </h2>


            <p
              className="
                                mt-1
                                text-xs
                                text-slate-500
                                dark:text-zinc-500
                            "
            >
              Create a new team member account.
            </p>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
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

            <HiOutlineXMark
              className="
                                h-5
                                w-5
                            "
            />

          </button>

        </div>


        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
                        space-y-4
                        p-5
                    "
        >

          <FormField
            label="Name"
          >

            <input
              className="input"
              value={
                name
              }
              onChange={
                (
                  event
                ) =>
                  setName(
                    event.target.value
                  )
              }
              placeholder="Enter name"
              autoFocus
            />

          </FormField>


          <FormField
            label="Email"
          >

            <input
              type="email"
              className="input"
              value={
                email
              }
              onChange={
                (
                  event
                ) =>
                  setEmail(
                    event.target.value
                  )
              }
              placeholder="you@company.com"
            />

          </FormField>


          <FormField
            label="Role"
          >

            <select
              className="input"
              value={
                roleId
              }
              onChange={
                (
                  event
                ) =>
                  setRoleId(
                    event.target.value
                  )
              }
            >

              <option value="">
                Select role
              </option>


              {roles.map(
                (
                  role
                ) => (

                  <option
                    key={
                      role.id
                    }
                    value={
                      role.id
                    }
                  >
                    {role.name}
                  </option>

                )
              )}

            </select>

          </FormField>


          {/* DEFAULT PASSWORD INFO */}

          <div
            className="
                            rounded-xl
                            border
                            border-blue-100
                            bg-blue-50
                            px-3.5
                            py-3
                            text-xs
                            leading-5
                            text-blue-700
                            dark:border-blue-500/20
                            dark:bg-blue-500/5
                            dark:text-blue-400
                        "
          >

            The account will be created with the
            system default password. The user can
            change it after signing in.

          </div>


          {/* ACTIONS */}

          <div
            className="
                            flex
                            flex-col-reverse
                            gap-2
                            border-t
                            border-slate-100
                            pt-4
                            dark:border-zinc-900
                            sm:flex-row
                            sm:justify-end
                        "
          >

            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                loading
              }
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
              disabled={
                loading
              }
              className="
                                btn-primary
                                w-full
                                text-xs
                                sm:w-auto
                            "
            >
              {
                loading
                  ? "Creating..."
                  : "Create User"
              }
            </button>

          </div>

        </form>

      </div>

    </ModalBackdrop>

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

  roles: Role[];

  loading: boolean;

  onClose: () => void;

  onSubmit: (
    payload: {
      name: string;
      email: string;
      roleId: string;
    }
  ) => void;
}) {

  const [
    name,
    setName,
  ] = useState(
    user.name
  );


  const [
    email,
    setEmail,
  ] = useState(
    user.email
  );


  const [
    roleId,
    setRoleId,
  ] = useState(
    user.roleId
  );


  function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();


    if (
      !name.trim()
    ) {

      toast.warning(
        "Enter user name."
      );

      return;

    }


    if (
      !email.trim()
    ) {

      toast.warning(
        "Enter email address."
      );

      return;

    }


    if (
      !roleId
    ) {

      toast.warning(
        "Select a role."
      );

      return;

    }


    onSubmit({

      name:
        name.trim(),

      email:
        email.trim(),

      roleId,

    });

  }


  return (

    <ModalBackdrop
      onClose={
        onClose
      }
    >

      <div
        className="
                    max-h-[92vh]
                    w-full
                    overflow-y-auto
                    rounded-t-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                    sm:max-w-md
                    sm:rounded-2xl
                    dark:border-zinc-800
                    dark:bg-zinc-950
                "
      >

        <div
          className="
                        flex
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
              Edit User
            </h2>


            <p
              className="
                                mt-1
                                text-xs
                                text-slate-500
                                dark:text-zinc-500
                            "
            >
              Update account details and role.
            </p>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="
                            inline-flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            text-slate-400
                            hover:bg-slate-100
                            dark:hover:bg-zinc-900
                        "
          >

            <HiOutlineXMark
              className="
                                h-5
                                w-5
                            "
            />

          </button>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="
                        space-y-4
                        p-5
                    "
        >

          <FormField
            label="Name"
          >

            <input
              className="input"
              value={
                name
              }
              onChange={
                (
                  event
                ) =>
                  setName(
                    event.target.value
                  )
              }
            />

          </FormField>


          <FormField
            label="Email"
          >

            <input
              type="email"
              className="input"
              value={
                email
              }
              onChange={
                (
                  event
                ) =>
                  setEmail(
                    event.target.value
                  )
              }
            />

          </FormField>


          <FormField
            label="Role"
          >

            <select
              className="input"
              value={
                roleId
              }
              onChange={
                (
                  event
                ) =>
                  setRoleId(
                    event.target.value
                  )
              }
            >

              <option value="">
                Select role
              </option>


              {roles.map(
                (
                  role
                ) => (

                  <option
                    key={
                      role.id
                    }
                    value={
                      role.id
                    }
                  >
                    {role.name}
                  </option>

                )
              )}

            </select>

          </FormField>


          <div
            className="
                            flex
                            flex-col-reverse
                            gap-2
                            border-t
                            border-slate-100
                            pt-4
                            dark:border-zinc-900
                            sm:flex-row
                            sm:justify-end
                        "
          >

            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                loading
              }
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
              disabled={
                loading
              }
              className="
                                btn-primary
                                w-full
                                text-xs
                                sm:w-auto
                            "
            >
              {
                loading
                  ? "Saving..."
                  : "Save Changes"
              }
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

function DeleteUserModal({
  user,
  loading,
  onClose,
  onConfirm,
}: {
  user: ManagedUser;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;
}) {

  return (

    <ModalBackdrop
      onClose={
        onClose
      }
    >

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

              <HiOutlineTrash
                className="
                                    h-5
                                    w-5
                                "
              />

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
                Delete user?
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

                Are you sure you want to
                delete{" "}

                <span
                  className="
                                        font-semibold
                                        text-slate-700
                                        dark:text-zinc-300
                                    "
                >
                  {user.name}
                </span>

                ?

              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
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
                            dark:hover:bg-zinc-900
                        "
          >

            <HiOutlineXMark
              className="
                                h-5
                                w-5
                            "
            />

          </button>

        </div>


        {/* ACTIONS */}

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
            onClick={
              onClose
            }
            disabled={
              loading
            }
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
            onClick={
              onConfirm
            }
            disabled={
              loading
            }
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
            {
              loading
                ? "Deleting..."
                : "Delete User"
            }
          </button>

        </div>

      </div>

    </ModalBackdrop>

  );
}


/* ================================================================
   RESET PASSWORD MODAL
================================================================ */

function ResetPasswordModal({
  user,
  loading,
  onClose,
  onConfirm,
}: {
  user: ManagedUser;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;
}) {

  return (

    <ModalBackdrop
      onClose={
        onClose
      }
    >

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

        <div
          className="
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
                                bg-amber-50
                                text-amber-600
                                dark:bg-amber-500/10
                                dark:text-amber-400
                            "
            >

              <HiOutlineKey
                className="
                                    h-5
                                    w-5
                                "
              />

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
                Reset password?
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

                This will reset{" "}

                <span
                  className="
                                        font-semibold
                                        text-slate-700
                                        dark:text-zinc-300
                                    "
                >
                  {user.name}
                </span>

                {" "}to the system default password.

              </p>

            </div>

          </div>


          <div
            className="
                            mt-4
                            rounded-lg
                            border
                            border-amber-200
                            bg-amber-50
                            px-3
                            py-2.5
                            text-xs
                            leading-5
                            text-amber-700
                            dark:border-amber-500/20
                            dark:bg-amber-500/5
                            dark:text-amber-400
                        "
          >

            The user will need to use the
            default password after the reset.

          </div>

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
            onClick={
              onClose
            }
            disabled={
              loading
            }
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
            onClick={
              onConfirm
            }
            disabled={
              loading
            }
            className="
                            inline-flex
                            h-9
                            w-full
                            items-center
                            justify-center
                            rounded-lg
                            bg-amber-500
                            px-4
                            text-xs
                            font-semibold
                            text-white
                            transition
                            hover:bg-amber-600
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:w-auto
                        "
          >

            {
              loading
                ? "Resetting..."
                : "Reset Password"
            }

          </button>

        </div>

      </div>

    </ModalBackdrop>

  );
}


/* ================================================================
   FORM FIELD
================================================================ */

function FormField({
  label,
  children,
}: {
  label: string;

  children: React.ReactNode;
}) {

  return (

    <div>

      <label
        className="
                    mb-1.5
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-slate-500
                    dark:text-zinc-500
                "
      >
        {label}
      </label>


      {children}

    </div>

  );
}