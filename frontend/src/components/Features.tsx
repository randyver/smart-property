"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { CloudSun, Home, Map, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import * as React from "react";

// Feature data
const features = [
  {
    icon: CloudSun,
    title: "Penilaian Properti Iklim",
    description: "Dapatkan rekomendasi properti dari jawaban drai pertanyaan iklim secara instan"
  },
  {
    icon: Home,
    title: "Perbandingan Properti",
    description: "Dapatkan rekomendasi properti dari jawaban drai pertanyaan iklim secara instan"
  },
  {
    icon: Map,
    title: "Peta GIS Interaktif",
    description: "Dapatkan rekomendasi properti dari jawaban drai pertanyaan iklim secara instan"
  },
  {
    icon: MessageSquare,
    title: "Asisten AI",
    description: "Dapatkan rekomendasi properti dari jawaban drai pertanyaan iklim secara instan"
  }
];

const Features = () => {
  const [activeIndex, setActiveIndex] = useState(2); // Setting default to the third item (index 2)
  const featureRef = useRef(null);
  const isInView = useInView(featureRef, { once: true, amount: 0.3 });
  
  // Create a separate API for each breakpoint with proper typing
  const [mobileApi, setMobileApi] = React.useState<any>(null);
  const [mediumApi, setMediumApi] = React.useState<any>(null);
  const [activeApi, setActiveApi] = React.useState<any>(null);
  const [isMediumScreen, setIsMediumScreen] = React.useState(false);

  // Update active API based on current screen size
  useEffect(() => {
    const handleResize = () => {
      const mediumScreen = window.innerWidth >= 768 && window.innerWidth < 1280;
      setIsMediumScreen(mediumScreen);
      
      if (window.innerWidth < 768) {
        setActiveApi(mobileApi);
      } else if (mediumScreen) {
        setActiveApi(mediumApi);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileApi, mediumApi]);
  
  // Auto rotation for carousel
  useEffect(() => {
    if (!activeApi) return;
    
    const interval = setInterval(() => {
      let nextIndex = (activeIndex + 1) % features.length;
      setActiveIndex(nextIndex);
      
      if (isMediumScreen) {
        // For medium screens, calculate the pair index
        const pairIndex = Math.floor(nextIndex / 2);
        if (activeApi && typeof activeApi.scrollTo === 'function') {
          activeApi.scrollTo(pairIndex);
        }
      } else {
        // For mobile and large screens
        if (activeApi && typeof activeApi.scrollTo === 'function') {
          activeApi.scrollTo(nextIndex);
        }
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [activeApi, activeIndex, isMediumScreen]);

  // Handle carousel slide changes
  const onSelectMobile = React.useCallback(() => {
    if (!mobileApi) return;
    if (typeof mobileApi.selectedScrollSnap === 'function') {
      const selectedIndex = mobileApi.selectedScrollSnap();
      setActiveIndex(selectedIndex);
    }
  }, [mobileApi]);

  const onSelectMedium = React.useCallback(() => {
    if (!mediumApi) return;
    if (typeof mediumApi.selectedScrollSnap === 'function') {
      const pairIndex = mediumApi.selectedScrollSnap();
      // For the first pair, active could be 0 or 1, for the second pair, active could be 2 or 3
      // We'll default to the first item in each pair (0 or 2)
      const baseIndex = pairIndex * 2;
      setActiveIndex(baseIndex);
    }
  }, [mediumApi]);

  React.useEffect(() => {
    if (mobileApi) {
      mobileApi.on("select", onSelectMobile);
      return () => mobileApi.off("select", onSelectMobile);
    }
  }, [mobileApi, onSelectMobile]);

  React.useEffect(() => {
    if (mediumApi) {
      mediumApi.on("select", onSelectMedium);
      return () => mediumApi.off("select", onSelectMedium);
    }
  }, [mediumApi, onSelectMedium]);

  // Function to handle manual card selection
  const handleCardClick = (index: number) => {
    setActiveIndex(index);
    
    if (window.innerWidth < 768 && mobileApi) {
      if (typeof mobileApi.scrollTo === 'function') {
        mobileApi.scrollTo(index);
      }
    } else if (isMediumScreen && mediumApi) {
      // For medium screens, calculate which pair the clicked item belongs to
      const pairIndex = Math.floor(index / 2);
      if (typeof mediumApi.scrollTo === 'function') {
        mediumApi.scrollTo(pairIndex);
      }
    }
  };

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
        {/* Medium screens - horizontal carousel with 2 visible items */}
        <div className="hidden md:block xl:hidden relative z-10">
          <div className="mx-auto max-w-7xl px-4">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
              setApi={setMediumApi}
            >
              <CarouselContent>
                {/* Create pairs of feature items */}
                {[0, 1].map((pairIndex) => {
                  const startIndex = pairIndex * 2;
                  return (
                    <CarouselItem key={pairIndex} className="basis-full pl-4">
                      <div className="grid grid-cols-2 gap-4">
                        {features.slice(startIndex, startIndex + 2).map((feature, idx) => {
                          const Icon = feature.icon;
                          const actualIndex = startIndex + idx;
                          
                          return (
                            <div
                              key={actualIndex}
                              onClick={() => handleCardClick(actualIndex)}
                              className="flex justify-center"
                            >
                              <div className="rounded-2xl overflow-hidden shadow-lg h-[400px] w-full max-w-sm transition-all duration-300 bg-white hover:shadow-xl hover:-translate-y-1 hover:scale-105 cursor-pointer group">
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
                            </div>
                          );
                        })}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <div className="flex justify-center mt-4 gap-2">
                <CarouselPrevious className="relative static transform-none bg-white hover:bg-gray-100" />
                <CarouselNext className="relative static transform-none bg-white hover:bg-gray-100" />
              </div>
            </Carousel>
          </div>
          
          {/* Pagination dots for medium screens */}
          <div className="flex justify-center mt-8 space-x-2">
            {[0, 1].map((pairIndex) => (
              <button
                key={pairIndex}
                onClick={() => handleCardClick(pairIndex * 2)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(activeIndex / 2) === pairIndex ? "bg-blue-600 w-6" : "bg-white"
                }`}
                aria-label={`Go to slide ${pairIndex + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Large screens - 4 columns grid */}
        <div className="hidden xl:block relative z-10">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid xl:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                
                return (
                  <div
                    key={index}
                    onClick={() => handleCardClick(index)}
                    className="flex justify-center"
                  >
                    <div className="rounded-2xl overflow-hidden shadow-lg h-[400px] w-full max-w-sm transition-all duration-300 bg-white hover:shadow-xl hover:-translate-y-1 hover:scale-105 cursor-pointer group">
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Mobile Carousel - only visible on small screens */}
        <div className="md:hidden mx-auto px-4 relative z-10">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
            setApi={setMobileApi}
          >
            <CarouselContent>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                
                return (
                  <CarouselItem key={index} className="flex justify-center basis-full">
                    <div className="rounded-2xl overflow-hidden shadow-lg mx-auto h-[400px] w-full max-w-xs bg-white hover:scale-105 transition-all duration-300 cursor-pointer group">
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
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="flex justify-center mt-4 gap-2">
              <CarouselPrevious className="relative static transform-none bg-white hover:bg-gray-100" />
              <CarouselNext className="relative static transform-none bg-white hover:bg-gray-100" />
            </div>
          </Carousel>
          
          {/* Pagination dots for mobile */}
          <div className="flex justify-center mt-6 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeIndex === index ? "bg-blue-600 w-6" : "bg-white"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Action button */}
      <div className="container mx-auto text-center mt-16">
        <Link href="/maps">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-base xl:text-xl">
            Jelajahi Peta Sekarang
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Features;