import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AboutSection3 from "../components/ui/about-section";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-app-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-app-bg/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl font-serif italic font-bold tracking-tight">SpendWise</span>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </nav>

      <main className="pt-20">
        <AboutSection3 />
      </main>

      <footer className="py-20 px-6 border-t border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <span className="font-serif italic font-bold tracking-tight">SpendWise</span>
          </div>
          <p className="text-xs text-stone-400 font-mono uppercase tracking-widest">© 2026 SpendWise. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
