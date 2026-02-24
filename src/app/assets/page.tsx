"use client";

import React, { useState } from "react";
import {
    Plus,
    ArrowLeft,
    Monitor,
    User,
    Wrench
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface Asset {
    id: string;
    organization_id: string;
    name: string;
    serial_number: string;
    description: string;
    value: number;
    status: 'In Use' | 'Maintenance' | 'Retired';
    assigned_to_employee: string | null;
    created_at: string;
}

export default function AssetsPage() {
    const { data: assets, loading, upsert } = useERPData<Asset>('assets');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        serial_number: '',
        description: '',
        value: 0,
        status: 'In Use' as 'In Use' | 'Maintenance' | 'Retired',
        assigned_to_employee: null as string | null
    });

    const handleAddAsset = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                name: formData.name,
                serial_number: formData.serial_number,
                description: formData.description,
                value: Number(formData.value),
                status: formData.status,
                assigned_to_employee: formData.assigned_to_employee
            });
            setIsModalOpen(false);
            setFormData({
                name: '',
                serial_number: '',
                description: '',
                value: 0,
                status: 'In Use',
                assigned_to_employee: null
            });
        } catch (error) {
            console.error("Error adding asset:", error);
            alert("Failed to add asset. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Company Assets</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage IT equipment, hardware, and marketing gear</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Asset</span>
                    </button>
                </header>
                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                    </div>
                )}

                {/* Assets Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {assets.map((asset) => (
                            <motion.div
                                key={asset.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass overflow-hidden border-border-custom flex flex-col group hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all"
                            >
                                {/* Asset Header */}
                                <div className="flex justify-between items-center p-6 border-b border-border-custom bg-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
                                            <Monitor size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{asset.name}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono tracking-wider">
                                                SN: {asset.serial_number || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${asset.status === 'In Use' ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' :
                                            asset.status === 'Maintenance' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                                                'text-red-400 border-red-400/20 bg-red-400/5'
                                            }`}>
                                            {asset.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 border-b border-border-custom flex-1 space-y-4">
                                    <p className="text-sm text-gray-400 line-clamp-2">
                                        {asset.description || 'No description provided.'}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm mt-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] uppercase text-gray-500 font-bold">Estimated Value</span>
                                            <span className="font-bold text-white">{asset.value.toLocaleString()} EGP</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Assignment Info */}
                                <div className="p-5 mt-auto flex items-center justify-between border-t border-border-custom bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                                            <User size={14} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Assigned To</div>
                                            <div className="text-xs font-bold text-gray-300">
                                                {asset.assigned_to_employee ? "Staff ID: " + asset.assigned_to_employee.substring(0, 8) : 'Unassigned'}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="glass-hover p-2 rounded-lg border border-border-custom text-gray-400 hover:text-accent transition-all">
                                        <Wrench size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add Marketing Asset"
                    onSubmit={handleAddAsset}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Asset Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="e.g. MacBook Pro M3"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Serial Number</label>
                            <input
                                type="text"
                                value={formData.serial_number}
                                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="e.g. C02GXX..."
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Value (EGP)</label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'In Use' | 'Maintenance' | 'Retired' })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="In Use">In Use (Active)</option>
                                <option value="Maintenance">In Maintenance</option>
                                <option value="Retired">Retired / Broken</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-20"
                                placeholder="Details about this asset..."
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
