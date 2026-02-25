"use client";

import React, { useState } from "react";
import {
    Wallet,
    Plus,
    Search,
    ArrowLeft,
    TrendingUp,
    Calendar,
    ArrowUpCircle,
    ArrowDownCircle,
    MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface StashTransaction {
    id: string;
    amount: number;
    type: 'In' | 'Out';
    source: string;
    description: string;
    date: string;
    reference_type?: string;
    reference_id?: string;
}

export default function StashPage() {
    const { t } = useLanguage();
    const { data: transactions, loading, upsert } = useERPData<StashTransaction>('stash_transactions');
    const { data: projects } = useERPData<{ id: string, name: string }>('projects');
    const { data: staff } = useERPData<{ id: string, first_name: string, last_name: string }>('staff');
    const { data: loans } = useERPData<{ id: string, borrower_name: string, principal_amount: number }>('loans');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    const [formData, setFormData] = useState({
        amount: 0,
        type: 'In' as 'In' | 'Out',
        source: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        reference_type: 'General',
        reference_id: ''
    });

    const handleOpenModal = (type: 'In' | 'Out') => {
        setFormData({ ...formData, type });
        setModalTitle(type === 'In' ? t('add_cash_in') : t('add_cash_out'));
        setIsModalOpen(true);
    };

    const handleAddCash = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                amount: Number(formData.amount),
                type: formData.type,
                source: formData.source,
                description: formData.description,
                date: formData.date,
                reference_type: formData.reference_type,
                reference_id: formData.reference_id || undefined
            });
            setIsModalOpen(false);
            setFormData({
                amount: 0,
                type: 'In',
                source: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                reference_type: 'General',
                reference_id: ''
            });
        } catch (error) {
            console.error("Error adding cash transaction:", error);
            alert("Failed to add cash transaction.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalStash = transactions.reduce((sum, tx) => {
        const val = Number(tx.amount) || 0;
        return tx.type === 'Out' ? sum - val : sum + val;
    }, 0);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('stash')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('stash_subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleOpenModal('Out')}
                            className="bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-2 px-6 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                            <Plus size={20} />
                            <span>{t('add_cash_out')}</span>
                        </button>
                        <button
                            onClick={() => handleOpenModal('In')}
                            className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                        >
                            <Plus size={20} />
                            <span>{t('add_cash_in')}</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass p-6 border-accent/20 bg-accent/5 col-span-1">
                        <div className="flex items-center gap-3 text-accent mb-4">
                            <Wallet size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest">Liquid Cash (Stash)</span>
                        </div>
                        <div className="text-4xl font-bold">{totalStash.toLocaleString()} EGP</div>
                        <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                            <TrendingUp size={12} className="text-accent" />
                            Manual liquidity management active
                        </div>
                    </div>

                    <div className="glass p-6 border-border-custom md:col-span-2 flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-gray-400 mb-2">
                            <Calendar size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Cash Ledger Summary</span>
                        </div>
                        <p className="text-sm text-gray-500">Track all manual deposits and withdrawals to keep the company&apos;s liquid stash accurate.</p>
                    </div>
                </div>

                <div className="glass overflow-hidden border-border-custom">
                    <div className="p-6 border-b border-border-custom flex justify-between items-center">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            {t('latest_transactions')}
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                                <Search size={18} className="text-gray-400" />
                                <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-sm w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-border-custom">
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('cash_source')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('item_desc')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('cash_type')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('cash_amount')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">{t('due_date')}</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-10 text-center italic text-gray-500">Syncing stash...</td></tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <motion.tr
                                            key={tx.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border-b border-border-custom hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${tx.type === 'Out' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        {tx.type === 'Out' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                                                    </div>
                                                    <span className="font-bold text-white text-sm">{tx.source}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-400 max-w-xs truncate">{tx.description}</td>
                                            <td className="p-4 text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`w-fit px-2 py-1 rounded text-[10px] font-bold uppercase ${tx.type === 'Out' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        {tx.type}
                                                    </span>
                                                    {tx.reference_type && tx.reference_type !== 'General' && (
                                                        <span className="text-[9px] text-gray-500 font-bold bg-white/5 px-2 py-0.5 rounded w-fit uppercase">
                                                            {tx.reference_type}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={`p-4 text-sm font-bold ${tx.type === 'Out' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {tx.type === 'Out' ? '-' : '+'}{(Number(tx.amount) || 0).toLocaleString()} EGP
                                            </td>
                                            <td className="p-4 text-sm font-mono text-gray-500">{tx.date}</td>
                                            <td className="p-4 text-sm">
                                                <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                                    <MoreHorizontal size={18} />
                                                </button>
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
                    title={modalTitle}
                    onSubmit={handleAddCash}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('cash_amount')} (EGP)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                className={`glass bg-white/5 border-border-custom p-4 rounded-xl outline-none focus:border-accent transition-all text-xl font-bold ${formData.type === 'Out' ? 'text-red-400' : 'text-emerald-400'}`}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Link To</label>
                            <select
                                value={formData.reference_type}
                                onChange={(e) => setFormData({ ...formData, reference_type: e.target.value, reference_id: '' })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="General">General / Unlinked</option>
                                <option value="Project">Project</option>
                                <option value="Loan">Loan</option>
                                <option value="Salary">Salary / Staff</option>
                            </select>
                        </div>

                        {formData.reference_type !== 'General' && (
                            <div className="flex flex-col gap-2 col-span-2 md:col-span-1 border-l border-white/5 pl-6">
                                <label className="text-xs font-bold text-gray-500 uppercase">Select {formData.reference_type}</label>
                                <select
                                    value={formData.reference_id}
                                    onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    required
                                >
                                    <option value="">-- Choose {formData.reference_type} --</option>
                                    {formData.reference_type === 'Project' && projects?.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                    {(formData.reference_type === 'Staff' || formData.reference_type === 'Salary') && staff?.map(s => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                    ))}
                                    {formData.reference_type === 'Loan' && loans?.map(l => (
                                        <option key={l.id} value={l.id}>{l.borrower_name} - {l.principal_amount} EGP</option>
                                    ))}
                                </select>
                            </div>
                        )}


                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('cash_source')}</label>
                            <input
                                type="text"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder={formData.type === 'In' ? "e.g. Manual Deposit" : "e.g. Office Supplies"}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('due_date')}</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('item_desc')}</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-24 resize-none"
                                placeholder="Details about this cash movement..."
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
