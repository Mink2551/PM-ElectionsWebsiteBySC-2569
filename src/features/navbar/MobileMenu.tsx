import CloseIcon from "@mui/icons-material/Close";
import NavLinks from "./NavLinks";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
          <h2 className="font-semibold text-primary-color">PM's Election 2569</h2>
          <button onClick={onClose} className="text-secondary-color hover:text-primary-color transition-colors">
            <CloseIcon />
          </button>
        </div>

        <ul className="flex flex-col gap-4 p-4">
          <NavLinks onClick={onClose} />
        </ul>
      </aside>
    </>
  );
}
