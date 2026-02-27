"use client";
import { Sidebar } from "@/app/components/Sidebar";
import { PageTransition } from "@/app/components/PageTransition";

export default function LeadDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-transparent font-sans text-gray-900">
            {/* Global Sidebar - Persists across all matching routes */}
            <Sidebar role="lead" />

            {/* Child pages (Dashboard, Tasks, etc) render here */}
            {/* They must handle their own Header and Main layout offsets if needed, 
                but Sidebar is now guaranteed to be stable. */}
            <PageTransition>
                {children}
            </PageTransition>
        </div>
    );
}
