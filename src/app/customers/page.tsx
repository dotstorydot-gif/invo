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
    UserCircle,
    Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import { useAuth } from "@/context/AuthContext";
import ERPFormModal from "@/components/ERPFormModal";

export default function CustomersPage() {
    const { t } = useLanguage();
    const { session } = useAuth();
    const isMarketing = session?.moduleType === 'Service & Marketing';

    const { data: customers, loading, upsert, remove } = useERPData<any>('customers');
    const { data: projects } = useERPData<any>('projects');
    const { data: clientProjects, upsert: upsertClientProject } = useERPData<any>('client_projects');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { data: units } = useERPData<any>('units');
    const { data: installments } = useERPData<any>('installments');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        phone: '',
        address: '',
        country: '',
        selected_projects: []
    });

    const handleSaveCustomer = async () => {
        try {
            setIsSubmitting(true);
            const res = await upsert({
                ...(editingId ? { id: editingId } : {}),
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                country: formData.country,
                address: isMarketing ? undefined : formData.address
            });

            if (res && res[0] && !editingId && formData.selected_projects?.length > 0) {
                const clientId = res[0].id;
                for (const projectId of formData.selected_projects) {
                    await upsertClientProject({
                        client_id: clientId,
                        project_id: projectId
                    });
                }
            }

            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', email: '', phone: '', address: '', country: '', selected_projects: [] });
        } catch (error) {
            console.error("Error adding customer:", error);
            alert("Failed to add customer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCustomer = (customer: any) => {
        setEditingId(customer.id);
        setFormData({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            country: customer.country || '',
            selected_projects: clientProjects.filter((cp: any) => cp.client_id === customer.id).map((cp: any) => cp.project_id)
        });
        setIsModalOpen(true);
    };

    const handleDeleteCustomer = async (id: string) => {
        if (confirm("Are you sure you want to remove this client? This action cannot be undone.")) {
            try {
                const success = await remove(id);
                if (success) {
                    alert("Customer deleted successfully.");
                }
            } catch (error: any) {
                console.error("Error deleting customer:", error);
                alert("Failed to delete customer: " + (error.message || "Unknown error"));
            }
        }
    };

    const activeOwners = Array.from(new Set(units.filter((u: any) => u.status === 'Sold' || u.status === 'Installments').map((u: any) => u.consumer_name))).length;
    const payingInstallments = installments.filter((i: any) => i.status === 'Pending').length;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{isMarketing ? "Client Directory" : "Customer Directory"}</h2>
                            <p className="text-gray-400 text-sm mt-1">{isMarketing ? "Manage accounts, service clients and project associations" : "Manage unit owners, potential buyers, and installment payers"}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', email: '', phone: '', address: '', country: '', selected_projects: [] });
                            setIsModalOpen(true);
                        }}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>{isMarketing ? "Add Client" : "Add Customer"}</span>
                    </button>
                </header>

                {/* Dashboard Stats for Customers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 text-blue-400 mb-2">
                            <Users size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{isMarketing ? "Total Clients" : "Total Contacts"}</span>
                        </div>
                        <div className="text-3xl font-bold">{customers.length} {isMarketing ? "Clients" : "Contacts"}</div>
                    </div>
                    <div className="glass p-6 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <Home size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Active Owners</span>
                        </div>
                        <div className="text-3xl font-bold">{activeOwners} Owners</div>
                    </div>
                    <div className="glass p-6 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 text-amber-400 mb-2">
                            <Calendar size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Paying Installments</span>
                        </div>
                        <div className="text-3xl font-bold">{payingInstallments} Payers</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="glass border-border-custom overflow-hidden">
                        <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
                            <h3 className="font-bold flex items-center gap-2">
                                <Users size={18} className="text-accent" />
                                {isMarketing ? "All Registered Clients" : "All Registered Customers"}
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
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{isMarketing ? "Client Info" : "Customer Info"}</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">Contact Details</th>
                                        <th className="p-6 text-xs font-bold uppercase text-gray-500">{isMarketing ? "Accounts / Projects" : "Status"}</th>
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
                                                    {isMarketing ? (
                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                            {clientProjects.filter((cp: any) => cp.client_id === customer.id).map((cp: any) => {
                                                                const project = projects.find(p => p.id === cp.project_id);
                                                                return (
                                                                    <span key={cp.id} className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent text-[8px] font-bold uppercase tracking-tight">
                                                                        {project?.name || "Project"}
                                                                    </span>
                                                                );
                                                            })}
                                                            {clientProjects.filter((cp: any) => cp.client_id === customer.id).length === 0 && (
                                                                <span className="text-[10px] text-gray-600 italic">No project linked</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-2 outline-none">
                                                        <Link href={`/invoices?clientId=${customer.id}`} className="p-2 rounded-lg border border-border-custom text-gray-400 hover:text-accent hover:border-accent transition-all">
                                                            <CreditCard size={16} />
                                                        </Link>
                                                        <Link href={`/installments?clientId=${customer.id}`} className="p-2 rounded-lg border border-border-custom text-gray-400 hover:text-emerald-400 hover:border-emerald-400 transition-all">
                                                            <Calendar size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleEditCustomer(customer)}
                                                            className="p-2 rounded-lg border border-border-custom text-gray-400 hover:text-white hover:border-white transition-all"
                                                        >
                                                            <ChevronRight size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCustomer(customer.id)}
                                                            className="p-2 rounded-lg border border-border-custom text-gray-400 hover:text-red-500 hover:border-red-500 transition-all"
                                                        >
                                                            <Trash2 size={16} />
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
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingId(null);
                        setFormData({ name: '', email: '', phone: '', address: '', country: '', selected_projects: [] });
                    }}
                    title={editingId ? (isMarketing ? "Edit Client" : "Edit Customer") : (isMarketing ? "Add New Client" : "Add New Customer")}
                    onSubmit={handleSaveCustomer}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{isMarketing ? "Client / Account Name" : "Customer Name"}</label>
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
                        <div className="flex flex-col col-span-2 gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Country / Region</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="Egypt, UAE, USA..."
                            />
                        </div>
                        <div className="flex flex-col col-span-2 gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="customer@example.com"
                            />
                        </div>

                        {isMarketing ? (
                            <div className="flex flex-col col-span-2 gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Related Projects / Accounts</label>
                                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-4 glass bg-white/5 border-border-custom rounded-xl">
                                    {projects.map((p: any) => (
                                        <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.selected_projects.includes(p.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        selected_projects: checked
                                                            ? [...prev.selected_projects, p.id]
                                                            : prev.selected_projects.filter((id: string) => id !== p.id)
                                                    }));
                                                }}
                                                className="w-4 h-4 rounded border-border-custom bg-transparent checked:bg-accent focus:ring-accent transition-all"
                                            />
                                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">{p.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col col-span-2 gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Home Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
