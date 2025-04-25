"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Earth } from "lucide-react";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="pt-28 pb-16 bg-gradient-to-br from-white to-smartproperty-light min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center">
        <div className="md:w-1/2 mb-10 md:mb-0 animate-fade-in md:pr-8">
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-smartproperty to-smartproperty-dark bg-clip-text text-transparent">
              Find Your Climate-Safe Dream Home Today
            </span>
          </motion.h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
          Temukan properti yang melindungi investasi Anda dari risiko lingkungan melalui analisis GIS.
          </p>
          <motion.div
            className="mt-16 flex justify-start" // Changed from justify-center to justify-start
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <a href="/dashboard">
              <Button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-smartproperty to-smartproperty-dark px-8 py-6 text-lg font-medium text-white shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <span className="relative z-10">Jelajahi peta sekarang</span>
                <span className="absolute inset-0 bg-gradient-to-r from-smartproperty-dark to-smartproperty opacity-0 transition-opacity duration-500 hover:opacity-100"></span>
              </Button>
            </a>
          </motion.div>
        </div>
        <div className="hidden md:block md:w-1/2 flex justify-center animate-scale-in md:pl-8">
          <div className="relative w-full max-w-md aspect-square mx-auto">
            <div className="absolute inset-0 bg-smartproperty rounded-full opacity-10 animate-pulse"></div>
            <div className="absolute inset-4 bg-white rounded-full shadow-xl flex items-center justify-center p-6">
              <Image src="/logo.png" alt="Logo" width={400} height={400} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
