"use client";

import React from "react";
import {
    Building,
    Plus,
    Search,
    ArrowLeft,
    BarChart3,
    Home,
    PieChart,
    LayoutGrid,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, Boxes } from "lucide-react";
import ERPFormModal from "@/components/ERPFormModal";
import { useState } from "react";

interface Project {
    id: string;
    name: string;
    location: string;
    totalUnits: number;
    soldUnits: number;
    revenue: number;
    description?: string;
}

interface Unit {
    id: string;
    name: string;
    status: string;
    price: number;
    project_id: string;
}

export default function ProjectsPage() {
    const { t } = useLanguage();
    const { session } = useAuth();
    const { data: projects, upsert: upsertProject } = useERPData<Project>('projects');
    const { data: units } = useERPData<Unit>('units');
    const { data: services } = useERPData<any>('services');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: ''
    });

    const isMarketing = session?.moduleType === 'Service & Marketing';

    const handleAddProject = async () => {
        try {
            setIsSubmitting(true);
            await upsertProject({
                name: formData.name,
                location: formData.location,
                description: formData.description
            });
            setIsModalOpen(false);
            setFormData({ name: '', location: '', description: '' });
        } catch (error) {
            console.error("Error adding project:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{isMarketing ? "Client Projects" : t('projects')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{isMarketing ? "Manage marketing campaigns and service groups" : t('projects_subtitle')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{isMarketing ? "New Project" : t('add_project')}</span>
                    </button>
                </header>

                {/* Global Project Analytics */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="glass p-6 border-accent/20 bg-accent/5">
                        <div className="flex items-center gap-3 mb-4 text-accent">
                            {isMarketing ? <Briefcase size={20} /> : <Building size={20} />}
                            <span className="text-sm font-bold uppercase tracking-widest">{isMarketing ? "Total Services" : t('total_units')}</span>
                        </div>
                        <div className="text-3xl font-bold">{isMarketing ? services.length : units.length}</div>
                        <div className="text-xs text-gray-500 mt-1">{isMarketing ? `Across ${projects.length} Active Accounts` : `Across ${projects.length} Construction Projects`}</div>
                    </div>
                    <div className="glass p-6">
                        <div className="flex items-center gap-3 mb-4 text-blue-400">
                            {isMarketing ? <Boxes size={20} /> : <PieChart size={20} />}
                            <span className="text-sm font-bold uppercase tracking-widest">{isMarketing ? "Fulfillment Rate" : "Occupancy Rate"}</span>
                        </div>
                        <div className="text-3xl font-bold">
                            {isMarketing ? "94%" : (units.length > 0 ? Math.round((units.filter((u: Unit) => u.status === 'Occupied' || u.status === 'Sold').length / units.length) * 100) : 0)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{isMarketing ? "Service delivery performance" : "Based on sold/occupied units"}</div>
                    </div>
                    <div className="glass p-6">
                        <div className="flex items-center gap-3 mb-4 text-amber-400">
                            <BarChart3 size={20} />
                            <span className="text-sm font-bold uppercase tracking-widest">{isMarketing ? "Contract Value" : "Est. Project Revenue"}</span>
                        </div>
                        <div className="text-3xl font-bold">
                            {((isMarketing ? 2.4 : units.reduce((sum: number, u: Unit) => sum + (Number(u.price) || 0), 0) / 1000000)).toFixed(1)}M EGP
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{isMarketing ? "Projected service revenue" : "Total unit asset value"}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="glass border-border-custom">
                        <div className="p-6 border-b border-border-custom flex justify-between items-center">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <LayoutGrid className="text-accent" size={24} />
                                Project Inventory
                            </h3>
                            <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                                <Search size={18} className="text-gray-400" />
                                <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-sm w-full" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5">
                                    <tr className="border-b border-border-custom">
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{isMarketing ? "Account Name" : t('project_name')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{isMarketing ? "Account Manager" : "Location"}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{isMarketing ? "Linked Services" : t('total_units')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{isMarketing ? "Campaign Status" : "Sales Progress"}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((prj: Project) => {
                                        const projectUnits = units.filter((u: Unit) => u.project_id === prj.id);
                                        const totalUnits = projectUnits.length;
                                        const soldUnits = projectUnits.filter((u: Unit) => u.status === 'Sold' || u.status === 'Installments').length;
                                        const progress = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;

                                        return (
                                            <tr key={prj.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                                <td className="p-6">
                                                    <div className="font-bold text-white text-lg">{prj.name}</div>
                                                    <div className="text-[10px] text-accent font-mono">{prj.id?.slice(0, 8)}</div>
                                                </td>
                                                <td className="p-6 text-sm text-gray-400">{prj.location || 'N/A'}</td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2 font-bold">
                                                        <Home size={16} className="text-gray-500" />
                                                        {totalUnits}
                                                    </div>
                                                </td>
                                                <td className="p-6 min-w-[200px]">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-[10px] font-bold">
                                                            <span className="text-gray-400">{soldUnits} Sold</span>
                                                            <span className="text-accent">{progress}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-accent"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <Link href={`/units?project=${prj.name}`} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-accent transition-all group/btn">
                                                        {t('view_details')}
                                                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Unassigned Project Row */}
                                    {units.filter((u: Unit) => !u.project_id).length > 0 && (
                                        <tr className="bg-red-500/5 hover:bg-red-500/10 transition-colors">
                                            <td className="p-6">
                                                <div className="font-bold text-red-400 flex items-center gap-2">
                                                    {t('unassigned')}
                                                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 border border-red-500/20">Action Required</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm text-gray-500">Multiple Locations</td>
                                            <td className="p-6 font-bold text-red-400">{units.filter((u: Unit) => !u.project_id).length}</td>
                                            <td className="p-6 text-xs text-gray-500 italic">Units not linked to any project phase</td>
                                            <td className="p-6">
                                                <Link href="/units?project=unassigned" className="text-xs font-bold text-accent hover:underline">Link Units</Link>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isMarketing ? "New Project" : t('add_project')}
                    onSubmit={handleAddProject}
                    loading={isSubmitting}
                >
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{isMarketing ? "Project / Account Name" : "Project Name"}</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder={isMarketing ? "e.g. Social Media Campaign Q1" : "e.g. Sunrise Heights"}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{isMarketing ? "Account Manager" : "Location"}</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder={isMarketing ? "e.g. John Doe" : "e.g. New Cairo"}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Brief Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-32"
                                placeholder="Details about the project or campaign..."
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
