"use client";

import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";
import { useLanguage } from "@/shared/context/LanguageContext";

interface FeatureSection {
    title: string;
    icon: string;
    features: { name: string; description: string }[];
}

const documentationSections: FeatureSection[] = [
    {
        title: "🏠 Public Pages",
        icon: "🌐",
        features: [
            { name: "Landing Page (/)", description: "Homepage with countdown timer, candidate overview, trending policies, top candidates section, and election schedule timeline." },
            { name: "Live Results (/results)", description: "Real-time election results with vote counts, percentages, progress bars, and abstain votes display. Auto-updates via Firestore listeners." },
            { name: "Candidate Profile (/candidate/[id]/profile)", description: "Individual candidate page showing photo, nickname, class, vote count, and policy preview with social sharing." },
            { name: "Candidate Policies (/candidate/[id]/policies)", description: "Full list of candidate policies with like/comment functionality. Requires user verification for interactions." },
        ]
    },
    {
        title: "🎨 Theme System",
        icon: "🌙",
        features: [
            { name: "Dark Mode (Default)", description: "Purple/indigo gradient accents with dark backgrounds. Saved in cookies for persistence." },
            { name: "Light Mode", description: "Sunset orange gradient accents with light backgrounds. Toggle via sun/moon icon in navbar." },
            { name: "Theme Toggle", description: "Available in both desktop navbar and mobile menu. User preference saved automatically." },
        ]
    },
    {
        title: "👤 User Verification",
        icon: "✅",
        features: [
            { name: "Registration Modal", description: "Users must enter 5-digit student ID and nickname before interacting (likes, comments, reactions)." },
            { name: "Data Storage", description: "User data stored in cookies (1 year expiry) and Firestore for admin tracking." },
            { name: "IP Tracking", description: "User IP and device info collected for security and admin oversight." },
            { name: "Comment Attribution", description: "All comments display author nickname and student ID (e.g., 'John #12345')." },
        ]
    },
    {
        title: "🔐 Admin Panel",
        icon: "⚙️",
        features: [
            { name: "Admin Login (/admin)", description: "Password-protected access with rate limiting (5 attempts, 15-min lockout). Session stored in encoded cookie." },
            { name: "Candidate Management", description: "Add, edit, delete candidates with photo upload and cropping. Manage policies for each candidate." },
            { name: "Vote Management (/admin/votes)", description: "Manually adjust candidate votes and abstain vote count with real-time preview." },
            { name: "Live Stream Config", description: "Set Facebook Live video URL for live voting countdown page." },
        ]
    },
    {
        title: "👥 User Management (/admin/users)",
        icon: "👥",
        features: [
            { name: "User List", description: "View all registered users with student ID, nickname, IP, and registration date." },
            { name: "Search", description: "Filter users by student ID or nickname." },
            { name: "Block Users", description: "Block problematic users with optional reason. Blocked users cannot interact." },
            { name: "Delete Users", description: "Permanently remove user records from the database." },
        ]
    },
    {
        title: "📅 Schedule Management (/admin/schedule)",
        icon: "📅",
        features: [
            { name: "Add Events", description: "Create election timeline events with title (EN/TH), date, and description (EN/TH)." },
            { name: "Edit Events", description: "Update existing events. Changes reflect immediately on landing page." },
            { name: "Delete Events", description: "Remove events from the timeline. Auto-sorted by date." },
            { name: "Public Display", description: "Timeline shown on landing page with 'Today' highlighting and past event fading." },
        ]
    },
    {
        title: "📜 Activity Logs (/admin/logs)",
        icon: "📜",
        features: [
            { name: "Action Tracking", description: "All admin actions logged: create/delete candidates, vote updates, schedule changes, user blocks." },
            { name: "Log Details", description: "Each log shows action type, target, details, admin IP, and timestamp." },
            { name: "Color Coding", description: "Actions color-coded: green (create), red (delete), blue (update), etc." },
        ]
    },
    {
        title: "📱 Additional Features",
        icon: "✨",
        features: [
            { name: "Bilingual Support", description: "Full English/Thai translation. Toggle via flag icon in navbar." },
            { name: "PWA Ready", description: "manifest.json for 'Add to Home Screen' on mobile devices." },
            { name: "Responsive Design", description: "Optimized for desktop, tablet, and mobile. Glassmorphism design system." },
            { name: "404 Page", description: "Custom not-found page with themed design and navigation links." },
        ]
    },
];

