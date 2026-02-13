"use client";
import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { StatCard } from "@/app/components/StatCard";
import { LeadTaskTable } from "@/app/components/LeadTaskTable";
import { SkillMatrix } from "@/app/components/SkillMatrix";
import { CeoAssignedTasksList } from "@/app/components/CeoAssignedTasksList";
import { Leaderboard } from "@/app/components/Leaderboard";
import { Target, Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToLeadStats } from "@/lib/db";
import { useAuth } from "@/app/context/AuthContext";

export default function LeadDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalLeads: 0,
        pendingTasks: 0,
        completedTasks: 0
    });

    useEffect(() => {
        if (!user || !user.department) return;
        // Subscribe to stats for user's department
        const unsub = subscribeToLeadStats(user.uid, user.department, (updatedStats) => {
            setStats(updatedStats);
        });
        return () => unsub();
    }, [user]);

    const deptName = user?.department || "Department";

    return (
        <>
            {/* Sidebar rendered by Layout */}
            <Header title="Dashboard Overview" user={user?.name || "Lead Manager"} />

            <main className="p-4 md:ml-64 md:p-8 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label={`Employees (${deptName})`}
                        value={stats.totalEmployees}
                        iconImage="/icons/kpi-employees.png"
                        color="bg-indigo-500"
                    />
                    <StatCard
                        label={`Leads (${deptName})`}
                        value={stats.totalLeads}
                        iconImage="/icons/kpi-leads.png"
                        color="bg-purple-500"
                    />
                    <StatCard
                        label="Pending Tasks"
                        value={stats.pendingTasks}
                        iconImage="/icons/kpi-pending.png"
                        color="bg-orange-500"
                    />
                    <StatCard
                        label="Completed Tasks"
                        value={stats.completedTasks}
                        iconImage="/icons/kpi-completed.png"
                        color="bg-emerald-500"
                    />
                </div>

                {/* Task Management Section */}
                <section className="space-y-8">
                    {/* Strategic Tasks */}
                    <CeoAssignedTasksList />

                    {/* Operational Tasks */}
                    <LeadTaskTable />
                </section>

                {/* Bottom Section: SVM & Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {/* SVM - Editable for Lead */}
                        <SkillMatrix isEditable={true} />
                    </div>
                    <div className="lg:col-span-1">
                        <Leaderboard />
                    </div>
                </div>
            </main>
        </>
    );
}
