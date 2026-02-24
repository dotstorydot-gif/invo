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
    const [employees, setEmployees] = useState<Employee[]>([
        { id: "1", name: "Sameh Kamel", role: "Manager", baseSalary: 25000, penalties: 0, vacations: 2 },
        { id: "2", name: "Ahmed Ali", role: "Accountant", baseSalary: 12000, penalties: 500, vacations: 5 },
        { id: "3", name: "Sara Hassan", role: "Support", baseSalary: 8500, penalties: 0, vacations: 0 }
    ]);

    const calculateNet = (emp: Employee) => emp.baseSalary - emp.penalties;

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

                    <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
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
                                                    <div className="font-bold text-white">{emp.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{emp.role}</div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm font-medium">{emp.baseSalary.toLocaleString()} EGP</td>
                                            <td className="p-6 text-sm text-red-400">-{emp.penalties.toLocaleString()} EGP</td>
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
            </main>
        </div>
    );
}
