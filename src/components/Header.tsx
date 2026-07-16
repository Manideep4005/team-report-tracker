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
        month: "short",
        year: "numeric",
    });

    const title =
        pathname === "/dashboard"
            ? "Dashboard"
            : pathname === "/history"
                ? "History"
                : "Team Work";

    return (
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">

            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-5 lg:h-[68px] lg:px-8">

                {/* Left */}

                <div className="flex items-center gap-3">

                    <button
                        onClick={onMenuClick}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <HiOutlineBars3 size={20} />
                    </button>

                    <div>

                        <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl lg:text-2xl">
                            {title}
                        </h1>

                        <p className="hidden text-xs text-slate-500 sm:block">
                            {today}
                        </p>

                    </div>

                </div>

                {/* Right */}

                <div className="flex items-center gap-2 sm:gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white sm:h-10 sm:w-10 sm:text-base">

                        {user?.name?.charAt(0).toUpperCase()}

                    </div>

                    <div className="hidden sm:block">

                        <p className="text-sm font-medium text-white">
                            {user?.name}
                        </p>

                        <p className="max-w-[180px] truncate text-xs text-slate-500">
                            {user?.email}
                        </p>

                    </div>

                </div>

            </div>

        </header>
    );
}