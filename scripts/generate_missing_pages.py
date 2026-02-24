import os

pages = {
    "src/app/purchasing/requests/page.tsx": ("Purchase Requests", "purchases", "type === 'Request'"),
    "src/app/purchasing/rfq/page.tsx": ("Request for Quotations", "purchases", "type === 'RFQ'"),
    "src/app/purchasing/quotations/page.tsx": ("Purchase Quotations", "purchases", "type === 'Quotation'"),
    "src/app/purchasing/orders/page.tsx": ("Purchase Orders", "purchases", "type === 'Order'"),
    "src/app/purchasing/invoices/page.tsx": ("Purchase Invoices", "purchases", "type === 'Invoice'"),
    "src/app/purchasing/returns/page.tsx": ("Purchase Returns", "purchases", "type === 'Return'"),
    "src/app/suppliers/payments/page.tsx": ("Supplier Payments", "cheques", "direction === 'Outgoing'"),
    "src/app/suppliers/debit-notes/page.tsx": ("Debit Notes", "purchases", "type === 'Debit Note'"),

    "src/app/payroll/contracts/page.tsx": ("Contracts", "payroll_contracts", "true"),
    "src/app/payroll/register/page.tsx": ("Salary Register", "salary_registers", "true"),
    "src/app/payroll/slips/page.tsx": ("Salary Slips", "salary_registers", "true"),
    "src/app/payroll/advances/page.tsx": ("Salary Advances", "advances", "true"),
    "src/app/payroll/items/page.tsx": ("Salary Items", "salary_items", "true"),
    "src/app/payroll/templates/page.tsx": ("Salary Templates", "salary_templates", "true"),
    
    "src/app/payroll/review/page.tsx": ("Review Requests", "requests", "true"),
}

template = """\"use client\";

import React from "react";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";

export default function Page() {
    const { t } = useLanguage();
    const { data, loading } = useERPData<any>('{table}');
    
    const filteredData = data.filter((item: any) => {condition});

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="javascript:history.back()" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">{title}</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage all your {title.lower()} here.</p>
                        </div>
                    </div>
                </header>

                <div className="glass p-8 flex flex-col items-center justify-center min-h-[400px] border-border-custom text-center">
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                        <Clock size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Module Active</h3>
                    <p className="text-gray-400 max-w-md mb-8">
                        The {title} module is currently running. Full interactive features are rolling out shortly.
                        Found {{filteredData.length}} records in the database.
                    </p>
                    
                    <div className="w-full max-w-4xl text-left glass bg-white/5 p-4 rounded-xl border border-border-custom">
                        <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-4">Latest Records</h4>
                        {{loading ? (
                            <div className="text-gray-500 italic text-sm text-center py-4">Syncing with database...</div>
                        ) : filteredData.length > 0 ? (
                            <div className="space-y-2">
                                {{filteredData.slice(0, 5).map((item: any, i: number) => (
                                    <div key={{i}} className="p-3 bg-white/5 rounded-lg text-sm border border-border-custom flex justify-between">
                                        <span className="font-mono text-accent">{{item.id?.substring(0,8) || `ID-${{1000+i}}`}}</span>
                                        <span className="text-gray-400">{{new Date(item.created_at || Date.now()).toLocaleDateString()}}</span>
                                    </div>
                                ))}}
                            </div>
                        ) : (
                            <div className="text-gray-500 italic text-sm text-center py-4">No records found for this module yet.</div>
                        )}}
                    </div>
                </div>
            </main>
        </div>
    );
}
"""

for path, (title, table, condition) in pages.items():
    content = template.replace("{title}", title).replace("{table}", table).replace("{condition}", condition)
    
    full_path = os.path.join("/Volumes/sameh/invo", path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.replace("{{", "{").replace("}}", "}"))
    
    print(f"Generated {full_path}")
