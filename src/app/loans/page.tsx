"use client";

import React, { useState } from "react";
import {
    Activity,
    Plus,
    Search,
    ArrowLeft,
    TrendingUp,
    MoreHorizontal,
    Edit2,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    Users
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface Loan {
    id: string;
    borrower_name: string;
    principal_amount: number;
    interest_rate: number;
    term_months: number;
    start_date: string;
    status: 'Active' | 'Paid Off' | 'Defaulted';
    amount_paid: number;
}

export default function LoansPage() {
    const { t } = useLanguage();
    const { data: loans, loading, upsert, remove } = useERPData<Loan>('loans');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        borrower_name: '',
        principal_amount: 0,
        interest_rate: 0,
        term_months: 12,
        start_date: new Date().toISOString().split('T')[0],
        status: 'Active' as 'Active' | 'Paid Off' | 'Defaulted',
        amount_paid: 0
    });

    const handleOpenModal = (loan?: Loan) => {
        if (loan) {
            setEditingId(loan.id);
            setFormData({
                borrower_name: loan.borrower_name || '',
                principal_amount: loan.principal_amount || 0,
                interest_rate: loan.interest_rate || 0,
                term_months: loan.term_months || 0,
                start_date: loan.start_date ? new Date(loan.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                status: loan.status || 'Active',
                amount_paid: loan.amount_paid || 0
            });
        } else {
            setEditingId(null);
            setFormData({
                borrower_name: '',
                principal_amount: 0,
                interest_rate: 0,
                term_months: 12,
                start_date: new Date().toISOString().split('T')[0],
                status: 'Active',
                amount_paid: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                ...(editingId ? { id: editingId } : {}),
                borrower_name: formData.borrower_name,
                principal_amount: formData.principal_amount,
                interest_rate: formData.interest_rate,
                term_months: formData.term_months,
                start_date: formData.start_date,
                status: formData.status,
                amount_paid: formData.amount_paid
            });
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving loan:", error);
            alert("Failed to save loan info.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this loan record?")) {
            await remove(id);
        }
    };

    const totalActiveLoans = loans.filter(l => l.status === 'Active').reduce((sum, l) => sum + (Number(l.principal_amount) || 0) - (Number(l.amount_paid) || 0), 0);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('loan_management')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('loans_subtitle')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{t('issue_loan')}</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass p-6 border-accent/20 bg-accent/5 col-span-1">
                        <div className="flex items-center gap-3 text-accent mb-4">
                            <Activity size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest">{t('outstanding_balance')}</span>
                        </div>
                        <div className="text-4xl font-bold">{totalActiveLoans.toLocaleString()} EGP</div>
                        <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                            <TrendingUp size={12} className="text-accent" />
                            {t('active_loans_debt_desc')}
                        </div>
                    </div>

                    <div className="glass p-6 border-border-custom md:col-span-2 flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-gray-400 mb-2">
                            <Users size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">{t('active_accounts')} ({loans.filter(l => l.status === 'Active').length})</span>
                        </div>
                        <p className="text-sm text-gray-500">{t('loans_manage_desc')}</p>
                    </div>
                </div>

                <div className="glass overflow-hidden border-border-custom">
                    <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            {t('loan_accounts')}
                        </h3>
                        <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                            <Search size={18} className="text-gray-400" />
                            <input type="text" placeholder={t('search_loans')} className="bg-transparent border-none outline-none text-sm w-full" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-border-custom">
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('borrower')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('start_date')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('principal')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('paid')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('remaining_balance')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('status')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="p-10 text-center italic text-gray-500">{t('loading_loans')}</td></tr>
                                ) : (
                                    loans.map((loan) => {
                                        const remaining = (Number(loan.principal_amount) || 0) - (Number(loan.amount_paid) || 0);
                                        return (
                                            <motion.tr
                                                key={loan.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="border-b border-border-custom hover:bg-white/5 transition-colors group cursor-pointer"
                                                onClick={() => handleOpenModal(loan)}
                                            >
                                                <td className="p-4 font-bold text-white text-sm">
                                                    {loan.borrower_name}
                                                </td>
                                                <td className="p-4 text-sm font-mono text-gray-500">
                                                    {new Date(loan.start_date).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-sm font-bold text-white">
                                                    {(Number(loan.principal_amount) || 0).toLocaleString()} EGP
                                                </td>
                                                <td className="p-4 text-sm font-bold text-emerald-400">
                                                    {(Number(loan.amount_paid) || 0).toLocaleString()} EGP
                                                </td>
                                                <td className="p-4 text-sm font-bold text-red-400">
                                                    {remaining > 0 ? `${remaining.toLocaleString()} EGP` : '0 EGP'}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${loan.status === 'Paid Off' ? 'bg-emerald-500/10 text-emerald-500' : loan.status === 'Defaulted' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                                        {t(loan.status?.toLowerCase().replace(' ', '_')) || loan.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleOpenModal(loan)} className="p-2 text-gray-400 hover:text-accent transition-colors">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(loan.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingId ? t('update_loan_account') : t('issue_new_loan')}
                    onSubmit={handleSave}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('borrower_name')}</label>
                            <input
                                type="text"
                                value={formData.borrower_name}
                                onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder={t('borrower_name')}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('principal_amount')} (EGP)</label>
                            <input
                                type="number"
                                value={formData.principal_amount}
                                onChange={(e) => setFormData({ ...formData, principal_amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('term_limit')}</label>
                            <input
                                type="number"
                                value={formData.term_months}
                                onChange={(e) => setFormData({ ...formData, term_months: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('start_date')}</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-2 col-span-2 border-t border-white/5 pt-4">
                            <h4 className="text-xs font-bold text-accent uppercase mb-2">{t('loan_progress')}</h4>
                        </div>

                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('total_paid_back')} (EGP)</label>
                            <input
                                type="number"
                                value={formData.amount_paid}
                                onChange={(e) => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
                                className="glass bg-emerald-500/5 text-emerald-400 border-emerald-500/20 p-3 rounded-xl outline-none focus:border-emerald-400 transition-all text-sm font-bold"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">{t('linking_stash_hint')}</p>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('status')}</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Paid Off' | 'Defaulted' })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Active">{t('active')}</option>
                                <option value="Paid Off">{t('paid_off')}</option>
                                <option value="Defaulted">{t('defaulted')}</option>
                            </select>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
