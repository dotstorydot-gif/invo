import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Users, Briefcase, CreditCard, ChevronRight, ChevronLeft, X, LayoutGrid, Check } from 'lucide-react';
import Link from 'next/link';

interface SetupWizardProps {
    isOpen: boolean;
    onClose: () => void;
    isMarketing: boolean;
}

export default function SetupWizard({ isOpen, onClose, isMarketing }: SetupWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const steps = [
        {
            title: "Organization Profile",
            icon: Building,
            description: "Welcome to your new ERP system! Before diving into projects, make sure your organization settings, branches, and profile are fully configured.",
            actionText: "Go to Settings",
            actionLink: "/settings",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20"
        },
        {
            title: "Build Your Team",
            icon: Users,
            description: "An ERP needs people to run it. Head over to the Staff module to create your employee records and assign them to departments structure.",
            actionText: "Manage Staff",
            actionLink: "/staff",
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20"
        },
        {
            title: isMarketing ? "Launch First Campaign" : "Create Construction Project",
            icon: isMarketing ? Briefcase : LayoutGrid,
            description: isMarketing
                ? "Start tracking your work by creating your first Campaign or Project. You can then attach services and assign staff tasks to it."
                : "Initialize your real estate or construction project. You can manage units, occupancy, and assign engineers.",
            actionText: "Go to Projects",
            actionLink: "/projects",
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20"
        },
        {
            title: "Setup Finances",
            icon: CreditCard,
            description: "With your team and projects ready, configure your financial baselines. Set up payroll contracts or review the chart of accounts.",
            actionText: "Manage Finances",
            actionLink: "/payroll",
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            border: "border-purple-400/20"
        }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden relative z-[101] shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Setup Pipeline</h2>
                        <p className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar / Stepper */}
                <div className="px-8 pt-8 pb-4 relative">
                    <div className="absolute top-1/2 left-12 right-12 h-1 bg-white/5 -translate-y-1/2 rounded-full z-0 h-1 mt-4">
                        <div
                            className="h-full bg-accent rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        />
                    </div>

                    <div className="relative z-10 flex justify-between">
                        {steps.map((step, idx) => {
                            const isCompleted = currentStep > idx;
                            const isActive = currentStep === idx;

                            return (
                                <div key={idx} className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={() => setCurrentStep(idx)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-accent text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                                            isActive ? 'bg-accent/20 border-2 border-accent text-accent' :
                                                'bg-[#1a1a1a] border-2 border-white/10 text-gray-500 hover:border-white/30'
                                            }`}
                                    >
                                        {isCompleted ? <Check size={18} /> : <span>{idx + 1}</span>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 relative min-h-[250px] overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex gap-8 items-center"
                        >
                            {(() => {
                                const CurrentIcon = steps[currentStep].icon;
                                return (
                                    <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 ${steps[currentStep].bg} ${steps[currentStep].border} border`}>
                                        <CurrentIcon className={`w-12 h-12 ${steps[currentStep].color}`} />
                                    </div>
                                );
                            })()}

                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-white mb-2">{steps[currentStep].title}</h3>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    {steps[currentStep].description}
                                </p>

                                <Link
                                    href={steps[currentStep].actionLink}
                                    onClick={onClose}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all text-sm group"
                                >
                                    {steps[currentStep].actionText}
                                    <ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div >

                {/* Footer Controls */}
                < div className="p-6 border-t border-white/5 bg-black/20 flex justify-between items-center" >
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentStep === 0 ? 'opacity-50 cursor-not-allowed text-gray-500' : 'hover:bg-white/5 text-white hover:text-accent'
                            }`}
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    <div className="flex gap-2">
                        {steps.map((_, idx) => (
                            <div key={idx} className={`w - 2 h - 2 rounded - full transition - all ${idx === currentStep ? 'bg-accent w-4' : 'bg-white/20'} `} />
                        ))}
                    </div>

                    <button
                        onClick={currentStep === steps.length - 1 ? onClose : nextStep}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-lg text-white text-sm font-bold transition-all"
                    >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Next Step'}
                        {currentStep !== steps.length - 1 && <ChevronRight size={16} />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
