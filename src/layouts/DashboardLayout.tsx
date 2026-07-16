import { type ReactNode, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

interface Props {
    children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950">

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-h-screen flex-col lg:ml-60">

                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto">

                    <div className="mx-auto w-full max-w-7xl p-3 sm:p-5 lg:p-8">
                        {children}
                    </div>

                </main>

            </div>

        </div>
    );
}