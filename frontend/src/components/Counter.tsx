"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Home, MapPin, Map, Thermometer } from "lucide-react";

// Updated stats with new values and icons
const stats = [
  {
    icon: Home,
    value: 500,
    symbol: "+",
    label: "Properti"
  },
  {
    icon: MapPin,
    value: 2,
    symbol: "+",
    label: "Kota"
  },
  {
    icon: Map,
    value: 50,
    symbol: "+",
    label: "Kecamatan"
  },
  {
    icon: Thermometer,
    value: 8,
    symbol: "+",
    label: "Parameter Iklim & Tata Kota"
  },
];

// Animated counter component
const AnimatedCounter = ({ value = 0, duration = 2000, symbol = "" }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: "0px 0px -50px 0px" });
 
  useEffect(() => {
    if (!isInView) return;
   
    let startTime: number;
    let animationFrame: number;
   
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
     
      setCount(Math.floor(progress * value));
     
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(value);
      }
    };
   
    animationFrame = requestAnimationFrame(updateCount);
   
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, isInView]);
 
  return (
    <div ref={nodeRef} className="inline-flex items-baseline">
      <span className="text-blue-600 text-5xl md:text-6xl font-bold">{count}</span>
      <span className="text-blue-600 text-4xl md:text-5xl font-bold ml-1">{symbol}</span>
    </div>
  );
};

const Counter = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });
 
  return (
    <section
      ref={containerRef}
      className="py-24 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden min-h-screen flex items-center justify-center"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Heading and subheading */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-black mb-4"
          >
            SmartProperty <span className="text-blue-600">Dalam Angka</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Data kami terus berkembang untuk memberikan pengalaman terbaik dalam penilaian properti 
            berbasis iklim di Indonesia
          </motion.p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="bg-blue-500/30 p-5 rounded-full mb-6 border-2 border-blue-400/30 shadow-inner">
                  <Icon className="h-10 w-10 text-blue-600" />
                </div>
                <div className="mb-3 text-blue-600">
                  <AnimatedCounter
                    value={stat.value}
                    symbol={stat.symbol}
                    duration={2000}
                  />
                </div>
                <p className="text-blue-600 text-xl font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Counter;