"use client";

import { motion } from "framer-motion";
import { CloudSun, House, Map, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-all duration-500 hover:shadow-lg flex items-center justify-center"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
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
  return (
    <section className="relative overflow-hidden py-16 bg-gradient-to-b from-gray-50 to-white min-h-screen flex items-center justify-center">
      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-smartproperty/10 blur-3xl"></div>
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-smartproperty-dark/10 blur-3xl"></div>

      <div className="container relative mx-auto px-4">
        <motion.h2
          className="text-center text-3xl font-bold text-gray-800 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="bg-gradient-to-r from-smartproperty to-smartproperty-dark bg-clip-text text-transparent">
            Our Key Features
          </span>
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={CloudSun}
            title="Climate Property Scoring"
            description="Evaluate properties based on climate risk factors and sustainability metrics."
          />

          <FeatureCard
            icon={House}
            title="Property Comparison"
            description="Compare multiple properties side by side with detailed climate analysis."
          />

          <FeatureCard
            icon={Map}
            title="Interactive GIS Maps"
            description="Visualize climate data with advanced mapping technologies and layers."
          />

          <FeatureCard
            icon={MessageSquare}
            title="AI Assistant"
            description="Get property recommendations and answers to climate questions instantly."
          />
        </div>

        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a href="/dashboard">
            <Button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-smartproperty to-smartproperty-dark px-8 py-6 text-lg font-medium text-white shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <span className="relative z-10">Explore All Features</span>
              <span className="absolute inset-0 bg-gradient-to-r from-smartproperty-dark to-smartproperty opacity-0 transition-opacity duration-500 hover:opacity-100"></span>
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
