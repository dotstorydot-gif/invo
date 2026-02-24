"use client";

import React, { useState } from "react";
import {
    Users,
    Plus,
    Search,
    ArrowLeft,
    Truck,
    Phone,
    Mail,
    MapPin,
    Star,
    Package,
    CreditCard,
    ExternalLink,
    ChevronRight,
    Filter,
    BarChart2,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface Supplier {
    id: string;
    name: string;
    category: string;
    products: string[];
    contact: {
        phone: string;
        email: string;
        address: string;
    };
    performance: number; // 1-5 rating
    balance: number; // Amount we owe them
    status: 'Active' | 'On Hold' | 'Blacklisted';
}

export default function SuppliersPage() {
    const { t } = useLanguage();
    const [suppliers] = useState<Supplier[]>([
        {
            id: "SUP-001",
            name: "Steel Core Industries",
            category: "Construction Materials",
            products: ["Reinforcement Bars", "Structure Steel", "Wire Mesh"],
            contact: { phone: "+20 100 234 5678", email: "sales@steelcore.com", address: "6th October City, Egypt" },
            performance: 4.8,
            balance: 150000,
            status: 'Active'
        },
        {
            id: "SUP-002",
            name: "Global Finishing Co.",
            category: "Finishing & Decor",
            products: ["Ceramics", "Marble", "Paints"],
            contact: { phone: "+20 111 987 6543", email: "info@globalfinish.com", address: "New Cairo, Egypt" },
            performance: 4.2,
            balance: 45000,
            status: 'Active'
        },
        {
            id: "SUP-003",
            name: "Electric Link Ltd",
            category: "Electrical Components",
            products: ["Cables", "Switchboards", "Lighting"],
            contact: { phone: "+20 122 345 6789", email: "support@elink.eg", address: "Alexandria, Egypt" },
            performance: 3.5,
            balance: 12000,
            status: 'On Hold'
        }
    ]);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('suppliers')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('supplier_management')}</p>
                        </div>
                    </div>

                    <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                        <Plus size={20} />
                        <span>Add Supplier</span>
                    </button>
                </header>

                {/* Global Supplier Metrics */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                    <div className="glass p-6 border-accent/20 bg-accent/5">
                        <div className="flex items-center gap-3 text-accent mb-4">
                            <Truck size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('supply_chain')}</span>
                        </div>
                        <div className="text-3xl font-bold">42 Partners</div>
                        <div className="text-[10px] text-gray-500 mt-2">Active supply routes</div>
                    </div>

                    <div className="glass p-6 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 text-emerald-400 mb-4">
                            <Package size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Active SKUs</span>
                        </div>
                        <div className="text-3xl font-bold">1,240 Items</div>
                        <div className="text-[10px] text-gray-500 mt-2">Inventory coverage</div>
                    </div>

                    <div className="glass p-6 border-red-500/20 bg-red-500/5">
                        <div className="flex items-center gap-3 text-red-400 mb-4">
                            <CreditCard size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Total Payables</span>
                        </div>
                        <div className="text-3xl font-bold">207,000 EGP</div>
                        <div className="text-[10px] text-gray-500 mt-2">Connected to Expenses</div>
                    </div>

                    <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 text-blue-400 mb-4">
                            <BarChart2 size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Reliability</span>
                        </div>
                        <div className="text-3xl font-bold">96.4%</div>
                        <div className="text-[10px] text-gray-500 mt-2">Delivery SLA met</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {suppliers.map((sup) => (
                        <motion.div
                            key={sup.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-6 border-border-custom hover:border-accent group transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                        <Truck size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold">{sup.name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${sup.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {sup.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">{sup.category}</p>

                                        <div className="flex gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><Phone size={12} /> {sup.contact.phone}</span>
                                            <span className="flex items-center gap-1"><Mail size={12} /> {sup.contact.email}</span>
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {sup.contact.address}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t('rating')}</div>
                                    <div className="flex items-center justify-end gap-1 text-yellow-400 font-bold text-lg mb-4">
                                        <Star size={16} fill="currentColor" /> {sup.performance}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-gray-500 uppercase font-bold">Outstanding Balance</span>
                                        <span className="text-lg font-bold text-red-400">{sup.balance.toLocaleString()} EGP</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border-custom flex items-center justify-between">
                                <div className="flex gap-2">
                                    {sup.products.map((p, i) => (
                                        <span key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <Link href={`/cheques?entity=${sup.name}`} className="p-2 rounded-lg border border-border-custom text-gray-500 hover:text-accent hover:border-accent transition-all">
                                        <CreditCard size={18} />
                                    </Link>
                                    <Link href={`/inventory?supplier=${sup.name}`} className="p-2 rounded-lg border border-border-custom text-gray-500 hover:text-accent hover:border-accent transition-all">
                                        <Package size={18} />
                                    </Link>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 text-accent text-xs font-bold hover:bg-accent hover:text-white transition-all">
                                        <ExternalLink size={14} /> Full Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
