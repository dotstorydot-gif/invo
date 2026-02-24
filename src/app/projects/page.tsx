"use client";

import React, { useState } from "react";
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
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface Project {
    id: string;
    name: string;
    location: string;
    totalUnits: number;
    soldUnits: number;
    revenue: number;
}

export default function ProjectsPage() {
    const { t } = useLanguage();
    const [projects] = useState<Project[]>([
        { id: "PRJ-01", name: "Sunrise Heights", location: "New Cairo", totalUnits: 150, soldUnits: 120, revenue: 185000000 },
        { id: "PRJ-02", name: "The Crystal Plaza", location: "Zayed City", totalUnits: 80, soldUnits: 45, revenue: 120000000 },
        { id: "PRJ-03", name: "Marina Sands", location: "North Coast", totalUnits: 200, soldUnits: 180, revenue: 450000000 }
    ]);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('projects')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('projects_subtitle')}</p>
                        </div>
                    </div>

                    <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                        <Plus size={20} />
                        <span>{t('add_project')}</span>
                    </button>
                </header>

                {/* Global Project Analytics */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="glass p-6 border-accent/20 bg-accent/5">
                        <div className="flex items-center gap-3 mb-4 text-accent">
                            <Building size={20} />
                            <span className="text-sm font-bold uppercase tracking-widest">{t('total_units')}</span>
                        </div>
                        <div className="text-3xl font-bold">430</div>
                        <div className="text-xs text-gray-500 mt-1">Across 3 Construction Projects</div>
                    </div>
                    <div className="glass p-6">
                        <div className="flex items-center gap-3 mb-4 text-blue-400">
                            <PieChart size={20} />
                            <span className="text-sm font-bold uppercase tracking-widest">Occupancy Rate</span>
                        </div>
                        <div className="text-3xl font-bold">78%</div>
                        <div className="text-xs text-gray-500 mt-1">+5.2% from last construction phase</div>
                    </div>
                    <div className="glass p-6">
                        <div className="flex items-center gap-3 mb-4 text-amber-400">
                            <BarChart3 size={20} />
                            <span className="text-sm font-bold uppercase tracking-widest">Est. Project Revenue</span>
                        </div>
                        <div className="text-3xl font-bold">755M EGP</div>
                        <div className="text-xs text-gray-500 mt-1">Total projected value</div>
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
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('project_name')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Location</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{t('total_units')}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Sales Progress</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((prj) => (
                                        <tr key={prj.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-bold text-white text-lg">{prj.name}</div>
                                                <div className="text-[10px] text-accent font-mono">{prj.id}</div>
                                            </td>
                                            <td className="p-6 text-sm text-gray-400">{prj.location}</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 font-bold">
                                                    <Home size={16} className="text-gray-500" />
                                                    {prj.totalUnits}
                                                </div>
                                            </td>
                                            <td className="p-6 min-w-[200px]">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-gray-400">{prj.soldUnits} Sold</span>
                                                        <span className="text-accent">{Math.round((prj.soldUnits / prj.totalUnits) * 100)}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-accent"
                                                            style={{ width: `${(prj.soldUnits / prj.totalUnits) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-accent transition-all group/btn">
                                                    {t('view_details')}
                                                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Unassigned Project Row */}
                                    <tr className="bg-red-500/5 hover:bg-red-500/10 transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold text-red-400 flex items-center gap-2">
                                                {t('unassigned')}
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 border border-red-500/20">Action Required</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm text-gray-500">Multiple Locations</td>
                                        <td className="p-6 font-bold text-red-400">12</td>
                                        <td className="p-6 text-xs text-gray-500 italic">Units not linked to any project phase</td>
                                        <td className="p-6">
                                            <button className="text-xs font-bold text-accent hover:underline">Link Units</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
