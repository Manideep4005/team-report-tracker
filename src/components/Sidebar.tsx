import {
    HiOutlineSquares2X2,
    HiOutlineClock,
    HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {

    const { logout } = useAuth();

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 transition ${isActive
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:bg-slate-800"
        }`;

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-800 bg-[#111827] z-50">
            <div className="border-b border-slate-800 p-6">

                <h1 className="text-2xl text-white font-bold">
                    Team Work
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                    Daily Work Reports
                </p>

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
                    History
                </NavLink>

            </nav>

            <div className="border-t border-slate-800 p-4">

                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl bg-red-600 px-4 py-3 font-medium transition hover:bg-red-700"
                >
                    <HiOutlineArrowRightOnRectangle size={20} />
                    Logout
                </button>

            </div>

        </aside>
    );
}