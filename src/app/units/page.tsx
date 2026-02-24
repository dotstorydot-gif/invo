"use client";

import React, { useState } from "react";
import {
    Plus,
    Search,
    Home,
    MapPin,
    ArrowLeft,
    User,
    CreditCard,
    Building,
    Bed,
    CheckCircle2,
    XCircle,
    ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";

interface Unit {
    id: string;
    name: string;
    type: string;
    price: number;
    pricePerMeter: number;
    rooms: number;
    isFinished: boolean;
    facilities: string[];
    status: 'Available' | 'Sold' | 'Installments';
    consumer?: string;
    paidAmount?: number;
    project?: string;
    photos: string[];
    salesperson?: string;
    commission?: number;
}

export default function UnitsPage() {
    const { t } = useLanguage();
    const { data: units, loading } = useERPData<Unit>('units');

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('units_title')}</h2>
                            <p className="text-gray-400 text-sm mt-1">Property Inventory & Detailed Specifications</p>
                        </div>
                    </div>

                    <button className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                        <Plus size={20} />
                        <span>{t('add_unit')}</span>
                    </button>
                </header>
                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                    </div>
                )}

                {/* Units Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {units.map((unit) => (
                            <motion.div
                                key={unit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass overflow-hidden border-border-custom flex flex-col group hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all"
                            >
                                {/* Unit Header / Ribbon */}
                                <div className="flex justify-between items-center p-6 border-b border-border-custom bg-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-accent/20 text-accent">
                                            <Home size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{unit.name}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                                <MapPin size={10} /> {unit.type} | ID: {unit.id}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${unit.status === 'Available' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                                            unit.status === 'Installments' ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' :
                                                'text-amber-400 border-amber-400/20 bg-amber-400/5'
                                            }`}>
                                            {unit.status}
                                        </span>
                                        {unit.project && (
                                            <div className="flex items-center gap-1 text-[9px] text-accent font-bold">
                                                <Building size={10} /> {unit.project}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Technical Specifications Grid */}
                                <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-border-custom">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] uppercase text-gray-500 font-bold">{t('price_per_meter')}</span>
                                        <span className="text-sm font-bold">{unit.pricePerMeter.toLocaleString()} EGP</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] uppercase text-gray-500 font-bold">{t('rooms')}</span>
                                        <div className="flex items-center gap-1 text-sm font-bold">
                                            <Bed size={14} className="text-gray-400" /> {unit.rooms}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] uppercase text-gray-500 font-bold">Finish Status</span>
                                        <div className={`flex items-center gap-1 text-sm font-bold ${unit.isFinished ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {unit.isFinished ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                            {unit.isFinished ? t('finished') : t('unfinished')}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] uppercase text-gray-500 font-bold">Photos</span>
                                        <div className="flex items-center gap-1 text-sm font-bold text-blue-400">
                                            <ImageIcon size={14} /> {unit.photos.length}
                                        </div>
                                    </div>
                                </div>

                                {/* Facilities Chips */}
                                <div className="px-6 py-4 flex flex-wrap gap-2 border-b border-border-custom">
                                    {unit.facilities.map((fac, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-gray-400">
                                            {fac}
                                        </span>
                                    ))}
                                </div>

                                {/* Payment Info */}
                                {unit.consumer && (
                                    <div className="p-6 bg-white/5 space-y-4">
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <User size={14} /> <span>{t('consumer_name')}</span>
                                            </div>
                                            <span className="font-bold">{unit.consumer}</span>
                                        </div>
                                        {unit.status === 'Installments' && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[9px] font-bold">
                                                    <span className="text-gray-500 uppercase tracking-tighter text-[8px]">Installment Progress</span>
                                                    <span className="text-accent">{Math.round((unit.paidAmount || 0) / unit.price * 100)}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                        style={{ width: `${(unit.paidAmount || 0) / unit.price * 100}%` }}
                                                    />
                                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">
                                                            {unit.salesperson?.[0] || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-gray-500 font-bold uppercase">{t('salesperson')}</div>
                                                            <div className="text-xs font-bold">{unit.salesperson || 'Unassigned'}</div>
                                                        </div>
                                                        {unit.commission && (
                                                            <div className="ml-auto text-right">
                                                                <div className="text-[10px] text-gray-500 font-bold uppercase">{t('commissions')}</div>
                                                                <div className="text-xs font-bold text-emerald-400">{unit.commission.toLocaleString()} EGP</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Footer / Actions */}
                                <div className="p-6 mt-auto flex items-center justify-between border-t border-border-custom bg-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-500 uppercase font-bold">{t('total_price')}</span>
                                        <span className="text-xl font-bold text-accent">{unit.price.toLocaleString()} EGP</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="glass-hover p-2 rounded-lg border border-border-custom text-gray-400 hover:text-accent transition-all">
                                            <ImageIcon size={18} />
                                        </button>
                                        <button className="glass-hover p-2 rounded-lg border border-border-custom text-gray-400 hover:text-accent transition-all">
                                            <CreditCard size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
