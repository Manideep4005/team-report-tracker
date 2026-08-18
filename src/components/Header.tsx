import { HiOutlineBars3 } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({
    onMenuClick,
}: HeaderProps) {
    const { user } = useAuth();

    const hour = new Date().getHours();

    const greeting =
        hour < 12
            ? "Good morning"
            : hour < 17
                ? "Good afternoon"
                : "Good evening";

    const today = new Date().toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );

    return (
        <header className="app-header">
            <div className="app-header-inner">

                {/* LEFT */}
                <div className="flex min-w-0 items-center gap-3">

                    {/* Mobile menu */}
                    <button
                        type="button"
                        onClick={onMenuClick}
                        aria-label="Open navigation"
                        className="header-icon-button lg:hidden"
                    >
                        <HiOutlineBars3 size={21} />
                    </button>

                    <div className="min-w-0">

                        <p className="header-greeting">
                            {greeting},{" "}
                            <span>
                                {user?.name?.split(" ")[0]}
                            </span>
                        </p>

                        <p className="header-date">
                            {today}
                        </p>

                    </div>
                </div>

            </div>
        </header>
    );
}