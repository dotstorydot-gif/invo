"use client";

import React from "react";
import {
    Download,
    Zap,
    FileText,
    Image as ImageIcon,
    UserPlus,
    PlusCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { exportToCSV } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Briefcase } from "lucide-react";

export const SmartActionCenter = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const { session } = useAuth();

    const isMarketing = session?.moduleType === 'Service & Marketing';

    const handleExport = () => {
        const dummyData = [
            { id: "INV-001", client: "Sameh Kamel", amount: 15000, status: "Paid" },
            { id: "INV-002", client: "Dot Story", amount: 1150000, status: "Draft" }
        ];
        exportToCSV(dummyData, "Invoica_Dashboard_Export");
    };

    const actions = [
        { icon: PlusCircle, label: isMarketing ? "New Service" : "Create Invoice", color: "text-accent", onClick: () => router.push(isMarketing ? '/services' : '/sales/new') },
        { icon: UserPlus, label: "Add Employee", color: "text-blue-500", onClick: () => router.push('/staff') },
        { icon: FileText, label: "Upload Doc", color: "text-amber-500", onClick: () => router.push('/expenses') },
        { icon: isMarketing ? Briefcase : ImageIcon, label: isMarketing ? "Add Client Project" : "Add Photo", color: "text-purple-500", onClick: () => router.push(isMarketing ? '/projects' : '/expenses') }
    ];

    return (
        <div className="mb-8 p-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-[#050505] shadow-[0_0_15px_rgba(20,255,140,0.3)]">
                        <Zap size={20} className="fill-current" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Analysis & Quick Actions</h3>
                        <p className="text-gray-400 text-sm mt-0.5">Cross-module insights and production tools</p>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-sm font-semibold text-white"
                >
                    <Download size={16} />
                    <span>Export to CSV</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action, i) => (
                    <button
                        key={i}
                        onClick={action.onClick}
                        className="p-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/10 hover:bg-[#161616] flex flex-col items-center justify-center gap-3 transition-all group"
                    >
                        <action.icon size={26} className={`${action.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-sm font-bold text-white tracking-tight">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
