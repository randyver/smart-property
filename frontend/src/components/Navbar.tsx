"use client";

import { useState } from "react";
import { House, Menu } from "lucide-react";
import Link from "next/link";
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
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
          <span className="bg-gradient-to-r text-lg font-bold from-smartproperty to-smartproperty-dark bg-clip-text text-transparent">
            SmartProperty
          </span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-smartproperty font-medium relative group"
          >
            <span>Home</span>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-smartproperty group-hover:w-full group-hover:left-0 transition-all duration-300 origin-center"></span>
          </Link>
          <Link
            href="/maps"
            className="text-gray-600 hover:text-smartproperty font-medium relative group"
          >
            <span>Peta</span>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-smartproperty group-hover:w-full group-hover:left-0 transition-all duration-300 origin-center"></span>
          </Link>
          <Link
            href="/analytics"
            className="text-gray-600 hover:text-smartproperty font-medium relative group"
          >
            <span>Analitik</span>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-smartproperty group-hover:w-full group-hover:left-0 transition-all duration-300 origin-center"></span>
          </Link>
          <Link
            href="/developer"
            className="text-gray-600 hover:text-smartproperty font-medium relative group"
          >
            <span>Pengembangan Properti</span>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-smartproperty group-hover:w-full group-hover:left-0 transition-all duration-300 origin-center"></span>
          </Link>
          <Link
            href="/about-us"
            className="text-gray-600 hover:text-smartproperty font-medium relative group"
          >
            <span>Tentang Kami</span>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-smartproperty group-hover:w-full group-hover:left-0 transition-all duration-300 origin-center"></span>
          </Link>
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
                <Link
                  href="/"
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-smartproperty hover:bg-gray-100 rounded-md transition-colors relative group overflow-hidden"
                >
                  <span>Home</span>
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-smartproperty group-hover:w-full group-hover:left-0 transition-all duration-300 origin-center"></span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/maps"
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-smartproperty hover:bg-gray-100 rounded-md transition-colors relative group overflow-hidden"
                >
                  <span>Peta</span>
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-smartproperty group-hover:w-full group-hover:left-0 transition-all duration-300 origin-center"></span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/analytics"
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-smartproperty hover:bg-gray-100 rounded-md transition-colors relative group overflow-hidden"
                >
                  <span>Analitik</span>
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-smartproperty group-hover:w-full group-hover:left-0 transition-all duration-300 origin-center"></span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/developer"
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-smartproperty hover:bg-gray-100 rounded-md transition-colors relative group overflow-hidden"
                >
                  <span>Pengembangan Properti</span>
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-smartproperty group-hover:w-full group-hover:left-0 transition-all duration-300 origin-center"></span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/about-us"
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-smartproperty hover:bg-gray-100 rounded-md transition-colors relative group overflow-hidden"
                >
                  <span>Tentang Kami</span>
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-smartproperty group-hover:w-full group-hover:left-0 transition-all duration-300 origin-center"></span>
                </Link>
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