"use client";

interface StatBoxProps {
    value: number | string;
    label: string;
}

export default function StatBox({ value, label }: StatBoxProps) {
    return (
        <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold gradient-text">{value}</p>
            <p className="text-muted-color text-sm">{label}</p>
        </div>
    );
}
