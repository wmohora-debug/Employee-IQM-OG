"use client";
import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { EmployeeTaskTable } from "@/app/components/EmployeeTaskTable";

export default function EmployeeCompletedTasksPage() {
    return (
        <>
            <Header title="Completed Tasks" user="Employee" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8">
                {/* Reusing EmployeeTaskTable with completedOnly prop */}
                <EmployeeTaskTable completedOnly={true} />
            </main>
        </>
    );
}
