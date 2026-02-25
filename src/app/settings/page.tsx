"use client";

import React, { useState } from "react";
import {
    Globe, Bell, Shield, ArrowLeft, Check, User, Camera,
    LogOut, Trash2, Crown, CreditCard, AlertTriangle, Loader2
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";
import { Plus, Edit2 } from "lucide-react";

export default function SettingsPage() {
    const { t, language, toggleLanguage } = useLanguage();
    const { session, logout, updateSession } = useAuth();
    const router = useRouter();
    const { data: branches, upsert: upsertBranch, remove: removeBranch, loading: loadingBranches } = useERPData<any>('branches');

    const [profileName, setProfileName] = useState(session?.fullName || '');
    const [profileImage, setProfileImage] = useState(session?.profilePicture || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [isUpgrading, setIsUpgrading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [branchFormData, setBranchFormData] = useState({ id: '', name: '', address: '' });
    const [isSavingBranch, setIsSavingBranch] = useState(false);

    const planRank: Record<string, number> = { 'silver': 1, 'gold': 2, 'platinum': 3 };
    const currentPlan = session?.subscriptionPlan?.toLowerCase() || 'platinum';
    const currentRank = planRank[currentPlan] || 3;

    const handleSaveProfile = async () => {
        if (!session?.userId) return;
        setIsSavingProfile(true);
        try {
            const { error } = await supabase.from('users').update({
                full_name: profileName,
                profile_picture: profileImage
            }).eq('id', session.userId);

            if (!error) {
                updateSession({ fullName: profileName, profilePicture: profileImage });
                alert("Profile updated successfully!");
            } else {
                alert("Error updating profile: " + error.message);
            }
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpgradePlan = async (plan: string) => {
        if (!session?.orgId) return;
        setIsUpgrading(true);
        try {
            const { error } = await supabase.from('organizations').update({
                subscription_plan: plan
            }).eq('id', session.orgId);

            if (!error) {
                updateSession({ subscriptionPlan: plan });
                alert(`Successfully upgraded to ${plan} Plan!`);
            } else {
                alert("Error updating plan: " + error.message);
            }
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') {
            alert("Please type DELETE to confirm.");
            return;
        }
        if (!session?.userId) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase.from('users').delete().eq('id', session.userId);
            if (!error) {
                await logout();
            } else {
                alert("Error deleting account: " + error.message);
                setIsDeleting(false);
            }
        } catch (e: any) {
            alert("Error deleting account.");
            setIsDeleting(false);
        }
    };

    const handleSaveBranch = async () => {
        setIsSavingBranch(true);
        try {
            await upsertBranch({
                id: branchFormData.id || undefined,
                name: branchFormData.name,
                address: branchFormData.address
            });
            setIsBranchModalOpen(false);
            setBranchFormData({ id: '', name: '', address: '' });
        } catch (error) {
            console.error("Error saving branch:", error);
            alert("Failed to save branch.");
        } finally {
            setIsSavingBranch(false);
        }
    };

    const handleEditBranch = (branch: any) => {
        setBranchFormData({ id: branch.id, name: branch.name, address: branch.address || '' });
        setIsBranchModalOpen(true);
    };

    const handleDeleteBranch = async (id: string) => {
        if (!confirm("Are you sure you want to delete this branch?")) return;
        try {
            const success = await removeBranch(id);
            if (!success) alert("Failed to delete branch.");
        } catch (error) {
            console.error("Error deleting branch:", error);
            alert("An error occurred while deleting the branch.");
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
                            <h2 className="text-3xl font-bold gradient-text">{t('settings')}</h2>
                            <p className="text-gray-400 text-sm mt-1">Configure your ERP environment and preferences</p>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl space-y-8">
                    {/* Language Settings */}
                    <section className="glass border-border-custom p-8 bg-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-accent/20 text-accent">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{t('language')}</h3>
                                <p className="text-gray-500 text-sm italic">Change the interface language (Bilingual EN/AR)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => language !== 'en' && toggleLanguage()}
                                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${language === 'en' ? 'border-accent bg-accent/10' : 'border-border-custom hover:border-accent/40 bg-white/5'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🇺🇸</span>
                                    <span className="font-bold">English (US)</span>
                                </div>
                                {language === 'en' && <Check size={18} className="text-accent" />}
                            </button>

                            <button
                                onClick={() => language !== 'ar' && toggleLanguage()}
                                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${language === 'ar' ? 'border-accent bg-accent/10' : 'border-border-custom hover:border-accent/40 bg-white/5'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🇪🇬</span>
                                    <span className="font-bold">العربية (Arabic)</span>
                                </div>
                                {language === 'ar' && <Check size={18} className="text-accent" />}
                            </button>
                        </div>
                    </section>

                    {/* User Profile */}
                    <section className="glass border-border-custom p-8 bg-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-[#0e3b2e] text-accent">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">User Profile</h3>
                                <p className="text-gray-500 text-sm">Manage your personal information and avatar</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Profile Picture URL</label>
                                    <input
                                        type="text"
                                        value={profileImage}
                                        onChange={(e) => setProfileImage(e.target.value)}
                                        placeholder="https://example.com/avatar.jpg"
                                        className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Provide a valid image URL for your avatar.</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-6 bg-white/5">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-accent/20 shadow-lg mb-4" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-[#111111] border-4 border-accent/20 flex items-center justify-center mb-4">
                                        <Camera className="w-8 h-8 text-gray-500" />
                                    </div>
                                )}
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="px-6 py-2 bg-accent text-black font-bold rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-2"
                                >
                                    {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Branches Management */}
                    <section className="glass border-border-custom p-8 bg-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Company Branches & Storage</h3>
                                    <p className="text-gray-500 text-sm">Manage physical locations for expenses and invoices</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setBranchFormData({ id: '', name: '', address: '' });
                                    setIsBranchModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 font-bold rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all text-sm"
                            >
                                <Plus size={16} /> Add Branch
                            </button>
                        </div>

                        {loadingBranches ? (
                            <p className="text-center text-gray-500 italic py-4">Loading branches...</p>
                        ) : branches.length === 0 ? (
                            <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl text-gray-500 bg-white/5">
                                No branches or storage locations defined yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {branches.map((b: any) => (
                                    <div key={b.id} className="p-5 rounded-2xl bg-[#111111] border border-white/10 hover:border-blue-500/30 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{b.name}</h4>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleEditBranch(b)} className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-blue-500/10">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteBranch(b.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 break-words line-clamp-2">{b.address || 'No address provided'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Subscription Plans */}
                    <section className="glass border-border-custom p-8 bg-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="p-3 rounded-2xl bg-yellow-500/20 text-yellow-500">
                                <Crown size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Subscription Tier</h3>
                                <p className="text-gray-500 text-sm">Unlock premium features and increase your user limits.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                            {/* Silver */}
                            <div className={`p-6 rounded-2xl border transition-all ${currentPlan === 'silver' ? 'border-accent bg-accent/5' : 'border-white/10 bg-[#111111]'}`}>
                                <div className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Silver Plan</div>
                                <div className="text-2xl font-bold text-white mb-1">3,000 <span className="text-sm font-normal text-gray-500">EGP /mo</span></div>
                                <div className="text-xs text-gray-500 mb-6">or 30,000 EGP /yr</div>
                                <ul className="text-sm text-gray-300 space-y-2 mb-6">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Up to 2 Users</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Standard Core Modules</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Staff Directory</li>
                                    <li className="flex items-center gap-2 text-gray-600"><AlertTriangle className="w-4 h-4" /> No Purchasing Docs</li>
                                    <li className="flex items-center gap-2 text-gray-600"><AlertTriangle className="w-4 h-4" /> No Payroll Engine</li>
                                </ul>
                                <button
                                    onClick={() => handleUpgradePlan('Silver')}
                                    disabled={isUpgrading || currentRank >= 1}
                                    className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${currentPlan === 'silver' ? 'bg-white/10 text-gray-400 cursor-not-allowed' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 opacity-50'}`}
                                >
                                    {currentPlan === 'silver' ? 'Current Plan' : currentRank > 1 ? 'Included' : 'Select Silver'}
                                </button>
                            </div>

                            {/* Gold */}
                            <div className={`p-6 rounded-2xl border transition-all ${currentPlan === 'gold' ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-white/10 bg-[#111111]'}`}>
                                <div className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-2">Gold Plan</div>
                                <div className="text-2xl font-bold text-white mb-1">5,000 <span className="text-sm font-normal text-gray-500">EGP /mo</span></div>
                                <div className="text-xs text-gray-500 mb-6">or 50,000 EGP /yr</div>
                                <ul className="text-sm text-gray-300 space-y-2 mb-6">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-yellow-500" /> Up to 4 Users</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-yellow-500" /> Advanced Inventory</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-yellow-500" /> Full Purchasing Flow</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-yellow-500" /> Deep Reports</li>
                                    <li className="flex items-center gap-2 text-gray-600"><AlertTriangle className="w-4 h-4" /> No Payroll Engine</li>
                                </ul>
                                <button
                                    onClick={() => handleUpgradePlan('Gold')}
                                    disabled={isUpgrading || currentRank >= 2}
                                    className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${currentPlan === 'gold' ? 'bg-yellow-500/20 text-yellow-500 cursor-not-allowed border border-yellow-500/30' : currentRank > 2 ? 'bg-white/10 text-gray-400 cursor-not-allowed' : 'bg-white/5 border border-white/10 text-white hover:border-yellow-500/50 hover:text-yellow-500'}`}
                                >
                                    {currentPlan === 'gold' ? 'Current Plan' : currentRank > 2 ? 'Included' : 'Upgrade to Gold'}
                                </button>
                            </div>

                            {/* Platinum */}
                            <div className={`p-6 rounded-2xl border transition-all ${currentPlan === 'platinum' ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-white/10 bg-[#111111]'}`}>
                                <div className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-2">Platinum Plan</div>
                                <div className="text-2xl font-bold text-white mb-1">7,000 <span className="text-sm font-normal text-gray-500">EGP /mo</span></div>
                                <div className="text-xs text-gray-500 mb-6">or 70,000 EGP /yr</div>
                                <ul className="text-sm text-gray-300 space-y-2 mb-6">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Up to 8 Users</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Gold Plan Everything</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Dynamic Payroll Engine</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Commissions & Advances</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Priority Support</li>
                                </ul>
                                <button
                                    onClick={() => handleUpgradePlan('Platinum')}
                                    disabled={isUpgrading || currentRank >= 3}
                                    className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${currentPlan === 'platinum' ? 'bg-purple-500/20 text-purple-400 cursor-not-allowed border border-purple-500/30' : 'bg-white/5 border border-white/10 text-white hover:border-purple-500/50 hover:text-purple-400'}`}
                                >
                                    {currentPlan === 'platinum' ? 'Current Plan' : 'Upgrade to Platinum'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Account Actions / Danger Zone */}
                    <section className="glass border-red-500/20 p-8 bg-red-500/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-red-500/20 text-red-500">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
                                <p className="text-red-500/70 text-sm">Destructive actions and account logouts</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-[#111111] border border-white/5">
                                <div>
                                    <h4 className="font-bold text-white mb-1">Sign Out</h4>
                                    <p className="text-xs text-gray-500">End your current session securely.</p>
                                </div>
                                <button onClick={logout} className="flex items-center gap-2 px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
                                <div>
                                    <h4 className="font-bold text-red-400 mb-1">Delete Account</h4>
                                    <p className="text-xs text-red-400/70">Permanently remove your user. This cannot be undone.</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Type DELETE"
                                        value={deleteConfirm}
                                        onChange={(e) => setDeleteConfirm(e.target.value)}
                                        className="bg-black/50 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-300 w-32 focus:outline-none focus:border-red-500"
                                    />
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || deleteConfirm !== 'DELETE'}
                                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-500 text-black font-bold disabled:opacity-50 hover:bg-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Branding */}
                <div className="mt-16 text-center pb-8">
                    <p className="text-xs text-gray-600 font-medium tracking-wide">
                        Powered by <span className="text-gray-400 font-bold">Dotstory</span>.finance
                    </p>
                </div>
            </main>

            {/* Modals */}
            <ERPFormModal
                isOpen={isBranchModalOpen}
                onClose={() => setIsBranchModalOpen(false)}
                title={branchFormData.id ? "Edit Branch" : "Add Branch"}
                onSubmit={handleSaveBranch}
                loading={isSavingBranch}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Branch / Location Name</label>
                        <input
                            type="text"
                            value={branchFormData.name}
                            onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                            className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                            placeholder="e.g. Headquarters, Downtown Office..."
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Address / Details</label>
                        <textarea
                            value={branchFormData.address}
                            onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                            className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-blue-500 transition-all text-sm h-24 resize-none"
                            placeholder="Physical address or contact info..."
                        />
                    </div>
                </div>
            </ERPFormModal>
        </div>
    );
}
