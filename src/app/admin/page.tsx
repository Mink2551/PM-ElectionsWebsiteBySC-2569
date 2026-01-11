"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";

interface Candidate {
  id: string;
  firstname: string;
  lastname: string;
  nickname: string;
  class: string;
  votes: number;
}

export default function AdminPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [nickname, setNickname] = useState("");
  const [studentClass, setStudentClass] = useState("1");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstname.trim() || !lastname.trim() || !nickname.trim()) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "candidates"), {
        firstname,
        lastname,
        nickname,
        class: studentClass,
        votes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setFirstname("");
      setLastname("");
      setNickname("");
      setStudentClass("1");

      fetchCandidates();
      alert("Candidate added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding candidate");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCandidate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      await deleteDoc(doc(db, "candidates", id));
      fetchCandidates();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Error deleting candidate");
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen transition-colors duration-300">
        <Navbar />

        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fadeInUp">
              <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
              <p className="text-muted-color">Manage candidates and their information</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Add Candidate Form */}
              <div className="lg:col-span-1">
                <div className="glass-card rounded-2xl p-6 sticky top-24 animate-fadeInUp">
                  <h2 className="text-xl font-semibold text-primary-color mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm text-white">+</span>
                    Add Candidate
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-secondary-color mb-2">First Name *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-colors"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        placeholder="e.g. Patcharapol"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-secondary-color mb-2">Last Name *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-colors"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        placeholder="e.g. Pimpa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-secondary-color mb-2">Nickname *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-colors"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="e.g. Mink"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-secondary-color mb-2">Class *</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color focus:border-purple-500 focus:outline-none transition-colors"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                      >
                        <option value="1" className="bg-white dark:bg-[#12121a] text-primary-color">Class 1</option>
                        <option value="2" className="bg-white dark:bg-[#12121a] text-primary-color">Class 2</option>
                        <option value="3" className="bg-white dark:bg-[#12121a] text-primary-color">Class 3</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Adding..." : "Add Candidate"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Candidates List */}
              <div className="lg:col-span-2">
                <div className="animate-fadeInUp" style={{ animationDelay: "100ms" }}>
                  <h2 className="text-xl font-semibold text-primary-color mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></span>
                    Candidates ({candidates.length})
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
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
                              <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center">
                                <span className="font-bold gradient-text">
                                  {candidate.firstname?.[0]}
                                </span>
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
                              onClick={() => deleteCandidate(candidate.id)}
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

        <Footer />
      </div>
    </AdminGuard>
  );
}
