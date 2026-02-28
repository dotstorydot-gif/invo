"use client";

import React, { useState } from "react";
import {
    Users2, CircleDollarSign, Building2, BarChart3, LayoutDashboard,
    Settings, Package, CreditCard, Wallet, Activity, Truck, ShoppingCart,
    Banknote, Users, BadgePercent, ChevronDown, ChevronRight, FileText,
    ClipboardList, Receipt, ArrowRightLeft, ShieldAlert, Handshake
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { LucideIcon, Lock } from "lucide-react";

type SubItem = { label: string; href: string };

const SidebarItem = ({
    icon: Icon, label, href, active, subItems, isLocked = false
}: {
    icon: LucideIcon, label: string, href?: string, active?: boolean, subItems?: SubItem[], isLocked?: boolean
}) => {
    const { isRTL } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isChildActive = subItems?.some(item => pathname === item.href);
    const isActive = active || isChildActive;

    const content = (
        <div
            onClick={() => !isLocked && subItems && setIsOpen(!isOpen)}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${isLocked ? 'cursor-not-allowed opacity-50 bg-white/5 border border-white/5' : 'cursor-pointer'} ${isActive && !subItems && !isLocked ? 'bg-accent/10 text-accent border border-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'} ${isChildActive && !isLocked ? 'text-white' : ''}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={20} className={`${isActive && !isLocked ? 'text-accent' : ''} ${isRTL ? "sidebar-icon" : ""}`} />
                <span className="font-medium text-sm">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {isLocked && <Lock size={14} className="text-gray-500" />}
                {subItems && !isLocked && (
                    isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-1">
            {href && !subItems && !isLocked ? (
                <Link href={href}>{content}</Link>
            ) : (
                content
            )}

            {subItems && isOpen && !isLocked && (
                <div className="flex flex-col gap-1 pl-11 pr-4 mt-1">
                    {subItems.map(sub => {
                        const isSubActive = pathname === sub.href;
                        return (
                            <Link key={sub.label} href={sub.href}>
                                <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm transition-all duration-300 ${isSubActive ? 'bg-white/10 text-white font-medium' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}>
                                    <span>{sub.label}</span>
                                    <ChevronRight size={14} className="opacity-50" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default function Sidebar() {
    const { t } = useLanguage();
    const pathname = usePathname();

    const { session } = useAuth();

    // Gating Logic
    const plan = session?.subscriptionPlan?.toLowerCase() || 'platinum';
    const isSilver = plan === 'silver';
    const isGold = plan === 'gold';
    const isPlatinum = plan === 'platinum';

    // Module Logic
    const isMarketingModule = session?.moduleType?.toLowerCase().includes('marketing') || session?.moduleType?.toLowerCase().includes('service');
    const isEmployee = session?.isEmployee === true;

    return (
        <aside className="w-72 border-r border-[#1a1a1a] p-5 flex flex-col gap-8 h-screen sticky top-0 overflow-y-auto bg-[#050505] custom-scrollbar">
            <div className="flex items-center gap-3 px-2 mt-2">
                {session?.profilePicture ? (
                    <img src={session.profilePicture} alt="Org Logo" className="w-10 h-10 rounded-xl object-cover border border-accent/20 shadow-[0_0_15px_rgba(20,255,140,0.1)]" />
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#0e3b2e] border border-accent/20 flex items-center justify-center font-bold text-accent shadow-[0_0_15px_rgba(20,255,140,0.1)]">
                        {session?.orgName ? session.orgName.charAt(0).toUpperCase() : 'O'}
                    </div>
                )}
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white line-clamp-1">
                        {session?.orgName || 'Organization'}
                    </h1>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isEmployee ? 'bg-blue-500/20 text-blue-400' : plan === 'platinum' ? 'bg-purple-500/20 text-purple-400' :
                            plan === 'gold' ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-gray-500/20 text-gray-400'
                            }`}>
                            {isEmployee ? t('staff_member') : `${session?.subscriptionPlan || t('plan_platinum')} ${t('plan_label')}`}
                        </span>
                    </div>
                </div>
            </div>

            <nav className="flex flex-col gap-1.5 flex-1">
                {isEmployee ? (
                    <>
                        <SidebarItem href="/" icon={LayoutDashboard} label={t('dashboard')} active={pathname === '/'} />
                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-4 mb-2 pl-4">{t('staff_modules')}</div>
                        <SidebarItem href="/tasks" icon={ClipboardList} label={t('task_board')} active={pathname === '/tasks'} />
                    </>
                ) : (
                    <>
                        <SidebarItem href="/" icon={LayoutDashboard} label={t('dashboard')} active={pathname === '/'} />

                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-4 mb-2 pl-4">{t('core_modules')}</div>
                        <SidebarItem href="/projects" icon={Building2} label={t('projects')} active={pathname === '/projects'} />

                        {isMarketingModule ? (
                            <>
                                <SidebarItem href="/services" icon={Activity} label={t('services_module')} active={pathname === '/services'} />
                                <SidebarItem href="/tasks" icon={ClipboardList} label={t('task_board')} active={pathname === '/tasks'} />
                            </>
                        ) : (
                            <SidebarItem href="/units" icon={Building2} label={t('rentals')} active={pathname === '/units'} />
                        )}

                        <SidebarItem isLocked={isSilver} icon={BadgePercent} label={t('sales')} subItems={[
                            { label: t("sales_invoices"), href: "/invoices" },
                            { label: t("client_quotations"), href: "/quotations" },
                        ]} />
                        <SidebarItem href="/customers" icon={Users} label={isMarketingModule ? t("clients") : t("customers")} active={pathname === '/customers'} />
                        <SidebarItem href="/loans" icon={Handshake} label={t("loans_dashboard")} active={pathname === '/loans'} />

                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-4 mb-2 pl-4">{t("purchasing_logistics")}</div>
                        <SidebarItem isLocked={isSilver} icon={ShoppingCart} label={t("purchasing_cycle")} subItems={[
                            { label: t("purchase_requests"), href: "/purchasing/requests" },
                            { label: t("rfqs"), href: "/purchasing/rfq" },
                            { label: t("purchase_quotations"), href: "/purchasing/quotations" },
                            { label: t("purchase_orders"), href: "/purchasing/orders" },
                            { label: t("purchase_invoices"), href: "/purchasing/invoices" },
                            { label: t("purchase_returns"), href: "/purchasing/returns" },
                        ]} />
                        <SidebarItem isLocked={isSilver} icon={Truck} label={t("suppliers")} subItems={[
                            { label: t("supplier_management"), href: "/suppliers/directory" },
                            { label: t("supplier_payments"), href: "/suppliers/payments" },
                            { label: t("debit_notes"), href: "/suppliers/debit-notes" },
                        ]} />

                        {isMarketingModule ? (
                            <SidebarItem isLocked={isSilver} href="/assets" icon={Package} label={t("assets")} active={pathname === '/assets'} />
                        ) : (
                            <SidebarItem isLocked={isSilver} href="/inventory" icon={Package} label={t('inventory')} active={pathname === '/inventory'} />
                        )}

                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-4 mb-2 pl-4">{t("financials_reports")}</div>
                        <SidebarItem href="/expenses" icon={Activity} label={t('expenses')} active={pathname === '/expenses'} />
                        <SidebarItem href="/stash" icon={Wallet} label={t('stash')} active={pathname === '/stash'} />
                        <SidebarItem href="/installments" icon={CreditCard} label={t('installments')} active={pathname === '/installments'} />
                        <SidebarItem href="/cheques" icon={Wallet} label={t('cheques')} active={pathname === '/cheques'} />
                        <SidebarItem href="/forecasting" icon={BarChart3} label={t("cashflow_forecast")} active={pathname === '/forecasting'} />
                        <SidebarItem isLocked={isSilver} href="/reports" icon={BarChart3} label={t('reports')} active={pathname === '/reports'} />

                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-4 mb-2 pl-4">{t("human_resources")}</div>
                        <SidebarItem href="/staff" icon={Users2} label={t("employees_directory")} active={pathname === '/staff'} />
                        <SidebarItem isLocked={isSilver || isGold} icon={Banknote} label={t("payroll_engine")} subItems={[
                            { label: t("contracts"), href: "/payroll/contracts" },
                            { label: t("salary_register"), href: "/payroll/register" },
                            { label: t("salary_slips"), href: "/payroll/slips" },
                            { label: t("salary_advances"), href: "/payroll/advances" },
                            { label: t("salary_items"), href: "/payroll/items" },
                            { label: t("salary_templates"), href: "/payroll/templates" },
                        ]} />
                    </>
                )}
            </nav>

            <div className="pt-6 mt-4 border-t border-[#1a1a1a] flex flex-col gap-4">
                <SidebarItem href="/settings" icon={Settings} label={t('settings')} active={pathname === '/settings'} />

                <div className="px-5 mt-2">
                    <p className="text-[10px] text-gray-600 font-semibold tracking-wider">
                        <span className="text-white">.finance</span>
                    </p>
                    <p className="text-[9px] text-gray-500 font-medium mt-1">
                        Powered by Dotstory
                    </p>
                </div>
            </div>
        </aside>
    );
}
