"use client";

import React, { useState } from "react";
import {
    ArrowLeft,
    Plus,
    DollarSign,
    Undo2
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function PurchaseReturnsPage() {
    const { t } = useLanguage();
    const { data: returns, loading, upsert } = useERPData<any>('purchase_returns');
    const { data: invoices } = useERPData<any>('purchase_invoices');
    const { data: suppliers } = useERPData<any>('suppliers');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        invoice_id: '',
        supplier_id: '',
        reason: '',
        amount_to_refund: 0,
        return_date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        items: [] as any[]
    });

    const handleSaveReturn = async () => {
        try {
            setIsSubmitting(true);
            await upsert(formData);

            // If status is "Completed", we should ideally update inventory
            // or trigger a refund in expenses. This can be complex for a single hook.
            // For now we just log the return data.

            setIsModalOpen(false);
            setFormData({
                invoice_id: '',
                supplier_id: '',
                reason: '',
                amount_to_refund: 0,
                return_date: new Date().toISOString().split('T')[0],
                status: 'Pending',
                items: []
            });
            alert(t('purchase_return_logged_alert'));
        } catch (error) {
            console.error("Error saving return:", error);
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
                            <h2 className="text-3xl font-bold gradient-text">{t('purchase_returns_title')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('purchase_returns_subtitle')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{t('log_return')}</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <div className="glass overflow-hidden border-border-custom bg-white/5">
                        <div className="p-6 border-b border-border-custom">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <Undo2 className="text-accent" />
                                {t('return_history')}
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 border-b border-border-custom">
                                        <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('return_date')}</th>
                                        <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('supplier')}</th>
                                        <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('reason')}</th>
                                        <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('refund_amount')}</th>
                                        <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-10 text-center italic text-gray-500">{t('loading_returns')}</td></tr>
                                    ) : returns.length > 0 ? (
                                        returns.map((ret: any) => {
                                            const supplier = suppliers.find((s: any) => s.id === ret.supplier_id);
                                            return (
                                                <tr key={ret.id} className="border-b border-border-custom hover:bg-white/5 transition-colors">
                                                    <td className="p-4 text-sm text-gray-400">
                                                        {new Date(ret.return_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 text-sm font-bold text-white">{supplier?.name || t('unknown')}</td>
                                                    <td className="p-4 text-sm text-gray-500 truncate max-w-[200px]">{ret.reason}</td>
                                                    <td className="p-4 text-sm font-bold text-red-400">
                                                        -{Number(ret.amount_to_refund).toLocaleString()} EGP
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ret.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/10 text-gray-400'}`}>
                                                            {t(ret.status?.toLowerCase()) || ret.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr><td colSpan={5} className="p-20 text-center text-gray-500 italic">{t('no_purchase_returns_logged')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={t('log_purchase_return')}
                    onSubmit={handleSaveReturn}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('supplier')}</label>
                            <select
                                value={formData.supplier_id}
                                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm w-full"
                                required
                            >
                                <option value="">{t('select_supplier_placeholder')}</option>
                                {suppliers.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('linked_invoice_optional')}</label>
                            <select
                                value={formData.invoice_id}
                                onChange={(e) => {
                                    const invId = e.target.value;
                                    const inv = invoices.find((i: any) => i.id === invId);
                                    setFormData({
                                        ...formData,
                                        invoice_id: invId,
                                        supplier_id: inv?.supplier_id || formData.supplier_id,
                                        amount_to_refund: inv?.total_amount || formData.amount_to_refund
                                    });
                                }}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm w-full"
                            >
                                <option value="">{t('independent_return')}</option>
                                {invoices.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>{inv.invoice_no} ({inv.total_amount} EGP)</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('refund_amount')}</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="number"
                                    value={formData.amount_to_refund}
                                    onChange={(e) => setFormData({ ...formData, amount_to_refund: Number(e.target.value) })}
                                    className="glass bg-white/5 border-border-custom p-3 pl-10 rounded-xl outline-none focus:border-accent transition-all text-sm w-full font-bold text-red-400"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('reason_for_return')}</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm w-full h-24 shadow-inner resize-none"
                                placeholder="..."
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
