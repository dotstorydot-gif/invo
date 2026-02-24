"use client";

import React, { useState } from "react";
import {
    Plus,
    Search,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    User,
    Building,
    ChevronRight,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    Trash2,
    Edit,
    ExternalLink,
    Truck
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function ChequesPage() {
    const { t } = useLanguage();
    const { data: cheques, loading, upsert } = useERPData<any>('cheques');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        cheque_number: '',
        bank_name: '',
        amount: 0,
        due_date: '',
        direction: 'Incoming',
        entity_name: '',
        status: 'Pending'
    });

    const handleAddCheque = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                cheque_number: formData.cheque_number,
                bank_name: formData.bank_name,
                amount: Number(formData.amount),
                due_date: formData.due_date,
                direction: formData.direction,
                entity_name: formData.entity_name,
                status: formData.status
            });
            setIsModalOpen(false);
            setFormData({
                cheque_number: '',
                bank_name: '',
                amount: 0,
                due_date: '',
                direction: 'Incoming',
                entity_name: '',
                status: 'Pending'
            });
        } catch (error) {
            console.error("Error adding cheque:", error);
            alert("Failed to add cheque.");
        } finally {
            setIsSubmitting(false);
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
                            <h2 className="text-3xl font-bold gradient-text">{t('cheques')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('cheque_management')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Cheque</span>
                    </button>
                </header>

                <div className="grid grid-cols-4 gap-6 mb-10">
                    <div className="glass p-5 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <ArrowDownLeft size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('inward')}</span>
                        </div>
                        <div className="text-2xl font-bold">Inward Active</div>
                    </div>
                    <div className="glass p-5 border-red-500/20 bg-red-500/5">
                        <div className="flex items-center gap-3 text-red-400 mb-2">
                            <ArrowUpRight size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('outward')}</span>
                        </div>
                        <div className="text-2xl font-bold">Outward Active</div>
                    </div>
                </div>

                <div className="glass border-border-custom overflow-hidden">
                    <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
                        <div className="glass flex items-center px-4 py-2 gap-3 w-80 border-border-custom bg-background shadow-inner">
                            <Search size={18} className="text-gray-400" />
                            <input type="text" placeholder="Search cheques..." className="bg-transparent border-none outline-none text-sm w-full" />
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-border-custom">
                                <th className="p-6 text-[10px] font-bold uppercase text-gray-500">Number</th>
                                <th className="p-6 text-[10px] font-bold uppercase text-gray-500">Entity</th>
                                <th className="p-6 text-[10px] font-bold uppercase text-gray-500">Due Date</th>
                                <th className="p-6 text-[10px] font-bold uppercase text-gray-500">Amount</th>
                                <th className="p-6 text-[10px] font-bold uppercase text-gray-500 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-10 text-center italic text-gray-500">Syncing cheques...</td></tr>
                            ) : (
                                cheques.map((chq: any) => (
                                    <tr key={chq.id} className="border-b border-border-custom hover:bg-white/5 transition-colors">
                                        <td className="p-6 font-bold">#{chq.cheque_number}</td>
                                        <td className="p-6 text-sm">{chq.entity_name}</td>
                                        <td className="p-6 text-sm text-gray-400">{chq.due_date}</td>
                                        <td className="p-6 font-bold text-accent">{chq.amount.toLocaleString()} EGP</td>
                                        <td className="p-6 text-right">
                                            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                                                {chq.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add New Cheque"
                    onSubmit={handleAddCheque}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Cheque Number</label>
                            <input
                                type="text"
                                value={formData.cheque_number}
                                onChange={(e) => setFormData({ ...formData, cheque_number: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Bank Name</label>
                            <input
                                type="text"
                                value={formData.bank_name}
                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Amount</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Due Date</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Direction</label>
                            <select
                                value={formData.direction}
                                onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Incoming">Incoming</option>
                                <option value="Outgoing">Outgoing</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Entity Name</label>
                            <input
                                type="text"
                                value={formData.entity_name}
                                onChange={(e) => setFormData({ ...formData, entity_name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
