"use client";

import React from "react";
import {
  Users2,
  Building2,
  BarChart3,
  ChevronUp,
  Plus,
  Search,
  Bell,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { SmartActionCenter } from "@/components/SmartActionCenter";
import { LucideIcon } from "lucide-react";

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
      <div className="flex items-center gap-1 text-accent text-sm font-semibold">
        <ChevronUp size={16} />
        {change}
      </div>
    </div>
    <div className="text-gray-400 text-sm font-medium mb-1">{title}</div>
    <div className="text-2xl font-bold gradient-text">{value}</div>
  </motion.div>
);

export default function Dashboard() {
  const { t, toggleLanguage, language } = useLanguage();

  return (
    <main className="flex-1 p-8 overflow-y-auto w-full">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold gradient-text">{t('dashboard')}</h2>
          <p className="text-gray-400 text-sm mt-1">{t('welcome')}, Sameh Kamel</p>
        </div>

        <div className="flex items-center gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <KPICard title={t('total_revenue')} value="45.8M" change="+12.5%" icon={TrendingUp} color="text-emerald-400" />
        <KPICard title={t('active_units')} value="842" change="+3.2%" icon={Building2} color="text-accent" />
        <KPICard title="Customers" value="1,248" change="+5.4%" icon={Users2} color="text-blue-400" />
        <KPICard title="Occupancy" value="94.2%" change="+1.8%" icon={BarChart3} color="text-purple-400" />
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-8 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold">{t('revenue_overview')}</h3>
            <select className="bg-background border border-border-custom rounded-lg px-3 py-1 text-sm outline-none">
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="flex-1 flex items-end gap-3 px-4">
            {[40, 65, 45, 90, 75, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-accent/20 to-accent relative group"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                    ${height * 10}k
                  </div>
                </motion.div>
                <span className="text-[10px] text-gray-500 uppercase font-bold">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
              </div>
            ))}
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
            {[
              { label: "New Invoice created", client: "Client A", time: "10:25 ago" },
              { label: "Payment received", client: "Client B", time: "11:25 ago" },
              { label: "New Rental Contract", client: "Unit 304", time: "12:33 ago" },
              { label: "Maintenance alert", client: "System", time: "13:33 ago" }
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 border-l-2 border-accent/20 pl-4 py-1 hover:border-accent transition-colors">
                <div>
                  <div className="text-sm font-bold">{activity.label}</div>
                  <div className="text-xs text-gray-400">Target: <span className="text-white">{activity.client}</span></div>
                  <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
