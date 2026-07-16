import { type ReactNode, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

interface Props {
    children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617]">

            {/* Sidebar */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex min-h-screen flex-col lg:ml-64">

                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>

            </div>

        </div>
    );
}