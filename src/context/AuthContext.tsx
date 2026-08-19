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

    /*
     * Update the currently authenticated user
     * inside AuthContext.
     */
    updateUser: (
        user: User
    ) => void;

    /*
     * Re-fetch the currently authenticated user
     * from the backend.
     *
     * This is important after role/permission changes.
     */
    refreshUser: () => Promise<void>;

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


const AuthContext =
    createContext({} as Context);


export function AuthProvider({

    children,

}: {

    children: ReactNode;

}) {

    const [
        user,
        setUser,
    ] = useState<User | null>(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    /*
     * =========================================================
     * LOAD USER
     * =========================================================
     */

    async function loadUser() {

        try {

            const response =
                await auth.me();

            setUser(
                response.user
            );

        } catch {

            setUser(null);

        } finally {

            setLoading(false);

        }
    }


    /*
     * =========================================================
     * INITIAL LOAD
     * =========================================================
     */

    useEffect(() => {

        loadUser();

    }, []);


    /*
     * =========================================================
     * LOGIN
     * =========================================================
     */

    async function login(

        email: string,

        password: string

    ) {

        const response =
            await auth.login({

                email,

                password,

            });


        setUser(
            response.user
        );

    }


    /*
     * =========================================================
     * LOGOUT
     * =========================================================
     */

    async function logout() {

        await auth.logout();

        setUser(null);

    }


    /*
     * =========================================================
     * UPDATE USER
     * =========================================================
     */

    function updateUser(
        user: User
    ) {

        setUser(user);

    }


    /*
     * =========================================================
     * REFRESH CURRENT USER
     *
     * Used when role/permission changes.
     * =========================================================
     */

    async function refreshUser() {

        try {

            const response =
                await auth.me();

            setUser(
                response.user
            );

        } catch {

            /*
             * If the current session is no longer valid,
             * clear the authenticated user.
             */

            setUser(null);

        }

    }


    /*
     * =========================================================
     * PERMISSION CHECKS
     * =========================================================
     */

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


    /*
     * =========================================================
     * PROVIDER
     * =========================================================
     */

    return (

        <AuthContext.Provider
            value={{

                user,

                login,

                logout,

                updateUser,

                refreshUser,

                hasPermission:
                    checkPermission,

                hasAnyPermission:
                    checkAnyPermission,

                hasAllPermissions:
                    checkAllPermissions,

                loading,

            }}
        >

            {children}

        </AuthContext.Provider>

    );

}


export function useAuth() {

    return useContext(
        AuthContext
    );

}