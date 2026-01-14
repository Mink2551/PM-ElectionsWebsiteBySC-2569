"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";
import ImageCropper from "@/components/ImageCropper";
import { useLanguage } from "@/shared/context/LanguageContext";

interface Candidate {
  id: string;
  firstname: string;
  lastname: string;
  nickname: string;
  class: string;
  votes: number;
  imageUrl?: string;
  candidateNumber?: number;
}

export default function AdminPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  // Form state
  // ... existing form state ...

  // Settings State
  const [liveUrl, setLiveUrl] = useState("");
  const [countdownDate, setCountdownDate] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch candidates and settings
  useEffect(() => {
    fetchCandidates();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, "settings", "config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLiveUrl(docSnap.data().liveUrl || "");
        if (docSnap.data().countdownDate) {
          // Convert Firestore ISO string to datetime-local format
          const date = new Date(docSnap.data().countdownDate);
          setCountdownDate(date.toISOString().slice(0, 16));
        }
      }
    } catch (e) {
      console.error("Error fetching settings:", e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "config"), {
        liveUrl,
        countdownDate: countdownDate ? new Date(countdownDate).toISOString() : null
      }, { merge: true });
      alert("Settings saved!");
    } catch (e) {
      console.error("Error saving settings:", e);
      alert("Error saving settings");
    } finally {
      setSavingSettings(false);
    }
  };
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [nickname, setNickname] = useState("");
  const [studentClass, setStudentClass] = useState("1");
  const [candidateNumber, setCandidateNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  // Edit Candidate State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch candidates
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const snap = await getDocs(collection(db, "candidates"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Candidate[];
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleCropComplete = (blob: Blob) => {
    setCroppedBlob(blob);
    setImagePreview(URL.createObjectURL(blob)); // Show cropped preview
    setShowCropper(false);
  };

  // Helper to convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstname.trim() || !lastname.trim() || !nickname.trim()) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Prepare Image (Base64)
      let imageUrl = "";
      if (croppedBlob) {
        imageUrl = await blobToBase64(croppedBlob);
      }

      // 2. Save directly to Firestore (No external storage)
      await addDoc(collection(db, "candidates"), {
        firstname,
        lastname,
        nickname,
        class: studentClass,
        candidateNumber: candidateNumber ? parseInt(candidateNumber) : null,
        votes: 0,
        imageUrl, // Stores the Base64 string directly
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      resetForm();
      fetchCandidates();
      alert("Candidate added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding candidate");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFirstname("");
    setLastname("");
    setNickname("");
    setStudentClass("1");
    setCandidateNumber("");
    setSelectedFile(null);
    setImagePreview(null);
    setCroppedBlob(null);
    setEditingId(null);
  };

  const deleteCandidate = async (candidate: Candidate) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      await deleteDoc(doc(db, "candidates", candidate.id));
      fetchCandidates();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Error deleting candidate");
    }
  };

  // Function to prepare edit (populate form) - *Simplified: Logic mainly for Adding now as per request "add capability"*
  // Implementing full Edit Update logic would require adjusting handleSubmit to handle updates.
  // For now, focusing on "Add picture of the candidate".

  return (
    <AdminGuard>
      <div className="min-h-screen transition-colors duration-300">
        <Navbar />

        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fadeInUp flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">{t("admin.title")}</h1>
                <p className="text-muted-color">{t("admin.desc")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/admin/votes"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  📊 Votes
                </a>
                <a
                  href="/admin/users"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-green-500/30 transition-all"
                >
                  👥 Users
                </a>
                <a
                  href="/admin/schedule"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  📅 Schedule
                </a>
                <a
                  href="/admin/logs"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  📜 Logs
                </a>
                <a
                  href="/admin/docs"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                >
                  📖 Docs
                </a>
                <a
                  href="/admin/alerts"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
                >
                  🔔 Alerts
                </a>
              </div>
            </div>

            {/* Global Settings */}
            <div className="glass-card rounded-2xl p-6 mb-8 animate-fadeInUp">
              <h2 className="text-xl font-semibold text-primary-color mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-sm text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </span>
                {t("admin.live_config")}
              </h2>
              <form onSubmit={handleSaveSettings} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-secondary-color mb-2">{t("admin.facebook_label")}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-colors"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="e.g. https://www.facebook.com/sc.satitpm.official/videos/..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {savingSettings ? t("admin.saving") : t("admin.update_link")}
                </button>
              </form>
            </div>

            {/* Countdown Date Settings */}
            <div className="glass-card rounded-2xl p-6 mb-8 animate-fadeInUp">
              <h2 className="text-xl font-semibold text-primary-color mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-sm text-white">
                  ⏱️
                </span>
                Countdown Settings
              </h2>
              <form onSubmit={handleSaveSettings} className="flex flex-col md:flex-row gap-4 md:items-end">
                <div className="flex-1">
                  <label className="block text-sm text-secondary-color mb-2">Election Date & Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-colors"
                    value={countdownDate}
                    onChange={(e) => setCountdownDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-color mt-1">
                    This date will be used for the countdown timer on the homepage
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-3 rounded-xl my-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {savingSettings ? t("admin.saving") : "Save Date"}
                </button>
              </form>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Add Candidate Form */}
              <div className="lg:col-span-1">
                <div className="glass-card rounded-2xl p-6 sticky top-24 animate-fadeInUp">
                  <h2 className="text-xl font-semibold text-primary-color mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm text-white">+</span>
                    {t("admin.add_candidate")}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div className="flex justify-center mb-6">
                      <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-layer-2 border-2 border-dashed border-glass-border flex items-center justify-center overflow-hidden hover:border-purple-500 transition-colors">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-8 h-8 text-muted-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <span className="text-white text-xs font-medium">Change</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-secondary-color mb-2">{t("admin.firstname")} *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-colors"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        placeholder="e.g. Narathip"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-secondary-color mb-2">{t("admin.lastname")} *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-colors"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        placeholder="e.g. No.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-secondary-color mb-2">{t("admin.nickname")} *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-colors"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="e.g. Nara"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-secondary-color mb-2">Candidate Number</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-colors"
                        value={candidateNumber}
                        onChange={(e) => setCandidateNumber(e.target.value)}
                        placeholder="e.g. 1, 2, 3..."
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-secondary-color mb-2">{t("admin.class")} *</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color focus:border-purple-500 focus:outline-none transition-colors"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                      >
                        <option value="1" className="bg-white dark:bg-[#12121a] text-primary-color">{t("admin.class")} 1</option>
                        <option value="2" className="bg-white dark:bg-[#12121a] text-primary-color">{t("admin.class")} 2</option>
                        <option value="3" className="bg-white dark:bg-[#12121a] text-primary-color">{t("admin.class")} 3</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? t("admin.adding") : t("admin.add_candidate")}
                    </button>
                  </form>
                </div>
              </div>

              {/* Candidates List */}
              <div className="lg:col-span-2">
                <div className="animate-fadeInUp" style={{ animationDelay: "100ms" }}>
                  <h2 className="text-xl font-semibold text-primary-color mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></span>
                    {t("stats.candidates")} ({candidates.length})
                  </h2>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                    </div>
                  ) : candidates.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center">
                      <p className="text-muted-color">No candidates yet. Add one using the form.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {candidates.map((candidate, index) => (
                        <div
                          key={candidate.id}
                          className="glass-card rounded-xl p-4 flex items-center justify-between gap-4 card-hover"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shrink-0">
                              <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                {candidate.imageUrl ? (
                                  <img src={candidate.imageUrl} alt={candidate.firstname} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-bold gradient-text">{candidate.firstname?.[0]}</span>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="font-medium text-primary-color">
                                {candidate.firstname} {candidate.lastname}
                              </p>
                              <p className="text-sm text-muted-color">
                                "{candidate.nickname}" • Class {candidate.class} • {candidate.votes || 0} votes
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`/admin/${candidate.id}/policies`}
                              className="px-3 py-2 rounded-lg bg-layer-1 text-secondary-color text-sm hover:bg-layer-2 hover:text-primary-color transition-colors"
                            >
                              Edit Policies
                            </a>
                            <button
                              onClick={() => deleteCandidate(candidate)}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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

        {/* Cropper Modal */}
        {showCropper && imagePreview && (
          <ImageCropper
            imageSrc={imagePreview}
            onCancel={() => {
              setShowCropper(false);
              setImagePreview(null);
              setSelectedFile(null);
            }}
            onCropComplete={handleCropComplete}
          />
        )}

        <Footer />
      </div>
    </AdminGuard>
  );
}
