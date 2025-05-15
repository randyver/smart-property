"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, Leaf } from "lucide-react";

const Description = () => {
  // Animation for the floating icon
  const floatingAnimation = {
    y: [0, -15, 0],
    rotate: [0, 5, 0, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <section className="min-h-screen py-16 bg-gradient-to-b from-blue-50 to-white flex items-center">
      <div className="container mx-auto">
        <div className="mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-16"
          >
            Welcome to <span className="text-blue-600">Smart Property</span>
          </motion.h2>

          <div className="flex flex-col md:flex-row items-center gap-20 p-8">
            {/* Animated Icon - Changed to Home and Leaf icons */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={floatingAnimation}
                className="bg-blue-100 p-8 rounded-full"
              >
                <Home className="h-16 w-16 lg:h-20 lg:w-20 xl:h-60 xl:w-60 text-blue-600" />
              </motion.div>

              {/* Small leaf icon with separate animation */}
              <motion.div
                className="absolute -top-2 -right-2 bg-green-100 p-2 rounded-full"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 10, 0, -10, 0],
                  transition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  },
                }}
              >
                <Leaf className="h-8 w-8 xl:h-20 xl:w-20 text-green-600" />
              </motion.div>
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <p className="text-base text-justify md:text-lg text-gray-600 leading-relaxed mb-6">
                SmartProperty mengintegrasikan analisis iklim berbasis GIS untuk
                evaluasi properti yang lebih komprehensif. Platform kami
                menganalisis parameter iklim seperti suhu permukaan tanah,
                indeks vegetasi, dan efek pulau panas perkotaan untuk memberikan
                skor keamanan iklim yang akurat pada setiap properti. Kami
                membantu Anda menemukan properti yang tidak hanya memenuhi
                kebutuhan estetika dan fungsional, tetapi juga tahan terhadap
                risiko perubahan iklim jangka panjang. Dengan SmartProperty,
                Anda dapat membuat keputusan investasi properti yang lebih
                cerdas dan berkelanjutan di tengah tantangan iklim yang semakin
                nyata.
              </p>
              <div className="text-center md:text-right">
                <Link href="/about-us">
                  <Button
                    variant="outline"
                    className="rounded-full border-blue-400 text-blue-600 hover:text-blue-700 px-8 text-base xl:text-xl"
                  >
                    Baca Selengkapnya
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Description;
