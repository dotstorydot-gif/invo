"use client";

import React, { useState } from "react";
import {
    CreditCard,
    Plus,
    Search,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Percent,
    User,
    Home,
    ChevronRight,
    Filter
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface PaymentPlan {
    id: string;
    name: string;
    interest_rate: number;
    installments: number;
    down_payment: number;
}

interface InstallmentRecord {
    id: string;
    unit_name: string;
    customer_name: string;
    plan_name: string;
    total_amount: number;
    paid_amount: number;
    next_due_at: string;
    status: 'Collected' | 'Pending' | 'Overdue';
}

export default function InstallmentsPage() {
    const { t } = useLanguage();
    const { data: plans, loading: plansLoading, upsert: upsertPlan } = useERPData<PaymentPlan>('payment_plans');
    const { data: records, loading: recordsLoading, upsert: upsertRecord } = useERPData<InstallmentRecord>('installments');

    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [planFormData, setPlanFormData] = useState({
        name: '',
        interest_rate: 0,
        installments: 12,
        down_payment: 10
    });

    const [recordFormData, setRecordFormData] = useState({
        unit_name: '',
        customer_name: '',
        plan_name: '',
        total_amount: 0,
        paid_amount: 0,
        next_due_at: '',
        status: 'Pending'
    });

    const handleAddPlan = async () => {
        try {
            setIsSubmitting(true);
            await upsertPlan({
                name: planFormData.name,
                interest_rate: Number(planFormData.interest_rate),
                installments: Number(planFormData.installments),
                down_payment: Number(planFormData.down_payment)
            });
            setIsPlanModalOpen(false);
            setPlanFormData({ name: '', interest_rate: 0, installments: 12, down_payment: 10 });
        } catch (error) {
            console.error("Error adding plan:", error);
            alert("Failed to add payment plan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddRecord = async () => {
        try {
            setIsSubmitting(true);
            await upsertRecord({
                unit_name: recordFormData.unit_name,
                customer_name: recordFormData.customer_name,
                plan_name: recordFormData.plan_name,
                total_amount: Number(recordFormData.total_amount),
                paid_amount: Number(recordFormData.paid_amount),
                next_due_at: recordFormData.next_due_at,
                status: recordFormData.status as any
            });
            setIsRecordModalOpen(false);
            setRecordFormData({
                unit_name: '',
                customer_name: '',
                plan_name: '',
                total_amount: 0,
                paid_amount: 0,
                next_due_at: '',
                status: 'Pending'
            });
        } catch (error) {
            console.error("Error adding record:", error);
            alert("Failed to add installment record.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Aggregations
    const totalCollected = records.reduce((sum, rec) => sum + (Number(rec.paid_amount) || 0), 0);
    const dueThisMonth = records.filter(rec => rec.status === 'Pending').length;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('installments')}</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage payment collections and flexible customer financing</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsRecordModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>New Installment</span>
                    </button>
                </header>

                {/* Analytics & Fast Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="glass p-5 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <CheckCircle2 size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('collected')}</span>
                        </div>
                        <div className="text-2xl font-bold">{totalCollected.toLocaleString()} EGP</div>
                        <div className="text-[10px] text-gray-500 mt-1">Total received to date</div>
                    </div>

                    <div className="glass p-5 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 text-amber-400 mb-2">
                            <Clock size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('due_this_month')}</span>
                        </div>
                        <div className="text-2xl font-bold">{dueThisMonth} Records</div>
                        <div className="text-[10px] text-gray-500 mt-1">Pending collection</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Payment Plan Templates */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <Percent className="text-accent" size={24} />
                                {t('payment_plans')}
                            </h3>
                            <button
                                onClick={() => setIsPlanModalOpen(true)}
                                className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {plansLoading ? (
                            <div className="text-center italic text-gray-500 text-xs">Loading plans...</div>
                        ) : (
                            plans.map((plan) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass p-5 border-border-custom hover:border-accent/40 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="font-bold text-white mb-1">{plan.name}</div>
                                            <div className="text-[10px] text-gray-500 font-mono tracking-tighter">{plan.id.slice(0, 8)}</div>
                                        </div>
                                        <div className="px-2 py-1 rounded bg-accent/10 text-accent font-bold text-xs uppercase">
                                            {plan.interest_rate}% Rate
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-custom">
                                        <div>
                                            <div className="text-[9px] text-gray-500 uppercase font-bold">{t('down_payment')}</div>
                                            <div className="text-sm font-bold text-white">{plan.down_payment}%</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-gray-500 uppercase font-bold">{t('installments_count')}</div>
                                            <div className="text-sm font-bold text-white">{plan.installments} Months</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Installment Records */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-border-custom">
                            <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background shadow-inner">
                                <Search size={18} className="text-gray-400" />
                                <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-sm w-full" />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-custom text-gray-400 hover:text-accent transition-all">
                                <Filter size={18} />
                                <span className="text-sm font-bold">{t('filter')}</span>
                            </button>
                        </div>

                        <div className="glass overflow-hidden border-border-custom">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-border-custom">
                                    <tr>
                                        <th className="p-4 text-[10px] font-bold uppercase text-gray-500">Subject</th>
                                        <th className="p-4 text-[10px] font-bold uppercase text-gray-500">Plan Connection</th>
                                        <th className="p-4 text-[10px] font-bold uppercase text-gray-500">Due Info</th>
                                        <th className="p-4 text-[10px] font-bold uppercase text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recordsLoading ? (
                                        <tr><td colSpan={4} className="p-10 text-center italic text-gray-500 text-xs">Syncing artifacts...</td></tr>
                                    ) : (
                                        records.map((rec) => (
                                            <tr key={rec.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-accent transition-colors">
                                                            <Home size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-sm">{rec.unit_name}</div>
                                                            <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                                <User size={10} /> {rec.customer_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs font-bold text-gray-300">{rec.plan_name}</div>
                                                    <div className="text-[10px] text-gray-500 mt-1">Bal: {(rec.total_amount - rec.paid_amount).toLocaleString()} EGP</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold">
                                                        <Calendar size={14} className="text-gray-500" />
                                                        {rec.next_due_at}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${rec.status === 'Collected' ? 'bg-emerald-500/10 text-emerald-500' :
                                                            rec.status === 'Overdue' ? 'bg-red-500/10 text-red-500' :
                                                                'bg-amber-500/10 text-amber-500'
                                                            }`}>
                                                            {rec.status}
                                                        </span>
                                                        <button className="p-1 text-gray-500 hover:text-white transition-colors">
                                                            <ChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Plan Modal */}
                <ERPFormModal
                    isOpen={isPlanModalOpen}
                    onClose={() => setIsPlanModalOpen(false)}
                    title="Add Payment Plan"
                    onSubmit={handleAddPlan}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Plan Name</label>
                            <input
                                type="text"
                                value={planFormData.name}
                                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="e.g. Standard 5 Years"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Interest Rate (%)</label>
                            <input
                                type="number"
                                value={planFormData.interest_rate}
                                onChange={(e) => setPlanFormData({ ...planFormData, interest_rate: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Total Installments</label>
                            <input
                                type="number"
                                value={planFormData.installments}
                                onChange={(e) => setPlanFormData({ ...planFormData, installments: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Down Payment (%)</label>
                            <input
                                type="number"
                                value={planFormData.down_payment}
                                onChange={(e) => setPlanFormData({ ...planFormData, down_payment: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                    </div>
                </ERPFormModal>

                {/* Record Modal */}
                <ERPFormModal
                    isOpen={isRecordModalOpen}
                    onClose={() => setIsRecordModalOpen(false)}
                    title="New Installment Record"
                    onSubmit={handleAddRecord}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Unit Name</label>
                            <input
                                type="text"
                                value={recordFormData.unit_name}
                                onChange={(e) => setRecordFormData({ ...recordFormData, unit_name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Customer Name</label>
                            <input
                                type="text"
                                value={recordFormData.customer_name}
                                onChange={(e) => setRecordFormData({ ...recordFormData, customer_name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Plan Name</label>
                            <input
                                type="text"
                                value={recordFormData.plan_name}
                                onChange={(e) => setRecordFormData({ ...recordFormData, plan_name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Total Amount</label>
                            <input
                                type="number"
                                value={recordFormData.total_amount}
                                onChange={(e) => setRecordFormData({ ...recordFormData, total_amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Paid Amount</label>
                            <input
                                type="number"
                                value={recordFormData.paid_amount}
                                onChange={(e) => setRecordFormData({ ...recordFormData, paid_amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Next Due Date</label>
                            <input
                                type="date"
                                value={recordFormData.next_due_at}
                                onChange={(e) => setRecordFormData({ ...recordFormData, next_due_at: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
