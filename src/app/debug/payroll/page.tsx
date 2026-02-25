"use client";

import React from "react";
import { useERPData } from "@/hooks/useERPData";

export default function PayrollDebugPage() {
    const { data: staff, loading } = useERPData<any>('staff');

    if (loading) return <div>Loading staff data...</div>;

    const totalBaseSalary = staff.reduce((sum: number, s: any) => sum + (Number(s.base_salary || s.baseSalary || 0)), 0);

    return (
        <div className="p-10 bg-black text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Payroll Audit (Debug)</h1>
            <p className="text-gray-400 mb-6">This page shows the raw data used for forecasting calculations.</p>

            <div className="glass p-6 border-border-custom mb-8">
                <div className="text-sm font-bold text-gray-500 uppercase">Calculated Total Monthly Payroll</div>
                <div className="text-4xl font-bold text-accent">{totalBaseSalary.toLocaleString()} EGP</div>
                <p className="text-[10px] text-gray-500 mt-2">Sum of base_salary for all {staff.length} employees</p>
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-border-custom text-gray-500 text-xs font-bold uppercase">
                        <th className="p-2">Name</th>
                        <th className="p-2">ID</th>
                        <th className="p-2">Base Salary</th>
                        <th className="p-2">Role</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map((s: any) => (
                        <tr key={s.id} className="border-b border-border-custom hover:bg-white/5 transition-colors">
                            <td className="p-2 font-bold">{s.name || 'N/A'}</td>
                            <td className="p-2 text-[10px] font-mono text-gray-500">{s.id}</td>
                            <td className="p-2 font-mono text-accent">{Number(s.base_salary || s.baseSalary || 0).toLocaleString()}</td>
                            <td className="p-2 text-xs text-gray-400">{s.role || 'N/A'}</td>
                        </tr>
                    ))}
                    {staff.length === 0 && (
                        <tr><td colSpan={4} className="p-10 text-center italic text-gray-500">No employees found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
