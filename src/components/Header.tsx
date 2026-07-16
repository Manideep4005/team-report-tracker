import { HiOutlineBars3 } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth();

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

    return (
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">

            <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">

                {/* Left */}

                <div className="flex items-center gap-3">

                    <button
                        onClick={onMenuClick}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <HiOutlineBars3 size={22} />
                    </button>

                    <div>

                        <h1 className="text-lg font-semibold text-white sm:text-xl">
                            👋 {greeting},{" "}
                            <span className="text-blue-400">
                                {user?.name?.split(" ")[0]}
                            </span>
                        </h1>

                        <p className="text-xs text-slate-500 sm:text-sm">
                            {today}
                        </p>

                    </div>

                </div>

                {/* Right */}

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-600/20">

                    {user?.name?.charAt(0).toUpperCase()}

                </div>

            </div>

        </header>
    );
}