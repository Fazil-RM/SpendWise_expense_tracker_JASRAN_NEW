import React, { useState } from "react";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Save, 
  X,
  TrendingUp,
  Briefcase,
  PiggyBank,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SavingsGoal, 
  Investment,
  cn 
} from "@/src/types";

interface SavingsPageProps {
  savingsGoals: SavingsGoal[];
  investments: Investment[];
  setInvestments: (val: Investment[] | ((prev: Investment[]) => Investment[])) => void;
  monthlySavings: number;
  setMonthlySavings: (val: number) => void;
  formatCurrency: (val: number) => string;
  stats: { income: number; expenses: number; balance: number; savings: number; investments: number; totalAllocation: number };
  isGoalFormOpen: boolean;
  setIsGoalFormOpen: (val: boolean) => void;
  editingGoal: SavingsGoal | null;
  setEditingGoal: (val: SavingsGoal | null) => void;
  newGoalName: string;
  setNewGoalName: (val: string) => void;
  newGoalTarget: string;
  setNewGoalTarget: (val: string) => void;
  newGoalCurrent: string;
  setNewGoalCurrent: (val: string) => void;
  newGoalCategory: string;
  setNewGoalCategory: (val: string) => void;
  handleSaveGoal: () => void;
  handleEditGoal: (goal: SavingsGoal) => void;
  handleDeleteGoal: (id: string) => void;
  handleSaveInvestment: (inv: Omit<Investment, "id">) => void;
  handleDeleteInvestment: (id: string) => void;
}

