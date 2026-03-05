import React from 'react';
import NotebookSidebar from './NotebookSidebar';
import { getCurrentUser } from '../../lib/mockData';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
    isAdmin?: boolean;
    headerRight?: React.ReactNode;
}

export default function DashboardLayout({ children, title, isAdmin = false, headerRight }: DashboardLayoutProps) {
    const user = getCurrentUser();

    return (
        <div className="flex flex-row min-h-screen bg-[var(--color-background-light)] font-sans text-[var(--color-ink)] relative w-full overflow-x-hidden pl-64 md:pl-72">
            <NotebookSidebar isAdmin={isAdmin} />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="flex flex-row justify-between items-center px-12 py-8 w-full bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b border-black/5">
                    <h2 className="text-3xl font-display font-bold">
                        {title || (isAdmin ? "Quản lý kỳ thi" : "Các kỳ thi")}
                    </h2>
                    <div className="flex flex-row items-center gap-4 text-sm font-semibold">
                        <span>Xin chào, {user?.fullName || "Khách"}</span>
                        {headerRight}
                    </div>
                </header>

                <div className="p-8 md:p-12 xl:p-20 xl:pt-10 flex-1 w-full max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
