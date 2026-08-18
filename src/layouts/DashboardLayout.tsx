import { type ReactNode, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

interface Props {
    children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-shell">
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="app-main">
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="app-content">
                    <div className="page-container">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}