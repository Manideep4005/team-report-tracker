import { HiOutlineBars3 } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

interface HeaderProps { onMenuClick: () => void; }

export default function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    return <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--surface)]/95 backdrop-blur-[18px] sm:h-[72px]">
        <div className="flex h-full items-center justify-between gap-4 px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-3">
                <button type="button" onClick={onMenuClick} aria-label="Open navigation" title="Open navigation" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all hover:scale-105 hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] lg:hidden"><HiOutlineBars3 size={21} /></button>
                <div className="min-w-0"><p className="truncate text-[15px] font-semibold tracking-[-0.015em] text-[var(--text-primary)]">{greeting}, <span className="font-bold text-[var(--brand)]">{user?.name?.split(" ")[0]}</span></p><p className="mt-0.5 truncate text-[11px] font-medium text-[var(--text-muted)]">{today}</p></div>
            </div>
        </div>
    </header>;
}