export default function SavingsPage({
  savingsGoals = [],
  investments = [],
  setInvestments,
  monthlySavings = 0,
  setMonthlySavings,
  formatCurrency,
  stats = { income: 0, expenses: 0, balance: 0, savings: 0, investments: 0, totalAllocation: 0 },
  isGoalFormOpen,
  setIsGoalFormOpen,
  editingGoal,
  setEditingGoal,
  newGoalName,
  setNewGoalName,
  newGoalTarget,
  setNewGoalTarget,
  newGoalCurrent,
  setNewGoalCurrent,
  newGoalCategory,
  setNewGoalCategory,
  handleSaveGoal,
  handleEditGoal,
  handleDeleteGoal,
  handleSaveInvestment,
  handleDeleteInvestment
}: SavingsPageProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isAddingInvestment, setIsAddingInvestment] = useState(false);
  const [invName, setInvName] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invType, setInvType] = useState("Stocks");

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName || !invAmount) return;
    
    // Call the database handler to persist investment
    handleSaveInvestment({
      name: invName,
      amount: parseFloat(invAmount),
      type: invType,
      date: new Date().toISOString().split("T")[0]
    });
    
    setInvName("");
    setInvAmount("");
    setIsAddingInvestment(false);
  };

  const removeInvestment = (id: string) => {
    // Call the database handler to delete investment
    handleDeleteInvestment(id);
  };

  const safeInvestments = Array.isArray(investments) ? investments : [];
  const safeGoals = Array.isArray(savingsGoals) ? savingsGoals : [];
  
  const totalInvested = safeInvestments.reduce((acc, inv) => acc + (inv?.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Monthly Savings Config (Merge to Income) */}
      <div className="bg-stone-900 dark:bg-stone-50 p-8 rounded-[2.5rem] text-white dark:text-stone-900 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500">
              <PiggyBank size={18} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Monthly Savings Target</span>
            </div>
            <h2 className="text-3xl font-serif italic font-bold">Income Allocation</h2>
            <p className="text-stone-400 dark:text-stone-500 text-sm max-w-md">
              Set aside a portion of your income automatically. This amount is treated as a priority deduction from your monthly earnings.
            </p>
          </div>
          <div className="bg-white/10 dark:bg-app-card/10 p-6 rounded-3xl backdrop-blur-md border border-white/10 dark:border-stone-900/10 min-w-[280px]">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold opacity-60 mb-2 block">Monthly Savings Target</label>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-mono font-bold">{formatCurrency(monthlySavings)}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max={Math.max(stats.income || 0, 100000)} 
                    step="500"
                    value={monthlySavings}
                    onChange={(e) => setMonthlySavings(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-white/20 dark:bg-app-card/20 rounded-full appearance-none cursor-pointer accent-white dark:accent-stone-900"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10 dark:border-stone-900/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] opacity-60 uppercase font-bold">Monthly Investments</span>
                  <span className="text-sm font-mono font-bold">{formatCurrency(stats.investments || 0)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] opacity-60 uppercase font-bold text-emerald-400">Total Allocation</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{formatCurrency(stats.totalAllocation || 0)}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10 dark:border-stone-900/10">
                  <span className="text-[10px] opacity-60 uppercase font-bold">Available for Spending</span>
                  <span className="text-sm font-mono font-bold">{formatCurrency(Math.max((stats.income || 0) - (stats.totalAllocation || 0), 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 dark:bg-app-card/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Savings Goals Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-app-card p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif italic font-bold dark:text-stone-50">Savings Goals</h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm">Track your long-term financial objectives.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingGoal(null);
                  setNewGoalName("");
                  setNewGoalTarget("");
                  setNewGoalCurrent("");
                  setNewGoalCategory("");
                  setIsGoalFormOpen(!isGoalFormOpen);
                }}
                className="p-3 bg-stone-100 dark:bg-app-card-alt rounded-2xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-stone-600 dark:text-stone-400"
              >
                <PlusCircle size={20} />
              </button>
            </div>

            {/* Goal Form */}
            <AnimatePresence>
              {isGoalFormOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-stone-50 dark:bg-app-card-alt p-6 rounded-2xl border border-stone-100 dark:border-stone-700 space-y-4 mb-6">
                    <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500">
                      {editingGoal ? "Edit Goal" : "Add New Goal"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 ml-1">Goal Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. New Car"
                          value={newGoalName}
                          onChange={(e) => setNewGoalName(e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 ml-1">Category</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Travel"
                          value={newGoalCategory}
                          onChange={(e) => setNewGoalCategory(e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 ml-1">Target Amount</label>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          value={newGoalTarget}
                          onChange={(e) => setNewGoalTarget(e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 ml-1">Current Savings</label>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          value={newGoalCurrent}
                          onChange={(e) => setNewGoalCurrent(e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSaveGoal}
                        className="flex-1 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 py-3 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={18} /> {editingGoal ? "Update" : "Add"} Goal
                      </button>
                      <button 
                        onClick={() => setIsGoalFormOpen(false)}
                        className="px-4 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-50 dark:hover:bg-app-card-alt transition-all dark:text-stone-200"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-4">
              {safeGoals.map(goal => {
                const percent = Math.min(((goal.current || 0) / (goal.target || 1)) * 100, 100);
                return (
                  <div key={goal.id} className="group p-6 bg-stone-50 dark:bg-app-card-alt/50 rounded-3xl border border-stone-100 dark:border-stone-700 hover:border-stone-200 dark:hover:border-stone-600 transition-all relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-app-card flex items-center justify-center text-stone-400 shadow-sm">
                          <PiggyBank size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 dark:text-stone-100">{goal.name}</h3>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 dark:text-stone-500">
                            {goal.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditGoal(goal)} className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 text-stone-400 hover:text-rose-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-end justify-between mb-2">
                      <span className="text-xl font-mono font-bold text-stone-900 dark:text-stone-50">{formatCurrency(goal.current || 0)}</span>
                      <span className="text-xs font-bold text-stone-500 dark:text-stone-400">{percent.toFixed(1)}% of {formatCurrency(goal.target || 0)}</span>
                    </div>
                    
                    <div className="w-full bg-stone-200 dark:bg-app-card-alt h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className="bg-stone-900 dark:bg-stone-50 h-full"
                      />
                    </div>
                  </div>
                );
              })}
              {safeGoals.length === 0 && (
                <div className="text-center py-12 border border-dashed border-stone-100 dark:border-stone-800 rounded-3xl">
                  <p className="text-stone-400 text-sm italic">Create your first savings goal.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Investments Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-app-card p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-serif italic font-bold dark:text-stone-50">Investments</h2>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Wealth Generation</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddingInvestment(!isAddingInvestment)}
                className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <PlusCircle size={20} />
              </button>
            </div>

            <div className="p-6 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10">
              <span className="text-[10px] uppercase font-bold text-emerald-600/60 block mb-1">Total Invested Portfolio</span>
              <span className="text-3xl font-mono font-bold text-emerald-600">{formatCurrency(totalInvested)}</span>
            </div>

            <AnimatePresence>
              {isAddingInvestment && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 bg-stone-50 dark:bg-app-card-alt rounded-2xl border border-stone-100 dark:border-stone-700 space-y-4"
                >
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Investment Name (e.g. Apple Stocks)"
                      value={invName}
                      onChange={(e) => setInvName(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-stone-200"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="number" 
                        placeholder="Amount"
                        value={invAmount}
                        onChange={(e) => setInvAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-stone-200"
                      />
                      <select 
                        value={invType}
                        onChange={(e) => setInvType(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-stone-200 appearance-none"
                      >
                        <option>Stocks</option>
                        <option>Mutual Funds</option>
                        <option>Crypto</option>
                        <option>Real Estate</option>
                        <option>Gold</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleAddInvestment}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                    >
                      Add Investment
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {safeInvestments.map(inv => (
                <div key={inv.id} className="p-4 bg-stone-50 dark:bg-app-card-alt/50 rounded-2xl border border-stone-100 dark:border-stone-800 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-app-card flex items-center justify-center text-stone-400 shadow-sm">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{inv.name}</h4>
                      <span className="text-[10px] text-stone-400 uppercase font-mono">{inv.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-emerald-600">{formatCurrency(inv.amount || 0)}</span>
                    <button 
                      onClick={() => removeInvestment(inv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {safeInvestments.length === 0 && (
                <div className="text-center py-8 border border-dashed border-stone-100 dark:border-stone-800 rounded-2xl">
                  <p className="text-stone-400 text-xs italic">No investments tracked yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}