import {
    HiOutlineSquares2X2,
    HiOutlineClock,
    HiOutlineArrowRightOnRectangle,
    HiOutlineXMark,
} from "react-icons/hi2";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { HiOutlineUserGroup } from "react-icons/hi2";

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({
    open,
    onClose,
}: SidebarProps) {
    const { logout, user } = useAuth();

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`;

    return (
        <>
            {/* Overlay */}

            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${open
                    ? "visible opacity-100"
                    : "invisible opacity-0"
                    }`}
            />

            {/* Sidebar */}

            <aside
                className={`fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-200 ease-out ${open
                    ? "translate-x-0"
                    : "-translate-x-full"
                    } lg:translate-x-0`}
            >

                {/* Brand */}

                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/30">
                            <HiOutlineUserGroup size={22} />
                        </div>

                        <h2 className="text-lg font-semibold tracking-tight text-white">
                            Team Work
                        </h2>

                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <HiOutlineXMark size={18} />
                    </button>

                </div>

                {/* Navigation */}

                <nav className="flex-1 space-y-3 p-4">

                    <NavLink
                        to="/dashboard"
                        className={linkClass}
                        onClick={onClose}
                    >
                        <HiOutlineSquares2X2
                            size={20}
                            className="transition-transform group-hover:scale-110"
                        />

                        Home
                    </NavLink>

                    <NavLink
                        to="/history"
                        className={linkClass}
                        onClick={onClose}
                    >
                        <HiOutlineClock
                            size={20}
                            className="transition-transform group-hover:scale-110"
                        />

                        My Reports
                    </NavLink>

                </nav>

                {/* User */}

                <div className="border-t border-slate-800 p-4">

                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>

                        <p className="truncate text-sm font-medium text-white">
                            {user?.name}
                        </p>

                    </div>

                    <button
                        onClick={() => {
                            logout();
                            onClose();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-600 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
                    >
                        <HiOutlineArrowRightOnRectangle size={18} />

                        Logout
                    </button>

                </div>

            </aside>
        </>
    );
}