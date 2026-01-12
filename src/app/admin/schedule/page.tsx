"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";
import { useLanguage } from "@/shared/context/LanguageContext";
import { logAdminAction } from "@/lib/adminLogger";
import Link from "next/link";

interface ScheduleEvent {
    id: string;
    title: string;
    titleTh: string;
    date: string;
    description?: string;
    descriptionTh?: string;
}

export default function AdminSchedulePage() {
    const { language } = useLanguage();
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        titleTh: "",
        date: "",
        description: "",
        descriptionTh: ""
    });

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const ref = doc(db, "settings", "schedule");
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data();
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveSchedule = async (newEvents: ScheduleEvent[]) => {
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "schedule"), { events: newEvents });
            setEvents(newEvents);
            await logAdminAction("update_schedule", "schedule", `Updated schedule to ${newEvents.length} events`);
        } catch (error) {
            console.error("Error saving schedule:", error);
            alert("Failed to save schedule");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.date) {
            alert("Title and date are required");
            return;
        }

        let newEvents: ScheduleEvent[];

        if (editingEvent) {
            // Update existing
            newEvents = events.map(ev =>
                ev.id === editingEvent.id
                    ? { ...formData, id: editingEvent.id }
                    : ev
            );
        } else {
            // Add new
            const newEvent: ScheduleEvent = {
                id: crypto.randomUUID(),
                ...formData
            };
            newEvents = [...events, newEvent];
        }

        // Sort by date
        newEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        await saveSchedule(newEvents);
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        const newEvents = events.filter(ev => ev.id !== id);
        await saveSchedule(newEvents);
    };

    const openAddModal = () => {
        setEditingEvent(null);
        setFormData({ title: "", titleTh: "", date: "", description: "", descriptionTh: "" });
        setShowModal(true);
    };

    const openEditModal = (event: ScheduleEvent) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            titleTh: event.titleTh,
            date: event.date,
            description: event.description || "",
            descriptionTh: event.descriptionTh || ""
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingEvent(null);
        setFormData({ title: "", titleTh: "", date: "", description: "", descriptionTh: "" });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AdminGuard>
            <div className="min-h-screen">
                <Navbar />

                <main className="pt-24 pb-16 px-4 md:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Link href="/admin" className="text-muted-color hover:text-primary-color transition-colors">
                                        ← Back
                                    </Link>
                                </div>
                                <h1 className="text-3xl font-bold text-primary-color">
                                    {language === "en" ? "Election Schedule" : "กำหนดการเลือกตั้ง"}
                                </h1>
                                <p className="text-secondary-color mt-1">
                                    {language === "en" ? "Manage key dates for the election" : "จัดการวันสำคัญของการเลือกตั้ง"}
                                </p>
                            </div>

                            <button
                                onClick={openAddModal}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                            >
                                + Add Event
                            </button>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="flex justify-center py-12">
                                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                            </div>
                        )}

                        {/* Events List */}
                        {!loading && (
                            <div className="space-y-4">
                                {events.map((event, index) => (
                                    <div key={event.id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Date Badge */}
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex flex-col items-center justify-center text-white flex-shrink-0">
                                                <span className="text-xs font-medium uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-xl font-bold leading-none">{new Date(event.date).getDate()}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-primary-color">
                                                    {language === "th" && event.titleTh ? event.titleTh : event.title}
                                                </h3>
                                                <p className="text-sm text-muted-color mt-1">
                                                    {language === "th" && event.descriptionTh ? event.descriptionTh : event.description}
                                                </p>
                                                <p className="text-xs text-muted-color mt-2">{formatDate(event.date)}</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(event)}
                                                className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm font-medium transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {events.length === 0 && (
                                    <div className="glass-card rounded-2xl p-12 text-center text-muted-color">
                                        {language === "en" ? "No schedule events yet. Add your first event!" : "ยังไม่มีกำหนดการ เพิ่มกิจกรรมแรกของคุณ!"}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                        <div className="relative w-full max-w-lg glass-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-primary-color mb-6">
                                {editingEvent ? "Edit Event" : "Add New Event"}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-color mb-2">Title (English) *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color focus:border-purple-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-color mb-2">Title (Thai)</label>
                                        <input
                                            type="text"
                                            value={formData.titleTh}
                                            onChange={(e) => setFormData({ ...formData, titleTh: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-color mb-2">Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color focus:border-purple-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-color mb-2">Description (English)</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color focus:border-purple-500 focus:outline-none resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary-color mb-2">Description (Thai)</label>
                                        <textarea
                                            value={formData.descriptionTh}
                                            onChange={(e) => setFormData({ ...formData, descriptionTh: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color focus:border-purple-500 focus:outline-none resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : (editingEvent ? "Save Changes" : "Add Event")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-3 rounded-xl border border-glass-border text-secondary-color hover:bg-layer-1 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <Footer />
            </div>
        </AdminGuard>
    );
}
