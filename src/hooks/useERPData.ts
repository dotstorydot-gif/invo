import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export function useERPData<T>(table: string) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const { data: result, error: fetchError } = await supabase
                .from(table)
                .select('*')
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
    }, [table]);

    const upsert = async (payload: Partial<T>) => {
        try {
            const { error: upsertError } = await supabase
                .from(table)
                .upsert(payload);

            if (upsertError) throw upsertError;
            await fetchData();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else if ((err as PostgrestError).message) setError((err as PostgrestError).message);
        }
    };

    useEffect(() => {
        fetchData();

        // Enable Real-time
        const channel = supabase
            .channel(`${table}-db-changes`)
            .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, fetchData]);

    return { data, loading, error, upsert, refresh: fetchData };
}
