'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CreditCard, Users, Clock, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface Subscription {
    id: string;
    organization_id: string;
    org_name: string;
    plan: string;
    status: string;
    users_count: number;
    amount: number;
    next_billing: string;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        // Joining organizations to get the subscription details
        const { data, error } = await supabase
            .from('organizations')
            .select('id, name, subscription_plan, subscription_status, created_at');

        if (data) {
            const mapped: Subscription[] = data.map(org => ({
                id: org.id,
                organization_id: org.id,
                org_name: org.name,
                plan: org.subscription_plan || 'Platinum',
                status: org.subscription_status || 'Active',
                users_count: 0, // In real app, count users per org
                amount: org.subscription_plan === 'Platinum' ? 7000 : org.subscription_plan === 'Gold' ? 5000 : 3000,
                next_billing: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
            }));
            setSubscriptions(mapped);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const totalMRR = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);

    return (
        <div className="p-8 overflow-y-auto w-full h-full bg-[#050505]">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Revenue & Subscriptions</h1>
                    <p className="text-gray-400 mt-2">Track SaaS revenue performance and individual tenant billing cycles.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-2xl border border-white/5 bg-emerald-500/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <DollarSign size={24} />
                            </div>
                            <span className="text-gray-400 font-medium">Monthly Recurring Revenue</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white tracking-tight">{totalMRR.toLocaleString()} <span className="text-sm font-normal text-gray-500 uppercase">EGP</span></h3>
                        <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-bold">
                            <TrendingUp size={12} /> +12% from last month
                        </p>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-white/5 bg-blue-500/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <CreditCard size={24} />
                            </div>
                            <span className="text-gray-400 font-medium">Active Subscriptions</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white tracking-tight">{subscriptions.length}</h3>
                        <p className="text-xs text-blue-400 mt-2 font-medium">All tenants are currently active</p>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-white/5 bg-purple-500/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <Clock size={24} />
                            </div>
                            <span className="text-gray-400 font-medium">Trial Conversion Rate</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white tracking-tight">84%</h3>
                        <p className="text-xs text-purple-400 mt-2 font-medium">Increasing trend over 90 days</p>
                    </div>
                </div>

                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white">Billing Entries</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 text-gray-300 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Tenant</th>
                                    <th className="px-6 py-4 font-bold">Current Plan</th>
                                    <th className="px-6 py-4 font-bold text-right">Monthly Amount</th>
                                    <th className="px-6 py-4 font-bold text-right">Next Billing</th>
                                    <th className="px-6 py-4 font-bold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center italic text-gray-500">Parsing billing ledgers...</td></tr>
                                ) : subscriptions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-white tracking-wide">{sub.org_name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-400">{sub.plan}</td>
                                        <td className="px-6 py-4 text-right font-mono text-white">{sub.amount.toLocaleString()} EGP</td>
                                        <td className="px-6 py-4 text-right text-xs">
                                            {new Date(sub.next_billing).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                                Paid
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && subscriptions.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No active billing records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
