import React from "react";
import { cn } from "@/src/types";

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  accent: string;
  formatCurrency: (val: number) => string;
}

export function SummaryCard({ title, amount, icon, accent, formatCurrency }: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-app-card p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden group transition-colors duration-300">
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-3 bg-stone-50 dark:bg-app-card-alt rounded-2xl group-hover:scale-110 transition-transform shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 mb-0.5 truncate">{title}</p>
          <h2 className="text-xl font-mono font-bold tracking-tighter dark:text-stone-50 truncate">
            {formatCurrency(amount)}
          </h2>
        </div>
      </div>
      {/* Subtle background accent */}
      <div className={cn(
        "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] dark:opacity-[0.05] blur-2xl",
        accent === "emerald" ? "bg-emerald-500" : accent === "rose" ? "bg-rose-500" : accent === "blue" ? "bg-blue-500" : "bg-stone-500"
      )} />
    </div>
  );
}
