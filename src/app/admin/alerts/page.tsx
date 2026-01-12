"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    orderBy,
    query,
} from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";

interface Alert {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error";
    active: boolean;
    priority: number;
}

const TYPE_OPTIONS = [
    { value: "info", label: "ℹ️ Info", color: "bg-indigo-500" },
    { value: "warning", label: "⚠️ Warning", color: "bg-amber-500" },
    { value: "success", label: "✅ Success", color: "bg-green-500" },
    { value: "error", label: "❌ Error", color: "bg-red-500" },
];

export default function AdminAlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState<Alert["type"]>("info");
    const [active, setActive] = useState(true);
    const [priority, setPriority] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const q = query(collection(db, "alerts"), orderBy("priority", "asc"));
            const snap = await getDocs(q);
            const data = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Alert[];
            setAlerts(data);
        } catch (error) {
            console.error("Error fetching alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            alert("Please fill in title and message");
            return;
        }

        setSubmitting(true);

        try {
            if (editingId) {
                // Update existing
                await updateDoc(doc(db, "alerts", editingId), {
                    title,
                    message,
                    type,
                    active,
                    priority,
                    updatedAt: serverTimestamp(),
                });
            } else {
                // Create new
                await addDoc(collection(db, "alerts"), {
                    title,
                    message,
                    type,
                    active,
                    priority,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }

            resetForm();
            fetchAlerts();
        } catch (error) {
            console.error("Error saving alert:", error);
            alert("Error saving alert");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setMessage("");
        setType("info");
        setActive(true);
        setPriority(0);
        setEditingId(null);
    };

    const handleEdit = (alert: Alert) => {
        setTitle(alert.title);
        setMessage(alert.message);
        setType(alert.type);
        setActive(alert.active);
        setPriority(alert.priority);
        setEditingId(alert.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this alert?")) return;

        try {
            await deleteDoc(doc(db, "alerts", id));
            fetchAlerts();
        } catch (error) {
            console.error("Error deleting alert:", error);
            alert("Error deleting alert");
        }
    };

    const handleToggleActive = async (alert: Alert) => {
        try {
            await updateDoc(doc(db, "alerts", alert.id), {
                active: !alert.active,
                updatedAt: serverTimestamp(),
            });
            fetchAlerts();
        } catch (error) {
            console.error("Error toggling alert:", error);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "info": return "from-indigo-500 to-blue-600";
            case "warning": return "from-amber-500 to-orange-600";
            case "success": return "from-green-500 to-emerald-600";
            case "error": return "from-red-500 to-rose-600";
            default: return "from-gray-500 to-gray-600";
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen transition-colors duration-300">
                <Navbar />

                <main className="pt-24 pb-16 px-4 md:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8 animate-fadeInUp">
                            <div className="flex items-center gap-3 mb-2">
                                <a href="/admin" className="text-muted-color hover:text-primary-color transition-colors">
                                    ← Back
                                </a>
                            </div>
                            <h1 className="text-3xl font-bold gradient-text mb-2">🔔 Manage Alerts</h1>
                            <p className="text-muted-color">
                                Create alerts that will popup on user pages. Active alerts rotate every 5 seconds.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Form */}
                            <div className="lg:col-span-1">
                                <div className="glass-card rounded-2xl p-6 sticky top-24 animate-fadeInUp">
                                    <h2 className="text-xl font-semibold text-primary-color mb-6 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center text-sm text-white">
                                            {editingId ? "✏️" : "+"}
                                        </span>
                                        {editingId ? "Edit Alert" : "New Alert"}
                                    </h2>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-secondary-color mb-2">Title *</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-accent focus:outline-none transition-colors"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g. Voting Now Open!"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-secondary-color mb-2">Message *</label>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-accent focus:outline-none transition-colors resize-none"
                                                rows={3}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Your alert message..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-secondary-color mb-2">Type</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {TYPE_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setType(opt.value as Alert["type"])}
                                                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${type === opt.value
                                                                ? `${opt.color} text-white`
                                                                : "bg-layer-1 text-secondary-color hover:bg-layer-2"
                                                            }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-secondary-color mb-2">Priority (lower = first)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-accent focus:outline-none transition-colors"
                                                value={priority}
                                                onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                                                min={0}
                                            />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setActive(!active)}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${active ? "bg-green-500" : "bg-layer-2"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${active ? "left-7" : "left-1"
                                                        }`}
                                                />
                                            </button>
                                            <span className="text-sm text-secondary-color">
                                                {active ? "Active (visible to users)" : "Inactive (hidden)"}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            {editingId && (
                                                <button
                                                    type="button"
                                                    onClick={resetForm}
                                                    className="flex-1 py-3 rounded-xl border border-glass-border text-secondary-color hover:bg-layer-1 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex-1 py-3 rounded-xl bg-accent-gradient text-white font-semibold shadow-accent hover:shadow-accent-hover transition-all hover:-translate-y-0.5 disabled:opacity-50"
                                            >
                                                {submitting ? "Saving..." : editingId ? "Update" : "Create Alert"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Alerts List */}
                            <div className="lg:col-span-2">
                                <div className="animate-fadeInUp" style={{ animationDelay: "100ms" }}>
                                    <h2 className="text-xl font-semibold text-primary-color mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 rounded-full bg-accent-line" />
                                        All Alerts ({alerts.length})
                                    </h2>

                                    {loading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="w-10 h-10 rounded-full border-2 spinner-accent animate-spin" />
                                        </div>
                                    ) : alerts.length === 0 ? (
                                        <div className="glass-card rounded-2xl p-12 text-center">
                                            <p className="text-muted-color">No alerts yet. Create your first one!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {alerts.map((alert, index) => (
                                                <div
                                                    key={alert.id}
                                                    className="glass-card rounded-xl p-4 card-hover"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Type Badge */}
                                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getTypeColor(alert.type)} flex items-center justify-center text-white shrink-0`}>
                                                            {alert.type === "info" && "ℹ️"}
                                                            {alert.type === "warning" && "⚠️"}
                                                            {alert.type === "success" && "✅"}
                                                            {alert.type === "error" && "❌"}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-primary-color truncate">{alert.title}</h3>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${alert.active
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : "bg-gray-500/20 text-gray-400"
                                                                    }`}>
                                                                    {alert.active ? "Active" : "Inactive"}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-color line-clamp-2">{alert.message}</p>
                                                            <p className="text-xs text-muted-color mt-1">Priority: {alert.priority}</p>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                onClick={() => handleToggleActive(alert)}
                                                                className={`p-2 rounded-lg transition-colors ${alert.active
                                                                        ? "text-green-400 hover:bg-green-500/10"
                                                                        : "text-gray-400 hover:bg-gray-500/10"
                                                                    }`}
                                                                title={alert.active ? "Deactivate" : "Activate"}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={alert.active ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"} />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(alert)}
                                                                className="p-2 rounded-lg text-secondary-color hover:bg-layer-1 hover:text-primary-color transition-colors"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(alert.id)}
                                                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </AdminGuard>
    );
}
