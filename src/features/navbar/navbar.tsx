"use client";

import Link from "next/link";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 z-50 glass">
      <div className="flex items-center justify-between h-16 px-4 md:px-10 max-w-7xl mx-auto">
        {/* LEFT - Logo */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            {/* Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">PM</span>
            </div>

            {/* Logo Text */}
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg gradient-text">
                Election 2569
              </h1>
              <p className="text-xs text-muted-color -mt-1">
                Student Council
              </p>
            </div>
          </a>
        </div>

        {/* CENTER - Navigation (Desktop) */}
        <ul className="hidden md:flex gap-1 items-center">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/#candidates">Candidates</NavLink>
          <NavLink href="/results">Live Results</NavLink>
        </ul>

        {/* RIGHT - CTA Button & Mobile Menu */}
        <div className="flex items-center gap-3">
          <a
            href="/results"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Live Results
          </a>

          {/* Mobile Menu Button - RIGHT SIDE */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-layer-1 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <CloseIcon className="text-primary-color" />
            ) : (
              <MenuIcon className="text-primary-color" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </nav>
  );
}

/* Navigation Link Component */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="px-4 py-2 rounded-lg text-sm font-medium text-secondary-color hover:text-primary-color hover:bg-layer-1 transition-all duration-200"
      >
        {children}
      </Link>
    </li>
  );
}
