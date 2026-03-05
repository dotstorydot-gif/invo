"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, Package, Activity, Type } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";

export interface LineItem {
    id?: string;
    name: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    source_type?: 'Inventory' | 'Service' | 'Manual';
    source_id?: string;
}

interface LineItemEditorProps {
    items: LineItem[];
    onChange: (items: LineItem[]) => void;
    onTotalChange?: (total: number) => void;
}

const LineItemEditor: React.FC<LineItemEditorProps> = ({ items, onChange, onTotalChange }) => {
    const { t } = useLanguage();
    const { data: inventory } = useERPData<any>('inventory');
    const { data: services } = useERPData<any>('services');

    const [showSearch, setShowSearch] = useState<number | null>(null);

    const addItem = () => {
        const newItem: LineItem = {
            name: "",
            description: "",
            quantity: 1,
            unit_price: 0,
            total: 0,
            source_type: 'Manual'
        };
        onChange([...items, newItem]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    const updateItem = (index: number, updates: Partial<LineItem>) => {
        const newItems = items.map((item, i) => {
            if (i === index) {
                const updated = { ...item, ...updates };
                updated.total = (updated.quantity || 0) * (updated.unit_price || 0);
                return updated;
            }
            return item;
        });
        onChange(newItems);
    };

    const selectFromInventory = (index: number, invItem: any) => {
        updateItem(index, {
            name: invItem.name,
            description: invItem.description || "",
            unit_price: invItem.cost_price || 0,
            source_type: 'Inventory',
            source_id: invItem.id
        });
        setShowSearch(null);
    };

    const selectFromService = (index: number, service: any) => {
        updateItem(index, {
            name: service.name,
            description: service.description || "",
            unit_price: service.price || 0,
            source_type: 'Service',
            source_id: service.id
        });
        setShowSearch(null);
    };

    useEffect(() => {
        const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
        if (onTotalChange) onTotalChange(grandTotal);
    }, [items, onTotalChange]);

    return (
        <div className="flex flex-col gap-4 mt-6">
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <h4 className="text-sm font-bold text-accent uppercase tracking-widest">{t('line_items') || 'Line Items'}</h4>
                <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-[#050505] font-bold text-xs hover:shadow-[0_0_10px_rgba(20,255,140,0.3)] transition-all"
                >
                    <Plus size={14} />
                    {t('add_item') || 'Add Item'}
                </button>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="glass p-4 border-border-custom bg-white/5 relative group animate-in fade-in slide-in-from-top-1">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Item Selection & Name */}
                            <div className="md:col-span-4 flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">{t('item_name') || 'Item Name'}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItem(index, { name: e.target.value })}
                                        className="w-full glass bg-background border-border-custom p-2 rounded-lg outline-none text-xs focus:border-accent"
                                        placeholder={t('enter_item_name') || 'Enter name...'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSearch(showSearch === index ? null : index)}
                                        className="absolute right-2 top-2 text-gray-400 hover:text-accent"
                                        title="Search from Catalog"
                                    >
                                        <Search size={14} />
                                    </button>

                                    {showSearch === index && (
                                        <div className="absolute top-full left-0 right-0 mt-2 glass z-50 max-h-60 overflow-y-auto border-accent/20 shadow-2xl animate-in zoom-in-95">
                                            <div className="p-2 border-b border-white/10 sticky top-0 bg-[#111] font-bold text-[10px] text-gray-500 uppercase flex items-center gap-2">
                                                <Package size={12} /> {t('inventory') || 'Inventory'}
                                            </div>
                                            {inventory.map((inv: any) => (
                                                <div
                                                    key={inv.id}
                                                    onClick={() => selectFromInventory(index, inv)}
                                                    className="p-3 hover:bg-white/10 cursor-pointer flex justify-between items-center border-b border-white/5"
                                                >
                                                    <div>
                                                        <div className="text-xs font-bold text-white">{inv.name}</div>
                                                        <div className="text-[10px] text-gray-500">{inv.code || inv.id.substring(0, 8)}</div>
                                                    </div>
                                                    <div className="text-xs font-mono text-accent">{inv.cost_price?.toLocaleString()} EGP</div>
                                                </div>
                                            ))}

                                            <div className="p-2 border-b border-white/10 sticky top-0 bg-[#111] font-bold text-[10px] text-gray-500 uppercase flex items-center gap-2">
                                                <Activity size={12} /> {t('services') || 'Services'}
                                            </div>
                                            {services.map((svc: any) => (
                                                <div
                                                    key={svc.id}
                                                    onClick={() => selectFromService(index, svc)}
                                                    className="p-3 hover:bg-white/10 cursor-pointer flex justify-between items-center border-b border-white/5"
                                                >
                                                    <div>
                                                        <div className="text-xs font-bold text-white">{svc.name}</div>
                                                        <div className="text-[10px] text-gray-500">{svc.category || 'Service'}</div>
                                                    </div>
                                                    <div className="text-xs font-mono text-accent">{svc.price?.toLocaleString()} EGP</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-3 flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">{t('description') || 'Description'}</label>
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, { description: e.target.value })}
                                    className="w-full glass bg-background border-border-custom p-2 rounded-lg outline-none text-xs focus:border-accent"
                                    placeholder={t('item_desc_placeholder') || 'Brief details...'}
                                />
                            </div>

                            {/* Qty */}
                            <div className="md:col-span-1.5 flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">{t('qty') || 'Qty'}</label>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                                    className="w-full glass bg-background border-border-custom p-2 rounded-lg outline-none text-xs focus:border-accent text-center"
                                />
                            </div>

                            {/* Unit Price */}
                            <div className="md:col-span-2 flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">{t('unit_price') || 'Unit Price'}</label>
                                <input
                                    type="number"
                                    value={item.unit_price}
                                    onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
                                    className="w-full glass bg-background border-border-custom p-2 rounded-lg outline-none text-xs focus:border-accent text-right font-mono"
                                />
                            </div>

                            {/* Row Total & Delete */}
                            <div className="md:col-span-1.5 flex items-end justify-between md:flex-col md:items-end gap-2">
                                <div className="flex flex-col items-end md:w-full">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase text-right md:hidden">Total</label>
                                    <div className="text-sm font-bold text-white font-mono">{item.total?.toLocaleString()}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {item.source_type !== 'Manual' && (
                            <div className="absolute top-1 right-1 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                                {item.source_type === 'Inventory' ? <Package size={10} className="text-accent" /> : <Activity size={10} className="text-purple-400" />}
                                <span className="text-[8px] font-bold uppercase tracking-tighter text-gray-500">{item.source_type} Item</span>
                            </div>
                        )}
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-2xl text-gray-500 italic text-sm">
                        {t('no_items_added') || 'No items added. Click Add Item to start.'}
                    </div>
                )}
            </div>

            {/* Summary Row */}
            {items.length > 0 && (
                <div className="flex justify-end p-4 glass bg-accent/5 border-accent/20 rounded-xl mt-2 animate-in slide-in-from-right-2">
                    <div className="flex items-center gap-6">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('subtotal') || 'Subtotal'}</span>
                        <span className="text-2xl font-bold text-accent font-mono">
                            {items.reduce((sum, i) => sum + (i.total || 0), 0).toLocaleString()} EGP
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LineItemEditor;
