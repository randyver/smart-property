"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { CloudSun, Home, Map, MessageSquare, Building, Gamepad, BarChart } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import * as React from "react";

// Feature data with added href property to enable navigation
const features = [
  {
    icon: CloudSun,
    title: "Penilaian Properti Iklim",
    description: "Evaluasi properti berdasarkan parameter iklim untuk mengetahui tingkat keamanannya dari risiko perubahan iklim",
    href: "/maps"
  },
  {
    icon: Home,
    title: "Perbandingan Properti",
    description: "Bandingkan hingga 3 properti secara bersamaan dengan detail lengkap faktor iklim dan spesifikasi bangunan",
    href: "/maps"
  },
  {
    icon: Map,
    title: "Peta GIS Interaktif",
    description: "Jelajahi peta interaktif dengan lapisan data iklim untuk menemukan properti terbaik di lokasi pilihan Anda",
    href: "/maps"
  },
  {
    icon: Building,
    title: "Pengembangan Properti",
    description: "Dapatkan prediksi harga dan rekomendasi pengembangan berdasarkan data iklim untuk investasi properti lebih cerdas",
    href: "/developer"
  },
  {
    icon: MessageSquare,
    title: "Asisten AI",
    description: "Konsultasikan kebutuhan properti Anda dengan asisten AI untuk mendapatkan saran dan jawaban personal",
    href: "/maps"
  },
  {
    icon: Gamepad,
    title: "Game Simulasi Iklim",
    description: "Belajar tentang ketahanan iklim properti dengan cara yang menyenangkan melalui game simulasi interaktif",
    href: "/maps"
  },
  {
    icon: BarChart,
    title: "Dashboard Analitik",
    description: "Akses data analitik komprehensif untuk memahami tren properti dan dampak iklim melalui visualisasi interaktif",
    href: "/analytics"
  }
];

const Features = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const featureRef = useRef(null);
  const isInView = useInView(featureRef, { once: true, amount: 0.3 });
  
  // Create a separate API for each breakpoint with proper typing
  const [carouselApi, setCarouselApi] = React.useState<any>(null);
  const [visibleItems, setVisibleItems] = React.useState(4);

  // Auto rotation for carousel
  useEffect(() => {
    if (!carouselApi) return;
    
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % features.length;
      setActiveIndex(nextIndex);
      carouselApi.scrollTo(nextIndex);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [carouselApi, activeIndex]);

  // Handle carousel slide changes
  const onSelect = React.useCallback(() => {
    if (!carouselApi) return;
    if (typeof carouselApi.selectedScrollSnap === 'function') {
      const selectedIndex = carouselApi.selectedScrollSnap();
      setActiveIndex(selectedIndex);
    }
  }, [carouselApi]);

  React.useEffect(() => {
    if (carouselApi) {
      carouselApi.on("select", onSelect);
      return () => carouselApi.off("select", onSelect);
    }
  }, [carouselApi, onSelect]);

  // Update visible items based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setVisibleItems(4); // XL screens - 4 items
      } else if (window.innerWidth >= 768) {
        setVisibleItems(2); // MD screens - 2 items
      } else {
        setVisibleItems(1); // SM screens - 1 item
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section ref={featureRef} className="min-h-screen py-16 bg-gradient-to-b from-white to-blue-50 flex flex-col items-center">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center text-4xl md:text-5xl font-bold text-blue-600 mb-24"
        >
          Fitur Utama <span className="text-black">Kami</span>
        </motion.h2>
      </div>

      {/* Background Rectangle with Gradient - Full Width */}
      <div className="w-full bg-[linear-gradient(to_right,_#56869D_0%,_#788781_27%,_#A5B792_50%,_#C29E83_74%,_#4D7DE9_100%)] py-16 relative -mt-6">
        <div className="relative z-10 container mx-auto px-4">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full"
            setApi={setCarouselApi}
          >
            <CarouselContent>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                
                return (
                  <CarouselItem 
                    key={index} 
                    className={`md:basis-1/2 xl:basis-1/4 pl-4`}
                  >
                    <Link 
                      href={feature.href}
                      className="block h-full"
                    >
                      <div 
                        className="rounded-2xl overflow-hidden shadow-lg h-[400px] w-full transition-all duration-300 bg-white hover:shadow-xl hover:-translate-y-1 hover:scale-105 cursor-pointer group"
                      >
                        <div className="p-6 flex flex-col items-center text-center justify-center h-full">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-blue-600 transition-all duration-300 group-hover:scale-110">
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-xl font-bold mb-4 text-gray-800">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-700">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="flex justify-center mt-4 gap-2">
              <CarouselPrevious className="relative static transform-none bg-white hover:bg-gray-100" />
              <CarouselNext className="relative static transform-none bg-white hover:bg-gray-100" />
            </div>
          </Carousel>
          
          {/* Pagination dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  if (carouselApi && typeof carouselApi.scrollTo === 'function') {
                    carouselApi.scrollTo(index);
                  }
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeIndex === index ? "bg-blue-600 w-6" : "bg-white"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;