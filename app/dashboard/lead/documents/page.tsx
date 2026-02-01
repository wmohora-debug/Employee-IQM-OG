import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { DocumentsSection } from "@/app/components/DocumentsSection";

export default function LeadDocumentsPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Sidebar role="lead" />
            <Header title="Project Documents" user="Lead Manager" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8">
                <DocumentsSection />
            </main>
        </div>
    );
}
