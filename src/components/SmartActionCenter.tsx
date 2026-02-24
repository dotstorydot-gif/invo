"use client";

import React from "react";
import {
    Download,
    Zap,
    Search,
    ArrowUpRight,
    FileText,
    Image as ImageIcon,
    UserPlus,
    PlusCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { exportToCSV } from "@/lib/storage";

export const SmartActionCenter = () => {
    const { t } = useLanguage();

    const handleExport = () => {
        const dummyData = [
            { id: "INV-001", client: "Sameh Kamel", amount: 15000, status: "Paid" },
            { id: "INV-002", client: "Dot Story", amount: 1150000, status: "Draft" }
        ];
        exportToCSV(dummyData, "Invoica_Dashboard_Export");
    };

    return (
        <div className="glass p-6 border-accent/20 bg-accent/5 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{t('analysis')} & {t('quick_actions')}</h3>
                        <p className="text-gray-400 text-xs mt-1">Cross-module insights and production tools</p>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-border-custom hover:border-accent hover:text-accent transition-all text-sm font-bold"
                >
                    <Download size={18} />
                    <span>{t('export_csv')}</span>
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { icon: PlusCircle, label: t('create_invoice'), color: "text-emerald-400" },
                    { icon: UserPlus, label: t('add_employee'), color: "text-blue-400" },
                    { icon: FileText, label: t('upload_doc'), color: "text-amber-400" },
                    { icon: ImageIcon, label: t('add_photo'), color: "text-purple-400" }
                ].map((action, i) => (
                    <button key={i} className="glass p-4 flex flex-col items-center gap-3 glass-hover border-border-custom transition-all">
                        <action.icon size={24} className={action.color} />
                        <span className="text-xs font-bold text-gray-300">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
