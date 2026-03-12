import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  RefreshCw,
  Download,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Activity,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import { FinancialPerformance } from "../components/FinancialPerformance";
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
  Legend,
  Sector,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LabelList
} from "recharts";
import { 
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/radar-chart";
import { Badge } from "@/src/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/src/components/ui/card";
import { 
  Transaction, 
  BudgetCategory, 
  SavingsGoal, 
  Investment,
  COLORS,
  cn 
} from "@/src/types";

interface AIAnalysisPageProps {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  savingsGoals: SavingsGoal[];
  investments: Investment[];
  monthlySavings: number;
  currency: string;
  formatCurrency: (val: number) => string;
}

export default function AIAnalysisPage({
  transactions,
  budgets,
  savingsGoals,
  investments,
  monthlySavings,
  currency,
  formatCurrency
}: AIAnalysisPageProps) {
  
  // Logic for FinancialPerformance Component
  const aiPageStats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    
    const investmentTotal = investments
      .reduce((acc, i) => acc + i.amount, 0);

    const totalAllocation = monthlySavings + investmentTotal;
    
    return { income, expenses, totalAllocation };
  }, [transactions, investments, monthlySavings]);

  const [analysis, setAnalysis] = useState<string>("");
  const [healthScore, setHealthScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const budgetPerformanceData = useMemo(() => {
    return budgets.map(b => {
      const spent = transactions
        .filter(t => t.type === "expense" && t.category === b.name)
        .reduce((acc, t) => acc + t.amount, 0);
      return {
        name: b.name,
        limit: b.limit,
        spent: spent,
        remaining: Math.max(b.limit - spent, 0)
      };
    });
  }, [budgets, transactions]);

  const overviewData = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    const savings = Math.max(totalIncome - totalExpenses, 0);

    return [
      { name: "Income", value: totalIncome, fill: "#10b981" },
      { name: "Expenses", value: totalExpenses, fill: "#ef4444" },
      { name: "Savings", value: savings, fill: "#3b82f6" },
    ];
  }, [transactions]);

  const investmentMixData = useMemo(() => {
    const mix: Record<string, number> = {};
    investments.forEach(inv => {
      mix[inv.type] = (mix[inv.type] || 0) + inv.amount;
    });
    return Object.entries(mix).map(([name, value]) => ({ name, value, fill: `var(--color-${name.toLowerCase().replace(/\s+/g, '-')})` }));
  }, [investments]);

  const cashFlowRadarData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === currentYear && d.getMonth() === index;
      });
      const income = monthTransactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
      const expense = monthTransactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
      return { month, income, expense };
    });
  }, [transactions]);

  const radarConfig = {
    income: { label: "Income", color: "var(--color-chart-1)" },
    expense: { label: "Expense", color: "var(--color-chart-2)" },
  } satisfies ChartConfig;

  const pieConfig = useMemo(() => {
    const config: any = { value: { label: "Amount" } };
    investmentMixData.forEach(item => {
      config[item.name.toLowerCase().replace(/\s+/g, '-')] = {
        label: item.name,
        color: COLORS[Object.keys(config).length % COLORS.length]
      };
    });
    return config as ChartConfig;
  }, [investmentMixData]);

  const generateAnalysis = async () => {
    setHasStarted(true);
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });
      const prompt = `Analyze financial data: ${JSON.stringify({ transactions: transactions.slice(0,15), budgets, savingsGoals, investments })}. Return JSON {healthScore: number} then Markdown report.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const text = response.text ?? "";
      const jsonMatch = text.match(/\{[\s\S]*?"healthScore"[\s\S]*?\}/);
      if (jsonMatch) {
        setHealthScore(JSON.parse(jsonMatch[0]).healthScore || 75);
        setAnalysis(text.replace(jsonMatch[0], "").trim());
      } else {
        setAnalysis(text);
        setHealthScore(75);
      }
} catch (err) {
  console.error(err);
  setError("Failed to connect to AI advisor.");
}
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-app-card p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-sm transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 dark:bg-stone-50 flex items-center justify-center text-stone-50 dark:text-stone-900 shadow-xl shadow-stone-200 dark:shadow-none">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-serif italic font-bold dark:text-stone-50">Financial Report</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm font-mono uppercase tracking-widest">AI Analysis & Allocation</p>
            </div>
          </div>
          <button 
            onClick={generateAnalysis}
            disabled={loading}
            className="group relative px-8 py-3 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-50 overflow-hidden"
          >
            <span className="flex items-center gap-2">
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
              {hasStarted ? "Refresh AI Analysis" : "Start AI Analysis"}
            </span>
          </button>
        </div>

        {/* Top Row: Radar + Allocation Pie */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-stone-50 dark:bg-app-card-alt/20 border-stone-200 dark:border-stone-800 rounded-[2rem] overflow-hidden">
            <CardHeader className="items-center pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-stone-900 dark:text-stone-50">
                Cashflow Radar
                <Badge variant="outline" className="text-emerald-500 bg-emerald-500/10 border-none ml-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>Annual</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={radarConfig} className="mx-auto aspect-square max-h-[300px]">
                <RadarChart data={cashFlowRadarData}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <PolarAngleAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
                  <PolarGrid className="stroke-stone-300 dark:stroke-stone-700" />
                  <Radar name="Income" dataKey="income" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.2} />
                  <Radar name="Expense" dataKey="expense" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.2} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-stone-50 dark:bg-app-card-alt/20 border-stone-200 dark:border-stone-800 rounded-[2rem] overflow-hidden">
            <CardHeader className="items-center pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-stone-900 dark:text-stone-50">
                Allocation Overview
                <Badge variant="outline" className="text-blue-500 bg-blue-500/10 border-none ml-2">
                  <PieChartIcon className="h-4 w-4 mr-1" />
                  <span>Summary</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Pie
                      data={overviewData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      cornerRadius={8}
                    >
                      {overviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Financial Performance, Budget vs Actual & Investment Mix */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <FinancialPerformance 
            income={aiPageStats.income}
            expenses={aiPageStats.expenses}
            totalAllocation={aiPageStats.totalAllocation}
            summaryFilter="Year"
          />

          <div className="bg-stone-50 dark:bg-app-card-alt/30 p-6 rounded-3xl border border-stone-100 dark:border-stone-700/50">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={18} className="text-stone-400" />
              <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-stone-500 dark:text-stone-400">Budget vs Actual</h3>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetPerformanceData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={70} fontSize={10} tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="limit" fill="#f5c800" radius={[0, 4, 4, 0]} name="Budget" barSize={12} />
                  <Bar dataKey="spent" fill="#1961fc" radius={[0, 4, 4, 0]} name="Actual" barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-app-card-alt/30 p-6 rounded-3xl border border-stone-100 dark:border-stone-700/50">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon size={18} className="text-stone-400" />
              <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-stone-500 dark:text-stone-400">Investment Mix</h3>
            </div>
            <div className="h-[200px] w-full">
              <ChartContainer config={pieConfig} className="mx-auto aspect-square max-h-[200px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={investmentMixData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                    {investmentMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* AI Report Output */}
        <div className="mt-12">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-stone-900 dark:border-stone-50 border-t-transparent rounded-full animate-spin" />
              <p className="text-stone-400 font-serif italic">Generating AI Report...</p>
            </div>
          ) : analysis ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="bg-stone-50 dark:bg-app-card-alt/50 p-8 rounded-3xl border border-stone-100 dark:border-stone-700 prose dark:prose-invert max-w-none">
                  <Markdown>{analysis}</Markdown>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-stone-900 dark:bg-stone-50 p-6 rounded-3xl text-stone-50 dark:text-stone-900">
                  <h3 className="font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                    <Sparkles size={14} /> Advisor Notes
                  </h3>
                  <p className="text-sm italic font-serif opacity-90 leading-relaxed">This holistic view merges raw data with predictive logic.</p>
                </div>
                <div className="bg-white dark:bg-app-card p-6 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all text-sm group text-stone-900 dark:text-stone-100">
                    <span className="flex items-center gap-3"><Download size={16} /> Download Report</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="py-20 text-center opacity-50">
              <Sparkles size={32} className="mx-auto mb-4" />
              <p className="font-serif italic">Run analysis to see detailed insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}