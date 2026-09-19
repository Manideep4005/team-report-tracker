import {
    createContext,
    useContext,
    useLayoutEffect,
    useMemo,
    useState,
    useEffect,
    type ReactNode,
} from "react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
    /**
     * User's selected preference.
     * Can be light, dark, or system.
     */
    theme: ThemePreference;

    /**
     * Actual theme currently applied to the application.
     * Always light or dark.
     */
    resolvedTheme: ResolvedTheme;

    toggleTheme: () => void;

    setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(
    undefined
);

interface ThemeProviderProps {
    children: ReactNode;
}

function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") {
        return "light";
    }

    return window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches
        ? "dark"
        : "light";
}

function getInitialTheme(): ThemePreference {
    if (typeof window === "undefined") {
        return "system";
    }

    const savedTheme =
        localStorage.getItem("theme") as ThemePreference | null;

    if (
        savedTheme === "light" ||
        savedTheme === "dark" ||
        savedTheme === "system"
    ) {
        return savedTheme;
    }

    return "system";
}

function getResolvedTheme(
    theme: ThemePreference
): ResolvedTheme {
    if (theme === "system") {
        return getSystemTheme();
    }

    return theme;
}

export function ThemeProvider({
    children,
}: ThemeProviderProps) {
    const [theme, setThemeState] =
        useState<ThemePreference>(getInitialTheme);

    const [resolvedTheme, setResolvedTheme] =
        useState<ResolvedTheme>(() =>
            getResolvedTheme(getInitialTheme())
        );

    /*
     * Apply the resolved theme to <html>.
     */
    useLayoutEffect(() => {
        const root = document.documentElement;

        const actualTheme = getResolvedTheme(theme);

        setResolvedTheme(actualTheme);

        if (actualTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    /*
     * When "System" is selected, automatically react
     * if the operating system theme changes.
     */
    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        function handleSystemThemeChange() {
            if (theme !== "system") {
                return;
            }

            const actualTheme = mediaQuery.matches
                ? "dark"
                : "light";

            setResolvedTheme(actualTheme);

            const root = document.documentElement;

            if (actualTheme === "dark") {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        }

        mediaQuery.addEventListener(
            "change",
            handleSystemThemeChange
        );

        return () => {
            mediaQuery.removeEventListener(
                "change",
                handleSystemThemeChange
            );
        };
    }, [theme]);

    /*
     * Keep theme in sync between browser tabs.
     */
    useEffect(() => {
        function handleStorage(e: StorageEvent) {
            if (
                e.key === "theme" &&
                (
                    e.newValue === "light" ||
                    e.newValue === "dark" ||
                    e.newValue === "system"
                )
            ) {
                setThemeState(e.newValue);
            }
        }

        window.addEventListener(
            "storage",
            handleStorage
        );

        return () => {
            window.removeEventListener(
                "storage",
                handleStorage
            );
        };
    }, []);

    /*
     * Simple toggle support for any other component
     * that may still use toggleTheme().
     *
     * light -> dark -> light
     *
     * If currently using system, toggle to dark.
     */
    function toggleTheme() {
        setThemeState((prev) => {
            if (prev === "light") {
                return "dark";
            }

            if (prev === "dark") {
                return "light";
            }

            return "dark";
        });
    }

    /*
     * Set user's preferred theme.
     */
    function setTheme(nextTheme: ThemePreference) {
        const root = document.documentElement;

        root.classList.add("theme-transition");

        setThemeState(nextTheme);

        window.setTimeout(() => {
            root.classList.remove("theme-transition");
        }, 200);
    }

    const value = useMemo(
        () => ({
            theme,
            resolvedTheme,
            toggleTheme,
            setTheme,
        }),
        [
            theme,
            resolvedTheme,
        ]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
}
