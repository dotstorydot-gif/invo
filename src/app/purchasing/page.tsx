'use client';

import React from 'react';
import Link from 'next/link';
import {
    FileText, ClipboardList, Receipt, ArrowRightLeft,
    ShoppingCart, ShieldAlert, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PurchasingDashboard() {
    const tabs = [
        { name: 'Purchase Requests', icon: FileText, href: '/purchasing/requests' },
        { name: 'Request for Quotations', icon: ClipboardList, href: '/purchasing/rfq' },
        { name: 'Purchase Quotations', icon: ShieldAlert, href: '/purchasing/quotations' },
        { name: 'Purchase Orders', icon: ShoppingCart, href: '/purchasing/orders' },
        { name: 'Purchase Invoices', icon: Receipt, href: '/purchasing/invoices' },
        { name: 'Purchase Returns', icon: ArrowRightLeft, href: '/purchasing/returns' },
    ];

    return (
        <div className="p-4 md:p-8 overflow-y-auto w-full h-full bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Purchasing Cycle</h1>
                    <p className="text-gray-400">Manage procurement, orders, and purchase returns.</p>
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
