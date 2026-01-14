"use client";

import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function PrivacyPolicyPage() {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="pt-24 pb-16 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 animate-fadeInUp">
                        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                            {language === "en" ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}
                        </h1>
                        <p className="text-muted-color">
                            {language === "en"
                                ? "Last updated: January 14, 2026"
                                : "อัปเดตล่าสุด: 14 มกราคม 2569"}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="glass-card rounded-2xl p-8 space-y-8 animate-fadeInUp" style={{ animationDelay: "100ms" }}>

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-xl font-bold text-primary-color mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-accent-gradient-simple flex items-center justify-center text-white text-sm">1</span>
                                {language === "en" ? "Information We Collect" : "ข้อมูลที่เราเก็บรวบรวม"}
                            </h2>
                            <div className="text-secondary-color space-y-3 pl-10">
                                <p>
                                    {language === "en"
                                        ? "When you use our SC Elections platform, we collect the following information:"
                                        : "เมื่อคุณใช้งานแพลตฟอร์มเลือกตั้ง SC ของเรา เราจะเก็บรวบรวมข้อมูลดังต่อไปนี้:"}
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-color">
                                    <li>{language === "en" ? "Student ID" : "รหัสนักเรียน"}</li>
                                    <li>{language === "en" ? "Nickname" : "ชื่อเล่น"}</li>
                                    <li>{language === "en" ? "IP Address" : "ที่อยู่ IP"}</li>
                                    <li>{language === "en" ? "Device information (type, platform, browser)" : "ข้อมูลอุปกรณ์ (ประเภท, แพลตฟอร์ม, เบราว์เซอร์)"}</li>
                                    <li>{language === "en" ? "Screen resolution" : "ความละเอียดหน้าจอ"}</li>
                                    <li>{language === "en" ? "Activity timestamps" : "เวลาที่ใช้งาน"}</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-xl font-bold text-primary-color mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-accent-gradient-simple flex items-center justify-center text-white text-sm">2</span>
                                {language === "en" ? "How We Use Your Information" : "เราใช้ข้อมูลของคุณอย่างไร"}
                            </h2>
                            <div className="text-secondary-color space-y-3 pl-10">
                                <p>
                                    {language === "en"
                                        ? "Your information is used for the following purposes:"
                                        : "ข้อมูลของคุณจะถูกใช้เพื่อวัตถุประสงค์ดังต่อไปนี้:"}
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-color">
                                    <li>{language === "en" ? "To identify users and prevent duplicate interactions" : "เพื่อระบุตัวตนผู้ใช้และป้องกันการโต้ตอบซ้ำซ้อน"}</li>
                                    <li>{language === "en" ? "To maintain platform security and prevent abuse" : "เพื่อรักษาความปลอดภัยของแพลตฟอร์มและป้องกันการละเมิด"}</li>
                                    <li>{language === "en" ? "To display your nickname on comments" : "เพื่อแสดงชื่อเล่นของคุณบนความคิดเห็น"}</li>
                                    <li>{language === "en" ? "To track engagement with candidate policies" : "เพื่อติดตามการมีส่วนร่วมกับนโยบายผู้สมัคร"}</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-xl font-bold text-primary-color mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-accent-gradient-simple flex items-center justify-center text-white text-sm">3</span>
                                {language === "en" ? "Data Security" : "ความปลอดภัยของข้อมูล"}
                            </h2>
                            <div className="text-secondary-color space-y-3 pl-10">
                                <p>
                                    {language === "en"
                                        ? "We implement appropriate security measures to protect your personal information. Your data is stored securely in our database and is only accessible by authorized administrators."
                                        : "เราดำเนินมาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณ ข้อมูลของคุณถูกจัดเก็บอย่างปลอดภัยในฐานข้อมูลของเราและสามารถเข้าถึงได้เฉพาะผู้ดูแลระบบที่ได้รับอนุญาตเท่านั้น"}
                                </p>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-xl font-bold text-primary-color mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-accent-gradient-simple flex items-center justify-center text-white text-sm">4</span>
                                {language === "en" ? "Data Retention" : "การเก็บรักษาข้อมูล"}
                            </h2>
                            <div className="text-secondary-color space-y-3 pl-10">
                                <p>
                                    {language === "en"
                                        ? "Your data will be retained for the duration of the election period and may be deleted after the election concludes. Administrators may delete user accounts at any time."
                                        : "ข้อมูลของคุณจะถูกเก็บรักษาไว้ตลอดช่วงเวลาเลือกตั้งและอาจถูกลบหลังจากการเลือกตั้งสิ้นสุดลง ผู้ดูแลระบบอาจลบบัญชีผู้ใช้ได้ตลอดเวลา"}
                                </p>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-xl font-bold text-primary-color mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-accent-gradient-simple flex items-center justify-center text-white text-sm">5</span>
                                {language === "en" ? "Your Rights" : "สิทธิ์ของคุณ"}
                            </h2>
                            <div className="text-secondary-color space-y-3 pl-10">
                                <p>
                                    {language === "en"
                                        ? "You have the right to:"
                                        : "คุณมีสิทธิ์ที่จะ:"}
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-color">
                                    <li>{language === "en" ? "Access your personal data" : "เข้าถึงข้อมูลส่วนบุคคลของคุณ"}</li>
                                    <li>{language === "en" ? "Request correction of incorrect data" : "ขอแก้ไขข้อมูลที่ไม่ถูกต้อง"}</li>
                                    <li>{language === "en" ? "Request deletion of your account" : "ขอลบบัญชีของคุณ"}</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-xl font-bold text-primary-color mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-accent-gradient-simple flex items-center justify-center text-white text-sm">6</span>
                                {language === "en" ? "Contact" : "ติดต่อเรา"}
                            </h2>
                            <div className="text-secondary-color space-y-3 pl-10">
                                <p>
                                    {language === "en"
                                        ? "If you have any questions about this Privacy Policy, please contact the SC Club administrators."
                                        : "หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อผู้ดูแลระบบ SC Club"}
                                </p>
                            </div>
                        </section>

                    </div>

                    {/* Back Button */}
                    <div className="text-center mt-8">
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-layer-1 border border-glass-border text-secondary-color hover:text-primary-color hover:border-purple-500/50 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {language === "en" ? "Back to Home" : "กลับหน้าหลัก"}
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
