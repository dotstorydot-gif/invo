"use client";

import React, { useState } from "react";
import {
    Users2,
    Plus,
    Search,
    Clock,
    Calendar,
    ArrowLeft,
    Briefcase,
    UserCircle,
    FileText,
    AlertTriangle,
    Umbrella,
    CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface Employee {
    id: string;
    name: string;
    role: string;
    employment_type: string;
    baseSalary: number;
    daily_rate: number;
    penalties: number;
    vacations: number;
    project_id?: string;
}

export default function StaffPage() {
    const { t } = useLanguage();
    const { data: employees, loading, upsert } = useERPData<any>('staff');
    const { data: projects } = useERPData<any>('projects');
    const { upsert: upsertExpense } = useERPData<any>('expenses');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState<any>(null);
    const [payDays, setPayDays] = useState(1);

    const [formData, setFormData] = useState({
        full_name: '',
        role: 'Consultant',
        employment_type: 'Full Time',
        base_salary: 0,
        daily_rate: 0,
        email: '',
        status: 'Active',
        project_id: ''
    });

    const handleAddStaff = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                full_name: formData.full_name,
                role: formData.role,
                employment_type: formData.employment_type,
                base_salary: Number(formData.base_salary),
                daily_rate: Number(formData.daily_rate),
                email: formData.email,
                status: formData.status,
                project_id: formData.project_id || null
            });
            setIsModalOpen(false);
            setFormData({
                full_name: '',
                role: 'Consultant',
                employment_type: 'Full Time',
                base_salary: 0,
                daily_rate: 0,
                email: '',
                status: 'Active',
                project_id: ''
            });
        } catch (error) {
            console.error("Error adding staff:", error);
            alert("Failed to add staff member.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaySalary = async () => {
        if (!selectedEmp) return;
        try {
            setIsSubmitting(true);
            const amountToPay = selectedEmp.employment_type === 'Daily'
                ? (selectedEmp.daily_rate * payDays) - selectedEmp.penalties
                : calculateNet(selectedEmp);

            await upsertExpense({
                organization_id: selectedEmp.organization_id,
                date: new Date().toISOString().split('T')[0],
                amount: amountToPay,
                category: 'Salaries',
                description: `Salary Payment for ${selectedEmp.full_name || selectedEmp.name}. ${selectedEmp.employment_type === 'Daily' ? `Days Worked: ${payDays}` : ''}`,
                status: 'Approved'
            });

            // Optionally clear penalties back to 0 here if full settlement
            await upsert({
                id: selectedEmp.id,
                penalties: 0,
                vacations: 0
            });

            setIsPayModalOpen(false);
            setSelectedEmp(null);
            alert("Salary Payment generated successfully in Expenses.");
        } catch (error) {
            console.error(error);
            alert("Failed to pay salary.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateNet = (emp: any) => (emp.base_salary || emp.baseSalary || 0) - (emp.penalties || 0);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('staff_title')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('staff_subtitle')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{t('add_employee')}</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <div className="glass overflow-hidden border-border-custom">
                        <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-3">
                                <Users2 className="text-accent" />
                                <h3 className="text-xl font-bold">{t('team_members')} & Payroll</h3>
                            </div>
                            <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                                <Search size={16} className="text-gray-400" />
                                <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-xs w-full" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border-custom">
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Employee</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('salary_base')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('penalties')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('vacations')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('salary_net')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                            <td className="p-6 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                    <UserCircle size={24} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white flex gap-2 items-center">
                                                        {emp.full_name || emp.name}
                                                        {emp.project_id && projects.find((p: any) => p.id === emp.project_id) && (
                                                            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                                                                {projects.find((p: any) => p.id === emp.project_id)?.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter flex items-center gap-2">
                                                        <span>{emp.role}</span>
                                                        <span className={`px-1.5 py-0.5 rounded ${emp.employment_type === 'Daily' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>{emp.employment_type || 'Full Time'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm font-medium">
                                                {emp.employment_type === 'Daily'
                                                    ? <span className="text-amber-500 font-bold">{(emp.daily_rate || 0).toLocaleString()} EGP <span className="text-[10px] text-gray-500 font-normal">/ day</span></span>
                                                    : <span>{(emp.base_salary || emp.baseSalary || 0).toLocaleString()} EGP <span className="text-[10px] text-gray-500 font-normal">/ mo</span></span>
                                                }
                                            </td>
                                            <td className="p-6 text-sm text-red-400">-{(emp.penalties || 0).toLocaleString()} EGP</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full w-fit">
                                                    <Umbrella size={12} />
                                                    {emp.vacations} Days
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                {emp.employment_type === 'Daily' ? (
                                                    <div className="text-sm font-bold text-gray-500">Variable</div>
                                                ) : (
                                                    <div className="text-sm font-bold text-accent">{calculateNet(emp).toLocaleString()} EGP</div>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-red-400 transition-all title='Add Penalty'">
                                                        <AlertTriangle size={16} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-blue-400 transition-all title='Add Vacation'">
                                                        <Calendar size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEmp(emp);
                                                            setPayDays(1);
                                                            setIsPayModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-emerald-400 transition-all title='Pay Salary'"
                                                    >
                                                        <CreditCard size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={t('add_employee')}
                    onSubmit={handleAddStaff}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="Employee Name"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="email@company.com"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="e.g. Sales Manager"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Employment Type</label>
                            <select
                                value={formData.employment_type}
                                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Full Time">Full Time</option>
                                <option value="Part Time">Part Time</option>
                                <option value="Temporary">Temporary</option>
                                <option value="Daily">Daily</option>
                            </select>
                        </div>
                        {formData.employment_type === 'Daily' ? (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Daily Rate (EGP)</label>
                                <input
                                    type="number"
                                    value={formData.daily_rate}
                                    onChange={(e) => setFormData({ ...formData, daily_rate: Number(e.target.value) })}
                                    className="glass bg-amber-500/5 border-amber-500/20 p-3 rounded-xl outline-none focus:border-amber-500 transition-all text-sm"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Base Salary (EGP)</label>
                                <input
                                    type="number"
                                    value={formData.base_salary}
                                    onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Assigned Project</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">None / Corporate Staff</option>
                                {projects.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </ERPFormModal>

                {/* Pay Salary Modal */}
                <ERPFormModal
                    isOpen={isPayModalOpen}
                    onClose={() => setIsPayModalOpen(false)}
                    title={selectedEmp ? `Process Salary: ${selectedEmp.full_name || selectedEmp.name}` : 'Process Salary'}
                    onSubmit={handlePaySalary}
                    loading={isSubmitting}
                >
                    {selectedEmp && (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="p-4 rounded-xl bg-white/5 border border-border-custom flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Employment Type</div>
                                    <div className="font-bold text-white">{selectedEmp.employment_type || 'Full Time'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Rate</div>
                                    <div className="font-bold text-accent">
                                        {selectedEmp.employment_type === 'Daily'
                                            ? `${selectedEmp.daily_rate.toLocaleString()} EGP / Day`
                                            : `${(selectedEmp.base_salary || selectedEmp.baseSalary || 0).toLocaleString()} EGP / Month`}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Penalties</div>
                                    <div className="font-bold text-red-500">-{(selectedEmp.penalties || 0).toLocaleString()} EGP</div>
                                </div>
                            </div>

                            {selectedEmp.employment_type === 'Daily' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Days Worked</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={payDays}
                                        onChange={(e) => setPayDays(Number(e.target.value))}
                                        className="glass bg-white/5 border-border-custom p-4 rounded-xl outline-none focus:border-accent transition-all text-2xl font-bold font-mono text-center shadow-inner"
                                    />
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-border-custom">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-gray-400">Final Salary Invoice</span>
                                    <span className="text-3xl font-bold gradient-text">
                                        {selectedEmp.employment_type === 'Daily'
                                            ? ((selectedEmp.daily_rate * payDays) - (selectedEmp.penalties || 0)).toLocaleString()
                                            : calculateNet(selectedEmp).toLocaleString()
                                        } EGP
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </ERPFormModal>
            </main>
        </div>
    );
}
