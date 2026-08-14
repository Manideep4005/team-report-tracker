import type { User } from "../services/auth";

export function hasPermission(
    user: User | null,
    permission: string
): boolean {
    if (!user?.role?.permissions) {
        return false;
    }

    return user.role.permissions.some(
        (item) => item.code === permission
    );
}

export function hasAnyPermission(
    user: User | null,
    permissions: string[]
): boolean {
    return permissions.some((permission) =>
        hasPermission(user, permission)
    );
}

export function hasAllPermissions(
    user: User | null,
    permissions: string[]
): boolean {
    return permissions.every((permission) =>
        hasPermission(user, permission)
    );
}