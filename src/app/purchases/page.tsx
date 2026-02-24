"use client";

import React, { useState } from "react";
import {
    ShoppingCart,
    Plus,
    Search,
    ArrowLeft,
    FileText,
    ClipboardList,
    ArrowRightLeft,
    Truck,
    CreditCard,
    ChevronRight,
    Filter,
    AlertCircle,
    Activity
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface PurchaseStage {
    id: string;
    type: 'Request' | 'RFQ' | 'Order' | 'Invoice';
    title: string;
    ref: string;
    status: 'Pending' | 'Approved' | 'Completed';
    amount: number;
    date: string;
    supplier?: string;
}

export default function PurchasesPage() {
    const { t } = useLanguage();
    const { data: purchaseData, loading, upsert } = useERPData<any>('purchases');
    const { data: suppliers } = useERPData<any>('suppliers');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        supplier_id: '',
        type: 'Request',
        total_amount: 0,
        status: 'Pending'
    });

    const handleCreatePurchase = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                supplier_id: formData.supplier_id || null,
                type: formData.type,
                total_amount: Number(formData.total_amount),
                status: formData.status
            });
            setIsModalOpen(false);
            setFormData({
                supplier_id: '',
                type: 'Request',
                total_amount: 0,
                status: 'Pending'
            });
        } catch (error) {
            console.error("Error creating purchase:", error);
            alert("Failed to create purchase record.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const purchaseFlow = [
        { label: t('purchase_requests'), icon: FileText, count: 5, color: "text-blue-400" },
        { label: t('rfqs'), icon: ClipboardList, count: 3, color: "text-indigo-400" },
        { label: t('purchase_orders'), icon: ShoppingCart, count: 8, color: "text-emerald-400" },
        { label: t('purchase_invoices'), icon: CreditCard, count: 12, color: "text-amber-400" }
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('purchases')}</h2>
                            <p className="text-gray-400 text-sm mt-1">Full Procurement Lifecycle & Supplier Logistics</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>Create New</span>
                    </button>
                </header>

                {/* Procurement Pipeline */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                    {purchaseFlow.map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="glass p-6 border-border-custom hover:border-accent/30 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className={`p-3 rounded-xl bg-background shadow-lg ${item.color}`}>
                                    <item.icon size={24} />
                                </div>
                                <div className="text-2xl font-bold">{item.count}</div>
                            </div>
                            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">{item.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Links - Matching User's Image Categories */}
                    <div className="lg:col-span-1 space-y-2">
                        {[
                            { label: t('purchase_requests'), icon: FileText },
                            { label: t('rfqs'), icon: ClipboardList },
                            { label: t('purchase_quotations'), icon: FileText },
                            { label: t('purchase_orders'), icon: ShoppingCart },
                            { label: t('purchase_invoices'), icon: CreditCard },
                            { label: t('purchase_returns'), icon: ArrowRightLeft },
                            { label: t('salary_items'), icon: Activity },
                            { label: t('debit_notes'), icon: AlertCircle },
                            { label: t('supplier_management'), icon: Truck, link: '/suppliers' },
                            { label: t('supplier_payments'), icon: DollarSign2 }
                        ].map((link, i) => (
                            <Link
                                href={link.link || "#"}
                                key={i}
                                className="flex items-center justify-between p-4 rounded-xl border border-border-custom hover:border-accent/40 bg-white/5 group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon size={18} className="text-gray-500 group-hover:text-accent transition-colors" />
                                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">{link.label}</span>
                                </div>
                                <ChevronRight size={14} className="text-gray-700 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <div className="glass border-border-custom overflow-hidden">
                            <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
                                <h3 className="font-bold">Recent Purchasing Activity</h3>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg border border-border-custom text-gray-400 hover:text-accent"><Search size={16} /></button>
                                    <button className="p-2 rounded-lg border border-border-custom text-gray-400 hover:text-accent"><Filter size={16} /></button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="text-center py-10 text-gray-500 italic">Syncing procurement data...</div>
                                    ) : (
                                        purchaseData.map((po, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 border border-border-custom rounded-xl hover:bg-white/5 transition-all">
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                        <ShoppingCart size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{po.id?.slice(0, 8) || `PO-${1000 + i}`}</div>
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase">{po.type || t('purchase_orders')}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-white">{(po.total_amount || 0).toLocaleString()} EGP</div>
                                                    <span className="text-[10px] text-emerald-500 font-bold uppercase">{po.status || t('paid')}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Create Procurement Record"
                    onSubmit={handleCreatePurchase}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Supplier</label>
                            <select
                                value={formData.supplier_id}
                                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Request">Purchase Request</option>
                                <option value="RFQ">RFQ</option>
                                <option value="Order">Purchase Order</option>
                                <option value="Invoice">Purchase Invoice</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Total Amount (EGP)</label>
                            <input
                                type="number"
                                value={formData.total_amount}
                                onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Initial Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}

function DollarSign2({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}
