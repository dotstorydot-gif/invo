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
    baseSalary: number;
    penalties: number;
    vacations: number;
}

export default function StaffPage() {
    const { t } = useLanguage();
    const { data: employees, loading, upsert } = useERPData<any>('staff');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        role: 'Consultant',
        base_salary: 0,
        email: '',
        status: 'Active'
    });

    const handleAddStaff = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                full_name: formData.full_name,
                role: formData.role,
                base_salary: Number(formData.base_salary),
                email: formData.email,
                status: formData.status
            });
            setIsModalOpen(false);
            setFormData({
                full_name: '',
                role: 'Consultant',
                base_salary: 0,
                email: '',
                status: 'Active'
            });
        } catch (error) {
            console.error("Error adding staff:", error);
            alert("Failed to add staff member.");
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
                                                    <div className="font-bold text-white">{emp.full_name || emp.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{emp.role}</div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm font-medium">{(emp.base_salary || emp.baseSalary || 0).toLocaleString()} EGP</td>
                                            <td className="p-6 text-sm text-red-400">-{(emp.penalties || 0).toLocaleString()} EGP</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full w-fit">
                                                    <Umbrella size={12} />
                                                    {emp.vacations} Days
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm font-bold text-accent">{calculateNet(emp).toLocaleString()} EGP</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-red-400 transition-all title='Add Penalty'">
                                                        <AlertTriangle size={16} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-blue-400 transition-all title='Add Vacation'">
                                                        <Calendar size={16} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-emerald-400 transition-all title='Pay Salary'">
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
                            <label className="text-xs font-bold text-gray-500 uppercase">Base Salary (EGP)</label>
                            <input
                                type="number"
                                value={formData.base_salary}
                                onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
