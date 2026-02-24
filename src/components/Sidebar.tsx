"use client";

import React from "react";
import {
    Users2,
    CircleDollarSign,
    Building2,
    BarChart3,
    LayoutDashboard,
    Settings,
    ChevronUp,
    Package,
    CreditCard,
    Wallet,
    Activity,
    Truck,
    ShoppingCart,
    Banknote,
    Users,
    BadgePercent
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { LucideIcon } from "lucide-react";

const SidebarItem = ({ icon: Icon, label, href, active = false }: { icon: LucideIcon, label: string, href: string, active?: boolean }) => {
    const { isRTL } = useLanguage();
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${active ? 'bg-accent/10 text-accent border border-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon size={20} className={isRTL ? "sidebar-icon" : ""} />
                <span className="font-medium text-sm">{label}</span>
            </div>
        </Link>
    );
};

export default function Sidebar() {
    const { t } = useLanguage();
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-border-custom p-6 flex flex-col gap-8 h-screen sticky top-0 overflow-y-auto bg-background">
            <div className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center font-bold text-white">I</div>
                <h1 className="text-xl font-bold tracking-tight">Invoica</h1>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
                <SidebarItem href="/" icon={LayoutDashboard} label={t('dashboard')} active={pathname === '/'} />
                <SidebarItem href="/sales/new" icon={BadgePercent} label="New Sale" active={pathname === '/sales/new'} />
                <SidebarItem href="/projects" icon={Building2} label={t('projects')} active={pathname === '/projects'} />
                <SidebarItem href="/customers" icon={Users} label="Customers" active={pathname === '/customers'} />
                <SidebarItem href="/installments" icon={CreditCard} label={t('installments')} active={pathname === '/installments'} />
                <SidebarItem href="/cheques" icon={Wallet} label={t('cheques')} active={pathname === '/cheques'} />
                <SidebarItem href="/invoices" icon={CircleDollarSign} label={t('sales')} active={pathname === '/invoices'} />
                <SidebarItem href="/units" icon={Building2} label={t('rentals')} active={pathname === '/units'} />
                <SidebarItem href="/inventory" icon={Package} label={t('inventory')} active={pathname === '/inventory'} />
                <SidebarItem href="/purchases" icon={ShoppingCart} label={t('purchases')} active={pathname === '/purchases'} />
                <SidebarItem href="/suppliers" icon={Truck} label={t('suppliers')} active={pathname === '/suppliers'} />
                <SidebarItem href="/staff" icon={Users2} label={t('staff')} active={pathname === '/staff'} />
                <SidebarItem href="/payroll" icon={Banknote} label={t('payroll')} active={pathname === '/payroll'} />
                <SidebarItem href="/reports" icon={BarChart3} label={t('reports')} active={pathname === '/reports'} />
                <SidebarItem href="/expenses" icon={Activity} label={t('expenses')} active={pathname === '/expenses'} />
            </nav>

            <div className="pt-6 border-t border-border-custom">
                <SidebarItem href="/settings" icon={Settings} label={t('settings')} active={pathname === '/settings'} />
            </div>
        </aside>
    );
}
