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
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";
import { uploadFile } from "@/lib/storage";

const InvoiceRow = ({ id, client, date, amount, status, secondaryInfo }: { id: string, client: string, date: string, amount: string, status: 'Paid' | 'Pending' | 'Draft', secondaryInfo?: string }) => {
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
                <div className="text-xs text-gray-400">
                    {client}
                    {secondaryInfo && <span className="ml-3 px-1.5 py-0.5 rounded bg-accent/10 text-accent font-bold">{secondaryInfo}</span>}
                </div>
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

interface Invoice {
    id: string;
    customer_id: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Draft';
    due_date: string;
    project_id?: string;
    unit_id?: string;
    branch_id?: string;
    work_description?: string;
    quantity?: number;
    unit_price?: number;
    vat_percentage?: number;
    retention_percentage?: number;
    payment_terms?: string;
    boq_reference?: string;
}

interface Customer {
    id: string;
    name: string;
}

interface Unit {
    id: string;
    name: string;
}

interface Project {
    id: string;
    name: string;
}

interface InventoryItem {
    id: string;
    name: string;
    code?: string;
}

interface Branch {
    id: string;
    name: string;
}

export default function InvoicesPage() {
    const { t } = useLanguage();
    const { data: invoices, loading, upsert } = useERPData<Invoice>('sales_invoices');
    const { data: customers } = useERPData<Customer>('customers');
    const { data: units } = useERPData<Unit>('units');
    const { data: projects } = useERPData<Project>('projects');
    const { data: inventory } = useERPData<InventoryItem>('inventory');
    const { data: branches } = useERPData<Branch>('branches');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        customer_id: '',
        unit_id: '',
        project_id: '',
        branch_id: '',
        amount: 0,
        status: 'Draft',
        due_date: new Date().toISOString().split('T')[0],
        boq_reference: '',
        work_description: '',
        quantity: 1,
        unit_price: 0,
        vat_percentage: 0,
        retention_percentage: 0,
        payment_terms: ''
    });

    // Auto-calculate amount when QTY, Unit Price, VAT, or Retention changes
    const handleNumberFieldChange = (field: string, value: string) => {
        const numVal = Number(value);
        setFormData(prev => {
            const updated = { ...prev, [field]: numVal };
            const gross = (updated.quantity || 0) * (updated.unit_price || 0);
            const vatAmount = gross * ((updated.vat_percentage || 0) / 100);
            const retentionAmount = gross * ((updated.retention_percentage || 0) / 100);
            const total = gross + vatAmount - retentionAmount;

            // Only auto-update total amount if unit_price was filled
            if (updated.unit_price > 0) {
                updated.amount = total;
            }
            return updated;
        });
    };

    const handleCreateInvoice = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                customer_id: formData.customer_id || undefined,
                unit_id: formData.unit_id || undefined,
                project_id: formData.project_id || undefined,
                branch_id: formData.branch_id || undefined,
                amount: Number(formData.amount),
                status: formData.status as 'Paid' | 'Pending' | 'Draft',
                due_date: formData.due_date,
                boq_reference: formData.boq_reference,
                work_description: formData.work_description,
                quantity: Number(formData.quantity),
                unit_price: Number(formData.unit_price),
                vat_percentage: Number(formData.vat_percentage),
                retention_percentage: Number(formData.retention_percentage),
                payment_terms: formData.payment_terms
            });
            setIsModalOpen(false);
            setFormData({
                customer_id: '',
                unit_id: '',
                project_id: '',
                branch_id: '',
                amount: 0,
                status: 'Draft',
                due_date: new Date().toISOString().split('T')[0],
                boq_reference: '',
                work_description: '',
                quantity: 1,
                unit_price: 0,
                vat_percentage: 0,
                retention_percentage: 0,
                payment_terms: ''
            });
        } catch (error) {
            console.error("Error creating invoice:", error);
            alert("Failed to create invoice.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalInvoiced = invoices.reduce((sum, inv: Invoice) => sum + (Number(inv.amount) || 0), 0);
    const totalPaid = invoices.filter((inv: Invoice) => inv.status === 'Paid').reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const totalPending = invoices.filter((inv: Invoice) => inv.status === 'Pending').reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const draftCount = invoices.filter((inv: Invoice) => inv.status === 'Draft').length;

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

                {/* Invoice KPIs */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                    <div className="glass p-6 border-accent/20 bg-accent/5">
                        <div className="flex items-center gap-3 text-accent mb-4">
                            <FileText size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('total_invoiced')}</span>
                        </div>
                        <div className="text-3xl font-bold">{totalInvoiced.toLocaleString()} EGP</div>
                        <div className="text-[10px] text-gray-500 mt-2">{t('all_time_sales')}</div>
                    </div>

                    <div className="glass p-6 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 text-emerald-400 mb-4">
                            <CheckCircle2 size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('total_collected')}</span>
                        </div>
                        <div className="text-3xl font-bold">{totalPaid.toLocaleString()} EGP</div>
                        <div className="text-[10px] text-gray-500 mt-2">{t('paid_cleared')}</div>
                    </div>

                    <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 text-blue-400 mb-4">
                            <Clock size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('pending_amount')}</span>
                        </div>
                        <div className="text-3xl font-bold">{totalPending.toLocaleString()} EGP</div>
                        <div className="text-[10px] text-gray-500 mt-2">{t('awaiting_payment')}</div>
                    </div>

                    <div className="glass p-6 border-gray-500/20 bg-gray-500/5">
                        <div className="flex items-center gap-3 text-gray-400 mb-4">
                            <AlertCircle size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('drafts')}</span>
                        </div>
                        <div className="text-3xl font-bold">{draftCount} {t('invoices')}</div>
                        <div className="text-[10px] text-gray-500 mt-2">{t('work_in_progress')}</div>
                    </div>
                </div>

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
                            <div className="text-center py-10 text-gray-500 italic">{t('syncing_invoices')}</div>
                        ) : (
                            invoices.map((inv: Invoice, i: number) => (
                                <InvoiceRow
                                    key={inv.id || i}
                                    id={inv.id?.slice(0, 8) || `#INV-${100 + i}`}
                                    client={customers.find(c => c.id === inv.customer_id)?.name || "Regular Client"}
                                    date={inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "Today"}
                                    amount={`${(inv.amount || 0).toLocaleString()} EGP`}
                                    status={inv.status || 'Pending'}
                                    secondaryInfo={
                                        inv.branch_id && branches.find((b) => b.id === inv.branch_id) ? `Branch: ${branches.find((b) => b.id === inv.branch_id)?.name}` :
                                            inv.boq_reference ? `BOQ: ${inv.boq_reference}` :
                                                inv.project_id && projects.find((p) => p.id === inv.project_id) ? `Project: ${projects.find((p) => p.id === inv.project_id)?.name}` :
                                                    inv.unit_id && units.find((u) => u.id === inv.unit_id) ? `Unit: ${units.find((u) => u.id === inv.unit_id)?.name}` : undefined
                                    }
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
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('customer')}</label>
                            <select
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">{t('select_customer')}</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('linked_project')}</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">{t('none_general')}</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('assigned_unit')}</label>
                            <select
                                value={formData.unit_id}
                                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">{t('none_service')}</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
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

                        <div className="col-span-2 mt-4 pt-4 border-t border-border-custom">
                            <h4 className="text-sm font-bold text-accent mb-4">{t('boq_details')}</h4>
                            <div className="grid grid-cols-2 gap-6 mb-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{t('boq_reference')}</label>
                                    <select
                                        value={formData.boq_reference}
                                        onChange={(e) => setFormData({ ...formData, boq_reference: e.target.value })}
                                        className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    >
                                        <option value="">{t('no_boq_link')}</option>
                                        {inventory.map((i) => (
                                            <option key={i.id} value={i.name}>{i.code ? `[${i.code}] ` : ''}{i.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{t('work_description')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('work_description_placeholder')}
                                        value={formData.work_description}
                                        onChange={(e) => setFormData({ ...formData, work_description: e.target.value })}
                                        className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{t('quantity')}</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => handleNumberFieldChange('quantity', e.target.value)}
                                        className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{t('unit_price')}</label>
                                    <input
                                        type="number"
                                        value={formData.unit_price}
                                        onChange={(e) => handleNumberFieldChange('unit_price', e.target.value)}
                                        className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{t('vat_percentage')}</label>
                                    <input
                                        type="number"
                                        value={formData.vat_percentage}
                                        onChange={(e) => handleNumberFieldChange('vat_percentage', e.target.value)}
                                        className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{t('retention_percentage')}</label>
                                    <input
                                        type="number"
                                        value={formData.retention_percentage}
                                        onChange={(e) => handleNumberFieldChange('retention_percentage', e.target.value)}
                                        className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{t('payment_terms')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('payment_terms_placeholder')}
                                        value={formData.payment_terms}
                                        onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                                        className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('final_total_amount')}</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm font-bold text-white shadow-inner"
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('due_date')}</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('status')}</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Draft">{t('draft')}</option>
                                <option value="Pending">{t('pending')}</option>
                                <option value="Paid">{t('paid')}</option>
                            </select>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
