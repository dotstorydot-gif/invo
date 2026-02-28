"use client";

import React, { useState } from "react";
import {
    ArrowLeft, Search, User,
    Calendar, Printer, Calculator,
    ShieldCheck, Truck, Receipt, MinusCircle,
    Info, Eye
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function SalarySlipsPage() {
    const { t } = useLanguage();
    const { data: slips, loading } = useERPData<any>('salary_slips');
    const { data: staff } = useERPData<any>('staff');

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSlip, setSelectedSlip] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const handleViewSlip = (slip: any) => {
        setSelectedSlip(slip);
        setIsViewModalOpen(true);
    };

    const filteredSlips = slips.filter((s: any) => {
        const emp = staff.find(st => st.id === s.staff_id);
        return emp?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.month_year?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-foreground">
            <main className="flex-1 p-8 overflow-y-auto print:p-0">
                <header className="flex justify-between items-center mb-10 print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href="/payroll" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('salary_slips')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('salary_slips_subtitle')}</p>
                        </div>
                    </div>

                    <div className="glass flex items-center px-4 py-2 gap-3 w-80 border-border-custom bg-background">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('search_slips_placeholder')}
                            className="bg-transparent border-none outline-none text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4 print:hidden">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="glass p-6 h-20 animate-pulse border-border-custom bg-white/5" />
                        ))
                    ) : filteredSlips.length === 0 ? (
                        <div className="py-20 text-center glass border-dashed border-2 border-border-custom">
                            <Receipt size={40} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-500 italic">{t('no_salary_slips_found')}</p>
                        </div>
                    ) : (
                        <div className="glass overflow-hidden border-border-custom">
                            <table className="w-full text-left font-medium">
                                <thead>
                                    <tr className="border-b border-border-custom bg-white/5 tracking-widest text-[10px] uppercase text-gray-500">
                                        <th className="p-6">{t('employee')}</th>
                                        <th className="p-6">{t('period')}</th>
                                        <th className="p-6 text-right">{t('net_salary')}</th>
                                        <th className="p-6 text-center">{t('breakdown')}</th>
                                        <th className="p-6 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSlips.map((slip: any) => {
                                        const emp = staff.find(st => st.id === slip.staff_id);
                                        return (
                                            <tr key={slip.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                            <User size={16} />
                                                        </div>
                                                        <div className="font-bold text-white">{emp?.full_name || "Unknown"}</div>
                                                    </div>
                                                </td>
                                                <td className="p-6 font-mono text-sm text-gray-400 font-bold uppercase">
                                                    {slip.month_year}
                                                </td>
                                                <td className="p-6 text-right font-mono font-bold text-emerald-400">
                                                    {slip.net_salary?.toLocaleString()} <span className="text-[10px] text-gray-500">{t('egp')}</span>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex justify-center gap-4">
                                                        {slip.insurance_amount > 0 && <ShieldCheck size={14} className="text-blue-500" />}
                                                        {slip.vat_amount > 0 && <Receipt size={14} className="text-amber-500" />}
                                                        {slip.transportation_amount > 0 && <Truck size={14} className="text-emerald-500" />}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button
                                                        onClick={() => handleViewSlip(slip)}
                                                        className="p-2 bg-white/5 rounded-lg border border-white/5 hover:border-accent hover:bg-accent/10 text-gray-400 hover:text-accent transition-all"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <ERPFormModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title={t('salary_slip_breakdown')}
                    onSubmit={() => setIsViewModalOpen(false)}
                    submitLabel="Close"
                    hideSubmit={true}
                    maxWidth="max-w-4xl"
                >
                    {selectedSlip && (
                        <div className="space-y-8 print:block print:space-y-6">
                            {/* Slip Header */}
                            <div className="flex justify-between items-start border-b border-white/10 pb-6 print:border-black/20">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calculator className="text-accent" size={24} />
                                        <h3 className="text-2xl font-bold text-white print:text-black tracking-tighter uppercase">Payroll Receipt</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Period: {selectedSlip.month_year}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Receipt ID</p>
                                    <p className="font-mono text-xs text-accent">SLIP-{selectedSlip.id?.substring(0, 8).toUpperCase()}</p>
                                    <button
                                        onClick={handlePrint}
                                        className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all print:hidden"
                                    >
                                        <Printer size={12} /> Print Slip
                                    </button>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="grid grid-cols-2 gap-8 print:gap-12">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Employee Information</p>
                                    <div className="glass bg-white/5 p-4 rounded-xl border border-white/10 print:bg-transparent print:border-black/10">
                                        <p className="text-lg font-bold text-white print:text-black">{staff.find((s: any) => s.id === selectedSlip.staff_id)?.full_name}</p>
                                        <p className="text-sm text-gray-400 print:text-gray-600 uppercase tracking-tighter">{staff.find((s: any) => s.id === selectedSlip.staff_id)?.role || t('permanent_staff')}</p>
                                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/40 print:text-black/40 uppercase">
                                            <Calendar size={12} /> Days Served: <span className="text-white print:text-black">{selectedSlip.days_served || 30}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Salary Summary</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-bold uppercase text-[10px]">Net Payable</span>
                                            <span className="text-2xl font-bold text-emerald-400 font-mono">{selectedSlip.net_salary?.toLocaleString()} EGP</span>
                                        </div>
                                        <div className="w-full bg-emerald-500/20 h-1 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full w-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Payment Breakdown</p>
                                <div className="glass overflow-hidden border-border-custom bg-white/5 print:bg-transparent print:border-black/10">
                                    <table className="w-full text-left font-medium">
                                        <thead>
                                            <tr className="border-b border-border-custom bg-white/5 print:bg-gray-100 print:text-black">
                                                <th className="p-4 text-[10px] font-bold uppercase text-gray-500 tracking-widest">Item Description</th>
                                                <th className="p-4 text-[10px] font-bold uppercase text-gray-500 tracking-widest text-right">Addition</th>
                                                <th className="p-4 text-[10px] font-bold uppercase text-gray-500 tracking-widest text-right">Deduction</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-white/5 print:border-black/5">
                                                <td className="p-4 text-sm font-bold text-white/80 print:text-black">Base Salary</td>
                                                <td className="p-4 text-right font-mono text-sm text-emerald-400">+{selectedSlip.base_salary?.toLocaleString()}</td>
                                                <td className="p-4 text-right font-mono text-sm text-gray-500">-</td>
                                            </tr>
                                            {selectedSlip.transportation_amount > 0 && (
                                                <tr className="border-b border-white/5 print:border-black/5">
                                                    <td className="p-4 text-sm flex items-center gap-2 text-white/60 print:text-black">
                                                        <Truck size={12} className="text-emerald-500" /> Transportation Allowance
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-sm text-emerald-400">+{selectedSlip.transportation_amount?.toLocaleString()}</td>
                                                    <td className="p-4 text-right font-mono text-sm text-gray-500">-</td>
                                                </tr>
                                            )}
                                            {selectedSlip.insurance_amount > 0 && (
                                                <tr className="border-b border-white/5 print:border-black/5">
                                                    <td className="p-4 text-sm flex items-center gap-2 text-white/60 print:text-black">
                                                        <ShieldCheck size={12} className="text-blue-500" /> Social Insurance
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-sm text-gray-500">-</td>
                                                    <td className="p-4 text-right font-mono text-sm text-red-400">-{selectedSlip.insurance_amount?.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedSlip.vat_amount > 0 && (
                                                <tr className="border-b border-white/5 print:border-black/5">
                                                    <td className="p-4 text-sm flex items-center gap-2 text-white/60 print:text-black">
                                                        <Receipt size={12} className="text-amber-500" /> VAT (Tax Deducted)
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-sm text-gray-500">-</td>
                                                    <td className="p-4 text-right font-mono text-sm text-red-500">-{selectedSlip.vat_amount?.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedSlip.advances_deducted > 0 && (
                                                <tr className="border-b border-white/5 print:border-black/5">
                                                    <td className="p-4 text-sm flex items-center gap-2 text-white/60 print:text-black">
                                                        <MinusCircle size={12} className="text-red-400" /> Loans / Advances Repayment
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-sm text-gray-500">-</td>
                                                    <td className="p-4 text-right font-mono text-sm text-red-400">-{selectedSlip.advances_deducted?.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {selectedSlip.penalties_deducted > 0 && (
                                                <tr className="border-b border-white/5 print:border-black/5">
                                                    <td className="p-4 text-sm flex items-center gap-2 text-white/60 print:text-black">
                                                        <Info size={12} className="text-red-600" /> Fine / Penalties
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-sm text-gray-500">-</td>
                                                    <td className="p-4 text-right font-mono text-sm text-red-600">-{selectedSlip.penalties_deducted?.toLocaleString()}</td>
                                                </tr>
                                            )}
                                            {/* Custom Items */}
                                            {selectedSlip.breakdown?.map((item: any, i: number) => (
                                                <tr key={i} className="border-b border-white/5 print:border-black/5">
                                                    <td className="p-4 text-sm text-white/60 print:text-black">{item.name}</td>
                                                    <td className="p-4 text-right font-mono text-sm text-emerald-500">
                                                        {item.type === 'Addition' ? `+${item.amount?.toLocaleString()}` : '-'}
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-sm text-red-500">
                                                        {item.type === 'Deduction' ? `-${item.amount?.toLocaleString()}` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-white/10 print:bg-gray-200">
                                                <td className="p-4 text-sm font-bold text-white print:text-black">TOTAL NET PAYABLE</td>
                                                <td colSpan={2} className="p-4 text-right font-mono text-xl font-bold text-emerald-400 print:text-black">
                                                    {selectedSlip.net_salary?.toLocaleString()} EGP
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Verification Footer */}
                            <div className="pt-10 flex justify-between items-end border-t border-dashed border-white/10 print:border-black/10">
                                <div className="space-y-4">
                                    <div className="w-48 h-12 border-b border-white/20 print:border-black/40" />
                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest uppercase font-bold tracking-tight">Finance Manager Signature</p>
                                </div>
                                <div className="text-right flex items-center gap-2 text-gray-700 print:text-gray-400 font-mono text-[8px] uppercase">
                                    <ShieldCheck size={10} /> Certified Digital Payroll Document
                                </div>
                            </div>
                        </div>
                    )}
                </ERPFormModal>
            </main>
        </div>
    );
}
