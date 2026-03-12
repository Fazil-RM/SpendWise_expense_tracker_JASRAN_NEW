import React from "react";
import { RefreshCw } from "lucide-react";
import { AnimatedRadialChart } from "@/src/components/AnimatedRadialChart";

interface FinancialPerformanceProps {
  income: number;
  expenses: number;
  totalAllocation: number; // Savings + Investments
  summaryFilter: "Year" | "Month";
}

export const FinancialPerformance = ({ 
  income, 
  expenses, 
  totalAllocation, 
  summaryFilter 
}: FinancialPerformanceProps) => {
  
  // Scoring Logic
  const performanceScore = React.useMemo(() => {
    if (income === 0) return 0;
    const savingsRate = totalAllocation / income;
    const savingsScore = Math.min((savingsRate / 0.2) * 50, 50);
    const expenseRate = expenses / income;
    const expenseScore = Math.max(0, (1 - expenseRate) * 50);
    return Math.round(savingsScore + expenseScore);
  }, [income, expenses, totalAllocation]);

  return (
    <div className="bg-white dark:bg-app-card p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col items-center h-full">
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="font-serif italic text-lg font-bold dark:text-stone-50">
          Financial Performance
        </h3>
        <RefreshCw size={16} className="text-stone-400" />
      </div>
      
      <div className="flex-1 flex items-center justify-center py-2">
        <AnimatedRadialChart 
          value={performanceScore} 
          size={180} 
          showLabels={true} 
        />
      </div>
      
      <div className="mt-4 text-center space-y-2">
        <p className="text-stone-400 dark:text-stone-500 text-[10px] font-medium leading-relaxed">
          Score based on your {summaryFilter.toLowerCase()}ly savings and expense management.
        </p>
      </div>
    </div>
  );
};