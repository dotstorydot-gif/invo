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
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface InventoryItem {
    id: string;
    name: string;
    code: string;
    description: string;
    cost_price: number;
    quantity: number;
    stock_threshold: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    supplier?: string;
    last_restocked: string;
    project_id?: string;
}

export default function InventoryPage() {
    const { t } = useLanguage();
    const { data: items, loading, upsert } = useERPData<InventoryItem>('inventory');
    const { data: projects } = useERPData<any>('projects');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        cost_price: 0,
        quantity: 0,
        stock_threshold: 10,
        supplier: '',
        project_id: ''
    });

    const handleAddItem = async () => {
        try {
            setIsSubmitting(true);
            const status = formData.quantity <= 0 ? 'Out of Stock' :
                formData.quantity < formData.stock_threshold ? 'Low Stock' : 'In Stock';

            await upsert({
                name: formData.name,
                code: formData.code,
                description: formData.description,
                cost_price: Number(formData.cost_price),
                quantity: Number(formData.quantity),
                stock_threshold: Number(formData.stock_threshold),
                status: status as any,
                supplier: formData.supplier,
                last_restocked: new Date().toISOString().split('T')[0],
                project_id: formData.project_id || null
            });
            setIsModalOpen(false);
            setFormData({
                name: '',
                code: '',
                description: '',
                cost_price: 0,
                quantity: 0,
                stock_threshold: 10,
                supplier: '',
                project_id: ''
            });
        } catch (error) {
            console.error("Error adding inventory item:", error);
            alert("Failed to add inventory item.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdjustStock = async (item: InventoryItem, amount: number) => {
        try {
            const newQuantity = Math.max(0, item.quantity + amount);
            const status = newQuantity <= 0 ? 'Out of Stock' :
                newQuantity < item.stock_threshold ? 'Low Stock' : 'In Stock';

            await upsert({
                ...item,
                quantity: newQuantity,
                status: status as any
            });
        } catch (error) {
            console.error("Error adjusting stock:", error);
        }
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

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Material</span>
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
                                <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background shadow-inner">
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
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-10 text-center italic text-gray-500">Syncing inventory...</td></tr>
                                    ) : (
                                        items.map((item) => (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border-b border-border-custom hover:bg-white/5 transition-colors group"
                                            >
                                                <td className="p-4">
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        {item.name}
                                                        {item.project_id && projects.find((p: any) => p.id === item.project_id) && (
                                                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                                                {projects.find((p: any) => p.id === item.project_id)?.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500">{item.description}</div>
                                                </td>
                                                <td className="p-4 text-sm font-mono text-accent">{item.code}</td>
                                                <td className="p-4 text-sm font-bold">{(item.cost_price || 0).toLocaleString()} EGP</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.quantity < item.stock_threshold ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                            {item.quantity}
                                                        </span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button onClick={() => handleAdjustStock(item, 1)} className="p-1 rounded bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all">
                                                                <ArrowUp size={14} />
                                                            </button>
                                                            <button onClick={() => handleAdjustStock(item, -1)} className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
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
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add Inventory Item"
                    onSubmit={handleAddItem}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="e.g. Cement"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Item Code</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="e.g. MAT-001"
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-20 resize-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Cost Price (EGP)</label>
                            <input
                                type="number"
                                value={formData.cost_price}
                                onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Stock Threshold</label>
                            <input
                                type="number"
                                value={formData.stock_threshold}
                                onChange={(e) => setFormData({ ...formData, stock_threshold: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Supplier</label>
                            <input
                                type="text"
                                value={formData.supplier}
                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="Supplier name"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Linked Project</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">None / General Material</option>
                                {projects.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
