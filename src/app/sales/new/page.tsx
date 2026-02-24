"use client";

import React, { useState } from "react";
import {
    Users,
    Home,
    CreditCard,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Plus,
    Search,
    ChevronRight,
    Calendar,
    DollarSign,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useERPData } from "@/hooks/useERPData";

const STEPS = [
    { id: 1, title: "Customer", icon: Users },
    { id: 2, title: "Unit Select", icon: Home },
    { id: 3, title: "Payment Plan", icon: CreditCard },
    { id: 4, title: "Final Review", icon: CheckCircle2 }
];

interface Customer { id: string; name: string; phone: string; email: string; }
interface Unit {
    id: string;
    name: string;
    price: number;
    status: string;
    project?: string;
    consumer_name?: string;
    paid_amount?: number;
}
interface Plan { id: string; name: string; installments_count: number; interest_rate: number; down_payment_percentage: number; }

export default function NewSalePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data Hooks
    const { data: customers } = useERPData<Customer>('customers');
    const { data: units } = useERPData<Unit>('units');
    const { data: plans } = useERPData<Plan>('payment_plans');
    const { upsert: upsertCustomer } = useERPData<Customer>('customers');
    const { upsert: upsertInvoice } = useERPData<any>('sales_invoices');
    const { upsert: upsertInstallment } = useERPData<any>('installments');
    const { upsert: updateUnit } = useERPData<Unit>('units');

    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const availableUnits = units.filter((u: any) => u.status === 'Available');

    const handleCompleteSale = async () => {
        try {
            setIsSubmitting(true);

            let customerId = selectedCustomer?.id;

            // 1. Create Customer if new
            if (!customerId) {
                const res = await upsertCustomer({
                    name: newCustomer.name,
                    phone: newCustomer.phone,
                    email: newCustomer.email
                });

                if (res && res.length > 0) {
                    customerId = res[0].id;
                }
            }

            if (!customerId && !selectedCustomer) {
                alert("Please select or create a customer first.");
                return;
            }

            if (!selectedUnit) {
                alert("Please select a unit first.");
                return;
            }

            // 2. Create Sales Invoice
            await upsertInvoice({
                customer_id: customerId,
                unit_id: selectedUnit.id,
                amount: selectedUnit.price,
                status: 'Paid', // Assuming initial sale
                due_date: new Date().toISOString().split('T')[0]
            });

            // 3. Update Unit Status
            await updateUnit({
                id: selectedUnit.id,
                status: selectedPlan ? 'Installments' : 'Sold',
                consumer_name: selectedCustomer?.name || newCustomer.name,
                paid_amount: 0 // Default for now
            });

            // 4. Create Installment Schedule if plan selected
            if (selectedPlan && customerId) {
                await upsertInstallment({
                    unit_id: selectedUnit.id,
                    customer_id: customerId,
                    plan_id: selectedPlan.id,
                    total_amount: selectedUnit.price,
                    paid_amount: 0,
                    status: 'Pending',
                    next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
            }

            alert("Sale completed successfully!");
            router.push('/invoices');
        } catch (error) {
            console.error("Sale Error:", error);
            alert("Failed to complete sale.");
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
                            <h2 className="text-3xl font-bold gradient-text">Unified Sale Wizard</h2>
                            <p className="text-gray-400 text-sm mt-1">Convert leads to owners in one seamless flow</p>
                        </div>
                    </div>
                </header>

                {/* Progress Stepper */}
                <div className="flex items-center justify-between max-w-4xl mx-auto mb-16 relative">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-[2px] gradient-accent -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        const isCompleted = currentStep > step.id;
                        const isActive = currentStep === step.id;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${isCompleted ? 'bg-accent border-accent text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' :
                                    isActive ? 'bg-background border-accent text-accent' :
                                        'bg-background border-border-custom text-gray-500'
                                    }`}>
                                    <Icon size={20} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-accent' : 'text-gray-500'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <div className="max-w-4xl mx-auto min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="glass border-border-custom p-6 space-y-4">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <Search size={18} className="text-accent" />
                                            Select Existing Customer
                                        </h3>
                                        <div className="flex items-center gap-2 bg-white/5 border border-border-custom rounded-xl px-4 py-2">
                                            <Search size={16} className="text-gray-400" />
                                            <input type="text" placeholder="Search by name or phone..." className="bg-transparent border-none outline-none text-sm w-full" />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {customers.map((c: any) => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => setSelectedCustomer(c)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedCustomer?.id === c.id ? 'border-accent bg-accent/10' : 'border-border-custom hover:bg-white/5'}`}
                                                >
                                                    <div className="font-bold">{c.name}</div>
                                                    <div className="text-xs text-gray-500">{c.phone}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass border-border-custom p-6 space-y-4">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <Plus size={18} className="text-accent" />
                                            Or Create New Customer
                                        </h3>
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={newCustomer.name}
                                                onChange={(e) => {
                                                    setNewCustomer({ ...newCustomer, name: e.target.value });
                                                    setSelectedCustomer(null);
                                                }}
                                                className="w-full bg-white/5 border border-border-custom rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Phone Number"
                                                value={newCustomer.phone}
                                                onChange={(e) => {
                                                    setNewCustomer({ ...newCustomer, phone: e.target.value });
                                                    setSelectedCustomer(null);
                                                }}
                                                className="w-full bg-white/5 border border-border-custom rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-sm"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                value={newCustomer.email}
                                                onChange={(e) => {
                                                    setNewCustomer({ ...newCustomer, email: e.target.value });
                                                    setSelectedCustomer(null);
                                                }}
                                                className="w-full bg-white/5 border border-border-custom rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold mb-6">Allocate Unit</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    {availableUnits.map((u: any) => (
                                        <button
                                            key={u.id}
                                            onClick={() => setSelectedUnit(u)}
                                            className={`glass border-2 flex flex-col p-6 text-left transition-all ${selectedUnit?.id === u.id ? 'border-accent bg-accent/10' : 'border-border-custom hover:border-accent/40'}`}
                                        >
                                            <Home size={24} className="text-accent mb-4" />
                                            <div className="font-bold text-lg mb-1">{u.name}</div>
                                            <div className="text-xs text-gray-400 mb-4">{u.project || "Standalone"}</div>
                                            <div className="mt-auto pt-4 border-t border-border-custom flex justify-between items-center w-full">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price</span>
                                                <span className="font-bold text-accent">${u.price?.toLocaleString()}</span>
                                            </div>
                                        </button>
                                    ))}
                                    {availableUnits.length === 0 && (
                                        <div className="col-span-3 p-12 text-center glass border-dashed border-border-custom opacity-50 italic">
                                            No available units found. Please add units first.
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Select Strategy</h3>
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setSelectedPlan(null)}
                                                className={`w-full p-6 text-left rounded-2xl border transition-all ${!selectedPlan ? 'border-accent bg-accent/10' : 'border-border-custom hover:bg-white/5'}`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-lg">Full Cash Payment</span>
                                                    <DollarSign size={20} className="text-emerald-500" />
                                                </div>
                                                <p className="text-xs text-gray-500">100% upfront payment, marks unit as sold immediately.</p>
                                            </button>

                                            {plans.map((p: any) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setSelectedPlan(p)}
                                                    className={`w-full p-6 text-left rounded-2xl border transition-all ${selectedPlan?.id === p.id ? 'border-accent bg-accent/10' : 'border-border-custom hover:bg-white/5'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-lg">{p.name}</span>
                                                        <Calendar size={20} className="text-blue-500" />
                                                    </div>
                                                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                        <span>{p.installments_count} Months</span>
                                                        <span>{p.interest_rate}% Interest</span>
                                                        <span>{p.down_payment_percentage}% Down</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass border-border-custom p-8 space-y-6">
                                        <h4 className="font-bold border-b border-border-custom pb-4">Financial Summary</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Unit Price</span>
                                                <span className="font-bold">${selectedUnit?.price?.toLocaleString() || '0'}</span>
                                            </div>
                                            {selectedPlan && selectedUnit && (
                                                <>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400">Down Payment ({selectedPlan.down_payment_percentage}%)</span>
                                                        <span className="font-bold text-accent">${(selectedUnit.price * selectedPlan.down_payment_percentage / 100).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400">Interest ({selectedPlan.interest_rate}%)</span>
                                                        <span className="font-bold text-blue-400">+${(selectedUnit.price * selectedPlan.interest_rate / 100).toLocaleString()}</span>
                                                    </div>
                                                    <div className="pt-4 border-t border-border-custom flex justify-between items-center">
                                                        <span className="text-sm font-bold uppercase">Monthly Installment</span>
                                                        <span className="text-xl font-bold gradient-text">
                                                            ${((selectedUnit.price * (1 + selectedPlan.interest_rate / 100) - (selectedUnit.price * selectedPlan.down_payment_percentage / 100)) / selectedPlan.installments_count).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <div className="w-20 h-20 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto mb-8 animate-pulse">
                                    <Info size={40} />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Complete Transaction?</h3>
                                <p className="text-gray-400 max-w-md mx-auto mb-10">
                                    By clicking complete, the system will automatically:
                                    <br />1. Register <strong>{selectedCustomer?.name || newCustomer.name}</strong> as the owner.
                                    <br />2. Allocate <strong>{selectedUnit?.name}</strong>.
                                    <br />3. Generate a sales invoice for <strong>${selectedUnit?.price?.toLocaleString()}</strong>.
                                    {selectedPlan && <><br />4. Create a <strong>{selectedPlan?.name}</strong> schedule.</>}
                                </p>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        className="px-8 py-3 rounded-xl border border-border-custom hover:border-accent transition-all font-bold"
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={handleCompleteSale}
                                        disabled={isSubmitting}
                                        className="gradient-accent px-12 py-3 rounded-xl text-white font-bold hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2"
                                    >
                                        {isSubmitting ? "Processing..." : "Finish Sale"}
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                {currentStep < 4 && (
                    <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-border-custom flex justify-between">
                        <button
                            disabled={currentStep === 1}
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="px-6 py-2 rounded-xl border border-border-custom text-gray-400 hover:text-white disabled:opacity-30 transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Back
                        </button>
                        <button
                            disabled={
                                (currentStep === 1 && !selectedCustomer && !newCustomer.name) ||
                                (currentStep === 2 && !selectedUnit)
                            }
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="gradient-accent px-8 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 disabled:opacity-30"
                        >
                            Next Step
                            <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
