"use client";

import React, { useState } from "react";
import {
    ArrowLeft, Plus, Search, Activity,
    Edit2, Trash2, Tag,
    Percent, DollarSign, Repeat, Box
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function SalaryItemsPage() {
    const { t } = useLanguage();
    const { data: items, loading, upsert, remove } = useERPData<any>('salary_items');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        id: undefined,
        name: '',
        type: 'Addition', // Addition, Deduction
        value_type: 'Fixed', // Fixed, Percentage
        value: 0,
        is_recurring: true
    });

    const handleSaveItem = async () => {
        if (!formData.name) return alert(t('enter_item_name_error'));
        try {
            setIsSubmitting(true);
            await upsert(formData);
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving item:", error);
            alert(t('save_item_failed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id: undefined,
            name: '',
            type: 'Addition',
            value_type: 'Fixed',
            value: 0,
            is_recurring: true
        });
    };

    const handleEdit = (item: any) => {
        setFormData(item);
        setIsModalOpen(true);
    };

    const filteredItems = items.filter((i: any) =>
        i.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/payroll" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('salary_items')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('salary_items_subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('search_items_placeholder')}
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
                            <span>{t('add_item')}</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="glass p-6 h-40 animate-pulse border-border-custom bg-white/5 rounded-2xl" />
                        ))
                    ) : filteredItems.length === 0 ? (
                        <div className="col-span-full py-20 text-center glass border-dashed border-2 border-border-custom">
                            <Tag size={40} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-500 italic">{t('no_salary_items_found')}</p>
                        </div>
                    ) : filteredItems.map((item: any) => (
                        <div key={item.id} className="glass group border-border-custom hover:border-accent/30 transition-all duration-300 relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 transition-opacity ${item.type === 'Addition' ? 'bg-emerald-500' : 'bg-red-500'}`} />

                            <div className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg ${item.type === 'Addition' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        <Activity size={20} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                                            <Edit2 size={12} />
                                        </button>
                                        <button onClick={() => { if (confirm(t('confirm_delete_item'))) remove(item.id); }} className="p-1.5 text-gray-500 hover:text-red-500 transition-colors">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                <h4 className="font-bold text-white mb-1">{item.name}</h4>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${item.type === 'Addition' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {item.type === 'Addition' ? t('addition') : t('deduction')}
                                    </span>
                                    {item.is_recurring && (
                                        <span className="flex items-center gap-0.5 text-[8px] font-bold text-blue-400 uppercase tracking-widest">
                                            <Repeat size={8} /> {t('recurring')}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-end justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-1.5 font-mono text-xl font-bold text-white">
                                        {item.value_type === 'Percentage' ? <Percent size={16} className="text-accent" /> : <DollarSign size={16} className="text-accent" />}
                                        {item.value}
                                        <span className="text-[10px] font-normal text-gray-500">{item.value_type === 'Percentage' ? '%' : t('egp')}</span>
                                    </div>
                                    <Box size={14} className="text-gray-700" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={formData.id ? t('edit_salary_item') : t('create_salary_item')}
                    onSubmit={handleSaveItem}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col col-span-2 gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('item_name')}</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                                placeholder={t('item_name_payroll_placeholder')}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('type_label')}</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                            >
                                <option value="Addition" className="bg-background">{t('addition')} (+)</option>
                                <option value="Deduction" className="bg-background">{t('deduction')} (-)</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('value_type_label')}</label>
                            <select
                                value={formData.value_type}
                                onChange={(e) => setFormData({ ...formData, value_type: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                            >
                                <option value="Fixed" className="bg-background">{t('fixed_amount_egp')}</option>
                                <option value="Percentage" className="bg-background">{t('percentage_label')}</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('value_label')}</label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                            />
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formData.is_recurring}
                                    onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                                    className="w-5 h-5 rounded border-border-custom bg-transparent checked:bg-accent focus:ring-accent transition-all"
                                />
                                <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors tracking-tight">{t('recurring_every_month')}</span>
                            </label>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
