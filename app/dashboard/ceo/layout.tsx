import { Sidebar } from "@/app/components/Sidebar";
import { PageTransition } from "@/app/components/PageTransition";

export default function CEODashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-transparent font-sans text-gray-900">
            <Sidebar role="ceo" />

            {/* Child pages render here */}
            <PageTransition>
                {children}
            </PageTransition>
        </div>
    );
}
