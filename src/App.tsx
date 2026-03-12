import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Home, 
  History, 
  Coins, 
  Settings, 
  User,
  FileText,
  X,
  PieChart as PieChartIcon
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { Dock, DockIcon, DockItem, DockLabel } from "@/src/components/ui/dock";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

// Types and Utils
import { 
  Transaction, 
  BudgetCategory, 
  SavingsGoal, 
  Investment,
  RecurringTransaction,
  UserDetails,
  DEFAULT_EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES, 
  CURRENCIES,
  COLORS,
  cn
} from "@/src/types";

// Pages
import HomePage from "@/src/pages/HomePage";
import BudgetPage from "@/src/pages/BudgetPage";
import TransactionsPage from "@/src/pages/TransactionsPage";
import SavingsPage from "@/src/pages/SavingsPage";
import AIAnalysisPage from "@/src/pages/AIAnalysisPage";
import SettingsPage from "@/src/pages/SettingsPage";
import LandingPage from "@/src/pages/LandingPage";
import LoginPage from "@/src/pages/LoginPage";
import SignupPage from "@/src/pages/SignupPage";
import AboutPage from "@/src/pages/AboutPage";

import { auth, db } from "@/src/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  deleteDoc,
  updateDoc,
  getDocs,
  writeBatch
} from "firebase/firestore";

import { AlertProvider, useAlert } from "@/src/components/AlertProvider";

export default function App() {
  return (
    <AlertProvider>
      <AppContent />
    </AlertProvider>
  );
}

