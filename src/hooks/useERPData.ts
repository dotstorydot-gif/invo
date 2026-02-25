import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { useAuth } from '@/context/AuthContext';

export function useERPData<T>(table: string) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { session } = useAuth();
    const orgId = session?.orgId;

    const fetchData = useCallback(async () => {
        if (!orgId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data: result, error: fetchError } = await supabase
                .from(table)
                .select('*')
                .eq('organization_id', orgId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setData(result || []);
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else if ((err as PostgrestError).message) setError((err as PostgrestError).message);
            else setError('An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [table, orgId]);

    const upsert = async (payload: Partial<T>) => {
        if (!orgId) throw new Error('Missing organization ID');
        try {
            const { data: result, error: upsertError } = await supabase
                .from(table)
                .upsert({ ...payload, organization_id: orgId })
                .select();

            if (upsertError) throw upsertError;
            await fetchData();
            return result;
        } catch (err: unknown) {
            let message = 'An unknown error occurred';
            if (err instanceof Error) message = err.message;
            else if ((err as PostgrestError).message) message = (err as PostgrestError).message;
            setError(message);
            throw err; // Re-throw to allow component level handling
        }
    };

    const remove = async (id: string) => {
        if (!orgId) throw new Error('Missing organization ID');
        try {
            const { error: removeError } = await supabase
                .from(table)
                .delete()
                .eq('id', id)
                .eq('organization_id', orgId);

            if (removeError) throw removeError;
            await fetchData();
            return true;
        } catch (err: unknown) {
            let message = 'An unknown error occurred';
            if (err instanceof Error) message = err.message;
            else if ((err as PostgrestError).message) message = (err as PostgrestError).message;
            setError(message);
            throw err; // Re-throw to allow component level handling
        }
    };

    useEffect(() => {
        if (!orgId) return;
        fetchData();

        // Enable Real-time filtered by org
        const channel = supabase
            .channel(`${table}-db-changes-${orgId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table, filter: `organization_id=eq.${orgId}` }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, fetchData, orgId]);

    return { data, loading, error, upsert, remove, refresh: fetchData };
}
