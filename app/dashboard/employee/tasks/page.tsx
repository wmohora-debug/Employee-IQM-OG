import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { EmployeeTaskTable } from "@/app/components/EmployeeTaskTable";

export default function EmployeeTasksPage() {
    return (
        <>
            <Header title="My Tasks" user="John Doe" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8">
                <EmployeeTaskTable />
            </main>
        </>
    );
}
