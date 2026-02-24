"use client";

import React, { useState } from "react";
import {
    Package,
    Plus,
    Search,
    Filter,
    ArrowLeft,
    ArrowUp,
    ArrowDown,
    History,
    Edit2,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface InventoryItem {
    id: string;
    name: string;
    code: string;
    description: string;
    costPrice: number;
    quantity: number;
    stockThreshold: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    supplier?: string;
    lastRestocked: string;
}

export default function InventoryPage() {
    const { t } = useLanguage();
    const [items, setItems] = useState<InventoryItem[]>([
        { id: "1", name: "Cement Grade A", code: "MAT-001", description: "High-quality building cement", costPrice: 450, quantity: 120, stockThreshold: 50, status: 'In Stock', supplier: 'Steel Core Industries', lastRestocked: "2026-02-15" },
        { id: "2", name: "Steel Rebar 12mm", code: "MAT-002", description: "Reinforcement steel for units", costPrice: 1200, quantity: 45, stockThreshold: 20, status: 'Low Stock', supplier: 'Global Finishing Co.', lastRestocked: "2026-01-20" },
        { id: "3", name: "Electric Wiring 2.5mm", code: "MAT-003", description: "Internal wiring for residential units", costPrice: 85, quantity: 300, stockThreshold: 100, status: 'In Stock', supplier: 'Electro Supply Inc.', lastRestocked: "2026-02-01" }
    ]);

    const handleAdjustStock = (id: string, amount: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item
        ));
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('inventory')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('inventory_subtitle')}</p>
                        </div>
                    </div>

                    <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                        <Plus size={20} />
                        <span>{t('add_unit')}</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {/* Inventory Table */}
                    <div className="glass overflow-hidden border-border-custom">
                        <div className="p-6 border-b border-border-custom flex justify-between items-center">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <Package className="text-accent" size={24} />
                                Material Stock
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom">
                                    <Search size={18} className="text-gray-400" />
                                    <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-sm w-full" />
                                </div>
                                <button className="p-2 rounded-xl border border-border-custom text-gray-400 hover:text-accent transition-all">
                                    <Filter size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-border-custom">
                                        <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('item_name')}</th>
                                        <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('item_code')}</th>
                                        <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('cost_price')}</th>
                                        <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('stock')}</th>
                                        <th className="p-4 text-xs font-bold uppercase text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{item.name}</div>
                                                <div className="text-[10px] text-gray-500">{item.description}</div>
                                            </td>
                                            <td className="p-4 text-sm font-mono text-accent">{item.code}</td>
                                            <td className="p-4 text-sm font-bold">{item.costPrice} EGP</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.quantity < item.stockThreshold ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        {item.quantity}
                                                    </span>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button onClick={() => handleAdjustStock(item.id, 1)} className="p-1 rounded bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all">
                                                            <ArrowUp size={14} />
                                                        </button>
                                                        <button onClick={() => handleAdjustStock(item.id, -1)} className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                            <ArrowDown size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-accent transition-all">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-red-500 transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-blue-400 transition-all">
                                                        <History size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
