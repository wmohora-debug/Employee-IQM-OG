"use client";
import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { StatCard } from "@/app/components/StatCard";
import { EmployeeTaskTable } from "@/app/components/EmployeeTaskTable";
import { Leaderboard } from "@/app/components/Leaderboard";
import { CheckSquare, Clock, Layout } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToEmployeeStats } from "@/lib/db";
import { useAuth } from "@/app/context/AuthContext";

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        assignedTasks: 0,
        pendingReviews: 0,
        completedTasks: 0
    });

    useEffect(() => {
        if (!user?.uid) return;

        const unsub = subscribeToEmployeeStats(user.uid, (updatedStats) => {
            setStats({
                assignedTasks: updatedStats.assignedTasks,
                pendingReviews: updatedStats.pendingReviews,
                completedTasks: updatedStats.completedTasks
            });
        });
        return () => unsub();
    }, [user]);

    return (
        <>
            {/* Sidebar role="employee" is in Layout */}
            <Header title="My Workspace" user={user?.name || "Employee"} />

            <main className="p-4 md:ml-64 md:p-8 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Assigned Tasks"
                        value={stats.assignedTasks}
                        iconImage="/icons/emp-assigned.png"
                        color="bg-indigo-500"
                    />
                    <StatCard
                        label="Pending Reviews"
                        value={stats.pendingReviews}
                        iconImage="/icons/emp-pending.png"
                        color="bg-orange-500"
                    />
                    <StatCard
                        label="Completed"
                        value={stats.completedTasks}
                        iconImage="/icons/emp-completed.png"
                        color="bg-cyan-500"
                    />
                </div>

                {/* My Tasks Section */}
                <section>
                    <EmployeeTaskTable compact={true} />
                </section>

                {/* Bottom Section: Leaderboard */}
                <div>
                    <Leaderboard />
                </div>
            </main>
        </>
    );
}
