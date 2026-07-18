import {
    createContext,
    useContext,
    useLayoutEffect,
    useMemo,
    useState,
    useEffect,
    type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

function getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    // useLayoutEffect runs synchronously before the browser paints,
    // so the class is applied before the user sees anything —
    // no flash of the wrong theme.
    useLayoutEffect(() => {
        const root = document.documentElement;

        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    // Keep theme in sync if changed in another tab
    useEffect(() => {
        function handleStorage(e: StorageEvent) {
            if (e.key === "theme" && (e.newValue === "light" || e.newValue === "dark")) {
                setThemeState(e.newValue);
            }
        }

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    function toggleTheme() {
        const root = document.documentElement;

        root.classList.add("theme-transition");

        setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

        window.setTimeout(() => {
            root.classList.remove("theme-transition");
        }, 200);
    }
    function setTheme(theme: Theme) {
        const root = document.documentElement;

        root.classList.add("theme-transition");

        setThemeState(theme);

        window.setTimeout(() => {
            root.classList.remove("theme-transition");
        }, 200);
    }
    const value = useMemo(
        () => ({
            theme,
            toggleTheme,
            setTheme,
        }),
        [theme]
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
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return context;
}