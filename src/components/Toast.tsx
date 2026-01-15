"use client";

import React, { useEffect, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
    success: {
        bg: "from-emerald-500/20 to-green-500/10",
        icon: "✓",
        border: "border-emerald-500/30",
    },
    error: {
        bg: "from-red-500/20 to-pink-500/10",
        icon: "✕",
        border: "border-red-500/30",
    },
    warning: {
        bg: "from-amber-500/20 to-orange-500/10",
        icon: "⚠",
        border: "border-amber-500/30",
    },
    info: {
        bg: "from-blue-500/20 to-indigo-500/10",
        icon: "ℹ",
        border: "border-blue-500/30",
    },
};

const iconColors: Record<ToastType, string> = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
};

function ToastItem({ toast, onDismiss }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const style = toastStyles[toast.type];

    const handleDismiss = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 200);
    }, [onDismiss, toast.id]);

    useEffect(() => {
        const duration = toast.duration || 4000;
        const timer = setTimeout(handleDismiss, duration);
        return () => clearTimeout(timer);
    }, [handleDismiss, toast.duration]);

    return (
        <div
            className={`
        relative overflow-hidden rounded-xl border backdrop-blur-xl
        bg-gradient-to-r ${style.bg} ${style.border}
        shadow-xl shadow-black/20
        transform transition-all duration-200 ease-out
        ${isExiting ? "opacity-0 translate-x-4 scale-95" : "opacity-100 translate-x-0 scale-100"}
      `}
            role="alert"
        >
            <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg ${iconColors[toast.type]} flex items-center justify-center text-white font-bold shrink-0`}>
                    {style.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{toast.title}</p>
                    {toast.message && (
                        <p className="text-sm text-white/70 mt-0.5 break-words">{toast.message}</p>
                    )}
                </div>

                {/* Dismiss Button */}
                <button
                    onClick={handleDismiss}
                    className="shrink-0 w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/10">
                <div
                    className={`h-full ${iconColors[toast.type]} animate-toast-progress`}
                    style={{ animationDuration: `${toast.duration || 4000}ms` }}
                />
            </div>
        </div>
    );
}

// Toast Container Component
interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
}

// Hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((title: string, message?: string) => addToast("success", title, message), [addToast]);
    const error = useCallback((title: string, message?: string) => addToast("error", title, message, 6000), [addToast]);
    const warning = useCallback((title: string, message?: string) => addToast("warning", title, message), [addToast]);
    const info = useCallback((title: string, message?: string) => addToast("info", title, message), [addToast]);

    return {
        toasts,
        dismissToast,
        success,
        error,
        warning,
        info,
    };
}
