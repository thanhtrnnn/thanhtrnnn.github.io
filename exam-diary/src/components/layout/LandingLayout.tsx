import React from 'react';
import LandingHeader from './LandingHeader';

interface LandingLayoutProps {
    children: React.ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
    return (
        <div className="min-h-screen bg-[var(--color-background-light)] bg-paper-texture flex flex-col font-sans text-[var(--color-ink)] w-full">
            <LandingHeader />
            <main className="flex-1 flex flex-col justify-center items-center px-4 w-full">
                {children}
            </main>
        </div>
    );
}
