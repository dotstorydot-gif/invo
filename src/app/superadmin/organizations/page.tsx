'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, ExternalLink, Edit2 } from 'lucide-react';
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

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Org[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Org Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editOrgId, setEditOrgId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        subscription_plan: 'Platinum',
        module_type: 'Real Estate'
    });

    const loadData = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setOrganizations(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreateModal = () => {
        setIsEditing(false);
        setEditOrgId(null);
        setFormData({ name: '', subdomain: '', subscription_plan: 'Platinum', module_type: 'Real Estate' });
        setIsModalOpen(true);
    };

    const handleEditOrg = (org: Org) => {
        setIsEditing(true);
        setEditOrgId(org.id);
        setFormData({
            name: org.name,
            subdomain: org.subdomain || '',
            subscription_plan: org.subscription_plan || 'Platinum',
            module_type: org.module_type || 'Real Estate'
        });
        setIsModalOpen(true);
    };

    const handleSubmitOrganization = async () => {
        setIsSubmitting(true);
        try {
            if (isEditing && editOrgId) {
                const { error: orgError } = await supabase
                    .from('organizations')
                    .update({
                        name: formData.name,
                        subdomain: formData.subdomain,
                        subscription_plan: formData.subscription_plan,
                        module_type: formData.module_type
                    })
                    .eq('id', editOrgId);

                if (orgError) throw orgError;
                alert(`Organization "${formData.name}" updated!`);
            } else {
                const { data: newOrg, error: orgError } = await supabase.from('organizations').insert({
                    name: formData.name,
                    subdomain: formData.subdomain,
                    subscription_plan: formData.subscription_plan,
                    module_type: formData.module_type,
                    subscription_status: 'Active'
                }).select('id').single();

                if (orgError) throw orgError;

                const { error: userError } = await supabase.from('users').insert({
                    organization_id: newOrg.id,
                    username: 'admin',
                    password_hash: '123456',
                    role: 'Admin',
                    full_name: 'System Admin'
                });

                if (userError) throw userError;
                alert(`Organization "${formData.name}" created! Default login: admin / 123456`);
            }

            loadData();
            setIsModalOpen(false);
        } catch (error: Error | any) {
            alert('Error: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.subdomain?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 overflow-y-auto w-full h-full bg-[#050505]">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Organizations</h1>
                        <p className="text-gray-400 mt-2">Manage all SaaS tenants and their core configurations.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-2.5 bg-accent text-black font-bold flex items-center gap-2 rounded-xl transition-all hover:bg-emerald-500 shadow-[0_0_20px_rgba(20,255,140,0.15)]"
                    >
                        <Plus size={18} /> Provision Tenant
                    </button>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or subdomain..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent transition-all"
                        />
                    </div>
                </div>

                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-300 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Organization</th>
                                    <th className="px-6 py-4 font-bold">Identifier</th>
                                    <th className="px-6 py-4 font-bold">Module</th>
                                    <th className="px-6 py-4 font-bold">Plan</th>
                                    <th className="px-6 py-4 font-bold">Created</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center italic">Fetching satellite data...</td></tr>
                                ) : filteredOrgs.map(org => (
                                    <tr key={org.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center font-bold text-lg">
                                                    {org.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-white tracking-wide text-base">{org.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300">
                                                {org.subdomain || '---'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-gray-400">
                                                {org.module_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-black tracking-widest ${org.subscription_plan === 'Platinum' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                org.subscription_plan === 'Gold' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                    'bg-white/5 text-gray-400 border border-white/10'
                                                }`}>
                                                {org.subscription_plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium">
                                            {new Date(org.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditOrg(org)}
                                                    className="p-2 text-gray-500 hover:text-accent transition-colors"
                                                    title="Edit Organization"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && filteredOrgs.length === 0 && (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center">No organizations match your search.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ERPFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? "Update Organization" : "Provision New Organization"}
                submitLabel={isEditing ? "Update" : "Provision"}
                onSubmit={handleSubmitOrganization}
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
                </div>
            </ERPFormModal>
        </div>
    );
}
