import { type ReactNode, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

interface Props {
    children: ReactNode;
}

export default function DashboardLayout({
    children,
}: Props) {
    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    return (
        <div className="relative flex min-h-screen bg-slate-50/40 transition-colors duration-300 dark:bg-[#09090b]">
            
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[50%] rounded-full bg-blue-500/5 blur-[120px] dark:bg-blue-600/5" />
                <div className="absolute -top-[10%] -right-[10%] h-[50%] w-[40%] rounded-full bg-indigo-500/5 blur-[100px] dark:bg-indigo-600/3" />
            </div>

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="relative z-10 flex min-h-screen flex-1 flex-col">

                <Header
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main className="flex-1 overflow-y-auto">

                    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {children}
                    </div>

                </main>

            </div>

        </div>
    );
}