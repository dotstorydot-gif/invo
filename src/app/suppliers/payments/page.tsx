"use client";

import React, { useState } from "react";
import {
    ArrowLeft,
    CreditCard,
    Plus,
    Search,
    UserCircle,
    Calendar,
    DollarSign,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function SupplierPaymentsPage() {
    const { t } = useLanguage();
    const { data: payments, loading, upsert, remove } = useERPData<any>('supplier_payments');
    const { data: suppliers } = useERPData<any>('suppliers');
    const { upsert: upsertExpense } = useERPData<any>('expenses');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        supplier_id: '',
        amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Bank Transfer',
        reference_no: '',
        description: ''
    });

    const handleSavePayment = async () => {
        try {
            setIsSubmitting(true);
            const selectedSupplier = suppliers.find((s: any) => s.id === formData.supplier_id);

            // 1. Create the expense first
            const expenseResult = await upsertExpense({
                date: formData.payment_date,
                amount: Number(formData.amount),
                category: 'Cost of Goods Sold',
                description: `${t('supplier_payment_desc_prefix')} ${selectedSupplier?.name || t('unknown')}. Ref: ${formData.reference_no}. ${formData.description}`,
                status: t('approved')
            });

            // 2. Link to supplier payment
            await upsert({
                supplier_id: formData.supplier_id,
                expense_id: expenseResult?.[0]?.id,
                amount: Number(formData.amount),
                payment_date: formData.payment_date,
                payment_method: formData.payment_method,
                reference_no: formData.reference_no,
                status: 'Completed'
            });

            setIsModalOpen(false);
            setFormData({
                supplier_id: '',
                amount: 0,
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: 'Bank Transfer',
                reference_no: '',
                description: ''
            });
        } catch (error) {
            console.error("Error saving payment:", error);
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
                        <Link href="/suppliers" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('supplier_payments_title')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('supplier_payments_subtitle')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{t('process_payment')}</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <div className="glass overflow-hidden border-border-custom">
                        <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-3">
                                <CreditCard className="text-accent" />
                                <h3 className="text-xl font-bold">{t('payment_history')}</h3>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border-custom bg-white/2">
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('supplier')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('date')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('reference')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('method')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('amount')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-10 text-center italic text-gray-500">{t('loading_payments')}</td></tr>
                                    ) : payments.length > 0 ? (
                                        payments.map((payment: any) => (
                                            <tr key={payment.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                                <td className="p-6">
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        <UserCircle size={16} className="text-accent" />
                                                        {suppliers.find((s: any) => s.id === payment.supplier_id)?.name || t('unknown_supplier')}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-sm text-gray-400">
                                                    {new Date(payment.payment_date).toLocaleDateString()}
                                                </td>
                                                <td className="p-6 text-xs font-mono text-gray-500 uppercase tracking-widest">
                                                    {payment.reference_no || t('not_applicable')}
                                                </td>
                                                <td className="p-6">
                                                    <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-1 rounded-lg border border-white/5 uppercase font-bold">
                                                        {payment.payment_method}
                                                    </span>
                                                </td>
                                                <td className="p-6 font-bold text-emerald-400">
                                                    {payment.amount.toLocaleString()} {t('egp')}
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm(t('delete_payment_confirm'))) {
                                                                    await remove(payment.id);
                                                                }
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={6} className="p-20 text-center text-gray-500">{t('no_payment_records_found')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={t('process_supplier_payment')}
                    onSubmit={handleSavePayment}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('select_supplier')}</label>
                            <select
                                value={formData.supplier_id}
                                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm w-full shadow-inner"
                                required
                            >
                                <option value="">{t('select_logistics_partner')}</option>
                                {suppliers.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('payment_amount_egp')}</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    className="glass bg-white/5 border-border-custom p-3 pl-10 rounded-xl outline-none focus:border-accent transition-all text-sm w-full"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('payment_date')}</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input
                                    type="date"
                                    value={formData.payment_date}
                                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 pl-10 rounded-xl outline-none focus:border-accent transition-all text-sm w-full [color-scheme:dark]"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('payment_method')}</label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm w-full shadow-inner"
                            >
                                <option value="Bank Transfer">{t('bank_transfer')}</option>
                                <option value="Cash">{t('cash')}</option>
                                <option value="Cheque">{t('cheque')}</option>
                                <option value="Stash Funds">{t('stash_funds')}</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('reference_receipt_no')}</label>
                            <input
                                type="text"
                                value={formData.reference_no}
                                onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm w-full shadow-inner"
                                placeholder="e.g. TRX-99021"
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('payment_description')}</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm w-full shadow-inner h-20 resize-none"
                                placeholder="Additional notes..."
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
