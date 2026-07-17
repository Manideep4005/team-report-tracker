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

export default function Sidebar({
    open,
    onClose,
}: SidebarProps) {
    const { user } = useAuth();

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
        `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        }`;

    return (
        <>
            {/* Mobile Overlay */}

            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden ${open
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0"
                    }`}
            />

            {/* Mobile Sidebar */}

            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-64 max-w-[80vw] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out will-change-transform dark:border-slate-800 dark:bg-slate-950 lg:hidden ${open
                    ? "translate-x-0"
                    : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-5 sm:py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 sm:h-11 sm:w-11">
                            <HiOutlineUserGroup size={20} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                                Team Work
                            </h2>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Report Tracker
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <HiOutlineXMark size={18} />
                    </button>
                </div>

                <nav className="flex-1 space-y-2 p-3 sm:p-4">
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

                <div className="border-t border-slate-200 p-3 dark:border-slate-800 sm:p-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white sm:h-11 sm:w-11">
                                {user?.name
                                    ?.charAt(0)
                                    .toUpperCase()}
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

            {/* Desktop Sidebar */}

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