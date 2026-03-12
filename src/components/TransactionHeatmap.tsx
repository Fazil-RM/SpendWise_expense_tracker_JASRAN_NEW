import React, { useMemo } from "react";
import { Transaction, cn } from "@/src/types";
import { Tooltip, ResponsiveContainer } from "recharts";

interface TransactionHeatmapProps {
  transactions: Transaction[];
  formatCurrency: (val: number) => string;
}

export const TransactionHeatmap: React.FC<TransactionHeatmapProps> = ({ transactions, formatCurrency }) => {
  const currentYear = new Date().getFullYear();
  
  const data = useMemo(() => {
    const dailyData: Record<string, { count: number; amount: number }> = {};
    
    transactions.forEach(t => {
      const dateStr = t.date; // YYYY-MM-DD
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { count: 0, amount: 0 };
      }
      dailyData[dateStr].count += 1;
      dailyData[dateStr].amount += t.amount;
    });
    
    return dailyData;
  }, [transactions]);

  const calendar = useMemo(() => {
    const days: { date: Date; dateStr: string; dayOfWeek: number; weekIndex: number; month: number }[] = [];
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    
    let currentDate = new Date(startDate);
    let weekIndex = 0;
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];
      
      days.push({
        date: new Date(currentDate),
        dateStr,
        dayOfWeek,
        weekIndex,
        month: currentDate.getMonth()
      });
      
      if (dayOfWeek === 6) {
        weekIndex++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [currentYear]);

  const maxAmount = useMemo(() => {
    const amounts = Object.values(data).map(d => (d as { amount: number }).amount);
    return Math.max(...amounts, 1);
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-stone-100 dark:bg-app-card-alt";
    if (count <= 3) return "bg-emerald-100 dark:bg-emerald-900/30";
    if (count <= 7) return "bg-emerald-300 dark:bg-emerald-700/50";
    if (count <= 12) return "bg-emerald-500 dark:bg-emerald-500/70";
    return "bg-emerald-700 dark:bg-emerald-400";
  };

  const totalTransactions = useMemo(() => {
    return Object.values(data).reduce((acc: number, curr) => acc + (curr as { count: number }).count, 0);
  }, [data]);

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate month label positions
  const monthPositions = useMemo(() => {
    const positions: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    calendar.forEach(day => {
      if (day.month !== lastMonth) {
        positions.push({ month: monthLabels[day.month], weekIndex: day.weekIndex });
        lastMonth = day.month;
      }
    });
    return positions;
  }, [calendar]);

  // Calculate month boundary paths
  const monthBoundaries = useMemo(() => {
    const paths: string[] = [];
    let lastMonth = -1;
    
    calendar.forEach((day, i) => {
      if (day.month !== lastMonth && lastMonth !== -1) {
        // Month boundary found before this day
        const prevDay = calendar[i-1];
        const xBase = prevDay.weekIndex * 14;
        const yBase = prevDay.dayOfWeek * 14;
        
        // Jagged line path
        // Start from top of the grid at the week index of the first day of the new month
        const xStart = day.weekIndex * 14 - 2;
        
        let path = "";
        if (day.dayOfWeek === 0) {
          // Month starts on Sunday, simple vertical line
          path = `M ${xStart} 0 L ${xStart} 96`;
        } else {
          // Jagged line
          path = `M ${xStart} 0 L ${xStart} ${day.dayOfWeek * 14 - 2} L ${xStart + 14} ${day.dayOfWeek * 14 - 2} L ${xStart + 14} 96`;
        }
        paths.push(path);
      }
      lastMonth = day.month;
    });
    return paths;
  }, [calendar]);

  return (
    <div className="bg-white dark:bg-app-card p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden transition-colors duration-300">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-serif italic text-xl font-bold dark:text-stone-50">Activity Heatmap</h3>
          <p className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500 mt-1">Daily Transaction Frequency</p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900 dark:text-stone-200">Total: {totalTransactions.toLocaleString()}</span>
              <div className="w-6 h-3 rounded bg-emerald-900 dark:bg-emerald-400" />
            </div>
            <span className="text-sm font-bold text-stone-900 dark:text-stone-200">{currentYear}</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-tighter">
            <div 
              className="w-6 h-3 rounded border border-stone-200 dark:border-stone-700" 
              style={{ 
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #e7e5e4 2px, #e7e5e4 4px)',
                backgroundColor: '#fafaf9'
              }} 
            />
            <span>No Data</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 overflow-x-auto pb-2 scrollbar-hide">
          <div className="min-w-[780px] relative pt-6">
            {/* Month Labels */}
            <div className="absolute top-0 left-10 right-0 h-4">
              {monthPositions.map((pos, i) => (
                <div 
                  key={i} 
                  className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 absolute"
                  style={{ left: `${pos.weekIndex * 14}px` }}
                >
                  {pos.month}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {/* Day Labels */}
              <div className="flex flex-col gap-[2px] pt-[2px]">
                {dayLabels.map((day, i) => (
                  <div key={day} className="h-3 text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 flex items-center pr-1 w-6">
                    {[1, 3, 5].includes(i) ? day : ""}
                  </div>
                ))}
              </div>

              {/* Grid Container */}
              <div className="relative flex-1 h-[100px]">
                {/* Cells */}
                {calendar.map((day) => {
                  const dayData = data[day.dateStr] || { count: 0, amount: 0 };
                  return (
                    <div 
                      key={day.dateStr}
                      className={cn(
                        "absolute w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-stone-300 dark:hover:ring-stone-600 cursor-help",
                        getColor(dayData.count)
                      )}
                      style={{ 
                        left: `${day.weekIndex * 14}px`, 
                        top: `${day.dayOfWeek * 14}px` 
                      }}
                      title={`${day.dateStr}: ${formatCurrency(dayData.amount)} (${dayData.count} trans.)`}
                    />
                  );
                })}

                {/* Month Boundary SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                  {monthBoundaries.map((path, i) => (
                    <path 
                      key={i} 
                      d={path} 
                      fill="none" 
                      stroke="#d6d3d1" 
                      className="dark:stroke-stone-700"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Legend */}
        <div className="flex items-center gap-2 pt-6 pr-4 shrink-0">
          <div className="relative h-[80px] w-3 rounded-sm overflow-hidden bg-gradient-to-t from-emerald-50 via-emerald-400 to-emerald-900 dark:from-emerald-900/20 dark:via-emerald-500 dark:to-emerald-300" />
          <div className="flex flex-col justify-between h-[80px] text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 py-0.5">
            <span>13+</span>
            <span>8</span>
            <span>4</span>
            <span>1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
