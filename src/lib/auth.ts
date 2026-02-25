'use server';

import { cookies } from 'next/headers';
import { supabase } from './supabase';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function loginWithOrg(formData: FormData) {
    const orgSubdomainOrName = formData.get('org') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string; // in prod, hash compare

    if (!orgSubdomainOrName || !username || !password) {
        return { error: 'All fields are required.' };
    }

    const isEmployeeLogin = formData.get('isEmployee') === 'true';

    // 1. Find the organization
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, subscription_plan, module_type')
        .or(`name.ilike.%${orgSubdomainOrName}%,subdomain.ilike.%${orgSubdomainOrName}%`)
        .limit(1)
        .single();

    if (orgError || !org) {
        return { error: 'Organization not found.' };
    }

    let user;

    if (isEmployeeLogin) {
        // 2a. Find the employee inside that organization
        const { data: staffData, error: staffError } = await supabase
            .from('staff')
            .select('id, organization_id, name, department, email')
            // Match against email or a derived username if possible, assuming email for now
            .eq('organization_id', org.id)
            .eq('email', username)
            .limit(1)
            .single();

        if (staffError || !staffData) {
            return { error: 'Invalid employee email.' };
        }

        // Simplistic password check (assuming password matches 'password' field if it existed, for MVP let's assume they all use '123456')
        if (password !== '123456') {
            return { error: 'Invalid password.' };
        }

        user = {
            id: staffData.id,
            organization_id: staffData.organization_id,
            username: staffData.email,
            role: 'Employee',
            full_name: staffData.name,
            profile_picture: null,
            isEmployee: true
        };

    } else {
        // 2b. Find the admin user inside that organization
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, organization_id, username, password_hash, role, full_name, profile_picture')
            .eq('organization_id', org.id)
            .eq('username', username)
            .limit(1)
            .single();

        if (userError || !userData) {
            return { error: 'Invalid username credentials.' };
        }

        // 3. Verify password (MVP: direct match, PROD: bcrypt compare)
        if (userData.password_hash !== password) {
            return { error: 'Invalid password.' };
        }

        user = { ...userData, isEmployee: false };
    }

    // 4. Set secure session cookie
    const sessionData = {
        userId: user.id,
        orgId: user.organization_id,
        role: user.role,
        username: user.username,
        fullName: user.full_name,
        orgName: org.name,
        profilePicture: user.profile_picture,
        subscriptionPlan: org.subscription_plan,
        moduleType: org.module_type,
        isEmployee: user.isEmployee
    };

    const cookieStore = await cookies();
    cookieStore.set('invoica_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
    });

    // Invalidate the root layout cache to ensure immediate UI updates for moduleType
    revalidatePath('/', 'layout');

    // Redirect based on role
    if (user.role === 'Superadmin') {
        redirect('/superadmin');
    } else {
        redirect('/');
    }
}

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete('invoica_session');
    redirect('/login');
}
