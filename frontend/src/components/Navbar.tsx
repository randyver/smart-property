"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { House } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <House className="h-6 w-6 text-smartproperty" />
          <span className="text-xl font-bold text-smartproperty-dark">
            SmartProperty
          </span>
        </a>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="/"
            className="text-gray-600 hover:text-smartproperty font-medium"
          >
            Home
          </a>
          <a
            href="/dashboard"
            className="text-gray-600 hover:text-smartproperty font-medium"
          >
            Dashboard
          </a>
          <a
            href="/analytics"
            className="text-gray-600 hover:text-smartproperty font-medium"
          >
            Analytics
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white px-4 py-3 shadow-md">
          <nav className="flex flex-col space-y-3">
            <a
              href="/"
              className="text-gray-600 hover:text-smartproperty font-medium"
            >
              Home
            </a>
            <a
              href="/dashboard"
              className="text-gray-600 hover:text-smartproperty font-medium"
            >
              Dashboard
            </a>
            <a
              href="/analytics"
              className="text-gray-600 hover:text-smartproperty font-medium"
            >
              Analytics
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
