
import { Sidebar } from "@/app/components/Sidebar";

export default function CCODashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Global Sidebar - Persists across all matching routes */}
            <Sidebar role="cco" />

            {/* Child pages render here */}
            {children}
        </div>
    );
}
