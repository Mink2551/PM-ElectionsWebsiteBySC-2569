import CloseIcon from "@mui/icons-material/Close";
import NavLinks from "./NavLinks";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/40 z-40 transition-opacity
          ${open ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#0a0a0f] shadow-2xl border-r border-glass-border z-[100]
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-glass-border">
          <div className="flex flex-col">
            <h2 className="font-semibold text-primary-color leading-tight">{t("hero.title2")}</h2>
            <p className="text-[10px] text-muted-color capitalize">{t("hero.title1")}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "th" : "en")}
              className="flex items-center justify-center w-8 h-8 rounded-lg glass text-[10px] font-bold text-white border border-white/10"
            >
              {language === "en" ? "TH" : "EN"}
            </button>
            <button onClick={onClose} className="text-secondary-color hover:text-primary-color transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-4 p-4">
          <NavLinks onClick={onClose} />
        </ul>
      </aside>
    </>
  );
}
