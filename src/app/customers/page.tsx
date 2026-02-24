"use client";

import React, { useState } from "react";
import {
    Users,
    Plus,
    Search,
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Home,
    CreditCard,
    Calendar,
    ChevronRight,
    Filter,
    UserCircle
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function CustomersPage() {
    const { t } = useLanguage();
    const { data: customers, loading, upsert } = useERPData<any>('customers');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const handleAddCustomer = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address
            });
            setIsModalOpen(false);
            setFormData({ name: '', email: '', phone: '', address: '' });
        } catch (error) {
            console.error("Error adding customer:", error);
            alert("Failed to add customer.");
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
                            <h2 className="text-3xl font-bold gradient-text">Customer Directory</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage unit owners, potential buyers, and installment payers</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Customer</span>
                    </button>
                </header>

                {/* Dashboard Stats for Customers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 text-blue-400 mb-2">
                            <Users size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Clients</span>
                        </div>
                        <div className="text-3xl font-bold">{customers.length} Clients</div>
                    </div>
                    <div className="glass p-6 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <Home size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Active Owners</span>
                        </div>
                        <div className="text-3xl font-bold">12 Owners</div>
                    </div>
                    <div className="glass p-6 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 text-amber-400 mb-2">
                            <Calendar size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Paying Installments</span>
                        </div>
                        <div className="text-3xl font-bold">8 Payers</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="glass border-border-custom overflow-hidden">
                        <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
                            <h3 className="font-bold flex items-center gap-2">
                                <Users size={18} className="text-accent" />
                                All Registered Customers
                            </h3>
                            <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background">
                                <Search size={16} className="text-gray-400" />
                                <input type="text" placeholder={t('search_placeholder')} className="bg-transparent border-none outline-none text-xs w-full" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5">
                                    <tr className="border-b border-border-custom">
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Customer Info</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Contact Details</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Status</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={4} className="p-10 text-center italic text-gray-500">Syncing customers...</td></tr>
                                    ) : (
                                        customers.map((customer: any) => (
                                            <tr key={customer.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-accent">
                                                            <UserCircle size={24} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">{customer.name}</div>
                                                            <div className="text-[10px] text-gray-500 font-mono">ID: {customer.id.slice(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <Phone size={12} className="text-accent/60" /> {customer.phone || "N/A"}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <Mail size={12} className="text-accent/60" /> {customer.email || "N/A"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-2 outline-none">
                                                        <Link href={`/invoices?clientId=${customer.id}`} className="p-2 rounded-lg border border-border-custom text-gray-400 hover:text-accent hover:border-accent transition-all">
                                                            <CreditCard size={16} />
                                                        </Link>
                                                        <Link href={`/installments?clientId=${customer.id}`} className="p-2 rounded-lg border border-border-custom text-gray-400 hover:text-emerald-400 hover:border-emerald-400 transition-all">
                                                            <Calendar size={16} />
                                                        </Link>
                                                        <button className="p-2 rounded-lg border border-border-custom text-gray-400 hover:text-white transition-all">
                                                            <ChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add New Customer"
                    onSubmit={handleAddCustomer}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Customer Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="+20 123..."
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="customer@example.com"
                            />
                        </div>
                        <div className="flex flex-col col-span-2 gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Home Address</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                rows={3}
                            />
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
