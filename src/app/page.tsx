"use client";

import React, { useState } from "react";
import {
  Users2,
  Building2,
  ChevronUp,
  Plus,
  Search,
  Bell,
  Target,
  Crown,
  Play,
  TrendingUp,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { SmartActionCenter } from "@/components/SmartActionCenter";
import SetupWizard from "@/components/SetupWizard";
import { useERPData } from "@/hooks/useERPData";
import { LucideIcon, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const KPICard = ({ title, value, change, icon: Icon, color }: { title: string, value: string, change: string, icon: LucideIcon, color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass p-8 border-border-custom bg-white/5 hover:border-accent/40 group transition-all"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl bg-background ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      {change !== "0%" && change !== "+0%" && (
        <div className="flex items-center gap-1 text-accent text-sm font-semibold">
          <ChevronUp size={16} />
          {change}
        </div>
      )}
    </div>
    <div className="text-gray-400 text-sm font-medium mb-1">{title}</div>
    <div className="text-2xl font-bold gradient-text">{value}</div>
  </motion.div>
);

export default function Dashboard() {
  const { t, toggleLanguage, language } = useLanguage();
  const { session } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Last 6 Months');

  const { data: expenses = [] } = useERPData<{ amount: number, category: string, date: string }>('expenses');
  const { data: units = [] } = useERPData<{ id: string, status: string }>('units');
  const { data: customers = [] } = useERPData<{ id: string }>('customers');
  const { data: salesInvoices = [] } = useERPData<{ amount: number, created_at: string }>('sales_invoices');
  const { data: staff } = useERPData<any>('staff'); // Unused, keeping original type
  const { data: loans = [] } = useERPData<{ status: string, principal_amount: number, amount_paid: number }>('loans');
  const { data: stashTransactions = [] } = useERPData<{ amount: number, type: string, source: string, created_at: string }>('stash_transactions');
  const { data: services = [] } = useERPData<{ id: string, name: string, created_at: string }>('services');

  const isMarketing = session?.moduleType === 'Service & Marketing';

  const filterByDate = (date: string) => {
    if (!date) return true;
    const d = new Date(date);
    const now = new Date();
    if (dateRange === 'Last 30 Days') return d >= new Date(now.setDate(now.getDate() - 30));
    if (dateRange === 'Last 3 Months') return d >= new Date(now.setMonth(now.getMonth() - 3));
    if (dateRange === 'This Year') return d.getFullYear() === now.getFullYear();
    return true; // Last 6 Months (default) or other
  };

  const filteredSales = salesInvoices.filter(inv => filterByDate(inv.created_at));
  const filteredStashIn = stashTransactions.filter(tx => tx.type === 'In' && filterByDate(tx.created_at));
  const filteredExpenses = expenses.filter(exp => filterByDate(exp.date));

  // Aggregations
  const totalRevenue = filteredSales.reduce((sum: number, inv) => sum + (Number(inv.amount) || 0), 0) +
    filteredStashIn.reduce((sum: number, tx) => sum + (Number(tx.amount) || 0), 0);
  const totalUnits = (units || []).length;
  const totalActiveLoans = (loans || [])
    .filter(l => l.status === 'Active')
    .reduce((sum, l) => sum + (Math.max(0, (Number(l.principal_amount) || 0) - (Number(l.amount_paid) || 0))), 0);

  const activeUnits = units.filter(u => u.status === 'Available').length;
  const customerCount = customers.length;
  const activeServicesCount = services.length;
  // const serviceCount = services.length; // Redundant, replaced by activeServicesCount

  const recentActivity = [
    ...services.slice(0, 2).map((svc: any) => ({
      label: t("service_listed"),
      client: svc.name,
      time: new Date(svc.created_at).toLocaleDateString()
    })),
    ...(staff || []).slice(0, 2).map((s: any) => ({
      label: t("team_member_added"),
      client: s.full_name || s.name || t('new_staff'),
      time: s.created_at ? new Date(s.created_at).toLocaleDateString() : t('recent')
    }))
  ].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

  return (
    <main className="flex-1 p-8 overflow-y-auto w-full">
      <SetupWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} isMarketing={isMarketing} />

      {/* Setup Wizard Trigger */}
      <div className="glass p-6 bg-gradient-to-r from-accent/10 to-transparent border-accent/20 relative overflow-hidden group mb-10">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Target size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <span className="p-2 bg-accent/20 rounded-lg text-accent"><Crown size={20} /></span>
              {t('interactive_setup_wizard')}
            </h3>
            <p className="text-sm text-gray-400 mt-2 max-w-xl">
              {t('wizard_desc')}
            </p>
          </div>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-accent hover:bg-emerald-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
          >
            <Play size={18} fill="currentColor" /> {t('launch_wizard')}
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold gradient-text">{t('dashboard')}</h2>
          <p className="text-gray-400 text-sm mt-1">{t('welcome')}, Sameh Kamel</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass flex items-center px-4 py-2 gap-2 border-border-custom bg-white/5 text-xs font-bold text-accent">
            <Calendar size={16} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="Last 30 Days">{t('last_30_days')}</option>
              <option value="Last 3 Months">{t('last_3_months')}</option>
              <option value="Last 6 Months">{t('last_6_months')}</option>
              <option value="This Year">{t('this_year')}</option>
            </select>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all text-xs font-bold uppercase tracking-widest bg-white/5"
          >
            {language === 'en' ? 'Arabic / العربية' : 'English / الإنجليزية'}
          </button>
          <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <button className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
            <Bell size={20} />
          </button>
          <div className="w-10 h-10 rounded-xl gradient-accent p-[2px]">
            <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center text-accent text-xs font-bold">
              SK
            </div>
          </div>
        </div>
      </header>

      {/* Smart Action Center */}
      <SmartActionCenter />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <KPICard title={t('total_revenue')} value={`${(totalRevenue / 1000).toFixed(1)}k EGP`} change="+0%" icon={TrendingUp} color="text-emerald-400" />
        <KPICard
          title={isMarketing ? t("listed_services") : t('active_units')}
          value={isMarketing ? activeServicesCount.toString() : activeUnits.toString()}
          change="+0%"
          icon={isMarketing ? Briefcase : Building2}
          color="text-accent"
        />
        <KPICard title={t("team_members_kpi")} value={(staff?.length || 0).toString()} change="+0%" icon={Users2} color="text-emerald-400" />
        <KPICard title={isMarketing ? t('clients') : t('customers')} value={customerCount.toString()} change="+0%" icon={Briefcase} color="text-blue-400" />
        <KPICard title={t("active_loans_debt")} value={`${totalActiveLoans.toLocaleString()} EGP`} change="+0%" icon={Target} color="text-red-400" />
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-8 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold">{t('revenue_overview')}</h3>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-background border border-border-custom rounded-lg px-3 py-1 text-sm outline-none cursor-pointer"
            >
              <option value="Last 30 Days">{t('last_30_days')}</option>
              <option value="Last 3 Months">{t('last_3_months')}</option>
              <option value="Last 6 Months">{t('last_6_months')}</option>
              <option value="This Year">{t('this_year')}</option>
            </select>
          </div>
          <div className="flex-1 flex items-end gap-3 px-4">
            {(() => {
              // Simple grouping by month for the filtered revenue
              const last6Months = Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                return d.toLocaleString('default', { month: 'short' });
              }).reverse();

              return last6Months.map((month, i) => {
                const monthRevenue = filteredSales.filter(inv => {
                  const d = new Date(inv.created_at);
                  return d.toLocaleString('default', { month: 'short' }) === month;
                }).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

                const maxHeight = Math.max(...last6Months.map(m =>
                  filteredSales.filter(inv => new Date(inv.created_at).toLocaleString('default', { month: 'short' }) === m)
                    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)
                ), 1);

                const height = (monthRevenue / maxHeight) * 100;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-accent/20 to-accent relative group"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {monthRevenue.toLocaleString()} EGP
                      </div>
                    </motion.div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{month}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div className="glass p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold">{t('recent_activity')}</h3>
            <button className="text-accent hover:text-white transition-colors">
              <Plus size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex gap-4 border-l-2 border-accent/20 pl-4 py-1 hover:border-accent transition-colors">
                <div>
                  <div className="text-sm font-bold">{activity.label}</div>
                  <div className="text-xs text-gray-400">Target: <span className="text-white">{activity.client}</span></div>
                  <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{activity.time}</div>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-10 text-gray-500 italic">{t('no_activity')}</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
