import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";

import * as auth from "../services/auth";

interface User {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Context {
    user: User | null;

    login: (
        email: string,
        password: string
    ) => Promise<void>;

    logout: () => Promise<void>;

    updateUser: (user: User) => void;

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

    return (

        <AuthContext.Provider

            value={{

                user,

                login,

                logout,

                updateUser,

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