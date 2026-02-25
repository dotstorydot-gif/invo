"use client";

import React, { useMemo } from "react";
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Briefcase,
    Zap,
    Scale
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function ForecastingPage() {
    const { t } = useLanguage();

    // Fetch all relevant data for forecasting
    const { data: projects, loading: loadProjects } = useERPData<any>('projects');
    const { data: staff, loading: loadStaff } = useERPData<any>('staff');
    const { data: quotations, loading: loadQuotes } = useERPData<any>('quotations');
    const { data: expenses, loading: loadExpenses } = useERPData<any>('expenses');

    // Generate 12 months forecast data
    const forecastData = useMemo(() => {
        const months = [];
        const now = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();

            // 1. PROJECTED INCOME
            // From monthly projects
            const projectIncome = projects
                .filter((p: any) => p.status !== 'Completed' && p.billing_cycle === 'Monthly')
                .reduce((sum: number, p: any) => sum + (Number(p.revenue) || 0) / 12, 0); // Simplified: devide total by 12 if yearly or estimate monthly

            // From accepted recurring quotations
            const quoteIncome = quotations
                .filter((q: any) => q.status === 'Accepted' && q.is_recurring && q.billing_cycle === 'Monthly')
                .reduce((sum: number, q: any) => sum + (Number(q.amount) || 0), 0);

            // 2. PROJECTED EXPENSES
            // From fixed salaries
            const payrollExpense = staff
                .reduce((sum: number, s: any) => sum + (Number(s.base_salary || s.baseSalary) || 0), 0);

            // Average historical overhead (from expenses)
            const overheadExpense = expenses.length > 0
                ? expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0) / (expenses.length > 3 ? 3 : expenses.length)
                : 0;

            const totalIncome = Math.round(projectIncome + quoteIncome);
            const totalExpense = Math.round(payrollExpense + overheadExpense);
            const profit = totalIncome - totalExpense;

            months.push({
                name: `${monthName} ${year}`,
                income: totalIncome,
                expense: totalExpense,
                profit: profit
            });
        }
        return months;
    }, [projects, staff, quotations, expenses]);

    const totalProjectedIncome = forecastData.reduce((sum, m) => sum + m.income, 0);
    const totalProjectedExpense = forecastData.reduce((sum, m) => sum + m.expense, 0);

    if (loadProjects || loadStaff || loadQuotes || loadExpenses) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-accent italic">
                Rebuilding financial timeline...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Revenue Forecast</h2>
                            <p className="text-gray-400 text-sm mt-1">12-Month Projected Income vs. Expenses</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl">
                        <Zap size={16} className="text-accent" />
                        <span className="text-xs font-bold text-accent uppercase tracking-tighter italic">AI Analysis Active</span>
                    </div>
                </header>

                <div className="grid grid-cols-4 gap-6 mb-10">
                    <div className="glass p-6 border-accent/20 bg-accent/5">
                        <div className="flex items-center gap-2 mb-4 text-accent uppercase text-[10px] font-bold tracking-widest">
                            <TrendingUp size={16} /> 12M Projected Income
                        </div>
                        <div className="text-3xl font-bold">{totalProjectedIncome.toLocaleString()} EGP</div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                            Full 12-Month pipeline estimate
                        </div>
                    </div>
                    <div className="glass p-6 border-red-500/20 bg-red-500/5">
                        <div className="flex items-center gap-2 mb-4 text-red-400 uppercase text-[10px] font-bold tracking-widest">
                            <TrendingDown size={16} /> 12M Projected Expense
                        </div>
                        <div className="text-3xl font-bold">{totalProjectedExpense.toLocaleString()} EGP</div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                            Mainly Fixed Payroll & Overheads
                        </div>
                    </div>
                    <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-2 mb-4 text-blue-400 uppercase text-[10px] font-bold tracking-widest">
                            <Scale size={16} /> Projected Net Margin
                        </div>
                        <div className="text-3xl font-bold text-blue-400">
                            {totalProjectedIncome > 0
                                ? Math.round(((totalProjectedIncome - totalProjectedExpense) / totalProjectedIncome) * 100)
                                : 0}%
                        </div>
                        <div className="text-xs text-gray-500 mt-2 italic">Based on active contracts</div>
                    </div>
                    <div className="glass p-6 border-purple-500/20 bg-purple-500/5">
                        <div className="flex items-center gap-2 mb-4 text-purple-400 uppercase text-[10px] font-bold tracking-widest">
                            <Briefcase size={16} /> Active Pipelines
                        </div>
                        <div className="text-3xl font-bold text-purple-400">{quotations.filter((q: any) => q.status === 'Sent').length} Quotes</div>
                        <div className="text-xs text-gray-500 mt-2 font-medium">Potentially {quotations.filter((q: any) => q.status === 'Sent').reduce((a, b) => a + Number(b.amount), 0).toLocaleString()} EGP</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 glass p-8 min-h-[450px] border-border-custom bg-white/2">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <BarChart3 className="text-accent" size={24} />
                                Cashflow Outlook
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-xs font-bold"><div className="w-3 h-3 rounded-full bg-accent" /> Income</div>
                                <div className="flex items-center gap-2 text-xs font-bold"><div className="w-3 h-3 rounded-full bg-red-500" /> Expense</div>
                            </div>
                        </div>

                        <div className="w-full h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={forecastData}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#6b7280"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ dy: 10 }}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #1a1a1a', borderRadius: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass p-8 border-border-custom bg-white/2">
                        <h3 className="font-bold text-xl mb-6">Pipeline Breakdown</h3>
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-white/5 border border-border-custom">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Fixed Payroll</span>
                                    <span className="text-sm font-bold text-red-400">-{staff.reduce((s, e) => s + (Number(e.base_salary || e.baseSalary) || 0), 0).toLocaleString()} EGP</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-400 transition-all duration-500"
                                        style={{ width: `${Math.min((totalProjectedExpense / (totalProjectedIncome || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 italic">Based on {staff.length} active employees</p>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-border-custom">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Monthly Service Revenue</span>
                                    <span className="text-sm font-bold text-accent">+{quotations.filter((q: any) => q.status === 'Accepted' && q.is_recurring).reduce((s, e) => s + Number(e.amount), 0).toLocaleString()} EGP</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent transition-all duration-500"
                                        style={{ width: `${Math.min((quotations.filter((q: any) => q.status === 'Accepted' && q.is_recurring).reduce((s, e) => s + Number(e.amount), 0) / (totalProjectedIncome || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 italic">From {quotations.filter((q: any) => q.status === 'Accepted' && q.is_recurring).length} recurring contracts</p>
                            </div>

                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-accent mb-2">
                                    <Zap size={16} /> Analysis Engine
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Projections are based on current contractual obligations and historical overheads. Update your quotations and salary registers to refine this forecast.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 glass p-6 border-border-custom bg-amber-500/5">
                    <p className="text-xs text-amber-500/80 font-medium">
                        <strong>Note:</strong> This forecast is purely based on active database records (Salary Registers, Staff Base Salaries, and Accepted Recurring Quotations). Accuracy depends on keeping quotation statuses up-to-date.
                    </p>
                </div>
            </main>
        </div>
    );
}
