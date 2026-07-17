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
        <div className="flex min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-h-screen flex-1 flex-col">

                <Header
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main className="flex-1 overflow-y-auto">

                    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>

                </main>

            </div>

        </div>
    );
}