function AppContent() {
  const { showAlert } = useAlert();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
        setUserDetails({
          name: user.displayName || "User",
          email: user.email || ""
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    setTimeout(() => {
      showAlert("success", "Welcome back to SpendWise! Your financial overview is ready.");
    }, 500);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      showAlert("info", "You have been logged out successfully.");
      navigate("/");
    } catch (error) {
      showAlert("error", "Failed to logout. Please try again.");
    }
  };
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Budget & Savings State
  const [budgets, setBudgets] = useState<BudgetCategory[]>(DEFAULT_EXPENSE_CATEGORIES.map(name => ({ id: name, name, limit: 5000 })));
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0]);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Budget Edit State
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetCategory | null>(null);
  const [newBudgetLimit, setNewBudgetLimit] = useState("");
  const [newBudgetName, setNewBudgetName] = useState("");

  // Savings Edit State
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalCurrent, setNewGoalCurrent] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("");
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  // Settings & Export state
  const [currency, setCurrency] = useState("INR");
  const [exportStartDate, setExportStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
  const [exportEndDate, setExportEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Help & Feedback state
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Recurring state
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [recurringFrequency, setRecurringFrequency] = useState<"none" | "daily" | "weekly" | "monthly">("none");

  // User Profile state
  const [userDetails, setUserDetails] = useState<UserDetails>({ name: "User", email: "" });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [monthlySavings, setMonthlySavings] = useState<number>(0);

  // Logic for Saving Investment to Database
  const handleSaveInvestment = async (invData: Omit<Investment, "id">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "investments"), {
        ...invData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      showAlert("success", "Investment tracked in cloud.");
    } catch (err) {
      console.error(err);
      showAlert("error", "Database error: Could not save investment.");
    }
  };

  // Logic for Deleting Investment from Database
  const handleDeleteInvestment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "investments", id));
      showAlert("info", "Investment removed.");
    } catch (err) {
      showAlert("error", "Failed to delete from database.");
    }
  };
  
  useEffect(() => {
    if (!user) return;
    const syncSettings = async () => {
      try {
        await setDoc(doc(db, "users", user.uid), { currency }, { merge: true });
      } catch (e) {
        console.error("Error syncing currency:", e);
      }
    };
    syncSettings();
  }, [currency, user]);

  useEffect(() => {
    if (!user) return;
    const syncTheme = async () => {
      try {
        await setDoc(doc(db, "users", user.uid), { isDarkMode }, { merge: true });
        if (isDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {
        console.error("Error syncing theme:", e);
      }
    };
    syncTheme();
  }, [isDarkMode, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user || transactions.length === 0) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const newTransactions: any[] = [];
    let hasUpdates = false;

    const updatedRecurring = recurringTransactions.map(rt => {
      const lastProcessed = rt.lastProcessedDate ? new Date(rt.lastProcessedDate) : new Date(rt.startDate);
      let nextDate = new Date(lastProcessed);
      
      if (rt.frequency === "daily") {
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (rt.frequency === "weekly") {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (rt.frequency === "monthly") {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      const nextDateStr = nextDate.toISOString().split("T")[0];

      if (nextDateStr <= todayStr) {
        hasUpdates = true;
        newTransactions.push({
          title: rt.title,
          amount: rt.amount,
          category: rt.category,
          type: rt.type,
          date: nextDateStr,
          createdAt: new Date().toISOString(),
          userId: user.uid
        });
        return { ...rt, lastProcessedDate: nextDateStr };
      }
      return rt;
    });

    if (hasUpdates) {
      const processRecurring = async () => {
        try {
          const batch = writeBatch(db);
          for (const tx of newTransactions) {
            const txRef = doc(collection(db, "transactions"));
            batch.set(txRef, tx);
          }
          for (const rt of updatedRecurring) {
            const rtRef = doc(db, "recurring", rt.id);
            batch.update(rtRef, { lastProcessedDate: rt.lastProcessedDate });
          }
          await batch.commit();
          showAlert("info", `Processed ${newTransactions.length} recurring transaction(s).`);
        } catch (err) {
          console.error("Error processing recurring transactions:", err);
        }
      };
      processRecurring();
    }
  }, [recurringTransactions, user]);

  const currentPage = useMemo(() => {
    switch (location.pathname) {
      case "/": return "Home";
      case "/budget": return "Budget";
      case "/transactions": return "Transactions";
      case "/savings": return "Savings";
      case "/analysis": return "AI Analysis";
      case "/settings": return "Settings";
      default: return "Home";
    }
  }, [location.pathname]);

  useEffect(() => {
    if (type === "expense") {
      setCategory(budgets[0]?.name || DEFAULT_EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
  }, [type, budgets]);

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setIsFormOpen(true);
    }
  }, [editingTransaction]);

  useEffect(() => {
    if (!user) return;
    const userId = user.uid;

    const qTransactions = query(collection(db, "transactions"), where("userId", "==", userId));
    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
      setTransactions(docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    const qBudgets = query(collection(db, "budgets"), where("userId", "==", userId));
    const unsubBudgets = onSnapshot(qBudgets, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
      if (docs.length > 0) setBudgets(docs);
    });

    const qSavings = query(collection(db, "savings"), where("userId", "==", userId));
    const unsubSavings = onSnapshot(qSavings, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
      setSavingsGoals(docs);
    });

    const unsubUser = onSnapshot(doc(db, "users", userId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currency) setCurrency(data.currency);
        if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
        if (data.monthlySavings !== undefined) setMonthlySavings(data.monthlySavings);
        if (data.userDetails) setUserDetails(data.userDetails);
      }
    });

    const qRecurring = query(collection(db, "recurring"), where("userId", "==", userId));
    const unsubRecurring = onSnapshot(qRecurring, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
      setRecurringTransactions(docs);
    });

    const qInvestments = query(collection(db, "investments"), where("userId", "==", userId));
    const unsubInvestments = onSnapshot(qInvestments, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
      setInvestments(docs);
    });

    setLoading(false);
    return () => {
      unsubTransactions();
      unsubBudgets();
      unsubSavings();
      unsubUser();
      unsubRecurring();
      unsubInvestments();
    };
  }, [user]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const amountVal = parseFloat(amount);
    const transactionData = {
      title,
      amount: amountVal,
      category,
      type,
      date,
      createdAt: editingTransaction ? editingTransaction.createdAt : new Date().toISOString(),
      userId: user?.uid
    };

    try {
      if (editingTransaction) {
        await updateDoc(doc(db, "transactions", editingTransaction.id.toString()), transactionData);
        setEditingTransaction(null);
        showAlert("success", "Transaction updated successfully.");
      } else {
        await addDoc(collection(db, "transactions"), transactionData);
        if (recurringFrequency !== "none") {
          const recurringData = {
            title,
            amount: amountVal,
            category,
            type,
            frequency: recurringFrequency as "daily" | "weekly" | "monthly",
            startDate: date,
            lastProcessedDate: date,
            userId: user?.uid
          };
          await addDoc(collection(db, "recurring"), recurringData);
          showAlert("success", `Transaction added and set to recur ${recurringFrequency}.`);
        } else {
          showAlert("success", "Transaction added successfully.");
        }
      }
    } catch (err) {
      showAlert("error", "Failed to save transaction to cloud.");
    }
    setTitle("");
    setAmount("");
    setRecurringFrequency("none");
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteDoc(doc(db, "transactions", id.toString()));
      showAlert("info", "Transaction deleted.");
    } catch (err) {
      showAlert("error", "Failed to delete transaction.");
    }
  };

  const handleEditBudget = (budget: BudgetCategory) => {
    setEditingBudget(budget);
    setNewBudgetName(budget.name);
    setNewBudgetLimit(budget.limit.toString());
    setIsBudgetFormOpen(true);
  };

  const handleSaveBudget = async () => {
    if (!newBudgetName || !newBudgetLimit) return;
    const limit = parseFloat(newBudgetLimit);
    const budgetData = {
      name: newBudgetName,
      limit,
      userId: user?.uid
    };

    try {
      if (editingBudget) {
        await updateDoc(doc(db, "budgets", editingBudget.id), budgetData);
        setEditingBudget(null);
        showAlert("success", "Budget updated successfully.");
      } else {
        await addDoc(collection(db, "budgets"), budgetData);
        showAlert("success", "New budget category added.");
      }
    } catch (err) {
      showAlert("error", "Failed to save budget.");
    }
    setNewBudgetName("");
    setNewBudgetLimit("");
    setIsBudgetFormOpen(false);
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteDoc(doc(db, "budgets", id));
      showAlert("info", "Budget category removed.");
    } catch (err) {
      showAlert("error", "Failed to delete budget.");
    }
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setNewGoalName(goal.name);
    setNewGoalTarget(goal.target.toString());
    setNewGoalCurrent(goal.current.toString());
    setNewGoalCategory(goal.category);
    setIsGoalFormOpen(true);
  };

  const handleSaveGoal = async () => {
    if (!newGoalName || !newGoalTarget) return;
    const target = parseFloat(newGoalTarget);
    const current = parseFloat(newGoalCurrent) || 0;
    
    const goalData = {
      name: newGoalName,
      target,
      current,
      category: newGoalCategory || "General",
      userId: user?.uid
    };

    try {
      if (editingGoal) {
        await updateDoc(doc(db, "savings", editingGoal.id), goalData);
        setEditingGoal(null);
        showAlert("success", "Savings goal updated.");
      } else {
        await addDoc(collection(db, "savings"), goalData);
        showAlert("success", "New savings goal created!");
      }
    } catch (err) {
      showAlert("error", "Failed to save goal.");
    }
    setIsGoalFormOpen(false);
    setNewGoalName("");
    setNewGoalTarget("");
    setNewGoalCurrent("");
    setNewGoalCategory("");
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "savings", id));
      showAlert("info", "Savings goal deleted.");
    } catch (err) {
      showAlert("error", "Failed to delete goal.");
    }
  };

  const handleClearData = async () => {
    if (!user) return;
    if (window.confirm("This will delete ALL your data permanently from the cloud. Are you sure?")) {
      try {
        const userId = user.uid;
        const collections = ["transactions", "budgets", "savings", "recurring", "investments"];
        for (const collName of collections) {
          const q = query(collection(db, collName), where("userId", "==", userId));
          const snapshot = await getDocs(q);
          const batch = writeBatch(db);
          snapshot.docs.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
        }
        await setDoc(doc(db, "users", userId), { 
          currency: "INR", 
          isDarkMode: false, 
          monthlySavings: 0,
          userDetails: { name: user.displayName || "User", email: user.email || "" }
        });
        showAlert("success", "All your cloud data has been cleared.");
        window.location.reload();
      } catch (err) {
        showAlert("error", "Failed to clear cloud data.");
      }
    }
  };

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthlyTransactions = transactions.filter(t => t.date >= firstDayOfMonth);
    const monthlyInvestments = investments
      .filter(i => i.date >= firstDayOfMonth)
      .reduce((acc, i) => acc + i.amount, 0);
    
    const income = monthlyTransactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const expenses = monthlyTransactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
    const totalAllocation = monthlySavings + monthlyInvestments;
    const availableBalance = income - expenses - totalAllocation;

    return {
      income,
      expenses,
      savings: monthlySavings,
      investments: monthlyInvestments,
      totalAllocation,
      balance: availableBalance
    };
  }, [transactions, monthlySavings, investments]);

  const allStats = useMemo(() => {
    const income = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  useEffect(() => {
    if (monthlyStats.totalAllocation > monthlyStats.income && monthlyStats.income > 0) {
      const timer = setTimeout(() => {
        showAlert("warning", `Allocation exceeds income (Allocation: ${formatCurrency(monthlyStats.totalAllocation)} | Income: ${formatCurrency(monthlyStats.income)}).`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [monthlyStats.totalAllocation, monthlyStats.income, currency]);

  const formatCurrency = (val: number) => {
    const curr = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    return new Intl.NumberFormat(curr.locale, {
      style: "currency",
      currency: curr.code,
      minimumFractionDigits: 2
    }).format(val);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const handleExportExcel = () => {
    try {
      const filtered = transactions.filter(t => t.date >= exportStartDate && t.date <= exportEndDate);
      if (filtered.length === 0) {
        showAlert("warning", "No transactions found in the selected date range.");
        return;
      }

      const workbook = XLSX.utils.book_new();

      // 1. Executive Summary Sheet
      const income = filtered.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
      const expenses = filtered.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
      const summaryData = [
        ["SpendWise Financial Summary"],
        ["Period", `${exportStartDate} to ${exportEndDate}`],
        [],
        ["Metric", "Value", "Currency"],
        ["Total Income", income, currency],
        ["Total Expenses", expenses, currency],
        ["Net Balance", income - expenses, currency],
        [],
        ["Generated on", new Date().toLocaleString()]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Executive Summary");

      // 2. Transactions Sheet
      const txSheet = XLSX.utils.json_to_sheet(filtered.map(t => ({
        Date: t.date,
        Title: t.title,
        Type: t.type.toUpperCase(),
        Category: t.category,
        Amount: t.amount,
        Currency: currency
      })));
      XLSX.utils.book_append_sheet(workbook, txSheet, "Transactions");

      // 3. Budgets Sheet
      const budgetData = budgets.map(b => {
        const spent = filtered
          .filter(t => t.type === "expense" && t.category === b.name)
          .reduce((acc, t) => acc + t.amount, 0);
        return {
          Category: b.name,
          "Monthly Limit": b.limit,
          "Total Spent in Period": spent,
          "Remaining (vs Monthly)": b.limit - spent,
          "Usage %": ((spent / b.limit) * 100).toFixed(2) + "%"
        };
      });
      const budgetSheet = XLSX.utils.json_to_sheet(budgetData);
      XLSX.utils.book_append_sheet(workbook, budgetSheet, "Budgets");

      // 4. Monthly Performance Sheet (Annual Breakdown)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentYear = new Date().getFullYear();
      const monthlyPerformanceData = months.map((month, mIdx) => {
        const row: any = { Month: month };
        budgets.forEach(b => {
          const spent = transactions
            .filter(t => {
              const d = new Date(t.date);
              return d.getFullYear() === currentYear && d.getMonth() === mIdx && t.category === b.name && t.type === "expense";
            })
            .reduce((acc, t) => acc + t.amount, 0);
          row[b.name] = spent;
        });
        return row;
      });
      const monthlyPerformanceSheet = XLSX.utils.json_to_sheet(monthlyPerformanceData);
      XLSX.utils.book_append_sheet(workbook, monthlyPerformanceSheet, "Monthly Performance");

      // 5. Chart Data Sheet (Aggregated for easy charting)
      const expenseByCategory = budgets.map(b => {
        const spent = filtered
          .filter(t => t.type === "expense" && t.category === b.name)
          .reduce((acc, t) => acc + t.amount, 0);
        return { Category: b.name, Amount: spent };
      });
      const chartDataSheet = XLSX.utils.json_to_sheet(expenseByCategory);
      XLSX.utils.book_append_sheet(workbook, chartDataSheet, "Expense Chart Data");

      // 6. Savings Sheet
      const savingsData = savingsGoals.map(g => ({
        Goal: g.name,
        Category: g.category,
        Target: g.target,
        Current: g.current,
        Remaining: g.target - g.current,
        "Progress %": ((g.current / g.target) * 100).toFixed(2) + "%" 
        

      }));

      // 7. Investments Sheet
      const investmentData = investments.map(inv => ({
        Name: inv.name,
        Type: inv.type,
        Amount: inv.amount,
        Date: inv.date,
        Currency: currency
      }));
      const invSheet = XLSX.utils.json_to_sheet(investmentData);
      XLSX.utils.book_append_sheet(workbook, invSheet, "Investments");


      const savingsSheet = XLSX.utils.json_to_sheet(savingsData);
      XLSX.utils.book_append_sheet(workbook, savingsSheet, "Savings Goals");
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadBlob(blob, `SpendWise_Financial_Report_${exportStartDate}_to_${exportEndDate}.xlsx`);
      showAlert("success", "Excel report exported successfully.");
    } catch (err) {
      console.error("Excel Export Error:", err);
      showAlert("error", "Failed to export Excel report.");
    }

  };

const handleExportPDF = async () => {
    try {
      const filtered = transactions.filter(t => t.date >= exportStartDate && t.date <= exportEndDate);
      if (filtered.length === 0) {
        showAlert("warning", "No transactions found in the selected date range.");
        return;
      }

      setIsExporting(true);
      // Small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      const doc = new jsPDF();
      const primaryColor: [number, number, number] = [28, 25, 23]; // stone-900
      const secondaryColor: [number, number, number] = [120, 113, 108]; // stone-500

      // PDF-safe currency formatter (uses code instead of symbol to avoid encoding issues)
      const formatCurrencyPDF = (val: number) => {
        const curr = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
        return new Intl.NumberFormat(curr.locale, {
          style: "currency",
          currency: curr.code,
          currencyDisplay: "code",
          minimumFractionDigits: 2
        }).format(val);
      };

      // Page 1: Cover & Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("SpendWise", 14, 30);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("Financial Performance Report", 14, 40);

      doc.setDrawColor(231, 229, 228); // stone-200
      doc.line(14, 45, 196, 45);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Reporting Period: ${exportStartDate} to ${exportEndDate}`, 14, 55);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 60);

      // Summary Stats
      const income = filtered.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
      const expenses = filtered.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
      const balance = income - expenses;

      autoTable(doc, {
        startY: 70,
        head: [['Financial Metric', 'Amount']],
        body: [
          ['Total Income', formatCurrencyPDF(income)],
          ['Total Expenses', formatCurrencyPDF(expenses)],
          ['Net Cash Flow', formatCurrencyPDF(balance)],
        ],
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
        styles: { font: 'helvetica', fontSize: 11 }
      });

      // Budgets Section
      doc.addPage();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Budget Analysis", 14, 20);
      
      const budgetTableData = budgets.map(b => {
        const spent = filtered
          .filter(t => t.type === "expense" && t.category === b.name)
          .reduce((acc, t) => acc + t.amount, 0);
        return [
          b.name,
          formatCurrencyPDF(b.limit),
          formatCurrencyPDF(spent),
          ((spent / b.limit) * 100).toFixed(1) + "%"
        ];
      });

      autoTable(doc, {
        startY: 30,
        head: [['Category', 'Limit', 'Spent', 'Usage']],
        body: budgetTableData,
        headStyles: { fillColor: [68, 64, 60] as [number, number, number] }, // stone-700
      });

      // Savings Section
      doc.addPage();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Savings Goals Progress", 14, 20);

      const savingsTableData = savingsGoals.map(g => [
        g.name,
        g.category,
        formatCurrencyPDF(g.target),
        formatCurrencyPDF(g.current),
        ((g.current / g.target) * 100).toFixed(1) + "%"
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['Goal', 'Category', 'Target', 'Current', 'Progress']],
        body: savingsTableData,
        headStyles: { fillColor: [12, 10, 9] as [number, number, number] }, // stone-950
      });

      // Investments Section
      doc.addPage();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Investment Portfolio", 14, 20);

      const investmentTableData = investments.map(inv => [
        inv.date,
        inv.name,
        inv.type,
        formatCurrencyPDF(inv.amount)
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['Date', 'Investment Name', 'Category', 'Amount']],
        body: investmentTableData,
        headStyles: { fillColor: [16, 185, 129] as [number, number, number] }, // emerald-500 color
      });

      // Transactions Section
      doc.addPage();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Detailed Transaction History", 14, 20);

      const txTableData = filtered.map(t => [
        t.date,
        t.title,
        t.type.toUpperCase(),
        t.category,
        formatCurrencyPDF(t.amount)
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['Date', 'Title', 'Type', 'Category', 'Amount']],
        body: txTableData,
        headStyles: { fillColor: primaryColor },
        alternateRowStyles: { fillColor: [250, 250, 249] as [number, number, number] }, // stone-50
      });

      doc.save(`SpendWise_Financial_Report_${exportStartDate}_to_${exportEndDate}.pdf`);
      showAlert("success", "PDF report exported successfully.");
    } catch (err) {
      console.error("PDF Export Error:", err);
      showAlert("error", "Failed to export PDF report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };


  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedbackMessage, date: new Date().toLocaleString() })
      });
      if (response.ok) {
        setFeedbackSent(true);
        setFeedbackMessage("");
        showAlert("success", "Thank you for your feedback!");
        setTimeout(() => setFeedbackSent(false), 3000);
      } else {
        showAlert("error", "Error sending your feedback.");
      }
    } catch (error) {
      showAlert("error", "Error sending your feedback.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-app-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
          <p className="text-stone-500 font-medium">Loading SpendWise...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !["/login", "/signup", "/about"].includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage isDarkMode={isDarkMode} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="/signup" element={<SignupPage onLogin={login} />} />
        <Route path="*" element={<LandingPage isDarkMode={isDarkMode} />} />
      </Routes>
    );
  }

  if (!isAuthenticated && ["/login", "/signup", "/about"].includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="/signup" element={<SignupPage onLogin={login} />} />
      </Routes>
    );
  }

  if (isAuthenticated && ["/login", "/signup"].includes(location.pathname)) {
    return <Routes><Route path="*" element={<HomePage 
      transactions={transactions} formatCurrency={formatCurrency} isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} recurringFrequency={recurringFrequency} setRecurringFrequency={setRecurringFrequency} type={type} setType={setType} title={title} setTitle={setTitle} amount={amount} setAmount={setAmount} date={date} setDate={setDate} category={category} setCategory={setCategory} budgets={budgets} handleAddTransaction={handleAddTransaction} setEditingTransaction={setEditingTransaction} handleDelete={handleDelete} currency={currency} isDarkMode={isDarkMode} monthlySavings={monthlySavings} investments={investments}
    />} /></Routes>;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-app-bg text-stone-900 dark:text-stone-100 font-sans p-4 md:p-8 transition-colors duration-300">
      <AnimatePresence>
        {isExporting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white/80 dark:bg-app-card/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-stone-900 dark:border-stone-50 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-serif italic text-xl font-bold">Generating Your Financial Report...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-8 pb-32">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif italic font-bold tracking-tight">SpendWise</h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm font-mono uppercase tracking-widest mt-1">
              {currentPage === "Home" ? "Monthly Financial Overview" : currentPage}
            </p>
          </div>
          {currentPage === "Home" && (
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 px-6 py-3 rounded-full hover:bg-stone-800 transition-colors shadow-lg">
              <PlusCircle size={20} /> <span className="font-medium">Add Transaction</span>
            </button>
          )}
        </header>

        <Routes>
          <Route path="/" element={<HomePage transactions={transactions} formatCurrency={formatCurrency} isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} recurringFrequency={recurringFrequency} setRecurringFrequency={setRecurringFrequency} type={type} setType={setType} title={title} setTitle={setTitle} amount={amount} setAmount={setAmount} date={date} setDate={setDate} category={category} setCategory={setCategory} budgets={budgets} handleAddTransaction={handleAddTransaction} setEditingTransaction={setEditingTransaction} handleDelete={handleDelete} currency={currency} isDarkMode={isDarkMode} monthlySavings={monthlySavings} investments={investments} />} />
          <Route path="/budget" element={<BudgetPage budgets={budgets} transactions={transactions} formatCurrency={formatCurrency} isBudgetFormOpen={isBudgetFormOpen} setIsBudgetFormOpen={setIsBudgetFormOpen} editingBudget={editingBudget} setEditingBudget={setEditingBudget} newBudgetName={newBudgetName} setNewBudgetName={setNewBudgetName} newBudgetLimit={newBudgetLimit} setNewBudgetLimit={setNewBudgetLimit} handleSaveBudget={handleSaveBudget} handleEditBudget={handleEditBudget} handleDeleteBudget={handleDeleteBudget} isBudgetOpen={false} />} />
          <Route path="/transactions" element={<TransactionsPage transactions={transactions} formatCurrency={formatCurrency} isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} recurringFrequency={recurringFrequency} setRecurringFrequency={setRecurringFrequency} recurringTransactions={recurringTransactions} setRecurringTransactions={setRecurringTransactions} editingTransaction={editingTransaction} setEditingTransaction={setEditingTransaction} type={type} setType={setType} title={title} setTitle={setTitle} amount={amount} setAmount={setAmount} date={date} setDate={setDate} category={category} setCategory={setCategory} budgets={budgets} handleAddTransaction={handleAddTransaction} handleDelete={handleDelete} />} />
          <Route path="/savings" element={<SavingsPage savingsGoals={savingsGoals} investments={investments} monthlySavings={monthlySavings} setMonthlySavings={setMonthlySavings} formatCurrency={formatCurrency} stats={monthlyStats} isGoalFormOpen={isGoalFormOpen} setIsGoalFormOpen={setIsGoalFormOpen} editingGoal={editingGoal} setEditingGoal={setEditingGoal} newGoalName={newGoalName} setNewGoalName={setNewGoalName} newGoalTarget={newGoalTarget} setNewGoalTarget={setNewGoalTarget} newGoalCurrent={newGoalCurrent} setNewGoalCurrent={setNewGoalCurrent} newGoalCategory={newGoalCategory} setNewGoalCategory={setNewGoalCategory} handleSaveGoal={handleSaveGoal} handleEditGoal={handleEditGoal} handleDeleteGoal={handleDeleteGoal} handleSaveInvestment={handleSaveInvestment} handleDeleteInvestment={handleDeleteInvestment} setInvestments={function (val: Investment[] | ((prev: Investment[]) => Investment[])): void {
            throw new Error("Function not implemented.");
          } } />} />
          <Route path="/analysis" element={<AIAnalysisPage transactions={transactions} budgets={budgets} savingsGoals={savingsGoals} investments={investments} monthlySavings={monthlySavings} currency={currency} formatCurrency={formatCurrency} />} />
          <Route path="/settings" element={<SettingsPage currency={currency} setCurrency={setCurrency} isCurrencyOpen={isCurrencyOpen} setIsCurrencyOpen={setIsCurrencyOpen} isExportOpen={isExportOpen} setIsExportOpen={setIsExportOpen} exportStartDate={exportStartDate} setExportStartDate={setExportStartDate} exportEndDate={exportEndDate} setExportEndDate={setExportEndDate} handleExportExcel={handleExportExcel} handleExportPDF={handleExportPDF} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} userDetails={userDetails} setUserDetails={setUserDetails} handleClearData={handleClearData} feedbackMessage={feedbackMessage} setFeedbackMessage={setFeedbackMessage} feedbackSent={feedbackSent} handleFeedbackSubmit={handleFeedbackSubmit} logout={logout} />} />
        </Routes>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
        <div className="hidden md:block">
          <Dock className="items-end pb-3 bg-white dark:bg-app-card border border-stone-200 dark:border-stone-800 shadow-2xl rounded-3xl">
            {[
              { title: 'Home', path: '/', icon: <Home className="w-full h-full" /> },
              { title: 'Budget', path: '/budget', icon: <PieChartIcon className="w-full h-full" /> },
              { title: 'Transactions', path: '/transactions', icon: <History className="w-full h-full" /> },
              { title: 'Savings', path: '/savings', icon: <Coins className="w-full h-full" /> },
              { title: 'AI Report', path: '/analysis', icon: <FileText className="w-full h-full" /> },
              { title: 'Settings', path: '/settings', icon: <Settings className="w-full h-full" /> },
            ].map((item, idx) => (
              <DockItem key={idx} onClick={() => navigate(item.path)} className={cn("aspect-square rounded-full transition-colors", location.pathname === item.path ? "bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900" : "bg-stone-100 dark:bg-app-card-alt text-stone-600 hover:bg-stone-200")}>
                <DockLabel>{item.title}</DockLabel>
                <DockIcon>{item.icon}</DockIcon>
                {location.pathname === item.path && <motion.div layoutId="active-nav-desktop" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white dark:bg-app-card rounded-full" />}
              </DockItem>
            ))}
          </Dock>
        </div>
        <div className="md:hidden flex items-center justify-around gap-1 bg-white/90 dark:bg-app-card/90 backdrop-blur-md border border-stone-200 rounded-2xl p-1.5 min-w-[320px]">
          {[
            { title: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
            { title: 'Budget', path: '/budget', icon: <PieChartIcon className="w-5 h-5" /> },
            { title: 'Transactions', path: '/transactions', icon: <History className="w-5 h-5" /> },
            { title: 'Savings', path: '/savings', icon: <Coins className="w-5 h-5" /> },
            { title: 'AI Report', path: '/analysis', icon: <FileText className="w-5 h-5" /> },
            { title: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
          ].map((item, idx) => (
            <button key={idx} onClick={() => navigate(item.path)} className={cn("relative p-2.5 rounded-xl flex items-center justify-center aspect-square", location.pathname === item.path ? "bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 shadow-md" : "text-stone-500")}>
              <div className="flex items-center justify-center w-full h-full">{item.icon}</div>
              {location.pathname === item.path && <motion.div layoutId="active-nav-mobile" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white dark:bg-app-card rounded-full" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}