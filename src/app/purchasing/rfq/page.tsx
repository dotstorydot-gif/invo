"use client";

import React, { useState } from "react";
import {
    ArrowLeft,
    FileSearch,
    Plus,
    Calendar,
    Users,
    CheckCircle,
    ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function RFQPage() {
    const { t } = useLanguage();
    const { data: rfqs, loading, upsert } = useERPData<any>('rfqs');
    const { data: requests } = useERPData<any>('purchase_requests');
    const { data: suppliers } = useERPData<any>('suppliers');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        request_id: '',
        title: '',
        deadline: new Date().toISOString().split('T')[0],
        suppliers_invited: [] as string[]
    });

    const handleToggleSupplier = (id: string) => {
        setFormData(prev => ({
            ...prev,
            suppliers_invited: prev.suppliers_invited.includes(id)
                ? prev.suppliers_invited.filter(sid => sid !== id)
                : [...prev.suppliers_invited, id]
        }));
    };

    const handleSaveRFQ = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                request_id: formData.request_id || null,
                title: formData.title,
                deadline: formData.deadline,
                suppliers_invited: formData.suppliers_invited,
                status: 'Sent'
            });
            setIsModalOpen(false);
            setFormData({
                request_id: '',
                title: '',
                deadline: new Date().toISOString().split('T')[0],
                suppliers_invited: []
            });
        } catch (error) {
            console.error("Error saving RFQ:", error);
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
                            <h2 className="text-3xl font-bold gradient-text">{t('rfqs_title')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('rfq_description_desc')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{t('new_rfq')}</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {rfqs.map((rfq: any) => (
                        <motion.div
                            key={rfq.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-6 border-border-custom hover:border-accent/30 transition-all group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                        <FileSearch size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{rfq.title}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-widest">
                                                <Calendar size={12} />
                                                {t('closing_date')}: {new Date(rfq.deadline).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-widest">
                                                <Users size={12} />
                                                {rfq.suppliers_invited?.length || 0} {t('suppliers_count')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${rfq.status === 'Sent' ? 'bg-blue-500/10 text-blue-500' : 'bg-white/10 text-gray-500'}`}>
                                        {t(rfq.status?.toLowerCase()) || rfq.status}
                                    </div>
                                    <Link
                                        href={`/purchasing/quotations?rfq_id=${rfq.id}`}
                                        className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-accent hover:text-accent transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-4 gap-4">
                                {rfq.suppliers_invited?.map((sid: string) => {
                                    const supplier = suppliers.find((s: any) => s.id === sid);
                                    return (
                                        <div key={sid} className="flex items-center gap-2 p-2 rounded-lg bg-white/2 border border-white/5">
                                            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[8px] font-bold text-accent">
                                                {supplier?.name?.charAt(0) || 'S'}
                                            </div>
                                            <span className="text-xs text-gray-400 truncate">{supplier?.name || t('loading_data')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}

                    {rfqs.length === 0 && !loading && (
                        <div className="glass p-20 text-center border-border-custom bg-white/2">
                            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6">
                                <FileSearch size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('no_active_rfqs')}</h3>
                            <p className="text-gray-400 max-w-sm mx-auto mb-8">{t('active_rfqs_desc')}</p>
                        </div>
                    )}
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={t('create_rfq_modal_title')}
                    onSubmit={handleSaveRFQ}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('rfq_title_subject')}</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder={t('rfq_title_placeholder')}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('linked_purchase_request')}</label>
                                <select
                                    value={formData.request_id}
                                    onChange={(e) => setFormData({ ...formData, request_id: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                >
                                    <option value="">{t('independent_rfq')}</option>
                                    {requests.map((r: any) => (
                                        <option key={r.id} value={r.id}>{r.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('deadline_for_bids')}</label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('select_suppliers_to_invite')}</label>
                            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {suppliers.map((s: any) => (
                                    <div
                                        key={s.id}
                                        onClick={() => handleToggleSupplier(s.id)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${formData.suppliers_invited.includes(s.id) ? 'bg-accent/10 border-accent text-accent' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-xs font-bold">{s.name}</span>
                                        {formData.suppliers_invited.includes(s.id) && <CheckCircle size={14} />}
                                    </div>
                                ))}
                                {suppliers.length === 0 && (
                                    <div className="col-span-2 p-4 text-center text-[10px] text-gray-500 italic border border-dashed border-white/10 rounded-xl">
                                        {t('no_suppliers_in_directory')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
