import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, Sparkles, User, ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/src/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAlert } from "@/src/components/AlertProvider";

export default function SignupPage({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      onLogin();
      navigate("/");
    } catch (error: any) {
      showAlert("error", error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin();
      navigate("/");
    } catch (error: any) {
      showAlert("error", error.message || "Google signup failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-app-bg flex flex-col items-center justify-center p-4 font-sans overflow-y-auto">
      <div className="w-full max-w-md mb-3">
        <Link to="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-xs font-bold group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-app-card p-6 md:p-8 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-xl space-y-4"
      >
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-serif italic font-bold tracking-tight dark:text-stone-50">Create Account</h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs">Join SpendWise and start your wealth journey.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest font-bold text-stone-400 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-app-card-alt border border-stone-100 dark:border-stone-700 dark:text-stone-200 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest font-bold text-stone-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-app-card-alt border border-stone-100 dark:border-stone-700 dark:text-stone-200 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest font-bold text-stone-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-stone-50 dark:bg-app-card-alt border border-stone-100 dark:border-stone-700 dark:text-stone-200 text-sm outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-center text-stone-400 leading-relaxed px-2">
              By creating an account, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
            <button 
              type="submit" disabled={loading}
              className="w-full bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 py-3.5 rounded-xl font-bold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Create Account"}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100 dark:border-stone-800"></div></div>
          <div className="relative flex justify-center text-[10px] font-mono uppercase"><span className="bg-white dark:bg-app-card px-3 text-stone-400">Social Signup</span></div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleGoogleSignup} disabled={googleLoading}
            className="w-full bg-white dark:bg-app-card-alt text-stone-900 dark:text-stone-50 py-3 rounded-xl font-bold border border-stone-200 dark:border-stone-700 hover:bg-stone-50 transition-all flex items-center justify-center gap-3 text-sm"
          >
            {googleLoading ? <div className="w-4 h-4 border-2 border-stone-900 rounded-full animate-spin" /> : <><svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Google</>}
          </button>
          <div className="flex items-center justify-center gap-2 text-[9px] font-mono uppercase tracking-widest text-stone-400">
            <ShieldCheck size={10} />
            Your data is safe with us
          </div>
        </div>

        <div className="text-center">
          <p className="text-stone-500 dark:text-stone-400 text-xs">
            Already a member? <Link to="/login" className="text-stone-900 dark:text-stone-50 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}