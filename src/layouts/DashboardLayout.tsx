import { type ReactNode, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

interface Props { children: ReactNode; }

export default function DashboardLayout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return <div className="flex min-h-screen bg-[var(--background)]">
        <Sidebar open={sidebarOpen} collapsed={sidebarCollapsed} onClose={() => setSidebarOpen(false)} onToggleCollapse={() => setSidebarCollapsed((previous) => !previous)} />
        <div className="min-w-0 flex-1"><Header onMenuClick={() => setSidebarOpen(true)} /><main className="min-w-0"><div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</div></main></div>
    </div>;
}
