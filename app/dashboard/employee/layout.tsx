"use client";
import { Sidebar } from "@/app/components/Sidebar";

export default function EmployeeDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Global Sidebar - Persists across all matching routes */}
            <Sidebar role="employee" />

            {/* Child pages render here */}
            {children}
        </div>
    );
}
