import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PenTool, BarChart3, GraduationCap, LogOut } from 'lucide-react';
import { logout } from '../../lib/mockData';

interface NotebookSidebarProps {
    isAdmin?: boolean;
}

export default function NotebookSidebar({ isAdmin = false }: NotebookSidebarProps) {
    const studentLinks = [
        { to: "/", icon: <Home size={20} />, label: "Trang chủ" },
        { to: "/my-results", icon: <GraduationCap size={20} />, label: "Kết quả" },
    ];

    const adminLinks = [
        { to: "/admin", icon: <PenTool size={20} />, label: "Quản lý Kỳ thi" },
        { to: "/admin/stats", icon: <BarChart3 size={20} />, label: "Thống kê" },
        { to: "/admin/results", icon: <GraduationCap size={20} />, label: "Kết quả Sinh viên" },
    ];

    const links = isAdmin ? adminLinks : studentLinks;

    return (
        <div className="flex flex-row w-64 md:w-80 shrink-0 h-screen fixed top-0 left-0 z-40">
            {/* Main dark panel */}
            <div className="flex-1 bg-[var(--color-ink)] flex flex-col py-8 px-6 shadow-[4px_0_10px_#00000033] z-10">

                {/* Logo area */}
                <div className="flex flex-col items-start -rotate-2 mb-12">
                    <h1 className="text-[var(--color-paper)] font-note font-bold text-3xl tracking-wide">Nhật ký Thi</h1>
                    <span className="text-[var(--color-pencil)] font-note text-sm tracking-wider">Dashboard {isAdmin ? "(Admin)" : ""}</span>
                </div>

                {/* Navigation items */}
                <nav className="flex flex-col gap-2 flex-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/' || link.to === '/admin'}
                            className={({ isActive }) =>
                                `flex flex-row items-center gap-3 px-4 py-3 rounded-lg font-note text-lg font-bold transition-colors ${isActive
                                    ? "bg-[var(--color-paper)] text-[var(--color-primary)]"
                                    : "text-[var(--color-paper)] hover:bg-[#3a3232]"
                                }`
                            }
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout button at bottom */}
                <button
                    onClick={logout}
                    className="flex flex-row items-center gap-3 px-4 py-3 rounded-lg font-note text-lg text-[var(--color-paper)] hover:bg-[#3a3232] transition-colors mt-auto text-left"
                >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>

            {/* Spiral bindings on the right edge */}
            <div className="w-8 flex flex-col justify-evenly items-center py-16 -ml-4 z-20 pointer-events-none">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-10 h-3 bg-[var(--color-pencil)] rounded-full -rotate-6 shadow-[2px_2px_4px_#00000033]"
                    />
                ))}
            </div>
        </div>
    );
}
