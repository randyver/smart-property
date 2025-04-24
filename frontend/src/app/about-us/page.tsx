"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Footer from "@/components/Footer";
import Image from "next/image";

// Team member data
const teamMembers = [
  {
    name: "Emery Fathan Zwageri",
    institution: "Bandung Institute of Technology",
    role: "Machine Learning Engineer",
    photo: "/profile.png", // Replace with actual photo path
    linkedin: "https://www.linkedin.com/in/emery-fathan-zwageri",
  },{
    name: "Randy Verdian",
    institution: "Bandung Institute of Technology",
    role: "Fullstack Developer",
    photo: "/profile.png", // Replace with actual photo path
    linkedin: "https://www.linkedin.com/in/randy-verdian",
  },
  {
    name: "Hega Fauzia Avilah",
    institution: "University of Indonesia",
    role: "Spatial Data Analyst",
    photo: "/profile.png", // Replace with actual photo path
    linkedin: "https://www.linkedin.com/in/hega-fauzia-avilah-402590258",
  },
  {
    name: "Moch Kahfi Tri Agfria S.",
    institution: "University of Indonesia",
    role: "Spatial Data Analyst",
    photo: "/profile.png", // Replace with actual photo path
    linkedin: "https://www.linkedin.com/in/moch-kahfi-tri-agfria-sumitra-26a223247",
  }
];

// Our mission and vision statements
const aboutContent = {
  mission: "Our mission is to empower property buyers and developers with climate data-driven insights, helping them make sustainable investment decisions in an era of climate change.",
  vision: "We envision a future where climate resilience becomes a standard consideration in property development and purchasing decisions.",
  story: "SmartProperty was born from the realization that climate change is significantly impacting property values and living conditions. Our team of passionate technologists and environmental scientists came together to address this gap in the real estate market.",
  approach: "Using advanced Geographic Information Systems (GIS), we analyze various environmental parameters to generate comprehensive climate risk assessments for properties."
};

// Technology stack information
const techStack = [
  { name: "React & Next.js", category: "Frontend" },
  { name: "Flask", category: "Backend" },
  { name: "Geodata Mapid & Landsat", category: "Data Source" },
  { name: "MAPID MAPS", category: "Base Maps" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "ArcGIS Pro", category: "Spatial Analysis" }
];

export default function AboutUs() {
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About <span className="text-blue-600">SmartProperty</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Finding climate-safe properties through advanced GIS analysis and environmental data science
          </p>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:w-1/2"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {aboutContent.story}
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              {aboutContent.approach}
            </p>
            <div className="mt-8 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-700">Our Mission</h3>
                <p className="text-gray-700">{aboutContent.mission}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-700">Our Vision</h3>
                <p className="text-gray-700">{aboutContent.vision}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="md:w-1/2"
          >
            <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/kota-bandung.jpg" // Replace with actual image
                alt="Climate analysis illustration"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/70 to-transparent flex items-end p-8">
                <div className="text-white">
                  <div className="font-bold text-xl mb-2">Climate-Safe Analysis</div>
                  <p className="text-white/80">
                    Integrating climate data with property metrics for informed decisions
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Team - <span className="text-blue-600">El Nino La Nina</span></h2>
            <p className="text-gray-600">
              Meet the passionate experts behind SmartProperty, combining expertise in software development, 
              data science, and spatial analysis to revolutionize property evaluation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-64 bg-gradient-to-br from-blue-500 to-blue-700">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-white">
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback for missing images
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0D8ABC&color=fff&size=262`;
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-500 text-sm mb-4">{member.institution}</p>
                  <div className="flex gap-3">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Technology</h2>
          <p className="text-gray-600">
            SmartProperty utilizes cutting-edge technologies to deliver accurate climate risk assessments and property insights.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.05 * index }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{tech.category}</span>
              <h3 className="mt-1 font-medium text-gray-800">{tech.name}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}