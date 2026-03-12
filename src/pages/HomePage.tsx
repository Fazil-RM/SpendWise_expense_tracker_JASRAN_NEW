import React from "react";
import { Link } from "react-router-dom";
import { DonutChart, DonutChartSegment } from "@/src/components/ui/donut-chart";
import { Card } from "@/src/components/ui/card";
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart as PieChartIcon,
  Calendar,
  Tag,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  PiggyBank,
  RefreshCw
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Transaction, 
  BudgetCategory, 
  INCOME_CATEGORIES, 
  COLORS, 
  CURRENCIES,
  Investment,
  cn 
} from "@/src/types";
import { SummaryCard } from "@/src/components/SummaryCard";
import { AnimatedRadialChart } from "@/src/components/AnimatedRadialChart";

interface HomePageProps {
  transactions: Transaction[];
  formatCurrency: (val: number) => string;
  isFormOpen: boolean;
  setIsFormOpen: (val: boolean) => void;
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
  category: string;
  setCategory: (val: string) => void;
  budgets: BudgetCategory[];
  handleAddTransaction: (e: React.FormEvent) => void;
  setEditingTransaction: (t: Transaction | null) => void;
  handleDelete: (id: number) => void;
  currency: string;
  isDarkMode: boolean;
  monthlySavings: number;
  investments: Investment[];
}

interface DonutChartCardProps {
  title: string;
  data: DonutChartSegment[];
  formatCurrency: (val: number) => string;
  totalBudget?: number;
}

function DonutChartCard({ title, data, formatCurrency, totalBudget }: DonutChartCardProps) {
  const [hoveredSegment, setHoveredSegment] = React.useState<DonutChartSegment | null>(null);
  const totalValue = React.useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const budgetUsagePercentage = totalBudget && totalBudget > 0 
    ? (totalValue / totalBudget) * 100 
    : 0;

  const displayLabel = hoveredSegment?.label ?? (totalBudget ? "Budget Used" : "Total");
  const displayPercentage = hoveredSegment 
    ? (totalValue > 0 ? (hoveredSegment.value / totalValue) * 100 : 0)
    : (totalBudget ? budgetUsagePercentage : 100);
  
  const displayValue = hoveredSegment?.value ?? totalValue;

  return (
    <Card className="p-6 bg-white dark:bg-app-card border-stone-200 dark:border-stone-800 shadow-sm rounded-3xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="font-serif italic text-lg font-bold dark:text-stone-50">{title}</h3>
        <PieChartIcon size={18} className="text-stone-400 dark:text-stone-600" />
      </div>
      
      <div className="relative flex items-center justify-center my-4">
        <DonutChart
          data={data}
          size={220}
          strokeWidth={24}
          onSegmentHover={setHoveredSegment}
          centerContent={
            <AnimatePresence mode="wait">
              <motion.div
                key={displayLabel}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <p className="text-stone-400 dark:text-stone-500 text-[10px] font-bold uppercase tracking-widest truncate max-w-[120px]">
                  {displayLabel}
                </p>
                <p className="text-4xl font-bold text-stone-900 dark:text-stone-100">
                  {displayPercentage.toFixed(0)}%
                </p>
                <p className="text-xs font-mono font-medium text-stone-400 dark:text-stone-500">
                  {formatCurrency(displayValue)}
                </p>
              </motion.div>
            </AnimatePresence>
          }
        />
      </div>
    </Card>
  );
}

