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
        email: string,
        password: string
    ) => Promise<void>;

    logout: () => Promise<void>;

    updateUser: (user: User) => void;

    hasPermission: (
        permission: string
    ) => boolean;

    hasAnyPermission: (
        permissions: string[]
    ) => boolean;

    hasAllPermissions: (
        permissions: string[]
    ) => boolean;

    loading: boolean;
}

const AuthContext = createContext({} as Context);

export function AuthProvider({

    children,

}: {

    children: ReactNode

}) {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await auth.me();
                setUser(response.user);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, []);

    async function login(

        email: string,

        password: string

    ) {

        const response = await auth.login({

            email,

            password,

        });

        setUser(response.user);

    }

    async function logout() {

        await auth.logout();

        setUser(null);

    }

    function updateUser(user: User) {
        setUser(user);
    }

    function checkPermission(
        permission: string
    ) {
        return hasPermission(
            user,
            permission
        );
    }

    function checkAnyPermission(
        permissions: string[]
    ) {
        return hasAnyPermission(
            user,
            permissions
        );
    }

    function checkAllPermissions(
        permissions: string[]
    ) {
        return hasAllPermissions(
            user,
            permissions
        );
    }

    return (

        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                updateUser,
                hasPermission: checkPermission,
                hasAnyPermission: checkAnyPermission,
                hasAllPermissions: checkAllPermissions,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>

    )

}

export function useAuth() {

    return useContext(AuthContext);

}