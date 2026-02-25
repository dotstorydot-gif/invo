"use client";

import React, { useState } from "react";
import {
    Activity,
    Plus,
    Search,
    ArrowLeft,
    TrendingUp,
    CheckCircle,
    Truck,
    Clock,
    ShoppingCart,
    Package,
    Edit2,
    Trash2,
    FileText,
    Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface PurchaseOrder {
    id: string;
    order_number: string;
    supplier_id: string;
    date: string;
    expected_delivery_date: string;
    status: 'Draft' | 'Sent' | 'Completed' | 'Cancelled';
    total_amount: number;
    notes: string;
    request_type: 'Inventory' | 'Office Supplies' | 'Items';
    quotation_style: 'Standard' | 'Urgent' | 'Bulk';
    attachment_url: string;
    quotation_id?: string;
    items: any[];
}

export default function PurchaseOrdersPage() {
    const { t } = useLanguage();
    const { data: orders, loading, upsert, remove } = useERPData<PurchaseOrder>('purchase_orders');
    const { data: quotations } = useERPData<any>('purchase_quotations');
    const { data: suppliers } = useERPData<any>('suppliers');
    const { upsert: upsertExpense } = useERPData<any>('expenses');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        order_number: `PO-${Math.floor(Math.random() * 10000)}`,
        supplier_id: '',
        date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        status: 'Draft' as 'Draft' | 'Sent' | 'Completed' | 'Cancelled',
        total_amount: 0,
        notes: '',
        request_type: 'Items' as 'Inventory' | 'Office Supplies' | 'Items',
        quotation_style: 'Standard' as 'Standard' | 'Urgent' | 'Bulk',
        attachment_url: '',
        quotation_id: '',
        items: [] as any[]
    });

    const handleOpenModal = (order?: PurchaseOrder) => {
        if (order) {
            setEditingId(order.id);
            setFormData({
                order_number: order.order_number || '',
                supplier_id: order.supplier_id || '',
                date: order.date ? new Date(order.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                expected_delivery_date: order.expected_delivery_date ? new Date(order.expected_delivery_date).toISOString().split('T')[0] : '',
                status: order.status || 'Draft',
                total_amount: order.total_amount || 0,
                notes: order.notes || '',
                request_type: order.request_type || 'Items',
                quotation_style: order.quotation_style || 'Standard',
                attachment_url: order.attachment_url || '',
                quotation_id: order.quotation_id || '',
                items: order.items || []
            });
        } else {
            setEditingId(null);
            setFormData({
                order_number: `PO-${Math.floor(Math.random() * 100000)}`,
                supplier_id: '',
                date: new Date().toISOString().split('T')[0],
                expected_delivery_date: '',
                status: 'Draft',
                total_amount: 0,
                notes: '',
                request_type: 'Items',
                quotation_style: 'Standard',
                attachment_url: '',
                quotation_id: '',
                items: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            const savedOrder = await upsert({
                ...(editingId ? { id: editingId } : {}),
                order_number: formData.order_number,
                supplier_id: formData.supplier_id || undefined,
                date: formData.date,
                expected_delivery_date: formData.expected_delivery_date || undefined,
                status: formData.status,
                total_amount: formData.total_amount,
                notes: formData.notes,
                request_type: formData.request_type,
                quotation_style: formData.quotation_style,
                attachment_url: formData.attachment_url,
                quotation_id: formData.quotation_id || undefined,
                items: formData.items
            });

            // Logical expense linking: if marking as completed/paid, push to expenses automatically
            if (formData.status === 'Completed' && savedOrder) {
                await upsertExpense({
                    category: 'Purchases',
                    subcategory: formData.request_type,
                    amount: formData.total_amount,
                    description: `Auto-Expense for ${formData.order_number} (${formData.notes})`,
                    date: formData.date,
                    payment_method: 'Cash',
                    receipt_url: formData.attachment_url,
                    approved: true
                });
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving purchase order:", error);
            alert("Failed to save purchase order.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this purchase order?")) {
            await remove(id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Sent': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Draft': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle size={14} className="text-emerald-400" />;
            case 'Sent': return <Truck size={14} className="text-blue-400" />;
            case 'Draft': return <Clock size={14} className="text-gray-400" />;
            case 'Cancelled': return <Activity size={14} className="text-red-500" />;
            default: return <Clock size={14} className="text-gray-400" />;
        }
    };

    const totalOrdersValue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/purchasing" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Purchase Orders</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage supplier orders, inventory requests, and expenses</p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>Create Order</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass p-6 border-accent/20 bg-accent/5 col-span-1">
                        <div className="flex items-center gap-3 text-accent mb-4">
                            <ShoppingCart size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest">Total Sourced Value</span>
                        </div>
                        <div className="text-4xl font-bold">{totalOrdersValue.toLocaleString()} EGP</div>
                        <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                            <TrendingUp size={12} className="text-accent" />
                            Lifetime tracked purchase orders
                        </div>
                    </div>

                    <div className="glass p-6 border-border-custom md:col-span-2 flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-gray-400 mb-2">
                            <Package size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Purchasing Cycle</span>
                        </div>
                        <p className="text-sm text-gray-500">Track orders by Quotation Style, Request Type, and Attachments. Completing an order automatically logs it to the main Expenses ledger.</p>
                    </div>
                </div>

                <div className="glass overflow-hidden border-border-custom">
                    <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            Order History
                        </h3>
                        <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                            <Search size={18} className="text-gray-400" />
                            <input type="text" placeholder="Search orders..." className="bg-transparent border-none outline-none text-sm w-full" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-border-custom">
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Order Ref</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Date Logged</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Classification</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Amount</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Status</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-10 text-center italic text-gray-500">Loading purchase orders...</td></tr>
                                ) : (
                                    orders.map((order) => (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border-b border-border-custom hover:bg-white/5 transition-colors group cursor-pointer"
                                            onClick={() => handleOpenModal(order)}
                                        >
                                            <td className="p-4">
                                                <div className="font-bold text-white text-sm font-mono flex items-center gap-2">
                                                    {order.order_number}
                                                    {order.quotation_id && <CheckCircle size={12} className="text-emerald-400" />}
                                                    {order.attachment_url && <Paperclip size={14} className="text-accent" />}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-mono text-gray-500">
                                                {new Date(order.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400">{order.request_type}</span>
                                                    <span className="text-[9px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded w-fit">{order.quotation_style}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-bold text-white">
                                                {(Number(order.total_amount) || 0).toLocaleString()} EGP
                                            </td>
                                            <td className="p-4 text-sm">
                                                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase flex items-center justify-center gap-2 w-fit ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleOpenModal(order)} className="p-2 text-gray-400 hover:text-accent transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(order.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                                        <Trash2 size={16} />
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

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingId ? "Update Purchase Order" : "Create Purchase Order"}
                    onSubmit={handleSave}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Order Details</label>
                            <input
                                type="text"
                                value={formData.order_number}
                                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm font-mono text-accent font-bold"
                                placeholder="Order Reference"
                                required
                            />
                            <div className="flex flex-col gap-2 mt-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Link Approved Quotation</label>
                                <select
                                    value={formData.quotation_id}
                                    onChange={(e) => {
                                        const qId = e.target.value;
                                        const q = quotations.find((quote: any) => quote.id === qId);
                                        setFormData({
                                            ...formData,
                                            quotation_id: qId,
                                            supplier_id: q?.supplier_id || formData.supplier_id,
                                            total_amount: q?.total_amount || formData.total_amount
                                        });
                                    }}
                                    className="glass bg-white/5 border-border-custom p-2 rounded-lg outline-none focus:border-accent transition-all text-xs"
                                >
                                    <option value="">Independent Order</option>
                                    {quotations.filter((q: any) => q.status === 'Accepted').map((q: any) => (
                                        <option key={q.id} value={q.id}>
                                            {suppliers.find((s: any) => s.id === q.supplier_id)?.name || 'Unknown'} - {q.total_amount} EGP
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm w-full"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1 border-l border-white/5 pl-6">
                            <label className="text-xs font-bold text-gray-500 uppercase">Order Classification</label>
                            <select
                                value={formData.request_type}
                                onChange={(e) => setFormData({ ...formData, request_type: e.target.value as any })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm mb-2"
                            >
                                <option value="Items">Standard Items</option>
                                <option value="Inventory">Inventory Stock</option>
                                <option value="Office Supplies">Office Supplies</option>
                            </select>

                            <select
                                value={formData.quotation_style}
                                onChange={(e) => setFormData({ ...formData, quotation_style: e.target.value as any })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-purple-500 text-purple-400 transition-all text-sm"
                            >
                                <option value="Standard">Standard Quotation</option>
                                <option value="Bulk">Bulk / Wholesale</option>
                                <option value="Urgent">Urgent Request</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 col-span-2 border-t border-white/5 pt-4">
                            <h4 className="text-xs font-bold text-accent uppercase mb-2">Financial & Status</h4>
                        </div>

                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Total Expected Amount (EGP)</label>
                            <input
                                type="number"
                                value={formData.total_amount}
                                onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                                className="glass bg-emerald-500/5 text-emerald-400 border-emerald-500/20 p-3 rounded-xl outline-none focus:border-emerald-400 transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Current Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Sent">Sent / Processing</option>
                                <option value="Completed">Completed / Paid</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            {formData.status === 'Completed' && (
                                <p className="text-[10px] text-emerald-400 mt-1 uppercase font-bold animate-pulse">
                                    ★ Marking this completed will auto-log it to Expenses.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 col-span-2 border-t border-white/5 pt-4 mt-2">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                <FileText size={14} /> Documentation & Notes
                            </label>
                            <input
                                type="text"
                                value={formData.attachment_url}
                                onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm mb-2"
                                placeholder="Paste invoice/receipt URL link..."
                            />
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-20 resize-none"
                                placeholder="Additional details..."
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
