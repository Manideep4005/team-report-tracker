
import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";

import * as auth from "../services/auth";

import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
} from "../utils/permissions";

import type { User } from "../services/auth";

interface Context {
    user: User | null;

    login: (
        identifier: string,
        password: string,
    ) => Promise<void>;

    logout: () => Promise<void>;

    updateUser: (user: User) => void;

    refreshUser: () => Promise<void>;

    hasPermission: (permission: string) => boolean;

    hasAnyPermission: (permissions: string[]) => boolean;

    hasAllPermissions: (permissions: string[]) => boolean;

    loading: boolean;
}

const AuthContext = createContext({} as Context);

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    /*
     * Load the authenticated user from the backend.
     */
    async function loadUser() {
        try {
            const response = await auth.me();
            setUser(response.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    /*
     * Load the session when the application starts.
     */
    useEffect(() => {
        void loadUser();
    }, []);

    /*
     * Login using either username or email.
     */
    async function login(
        identifier: string,
        password: string,
    ): Promise<void> {
        const response = await auth.login({
            identifier: identifier.trim(),
            password,
        });

        setUser(response.user);
    }

    /*
     * Logout the current user.
     */
    async function logout(): Promise<void> {
        await auth.logout();
        setUser(null);
    }

    /*
     * Update the authenticated user in context.
     */
    function updateUser(user: User): void {
        setUser(user);
    }

    /*
     * Refresh the current user's details and permissions.
     */
    async function refreshUser(): Promise<void> {
        try {
            const response = await auth.me();
            setUser(response.user);
        } catch {
            setUser(null);
        }
    }

    /*
     * Permission checks.
     */
    function checkPermission(permission: string): boolean {
        return hasPermission(user, permission);
    }

    function checkAnyPermission(
        permissions: string[],
    ): boolean {
        return hasAnyPermission(user, permissions);
    }

    function checkAllPermissions(
        permissions: string[],
    ): boolean {
        return hasAllPermissions(user, permissions);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                updateUser,
                refreshUser,
                hasPermission: checkPermission,
                hasAnyPermission: checkAnyPermission,
                hasAllPermissions: checkAllPermissions,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
