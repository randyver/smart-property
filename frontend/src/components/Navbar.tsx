"use client";

import { useState } from "react";
import { House, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import Image from "next/image";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
          <span className="bg-gradient-to-r text-lg font-bold from-smartproperty to-smartproperty-dark bg-clip-text text-transparent">
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
            Peta
          </a>
          <a
            href="/analytics"
            className="text-gray-600 hover:text-smartproperty font-medium"
          >
            Analitik
          </a>
          <a
            href="/about-us"
            className="text-gray-600 hover:text-smartproperty font-medium"
          >
            Tentang Kami
          </a>
        </nav>

        {/* Mobile menu - Sheet Component */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button className="flex items-center justify-center">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px]">
            <SheetHeader className="pb-6">
              <SheetTitle>
                <div className="flex items-center gap-2">
                  <House className="h-5 w-5 text-smartproperty" />
                  <span className="text-lg font-bold text-smartproperty-dark">
                    SmartProperty
                  </span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4">
              <SheetClose asChild>
                <a
                  href="/"
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-smartproperty hover:bg-gray-100 rounded-md transition-colors"
                >
                  Home
                </a>
              </SheetClose>
              <SheetClose asChild>
                <a
                  href="/dashboard"
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-smartproperty hover:bg-gray-100 rounded-md transition-colors"
                >
                  Peta
                </a>
              </SheetClose>
              <SheetClose asChild>
                <a
                  href="/analytics"
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-smartproperty hover:bg-gray-100 rounded-md transition-colors"
                >
                  Analitik
                </a>
              </SheetClose>
              <SheetClose asChild>
                <a
                  href="/about-us"
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-smartproperty hover:bg-gray-100 rounded-md transition-colors"
                >
                  Tentang Kami
                </a>
              </SheetClose>
            </nav>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} SmartProperty
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Find climate-safe properties with GIS analysis
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
