import React from 'react';
import { NavLink } from 'react-router-dom';
import { NotebookPen } from 'lucide-react';

export default function LandingHeader() {
    return (
        <header className="flex flex-row justify-between items-center py-6 px-12 sm:px-24 mb-16 w-full max-w-7xl mx-auto">
            <div className="flex flex-row items-center gap-3">
                <NotebookPen className="text-[var(--color-primary)]" size={32} strokeWidth={2.5} />
                <h1 className="text-[var(--color-ink)] font-note font-bold text-xl">Nhật ký Thi</h1>
            </div>

            <nav className="flex flex-row gap-8 items-center">
                <NavLink to="/" className="font-note text-lg font-bold hover:text-[var(--color-primary)]">Trang chủ</NavLink>
                <NavLink to="/" className="font-note text-lg font-bold hover:text-[var(--color-primary)]">Giới thiệu</NavLink>
                <NavLink to="/" className="font-note text-lg font-bold hover:text-[var(--color-primary)]">Liên hệ</NavLink>
                <NavLink to="/register" className="px-6 py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-note font-bold text-xl rounded-md hover:bg-[var(--color-primary)] hover:text-white transition-colors">Đăng ký</NavLink>
            </nav>
        </header>
    );
}
