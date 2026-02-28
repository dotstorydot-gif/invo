"use client";

import React, { useState } from "react";
import {
    ArrowLeft,
    Plus,
    Calendar,
    CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function PurchaseInvoicesPage() {
    const { t } = useLanguage();
    const { data: invoices, loading, upsert } = useERPData<any>('purchase_invoices');
    const { data: orders } = useERPData<any>('purchase_orders');
    const { data: suppliers } = useERPData<any>('suppliers');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        po_id: '',
        supplier_id: '',
        invoice_no: `INV-${Math.floor(Math.random() * 100000)}`,
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        total_amount: 0,
        status: 'Unpaid'
    });

    const handleSaveInvoice = async () => {
        try {
            setIsSubmitting(true);
            await upsert(formData);
            setIsModalOpen(false);
            setFormData({
                po_id: '',
                supplier_id: '',
                invoice_no: `INV-${Math.floor(Math.random() * 100000)}`,
                date: new Date().toISOString().split('T')[0],
                due_date: '',
                total_amount: 0,
                status: 'Unpaid'
            });
        } catch (error) {
            console.error("Error saving invoice:", error);
            alert(t('save_failed'));
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
                            <h2 className="text-3xl font-bold gradient-text">{t('purchase_invoices_title')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('purchase_invoices_subtitle')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{t('add_invoice')}</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <div className="glass overflow-hidden border-border-custom">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border-custom bg-white/5">
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('invoice_no')}</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('supplier')}</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('po_ref')}</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('due_date')}</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('amount')}</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-10 text-center italic text-gray-500">{t('loading_invoices')}</td></tr>
                                ) : invoices.length > 0 ? (
                                    invoices.map((inv: any) => {
                                        const supplier = suppliers.find((s: any) => s.id === inv.supplier_id);
                                        const po = orders.find((o: any) => o.id === inv.po_id);

                                        return (
                                            <tr key={inv.id} className="border-b border-border-custom hover:bg-white/5 transition-colors">
                                                <td className="p-6 font-bold text-white font-mono">{inv.invoice_no}</td>
                                                <td className="p-6 text-sm text-gray-300">{supplier?.name || t('unknown')}</td>
                                                <td className="p-6 text-sm text-gray-500 font-mono">{po?.order_number || t('not_applicable')}</td>
                                                <td className="p-6 text-sm text-gray-400">
                                                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'Immediate'}
                                                </td>
                                                <td className="p-6 font-bold text-accent">
                                                    {Number(inv.total_amount).toLocaleString()} EGP
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                        {t(inv.status?.toLowerCase()?.replace(' ', '_')) || inv.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={6} className="p-20 text-center text-gray-500 italic">{t('no_purchase_invoices_yet')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={t('add_purchase_invoice')}
                    onSubmit={handleSaveInvoice}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('linked_purchase_order')}</label>
                            <select
                                value={formData.po_id}
                                onChange={(e) => {
                                    const poId = e.target.value;
                                    const po = orders.find((o: any) => o.id === poId);
                                    setFormData({
                                        ...formData,
                                        po_id: poId,
                                        supplier_id: po?.supplier_id || formData.supplier_id,
                                        total_amount: po?.total_amount || formData.total_amount
                                    });
                                }}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">{t('select_po_placeholder')}</option>
                                {orders.map((o: any) => (
                                    <option key={o.id} value={o.id}>{o.order_number}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('invoice_number_label')}</label>
                            <input
                                type="text"
                                value={formData.invoice_no}
                                onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm font-mono"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('invoice_date')}</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm [color-scheme:dark]"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('due_date')}</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm [color-scheme:dark]"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('amount')}</label>
                            <input
                                type="number"
                                value={formData.total_amount}
                                onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm font-bold"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('status')}</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Unpaid">{t('unpaid')}</option>
                                <option value="Partially Paid">{t('partially_paid')}</option>
                                <option value="Paid">{t('paid')}</option>
                                <option value="Overdue">{t('overdue')}</option>
                            </select>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
