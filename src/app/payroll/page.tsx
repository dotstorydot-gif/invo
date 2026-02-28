'use client';

import React from 'react';
import Link from 'next/link';
import {
    Briefcase, FileText, CreditCard, BadgeDollarSign,
    Activity, ShieldCheck, Filter, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from "@/context/LanguageContext";

export default function PayrollDashboard() {
    const { t } = useLanguage();
    const tabs = [
        { name: t('contracts'), icon: Briefcase, href: '/payroll/contracts' },
        { name: t('salary_register'), icon: FileText, href: '/payroll/register' },
        { name: t('salary_slips'), icon: CreditCard, href: '/payroll/slips' },
        { name: t('salary_advances'), icon: BadgeDollarSign, href: '/payroll/advances' },
        { name: t('salary_items'), icon: Activity, href: '/payroll/items' },
        { name: t('salary_templates'), icon: ShieldCheck, href: '/payroll/templates' },
        { name: t('settings'), icon: Filter, href: '/settings' },
    ];

    return (
        <div className="p-4 md:p-8 overflow-y-auto w-full h-full bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{t('payroll_engine')}</h1>
                    <p className="text-gray-400">{t('payroll_engine_desc')}</p>
                </div>

                {/* Tab List */}
                <div className="flex flex-col gap-3">
                    {/* Payroll category links */}
                    <div className="lg:col-span-1 space-y-2">
                        {[
                            { label: t('contracts'), icon: Briefcase, href: '/payroll/contracts' },
                            { label: t('salary_register'), icon: FileText, href: '/payroll/register' },
                            { label: t('salary_slips'), icon: CreditCard, href: '/payroll/slips' },
                            { label: t('salary_advances'), icon: BadgeDollarSign, href: '/payroll/advances' },
                            { label: t('salary_items'), icon: Activity, href: '/payroll/items' },
                            { label: t('salary_templates'), icon: ShieldCheck, href: '/payroll/templates' },
                            { label: t('settings'), icon: Filter, href: '/settings' }
                        ].map((link, i) => (
                            <Link
                                href={link.href}
                                key={i}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-border-custom hover:border-accent/40 bg-white/5 group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon size={18} className="text-gray-500 group-hover:text-accent transition-colors" />
                                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">{link.label}</span>
                                </div>
                                <ChevronRight size={14} className="text-gray-700 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>

                    {/* Review Request button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: tabs.length * 0.05 }} // Delay after other tabs
                    >
                        <Link
                            href="/payroll/review"
                            className="w-full flex items-center justify-between p-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/10 hover:bg-[#161616] transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <FileText className="w-6 h-6 text-gray-400 group-hover:text-accent transition-colors" />
                                <span className="text-lg font-bold text-white tracking-tight">{t('review_requests')}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                        </Link>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
