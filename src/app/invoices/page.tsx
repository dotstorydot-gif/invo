"use client";

import React, { useRef } from "react";
import {
    FileText,
    Plus,
    Search,
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Upload
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { uploadFile } from "@/lib/storage";

const InvoiceRow = ({ id, client, date, amount, status }: { id: string, client: string, date: string, amount: string, status: 'Paid' | 'Pending' | 'Draft' }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const statusIcons = {
        Paid: <CheckCircle2 size={16} className="text-emerald-400" />,
        Pending: <Clock size={16} className="text-blue-400" />,
        Draft: <AlertCircle size={16} className="text-gray-400" />
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            try {
                await uploadFile('documents', `invoices/${id}/${file.name}`, file);
                alert(t('upload_success'));
            } catch (err) {
                console.error(err);
                alert(t('upload_error'));
            }
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 glass-hover border-b border-border-custom last:border-0 transition-all group">
            <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                <FileText size={20} />
            </div>
            <div className="flex-1">
                <div className="text-sm font-bold">{id}</div>
                <div className="text-xs text-gray-400">{client}</div>
            </div>
            <div className="text-right px-4 text-xs font-mono">
                <div className="text-sm font-bold">{amount}</div>
                <div className="text-[10px] text-gray-500 uppercase">{date}</div>
            </div>
            <div className="w-24 flex items-center gap-2 px-3 py-1 rounded-full border border-border-custom bg-white/5">
                {statusIcons[status]}
                <span className="text-[10px] font-bold uppercase tracking-wider">{t(status.toLowerCase())}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:text-accent transition-colors"
                >
                    <Upload size={18} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                <button className="p-2 hover:text-accent transition-colors">
                    <Download size={18} />
                </button>
            </div>
        </div>
    );
};

export default function InvoicesPage() {
    const { t } = useLanguage();

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('invoices_title')}</h2>
                            <p className="text-gray-400 text-sm mt-1">{t('invoices_subtitle')}</p>
                        </div>
                    </div>

                    <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                        <Plus size={20} />
                        <span>{t('create_invoice')}</span>
                    </button>
                </header>

                <div className="glass p-8 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">{t('latest_transactions')}</h3>
                        <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom">
                            <Search size={16} className="text-gray-400" />
                            <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-xs w-full" />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <InvoiceRow id="#DRAFT-1" client="عميل #1 (Audit Placeholder)" date="19 Oct 2025" amount="1,150,000 EGP" status="Draft" />
                        <InvoiceRow id="#INV-882" client="Main Branch Office" date="24 Feb 2026" amount="15,000 EGP" status="Paid" />
                        <InvoiceRow id="#INV-881" client="POS Client" date="22 Feb 2026" amount="2,500 EGP" status="Pending" />
                    </div>
                </div>
            </main>
        </div>
    );
}
