import React from "react";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Save, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Transaction, 
  BudgetCategory, 
  cn 
} from "@/src/types";

interface BudgetPageProps {
  budgets: BudgetCategory[];
  transactions: Transaction[];
  formatCurrency: (val: number) => string;
  isBudgetOpen: boolean; // Renamed for consistency if needed, but keeping your prop names
  isBudgetFormOpen: boolean;
  setIsBudgetFormOpen: (val: boolean) => void;
  editingBudget: BudgetCategory | null;
  setEditingBudget: (val: BudgetCategory | null) => void;
  newBudgetName: string;
  setNewBudgetName: (val: string) => void;
  newBudgetLimit: string;
  setNewBudgetLimit: (val: string) => void;
  handleSaveBudget: () => void;
  handleEditBudget: (budget: BudgetCategory) => void;
  handleDeleteBudget: (id: string) => void;
}

export default function BudgetPage({
  budgets,
  transactions,
  formatCurrency,
  isBudgetFormOpen,
  setIsBudgetFormOpen,
  editingBudget,
  setEditingBudget,
  newBudgetName,
  setNewBudgetName,
  newBudgetLimit,
  setNewBudgetLimit,
  handleSaveBudget,
  handleEditBudget,
  handleDeleteBudget
}: BudgetPageProps) {
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-app-card p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif italic font-bold dark:text-stone-50">Budget Planning</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              Tracking spending for <span className="font-bold text-stone-900 dark:text-stone-200">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>.
            </p>
          </div>
          <button 
            onClick={() => {
              if (isBudgetFormOpen && !editingBudget) {
                setIsBudgetFormOpen(false);
              } else {
                setEditingBudget(null);
                setNewBudgetName("");
                setNewBudgetLimit("");
                setIsBudgetFormOpen(true);
              }
            }}
            className={cn(
              "p-2 rounded-full transition-all",
              isBudgetFormOpen && !editingBudget ? "bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900" : "bg-stone-100 dark:bg-app-card-alt text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
            )}
          >
            {isBudgetFormOpen && !editingBudget ? <X size={20} /> : <PlusCircle size={20} />}
          </button>
        </div>

        {/* Budget Form */}
        <AnimatePresence>
          {isBudgetFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-stone-50 dark:bg-app-card-alt p-6 rounded-2xl border border-stone-100 dark:border-stone-700 space-y-4 mb-4">
                <h3 className={cn("text-xs font-mono uppercase tracking-widest font-bold", editingBudget ? "text-amber-600 dark:text-amber-400" : "text-stone-400 dark:text-stone-500")}>
                  {editingBudget ? "Edit Category" : "Add New Category"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Category Name"
                    value={newBudgetName}
                    onChange={(e) => setNewBudgetName(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200"
                  />
                  <input 
                    type="number" 
                    placeholder="Monthly Limit"
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveBudget}
                    className="flex-1 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 py-2 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> {editingBudget ? "Update" : "Add"} Category
                  </button>
                  {editingBudget && (
                    <button 
                      onClick={() => {
                        setEditingBudget(null);
                        setIsBudgetFormOpen(false);
                      }}
                      className="px-4 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all dark:text-stone-200"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map(cat => {
            const now = new Date();
            const currentMonthStr = now.toISOString().slice(0, 7); 
            const spent = transactions
              .filter(t => t.type === "expense" && t.category === cat.name && t.date.startsWith(currentMonthStr))
              .reduce((acc, t) => acc + t.amount, 0);
            const percent = Math.min((spent / cat.limit) * 100, 100);
            const isOver = spent > cat.limit;

            return (
              <div key={cat.id} className="group p-4 bg-stone-50 dark:bg-app-card-alt rounded-2xl border border-stone-100 dark:border-stone-700 hover:border-stone-200 dark:hover:border-stone-600 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold block dark:text-stone-200">{cat.name}</span>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase">Limit: {formatCurrency(cat.limit)}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {confirmDelete === String(cat.id) ? (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            handleDeleteBudget(cat.id);
                            setConfirmDelete(null);
                          }}
                          className="text-rose-500 hover:text-rose-600 text-[10px] font-bold uppercase px-2 py-1 bg-rose-50 dark:bg-rose-900/20 rounded"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(null)}
                          className="text-stone-400 hover:text-stone-600 text-[10px] font-bold uppercase px-2 py-1 bg-stone-50 dark:bg-app-card-alt rounded"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => handleEditBudget(cat)} className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDelete(String(cat.id))} className="p-1 text-stone-400 hover:text-rose-500"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-end mb-1">
                  <span className={cn("text-xs font-mono font-bold", isOver ? "text-rose-600 dark:text-rose-400" : "text-stone-600 dark:text-stone-300")}>
                    {formatCurrency(spent)}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">{percent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={cn(
                      "h-full transition-all",
                      isOver ? "bg-rose-500" : percent > 80 ? "bg-amber-500" : "bg-stone-900 dark:bg-stone-50"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}