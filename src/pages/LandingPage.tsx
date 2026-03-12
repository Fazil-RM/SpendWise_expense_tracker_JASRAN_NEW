import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import RuixenBentoCards from "../components/ui/ruixen-bento-cards";

interface LandingPageProps {
  isDarkMode: boolean;
}

export default function LandingPage({ isDarkMode }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-app-bg text-stone-900 dark:text-stone-100 font-sans selection:bg-stone-900 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-app-bg/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-serif italic font-bold tracking-tight">SpendWise</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-500">
            <a href="#features" className="hover:text-stone-900 transition-colors">Features</a>
            <Link to="/about" className="hover:text-stone-900 transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Login</Link>
            <Link 
              to="/signup" 
              className="bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-lg shadow-stone-200 dark:shadow-none"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 dark:bg-app-card-alt text-stone-600 dark:text-stone-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} />
              The Future of Personal Finance
            </span>
            <h1 className="text-6xl md:text-8xl font-serif italic font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto">
              Master Your Wealth with <span className="text-stone-400">Intelligence.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed"
          >
            SpendWise combines elegant design with AI-powered insights to help you track spending, set budgets, and grow your investments seamlessly.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link 
              to="/signup" 
              className="w-full sm:w-auto bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 px-10 py-5 rounded-full text-lg font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-2xl shadow-stone-300 dark:shadow-none flex items-center justify-center gap-2 group"
            >
              Start Your Journey
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-10 py-5 rounded-full text-lg font-bold border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-app-card-alt transition-all">
              Watch Demo
            </button>
          </motion.div>

          {/* Hero Image / Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="rounded-[3rem] overflow-hidden border border-stone-200 dark:border-stone-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">
              <img 
                src="https://ik.imagekit.io/fazil/Screenshot%202026-03-10%20150103.png" 
                alt="SpendWise Dashboard Preview" 
                className="w-full h-auto grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* GradualBlur Removed */}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <RuixenBentoCards />
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <span className="font-serif italic font-bold tracking-tight">SpendWise</span>
          </div>
          
          <div className="flex gap-10 text-sm font-medium text-stone-400">
            <a href="#" className="hover:text-stone-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Security</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Contact</a>
          </div>

          <p className="text-xs text-stone-400 font-mono uppercase tracking-widest">© 2026 SpendWise. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}