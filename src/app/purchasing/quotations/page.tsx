"use client";

import React, { useState } from "react";
import {
    ArrowLeft,
    ClipboardCheck,
    Plus,
    Calendar,
    Trophy,
    CheckCircle2,
    XCircle,
    BadgeDollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function PurchaseQuotationsPage() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const rfqId = searchParams.get('rfq_id');

    const { data: quotations, loading, upsert } = useERPData<any>('purchase_quotations');
    const { data: rfqs } = useERPData<any>('rfqs');
    const { data: suppliers } = useERPData<any>('suppliers');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        rfq_id: rfqId || '',
        supplier_id: '',
        total_amount: 0,
        quote_date: new Date().toISOString().split('T')[0],
        valid_until: '',
        status: 'Pending'
    });

    // Removed redundant useEffect that was causing lint error. 
    // rfqId is already handled in initial state of formData.

    const handleApproveQuote = async (quote: any) => {
        if (!confirm(t('approve_quote_confirm'))) return;
        try {
            // 1. Accept this one
            await upsert({ id: quote.id, status: 'Accepted' });

            // 2. Reject others for same RFQ
            const others = quotations.filter((q: any) => q.rfq_id === quote.rfq_id && q.id !== quote.id);
            for (const other of others) {
                await upsert({ id: other.id, status: 'Rejected' });
            }
            alert(t('quote_approved_success'));
        } catch (error) {
            console.error(error);
        }
    };

    const filteredQuotations = rfqId
        ? quotations.filter((q: any) => q.rfq_id === rfqId)
        : quotations;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto w-full">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/purchasing/rfq" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('purchase_quotations_title')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('purchase_quotations_subtitle')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{t('add_quote')}</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuotations.map((quote: any) => {
                        const supplier = suppliers.find((s: any) => s.id === quote.supplier_id);
                        const rfq = rfqs.find((r: any) => r.id === quote.rfq_id);

                        return (
                            <motion.div
                                key={quote.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`glass p-6 border-border-custom relative overflow-hidden flex flex-col h-full ${quote.status === 'Accepted' ? 'border-accent/50 ring-1 ring-accent/20 bg-accent/5' : ''}`}
                            >
                                {quote.status === 'Accepted' && (
                                    <div className="absolute top-0 right-0 p-2 bg-accent text-white rounded-bl-xl flex items-center gap-1 shadow-lg">
                                        <Trophy size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{t('winning_bid')}</span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{rfq?.title || t('general_quote')}</div>
                                    <h3 className="text-xl font-bold text-white mb-2">{supplier?.name || t('unknown')}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Calendar size={12} className="text-accent" />
                                        {t('date')}: {new Date(quote.quote_date).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-end">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-6">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{t('bid_amount')}</div>
                                        <div className="text-2xl font-bold text-accent">{Number(quote.total_amount).toLocaleString()} <span className="text-sm">{quote.currency || 'EGP'}</span></div>
                                    </div>

                                    {quote.status === 'Pending' && (
                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={() => handleApproveQuote(quote)}
                                                className="flex-1 py-2 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={14} /> {t('approve')}
                                            </button>
                                            <button className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 text-xs font-bold border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                                <XCircle size={14} /> {t('reject')}
                                            </button>
                                        </div>
                                    )}

                                    {quote.status !== 'Pending' && (
                                        <div className={`w-full py-2 rounded-lg text-center text-xs font-bold uppercase tracking-widest ${quote.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {t(quote.status?.toLowerCase()) || quote.status}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {filteredQuotations.length === 0 && !loading && (
                        <div className="col-span-full glass p-20 text-center border-border-custom bg-white/2">
                            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6">
                                <ClipboardCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('no_purchase_quotations_found')}</h3>
                            <p className="text-gray-400 max-w-sm mx-auto mb-8">{t('enter_supplier_quotes_desc')}</p>
                        </div>
                    )}
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={t('enter_supplier_quotation')}
                    onSubmit={async () => {
                        setIsSubmitting(true);
                        await upsert(formData);
                        setIsModalOpen(false);
                        setIsSubmitting(false);
                    }}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('linked_rfq')}</label>
                                <select
                                    value={formData.rfq_id}
                                    onChange={(e) => setFormData({ ...formData, rfq_id: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                >
                                    <option value="">{t('independent_quote')}</option>
                                    {rfqs.map((r: any) => (
                                        <option key={r.id} value={r.id}>{r.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('select_supplier')}</label>
                                <select
                                    value={formData.supplier_id}
                                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    required
                                >
                                    <option value="">{t('select_supplier_placeholder')}</option>
                                    {suppliers.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('total_price')}</label>
                                <div className="relative">
                                    <BadgeDollarSign size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                    <input
                                        type="number"
                                        value={formData.total_amount}
                                        onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                                        className="glass bg-white/5 border-border-custom p-3 pl-10 rounded-xl outline-none focus:border-accent transition-all text-sm w-full font-bold"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('quote_date')}</label>
                                <input
                                    type="date"
                                    value={formData.quote_date}
                                    onChange={(e) => setFormData({ ...formData, quote_date: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
