"use client";

import Link from "next/link";
import { House, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full scale-150 blur-xl opacity-70"></div>
              <div className="relative bg-blue-600 text-white p-4 rounded-full">
                <House size={48} />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-8">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6"
            >
              <Link href="/">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-blue-600 text-blue-600 py-2 px-6"
            >
              <Link href="/dashboard">Temukan Properti</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}