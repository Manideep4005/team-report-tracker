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

const avatarColors = [
    "bg-blue-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-cyan-600",
    "bg-indigo-600",
    "bg-teal-600",
];

function getInitials(name?: string) {
    if (!name) return "";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function getAvatarColor(name?: string) {
    if (!name) return "bg-blue-600";

    const hash = [...name].reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0
    );

    return avatarColors[hash % avatarColors.length];
}

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({
    onMenuClick,
}: HeaderProps) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const hour = new Date().getHours();

    const greeting =
        hour < 12
            ? "Good Morning"
            : hour < 17
                ? "Good Afternoon"
                : "Good Evening";

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });


    const initials = getInitials(user?.name);
    const avatarColor = getAvatarColor(user?.name);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

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
        setOpen(false);
        await logout();
        navigate("/");
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/70 px-4 backdrop-blur-md transition-all dark:border-zinc-800/40 dark:bg-zinc-950/70 sm:px-6 lg:px-8">
            {/* Left */}
            <div className="flex min-w-0 items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:hidden"
                >
                    <HiOutlineBars3 size={20} />
                </button>

                <div className="min-w-0">
                    <h1 className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-base">
                        {greeting},{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text font-bold text-transparent dark:from-blue-400 dark:to-indigo-400">
                            {user?.name?.split(" ")[0]}
                        </span>
                    </h1>

                    <p className="truncate text-[11px] font-medium text-slate-400 dark:text-zinc-500 sm:text-xs">
                        {today}
                    </p>
                </div>
            </div>

            {/* Right */}
            <div
                ref={dropdownRef}
                className="relative shrink-0"
            >
                <div
                    onClick={() => setOpen((p) => !p)}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200/50 bg-slate-50/50 p-1 pr-3 transition hover:bg-slate-100/70 dark:border-zinc-800/50 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/70"
                >
                    <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${avatarColor} text-xs font-bold text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10`}
                    >
                        {initials}
                    </div>

                    <span className="hidden text-xs font-semibold text-slate-700 dark:text-zinc-300 sm:block">
                        {user?.name}
                    </span>

                    <HiOutlineChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                </div>

                {open && (
                    <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-72 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-lg shadow-black/[0.04] transition-all dark:border-zinc-800/80 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 dark:border-zinc-800/50">
                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${avatarColor} text-sm font-bold text-white`}
                            >
                                {initials}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {user?.name}
                                </p>

                                <p className="truncate text-xs text-slate-400 dark:text-zinc-500">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        <div className="p-1.5">
                            <button
                                onClick={toggleTheme}
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                            >
                                <div className="flex items-center gap-2.5">
                                    {theme === "dark" ? (
                                        <HiOutlineMoon size={16} className="text-zinc-400" />
                                    ) : (
                                        <HiOutlineSun size={16} className="text-zinc-400" />
                                    )}

                                    <span>Dark Mode</span>
                                </div>

                                <div
                                    className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${theme === "dark"
                                        ? "bg-zinc-950 ring-1 ring-zinc-800"
                                        : "bg-slate-200"
                                        }`}
                                >
                                    <div
                                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${theme === "dark"
                                            ? "left-[18px] dark:bg-zinc-200"
                                            : "left-0.5"
                                            }`}
                                    />
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    setOpen(false);
                                    navigate("/settings");
                                }}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                            >
                                <HiOutlineCog6Tooth size={16} className="text-zinc-400" />
                                Change Password
                            </button>

                            <div className="my-1 border-t border-slate-100 dark:border-zinc-800/50" />

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                            >
                                <HiOutlineArrowRightOnRectangle
                                    size={16}
                                />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}