import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { LeadTaskTable } from "@/app/components/LeadTaskTable";

export default function LeadTasksPage() {
    return (
        <>
            <Header title="Task Management" user="Lead Manager" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8">
                <LeadTaskTable />
            </main>
        </>
    );
}
