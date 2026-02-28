"use client";

import React, { useState } from "react";
import {
    ArrowLeft, Search, FileText, Printer,
    Download, Table as TableIcon, Calendar,
    User, DollarSign, PieChart, Activity
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";

export default function SalaryTemplatesPage() {
    const { t } = useLanguage();
    const { data: slips, loading } = useERPData<any>('salary_slips');
    const { data: staff } = useERPData<any>('staff');

    const [selectedMonth, setSelectedMonth] = useState(`${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`);
    const [searchTerm, setSearchTerm] = useState("");

    const monthlySlips = slips.filter((s: any) => s.month_year === selectedMonth);

    const filteredSlips = monthlySlips.filter((s: any) => {
        const emp = staff.find(st => st.id === s.staff_id);
        return emp?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const totalNet = filteredSlips.reduce((sum: number, s: any) => sum + (s.net_salary || 0), 0);
    const totalBase = filteredSlips.reduce((sum: number, s: any) => sum + (s.base_salary || 0), 0);
    const totalDeductions = filteredSlips.reduce((sum: number, s: any) => sum + (s.vat_amount + s.insurance_amount + s.advances_deducted + s.penalties_deducted), 0);

    const handlePrint = () => window.print();

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10 print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href="/payroll" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('salary_templates')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('salary_templates_subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="glass bg-background border-border-custom px-4 py-2 rounded-xl text-sm outline-none focus:border-accent"
                        >
                            {/* In a real app, this would be generated from available slips */}
                            <option value={`${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`}>{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</option>
                            <option value="January 2024">January 2024</option>
                            <option value="December 2023">December 2023</option>
                        </select>
                        <button
                            onClick={handlePrint}
                            className="bg-white/5 border border-white/10 p-2 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                        >
                            <Printer size={20} />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
                    <div className="glass p-6 border-border-custom flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('total_net_payable')}</p>
                            <h3 className="text-2xl font-bold text-white">{totalNet.toLocaleString()} {t('egp')}</h3>
                        </div>
                    </div>
                    <div className="glass p-6 border-border-custom flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                            <PieChart size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('total_base_payroll')}</p>
                            <h3 className="text-2xl font-bold text-white">{totalBase.toLocaleString()} {t('egp')}</h3>
                        </div>
                    </div>
                    <div className="glass p-6 border-border-custom flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('total_deductions')}</p>
                            <h3 className="text-2xl font-bold text-white">{totalDeductions.toLocaleString()} {t('egp')}</h3>
                        </div>
                    </div>
                </div>

                <div className="glass overflow-hidden border-border-custom print:border-none print:shadow-none">
                    <div className="p-8 border-b border-border-custom flex justify-between items-center print:border-black/20">
                        <div>
                            <h3 className="text-xl font-bold text-white print:text-black">{t('monthly_payroll_sheet')}</h3>
                            <p className="text-sm text-accent font-bold uppercase tracking-widest">{selectedMonth}</p>
                        </div>
                        <div className="text-right hidden print:block">
                            <p className="text-xs text-gray-400 font-bold uppercase">{t('organization_payroll_report')}</p>
                        </div>
                        <div className="print:hidden">
                            <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                                <Search size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('filter_by_name_placeholder')}
                                    className="bg-transparent border-none outline-none text-sm w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="border-b border-border-custom bg-white/5 print:bg-gray-100 font-bold text-[10px] uppercase text-gray-500 tracking-widest print:text-black">
                                <th className="p-6">{t('employee_name')}</th>
                                <th className="p-6">{t('days')}</th>
                                <th className="p-6 text-right">{t('base_salary')}</th>
                                <th className="p-6 text-right">{t('allowances')}</th>
                                <th className="p-6 text-right">{t('deductions')}</th>
                                <th className="p-6 text-right">{t('net_payable')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-500 animate-pulse">{t('generating_report')}</td></tr>
                            ) : filteredSlips.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-500 italic">{t('no_payroll_data_month')}</td></tr>
                            ) : filteredSlips.map((slip: any) => {
                                const emp = staff.find(st => st.id === slip.staff_id);
                                const allowances = slip.transportation_amount || 0;
                                const deductions = (slip.vat_amount || 0) + (slip.insurance_amount || 0) + (slip.advances_deducted || 0) + (slip.penalties_deducted || 0);
                                return (
                                    <tr key={slip.id} className="border-b border-border-custom hover:bg-white/5 transition-colors print:text-black">
                                        <td className="p-6">
                                            <div className="font-bold text-white print:text-black">{emp?.full_name || t('unknown')}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">{emp?.role || t('staff_label')}</div>
                                        </td>
                                        <td className="p-6 text-sm">{slip.days_served || 30}</td>
                                        <td className="p-6 text-right font-mono text-sm">{slip.base_salary?.toLocaleString()}</td>
                                        <td className="p-6 text-right font-mono text-sm text-emerald-500">+{allowances.toLocaleString()}</td>
                                        <td className="p-6 text-right font-mono text-sm text-red-500">-{deductions.toLocaleString()}</td>
                                        <td className="p-6 text-right font-mono font-bold text-white print:text-black">{slip.net_salary?.toLocaleString()} {t('egp')}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="print:text-black">
                            <tr className="bg-white/5 font-bold">
                                <td colSpan={2} className="p-6 text-lg">{t('totals')}</td>
                                <td className="p-6 text-right font-mono">{totalBase.toLocaleString()}</td>
                                <td className="p-6 text-right font-mono text-emerald-500">+{filteredSlips.reduce((sum: number, s: any) => sum + (s.transportation_amount || 0), 0).toLocaleString()}</td>
                                <td className="p-6 text-right font-mono text-red-500">-{totalDeductions.toLocaleString()}</td>
                                <td className="p-6 text-right font-mono text-xl text-accent">{totalNet.toLocaleString()} {t('egp')}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="hidden print:block mt-20 p-8 grid grid-cols-2 gap-20">
                        <div className="text-center">
                            <div className="border-b border-black w-full mb-2" />
                            <p className="text-[10px] font-bold uppercase">{t('prepared_by')}</p>
                        </div>
                        <div className="text-center">
                            <div className="border-b border-black w-full mb-2" />
                            <p className="text-[10px] font-bold uppercase">{t('approved_by')}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
