import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { LeadTaskTable } from "@/app/components/LeadTaskTable";
import { CeoAssignedTasksList } from "@/app/components/CeoAssignedTasksList";

export default function LeadTasksPage() {
    return (
        <>
            <Header title="Task Management" user="Lead Manager" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8">
                {/* 1. Tasks from CEO (Strategic) */}
                <CeoAssignedTasksList />

                {/* 2. My Dept Tasks (Operational) */}
                <LeadTaskTable />
            </main>
        </>
    );
}
