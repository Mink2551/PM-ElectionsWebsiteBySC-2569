"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";
import ImageCropper from "@/components/ImageCropper";

interface Policy {
  title: string;
  description: string;
  likes: number;
  comments?: Record<string, any>;
}

export default function PolicyEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: candidateId } = React.use(params);

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New policy inputs
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Image editing state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [savingImage, setSavingImage] = useState(false);

  useEffect(() => {
    async function loadCandidate() {
      try {
        const ref = doc(db, "candidates", candidateId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setCandidate({ id: snap.id, ...snap.data() });
        }
      } catch (error) {
        console.error("Error loading candidate:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCandidate();
  }, [candidateId]);

  // Handle file selection for image edit
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  // Convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Handle crop complete - save to Firestore
  const handleCropComplete = async (blob: Blob) => {
    setShowCropper(false);
    setSavingImage(true);

    try {
      const imageUrl = await blobToBase64(blob);
      const ref = doc(db, "candidates", candidateId);
      await updateDoc(ref, { imageUrl });

      setCandidate((prev: any) => ({ ...prev, imageUrl }));
      setImagePreview(null);
      alert("Image updated successfully!");
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Error updating image");
    } finally {
      setSavingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen transition-colors duration-300 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen transition-colors duration-300">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-white/50 text-xl">Candidate not found</p>
            <a href="/admin" className="mt-4 inline-block text-purple-400 hover:text-purple-300">
              ← Back to Admin
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const policies = candidate.policies || {};

  const addPolicy = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      alert("Please fill all fields");
      return;
    }

    setSubmitting(true);

    try {
      const policyId = crypto.randomUUID();
      const newPolicy: Policy = {
        title: newTitle,
        description: newDescription,
        likes: 0,
        comments: {},
      };

      const ref = doc(db, "candidates", candidateId);
      await updateDoc(ref, {
        [`policies.${policyId}`]: newPolicy,
      });

      setCandidate((prev: any) => ({
        ...prev,
        policies: {
          ...prev.policies,
          [policyId]: newPolicy,
        },
      }));

      setNewTitle("");
      setNewDescription("");
    } catch (error) {
      console.error("Error adding policy:", error);
      alert("Error adding policy");
    } finally {
      setSubmitting(false);
    }
  };

  const deletePolicy = async (policyId: string) => {
    if (!confirm("Delete this policy?")) return;

    try {
      const ref = doc(db, "candidates", candidateId);
      await updateDoc(ref, {
        [`policies.${policyId}`]: deleteField(),
      });

      setCandidate((prev: any) => {
        const updated = { ...prev.policies };
        delete updated[policyId];
        return { ...prev, policies: updated };
      });
    } catch (error) {
      console.error("Error deleting policy:", error);
      alert("Error deleting policy");
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen transition-colors duration-300">
        <Navbar />

        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <a href="/admin" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </a>

            {/* Header with Image Edit */}
            <div className="mb-8 animate-fadeInUp">
              <div className="flex items-start gap-6 mb-4">
                {/* Candidate Image - Editable */}
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[3px] shrink-0">
                    <div className="w-full h-full rounded-full bg-[#12121a] flex items-center justify-center overflow-hidden">
                      {candidate.imageUrl ? (
                        <img src={candidate.imageUrl} alt={candidate.firstname} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-2xl gradient-text">{candidate.firstname?.[0]}</span>
                      )}
                    </div>
                  </div>
                  {/* Edit Overlay */}
                  <label className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={savingImage}
                    />
                    {savingImage ? (
                      <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </label>
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Edit Candidate
                  </h1>
                  <p className="text-white/50">
                    {candidate.firstname} {candidate.lastname} • Class {candidate.class}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    Hover over photo to change image
                  </p>
                </div>
              </div>
            </div>

            {/* Policies Section Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></span>
              <h2 className="text-xl font-semibold text-white">Policies ({Object.keys(policies).length})</h2>
            </div>

            {/* Existing Policies */}
            <div className="space-y-4 mb-8">
              {Object.keys(policies).length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center animate-fadeInUp">
                  <p className="text-white/50">No policies yet. Add your first one below.</p>
                </div>
              ) : (
                Object.entries(policies).map(([id, policy]: [string, any], index) => (
                  <div
                    key={id}
                    className="glass-card rounded-xl p-5 card-hover animate-fadeInUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-white">{policy.title}</h3>
                        </div>
                        <p className="text-sm text-white/60 ml-11">{policy.description}</p>
                        <p className="text-xs text-pink-400 ml-11 mt-2">
                          ❤️ {policy.likes || 0} likes
                        </p>
                      </div>

                      <button
                        onClick={() => deletePolicy(id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent my-8" />

            {/* Add New Policy Form */}
            <div className="glass-card rounded-2xl p-6 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm">+</span>
                Add New Policy
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Policy Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none transition-colors"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Better School Facilities"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none transition-colors h-32 resize-none"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe what this policy aims to achieve..."
                  />
                </div>

                <button
                  onClick={addPolicy}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Adding..." : "Add Policy"}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Image Cropper Modal */}
        {showCropper && imagePreview && (
          <ImageCropper
            imageSrc={imagePreview}
            onCancel={() => {
              setShowCropper(false);
              setImagePreview(null);
            }}
            onCropComplete={handleCropComplete}
          />
        )}

        <Footer />
      </div>
    </AdminGuard>
  );
}

