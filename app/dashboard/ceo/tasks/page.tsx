"use client";
import { Header } from "@/app/components/Header";
import { useEffect, useState } from "react";
import { subscribeToAllTasks, subscribeToUsers, Task, User } from "@/lib/db";
import {
    BarChart2,
    Layers,
    User as UserIcon,
    Calendar,
    CheckCircle
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function CEOTasksPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, User>>({});
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Auth Check
    useEffect(() => {
        if (!loading && user?.role !== 'ceo') {
            router.push('/');
        }
    }, [user, loading, router]);

    // Data Subscription
    useEffect(() => {
        if (loading || user?.role !== 'ceo') return;

        const unsubTasks = subscribeToAllTasks((updatedTasks) => {
            setTasks(updatedTasks);
            setIsLoadingData(false);
        });

        // Fetch users to resolve names
        const unsubUsers = subscribeToUsers(undefined, (allUsers) => {
            const map: Record<string, User> = {};
            allUsers.forEach(u => map[u.uid] = u);
            setUsersMap(map);
        });

        return () => {
            unsubTasks();
            unsubUsers();
        };
    }, [user, loading]);

    // Derived Stats for Workload
    const deptStats = ["Development", "UX", "Social Media"].map(dept => {
        const deptTasks = tasks.filter(t => t.department === dept && t.status !== 'verified'); // Active tasks
        return {
            name: dept,
            count: deptTasks.length,
            color: dept === 'Development' ? 'bg-blue-500' : dept === 'UX' ? 'bg-pink-500' : 'bg-purple-500',
            bg: dept === 'Development' ? 'bg-blue-50' : dept === 'UX' ? 'bg-pink-50' : 'bg-purple-50',
            text: dept === 'Development' ? 'text-blue-700' : dept === 'UX' ? 'text-pink-700' : 'text-purple-700',
        };
    });

    // Group Tasks
    const groupedTasks = {
        Development: tasks.filter(t => t.department === 'Development'),
        UX: tasks.filter(t => t.department === 'UX'),
        'Social Media': tasks.filter(t => t.department === 'Social Media')
    };

    if (loading || (isLoadingData && tasks.length === 0)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iqm-primary"></div>
            </div>
        );
    }

    if (user?.role !== 'ceo') return null;

    return (
        <>
            <Header title="Tasks Overview" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8 pb-20 animate-in fade-in duration-500">

                {/* 1. Department Workload Chart */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart2 className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-gray-800">Department Workload (Active Tasks)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {deptStats.map(stat => (
                            <div key={stat.name} className={`${stat.bg} rounded-xl p-5 border border-transparent hover:border-gray-200 transition-all`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className={`font-bold ${stat.text}`}>{stat.name}</h3>
                                    <span className={`text-2xl font-bold ${stat.text}`}>{stat.count}</span>
                                </div>
                                <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full ${stat.color} transition-all duration-1000 ease-out`}
                                        style={{ width: `${Math.min((stat.count / 20) * 100, 100)}%` }} // Cap at 100% (20 tasks reference)
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 font-medium">
                                    {stat.count === 0 ? "No active tasks" : `${stat.count} tasks in progress`}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Task Flow Overview */}
                <section className="space-y-8">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-bold text-gray-800">Task Flow Overview</h2>
                    </div>

                    {["Development", "UX", "Social Media"].map(dept => {
                        const deptTasks = groupedTasks[dept as keyof typeof groupedTasks] || [];
                        if (deptTasks.length === 0) return null;

                        return (
                            <div key={dept} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700">{dept}</h3>
                                    <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-1 rounded-md">{deptTasks.length} Tasks</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 w-1/4">Task Name</th>
                                                <th className="px-6 py-3 w-1/4">Assigned To</th>
                                                <th className="px-6 py-3 w-1/4">Created By (Lead)</th>
                                                <th className="px-6 py-3 w-1/6">Modules</th>
                                                <th className="px-6 py-3 w-1/6 text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {deptTasks.map(task => {
                                                const completedModules = task.modules?.filter(m => m.status === 'verified').length || 0;
                                                const totalModules = task.modules?.length || 0;

                                                // Resolve Names
                                                const assigneeNames = task.assigneeIds?.map(id => usersMap[id]?.name || "Unknown").join(", ") || "Unassigned";
                                                const leadName = usersMap[task.assignedBy]?.name || "Unknown Lead";

                                                // Date Handling
                                                const isCompleted = task.status === 'verified';
                                                const dateObj = isCompleted ? task.completedAt : task.dueDate;
                                                const dateLabel = dateObj ? (dateObj.toDate ? dateObj.toDate().toLocaleDateString() : new Date(dateObj).toLocaleDateString()) : "N/A";

                                                return (
                                                    <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">
                                                            {task.title}
                                                            {isCompleted && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Completed</span>}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                                    {assigneeNames.charAt(0)}
                                                                </div>
                                                                <span className="truncate max-w-[150px]" title={assigneeNames}>{assigneeNames}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">{leadName}</td>
                                                        <td className="px-6 py-4 text-gray-500">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${completedModules === totalModules ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                <CheckCircle className="w-3 h-3" />
                                                                {completedModules}/{totalModules}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-gray-500 font-mono text-xs">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                                {dateLabel}
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 mt-0.5 uppercase">
                                                                {isCompleted ? "Verified" : "Due"}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </section>
            </main>
        </>
    );
}
