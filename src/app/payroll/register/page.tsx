"use client";

import React, { useState } from "react";
import {
    ArrowLeft,
    CreditCard,
    Search,
    User,
    Calendar,
    CheckCircle2,
    AlertCircle,
    BadgePercent,
    Receipt,
    Calculator,
    ShieldCheck,
    Truck
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface SalaryRecord {
    id: string;
    organization_id: string;
    employee_id: string;
    month: string;
    year: number;
    base_salary: number;
    allowances: number;
    deductions: number;
    net_pay: number;
    paid_amount: number;
    status: 'Pending' | 'Partial' | 'Transferred';
    created_at: string;
}

interface Employee {
    id: string;
    full_name: string;
    role: string;
}

export default function SalaryRegisterPage() {
    const { t } = useLanguage();
    const { data: salaries, loading, upsert, refresh } = useERPData<SalaryRecord>('salary_registers');
    const { data: staff } = useERPData<Employee>('staff');
    const { upsert: upsertExpense } = useERPData<any>('expenses');
    const { data: contracts } = useERPData<any>('payroll_contracts');
    const { data: advances } = useERPData<any>('salary_advances');
    const { data: slips, upsert: upsertSlip } = useERPData<any>('salary_slips');

    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<SalaryRecord | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleOpenPayModal = (salary: SalaryRecord) => {
        setSelectedSalary(salary);
        setPaymentAmount((salary.net_pay || 0) - (salary.paid_amount || 0));
        setIsPayModalOpen(true);
    };

    const handleProcessPayment = async () => {
        if (!selectedSalary) return;

        try {
            setIsSubmitting(true);
            const newPaidAmount = (selectedSalary.paid_amount || 0) + Number(paymentAmount);
            let newStatus: SalaryRecord['status'] = 'Partial';

            if (newPaidAmount >= selectedSalary.net_pay) {
                newStatus = 'Transferred';
            } else if (newPaidAmount <= 0) {
                newStatus = 'Pending';
            }

            // 1. Update Salary Register
            await upsert({
                id: selectedSalary.id,
                paid_amount: newPaidAmount,
                status: newStatus
            });

            // 2. Record as Expense
            const emp = staff.find(s => s.id === selectedSalary.employee_id);
            await upsertExpense({
                organization_id: selectedSalary.organization_id,
                date: new Date().toISOString().split('T')[0],
                amount: Number(paymentAmount),
                category: 'Salaries',
                description: `${t('salary_payment_for')} ${emp?.full_name || t('employee')} - ${selectedSalary.month} ${selectedSalary.year}`,
                status: 'Approved'
            });

            setIsPayModalOpen(false);
            refresh();
            alert(t('payment_processed_success'));
        } catch (error) {
            console.error("Payment error:", error);
            alert(t('payment_failed'));
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleGenerateSlip = async (salary: SalaryRecord) => {
        try {
            setIsSubmitting(true);
            const contract = contracts.find((c: any) => c.staff_id === salary.employee_id);
            if (!contract) {
                alert(t('no_active_contract_error'));
                return;
            }

            // Calculate Breakdown
            const base = contract.base_salary || 0;
            const vat = base * 0.14; // Default 14% VAT as per requirement
            const insurance = contract.insurance_amount || 0;
            const transport = contract.transportation_amount || 0;

            // Calculate Advances to deduct
            const periodDate = new Date(`${salary.month} 1, ${salary.year}`);
            const applicableAdvances = advances.filter((adv: any) =>
                adv.staff_id === salary.employee_id &&
                adv.status === 'Approved' &&
                new Date(adv.repayment_start_date) <= periodDate
            );
            const advanceDeduction = applicableAdvances.reduce((sum: number, adv: any) => sum + (adv.amount || 0), 0);

            const net = base + transport - vat - insurance - advanceDeduction;

            const slipData = {
                organization_id: salary.organization_id,
                staff_id: salary.employee_id,
                month_year: `${salary.month} ${salary.year}`,
                base_salary: base,
                vat_amount: vat,
                insurance_amount: insurance,
                transportation_amount: transport,
                advances_deducted: advanceDeduction,
                net_salary: net,
                days_served: 30, // Default for now
                penalties_deducted: 0,
                breakdown: [] // Custom items could go here
            };

            await upsertSlip(slipData);

            // Update the register with the calculated net
            await upsert({
                id: salary.id,
                net_pay: net
            });

            alert(t('salary_slip_generated_success'));
            refresh();
        } catch (error) {
            console.error("Error generating slip:", error);
            alert(t('generate_slip_failed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredSalaries = salaries.filter(s => {
        const emp = staff.find(st => st.id === s.employee_id);
        const nameMatch = emp?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const monthMatch = s.month?.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || monthMatch;
    });

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/payroll/staff" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('salary_register')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('salary_register_subtitle')}</p>
                        </div>
                    </div>

                    <div className="glass flex items-center px-4 py-2 gap-3 w-80 border-border-custom bg-background">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('search_salary_register_placeholder')}
                            className="bg-transparent border-none outline-none text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <div className="glass overflow-hidden border-border-custom">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="border-b border-border-custom bg-white/5">
                                <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('employee')}</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('period')}</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500 text-right">{t('net_pay')}</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500 text-right">{t('paid')}</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500 text-right">{t('remaining')}</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('status_label')}</th>
                                <th className="p-6 text-xs font-bold uppercase text-gray-500 text-center">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-gray-500 italic">{t('syncing_register')}</td>
                                </tr>
                            ) : filteredSalaries.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-gray-500 italic">{t('no_salary_records_found')}</td>
                                </tr>
                            ) : filteredSalaries.map((salary) => {
                                const emp = staff.find(s => s.id === salary.employee_id);
                                const remaining = (salary.net_pay || 0) - (salary.paid_amount || 0);

                                return (
                                    <tr key={salary.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{emp?.full_name || t('unknown_employee')}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{emp?.role || t('staff_label')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={14} className="text-gray-500" />
                                                {salary.month} {salary.year}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right font-mono font-bold text-gray-300">
                                            {salary.net_pay?.toLocaleString()}
                                        </td>
                                        <td className="p-6 text-right font-mono font-bold text-emerald-400">
                                            {salary.paid_amount?.toLocaleString() || 0}
                                        </td>
                                        <td className="p-6 text-right font-mono font-bold text-red-400">
                                            {remaining.toLocaleString()}
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${salary.status === 'Transferred' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                salary.status === 'Partial' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                    'bg-gray-500/10 text-gray-400 border border-white/5'
                                                }`}>
                                                {salary.status === 'Transferred' && <CheckCircle2 size={10} />}
                                                {salary.status === 'Partial' && <BadgePercent size={10} />}
                                                {salary.status === 'Transferred' ? t('transferred') : salary.status === 'Partial' ? t('partial') : t('pending')}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center gap-2">
                                                {remaining > 0 ? (
                                                    <button
                                                        onClick={() => handleOpenPayModal(salary)}
                                                        className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all transform hover:scale-110"
                                                        title="Record Payment"
                                                    >
                                                        <CreditCard size={18} />
                                                    </button>
                                                ) : (
                                                    <div className="text-emerald-500"><CheckCircle2 size={24} className="mx-auto" /></div>
                                                )}

                                                <button
                                                    onClick={() => handleGenerateSlip(salary)}
                                                    className={`p-2 rounded-lg transition-all transform hover:scale-110 ${slips.some((sl: any) => sl.staff_id === salary.employee_id && sl.month_year === `${salary.month} ${salary.year}`)
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-white/5 text-gray-500 hover:text-accent hover:bg-accent/10'
                                                        }`}
                                                    title="Generate/Update Slip"
                                                >
                                                    <Calculator size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <ERPFormModal
                    isOpen={isPayModalOpen}
                    onClose={() => setIsPayModalOpen(false)}
                    title={t('process_salary_payment')}
                    onSubmit={handleProcessPayment}
                    loading={isSubmitting}
                >
                    {selectedSalary && (
                        <div className="space-y-6">
                            <div className="glass bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Outstanding</p>
                                    <p className="text-2xl font-bold text-white">
                                        {((selectedSalary.net_pay || 0) - (selectedSalary.paid_amount || 0)).toLocaleString()} <span className="text-sm font-normal text-gray-500">EGP</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t('period')}</p>
                                    <p className="font-bold text-gray-300">{selectedSalary.month} {selectedSalary.year}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Payment Amount (EGP)</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                    className="glass bg-[#111] border-border-custom p-4 rounded-xl outline-none focus:border-accent transition-all text-2xl font-bold font-mono text-center"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentAmount((selectedSalary.net_pay || 0) - (selectedSalary.paid_amount || 0))}
                                        className="text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
                                    >
                                        Full Amount
                                    </button>
                                </div>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
                                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                                <p className="text-xs text-amber-200/80 leading-relaxed">
                                    This will update the salary register and create a corresponding record in the <strong>Expenses</strong> module.
                                    {paymentAmount < ((selectedSalary.net_pay || 0) - (selectedSalary.paid_amount || 0)) ? " This will be recorded as a PARTIAL payment." : " This will be recorded as a FULL settlement."}
                                </p>
                            </div>
                        </div>
                    )}
                </ERPFormModal>
            </main>
        </div>
    );
}
