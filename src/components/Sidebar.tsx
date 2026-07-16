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
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${open
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                    }`}
            />

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-800 bg-[#111827] transition-transform duration-300 ease-in-out
                ${open
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                lg:translate-x-0`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 p-6">

                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Team Work
                        </h1>

                        <p className="mt-1 text-sm text-slate-400">
                            Daily Work Reports
                        </p>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <HiOutlineXMark size={22} />
                    </button>

                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 p-4">

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
                        History
                    </NavLink>

                </nav>

                {/* Logout */}
                <div className="border-t border-slate-800 p-4">

                    <button
                        onClick={() => {
                            logout();
                            onClose();
                        }}
                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-4 py-3 font-medium text-white transition-all hover:bg-red-700"
                    >
                        <HiOutlineArrowRightOnRectangle size={20} />
                        Logout
                    </button>

                </div>

            </aside>
        </>
    );
}