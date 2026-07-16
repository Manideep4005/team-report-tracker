import { useLocation } from "react-router-dom";
import { HiOutlineBars3 } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth();
    const { pathname } = useLocation();

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const title =
        pathname === "/dashboard"
            ? "Dashboard"
            : pathname === "/history"
                ? "History"
                : "Team Work";

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-[#0f172a]/95 px-4 backdrop-blur-md sm:h-18 sm:px-6 lg:h-20 lg:px-8">

            {/* Left */}
            <div className="flex items-center gap-4">

                {/* Mobile Menu */}
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
                >
                    <HiOutlineBars3 size={24} />
                </button>

                <div>
                    <h1 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                        {title}
                    </h1>

                    <p className="hidden text-sm text-slate-400 sm:block">
                        {today}
                    </p>
                </div>

            </div>

            {/* Right */}
            <div className="flex items-center gap-3 sm:gap-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white sm:h-11 sm:w-11 sm:text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>

                <div className="hidden sm:block">

                    <p className="font-medium text-white">
                        {user?.name}
                    </p>

                    <p className="max-w-[220px] truncate text-sm text-slate-400">
                        {user?.email}
                    </p>

                </div>

            </div>

        </header>
    );
}