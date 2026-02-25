"use client";

import React, { useState } from "react";
import {
    ArrowLeft, Plus, Search, User,
    Calendar, Briefcase, Activity, Landmark,
    Edit2, Trash2, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function PayrollContractsPage() {
    const { t } = useLanguage();
    const { data: contracts, loading, upsert, remove } = useERPData<any>('payroll_contracts');
    const { data: staff } = useERPData<any>('staff');
    const { data: services } = useERPData<any>('services');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        id: undefined,
        staff_id: '',
        service_id: '',
        tasks: '',
        employment_type: 'Full Time',
        base_salary: 0,
        yearly_increase_percent: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
    });

    const handleSaveContract = async () => {
        if (!formData.staff_id) return alert("Please select an employee");
        try {
            setIsSubmitting(true);
            await upsert({
                ...formData,
                end_date: formData.end_date || null
            });
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving contract:", error);
            alert("Failed to save contract.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id: undefined,
            staff_id: '',
            service_id: '',
            tasks: '',
            employment_type: 'Full Time',
            base_salary: 0,
            yearly_increase_percent: 0,
            start_date: new Date().toISOString().split('T')[0],
            end_date: ''
        });
    };

    const handleEdit = (contract: any) => {
        setFormData({
            ...contract,
            start_date: contract.start_date || new Date().toISOString().split('T')[0],
            end_date: contract.end_date || ''
        });
        setIsModalOpen(true);
    };

    const filteredContracts = contracts.filter((c: any) => {
        const emp = staff.find(s => s.id === c.staff_id);
        return emp?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.tasks?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/payroll" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Employee Contracts</h2>
                            <p className="text-gray-400 text-sm mt-1">Formalize tasks, salary terms and service management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search contracts..."
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
                            <span>Create Contract</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="glass p-6 h-48 animate-pulse border-border-custom bg-white/5 rounded-2xl" />
                        ))
                    ) : filteredContracts.length === 0 ? (
                        <div className="col-span-full py-20 text-center glass border-dashed border-2 border-border-custom">
                            <Briefcase size={40} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-500 italic">No contracts found. Start by creating one.</p>
                        </div>
                    ) : filteredContracts.map((contract: any) => {
                        const employee = staff.find(s => s.id === contract.staff_id);
                        const service = services.find(s => s.id === contract.service_id);

                        return (
                            <div key={contract.id} className="glass group border-border-custom hover:border-accent/30 transition-all duration-500 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-30 group-hover:opacity-100 transition-opacity" />
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-accent transition-colors">
                                                    {employee?.full_name || "Unknown Staff"}
                                                </h4>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500">{contract.employment_type}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(contract)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => { if (confirm("Delete contract?")) remove(contract.id); }} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Activity size={14} className="text-gray-600" />
                                            <span className="truncate">{contract.tasks || "No tasks specified"}</span>
                                        </div>
                                        {service && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                                <Landmark size={12} className="text-gray-600" />
                                                Managing: <span className="text-accent">{service.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                                            <CheckCircle2 size={12} />
                                            Base: {contract.base_salary?.toLocaleString()} EGP
                                            {contract.yearly_increase_percent > 0 && (
                                                <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                                    +{contract.yearly_increase_percent}% Inc.
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            Starts: {new Date(contract.start_date).toLocaleDateString()}
                                        </div>
                                        {contract.end_date && (
                                            <div className="flex items-center gap-1 text-red-500/50">
                                                <Calendar size={12} />
                                                Ends: {new Date(contract.end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={formData.id ? "Edit Contract" : "New Employment Contract"}
                    onSubmit={handleSaveContract}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Employee</label>
                            <select
                                value={formData.staff_id}
                                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                            >
                                <option value="" className="bg-background">Select Staff</option>
                                {staff.map((s: any) => (
                                    <option key={s.id} value={s.id} className="bg-background">{s.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Employment Type</label>
                            <select
                                value={formData.employment_type}
                                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                            >
                                <option value="Full Time" className="bg-background">Full Time</option>
                                <option value="Part Time" className="bg-background">Part Time</option>
                                <option value="Contractor" className="bg-background">Contractor</option>
                                <option value="Temporary" className="bg-background">Temporary</option>
                            </select>
                        </div>

                        <div className="flex flex-col col-span-2 gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Primary Tasks / Responsibilities</label>
                            <textarea
                                value={formData.tasks}
                                onChange={(e) => setFormData({ ...formData, tasks: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                                placeholder="Core duties and expected deliverables..."
                                rows={2}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Base Monthly Salary (EGP)</label>
                            <input
                                type="number"
                                value={formData.base_salary}
                                onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Yearly Increase (%)</label>
                            <input
                                type="number"
                                value={formData.yearly_increase_percent}
                                onChange={(e) => setFormData({ ...formData, yearly_increase_percent: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Managed Service (Optional)</label>
                            <select
                                value={formData.service_id}
                                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white"
                            >
                                <option value="" className="bg-background">No Service Responsibility</option>
                                {services.map((s: any) => (
                                    <option key={s.id} value={s.id} className="bg-background">{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white [color-scheme:dark]"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">End Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm text-white [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
