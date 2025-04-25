"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CloudSun, House, Map, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

// Animation variants for consistent animations
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Animation variant specifically for hover effect
const hoverAnimation = {
  rest: { y: 0 },
  hover: {
    y: -5,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
  inView,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
  inView: boolean;
}) => {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg flex items-center justify-center"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeInUp}
      custom={index}
      whileHover="hover"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-smartproperty/5 to-smartproperty-dark/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

      <div className="relative z-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-smartproperty to-smartproperty-dark p-3 shadow-sm">
          <Icon className="h-8 w-8 text-white" />
        </div>

        <h3 className="mb-3 text-center text-xl font-semibold text-gray-800">
          {title}
        </h3>
        <p className="text-center text-gray-600 transition-colors duration-300 group-hover:text-gray-800">
          {description}
        </p>

        <div className="mt-6 flex justify-center">
          <span className="inline-block h-0.5 w-8 bg-gradient-to-r from-smartproperty to-smartproperty-dark opacity-0 transition-all duration-300 group-hover:w-16 group-hover:opacity-100"></span>
        </div>
      </div>
    </motion.div>
  );
};

const Features = () => {
  // Create a single ref for the entire section
  const sectionRef = useRef(null);

  // Check if section is in view - this will trigger just once
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.1, // Trigger when 10% of the section is visible
  });

  // Feature data for cleaner rendering
  const features = [
    {
      icon: CloudSun,
      title: "Penilaian Properti Iklim",
      description:
        "Evaluasi properti berdasarkan faktor risiko iklim dan metrik keberlanjutan.",
    },
    {
      icon: House,
      title: "Perbandingan Properti",
      description:
        "Bandingkan beberapa properti secara berdampingan dengan analisis iklim yang terperinci.",
    },
    {
      icon: Map,
      title: "Peta GIS Interaktif",
      description:
        "Visualisasikan data iklim dengan teknologi pemetaan canggih dan lapisan-lapisan.",
    },
    {
      icon: MessageSquare,
      title: "Asisten AI",
      description:
        "Dapatkan rekomendasi properti dan jawaban atas pertanyaan iklim secara instan.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-16 bg-gradient-to-b from-gray-50 to-white min-h-screen flex items-center justify-center"
    >
      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-smartproperty/10 blur-3xl"></div>
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-smartproperty-dark/10 blur-3xl"></div>

      <div className="container relative mx-auto px-4">
        <motion.h2
          className="text-center text-3xl font-bold text-gray-800 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <span className="bg-gradient-to-r from-smartproperty to-smartproperty-dark bg-clip-text text-transparent">
            Fitur Utama Kami
          </span>
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: 0.2 + index * 0.1,
              }}
            >
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-smartproperty/5 to-smartproperty-dark/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                <div className="relative z-10">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-smartproperty to-smartproperty-dark p-3 shadow-sm">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="mb-3 text-center text-xl font-semibold text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-center text-gray-600 transition-colors duration-300 group-hover:text-gray-800">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex justify-center">
                    <span className="inline-block h-0.5 w-8 bg-gradient-to-r from-smartproperty to-smartproperty-dark opacity-0 transition-all duration-300 group-hover:w-16 group-hover:opacity-100"></span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
        >
          <a href="/dashboard">
            <Button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-smartproperty to-smartproperty-dark px-8 py-6 text-lg font-medium text-white shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <span className="relative z-10">Jelajahi semua fitur</span>
              <span className="absolute inset-0 bg-gradient-to-r from-smartproperty-dark to-smartproperty opacity-0 transition-opacity duration-500 hover:opacity-100"></span>
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
