import { HiOutlineBars3 } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import { GlassIconButton } from "./Glass";

interface HeaderProps { onMenuClick: () => void; }

export default function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    return <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--surface)]/95 backdrop-blur-[18px] sm:h-[72px]">
        <div className="flex h-full items-center justify-between gap-4 px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-3">

                {/* MOBILE MENU — liquid glass */}
                <div className="shrink-0 lg:hidden">
                    <GlassIconButton
                        size={40}
                        onClick={onMenuClick}
                        aria-label="Open navigation"
                        title="Open navigation"
                    >
                        <HiOutlineBars3
                            size={20}
                            strokeWidth={2.25}
                            className="transition-transform duration-300 group-hover:scale-110"
                        />
                    </GlassIconButton>
                </div>

                <div className="min-w-0"><p className="truncate text-[15px] font-semibold tracking-[-0.015em] text-[var(--text-primary)]">{greeting}, <span className="font-bold text-[var(--brand)]">{user?.name?.split(" ")[0]}</span></p><p className="mt-0.5 truncate text-[11px] font-medium text-[var(--text-muted)]">{today}</p></div>
            </div>
        </div>
    </header>;
}