"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

type Language = "en" | "th";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        "nav.home": "Home",
        "nav.candidates": "Candidates",
        "nav.results": "Live Results",
        "hero.badge": "Official Election Platform",
        "hero.title1": "PM Student President By SC",
        "hero.title2": "2569",
        "hero.desc": "Official student president election platform with transparency, fairness, and real-time monitoring.",
        "hero.cta.view": "View Candidates",
        "hero.cta.results": "Live Results",
        "live.badge": "Live Now",
        "stats.candidates": "Candidates",
        "stats.voters": "Voters",
        "admin.title": "Admin Dashboard",
        "admin.desc": "Manage candidates and their information",
        "admin.live_config": "Live Stream Configuration",
        "admin.facebook_label": "Facebook Live URL (Leave empty to hide)",
        "admin.update_link": "Update Live Link",
        "admin.add_candidate": "Add Candidate",
        "admin.firstname": "First Name",
        "admin.lastname": "Last Name",
        "admin.nickname": "Nickname",
        "admin.class": "M.",
        "admin.saving": "Saving...",
        "admin.adding": "Adding...",
        "admin.votes_title": "Vote Management",
        "admin.votes_desc": "Manually adjust candidate vote counts",
        "admin.current_votes": "Current Votes",
        "admin.abstain_title": "Abstain Votes Management",
        "admin.spoiled_title": "Spoiled Ballots Management",
        "results.abstain": "Abstain (No Vote)",
        "results.spoiled": "Spoiled Ballot",
        "section.candidates.title": "Meet the Candidates",
        "section.candidates.desc": "Click on a candidate to view their policies and profile",
        "section.trending.title": "Trending Policies",
        "section.trending.desc": "Most discussed and engaged policies from all candidates",
        "section.top_candidates.title": "Top Engaged Candidates",
        "section.top_candidates.desc": "Candidates with the highest total community engagement on their policies",
        "common.interactions": "Interactions",
        "card.view_policies": "View Policies",
        "card.personal_profile": "Personal Profile",
        "results.title": "Live Election Results",
        "results.updates": "Live Updates",
        "results.desc": "Real-time vote tracking for PM Student Board 2569",
        "results.total": "Total Votes",
        "results.last_updated": "Last Updated",
        "results.live": "Live",
        "results.votes": "votes",
        "no_candidates": "No candidates registered yet",
        "check_back": "Check back soon!",
        "footer.rights": "All rights reserved.",
        "footer.made_by": "Made with ❤️ by Student Board",
        "footer.election_info": "Election Info",
        "footer.voting_soon": "Voting opens soon",
        "footer.realtime_note": "All votes are recorded in real-time and cannot be modified.",
        "footer.announce_note": "Results will be announced immediately after voting closes.",
        "common.back": "Back",
        "profile.back": "Back to Candidates",
        "profile.candidate": "Candidate",
        "profile.votes": "Votes",
        "profile.policies": "Policies",
        "profile.class": "M.",
        "profile.about": "About",
        "profile.policies_overview": "Policies Overview",
        "profile.not_found": "Candidate not found",
        "policies.back": "Back to Profile",
        "policies.title": "Policies & Visions",
        "policies.proposed": "proposed",
        "policies.none": "No policies published yet",
        "policies.check_later": "Check back later for updates",
        "sidebar.comments": "Comments",
        "sidebar.discussing": "Discussing Policy:",
        "sidebar.no_comments": "No comments yet",
        "sidebar.start_conversation": "Start the conversation!",
        "sidebar.placeholder": "Share your thoughts...",
        "sidebar.submitting": "Submitting...",
        "btn.back_home": "Back to Home",
        "btn.view_all_policies": "View all",
        "theme.light": "Light Mode",
        "theme.dark": "Dark Mode",
        "profile.studyPlan": "Study Program",
        "profile.birthday": "Birthday",
        "profile.bloodType": "Blood Type",
        "profile.hobbies": "Hobbies",
        "profile.achievements": "Achievements",
        "profile.instagram": "Personal Instagram",
        "profile.partyInstagram": "Party Instagram",
        "profile.education": "Education History",
        "profile.prevSchool": "Previous School",
        "profile.prevGrade": "Grade",
        "profile.currentSchool": "Current School",
        "profile.currentGrade": "Grade",
        "profile.motivation": "Why run for Student President?",
        "profile.personalInfo": "Personal Information"
    },
    th: {
        "nav.home": "หน้าแรก",
        "nav.candidates": "ผู้สมัคร",
        "nav.results": "ผลคะแนนสด",
        "hero.badge": "แพลตฟอร์มการเลือกตั้งอย่างเป็นทางการ",
        "hero.title1": "ประธานนักเรียน พม. โดยทีมสื่อสารฯ",
        "hero.title2": "2569",
        "hero.desc": "แพลตฟอร์มการเลือกตั้งประธานนักเรียนอย่างเป็นทางการ ด้วยความโปร่งใส ยุติธรรม และการติดตามผลแบบเรียลไทม์",
        "hero.cta.view": "ดูผู้สมัคร",
        "hero.cta.results": "ผลคะแนนสด",
        "live.badge": "กำลังถ่ายทอดสด",
        "stats.candidates": "ผู้สมัคร",
        "stats.voters": "ผู้ลงคะแนน",
        "admin.title": "แผงควบคุมผู้ดูแลระบบ",
        "admin.desc": "จัดการข้อมูลผู้สมัครและรายละเอียดต่างๆ",
        "admin.live_config": "การตั้งค่าถ่ายทอดสด",
        "admin.facebook_label": "URL ของ Facebook Live (ปล่อยว่างเพื่อซ่อน)",
        "admin.update_link": "อัปเดตลิงก์สด",
        "admin.add_candidate": "เพิ่มผู้สมัคร",
        "admin.firstname": "ชื่อ",
        "admin.lastname": "นามสกุล",
        "admin.nickname": "ชื่อเล่น",
        "admin.class": "ม.",
        "admin.saving": "กำลังอัปเดต...",
        "admin.adding": "กำลังเพิ่ม...",
        "admin.votes_title": "การจัดการคะแนนโหวต",
        "admin.votes_desc": "ปรับแต่งคะแนนโหวตของผู้สมัครด้วยตนเอง",
        "admin.current_votes": "คะแนนปัจจุบัน",
        "admin.abstain_title": "จัดการคะแนนไม่ประสงค์ลงคะแนน",
        "admin.spoiled_title": "จัดการบัตรเสีย",
        "results.abstain": "ไม่ประสงค์ลงคะแนน",
        "results.spoiled": "บัตรเสีย",
        "section.candidates.title": "ทำความรู้จักผู้สมัคร",
        "section.candidates.desc": "คลิกที่ชื่อผู้สมัครเพื่อดูนโยบายและประวัติ",
        "section.trending.title": "นโยบายที่คนสนใจมากที่สุด",
        "section.trending.desc": "นโยบายที่มีการพูดถึงและมีส่วนร่วมสูงสุดจากผู้สมัครทุกคน",
        "section.top_candidates.title": "ผู้สมัครที่ได้รับความนิยมสูงสุด",
        "section.top_candidates.desc": "ผู้สมัครที่มีผลรวมการมีส่วนร่วมจากนโยบายสูงสุดจากทุกคนในระบบ",
        "common.interactions": "การมีส่วนร่วม",
        "card.view_policies": "ดูนโยบาย",
        "card.personal_profile": "ประวัติส่วนตัว",
        "results.title": "ผลการเลือกตั้งสด",
        "results.updates": "รายงานสด",
        "results.desc": "การติดตามคะแนนแบบเรียลไทม์สำหรับการเลือกตั้งกรรมการนักเรียน PM 2569",
        "results.total": "คะแนนรวมทั้งหมด",
        "results.last_updated": "อัปเดตล่าสุด",
        "results.live": "สด",
        "results.votes": "คะแนน",
        "no_candidates": "ยังไม่มีผู้สมัครลงทะเบียน",
        "check_back": "โปรดติดตามเร็วๆ นี้!",
        "footer.rights": "สงวนลิขสิทธิ์ทั้งหมด",
        "footer.made_by": "สร้างด้วย ❤️ โดยกรรมการนักเรียน",
        "footer.election_info": "ข้อมูลการเลือกตั้ง",
        "footer.voting_soon": "การลงคะแนนจะเปิดเร็วๆ นี้",
        "footer.realtime_note": "คะแนนทั้งหมดถูกบันทึกแบบเรียลไทม์และไม่สามารถแก้ไขได้",
        "footer.announce_note": "ผลการเลือกตั้งจะประกาศทันทีหลังปิดการลงคะแนน",
        "common.back": "ย้อนกลับ",
        "profile.back": "กลับไปหน้าผู้สมัคร",
        "profile.candidate": "ผู้สมัคร",
        "profile.votes": "คะแนน",
        "profile.policies": "นโยบาย",
        "profile.class": "ม.",
        "profile.about": "เกี่ยวกับ",
        "profile.policies_overview": "ภาพรวมนโยบาย",
        "profile.not_found": "ไม่พบข้อมูลผู้สมัคร",
        "policies.back": "กลับไปหน้าประวัติ",
        "policies.title": "นโยบายและวิสัยทัศน์",
        "policies.proposed": "ข้อเสนอ",
        "policies.none": "ยังไม่มีการเผยแพร่นโยบาย",
        "policies.check_later": "โปรดกลับมาตรวจสอบอีกครั้งภายหลัง",
        "sidebar.comments": "ความคิดเห็น",
        "sidebar.discussing": "กำลังพูดคุยนโยบาย:",
        "sidebar.no_comments": "ยังไม่มีความคิดเห็น",
        "sidebar.start_conversation": "เริ่มการสนทนาได้เลย!",
        "sidebar.placeholder": "แบ่งปันความคิดเห็นของคุณ...",
        "sidebar.submitting": "กำลังส่ง...",
        "btn.back_home": "กลับไปหน้าแรก",
        "btn.view_all_policies": "ดูทั้งหมด",
        "theme.light": "โหมดสว่าง",
        "theme.dark": "โหมดมืด",
        "profile.studyPlan": "แผนการเรียน",
        "profile.birthday": "เกิดวันที่",
        "profile.bloodType": "หมู่เลือด",
        "profile.hobbies": "งานอดิเรก",
        "profile.achievements": "ผลงาน",
        "profile.instagram": "Instagram ส่วนตัว",
        "profile.partyInstagram": "IG พรรค",
        "profile.education": "ประวัติการศึกษา",
        "profile.prevSchool": "โรงเรียนเดิม",
        "profile.prevGrade": "เกรด",
        "profile.currentSchool": "โรงเรียนปัจจุบัน",
        "profile.currentGrade": "เกรด",
        "profile.motivation": "ทำไมถึงสมัครประธานนักเรียน?",
        "profile.personalInfo": "ข้อมูลส่วนตัว"
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("th");

    useEffect(() => {
        const savedLang = Cookies.get("language") as Language;
        if (savedLang && (savedLang === "en" || savedLang === "th")) {
            setLanguageState(savedLang);
        } else {
            // Default to th if no cookie
            setLanguageState("th");
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        Cookies.set("language", lang, { expires: 365 });
    };

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations["en"]] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
