"use client";

import React, { useState } from "react";
import {
    Plus,
    Search,
    FileText,
    ArrowLeft,
    User,
    Building2,
    Calendar,
    BadgePercent,
    Repeat,
    CheckCircle2,
    Clock,
    XCircle,
    MoreVertical
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface Quotation {
    id: string;
    organization_id: string;
    client_id: string;
    project_id: string | null;
    title: string;
    description: string;
    amount: number;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    is_recurring: boolean;
    billing_cycle: string;
    payment_terms: string;
    valid_until: string;
    created_at: string;
}

export default function QuotationsPage() {
    const { t } = useLanguage();
    const { data: quotations, loading, upsert } = useERPData<Quotation>('quotations');
    const { data: clients } = useERPData<any>('customers');
    const { data: projects } = useERPData<any>('projects');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client_id: '',
        project_id: '',
        amount: 0,
        is_recurring: false,
        billing_cycle: 'Monthly',
        payment_terms: 'Net 30',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Draft'
    });

    const handleAddQuotation = async () => {
        if (!formData.title || !formData.client_id || formData.amount <= 0) {
            alert("Please fill in required fields (Title, Client, Amount)");
            return;
        }

        try {
            setIsSubmitting(true);
            await upsert({
                title: formData.title,
                description: formData.description,
                client_id: formData.client_id,
                project_id: formData.project_id || null,
                amount: Number(formData.amount),
                is_recurring: formData.is_recurring,
                billing_cycle: formData.billing_cycle,
                payment_terms: formData.payment_terms,
                valid_until: formData.valid_until,
                status: formData.status as any
            });
            setIsModalOpen(false);
            setFormData({
                title: '',
                description: '',
                client_id: '',
                project_id: '',
                amount: 0,
                is_recurring: false,
                billing_cycle: 'Monthly',
                payment_terms: 'Net 30',
                valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'Draft'
            });
        } catch (error) {
            console.error("Error adding quotation:", error);
            alert("Failed to save quotation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await upsert({ id, status: newStatus as any });
        } catch (error) {
            console.error(error);
        }
    };

    const filteredQuotations = quotations.filter(q =>
        q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clients.find(c => c.id === q.client_id)?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Client Quotations</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage proposals and recurring service contracts</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search quotes..."
                                className="bg-transparent border-none outline-none text-sm w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                        >
                            <Plus size={20} />
                            <span>New Quotation</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <div className="glass overflow-hidden border-border-custom">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border-custom bg-white/5">
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">Proposal</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">Client / Account</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500 text-right">Amount</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">Billing</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">Status</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500">Valid Until</th>
                                    <th className="p-6 text-xs font-bold uppercase text-gray-500 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center text-gray-500 italic">Syncing proposals...</td>
                                    </tr>
                                ) : filteredQuotations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center text-gray-500 italic">No quotations found. Start by creating one!</td>
                                    </tr>
                                ) : filteredQuotations.map((quote) => {
                                    const client = clients.find(c => c.id === quote.client_id);
                                    const project = projects.find(p => p.id === quote.project_id);

                                    return (
                                        <tr key={quote.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{quote.title}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono">{quote.id.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <User size={14} className="text-gray-500" />
                                                        {client?.full_name || 'Individual Client'}
                                                    </div>
                                                    {project && (
                                                        <div className="flex items-center gap-2 text-[10px] text-accent font-bold uppercase tracking-widest">
                                                            <Building2 size={12} />
                                                            {project.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right font-mono font-bold text-white">
                                                {quote.amount.toLocaleString()} EGP
                                            </td>
                                            <td className="p-6">
                                                {quote.is_recurring ? (
                                                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg w-fit">
                                                        <Repeat size={12} />
                                                        {quote.billing_cycle}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500">One-time</span>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase px-3 py-1 rounded-full border w-fit ${quote.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        quote.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            quote.status === 'Sent' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                'bg-gray-500/10 text-gray-400 border-white/5'
                                                    }`}>
                                                    {quote.status === 'Accepted' && <CheckCircle2 size={10} />}
                                                    {quote.status === 'Sent' && <Clock size={10} />}
                                                    {quote.status === 'Rejected' && <XCircle size={10} />}
                                                    {quote.status || 'Draft'}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Calendar size={14} />
                                                    {new Date(quote.valid_until).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => updateStatus(quote.id, 'Accepted')}
                                                        className="p-2 text-gray-500 hover:text-emerald-400 transition-all"
                                                        title="Mark Accepted"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    <button className="p-2 text-gray-500 hover:text-white transition-all">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="New Client Quotation"
                    onSubmit={handleAddQuotation}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Title / Proposal Name</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="e.g. SEO & Content Bundle - Q1"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Select Client</label>
                            <select
                                value={formData.client_id}
                                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">-- Choose Client --</option>
                                {clients.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Related Project / Account</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">-- Optional Account --</option>
                                {projects.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Quoted Amount (EGP)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm font-bold font-mono"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Valid Until</label>
                            <input
                                type="date"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm [color-scheme:dark]"
                            />
                        </div>

                        <div className="flex flex-col gap-2 col-span-2 p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-bold text-gray-500 uppercase">Recurring Billing</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_recurring: !formData.is_recurring })}
                                    className={`w-12 h-6 rounded-full transition-all relative ${formData.is_recurring ? 'bg-accent' : 'bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_recurring ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            {formData.is_recurring && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Cycle</label>
                                        <select
                                            value={formData.billing_cycle}
                                            onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                                            className="bg-background border-border-custom p-2 rounded-lg outline-none text-xs"
                                        >
                                            <option value="Monthly">Monthly</option>
                                            <option value="Yearly">Yearly</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Terms</label>
                                        <input
                                            type="text"
                                            value={formData.payment_terms}
                                            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                                            className="bg-background border-border-custom p-2 rounded-lg outline-none text-xs"
                                            placeholder="Net 30"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Brief Description / Scope</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-24"
                                placeholder="Outline the services included..."
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
