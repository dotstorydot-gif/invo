"use client";

import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ERPFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSubmit: () => void;
    submitLabel?: string;
    loading?: boolean;
    hideSubmit?: boolean;
    maxWidth?: string;
}

export default function ERPFormModal({
    isOpen,
    onClose,
    title,
    children,
    onSubmit,
    submitLabel = "Save",
    loading = false,
    hideSubmit = false,
    maxWidth = "max-w-2xl"
}: ERPFormModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative w-full ${maxWidth} glass border-border-custom bg-background/80 overflow-hidden`}
                    >
                        <header className="p-6 border-b border-border-custom flex justify-between items-center">
                            <h3 className="text-xl font-bold gradient-text">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            {children}
                        </div>

                        <footer className="p-6 border-t border-border-custom flex justify-end gap-3 bg-white/5">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-xl border border-border-custom hover:border-accent/40 text-gray-400 hover:text-white transition-all font-bold"
                            >
                                {hideSubmit ? "Close" : "Cancel"}
                            </button>
                            {!hideSubmit && (
                                <button
                                    onClick={onSubmit}
                                    disabled={loading}
                                    className="gradient-accent px-8 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {submitLabel}
                                </button>
                            )}
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
