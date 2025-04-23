"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Earth } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-28 pb-16 bg-gradient-to-br from-white to-smartproperty-light min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-smartproperty-dark leading-tight mb-4">
            Find Your Climate-Safe Dream Home Today
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Discover properties that protect your investment from environmental
            risks through advanced GIS analysis.
          </p>
          <motion.div
            className="mt-16 flex justify-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <a href="/dashboard">
              <Button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-smartproperty to-smartproperty-dark px-8 py-6 text-lg font-medium text-white shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <span className="relative z-10">Explore Map Now</span>
                <span className="absolute inset-0 bg-gradient-to-r from-smartproperty-dark to-smartproperty opacity-0 transition-opacity duration-500 hover:opacity-100"></span>
              </Button>
            </a>
          </motion.div>
        </div>
        <div className="md:w-1/2 flex justify-center animate-scale-in">
          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 bg-smartproperty rounded-full opacity-10 animate-pulse"></div>
            <div className="absolute inset-4 bg-white rounded-full shadow-xl flex items-center justify-center">
              <Earth
                size={120}
                className="text-smartproperty"
                strokeWidth={1}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
