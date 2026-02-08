"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CEODashboardRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.push('/dashboard/ceo/employees');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iqm-primary"></div>
        </div>
    );
}
