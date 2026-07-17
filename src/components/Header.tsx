import { useEffect, useRef, useState } from "react";
import {
    HiOutlineBars3,
    HiOutlineCog6Tooth,
    HiOutlineArrowRightOnRectangle,
    HiOutlineChevronDown,
    HiOutlineMoon,
    HiOutlineSun,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({
    onMenuClick,
}: HeaderProps) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const navigate = useNavigate();

    const [open, setOpen] =
        useState(false);

    const dropdownRef =
        useRef<HTMLDivElement>(null);

    const hour = new Date().getHours();

    const greeting =
        hour < 12
            ? "Good Morning"
            : hour < 17
                ? "Good Afternoon"
                : "Good Evening";

    const today =
        new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );

    useEffect(() => {
        function handleClickOutside(
            event: MouseEvent
        ) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target as Node
                )
            ) {
                setOpen(false);
            }
        }

        function handleEscape(
            event: KeyboardEvent
        ) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    return (
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl transition-colors dark:border-slate-800 dark:bg-slate-950/90 sm:px-6 lg:px-8">

            {/* Left */}

            <div className="flex items-center gap-3">

                <button
                    onClick={onMenuClick}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
                >
                    <HiOutlineBars3 size={22} />
                </button>

                <div>

                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                        👋 {greeting},{" "}
                        <span className="text-blue-600 dark:text-blue-400">
                            {user?.name?.split(" ")[0]}
                        </span>
                    </h1>

                    <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                        {today}
                    </p>

                </div>

            </div>

            {/* Right */}

            <div
                ref={dropdownRef}
                className="relative"
            >

                <button
                    onClick={() =>
                        setOpen((p) => !p)
                    }
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-2 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                >

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        {user?.name
                            ?.charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className="hidden text-left lg:block">

                        <p className="max-w-36 truncate text-sm font-medium text-slate-900 dark:text-white">
                            {user?.name}
                        </p>

                        <p className="max-w-36 truncate text-xs text-slate-500 dark:text-slate-400">
                            {user?.email}
                        </p>

                    </div>

                    <HiOutlineChevronDown
                        size={18}
                        className={`text-slate-500 transition-transform ${open
                                ? "rotate-180"
                                : ""
                            }`}
                    />

                </button>

                {open && (

                    <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

                        <div className="flex items-center gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800">

                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                                {user?.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="min-w-0">

                                <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                                    {user?.name}
                                </p>

                                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                    {user?.email}
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={toggleTheme}
                            className="flex w-full items-center justify-between px-5 py-4 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >

                            <div className="flex items-center gap-3">

                                {theme ===
                                    "dark" ? (
                                    <HiOutlineMoon
                                        size={20}
                                    />
                                ) : (
                                    <HiOutlineSun
                                        size={20}
                                    />
                                )}

                                <span>
                                    {theme ===
                                        "dark"
                                        ? "Dark Mode"
                                        : "Light Mode"}
                                </span>

                            </div>

                            <div
                                className={`relative h-6 w-11 rounded-full ${theme ===
                                        "dark"
                                        ? "bg-blue-600"
                                        : "bg-slate-300"
                                    }`}
                            >

                                <div
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${theme ===
                                            "dark"
                                            ? "left-[22px]"
                                            : "left-0.5"
                                        }`}
                                />

                            </div>

                        </button>

                        <button
                            onClick={() => {
                                setOpen(false);
                                navigate(
                                    "/settings"
                                );
                            }}
                            className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <HiOutlineCog6Tooth
                                size={20}
                            />
                            Profile Settings
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 border-t border-slate-200 px-5 py-4 text-left text-sm text-red-600 transition hover:bg-red-600 hover:text-white dark:border-slate-800 dark:text-red-400"
                        >
                            <HiOutlineArrowRightOnRectangle
                                size={20}
                            />
                            Logout
                        </button>

                    </div>

                )}

            </div>

        </header>
    );
}