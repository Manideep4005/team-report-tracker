import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
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
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-800 bg-[#0f172a] px-8">

            <div>
                <h1 className="text-3xl font-bold text-white">
                    {title}
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                    {today}
                </p>
            </div>

            <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                    <p className="font-medium text-white">
                        {user?.name}
                    </p>

                    <p className="text-sm text-slate-400">
                        {user?.email}
                    </p>
                </div>

            </div>

        </header>
    );
}