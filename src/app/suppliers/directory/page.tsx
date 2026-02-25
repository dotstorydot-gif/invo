"use client";

import React, { useState } from "react";
import {
  Users2,
  Plus,
  Search,
  ArrowLeft,
  UserCircle,
  Package,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

export default function SupplierDirectoryPage() {
  const { t } = useLanguage();
  const { data: suppliers, loading, upsert, remove } = useERPData<any>('suppliers');
  const { data: inventory } = useERPData<any>('inventory');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleSaveSupplier = async () => {
    try {
      setIsSubmitting(true);
      await upsert({
        ...(editingId ? { id: editingId } : {}),
        ...formData
      });
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', contact_name: '', email: '', phone: '', address: '' });
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert("Failed to save supplier.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSupplier = (supplier: any) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name,
      contact_name: supplier.contact_name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <main className="flex-1 p-8 overflow-y-auto w-full">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Link href="/suppliers" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="text-3xl font-bold gradient-text">Supplier Directory</h2>
              <p className="text-gray-400 text-sm mt-1">Manage your logistics partners and product sources.</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', contact_name: '', email: '', phone: '', address: '' });
              setIsModalOpen(true);
            }}
            className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
          >
            <Plus size={20} />
            <span>Add Supplier</span>
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <div className="glass overflow-hidden border-border-custom">
            <div className="p-6 border-b border-border-custom flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <Users2 className="text-accent" />
                <h3 className="text-xl font-bold">Logistics Partners</h3>
              </div>
              <div className="glass flex items-center px-4 py-2 gap-3 w-64 border-border-custom bg-background shadow-inner">
                <Search size={16} className="text-gray-400" />
                <input type="text" placeholder="Search suppliers..." className="bg-transparent border-none outline-none text-xs w-full" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-custom bg-white/2">
                    <th className="p-6 text-xs font-bold uppercase text-gray-500">Supplier Name</th>
                    <th className="p-6 text-xs font-bold uppercase text-gray-500">Contact Person</th>
                    <th className="p-6 text-xs font-bold uppercase text-gray-500">Linked Products</th>
                    <th className="p-6 text-xs font-bold uppercase text-gray-500">Contact Info</th>
                    <th className="p-6 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center italic text-gray-500">Loading suppliers...</td></tr>
                  ) : suppliers.length > 0 ? (
                    suppliers.map((supplier: any) => (
                      <tr key={supplier.id} className="border-b border-border-custom hover:bg-white/5 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                              <UserCircle size={24} />
                            </div>
                            <div>
                              <div className="font-bold text-white">{supplier.name}</div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-widest">{supplier.address || 'No Address'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-sm text-gray-300">
                          {supplier.contact_name || 'N/A'}
                        </td>
                        <td className="p-6">
                          <div className="flex flex-wrap gap-2">
                            {inventory.filter((item: any) => item.supplier_id === supplier.id).length > 0 ? (
                              inventory.filter((item: any) => item.supplier_id === supplier.id).slice(0, 3).map((item: any) => (
                                <span key={item.id} className="flex items-center gap-1 text-[10px] bg-white/10 text-gray-400 px-2 py-1 rounded-lg border border-white/5">
                                  <Package size={10} />
                                  {item.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-500 italic">No linked products</span>
                            )}
                            {inventory.filter((item: any) => item.supplier_id === supplier.id).length > 3 && (
                              <span className="text-[10px] text-accent font-bold">+{inventory.filter((item: any) => item.supplier_id === supplier.id).length - 3} more</span>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            {supplier.phone && (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Phone size={12} className="text-accent" />
                                {supplier.phone}
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Mail size={12} className="text-accent" />
                                {supplier.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditSupplier(supplier)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => remove(supplier.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="p-20 text-center text-gray-500">No suppliers found. Add your first logistics partner.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <ERPFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Supplier" : "Add New Supplier"}
          onSubmit={handleSaveSupplier}
          loading={isSubmitting}
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Supplier Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm shadow-inner"
                placeholder="e.g. Al-Futtaim Logistics"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Contact Person</label>
              <div className="relative">
                <UserCircle size={16} className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="glass bg-white/5 border-border-custom p-3 pl-10 rounded-xl outline-none focus:border-accent transition-all text-sm w-full"
                  placeholder="Full Name"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="glass bg-white/5 border-border-custom p-3 pl-10 rounded-xl outline-none focus:border-accent transition-all text-sm w-full"
                  placeholder="+20 1..."
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass bg-white/5 border-border-custom p-3 pl-10 rounded-xl outline-none focus:border-accent transition-all text-sm w-full"
                  placeholder="supplier@email.com"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Address / Warehouse</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="glass bg-white/5 border-border-custom p-3 pl-10 rounded-xl outline-none focus:border-accent transition-all text-sm w-full"
                  placeholder="Cairo, Egypt"
                />
              </div>
            </div>
          </div>
        </ERPFormModal>
      </main>
    </div>
  );
}
