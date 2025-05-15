"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  // State for image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Array of image paths
  const images = [
    "/home-1.jpeg",
    "/home-2.jpeg",
    "/home-3.jpeg",
    "/home-4.jpeg",
    "/home-5.jpeg"
  ];
  
  // Automatically switch images every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 5000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <section className="pt-28 pb-16 bg-gradient-to-br from-white to-smartproperty-light min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image carousel with overlay */}
      <div className="absolute inset-0 z-0">
        {images.map((img, index) => (
          <div
            key={img}
            className="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center"
            style={{
              backgroundImage: `url(${img})`,
              opacity: currentImageIndex === index ? 1 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10"></div>
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center z-20">
        <div className="md:w-1/2 mb-10 md:mb-0 animate-fade-in md:pr-8">
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Find Your Climate-Safe Dream Home Today
            </span>
          </motion.h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Temukan properti yang melindungi investasi Anda dari risiko lingkungan melalui analisis GIS.
          </p>
          <motion.div
            className="mt-16 flex justify-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/maps">
              <Button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-smartproperty to-smartproperty-dark px-8 py-6 text-lg font-medium text-white shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <span className="relative z-10">Jelajahi Peta Sekarang</span>
                <span className="absolute inset-0 bg-gradient-to-r from-smartproperty-dark to-smartproperty opacity-0 transition-opacity duration-500 hover:opacity-100"></span>
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="hidden md:block md:w-1/2 flex justify-center animate-scale-in md:pl-8">
          <div className="relative w-full max-w-md aspect-square mx-auto">
            <div className="absolute inset-0 bg-smartproperty rounded-full opacity-10 animate-pulse"></div>
            <div className="absolute inset-4 bg-white/90 backdrop-blur-lg rounded-full shadow-xl flex items-center justify-center p-6">
              <Image src="/logo.png" alt="Logo" width={400} height={400} />
            </div>
          </div>
        </div>
      </div>

      {/* Image carousel pagination dots */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentImageIndex === index ? "bg-white scale-125" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;