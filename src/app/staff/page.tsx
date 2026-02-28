"use client";

import React, { useState } from "react";
import {
    Users2,
    Plus,
    Search,
    Calendar,
    ArrowLeft,
    UserCircle,
    AlertTriangle,
    Umbrella,
    CreditCard
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface Employee {
    id: string;
    organization_id: string;
    full_name?: string;
    name?: string;
    role: string;
    employment_type: string;
    base_salary?: number;
    baseSalary?: number;
    daily_rate: number;
    penalties: number;
    vacations: number;
    project_id?: string;
    hire_date?: string;
    avatar_url?: string;
    email?: string;
    status?: string;
}

export default function StaffPage() {
    const { t } = useLanguage();
    const { data: employees, upsert } = useERPData<Employee>('staff');
    const { data: projects } = useERPData<{ id: string; name: string }>('projects');
    const { upsert: upsertExpense } = useERPData<{ id?: string; organization_id?: string; date: string; amount: number; category: string; description: string; status: string }>('expenses');
    const { upsert: upsertPenalty } = useERPData<{ id?: string; organization_id?: string; staff_id: string; amount: number; reason: string; date: string }>('staff_penalties');
    const { upsert: upsertVacation } = useERPData<{ id?: string; organization_id?: string; staff_id: string; start_date: string; end_date: string; total_days: number; reason: string }>('staff_vacations');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
    const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
    const [payDays, setPayDays] = useState(1);

    const [penaltyFormData, setPenaltyFormData] = useState({
        amount: 0,
        reason: ''
    });

    const [vacationFormData, setVacationFormData] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: ''
    });

    const [formData, setFormData] = useState({
        full_name: '',
        role: 'Consultant',
        employment_type: 'Full Time',
        base_salary: 0,
        daily_rate: 0,
        email: '',
        status: 'Active',
        project_id: '',
        hire_date: new Date().toISOString().split('T')[0],
        avatar_url: ''
    });

    const avatarOptions = [
        // Professional
        { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", label: "Prof 1" },
        { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anita", label: "Prof 2" },
        { url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", label: "Prof 3" },
        // Funny
        { url: "https://api.dicebear.com/7.x/big-smile/svg?seed=Bubba", label: "Funny 1" },
        { url: "https://api.dicebear.com/7.x/big-smile/svg?seed=Scoot", label: "Funny 2" },
        { url: "https://api.dicebear.com/7.x/bottts/svg?seed=Rob", label: "Robot" },
    ];

    const handleSaveStaff = async () => {
        try {
            setIsSubmitting(true);
            const result = await upsert({
                ...(editingId ? { id: editingId } : {}),
                full_name: formData.full_name,
                role: formData.role,
                employment_type: formData.employment_type,
                base_salary: Number(formData.base_salary),
                daily_rate: Number(formData.daily_rate),
                email: formData.email,
                status: formData.status,
                project_id: formData.project_id || undefined,
                hire_date: formData.hire_date,
                avatar_url: formData.avatar_url,
                email: formData.email,
                status: formData.status
            });

            if (result) {
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({
                    full_name: '',
                    role: 'Consultant',
                    employment_type: 'Full Time',
                    base_salary: 0,
                    daily_rate: 0,
                    email: '',
                    status: 'Active',
                    project_id: '',
                    hire_date: new Date().toISOString().split('T')[0],
                    avatar_url: ''
                });
                alert("Employee saved successfully.");
            }
        } catch (error: unknown) {
            console.error("Error adding staff:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            alert("Failed to add staff member: " + message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditStaff = (emp: Employee) => {
        setEditingId(emp.id);
        setFormData({
            full_name: emp.full_name || emp.name || '',
            role: emp.role || 'Consultant',
            employment_type: emp.employment_type || 'Full Time',
            base_salary: emp.base_salary || emp.baseSalary || 0,
            daily_rate: emp.daily_rate || 0,
            email: emp.email || '',
            status: emp.status || 'Active',
            project_id: emp.project_id || '',
            hire_date: emp.hire_date || new Date().toISOString().split('T')[0],
            avatar_url: emp.avatar_url || ''
        });
        setIsModalOpen(true);
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

    const handleSavePenalty = async () => {
        if (!selectedEmp) return;
        try {
            setIsSubmitting(true);
            // 1. Save penalty log
            await upsertPenalty({
                organization_id: selectedEmp.organization_id,
                staff_id: selectedEmp.id,
                amount: Number(penaltyFormData.amount),
                reason: penaltyFormData.reason,
                date: new Date().toISOString().split('T')[0]
            });

            // 2. Update staff cumulative penalties
            await upsert({
                id: selectedEmp.id,
                penalties: (selectedEmp.penalties || 0) + Number(penaltyFormData.amount)
            });

            setIsPenaltyModalOpen(false);
            setPenaltyFormData({ amount: 0, reason: '' });
            setSelectedEmp(null);
            alert("Penalty added successfully.");
        } catch (error) {
            console.error(error);
            alert("Failed to add penalty.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveVacation = async () => {
        if (!selectedEmp) return;
        try {
            setIsSubmitting(true);
            const start = new Date(vacationFormData.start_date);
            const end = new Date(vacationFormData.end_date);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            // 1. Save vacation log
            await upsertVacation({
                organization_id: selectedEmp.organization_id,
                staff_id: selectedEmp.id,
                start_date: vacationFormData.start_date,
                end_date: vacationFormData.end_date,
                total_days: diffDays,
                reason: vacationFormData.reason
            });

            // 2. Update staff cumulative vacations
            await upsert({
                id: selectedEmp.id,
                vacations: (selectedEmp.vacations || 0) + diffDays
            });

            setIsVacationModalOpen(false);
            setVacationFormData({
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
                reason: ''
            });
            setSelectedEmp(null);
            alert("Vacation recorded successfully.");
        } catch (error) {
            console.error(error);
            alert("Failed to record vacation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateNet = (emp: Employee) => (emp.base_salary || emp.baseSalary || 0) - (emp.penalties || 0);

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
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                full_name: '', role: t('consultant'), employment_type: t('full_time'),
                                base_salary: 0, daily_rate: 0, email: '', status: t('active'),
                                project_id: '', hire_date: new Date().toISOString().split('T')[0],
                                avatar_url: ''
                            });
                            setIsModalOpen(true);
                        }}
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
                                <h3 className="text-xl font-bold">{t('team_members_payroll')}</h3>
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
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('employee')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('salary_base')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('penalties')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('vacations')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('salary_net')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                            <td className="p-6 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent overflow-hidden shrink-0">
                                                    {emp.avatar_url ? (
                                                        <img src={emp.avatar_url} alt={emp.full_name || emp.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircle size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white flex gap-2 items-center">
                                                        {emp.full_name || emp.name}
                                                        {emp.project_id && projects.find((p: { id: string, name: string }) => p.id === emp.project_id) && (
                                                            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                                                                {projects.find((p: { id: string, name: string }) => p.id === emp.project_id)?.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter flex items-center gap-2">
                                                        <span>{emp.role}</span>
                                                        <span className={`px-1.5 py-0.5 rounded ${emp.employment_type === 'Daily' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>{emp.employment_type === 'Daily' ? t('daily') : t('full_time')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm font-medium">
                                                {emp.employment_type === 'Daily'
                                                    ? <span className="text-amber-500 font-bold">{(emp.daily_rate || 0).toLocaleString()} EGP <span className="text-[10px] text-gray-500 font-normal">/ {t('day_label')}</span></span>
                                                    : <span>{(emp.base_salary || emp.baseSalary || 0).toLocaleString()} EGP <span className="text-[10px] text-gray-500 font-normal">/ {t('mo_label')}</span></span>
                                                }
                                            </td>
                                            <td className="p-6 text-sm text-red-400">-{(emp.penalties || 0).toLocaleString()} EGP</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full w-fit">
                                                    <Umbrella size={12} />
                                                    {emp.vacations} {t('days_unit')}
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
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEmp(emp);
                                                            setPenaltyFormData({ amount: 0, reason: '' });
                                                            setIsPenaltyModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-400 transition-all"
                                                        title={t('add_penalty')}
                                                    >
                                                        <AlertTriangle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEmp(emp);
                                                            setVacationFormData({
                                                                start_date: new Date().toISOString().split('T')[0],
                                                                end_date: new Date().toISOString().split('T')[0],
                                                                reason: ''
                                                            });
                                                            setIsVacationModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-blue-400 transition-all"
                                                        title={t('add_vacation')}
                                                    >
                                                        <Calendar size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEmp(emp);
                                                            setPayDays(1);
                                                            setIsPayModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-emerald-400 transition-all"
                                                        title={t('pay_salary')}
                                                    >
                                                        <CreditCard size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditStaff(emp)}
                                                        className="p-2 text-gray-400 hover:text-white transition-all title='Edit Employee'"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
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
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingId(null);
                    }}
                    title={editingId ? t('edit_employee') : t('add_employee')}
                    onSubmit={handleSaveStaff}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('full_name')}</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder={t('employee_name')}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('email')}</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder={t('email_placeholder')}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('role_label')}</label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder={t('role_placeholder')}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('employment_type')}</label>
                            <select
                                value={formData.employment_type}
                                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Full Time">{t('full_time')}</option>
                                <option value="Part Time">{t('part_time')}</option>
                                <option value="Temporary">{t('temporary')}</option>
                                <option value="Daily">{t('daily')}</option>
                            </select>
                        </div>
                        {formData.employment_type === 'Daily' ? (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('daily_rate_label')}</label>
                                <input
                                    type="number"
                                    value={formData.daily_rate}
                                    onChange={(e) => setFormData({ ...formData, daily_rate: Number(e.target.value) })}
                                    className="glass bg-amber-500/5 border-amber-500/20 p-3 rounded-xl outline-none focus:border-amber-500 transition-all text-sm"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t('salary_base')} (EGP)</label>
                                <input
                                    type="number"
                                    value={formData.base_salary}
                                    onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('assigned_project')}</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">{t('none_general')}</option>
                                {projects.map((p: { id: string, name: string }) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('select_avatar')}</label>
                            <div className="flex flex-wrap gap-3 p-4 glass bg-white/5 border-border-custom rounded-xl">
                                {avatarOptions.map((opt) => (
                                    <button
                                        key={opt.url}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, avatar_url: opt.url })}
                                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${formData.avatar_url === opt.url ? 'border-accent scale-110 shadow-lg' : 'border-transparent hover:border-white/20'}`}
                                        title={opt.label}
                                    >
                                        <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t('hire_date_label')}</label>
                            <input
                                type="date"
                                value={formData.hire_date}
                                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm [color-scheme:dark]"
                            />
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

                {/* Penalty Modal */}
                <ERPFormModal
                    isOpen={isPenaltyModalOpen}
                    onClose={() => setIsPenaltyModalOpen(false)}
                    title={selectedEmp ? `Add Penalty: ${selectedEmp.full_name || selectedEmp.name}` : 'Add Penalty'}
                    onSubmit={handleSavePenalty}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Penalty Amount (EGP)</label>
                            <input
                                type="number"
                                value={penaltyFormData.amount}
                                onChange={(e) => setPenaltyFormData({ ...penaltyFormData, amount: Number(e.target.value) })}
                                className="glass bg-red-500/5 border-red-500/20 p-4 rounded-xl outline-none focus:border-red-500 transition-all text-2xl font-bold font-mono text-center shadow-inner"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Reason</label>
                            <textarea
                                value={penaltyFormData.reason}
                                onChange={(e) => setPenaltyFormData({ ...penaltyFormData, reason: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-24"
                                placeholder="e.g. Late for work, Misconduct"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 italic">This amount will be automatically subtracted from the next salary payment.</p>
                    </div>
                </ERPFormModal>

                {/* Vacation Modal */}
                <ERPFormModal
                    isOpen={isVacationModalOpen}
                    onClose={() => setIsVacationModalOpen(false)}
                    title={selectedEmp ? `Record Vacation: ${selectedEmp.full_name || selectedEmp.name}` : 'Record Vacation'}
                    onSubmit={handleSaveVacation}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                                <input
                                    type="date"
                                    value={vacationFormData.start_date}
                                    onChange={(e) => setVacationFormData({ ...vacationFormData, start_date: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm [color-scheme:dark]"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                                <input
                                    type="date"
                                    value={vacationFormData.end_date}
                                    onChange={(e) => setVacationFormData({ ...vacationFormData, end_date: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm [color-scheme:dark]"
                                />
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                            <div className="text-xs text-blue-400 font-bold uppercase mb-1">Total Vacation Days</div>
                            <div className="text-3xl font-bold text-white">
                                {(() => {
                                    const start = new Date(vacationFormData.start_date);
                                    const end = new Date(vacationFormData.end_date);
                                    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
                                    const diffTime = Math.abs(end.getTime() - start.getTime());
                                    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                })()} Days
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Reason / Notes</label>
                            <textarea
                                value={vacationFormData.reason}
                                onChange={(e) => setVacationFormData({ ...vacationFormData, reason: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-24"
                                placeholder="e.g. Annual Leave, Family Event"
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
