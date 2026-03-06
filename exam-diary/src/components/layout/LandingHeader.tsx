import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NotebookPen, Menu, X } from 'lucide-react';

export default function LandingHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="flex flex-row justify-between items-center py-5 px-6 sm:px-12 md:px-16 lg:px-24 mb-8 lg:mb-16 w-full max-w-7xl mx-auto relative">
            {/* Logo */}
            <div className="flex flex-row items-center gap-3">
                <NotebookPen className="text-[var(--color-primary)]" size={28} strokeWidth={2.5} />
                <h1 className="text-[var(--color-ink)] font-note font-bold text-xl">Nhật ký Thi</h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex flex-row gap-8 items-center">
                <NavLink to="/" className="font-note text-lg font-bold hover:text-[var(--color-primary)]">Trang chủ</NavLink>
                <NavLink to="/" className="font-note text-lg font-bold hover:text-[var(--color-primary)]">Giới thiệu</NavLink>
                <NavLink to="/" className="font-note text-lg font-bold hover:text-[var(--color-primary)]">Liên hệ</NavLink>
                <NavLink to="/register" className="px-6 py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-note font-bold text-xl rounded-md hover:bg-[var(--color-primary)] hover:text-white transition-colors">Đăng ký</NavLink>
            </nav>

            {/* Hamburger – mobile/tablet */}
            <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors text-[var(--color-ink)]"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile dropdown nav */}
            {menuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-[var(--color-background-light)] border-t border-black/10 shadow-xl z-50 flex flex-col px-6 py-6 gap-4">
                    <NavLink
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="font-note text-xl font-bold py-3 border-b border-black/10 hover:text-[var(--color-primary)] transition-colors"
                    >
                        Trang chủ
                    </NavLink>
                    <NavLink
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="font-note text-xl font-bold py-3 border-b border-black/10 hover:text-[var(--color-primary)] transition-colors"
                    >
                        Giới thiệu
                    </NavLink>
                    <NavLink
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="font-note text-xl font-bold py-3 border-b border-black/10 hover:text-[var(--color-primary)] transition-colors"
                    >
                        Liên hệ
                    </NavLink>
                    <NavLink
                        to="/register"
                        onClick={() => setMenuOpen(false)}
                        className="mt-2 px-6 py-3 bg-[var(--color-primary)] text-white font-note font-bold text-xl rounded-md text-center hover:bg-[var(--color-primary-dark)] transition-colors"
                    >
                        Đăng ký
                    </NavLink>
                </div>
            )}
        </header>
    );
}
