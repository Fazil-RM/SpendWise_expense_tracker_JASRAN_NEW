import React from "react";
import { 
  Coins, 
  Download, 
  ChevronRight,
  Moon,
  Sun,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  LogOut,
  User,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CURRENCIES, 
  cn,
  UserDetails
} from "@/src/types";

interface SettingsPageProps {
  currency: string;
  setCurrency: (val: string) => void;
  isCurrencyOpen: boolean;
  setIsCurrencyOpen: (val: boolean) => void;
  isExportOpen: boolean;
  setIsExportOpen: (val: boolean) => void;
  exportStartDate: string;
  setExportStartDate: (val: string) => void;
  exportEndDate: string;
  setExportEndDate: (val: string) => void;
  handleExportExcel: () => void;
  handleExportPDF: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  userDetails: UserDetails;
  setUserDetails: (val: UserDetails) => void;
  handleClearData: () => void;
  logout: () => void;
  // Feedback props
  feedbackMessage: string;
  setFeedbackMessage: (val: string) => void;
  feedbackSent: boolean;
  handleFeedbackSubmit: (e: React.FormEvent) => void;
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-stone-50 dark:bg-app-card-alt/50 rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-800">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 font-bold flex justify-between items-center text-left focus:outline-none dark:text-stone-200"
      >
        <span className="text-sm">{question}</span>
        <ChevronDown 
          className={cn("transition-transform duration-300 text-stone-400", isOpen && "rotate-180")} 
          size={18}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 text-xs text-stone-600 dark:text-stone-400">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function SettingsPage({
  currency,
  setCurrency,
  isCurrencyOpen,
  setIsCurrencyOpen,
  isExportOpen,
  setIsExportOpen,
  exportStartDate,
  setExportStartDate,
  exportEndDate,
  setExportEndDate,
  handleExportExcel,
  handleExportPDF,
  isDarkMode,
  setIsDarkMode,
  userDetails,
  setUserDetails,
  handleClearData,
  logout,
  feedbackMessage,
  setFeedbackMessage,
  feedbackSent,
  handleFeedbackSubmit
}: SettingsPageProps) {
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <div className="bg-white dark:bg-app-card p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-8 transition-colors duration-300">
      <h2 className="text-2xl font-serif italic font-bold dark:text-stone-50">Settings</h2>
      <div className="space-y-6">
        {/* Storage Status */}
        <div className="p-6 bg-stone-50 dark:bg-app-card-alt/50 rounded-3xl border border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
            <div>
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">Cloud Sync Active</h3>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
                Real-time Firebase Persistence
              </p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-stone-400 bg-white dark:bg-app-card-alt px-2 py-1 rounded border border-stone-100 dark:border-stone-700">
            v1.2.0-cloud
          </div>
        </div>

        {/* Appearance Toggle */}
        <div className="p-6 bg-stone-50 dark:bg-app-card-alt/50 rounded-3xl border border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-app-card-alt flex items-center justify-center shadow-sm text-stone-400 dark:text-stone-500">
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">Appearance</h3>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
                {isDarkMode ? "Dark Mode Active" : "Light Mode Active"}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none",
              isDarkMode ? "bg-emerald-500" : "bg-stone-200"
            )}
          >
            <motion.div 
              animate={{ x: isDarkMode ? 24 : 4 }}
              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Profile Details (Moved from Nav to Settings) */}
        <div className="space-y-2">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full flex items-center justify-between p-4 bg-stone-50 dark:bg-app-card-alt/50 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all group border border-transparent dark:border-stone-800"
          >
            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-app-card-alt flex items-center justify-center shadow-sm text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-colors">
                <User size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold dark:text-stone-200">Profile Details</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Personal Information</p>
              </div>
            </div>
            <ChevronRight className={cn("text-stone-300 transition-transform duration-300", isProfileOpen && "rotate-90")} size={20} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-stone-50/50 dark:bg-app-card-alt/25 rounded-3xl space-y-4 mt-2 border border-stone-100 dark:border-stone-800">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-600" size={16} />
                        <input 
                          type="text" 
                          value={userDetails.name}
                          onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-600" size={16} />
                        <input 
                          type="email" 
                          value={userDetails.email}
                          onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Currency Selection */}
        <div className="space-y-2">
          <button 
            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
            className="w-full flex items-center justify-between p-4 bg-stone-50 dark:bg-app-card-alt/50 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all group border border-transparent dark:border-stone-800"
          >
            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-app-card-alt flex items-center justify-center shadow-sm text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-colors">
                <Coins size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold dark:text-stone-200">Currency Preference</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Current: {currency}</p>
              </div>
            </div>
            <ChevronRight className={cn("text-stone-300 transition-transform duration-300", isCurrencyOpen && "rotate-90")} size={20} />
          </button>
          
          <AnimatePresence>
            {isCurrencyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CURRENCIES.map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => setCurrency(curr.code)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                        currency === curr.code 
                          ? "bg-stone-900 dark:bg-stone-50 border-stone-900 dark:border-stone-50 text-white dark:text-stone-900 shadow-lg" 
                          : "bg-white dark:bg-app-card-alt border-stone-100 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-200 dark:hover:border-stone-600"
                      )}
                    >
                      <div className="text-left">
                        <p className="font-bold text-sm">{curr.name}</p>
                        <p className="text-[10px] opacity-60">{curr.code}</p>
                      </div>
                      <span className="text-lg font-mono">{curr.symbol}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Export Data */}
        <div className="space-y-2">
          <button 
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="w-full flex items-center justify-between p-4 bg-stone-50 dark:bg-app-card-alt/50 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all group border border-transparent dark:border-stone-800"
          >
            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-app-card-alt flex items-center justify-center shadow-sm text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-colors">
                <Download size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold dark:text-stone-200">Export Your Data</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Excel & PDF Reports</p>
              </div>
            </div>
            <ChevronRight className={cn("text-stone-300 transition-transform duration-300", isExportOpen && "rotate-90")} size={20} />
          </button>

          <AnimatePresence>
            {isExportOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-stone-50/50 dark:bg-app-card-alt/25 rounded-3xl space-y-4 mt-2 border border-stone-100 dark:border-stone-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 ml-1">Start Date</label>
                      <input 
                        type="date" 
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 ml-1">End Date</label>
                      <input 
                        type="date" 
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button 
                      onClick={handleExportExcel}
                      className="flex-1 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 py-3 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={18} /> Export Excel
                    </button>
                    <button 
                      onClick={handleExportPDF}
                      className="flex-1 bg-white dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-200 py-3 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={18} /> Export PDF
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help & Support */}
        <div className="space-y-2">
          <button 
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="w-full flex items-center justify-between p-4 bg-stone-50 dark:bg-app-card-alt/50 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all group border border-transparent dark:border-stone-800"
          >
            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-app-card-alt flex items-center justify-center shadow-sm text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-colors">
                <HelpCircle size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold dark:text-stone-200">Help & Support</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">FAQs & Feedback</p>
              </div>
            </div>
            <ChevronRight className={cn("text-stone-300 transition-transform duration-300", isHelpOpen && "rotate-90")} size={20} />
          </button>

          <AnimatePresence>
            {isHelpOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-stone-50/50 dark:bg-app-card-alt/25 rounded-3xl space-y-6 mt-2 border border-stone-100 dark:border-stone-800">
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Frequently Asked Questions</h4>
                    <FAQItem 
                      question="How do I add an income?" 
                      answer="Click the 'Add Transaction' button and toggle to 'Income' at the top of the form." 
                    />
                    <FAQItem 
                      question="Can I change the currency?" 
                      answer="Yes! Use the 'Currency Preference' setting above to select your preferred currency." 
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2 text-stone-400">
                      <MessageSquare size={16} />
                      <h4 className="text-[10px] uppercase tracking-widest font-bold">Send Feedback</h4>
                    </div>
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                      <textarea 
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Tell us what you think..."
                        className="w-full p-4 bg-white dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 text-sm min-h-[100px]"
                        required
                      />
                      <button 
                        type="submit"
                        disabled={feedbackSent}
                        className="w-full bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 py-3 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all disabled:opacity-50"
                      >
                        {feedbackSent ? "Feedback Received!" : "Submit Feedback"}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-stone-100 dark:border-stone-800 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-rose-500 mb-4">Danger Zone</h3>
          
          <div className="p-6 bg-stone-50 dark:bg-app-card-alt/50 rounded-3xl border border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">Sign Out</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">Securely log out of your SpendWise account on this device.</p>
            </div>
            <button 
              onClick={logout}
              className="w-full sm:w-auto px-6 py-3 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>

          <div className="p-6 bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-100 dark:border-rose-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-400">Clear All Account Data</h4>
              <p className="text-xs text-rose-600 dark:text-rose-500/80">This will permanently delete all transactions, budgets, and goals from your cloud account.</p>
            </div>
            <button 
              onClick={handleClearData}
              className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 dark:shadow-none"
            >
              Clear Everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