export default function AdminDocsPage() {
    const { language } = useLanguage();

    return (
        <AdminGuard>
            <div className="min-h-screen transition-colors duration-300">
                <Navbar />

                <main className="pt-24 pb-16 px-4 md:px-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="mb-12 animate-fadeInUp">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle text-xs font-bold uppercase tracking-wider mb-4">
                                📖 Documentation
                            </div>
                            <h1 className="text-3xl font-bold gradient-text mb-2">
                                {language === "en" ? "Platform Manual & Features" : "คู่มือและฟีเจอร์ของแพลตฟอร์ม"}
                            </h1>
                            <p className="text-muted-color">
                                {language === "en"
                                    ? "Complete guide to all features of the PM Student Board Election 2569 platform."
                                    : "คู่มือฉบับสมบูรณ์สำหรับฟีเจอร์ทั้งหมดของแพลตฟอร์มเลือกตั้งคณะกรรมการนักเรียน PM ปี 2569"}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-primary-color">8</p>
                                <p className="text-xs text-muted-color">Feature Sections</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-primary-color">6</p>
                                <p className="text-xs text-muted-color">Admin Pages</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-primary-color">2</p>
                                <p className="text-xs text-muted-color">Languages</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-primary-color">∞</p>
                                <p className="text-xs text-muted-color">Possibilities</p>
                            </div>
                        </div>

                        {/* Documentation Sections */}
                        <div className="space-y-8">
                            {documentationSections.map((section, sectionIndex) => (
                                <div
                                    key={section.title}
                                    className="glass-card rounded-2xl p-6 animate-fadeInUp"
                                    style={{ animationDelay: `${sectionIndex * 100}ms` }}
                                >
                                    <h2 className="text-xl font-bold text-primary-color mb-6 flex items-center gap-3">
                                        <span className="text-2xl">{section.icon}</span>
                                        {section.title}
                                    </h2>

                                    <div className="space-y-4">
                                        {section.features.map((feature, featureIndex) => (
                                            <div
                                                key={feature.name}
                                                className="flex gap-4 p-4 rounded-xl bg-layer-1 hover:bg-layer-2 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-accent-gradient-simple flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {featureIndex + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-primary-color mb-1">{feature.name}</h3>
                                                    <p className="text-sm text-secondary-color">{feature.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Environment Variables Notice */}
                        <div className="mt-12 glass-card rounded-2xl p-6 border-l-4 border-yellow-500">
                            <h3 className="text-lg font-bold text-primary-color mb-4 flex items-center gap-2">
                                ⚠️ {language === "en" ? "Important Setup Notes" : "หมายเหตุการตั้งค่าสำคัญ"}
                            </h3>
                            <div className="space-y-3 text-sm text-secondary-color">
                                <p>• <strong>Environment Variables:</strong> Ensure <code className="px-1 py-0.5 rounded bg-layer-1">.env.local</code> contains all Firebase config and <code className="px-1 py-0.5 rounded bg-layer-1">NEXT_PUBLIC_ADMIN_PASSWORD</code></p>
                                <p>• <strong>Firestore Rules:</strong> Deploy <code className="px-1 py-0.5 rounded bg-layer-1">firestore.rules</code> to Firebase Console for proper security</p>
                                <p>• <strong>PWA Icons:</strong> Add <code className="px-1 py-0.5 rounded bg-layer-1">icon-192.png</code> and <code className="px-1 py-0.5 rounded bg-layer-1">icon-512.png</code> to <code className="px-1 py-0.5 rounded bg-layer-1">/public/</code> for PWA support</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 text-center text-muted-color text-sm">
                            <p>v1.0.0 • Built with Next.js, Firebase & ❤️ by SC Team</p>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </AdminGuard>
    );
}
