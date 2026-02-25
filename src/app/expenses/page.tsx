"use client";

import React, { useState } from "react";
import {
    Plus,
    Search,
    ArrowLeft,
    Zap,
    HardDrive,
    DollarSign,
    TrendingDown,
    Calendar,
    MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";
import { useAuth } from "@/context/AuthContext";

interface ExpenseItem {
    id: string;
    category: string;
    amount: number;
    date: string;
    description: string;
    type: 'Fixed' | 'Variable' | 'Asset' | 'General';
    attachment_url?: string;
    project_id?: string;
    unit_id?: string;
    branch_id?: string;
}

interface Branch {
    id: string;
    name: string;
    address: string;
}

interface Project {
    id: string;
    name: string;
}

interface Unit {
    id: string;
    name: string;
}

export default function ExpensesPage() {
    const { t } = useLanguage();
    const { session } = useAuth();
    const { data: expenses, loading, upsert } = useERPData<ExpenseItem>('expenses');
    const { data: projects } = useERPData<Project>('projects');
    const { data: units } = useERPData<Unit>('units');
    const { data: services } = useERPData<any>('services');
    const { data: branches } = useERPData<Branch>('branches');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customCategory, setCustomCategory] = useState('');

    const isMarketing = session?.moduleType === 'Service & Marketing';

    const [formData, setFormData] = useState({
        amount: 0,
        category: '',
        type: 'General' as 'Fixed' | 'Variable' | 'Asset' | 'General', // Changed default type and added 'General'
        description: '',
        date: new Date().toISOString().split('T')[0],
        project_id: '',
        unit_id: '',
        branch_id: '', // Added branch_id
        attachment_url: '', // Kept attachment_url for file upload
        provider: '' // Kept provider for internet invoice
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, attachment_url: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddExpense = async () => {
        try {
            setIsSubmitting(true);
            const finalCategory = formData.category === 'Other' ? (customCategory || 'Other Expense') : formData.category;
            const finalDescription = formData.category === 'Internet Invoice' && formData.provider
                ? `Provider: ${formData.provider}${formData.description ? ' - ' + formData.description : ''}`
                : formData.description;

            await upsert({
                category: finalCategory,
                amount: Number(formData.amount),
                date: formData.date,
                description: finalDescription,
                type: formData.type,
                attachment_url: formData.attachment_url || undefined,
                project_id: formData.project_id || undefined,
                unit_id: formData.unit_id || undefined,
                branch_id: formData.branch_id || undefined // Added branch_id
            });
            setIsModalOpen(false);
            setFormData({
                amount: 0,
                category: '',
                type: 'General', // Reset to 'General'
                description: '',
                date: new Date().toISOString().split('T')[0],
                project_id: '',
                unit_id: '',
                branch_id: '', // Reset branch_id
                attachment_url: '',
                provider: ''
            });
            setCustomCategory('');
        } catch (error) {
            console.error("Error adding expense:", error);
            alert("Failed to add expense.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalUtilities = expenses
        .filter(e => e.category.toLowerCase().includes('electricity') || e.category.toLowerCase().includes('water') || e.category.toLowerCase().includes('internet'))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalAssets = expenses
        .filter(e => e.type === 'Asset')
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalVariable = expenses
        .filter(e => e.type === 'Variable')
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('expenses')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('expenses_subtitle')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{t('add_expense')}</span>
                    </button>
                </header>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="glass p-6 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                <Zap size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-400">{t('utilities')}</span>
                        </div>
                        <div className="text-2xl font-bold">{totalUtilities.toLocaleString()} EGP</div>
                        <div className="text-xs text-gray-500 mt-1">{t('sum_utilities')}</div>
                    </div>

                    <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <HardDrive size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-400">{t('assets')}</span>
                        </div>
                        <div className="text-2xl font-bold">{totalAssets.toLocaleString()} EGP</div>
                        <div className="text-xs text-gray-500 mt-1">{t('total_assets')}</div>
                    </div>

                    <div className="glass p-6 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <TrendingDown size={20} />
                            </div>
                            <span className="text-sm font-bold text-gray-400">{t('variable_costs')}</span>
                        </div>
                        <div className="text-2xl font-bold">{totalVariable.toLocaleString()} EGP</div>
                        <div className="text-xs text-gray-500 mt-1">{t('operating_expenses')}</div>
                    </div>
                </div>

                <div className="glass overflow-hidden border-border-custom">
                    <div className="p-6 border-b border-border-custom flex justify-between items-center">
                        <h3 className="font-bold text-xl">{t('latest_transactions')}</h3>
                        <div className="flex items-center gap-3">
                            <div className="glass flex items-center px-4 py-2 gap-3 border-border-custom">
                                <Search size={18} className="text-gray-400" />
                                <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-sm w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col min-h-[400px]">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center p-10 italic text-gray-500">{t('syncing_ledger')}</div>
                        ) : expenses.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-gray-500 gap-4 opacity-50">
                                <DollarSign size={40} />
                                <p>{t('no_expenses')}</p>
                            </div>
                        ) : (
                            expenses.map((expense) => (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 border-b border-border-custom last:border-0 hover:bg-white/5 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-white/5 ${expense.type === 'Asset' ? 'text-blue-400' : expense.type === 'Fixed' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold group-hover:text-accent transition-colors">
                                                {expense.category}
                                                {expense.project_id && projects.find((p) => p.id === expense.project_id) && (
                                                    <span className="ml-2 text-xs text-blue-400 font-normal py-0.5 px-2 bg-blue-500/10 rounded">
                                                        {projects.find((p) => p.id === expense.project_id)?.name}
                                                    </span>
                                                )}
                                                {expense.unit_id && (isMarketing ? services : units).find((item: any) => item.id === expense.unit_id) && (
                                                    <span className={`ml-2 text-xs font-normal py-0.5 px-2 rounded ${isMarketing ? 'text-purple-400 bg-purple-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                                        {(isMarketing ? services : units).find((item: any) => item.id === expense.unit_id)?.name}
                                                    </span>
                                                )}
                                                {expense.branch_id && branches.find((b) => b.id === expense.branch_id) && (
                                                    <span className="ml-2 text-xs text-purple-400 font-normal py-0.5 px-2 bg-purple-500/10 rounded">
                                                        {branches.find((b) => b.id === expense.branch_id)?.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">{expense.description}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-sm font-bold">{(Number(expense.amount) || 0).toLocaleString()} EGP</div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                                <Calendar size={12} />
                                                {expense.date}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${expense.type === 'Asset' ? 'bg-blue-500/10 text-blue-500' : expense.type === 'Fixed' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {expense.type}
                                            </span>
                                            <button className="p-2 rounded-lg hover:bg-white/5 text-gray-500 transition-all opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={t('add_expense')}
                    onSubmit={handleAddExpense}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('amount_egp')}</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-4 rounded-xl outline-none focus:border-accent transition-all text-xl font-bold"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('expense_category')}</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm mb-2"
                            >
                                <option value="">{t('select_category')}</option>
                                <option value="Rent Invoice">Rent Invoice</option>
                                <option value="Maintenance Invoice">Maintenance Invoice</option>
                                <option value="Internet Invoice">Internet Invoice</option>
                                <option value="Electricity Invoice">Electricity Invoice</option>
                                <option value="Water Invoice">Water Invoice</option>
                                <option value="Phone / Mobile Invoice">Phone / Mobile Invoice</option>
                                <option value="Tax">Tax</option>
                                <option value="Insurance">Insurance</option>
                                <option value="Government utilities (الحي)">Government utilities (الحي)</option>
                                <option value="Asset">Asset Purchase</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Office Supplies">Office Supplies</option>
                                <option value="Transportation">{t('transportation')}</option>
                                <option value="Parking">{t('parking')}</option>
                                <option value="Meeting">{t('meeting')}</option>
                                <option value="Coffee">{t('coffee')}</option>
                                <option value="Lunch">{t('lunch')}</option>
                                <option value="Travel">{t('travel')}</option>
                                <option value="Other">{t('other')}</option>
                            </select>

                            {formData.category === 'Other' && (
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="Enter custom expense category..."
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                />
                            )}
                        </div>

                        {formData.category === 'Internet Invoice' && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Internet Provider</label>
                                <select
                                    value={formData.provider}
                                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                >
                                    <option value="">Select Provider</option>
                                    <option value="WE (Telecom Egypt)">WE (Telecom Egypt)</option>
                                    <option value="Vodafone Egypt">Vodafone Egypt</option>
                                    <option value="Orange Egypt">Orange Egypt</option>
                                    <option value="Etisalat Misr">Etisalat Misr</option>
                                    <option value="">{t('select_provider')}</option>
                                    <option value="WE (Telecom Egypt)">{t('we_telecom_egypt')}</option>
                                    <option value="Vodafone Egypt">{t('vodafone_egypt')}</option>
                                    <option value="Orange Egypt">{t('orange_egypt')}</option>
                                    <option value="Etisalat Misr">{t('etisalat_misr')}</option>
                                    <option value="Nour ADSL">{t('nour_adsl')}</option>
                                </select>
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('assigned_project')}</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm font-semibold"
                            >
                                <option value="">{t('none_general')}</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{isMarketing ? "Assigned Service / Item" : t('assigned_unit')}</label>
                            <select
                                value={formData.unit_id}
                                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm font-semibold"
                            >
                                <option value="">{isMarketing ? "General Service Cost" : t('none_service')}</option>
                                {(isMarketing ? services : units).map((item: any) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('assigned_branch')}</label>
                            <select
                                value={formData.branch_id}
                                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm border-l-4 border-l-purple-500 font-semibold"
                            >
                                <option value="">{t('hq_unassigned')}</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('expense_type')}</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Fixed' | 'Variable' | 'Asset' | 'General' })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="General">{t('general')}</option> {/* Changed from Variable */}
                                <option value="Variable">{t('variable')}</option>
                                <option value="Fixed">{t('fixed')}</option>
                                <option value="Asset">{t('asset')}</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('expense_date')}</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('expense_description')}</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-24 resize-none"
                                placeholder={t('expense_description_placeholder')}
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('receipt_photo_optional')}</label>
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-3 rounded-xl transition-all text-sm font-semibold flex items-center gap-2">
                                    <Plus size={16} /> {t('upload_receipt')}
                                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
                                </label>
                                {formData.attachment_url && <span className="text-xs text-accent font-bold">{t('file_attached')}</span>}
                            </div>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
