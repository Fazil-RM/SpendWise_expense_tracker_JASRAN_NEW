import React from "react";
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Tag,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Transaction, 
  BudgetCategory, 
  INCOME_CATEGORIES, 
  cn 
} from "@/src/types";
import { TransactionHeatmap } from "@/src/components/TransactionHeatmap";

interface TransactionsPageProps {
  transactions: Transaction[];
  formatCurrency: (val: number) => string;
  isFormOpen: boolean;
  setIsFormOpen: (val: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;
  type: "income" | "expense";
  setType: (val: "income" | "expense") => void;
  title: string;
  setTitle: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  recurringFrequency: "none" | "daily" | "weekly" | "monthly";
  setRecurringFrequency: (val: "none" | "daily" | "weekly" | "monthly") => void;
  recurringTransactions: any[];
  setRecurringTransactions: (val: any[]) => void;
  category: string;
  setCategory: (val: string) => void;
  budgets: BudgetCategory[];
  handleAddTransaction: (e: React.FormEvent) => void;
  handleDelete: (id: number) => void;
}

export default function TransactionsPage({
  transactions,
  formatCurrency,
  isFormOpen,
  setIsFormOpen,
  editingTransaction,
  setEditingTransaction,
  type,
  setType,
  title,
  setTitle,
  amount,
  setAmount,
  date,
  setDate,
  recurringFrequency,
  setRecurringFrequency,
  recurringTransactions,
  setRecurringTransactions,
  category,
  setCategory,
  budgets,
  handleAddTransaction,
  handleDelete
}: TransactionsPageProps) {
  const [startDate, setStartDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [confirmDelete, setConfirmDelete] = React.useState<number | null>(null);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);

  const reportStats = React.useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-serif italic font-bold dark:text-stone-50">Financial Report</h2>
        <div className="flex items-center gap-2 bg-white dark:bg-app-card p-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <Calendar size={14} className="text-stone-400 dark:text-stone-500" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-mono font-bold bg-transparent focus:outline-none dark:text-stone-200"
            />
          </div>
          <div className="w-px h-4 bg-stone-200 dark:bg-stone-700" />
          <div className="flex items-center gap-2 px-2">
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-mono font-bold bg-transparent focus:outline-none dark:text-stone-200"
            />
          </div>
        </div>
        <button 
          onClick={() => {
            if (isFormOpen && !editingTransaction) {
              setIsFormOpen(false);
            } else {
              setEditingTransaction(null);
              setTitle("");
              setAmount("");
              setIsFormOpen(true);
            }
          }}
          className="bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-800 dark:hover:bg-stone-200 transition-all"
        >
          {isFormOpen && !editingTransaction ? <X size={16} /> : <PlusCircle size={16} />}
          {isFormOpen && !editingTransaction ? "Cancel" : "Add New"}
        </button>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-app-card p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-widest mb-1">Period Balance</p>
          <p className="text-xl font-mono font-bold tracking-tighter dark:text-stone-50">{formatCurrency(reportStats.balance)}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-widest mb-1">Period Income</p>
          <p className="text-xl font-mono font-bold tracking-tighter text-emerald-700 dark:text-emerald-300">+{formatCurrency(reportStats.income)}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-widest mb-1">Period Expenses</p>
          <p className="text-xl font-mono font-bold tracking-tighter text-rose-700 dark:text-rose-300">-{formatCurrency(reportStats.expenses)}</p>
        </div>
      </div>

      {/* Transaction Form on Transactions Page */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-app-card p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm mb-6">
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="flex gap-2 p-1 bg-stone-100 dark:bg-app-card-alt rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setType("expense")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      type === "expense" ? "bg-white dark:bg-app-card-alt text-rose-600 dark:text-rose-400 shadow-sm" : "text-stone-500 dark:text-stone-400"
                    )}
                  >
                    Expense
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType("income")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      type === "income" ? "bg-white dark:bg-app-card-alt text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-stone-500 dark:text-stone-400"
                    )}
                  >
                    Income
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500 ml-1">Title</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-600" size={16} />
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What was it for?"
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500 ml-1">Amount</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-600" size={16} />
                      <input 
                        type="number" 
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500 ml-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-600" size={16} />
                      <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500 ml-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 transition-all appearance-none"
                  >
                    {(type === "expense" ? budgets.map(b => b.name) : INCOME_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500 ml-1">Recurring</label>
                  <div className="grid grid-cols-4 gap-2 p-1 bg-stone-100 dark:bg-app-card-alt rounded-xl">
                    {(["none", "daily", "weekly", "monthly"] as const).map((freq) => (
                      <button 
                        key={freq}
                        type="button"
                        onClick={() => setRecurringFrequency(freq)}
                        className={cn(
                          "py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                          recurringFrequency === freq 
                            ? "bg-white dark:bg-app-card-alt text-stone-900 dark:text-stone-50 shadow-sm" 
                            : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                        )}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 py-4 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-lg shadow-stone-200 dark:shadow-none"
                  >
                    {editingTransaction ? "Update Transaction" : "Save Transaction"}
                  </button>
                  {editingTransaction && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingTransaction(null);
                        setIsFormOpen(false);
                        setTitle("");
                        setAmount("");
                      }}
                      className="px-6 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-50 dark:hover:bg-app-card-alt transition-all dark:text-stone-200"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <TransactionHeatmap transactions={transactions} formatCurrency={formatCurrency} />
      
      <div className="space-y-3">
        {filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((transaction) => (
          <div
            key={transaction.id}
            className="group bg-white dark:bg-app-card p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center gap-4 hover:border-stone-300 dark:hover:border-stone-700 transition-all"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              transaction.type === "income" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
            )}>
              {transaction.type === "income" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            
            {/* Order: Date, Category, Expense (Amount) */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500 mb-0.5">Date</p>
                <p className="font-bold text-stone-800 dark:text-stone-200">{new Date(transaction.date).toLocaleDateString()}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{transaction.title}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500 mb-0.5">Category</p>
                <span className="px-2 py-1 bg-stone-100 dark:bg-app-card-alt rounded text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase">
                  {transaction.category}
                </span>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500 mb-0.5">Amount</p>
                <div className={cn(
                  "font-mono font-bold text-lg",
                  transaction.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-stone-900 dark:text-stone-100"
                )}>
                  {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              {confirmDelete === transaction.id ? (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      handleDelete(transaction.id);
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
                  <button 
                    onClick={() => setEditingTransaction(transaction)}
                    className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-app-card-alt rounded-lg transition-all"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => setConfirmDelete(transaction.id)}
                    className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {recurringTransactions.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-serif italic text-xl font-bold dark:text-stone-50">Active Recurring Items</h3>
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
              {recurringTransactions.length} active
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recurringTransactions.map((rt) => (
              <div 
                key={rt.id}
                className="bg-white dark:bg-app-card p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-app-card-alt flex items-center justify-center text-stone-400">
                  <RefreshCw size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200 truncate">{rt.title}</h4>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">
                    {rt.frequency} • {formatCurrency(rt.amount)}
                  </p>
                </div>
                <button 
                  onClick={() => setRecurringTransactions(recurringTransactions.filter(item => item.id !== rt.id))}
                  className="p-2 text-stone-300 hover:text-rose-500 transition-colors"
                  title="Stop recurring"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
