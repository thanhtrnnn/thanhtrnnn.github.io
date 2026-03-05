import React from 'react';

interface LooseLeafCardProps {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    holesCount?: number;
}

export default function LooseLeafCard({ children, className = "", contentClassName = "", holesCount = 5 }: LooseLeafCardProps) {
    return (
        <div className={`flex flex-row bg-[var(--color-paper)] rounded-lg shadow-[5px_10px_30px_#0000001A] overflow-hidden ${className}`}>
            {/* Holes column */}
            <div className="w-12 sm:w-16 shrink-0 flex flex-col justify-evenly items-center py-8">
                {Array.from({ length: holesCount }).map((_, i) => (
                    <div
                        key={i}
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#2c2424] shadow-[inset_1px_2px_4px_#00000080]"
                    />
                ))}
            </div>

            {/* Red margin line */}
            <div className="w-[2px] shrink-0 bg-[#ffcccc]" />

            {/* Main Content Area with faint blue lines */}
            <div className={`flex-1 flex flex-col p-6 sm:p-12 notebook-paper min-h-[300px] text-[var(--color-ink)] overflow-hidden ${contentClassName}`}>
                {children}
            </div>
        </div>
    );
}
