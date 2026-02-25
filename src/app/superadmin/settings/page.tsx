'use client';

import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Globe, AlertTriangle, Save, Loader2 } from 'lucide-react';

export default function SuperadminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        globalAnnouncement: '',
        registrationEnabled: true,
        trialDays: 14,
        supportEmail: 'support@invoica.ai'
    });

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API save
        await new Promise(r => setTimeout(r, 1000));
        setIsSaving(false);
        alert("Global settings updated successfully!");
    };

    return (
        <div className="p-8 overflow-y-auto w-full h-full bg-[#050505]">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Platform Settings</h1>
                    <p className="text-gray-400 mt-2">Adjust global parameters affecting all SaaS tenants and system behavior.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* System Status */}
                    <section className="glass p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-accent/20 text-accent">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">System Control</h3>
                                <p className="text-gray-500 text-sm">Critical switches for platform availability.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                                <div>
                                    <h4 className="font-bold text-white">Maintenance Mode</h4>
                                    <p className="text-xs text-gray-500">Redirect all non-admin users to a maintenance page.</p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                    className={`w-14 h-7 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                                <div>
                                    <h4 className="font-bold text-white">Public Registration</h4>
                                    <p className="text-xs text-gray-500">Allow new organizations to sign up from the landing page.</p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, registrationEnabled: !settings.registrationEnabled })}
                                    className={`w-14 h-7 rounded-full transition-all relative ${settings.registrationEnabled ? 'bg-accent' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.registrationEnabled ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Global Announcements */}
                    <section className="glass p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Broadcast Announcement</h3>
                                <p className="text-gray-500 text-sm">Post a message visible to all users across all tenants.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={settings.globalAnnouncement}
                                onChange={(e) => setSettings({ ...settings, globalAnnouncement: e.target.value })}
                                placeholder="Enter announcement text... (e.g. Scheduled maintenance this Sunday at 2 AM UTC)"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent h-32 resize-none"
                            />
                        </div>
                    </section>

                    {/* Operational Limits */}
                    <section className="glass p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Tenant Defaults</h3>
                                <p className="text-gray-500 text-sm">Default configuration for newly provisioned organizations.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Default Trial Period (Days)</label>
                                <input
                                    type="number"
                                    value={settings.trialDays}
                                    onChange={(e) => setSettings({ ...settings, trialDays: parseInt(e.target.value) })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Support Contact Email</label>
                                <input
                                    type="email"
                                    value={settings.supportEmail}
                                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-accent text-black font-bold rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(20,255,140,0.2)]"
                    >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
