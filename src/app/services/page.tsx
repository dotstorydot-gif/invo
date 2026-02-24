"use client";

import React, { useState } from "react";
import {
    Plus,
    Activity,
    ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";

interface Service {
    id: string;
    organization_id: string;
    name: string;
    description: string;
    price: number;
    pricing_type: string;
    status: string;
    category?: string;
    sub_category?: string;
    platforms?: string[];
    providers?: string[];
    features?: string[];
    created_at: string;
}

const CATEGORIES = [
    'Digital Development',
    'Marketing & Ads',
    'Design & Branding',
    'Media Content',
    'Web Services & Tools',
    'Consultation',
    'Other'
];

const DEV_TYPES = [
    'Informative Website', 'Personal Website', 'Ecommerce', 'Chatting App',
    'Multiple', 'Hospitality', 'Medical', 'Booking System', 'Crypto',
    'Financial', 'Management System', 'System Application', 'Mobile App', 'Other'
];

const MARKETING_PLATFORMS = [
    'Meta Ads', 'SEO', 'SEM', 'Google Display Network (GDN)',
    'LinkedIn Ads', 'TikTok Ads', 'Snapchat Ads', 'X Ads'
];

const DESIGN_TYPES = [
    'Flyer', 'Brochure', 'Business Cards', 'Logo Design',
    'Branding', 'Full Identity Branding', 'UI/UX Design', 'Other'
];

const DESIGN_TOOLS = [
    'Adobe Suite', 'Canva', 'Envato', 'Figma', 'Sketch'
];

const CONSULTATION_TYPES = [
    'Marketing Strategy', 'Sales Consultation', 'SEO Consultation',
    'Business Development', 'Technical Consultation', 'Other'
];

const PROVIDERS = [
    'AWS', 'Google Cloud', 'Firebase', 'Vercel', 'Hostinger',
    'GoDaddy', 'Namecheap', 'Apple Developer Program', 'Google Play Console',
    'ChatGPT / AI Tools', 'Midjourney'
];

export default function ServicesPage() {
    const { t } = useLanguage();
    const { data: services, loading, upsert } = useERPData<Service>('services');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Custom input states
    const [customCategory, setCustomCategory] = useState('');
    const [customSubCategory, setCustomSubCategory] = useState('');
    const [customPlatform, setCustomPlatform] = useState('');
    const [customProvider, setCustomProvider] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        status: 'Active',
        pricing_type: 'Fixed',
        category: 'Digital Development',
        sub_category: 'Informative Website',
        platforms: [] as string[],
        providers: [] as string[],
        features: [] as string[]
    });

    const toggleArrayItem = (arrayName: 'platforms' | 'providers' | 'features', item: string) => {
        setFormData(prev => {
            const currentArray = prev[arrayName];
            const newArray = currentArray.includes(item)
                ? currentArray.filter(i => i !== item)
                : [...currentArray, item];
            return { ...prev, [arrayName]: newArray };
        });
    };

    const handleAddService = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                pricing_type: formData.pricing_type,
                status: formData.status,
                category: formData.category === 'Other' ? (customCategory || 'Other') : formData.category,
                sub_category: formData.sub_category === 'Other' ? (customSubCategory || 'Other') : formData.sub_category,
                platforms: formData.platforms,
                providers: formData.providers,
                features: formData.features
            });
            setIsModalOpen(false);
            setFormData({
                name: '',
                description: '',
                price: 0,
                pricing_type: 'Fixed',
                status: 'Active',
                category: 'Digital Development',
                sub_category: 'Informative Website',
                platforms: [],
                providers: [],
                features: []
            });
            setCustomCategory('');
            setCustomSubCategory('');
            setCustomPlatform('');
            setCustomProvider('');
        } catch (error) {
            console.error("Error adding service:", error);
            alert("Failed to add service. Check console for details.");
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
                            <h2 className="text-3xl font-bold gradient-text">Services Directory</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage marketing & consulting services</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Service</span>
                    </button>
                </header>
                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                    </div>
                )}

                {/* Services Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass overflow-hidden border-border-custom flex flex-col group hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all"
                            >
                                {/* Unit Header / Ribbon */}
                                <div className="flex justify-between items-center p-6 border-b border-border-custom bg-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-accent/20 text-accent">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{service.name}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                                ID: {service.id.substring(0, 8)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${service.status === 'Active' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                                            'text-gray-400 border-gray-400/20 bg-gray-400/5'
                                            }`}>
                                            {service.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 border-b border-border-custom flex-1">
                                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                        {service.description || 'No description provided.'}
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] uppercase text-gray-500 font-bold">Base Price ({service.pricing_type || 'Fixed'})</span>
                                        <span className="text-xl font-bold text-accent">{service.price.toLocaleString()} EGP</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-4 mt-auto flex flex-col gap-2 border-t border-border-custom bg-white/5">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{service.category || 'Standard Service'}</span>
                                    {service.sub_category && <span className="text-sm font-bold text-gray-300">{service.sub_category}</span>}

                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {service.platforms?.map((p, i) => <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[9px] font-bold">{p}</span>)}
                                        {service.providers?.map((p, i) => <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[9px] font-bold">{p}</span>)}
                                        {service.features?.map((p, i) => <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold">{p}</span>)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add Service"
                    onSubmit={handleAddService}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Service Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="e.g. SEO Consultation"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-24"
                                placeholder="Details about this service offering..."
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Price (EGP)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Pricing Option</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setFormData({ ...formData, pricing_type: 'Fixed' })} className={`py-2 rounded-lg border text-xs font-bold transition-all ${formData.pricing_type === 'Fixed' ? 'bg-accent/20 border-accent/50 text-accent' : 'bg-[#111] border-white/10 text-gray-400'}`}>Fixed Invoice</button>
                                <button type="button" onClick={() => setFormData({ ...formData, pricing_type: 'Recurring' })} className={`py-2 rounded-lg border text-xs font-bold transition-all ${formData.pricing_type === 'Recurring' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-[#111] border-white/10 text-gray-400'}`}>Recurring Setup</button>
                            </div>
                        </div>

                        {/* Category specific dynamic fields */}
                        <div className="flex flex-col gap-4 col-span-1 border-t border-white/10 pt-4 mt-2">
                            <label className="text-xs font-bold text-accent uppercase">Service Categorization</label>

                            <select
                                value={formData.category}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        category: e.target.value,
                                        sub_category: e.target.value === 'Digital Development' ? DEV_TYPES[0] :
                                            e.target.value === 'Design & Branding' ? DESIGN_TYPES[0] :
                                                e.target.value === 'Consultation' ? CONSULTATION_TYPES[0] : '',
                                        platforms: [], providers: [], features: []
                                    })
                                }}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>

                            {formData.category === 'Other' && (
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="Enter custom category..."
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                />
                            )}

                            {/* Digital Development Sub-categories */}
                            {formData.category === 'Digital Development' && (
                                <select
                                    value={formData.sub_category}
                                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                >
                                    {DEV_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            )}

                            {/* Design & Branding Sub-categories */}
                            {formData.category === 'Design & Branding' && (
                                <select
                                    value={formData.sub_category}
                                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                >
                                    {DESIGN_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            )}

                            {/* Media Content Types */}
                            {formData.category === 'Media Content' && (
                                <select
                                    value={formData.sub_category}
                                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                >
                                    <option value="Photographing">Photographing Session</option>
                                    <option value="Videographing">Videographing & Production</option>
                                </select>
                            )}

                            {/* Consultation Types */}
                            {formData.category === 'Consultation' && (
                                <select
                                    value={formData.sub_category}
                                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                >
                                    {CONSULTATION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            )}

                            {formData.sub_category === 'Other' && (
                                <input
                                    type="text"
                                    value={customSubCategory}
                                    onChange={(e) => setCustomSubCategory(e.target.value)}
                                    placeholder="Enter custom sub-category..."
                                    className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                />
                            )}
                        </div>

                        {/* Marketing Platforms Multi-Select */}
                        {formData.category === 'Marketing & Ads' && (
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    Target Platforms
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {MARKETING_PLATFORMS.map(platform => (
                                        <button
                                            key={platform} type="button"
                                            onClick={() => toggleArrayItem('platforms', platform)}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${formData.platforms.includes(platform) ? 'bg-accent/20 border-accent/50 text-accent' : 'bg-[#111] border-white/10 text-gray-400 hover:border-white/30'}`}
                                        >
                                            {platform}
                                        </button>
                                    ))}
                                    {formData.platforms.filter(p => !MARKETING_PLATFORMS.includes(p)).map(platform => (
                                        <button
                                            key={platform} type="button"
                                            onClick={() => toggleArrayItem('platforms', platform)}
                                            className="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all bg-accent/20 border-accent/50 text-accent flex items-center gap-1"
                                        >
                                            {platform} &times;
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={customPlatform}
                                        onChange={(e) => setCustomPlatform(e.target.value)}
                                        placeholder="Add custom platform..."
                                        className="glass bg-white/5 border-border-custom p-2 rounded-xl outline-none focus:border-accent transition-all text-sm flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (customPlatform.trim()) { toggleArrayItem('platforms', customPlatform.trim()); setCustomPlatform(''); }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (customPlatform.trim()) { toggleArrayItem('platforms', customPlatform.trim()); setCustomPlatform(''); }
                                        }}
                                        className="px-4 py-2 bg-accent/20 text-accent font-bold rounded-xl flex-shrink-0 border border-accent/20 hover:bg-accent/30 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Web Services Providers Multi-Select */}
                        {['Web Services & Tools', 'Digital Development', 'Design & Branding'].includes(formData.category) && (
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    Associated Providers / Tools
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PROVIDERS.concat(DESIGN_TOOLS).map(provider => (
                                        <button
                                            key={provider} type="button"
                                            onClick={() => toggleArrayItem('providers', provider)}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${formData.providers.includes(provider) ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-[#111] border-white/10 text-gray-400 hover:border-white/30'}`}
                                        >
                                            {provider}
                                        </button>
                                    ))}
                                    {formData.providers.filter(p => !PROVIDERS.concat(DESIGN_TOOLS).includes(p)).map(provider => (
                                        <button
                                            key={provider} type="button"
                                            onClick={() => toggleArrayItem('providers', provider)}
                                            className="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all bg-purple-500/20 border-purple-500/50 text-purple-400 flex items-center gap-1"
                                        >
                                            {provider} &times;
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={customProvider}
                                        onChange={(e) => setCustomProvider(e.target.value)}
                                        placeholder="Add custom provider/tool..."
                                        className="glass bg-white/5 border-border-custom p-2 rounded-xl outline-none focus:border-purple-500 transition-all text-sm flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (customProvider.trim()) { toggleArrayItem('providers', customProvider.trim()); setCustomProvider(''); }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (customProvider.trim()) { toggleArrayItem('providers', customProvider.trim()); setCustomProvider(''); }
                                        }}
                                        className="px-4 py-2 bg-purple-500/20 text-purple-400 font-bold rounded-xl flex-shrink-0 border border-purple-500/20 hover:bg-purple-500/30 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-4 border-t border-white/10 mt-2">
                            <input
                                type="checkbox"
                                checked={formData.status === 'Active'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
                                className="w-4 h-4 rounded border-border-custom bg-white/5 accent-accent"
                            />
                            <label className="text-xs font-bold text-gray-300 uppercase">Activate Service immediately</label>
                        </div>
                    </div>
                </ERPFormModal>
            </main>
        </div>
    );
}
