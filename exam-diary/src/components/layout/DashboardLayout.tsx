import React, { useState } from 'react';
import { Menu } from 'lucide-react';
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-row min-h-screen bg-[var(--color-background-light)] font-sans text-[var(--color-ink)] relative w-full overflow-x-hidden lg:pl-64 xl:pl-80">
            <NotebookSidebar
                isAdmin={isAdmin}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="flex flex-row justify-between items-center px-4 sm:px-8 md:px-12 py-5 w-full bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-black/5">
                    {/* Hamburger – mobile/tablet only */}
                    <button
                        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors mr-3 text-[var(--color-ink)]"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold truncate">
                        {title || (isAdmin ? "Quản lý kỳ thi" : "Các kỳ thi")}
                    </h2>

                    <div className="flex flex-row items-center gap-4 text-sm font-semibold ml-auto pl-4 shrink-0">
                        <span className="hidden sm:block">Xin chào, {user?.fullName || "Khách"}</span>
                        {headerRight}
                    </div>
                </header>

                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-16 xl:pt-10 flex-1 w-full max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