export default function HomePage({
  transactions,
  formatCurrency,
  isFormOpen,
  setIsFormOpen,
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
  category,
  setCategory,
  budgets,
  handleAddTransaction,
  setEditingTransaction,
  handleDelete,
  currency,
  isDarkMode,
  monthlySavings,
  investments
}: HomePageProps) {
  const [summaryFilter, setSummaryFilter] = React.useState<"Year" | "Month">("Month");
  const [confirmDelete, setConfirmDelete] = React.useState<number | null>(null);

  const totalBudget = React.useMemo(() => {
    const baseBudget = budgets.reduce((acc, b) => acc + b.limit, 0);
    return summaryFilter === "Year" ? baseBudget * 12 : baseBudget;
  }, [budgets, summaryFilter]);

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
    setTitle("");
    setAmount("");
  };

  const { summaryStats, filteredTransactionsForPeriod } = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      if (summaryFilter === "Year") {
        return d.getFullYear() === currentYear;
      } else {
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      }
    });

    const income = filtered.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const expenses = filtered.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
    
    // Calculate monthly investments
    const monthlyInvestments = investments
      .filter(i => {
        const d = new Date(i.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((acc, i) => acc + i.amount, 0);

    // Deduct savings and investments from balance
    const savingsToDeduct = summaryFilter === "Month" ? monthlySavings : monthlySavings * 12;
    const investmentsToDeduct = summaryFilter === "Month" ? monthlyInvestments : investments.filter(i => new Date(i.date).getFullYear() === currentYear).reduce((acc, i) => acc + i.amount, 0);

    const totalAllocation = savingsToDeduct + investmentsToDeduct;

    return {
      summaryStats: {
        income,
        expenses,
        savings: savingsToDeduct,
        investments: investmentsToDeduct,
        totalAllocation,
        balance: income - expenses - totalAllocation
      },
      filteredTransactionsForPeriod: filtered
    };
  }, [transactions, summaryFilter, monthlySavings, investments]);

  const performanceScore = React.useMemo(() => {
    const { income, expenses, totalAllocation } = summaryStats;
    if (income === 0) return 0;

    // Savings Score (50% weight): 50 points if saving 20% or more of income
    const savingsRate = totalAllocation / income;
    const savingsScore = Math.min((savingsRate / 0.2) * 50, 50);

    // Expense Score (50% weight): 50 points if expenses are 0, 0 points if expenses >= income
    const expenseRate = expenses / income;
    const expenseScore = Math.max(0, (1 - expenseRate) * 50);

    return Math.round(savingsScore + expenseScore);
  }, [summaryStats]);

  const expenseChartData: DonutChartSegment[] = React.useMemo(() => {
    const categoryMap: Record<string, number> = {};
    filteredTransactionsForPeriod
      .filter(t => t.type === "expense")
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });
    
    return Object.entries(categoryMap).map(([label, value], index) => ({
      label,
      value,
      color: COLORS[index % COLORS.length]
    }));
  }, [filteredTransactionsForPeriod]);

  const { cashFlowData, cashFlowBalance } = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    let totalIncome = 0;
    let totalExpense = 0;

    if (summaryFilter === "Year") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const data = months.map((month, index) => {
        const monthTransactions = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getFullYear() === currentYear && d.getMonth() === index;
        });
        const income = monthTransactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
        const expense = monthTransactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
        totalIncome += income;
        totalExpense += expense;
        return { name: month, income, expense };
      });
      return { cashFlowData: data, cashFlowBalance: totalIncome - totalExpense };
    } else {
      // Group by weeks for current month
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
      const data = weeks.map((week, index) => {
        const weekTransactions = transactions.filter(t => {
          const d = new Date(t.date);
          if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) return false;
          const day = d.getDate();
          const weekIndex = Math.floor((day - 1) / 7);
          return weekIndex === index;
        });
        const income = weekTransactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
        const expense = weekTransactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
        totalIncome += income;
        totalExpense += expense;
        return { name: week, income, expense };
      });
      return { cashFlowData: data, cashFlowBalance: totalIncome - totalExpense };
    }
  }, [transactions, summaryFilter]);

  return (
    <div className="space-y-8">
        {/* Summary Header with Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif italic font-bold text-stone-900 dark:text-stone-50">Financial Summary</h2>
          <div className="flex bg-stone-100 dark:bg-app-card-alt p-1 rounded-xl border border-stone-200 dark:border-stone-700">
            <button 
              onClick={() => setSummaryFilter("Month")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                summaryFilter === "Month" ? "bg-white dark:bg-app-card-alt text-stone-900 dark:text-stone-50 shadow-sm" : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              )}
            >
              Month
            </button>
            <button 
              onClick={() => setSummaryFilter("Year")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                summaryFilter === "Year" ? "bg-white dark:bg-app-card-alt text-stone-900 dark:text-stone-50 shadow-sm" : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              )}
            >
              Year
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard 
            title={`${summaryFilter}ly Balance`} 
            amount={summaryStats.balance} 
            icon={<Wallet className="text-stone-400" />} 
            accent="stone"
            formatCurrency={formatCurrency}
          />
          <SummaryCard 
            title={`${summaryFilter}ly Income`} 
            amount={summaryStats.income} 
            icon={<TrendingUp className="text-emerald-500" />} 
            accent="emerald"
            formatCurrency={formatCurrency}
          />
          <SummaryCard 
            title="Overall Savings" 
            amount={summaryStats.totalAllocation} 
            icon={<PiggyBank className="text-blue-500" />} 
            accent="blue"
            formatCurrency={formatCurrency}
          />
          <SummaryCard 
            title={`${summaryFilter}ly Expenses`} 
            amount={summaryStats.expenses} 
            icon={<TrendingDown className="text-rose-500" />} 
            accent="rose"
            formatCurrency={formatCurrency}
          />
        </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="absolute inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white dark:bg-app-card p-8 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif italic text-2xl font-bold dark:text-stone-50">New Transaction</h3>
                <button 
                  onClick={handleCloseForm}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="flex gap-2 p-1 bg-stone-100 dark:bg-app-card-alt rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setType("expense")}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                      type === "expense" ? "bg-white dark:bg-app-card-alt text-rose-600 dark:text-rose-400 shadow-sm" : "text-stone-500"
                    )}
                  >
                    Expense
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType("income")}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                      type === "income" ? "bg-white dark:bg-app-card-alt text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-stone-500"
                    )}
                  >
                    Income
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Title</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-600" size={18} />
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What was it for?"
                      className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 transition-all text-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Amount</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-600" size={18} />
                      <input 
                        type="number" 
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 transition-all text-lg"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-600" size={18} />
                      <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-4 bg-stone-50 dark:bg-app-card-alt border border-stone-200 dark:border-stone-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 dark:text-stone-200 transition-all appearance-none text-lg"
                  >
                    {(type === "expense" ? budgets.map(b => b.name) : INCOME_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Recurring</label>
                  <div className="grid grid-cols-4 gap-2 p-1 bg-stone-100 dark:bg-app-card-alt rounded-2xl">
                    {(["none", "daily", "weekly", "monthly"] as const).map((freq) => (
                      <button 
                        key={freq}
                        type="button"
                        onClick={() => setRecurringFrequency(freq)}
                        className={cn(
                          "py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
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

                <button 
                  type="submit"
                  className="w-full bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 py-5 rounded-2xl font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-xl shadow-stone-200 dark:shadow-none mt-4 text-lg"
                >
                  Save Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Row 1 Left: Spending Chart */}
        <div className="lg:col-span-5">
          <DonutChartCard 
            title={`${summaryFilter}ly Expenses`}
            data={expenseChartData}
            formatCurrency={formatCurrency}
            totalBudget={totalBudget}
          />
        </div>

        {/* Row 1 Right: Cash Flow Chart */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-app-card p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-serif italic text-xl font-bold text-stone-900 dark:text-stone-50">Cash Flow</h3>
                <p className="text-3xl font-mono font-bold tracking-tighter mt-1 dark:text-stone-200">{formatCurrency(cashFlowBalance)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 mr-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-stone-900 dark:bg-stone-300" />
                    <span>Income</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Expense</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[200px] w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={cashFlowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isDarkMode ? "#d6d3d1" : "#1c1917"} stopOpacity={1}/>
                      <stop offset="100%" stopColor={isDarkMode ? "#a8a29e" : "#44403c"} stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#292524" : "#f0f0f0"} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a8a29e', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a8a29e', fontWeight: 600 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f5f5f4' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-700 min-w-[140px]">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">{label} {summaryFilter === "Year" ? new Date().getFullYear() : ""}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-stone-900 dark:bg-stone-300" />
                                  <span className="text-xs font-bold text-stone-600 dark:text-stone-300">In</span>
                                </div>
                                <span className="text-xs font-mono font-bold dark:text-stone-100">{formatCurrency(payload[0].value as number)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                  <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Ex</span>
                                </div>
                                <span className="text-xs font-mono font-bold dark:text-stone-100">{formatCurrency(payload[1].value as number)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="income" 
                    fill="url(#incomeGradient)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={32}
                  />
                  <Bar 
                    dataKey="expense" 
                    fill="url(#expenseGradient)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2 Left: Performance Chart */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-app-card p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-6">
              <h3 className="font-serif italic text-xl font-bold dark:text-stone-50">Financial Performance</h3>
              <RefreshCw size={18} className="text-stone-400 dark:text-stone-600" />
            </div>
            
            <div className="flex-1 flex items-center justify-center py-4">
              <AnimatedRadialChart 
                value={performanceScore} 
                size={240} 
                showLabels={true} 
              />
            </div>
            
            <div className="mt-4 text-center space-y-2">
              <p className="text-stone-400 dark:text-stone-500 text-xs font-medium">
                Your score is calculated based on your {summaryFilter.toLowerCase()}ly savings rate and expense management.
              </p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Savings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Expenses</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 Right: Recent Transactions */}
        <div className="lg:col-span-7">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-serif italic text-xl font-bold dark:text-stone-50">Recent Transactions</h3>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
                {transactions.length} total
              </span>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {transactions.length > 0 ? (
                  transactions.slice(0, 3).map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group bg-white dark:bg-app-card p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-all flex items-center gap-4"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      transaction.type === "income" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                    )}>
                      {transaction.type === "income" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-800 dark:text-stone-200 truncate">{transaction.title}</h4>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500 flex items-center gap-1">
                          <Tag size={10} /> {transaction.category}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500 flex items-center gap-1">
                          <Calendar size={10} /> {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={cn(
                        "font-mono font-bold text-lg",
                        transaction.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-stone-900 dark:text-stone-100"
                      )}>
                        {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
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
                              className="text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 p-1"
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={() => setConfirmDelete(transaction.id)}
                              className="text-stone-300 hover:text-rose-500 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white/50 dark:bg-app-card/50 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center">
                  <p className="text-stone-400 dark:text-stone-600 font-serif italic text-lg">No transactions yet.</p>
                  <p className="text-stone-400 dark:text-stone-600 text-xs mt-1">Start by adding your first income or expense.</p>
                </div>
              )}
            </AnimatePresence>
            {transactions.length > 3 && (
              <Link 
                to="/transactions"
                className="block w-full py-3 text-center text-stone-400 dark:text-stone-500 text-sm font-medium hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              >
                View All Transactions
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
