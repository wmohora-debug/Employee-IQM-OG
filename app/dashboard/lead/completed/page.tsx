"use client";
import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { LeadTaskTable } from "@/app/components/LeadTaskTable";

export default function LeadCompletedTasksPage() {
    return (
        <>
            <Header title="Completed Tasks" user="Lead Manager" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8">
                {/* Reusing LeadTaskTable but we will need to filter for completed */}
                {/* To avoid code duplication, we'll modify LeadTaskTable to accept a 'completedOnly' prop */}
                <LeadTaskTable completedOnly={true} />
            </main>
        </>
    );
}
