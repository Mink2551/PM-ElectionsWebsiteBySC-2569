"use client";

import { useDeviceType } from "@/shared/hooks/checkDevice";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function Footer() {
  const device = useDeviceType();
  const isMobile = device === "phone";
  const { t } = useLanguage();

  return (
    <footer className="relative w-full mt-20 overflow-hidden">
      {/* Top Gradient Border */}
      <div className="h-px w-full bg-accent-line" style={{ background: 'linear-gradient(to right, transparent, var(--accent-primary, #a855f7), transparent)' }} />

      {/* Main Footer */}
      <div className="bg-secondary py-12 px-6 transition-colors duration-300">
        <div
          className={`
            max-w-7xl mx-auto
            ${isMobile ? "space-y-10 text-center" : "grid grid-cols-3 gap-12"}
          `}
        >
          {/* ================= BRAND ================= */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              {/* Logo */}
              <div className="w-12 h-12 rounded-xl bg-accent-gradient flex items-center justify-center">
                <span className="text-white font-bold text-lg">PM</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary-color">
                  {t("hero.title2")}
                </h3>
                <p className="text-xs text-muted-color">{t("hero.title1")}</p>
              </div>
            </div>
            <p className="text-sm text-muted-color max-w-xs mx-auto md:mx-0">
              {t("hero.desc")}
            </p>
          </div>

          {/* ================= QUICK LINKS ================= */}
          <div className={isMobile ? "" : "pl-8"}>
            <h4 className="font-semibold text-primary-color mb-4">{t("nav.home")}</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/">{t("nav.home")}</FooterLink>
              <FooterLink href="#candidates">{t("nav.candidates")}</FooterLink>
              <FooterLink href="/results">{t("nav.results")}</FooterLink>
            </ul>
          </div>

          {/* ================= ELECTION INFO ================= */}
          <div>
            <h4 className="font-semibold text-primary-color mb-4">{t("footer.election_info")}</h4>
            <div className="space-y-3 text-sm text-muted-color">
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {t("footer.voting_soon")}
              </p>
              <p>{t("footer.realtime_note")}</p>
              <p>{t("footer.announce_note")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white/5 dark:bg-black/20 py-6 border-t border-glass-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-color">
            © 2026 {t("hero.title1")}. {t("footer.rights")}
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <SocialLink href="https://www.instagram.com/sc.satitpm.official/" label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </SocialLink>
            <SocialLink href="https://www.facebook.com/sc.satitpm.official?locale=th_TH" label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </SocialLink>
            <SocialLink href="https://linktr.ee/sc.satitpm.official?utm_source=linktree_profile_share&ltsid=07e315fd-d8d5-4c3f-822c-826ef4d0cf90" label="Linktree">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.511 5.853l4.005-4.117 2.325 2.381-4.201 4.005h5.909v3.123h-5.996l3.485 2.937-2.153 2.232-3.875-3.086V24h-3.086v-10.64l-3.888 3.122-2.183-2.155 3.518-2.914H1.428V8.125h5.882L3.136 4.14 5.38 1.74l4.013 4.125C9.768 6.136 10.231 6.3 10.706 6.3s.938-.164 1.311-.447h1.494z" />
              </svg>
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Footer Link Component */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-muted-color hover:text-primary-color transition-colors duration-200 inline-flex items-center gap-1 group"
      >
        <span className="w-0 group-hover:w-2 h-px bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200" />
        {children}
      </a>
    </li>
  );
}

/* Social Link Component */
function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-10 h-10 rounded-lg bg-layer-1 flex items-center justify-center text-muted-color hover:text-white hover:bg-accent-gradient transition-all duration-300"
    >
      {children}
    </a>
  );
}
