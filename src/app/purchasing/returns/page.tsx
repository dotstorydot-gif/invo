"use client";

import React from "react";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useERPData } from "@/hooks/useERPData";

interface PurchaseRecord {
    id: string;
    type: string;
    created_at: string;
}

export default function Page() {
    const { data, loading } = useERPData<PurchaseRecord>('purchases');

    const filteredData = data.filter((item) => item.type === 'Return');

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="javascript:history.back()" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Purchase Returns</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage all your purchase returns here.</p>
                        </div>
                    </div>
                </header>

                <div className="glass p-8 flex flex-col items-center justify-center min-h-[400px] border-border-custom text-center">
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                        <Clock size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Module Active</h3>
                    <p className="text-gray-400 max-w-md mb-8">
                        The Purchase Returns module is currently running. Full interactive features are rolling out shortly.
                        Found {filteredData.length} records in the database.
                    </p>

                    <div className="w-full max-w-4xl text-left glass bg-white/5 p-4 rounded-xl border border-border-custom">
                        <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-4">Latest Records</h4>
                        {loading ? (
                            <div className="text-gray-500 italic text-sm text-center py-4">Syncing with database...</div>
                        ) : filteredData.length > 0 ? (
                            <div className="space-y-2">
                                {filteredData.slice(0, 5).map((item, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded-lg text-sm border border-border-custom flex justify-between">
                                        <span className="font-mono text-accent">{item.id?.substring(0, 8) || `ID-${1000 + i}`}</span>
                                        <span className="text-gray-400">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'New'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 italic text-sm text-center py-4">No records found for this module yet.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
