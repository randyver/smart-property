"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Description from "@/components/Description";
import Features from "@/components/Features";
import Counter from "@/components/Counter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Description />
        <Features />
        <Counter />
      </main>
      <Footer />
    </div>
  );
}