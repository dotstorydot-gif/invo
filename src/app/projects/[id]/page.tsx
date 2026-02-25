"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
    ArrowLeft, Calendar, Building, Briefcase,
    CheckSquare, Clock, Users, CreditCard, Receipt, Target
} from "lucide-react";
import Link from "next/link";
import { useERPData } from "@/hooks/useERPData";
import { useAuth } from "@/context/AuthContext";

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.id as string;
    const { session } = useAuth();

    const isMarketing = session?.moduleType === 'Service & Marketing';

    const { data: projects, loading: pLoad } = useERPData<any>('projects');
    const { data: units, loading: uLoad } = useERPData<any>('units');
    const { data: services, loading: svLoad } = useERPData<any>('services');
    const { data: staff, loading: stLoad } = useERPData<any>('staff');
    const { data: tasks, loading: tkLoad } = useERPData<any>('tasks');
    const { data: installments, loading: inLoad } = useERPData<any>('installments');
    const { data: expenses, loading: exLoad } = useERPData<any>('expenses');

    // Clients
    const { data: clients } = useERPData<any>('customers');
    const { data: clientProjects } = useERPData<any>('client_projects');

    const loading = pLoad || uLoad || svLoad || stLoad || tkLoad || inLoad || exLoad;

    const project = projects.find((p: any) => p.id === projectId);

    const [activeTab, setActiveTab] = useState('Overview');

    if (!projectId || (!loading && !project)) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
                    <Link href="/projects" className="text-accent hover:underline">Return to Projects</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    // Related data logic
    const relatedServices = services.filter((s: any) => s.project_id === projectId);
    const relatedUnits = units.filter((u: any) => u.project_id === projectId);
    const relatedStaff = staff.filter((s: any) => s.project_id === projectId);
    const relatedTasks = tasks.filter((t: any) => t.project_id === projectId);

    // Client logic
    const linkedClientIds = clientProjects.filter((cp: any) => cp.project_id === projectId).map((cp: any) => cp.client_id);
    const relatedClients = clients.filter((c: any) => linkedClientIds.includes(c.id));

    // Financial calculations
    const relatedInstallments = installments.filter((i: any) => {
        // Link via unit or directly if we ever added project_id to installments
        return relatedUnits.some((u: any) => u.id === i.unit_id) || i.project_id === projectId;
    });

    // Just a placeholder for expenses linked to project - assuming expenses map via staff or explicitly 
    const relatedExpenses = expenses; // For a full system, we might need a project_id on expenses.

    const totalIncome = relatedInstallments.filter((i: any) => i.status === 'Paid').reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    const tabs = [
        { id: 'Overview', icon: Target },
        { id: isMarketing ? 'Services' : 'Units', icon: isMarketing ? Briefcase : Building },
        { id: 'Clients', icon: Users },
        { id: 'Staff', icon: Users },
        { id: 'Tasks', icon: CheckSquare },
        { id: 'Financials', icon: CreditCard },
    ];

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header elements */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/projects" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{project.name}</h2>
                            <p className="text-gray-400 text-sm mt-1">{project.location || 'No location set'}</p>
                        </div>
                    </div>
                </header>

                <div className="flex border-b border-border-custom mb-8 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-accent border-accent bg-accent/5'
                                    : 'text-gray-500 border-transparent hover:text-gray-300'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.id}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'Overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="glass p-6 md:col-span-2 flex flex-col gap-4">
                                <h3 className="text-xl font-bold">Project Overview</h3>
                                <p className="text-gray-400">{project.description || 'No description provided.'}</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-border-custom pt-6">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Billing Cycle</div>
                                        <div className="text-white font-bold">{project.billing_cycle || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Payment Terms</div>
                                        <div className="text-white font-bold">{project.payment_terms || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Start Date</div>
                                        <div className="text-white flex items-center gap-2">
                                            <Calendar size={14} className="text-accent" />
                                            {project.start_date || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Target End</div>
                                        <div className="text-white flex items-center gap-2">
                                            <Calendar size={14} className="text-red-400" />
                                            {project.end_date || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass p-6 flex flex-col gap-4">
                                <h3 className="text-xl font-bold">Quick KPIs</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-border-custom">
                                        <span className="text-gray-400 text-sm">Total Revenue (Paid)</span>
                                        <span className="font-bold text-accent">{totalIncome.toLocaleString()} EGP</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-border-custom">
                                        <span className="text-gray-400 text-sm">Active Tasks</span>
                                        <span className="font-bold text-white">{relatedTasks.filter((t: any) => t.status !== 'Done').length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-border-custom">
                                        <span className="text-gray-400 text-sm">Staff Assigned</span>
                                        <span className="font-bold text-white">{relatedStaff.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CLIENTS TAB */}
                    {activeTab === 'Clients' && (
                        <div className="glass p-6">
                            <h3 className="text-xl font-bold mb-6">Linked Clients</h3>
                            {relatedClients.length === 0 ? (
                                <p className="text-gray-500 italic">No clients linked to this project.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {relatedClients.map((c: any) => (
                                        <div key={c.id} className="p-4 bg-white/5 border border-border-custom rounded-xl flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-lg">{c.name}</div>
                                                <div className="text-xs text-gray-500">{c.email} | {c.phone}</div>
                                            </div>
                                            <Link href={`/invoices?clientId=${c.id}`} className="text-accent text-sm font-bold hover:underline">
                                                View Invoices
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SERVICES / UNITS TAB */}
                    {(activeTab === 'Services' || activeTab === 'Units') && (
                        <div className="glass p-6">
                            <h3 className="text-xl font-bold mb-6">Linked {activeTab}</h3>
                            {isMarketing ? (
                                relatedServices.length === 0 ? <p className="text-gray-500 italic">No services linked to this project.</p> : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {relatedServices.map((s: any) => (
                                            <div key={s.id} className="p-4 bg-white/5 border border-border-custom rounded-xl">
                                                <div className="font-bold text-lg">{s.name}</div>
                                                <div className="text-accent font-bold mt-2">{s.price.toLocaleString()} EGP</div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                relatedUnits.length === 0 ? <p className="text-gray-500 italic">No units linked to this project.</p> : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {relatedUnits.map((u: any) => (
                                            <div key={u.id} className="p-4 bg-white/5 border border-border-custom rounded-xl">
                                                <div className="font-bold text-lg">{u.name}</div>
                                                <div className="text-sm text-gray-500">Status: {u.status}</div>
                                                <div className="text-accent font-bold mt-2">{u.price.toLocaleString()} EGP</div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* STAFF TAB */}
                    {activeTab === 'Staff' && (
                        <div className="glass p-6">
                            <h3 className="text-xl font-bold mb-6">Assigned Staff members</h3>
                            {relatedStaff.length === 0 ? (
                                <p className="text-gray-500 italic">No staff mapped exclusively to this project.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {relatedStaff.map((s: any) => (
                                        <div key={s.id} className="p-4 bg-white/5 border border-border-custom rounded-xl flex items-center gap-4">
                                            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold">{s.full_name || s.name}</div>
                                                <div className="text-xs text-gray-500">{s.role}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TASKS TAB */}
                    {activeTab === 'Tasks' && (
                        <div className="glass p-6">
                            <h3 className="text-xl font-bold mb-6">Project Tasks</h3>
                            {relatedTasks.length === 0 ? (
                                <p className="text-gray-500 italic">No tasks mapped to this project yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {relatedTasks.map((t: any) => {
                                        const assignee = staff.find((s: any) => s.id === t.assignee_id);
                                        return (
                                            <div key={t.id} className="p-4 bg-white/5 border border-border-custom rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-bold">{t.title}</div>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.status === 'Done' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            t.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {t.status}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-2">
                                                    <Users size={12} />
                                                    {assignee ? assignee.full_name : 'Unassigned'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* FINANCIALS TAB */}
                    {activeTab === 'Financials' && (
                        <div className="glass p-6">
                            <h3 className="text-xl font-bold mb-6">Project Financials</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-400">
                                        <Receipt size={18} /> Incomes / Installments
                                    </h4>
                                    {relatedInstallments.length === 0 ? (
                                        <p className="text-gray-500 italic text-sm">No linked incomes.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {relatedInstallments.map((i: any) => (
                                                <div key={i.id} className="flex justify-between p-3 bg-white/5 rounded border border-border-custom">
                                                    <div>
                                                        <div className="font-bold text-sm">Installment #{i.installment_number}</div>
                                                        <div className="text-xs text-gray-500">{i.due_date}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-emerald-400">{Number(i.amount).toLocaleString()} EGP</div>
                                                        <div className="text-[10px] text-gray-400 uppercase">{i.status}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400">
                                        <CreditCard size={18} /> Direct Expenses (Demo)
                                    </h4>
                                    <p className="text-gray-500 italic text-sm mb-4">
                                        Total project cost/expenses would aggregate here in a production environment mapping `project_id` on expenses.
                                    </p>
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                        <div className="text-xs text-red-300 font-bold uppercase tracking-widest mb-1">Estimated Cost</div>
                                        <div className="text-2xl font-bold text-red-400">
                                            {/* Fake calculation based on staff salary for demo purposes if no expenses exist */}
                                            {(relatedStaff.reduce((sum: number, s: any) => sum + (Number(s.base_salary) || 0), 0)).toLocaleString()} EGP
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
