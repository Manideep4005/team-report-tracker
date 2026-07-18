import {
    HiOutlineSquares2X2,
    HiOutlineClock,
    HiOutlineXMark,
    HiOutlineUserGroup,
} from "react-icons/hi2";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

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
    if (!name) return avatarColors[0];

    const hash = [...name].reduce(
        (sum, char) => sum + char.charCodeAt(0),
        0
    );

    return avatarColors[hash % avatarColors.length];
}

export default function Sidebar({
    open,
    onClose,
}: SidebarProps) {
    const { user } = useAuth();

    const initials = getInitials(user?.name);
    const avatarColor = getAvatarColor(user?.name);

    useEffect(() => {
        document.body.style.overflow = open
            ? "hidden"
            : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const linkClass = ({
        isActive,
    }: {
        isActive: boolean;
    }) =>
        `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        }`;

    return (
        <>
            {/* Mobile Overlay */}

            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-500 ease-out lg:hidden ${open
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                    }`}
            />

            {/* Mobile Sidebar */}

            <div
                className={`fixed inset-y-0 left-0 z-50 lg:hidden ${open
                    ? "pointer-events-auto"
                    : "pointer-events-none"
                    }`}
            >
                <aside
                    className={`flex h-full w-64 max-w-[80vw] flex-col border-r border-slate-200 bg-white shadow-2xl transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-slate-800 dark:bg-slate-950 ${open
                        ? "translate-x-0"
                        : "-translate-x-full"
                        }`}
                >
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                                <HiOutlineUserGroup size={22} />
                            </div>

                            <div>

                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Team Work
                                </h2>

                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Report Tracker
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-200 hover:rotate-90 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            <HiOutlineXMark size={18} />
                        </button>

                    </div>

                    <nav
                        className={`flex-1 space-y-2 p-4 transition-all duration-500 ${open
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                            }`}
                    >
                        <NavLink
                            to="/dashboard"
                            className={linkClass}
                            onClick={onClose}
                        >
                            <HiOutlineSquares2X2 size={20} />
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/history"
                            className={linkClass}
                            onClick={onClose}
                        >
                            <HiOutlineClock size={20} />
                            My Reports
                        </NavLink>

                    </nav>

                    <div
                        className={`border-t border-slate-200 p-4 transition-all duration-500 dark:border-slate-800 ${open
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                            }`}
                    >
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">

                            <div className="flex items-center gap-3">

                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-full ${avatarColor} text-sm font-bold tracking-wide text-white`}
                                >
                                    {initials}
                                </div>

                                <div className="min-w-0">

                                    <p className="truncate font-medium text-slate-900 dark:text-white">
                                        {user?.name}
                                    </p>

                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                        {user?.email}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </aside>

            </div>

            {/* Desktop Sidebar */}            {/* Desktop Sidebar */}

            <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex">

                <div className="flex h-[72px] items-center border-b border-slate-200 px-5 dark:border-slate-800">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                            <HiOutlineUserGroup size={22} />
                        </div>

                        <div>

                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Team Work
                            </h2>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Report Tracker
                            </p>

                        </div>

                    </div>

                </div>

                <nav className="flex-1 space-y-2 p-4">

                    <NavLink
                        to="/dashboard"
                        className={linkClass}
                    >
                        <HiOutlineSquares2X2 size={20} />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/history"
                        className={linkClass}
                    >
                        <HiOutlineClock size={20} />
                        My Reports
                    </NavLink>

                </nav>


            </aside>

        </>
    );
}