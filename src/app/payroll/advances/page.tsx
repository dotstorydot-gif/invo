"use client";

import React, { useState } from "react";
import {
    ArrowLeft, Plus, Search,
    User, Calendar, AlertCircle, CheckCircle2,
    XCircle, Edit2, Trash2
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function SalaryAdvancesPage() {
    const { t } = useLanguage();
    const { data: advances, loading, upsert, remove } = useERPData<any>('salary_advances');
    const { data: staff } = useERPData<any>('staff');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        id: undefined,
        staff_id: '',
        amount: 0,
        reason: '',
        repayment_start_date: new Date().toISOString().split('T')[0],
        status: 'Pending'
    });

    const handleSaveAdvance = async () => {
        if (!formData.staff_id) return alert("Please select an employee");
        if (formData.amount <= 0) return alert("Amount must be greater than 0");
        try {
            setIsSubmitting(true);
            await upsert(formData);
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving advance:", error);
            alert("Failed to save advance request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id: undefined,
            staff_id: '',
            amount: 0,
            reason: '',
            repayment_start_date: new Date().toISOString().split('T')[0],
            status: 'Pending'
        });
    };

    const handleEdit = (adv: any) => {
        setFormData(adv);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (adv: any, newStatus: string) => {
        try {
            await upsert({ ...adv, status: newStatus });
        } catch (error) {
            alert("Failed to update status.");
        }
    };

    const filteredAdvances = advances.filter((a: any) => {
        const emp = staff.find(s => s.id === a.staff_id);
        return emp?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const statusColors: any = {
        'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'Approved': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'Paid': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20'
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/payroll" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Salary Advances</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage employee loan requests and repayment schedules</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search advances..."
                                className="bg-transparent border-none outline-none text-sm w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                        >
                            <Plus size={20} />
                            <span>Request Advance</span>
                        </button>
                    </div>
                </header>

                <div className="glass overflow-hidden border-border-custom">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="border-b border-border-custom bg-white/5">
                                <th className="p-6 text-xs font-bold uppercase text-gray-500 tracking-widest">Employee</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500 tracking-widest">Amount</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500 tracking-widest">Repayment Starts</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500 tracking-widest">Reason</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500 tracking-widest text-center">Status</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500 tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-500 animate-pulse">Syncing advance records...</td></tr>
                            ) : filteredAdvances.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-500 italic">No advance requests found.</td></tr>
                            ) : filteredAdvances.map((adv: any) => {
                                const emp = staff.find(s => s.id === adv.staff_id);
                                return (
                                    <tr key={adv.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                    <User size={16} />
                                                </div>
                                                <div className="font-bold text-white">{emp?.full_name || "Unknown Staff"}</div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono font-bold text-emerald-400">
                                            {adv.amount?.toLocaleString()} EGP
                                        </td>
                                        <td className="p-6 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-600" />
                                                {new Date(adv.repayment_start_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm text-gray-500 max-w-xs truncate">
                                            {adv.reason || "N/A"}
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px - 3 py - 1 rounded - full text - [10px] font - bold uppercase tracking - widest border ${statusColors[adv.status] || 'bg-gray-500/10 text-gray-400'} `}>
                                                {adv.status}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {adv.status === 'Pending' && (
                                                    <>
                                                        <button onClick={() => handleStatusChange(adv, 'Approved')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Approve">
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleStatusChange(adv, 'Rejected')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Reject">
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => handleEdit(adv)} className="p-2 text-gray-500 hover:text-white rounded-lg transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => { if (confirm("Delete record?")) remove(adv.id); }} className="p-2 text-gray-500 hover:text-red-500 rounded-lg transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={formData.id ? "Edit Advance Record" : "New Advance Request"}
                    onSubmit={handleSaveAdvance}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col col-span-2 gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Employee</label>
                            <select
                                value={formData.staff_id}
                                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                            >
                                <option value="" className="bg-background">Choose Employee...</option>
                                {staff.map((s: any) => (
                                    <option key={s.id} value={s.id} className="bg-background">{s.full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Advance Amount (EGP)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white font-mono"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Repayment Starts</label>
                            <input
                                type="date"
                                value={formData.repayment_start_date}
                                onChange={(e) => setFormData({ ...formData, repayment_start_date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white [color-scheme:dark]"
                            />
                        </div>

                        <div className="flex flex-col col-span-2 gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Reason / Notes</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                                placeholder="Purpose of this advance..."
                                rows={3}
                            />
                        </div>

                        <div className="col-span-2 bg-blue-500/5 border border-dashed border-blue-500/20 p-4 rounded-xl flex gap-3">
                            <AlertCircle className="text-blue-500 shrink-0" size={20} />
                            <p className="text-[10px] text-blue-300 leading-relaxed uppercase font-bold tracking-tight">
                                This will update the salary register and approve the loan. Payments will be deducted from the employee&apos;s salary starting from the repayment start date.
                            </p>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
