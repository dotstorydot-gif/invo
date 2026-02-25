"use client";

import React, { useState } from "react";
import {
    FilePlus,
    Plus,
    Search,
    ArrowLeft,
    Clock,
    Tag,
    Layers,
    ShoppingCart,
    Trash2,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function PurchaseRequestsPage() {
    const { t } = useLanguage();
    const { data: requests, loading, upsert, remove } = useERPData<any>('purchase_requests');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        items: [{ name: '', qty: 1, unit: 'pcs', estimated_price: 0 }]
    });

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', qty: 1, unit: 'pcs', estimated_price: 0 }]
        });
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const handleSaveRequest = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                items: formData.items,
                status: 'Submitted'
            });
            setIsModalOpen(false);
            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                items: [{ name: '', qty: 1, unit: 'pcs', estimated_price: 0 }]
            });
        } catch (error) {
            console.error("Error saving request:", error);
            alert("Failed to save purchase request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto w-full">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/purchasing" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Purchase Requests</h2>
                            <p className="text-gray-400 text-sm mt-1">Draft and submit requests for materials, office supplies, or services.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>New Request</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <div className="glass overflow-hidden border-border-custom">
                        <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="text-accent" />
                                <h3 className="text-xl font-bold">Active Requests</h3>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border-custom bg-white/2">
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Request Title</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Priority</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Items</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Status</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-10 text-center italic text-gray-500">Loading requests...</td></tr>
                                    ) : requests.length > 0 ? (
                                        requests.map((req: any) => (
                                            <tr key={req.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                                <td className="p-6">
                                                    <div className="font-bold text-white">{req.title}</div>
                                                    <div className="text-[10px] text-gray-500">{req.description || 'No description'}</div>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${req.priority === 'High' ? 'bg-red-500/10 text-red-500' : req.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                        {req.priority}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-sm text-gray-400">
                                                    {req.items?.length || 0} unique items
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/10 text-gray-400'}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button onClick={() => remove(req.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={5} className="p-20 text-center text-gray-500 italic">No purchase requests yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="New Purchase Request"
                    onSubmit={handleSaveRequest}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Request Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    placeholder="e.g. Office Supplies for March"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-20 resize-none"
                                placeholder="..."
                            />
                        </div>

                        <div className="border-t border-border-custom pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Requested Items</h4>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="text-xs flex items-center gap-1 text-accent hover:underline"
                                >
                                    <Plus size={14} />
                                    Add Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-3 items-center">
                                        <div className="col-span-6">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                                                className="glass bg-white/5 border-border-custom p-2 rounded-lg outline-none focus:border-accent transition-all text-xs w-full"
                                                placeholder="Item Name"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => handleUpdateItem(index, 'qty', Number(e.target.value))}
                                                className="glass bg-white/5 border-border-custom p-2 rounded-lg outline-none focus:border-accent transition-all text-xs w-full"
                                                placeholder="Qty"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                value={item.estimated_price}
                                                onChange={(e) => handleUpdateItem(index, 'estimated_price', Number(e.target.value))}
                                                className="glass bg-white/5 border-border-custom p-2 rounded-lg outline-none focus:border-accent transition-all text-xs w-full"
                                                placeholder="Est. Price"
                                            />
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-2 text-gray-500 hover:text-red-500 transition-all"
                                                disabled={formData.items.length === 1}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
