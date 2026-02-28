'use client';

import React from 'react';
import Link from 'next/link';
import {
    FileText, ClipboardList, Receipt, ArrowRightLeft,
    ShoppingCart, ShieldAlert, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function PurchasingDashboard() {
    const { t } = useLanguage();
    const tabs = [
        { name: t('purchase_requests'), icon: FileText, href: '/purchasing/requests' },
        { name: t('rfqs'), icon: ClipboardList, href: '/purchasing/rfq' },
        { name: t('purchase_quotations'), icon: ShieldAlert, href: '/purchasing/quotations' },
        { name: t('purchase_orders'), icon: ShoppingCart, href: '/purchasing/orders' },
        { name: t('purchase_invoices'), icon: Receipt, href: '/purchasing/invoices' },
        { name: t('purchase_returns'), icon: ArrowRightLeft, href: '/purchasing/returns' },
    ];

    return (
        <div className="p-4 md:p-8 overflow-y-auto w-full h-full bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{t('purchasing_cycle')}</h1>
                    <p className="text-gray-400">{t('purchasing_cycle_desc')}</p>
                </div>

                {/* Tab List */}
                <div className="flex flex-col gap-3">
                    {tabs.map((tab, i) => (
                        <motion.div
                            key={tab.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link href={tab.href}>
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/10 hover:bg-[#161616] transition-all group">
                                    <div className="flex items-center gap-4">
                                        <tab.icon className="w-6 h-6 text-gray-400 group-hover:text-accent transition-colors" />
                                        <span className="text-lg font-bold text-white tracking-tight">{tab.name}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
}
