"use client";

import React, { useRef, useState } from "react";
import {
    FileText,
    Plus,
    Search,
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Upload
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";
import { uploadFile } from "@/lib/storage";

const InvoiceRow = ({ id, client, date, amount, status }: { id: string, client: string, date: string, amount: string, status: 'Paid' | 'Pending' | 'Draft' }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const statusIcons = {
        Paid: <CheckCircle2 size={16} className="text-emerald-400" />,
        Pending: <Clock size={16} className="text-blue-400" />,
        Draft: <AlertCircle size={16} className="text-gray-400" />
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            try {
                await uploadFile('documents', `invoices/${id}/${file.name}`, file);
                alert(t('upload_success'));
            } catch (err) {
                console.error(err);
                alert(t('upload_error'));
            }
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 glass-hover border-b border-border-custom last:border-0 transition-all group">
            <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                <FileText size={20} />
            </div>
            <div className="flex-1">
                <div className="text-sm font-bold">{id}</div>
                <div className="text-xs text-gray-400">{client}</div>
            </div>
            <div className="text-right px-4 text-xs font-mono">
                <div className="text-sm font-bold">{amount}</div>
                <div className="text-[10px] text-gray-500 uppercase">{date}</div>
            </div>
            <div className="w-24 flex items-center gap-2 px-3 py-1 rounded-full border border-border-custom bg-white/5">
                {statusIcons[status]}
                <span className="text-[10px] font-bold uppercase tracking-wider">{t(status.toLowerCase())}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:text-accent transition-colors"
                >
                    <Upload size={18} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                <button className="p-2 hover:text-accent transition-colors">
                    <Download size={18} />
                </button>
            </div>
        </div>
    );
};

export default function InvoicesPage() {
    const { t } = useLanguage();
    const { data: invoices, loading, upsert } = useERPData<any>('sales_invoices');
    const { data: customers } = useERPData<any>('customers');
    const { data: units } = useERPData<any>('units');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        customer_id: '',
        unit_id: '',
        amount: 0,
        status: 'Draft',
        due_date: new Date().toISOString().split('T')[0]
    });

    const handleCreateInvoice = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                customer_id: formData.customer_id || null,
                unit_id: formData.unit_id || null,
                amount: Number(formData.amount),
                status: formData.status,
                due_date: formData.due_date
            });
            setIsModalOpen(false);
            setFormData({
                customer_id: '',
                unit_id: '',
                amount: 0,
                status: 'Draft',
                due_date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error("Error creating invoice:", error);
            alert("Failed to create invoice.");
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
                            <h2 className="text-3xl font-bold gradient-text">{t('invoices_title')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('invoices_subtitle')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{t('create_invoice')}</span>
                    </button>
                </header>

                <div className="glass p-8 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">{t('latest_transactions')}</h3>
                        <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom">
                            <Search size={16} className="text-gray-400" />
                            <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-xs w-full" />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500 italic">Syncing invoices...</div>
                        ) : (
                            invoices.map((inv: any, i: number) => (
                                <InvoiceRow
                                    key={inv.id || i}
                                    id={inv.id?.slice(0, 8) || `#INV-${100 + i}`}
                                    client={inv.customer?.name || "Regular Client"}
                                    date={inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "Today"}
                                    amount={`${(inv.amount || 0).toLocaleString()} EGP`}
                                    status={inv.status as any || 'Pending'}
                                />
                            ))
                        )}
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={t('create_invoice')}
                    onSubmit={handleCreateInvoice}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Customer</label>
                            <select
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">Select Customer</option>
                                {customers.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Linked Unit</label>
                            <select
                                value={formData.unit_id}
                                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">None / Service Only</option>
                                {units.map((u: any) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Amount (EGP)</label>
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
                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
