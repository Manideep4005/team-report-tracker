import { type ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

interface Props {
    children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    return (
        <div className="h-screen bg-[#020617]">

            <Sidebar />

            <div className="ml-64 flex h-screen flex-col">

                <Header />

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>

            </div>

        </div>
    );
}