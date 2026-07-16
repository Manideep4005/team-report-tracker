import {
    HiOutlineSquares2X2,
    HiOutlineClock,
    HiOutlineArrowRightOnRectangle,
    HiOutlineXMark,
} from "react-icons/hi2";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({
    open,
    onClose,
}: SidebarProps) {
    const { logout } = useAuth();

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`;

    return (
        <>
            {/* Overlay */}

            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/60 transition-all duration-300 lg:hidden ${open
                        ? "visible opacity-100"
                        : "invisible opacity-0"
                    }`}
            />

            {/* Sidebar */}

            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-60 flex-col border-r border-slate-800 bg-[#0f172a] transition-transform duration-300 ease-out ${open
                        ? "translate-x-0"
                        : "-translate-x-full"
                    } lg:translate-x-0`}
            >

                {/* Logo */}

                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">

                    <div>

                        <h1 className="text-xl font-bold tracking-tight text-white">
                            Team Work
                        </h1>

                        <p className="mt-1 text-xs text-slate-500">
                            Daily Tracker
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <HiOutlineXMark size={20} />
                    </button>

                </div>

                {/* Menu */}

                <nav className="flex-1 space-y-2 p-3">

                    <NavLink
                        to="/dashboard"
                        className={linkClass}
                        onClick={onClose}
                    >
                        <HiOutlineSquares2X2
                            size={19}
                            className="transition-transform group-hover:scale-110"
                        />

                        Dashboard

                    </NavLink>

                    <NavLink
                        to="/history"
                        className={linkClass}
                        onClick={onClose}
                    >
                        <HiOutlineClock
                            size={19}
                            className="transition-transform group-hover:scale-110"
                        />

                        History

                    </NavLink>

                </nav>

                {/* Footer */}

                <div className="border-t border-slate-800 p-3">

                    <button
                        onClick={() => {
                            logout();
                            onClose();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700"
                    >
                        <HiOutlineArrowRightOnRectangle size={18} />

                        Logout

                    </button>

                </div>

            </aside>
        </>
    );
}