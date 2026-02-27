
import { Sidebar } from "@/app/components/Sidebar";
import { PageTransition } from "@/app/components/PageTransition";

export default function COODashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-transparent font-sans text-gray-900">
            {/* Global Sidebar - Persists across all matching routes */}
            <Sidebar role="coo" />

            {/* Child pages render here */}
            <PageTransition>
                {children}
            </PageTransition>
        </div>
    );
}
