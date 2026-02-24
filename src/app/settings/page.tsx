"use client";

import React from "react";
import {
    Settings as SettingsIcon,
    Globe,
    Moon,
    Bell,
    Shield,
    Database,
    ArrowLeft,
    Check
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsPage() {
    const { t, language, toggleLanguage } = useLanguage();

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{t('settings')}</h2>
                            <p className="text-gray-400 text-sm mt-1">Configure your ERP environment and preferences</p>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl space-y-8">
                    {/* Language Settings */}
                    <section className="glass border-border-custom p-8 bg-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-accent/20 text-accent">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{t('language')}</h3>
                                <p className="text-gray-500 text-sm italic">Change the interface language (Bilingual EN/AR)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => language !== 'en' && toggleLanguage()}
                                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${language === 'en' ? 'border-accent bg-accent/10' : 'border-border-custom hover:border-accent/40 bg-white/5'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🇺🇸</span>
                                    <span className="font-bold">English (US)</span>
                                </div>
                                {language === 'en' && <Check size={18} className="text-accent" />}
                            </button>

                            <button
                                onClick={() => language !== 'ar' && toggleLanguage()}
                                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${language === 'ar' ? 'border-accent bg-accent/10' : 'border-border-custom hover:border-accent/40 bg-white/5'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🇪🇬</span>
                                    <span className="font-bold">العربية (Arabic)</span>
                                </div>
                                {language === 'ar' && <Check size={18} className="text-accent" />}
                            </button>
                        </div>
                    </section>

                    {/* Appearance */}
                    <section className="glass border-border-custom p-8 bg-white/5 opacity-60">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
                                <Moon size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Appearance</h3>
                                <p className="text-gray-500 text-sm">Theme and visual preferences (Coming Soon)</p>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 gradient-accent opacity-30" />
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="glass border-border-custom p-8 bg-white/5 opacity-60">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Notifications</h3>
                                <p className="text-gray-500 text-sm">Manage system alerts and emails (Coming Soon)</p>
                            </div>
                        </div>
                    </section>

                    {/* System & Security */}
                    <section className="glass border-border-custom p-8 bg-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">System Connection</h3>
                                <p className="text-gray-500 text-sm">Database and storage status</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <Database size={18} className="text-emerald-500" />
                                    <span className="text-sm font-bold">Supabase Real-time</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Connected</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <Database size={18} className="text-emerald-500" />
                                    <span className="text-sm font-bold">Storage Bucket</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Active</span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
