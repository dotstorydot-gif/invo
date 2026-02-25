'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionData {
    userId: string;
    orgId: string;
    role: string;
    username: string;
    fullName: string;
    orgName: string;
    profilePicture?: string | null;
    subscriptionPlan?: 'Platinum' | 'Gold' | 'Silver' | string;
    moduleType?: 'Real Estate' | 'Service & Marketing' | string;
    isEmployee?: boolean;
}

interface AuthContextType {
    session: SessionData | null;
    loading: boolean;
    logout: () => void;
    updateSession: (newData: Partial<SessionData>) => void;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true, logout: () => { }, updateSession: () => { } });

export function AuthProvider({ children, initialSession }: { children: React.ReactNode, initialSession: SessionData | null }) {
    const [session, setSession] = useState<SessionData | null>(initialSession);
    const router = useRouter();

    useEffect(() => {
        setSession(initialSession);
    }, [initialSession]);

    const logout = async () => {
        // Call server action or API
        await fetch('/api/auth/logout', { method: 'POST' });
        setSession(null);
        router.push('/login');
    };

    const updateSession = (newData: Partial<SessionData>) => {
        setSession(prev => prev ? { ...prev, ...newData } : null);
    };

    return (
        <AuthContext.Provider value={{ session, loading: false, logout, updateSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
