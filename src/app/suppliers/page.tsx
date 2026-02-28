'use client';

import React from 'react';
import Link from 'next/link';
import {
    Truck, CreditCard, FileMinus, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function SuppliersDashboard() {
    const { t } = useLanguage();
    const tabs = [
        { name: t('supplier_management'), icon: Truck, href: '/suppliers/directory' },
        { name: t('supplier_payments'), icon: CreditCard, href: '/suppliers/payments' },
        { name: t('debit_notes'), icon: FileMinus, href: '/suppliers/debit-notes' },
    ];

    return (
        <div className="p-4 md:p-8 overflow-y-auto w-full h-full bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{t('suppliers_logistics')}</h1>
                    <p className="text-gray-400">{t('suppliers_logistics_desc')}</p>
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
