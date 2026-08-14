import {
    HiOutlineSquares2X2,
    HiOutlineClock,
    HiOutlineXMark,
    HiOutlineUserGroup,
    HiOutlineUsers,
    HiOutlineShieldCheck,
    HiOutlineDocumentText,
    HiOutlineArrowRightOnRectangle,
    HiOutlineKey,
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
    const {
        user,
        hasPermission,
    } = useAuth();

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
        `group flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 ${isActive
            ? "bg-slate-900/5 text-slate-900 ring-1 ring-slate-900/10 dark:bg-zinc-800/60 dark:text-zinc-100 dark:ring-zinc-800"
            : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900/40 dark:hover:text-zinc-200"
        }`;

    return (
        <>
            {/* Mobile Overlay */}

            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/10 backdrop-blur-sm transition-all duration-300 ease-out lg:hidden ${open
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
                    className={`flex h-full w-64 max-w-[80vw] flex-col border-r border-slate-200/60 bg-white/95 shadow-xl transform-gpu backdrop-blur-md transition-transform duration-300 ease-out dark:border-zinc-800/60 dark:bg-zinc-950/95 ${open
                        ? "translate-x-0"
                        : "-translate-x-full"
                        }`}
                >
                    <div className="flex h-16 items-center justify-between border-b border-slate-200/50 px-5 dark:border-zinc-800/50">

                        <div className="flex items-center gap-2.5">

                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                                <HiOutlineUserGroup size={16} />
                            </div>

                            <div>

                                <h2 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                                    Team Work
                                </h2>

                                <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                                    Report Tracker
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/50 text-slate-500 transition-all duration-200 hover:rotate-90 hover:bg-slate-100 dark:border-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        >
                            <HiOutlineXMark size={16} />
                        </button>

                    </div>

                    <nav
                        className={`flex-1 space-y-1.5 p-4 transition-all duration-300 ${open
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                            }`}
                    >
                        <NavLink
                            to="/dashboard"
                            className={linkClass}
                            onClick={onClose}
                        >
                            <HiOutlineSquares2X2 size={16} />
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/history"
                            className={linkClass}
                            onClick={onClose}
                        >
                            <HiOutlineClock size={16} />
                            My Reports
                        </NavLink>

                        {hasPermission("REPORT_VIEW_ALL") && (
                            <NavLink
                                to="/reports"
                                className={linkClass}
                                onClick={onClose}
                            >
                                <HiOutlineDocumentText size={16} />
                                All Reports
                            </NavLink>
                        )}

                        {hasPermission("USER_VIEW") && (
                            <NavLink
                                to="/users"
                                className={linkClass}
                                onClick={onClose}
                            >
                                <HiOutlineUsers size={16} />
                                Users
                            </NavLink>
                        )}

                        {hasPermission("ROLE_VIEW") && (
                            <NavLink
                                to="/roles"
                                className={linkClass}
                                onClick={onClose}
                            >
                                <HiOutlineShieldCheck size={16} />
                                Roles
                            </NavLink>
                        )}

                        {hasPermission("PERMISSION_VIEW") && (
                            <NavLink
                                to="/permissions"
                                className={linkClass}
                                onClick={onClose}
                            >
                                <HiOutlineKey size={16} />
                                Permissions
                            </NavLink>
                        )}

                        {hasPermission("LOGIN_HISTORY_VIEW") && (
                            <NavLink
                                to="/login-history"
                                className={linkClass}
                                onClick={onClose}
                            >
                                <HiOutlineArrowRightOnRectangle size={16} />
                                Login History
                            </NavLink>
                        )}

                    </nav>

                    <div
                        className={`border-t border-slate-200/50 p-4 transition-all duration-300 dark:border-zinc-800/50 ${open
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                            }`}
                    >
                        <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-3.5 dark:border-zinc-800/60 dark:bg-zinc-900/30">

                            <div className="flex items-center gap-2.5">

                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarColor} text-xs font-bold text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10`}
                                >
                                    {initials}
                                </div>

                                <div className="min-w-0">

                                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                        {user?.name}
                                    </p>

                                    <p className="truncate text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                                        {user?.email}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </aside>

            </div>

            {/* Desktop Sidebar */}

            <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-slate-200/50 bg-slate-50/10 dark:border-zinc-800/40 dark:bg-zinc-950/10 lg:flex">

                <div className="flex h-16 items-center border-b border-slate-200/50 px-5 dark:border-zinc-800/40">

                    <div className="flex items-center gap-2.5">

                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                            <HiOutlineUserGroup size={16} />
                        </div>

                        <div>

                            <h2 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                                Team Work
                            </h2>

                            <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                                Report Tracker
                            </p>

                        </div>

                    </div>

                </div>

                <nav className="flex-1 space-y-1.5 p-4">

                    <NavLink
                        to="/dashboard"
                        className={linkClass}
                    >
                        <HiOutlineSquares2X2 size={16} />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/history"
                        className={linkClass}
                    >
                        <HiOutlineClock size={16} />
                        My Reports
                    </NavLink>

                    {hasPermission("REPORT_VIEW_ALL") && (
                        <NavLink
                            to="/reports"
                            className={linkClass}
                            onClick={onClose}
                        >
                            <HiOutlineDocumentText size={16} />
                            All Reports
                        </NavLink>
                    )}

                    {hasPermission("USER_VIEW") && (
                        <NavLink
                            to="/users"
                            className={linkClass}
                            onClick={onClose}
                        >
                            <HiOutlineUsers size={16} />
                            Users
                        </NavLink>
                    )}


                    {hasPermission("ROLE_VIEW") && (
                        <NavLink
                            to="/roles"
                            className={linkClass}
                            onClick={onClose}
                        >
                            <HiOutlineShieldCheck size={16} />
                            Roles
                        </NavLink>
                    )}

                    {hasPermission("PERMISSION_VIEW") && (
                        <NavLink
                            to="/permissions"
                            className={linkClass}
                            onClick={onClose}
                        >
                            <HiOutlineKey size={16} />
                            Permissions
                        </NavLink>
                    )}

                    {hasPermission("LOGIN_HISTORY_VIEW") && (
                        <NavLink
                            to="/login-history"
                            className={linkClass}
                            onClick={onClose}
                        >
                            <HiOutlineArrowRightOnRectangle size={16} />
                            Login History
                        </NavLink>
                    )}

                </nav>


            </aside>

        </>
    );
}