"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  onClick?: () => void;
};

export default function NavLinks({ onClick }: Props) {
  const pathname = usePathname();

  const links = [
    { label: "Home", href: "/" },
    { label: "Candidates", href: "/#candidates" },
  ];

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href.includes("#") && pathname === "/");

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onClick}
              className={`
                block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? "text-primary-color bg-layer-1"
                  : "text-secondary-color hover:text-primary-color hover:bg-layer-1"
                }
              `}
            >
              {link.label}
            </Link>
          </li>
        );
      })}

      <li className="mt-2">
        <a
          href="/results"
          onClick={onClick}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          Live Results
        </a>
      </li>
    </>
  );
}
