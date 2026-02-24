'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Users, CreditCard, Activity, ArrowUpRight, Plus, CheckCircle2 } from 'lucide-react';
import ERPFormModal from '@/components/ERPFormModal';

interface Org {
    id: string;
    name: string;
    subdomain: string;
    subscription_plan: string;
    subscription_status: string;
    module_type: string;
    created_at: string;
}

export default function SuperadminDashboard() {
    const [stats, setStats] = useState({ orgs: 0, users: 0, activeSubs: 0 });
    const [organizations, setOrganizations] = useState<Org[]>([]);
    const [loading, setLoading] = useState(true);

    // Org Creation State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        subscription_plan: 'Platinum',
        module_type: 'Real Estate'
    });

    const loadData = async () => {
        setLoading(true);
        const [orgsRes, usersRes] = await Promise.all([
            // @ts-ignore
            supabase.from('organizations').select('*').order('created_at', { ascending: false }),
            supabase.from('users').select('id', { count: 'exact' })
        ]);

        if (orgsRes.data) {
            setOrganizations(orgsRes.data);
            setStats({
                orgs: orgsRes.data.length,
                users: usersRes.count || 0,
                activeSubs: orgsRes.data.filter(o => o.subscription_status === 'Active').length || 0
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateOrganization = async () => {
        setIsSubmitting(true);
        try {
            // 1. Create Organization
            const { data: newOrg, error: orgError } = await supabase.from('organizations').insert({
                name: formData.name,
                subdomain: formData.subdomain,
                subscription_plan: formData.subscription_plan,
                module_type: formData.module_type,
                subscription_status: 'Active'
            }).select('id').single();

            if (orgError) throw orgError;

            // 2. Create Default 'admin' User for this Organization
            const { error: userError } = await supabase.from('users').insert({
                organization_id: newOrg.id,
                username: 'admin',
                password_hash: '123456', // In production, generate securely
                role: 'Admin',
                full_name: 'System Admin'
            });

            if (userError) throw userError;

            alert(`Organization "${formData.name}" created! Default login: admin / 123456`);
            loadData();
            setIsCreateModalOpen(false);
            setFormData({ name: '', subdomain: '', subscription_plan: 'Platinum', module_type: 'Real Estate' });
        } catch (error: any) {
            alert('Error creating organization: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cards = [
        { title: 'Total Organizations', value: stats.orgs, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Total Users', value: stats.users, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Active Subscriptions', value: stats.activeSubs, icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'System Health', value: '100%', icon: Activity, color: 'text-accent', bg: 'bg-accent/10' },
    ];

    if (loading) {
        return <div className="p-8 w-full h-full bg-[#050505] text-white flex justify-center items-center">Loading Data...</div>;
    }

    return (
        <div className="p-8 overflow-y-auto w-full h-full bg-[#050505]">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Global Overview</h1>
                        <p className="text-gray-400 mt-2">Manage all SaaS tenants and monitor platform usage.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-2 bg-accent text-black font-bold flex items-center gap-2 rounded-xl transition-all hover:bg-emerald-500"
                    >
                        <Plus size={18} /> New Organization
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, i) => (
                        <div key={i} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <card.icon className={`w-24 h-24 ${card.color}`} />
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <p className="text-gray-400 font-medium mb-1">{card.title}</p>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Registered Organizations</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-300 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Organization</th>
                                    <th className="px-6 py-4 font-bold">Subdomain</th>
                                    <th className="px-6 py-4 font-bold">Module Type</th>
                                    <th className="px-6 py-4 font-bold">Plan</th>
                                    <th className="px-6 py-4 font-bold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {organizations.map(org => (
                                    <tr key={org.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-accent/20 text-accent flex items-center justify-center font-bold">
                                                    {org.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-white tracking-wide">{org.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{org.subdomain}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase font-bold text-gray-300 tracking-wider">
                                                {org.module_type || 'Real Estate'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${org.subscription_plan === 'Platinum' ? 'bg-purple-500/20 text-purple-400' :
                                                    org.subscription_plan === 'Gold' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {org.subscription_plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-emerald-400">
                                                <CheckCircle2 size={14} /> Active
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {organizations.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center">No organizations found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Organization Modal */}
            <ERPFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Provision New Organization"
                onSubmit={handleCreateOrganization}
                loading={isSubmitting}
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Organization Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            placeholder="e.g. Acme Corp"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Subdomain (Identifier)</label>
                        <input
                            type="text"
                            value={formData.subdomain}
                            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/\s/g, '') })}
                            className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm font-mono"
                            placeholder="acmecorp"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Subscription Tier</label>
                        <select
                            value={formData.subscription_plan}
                            onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                            className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                        >
                            <option value="Platinum">Platinum (8 Users, Max Features)</option>
                            <option value="Gold">Gold (4 Users)</option>
                            <option value="Silver">Silver (2 Users)</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/10 mt-2">
                        <label className="text-xs font-bold text-accent uppercase">Operational Module Type</label>
                        <p className="text-xs text-gray-400 mb-2">Select the business engine this organization will use. This affects the core modules available.</p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, module_type: 'Real Estate' })}
                                className={`p-4 border rounded-xl text-left transition-all ${formData.module_type === 'Real Estate' ? 'border-accent bg-accent/10' : 'border-white/10 bg-[#111111] hover:border-white/30'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className={`w-4 h-4 ${formData.module_type === 'Real Estate' ? 'text-accent' : 'text-gray-400'}`} />
                                    <span className={`font-bold text-sm ${formData.module_type === 'Real Estate' ? 'text-accent' : 'text-gray-300'}`}>Real Estate</span>
                                </div>
                                <span className="text-[10px] text-gray-500 leading-tight block">Rentals, Units, Inventory tracking, Projects.</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, module_type: 'Service & Marketing' })}
                                className={`p-4 border rounded-xl text-left transition-all ${formData.module_type === 'Service & Marketing' ? 'border-accent bg-accent/10' : 'border-white/10 bg-[#111111] hover:border-white/30'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Activity className={`w-4 h-4 ${formData.module_type === 'Service & Marketing' ? 'text-accent' : 'text-gray-400'}`} />
                                    <span className={`font-bold text-sm ${formData.module_type === 'Service & Marketing' ? 'text-accent' : 'text-gray-300'}`}>Service & Marketing</span>
                                </div>
                                <span className="text-[10px] text-gray-500 leading-tight block">Services, Task Board, Digital Assets assigned.</span>
                            </button>
                        </div>
                    </div>
                </div>
            </ERPFormModal>
        </div>
    );
}
