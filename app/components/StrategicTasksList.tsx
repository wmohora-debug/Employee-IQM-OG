"use client";

import { useState, useEffect } from "react";
import { subscribeToAllTasks, subscribeToUsers, Task, User, deleteTask } from "@/lib/db";
import { useAuth } from "@/app/context/AuthContext";
import { ExpandableText } from "./ExpandableText";
import { Copy, Trash2, Calendar, CheckCircle2, Clock, MoreHorizontal, Pencil } from "lucide-react";
import { EditTaskModal } from "./EditTaskModal";

interface StrategicTasksListProps {
    targetRole?: 'lead' | 'executive';
}

export function StrategicTasksList({ targetRole = 'lead' }: StrategicTasksListProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, User>>({});
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editTaskData, setEditTaskData] = useState<Task | null>(null);

    const { user } = useAuth(); // Get current user

    // Subscribe to tasks
    useEffect(() => {
        if (!user) return;

        const unsub = subscribeToAllTasks((allTasks) => {
            // Filter tasks assigned by the logged-in Executive (CEO/CCO/COO)
            // and match the target role type
            const myStrategicTasks = allTasks.filter(t => {
                const isMyTask = t.assignedBy === user.uid;
                const isCorrectType = targetRole === 'executive'
                    ? t.taskType === 'executive'
                    : (t.taskType === 'lead' || !t.taskType); // Fallback for legacy tasks
                return isMyTask && isCorrectType;
            });
            setTasks(myStrategicTasks);
        });

        const unsubUsers = subscribeToUsers(undefined, (users) => {
            const map: Record<string, User> = {};
            users.forEach(u => map[u.uid] = u);
            setUsersMap(map);
        });

        return () => { unsub(); unsubUsers(); };
    }, [user, targetRole]);

    const getAssigneeName = (uid: string) => {
        return usersMap[uid]?.name || "Unknown User";
    };

    const handleDelete = async (taskId: string) => {
        if (confirm("Are you sure you want to delete this strategic task?")) {
            await deleteTask(taskId);
            setOpenMenuId(null);
        }
    };

    if (tasks.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500 relative mb-8">
            <div className={`p-6 border-b border-gray-100 ${targetRole === 'executive' ? 'bg-purple-50' : 'bg-gray-50/50'}`}>
                <h2 className="text-lg font-bold text-gray-800">
                    {targetRole === 'executive' ? "Assigned To Executives" : "Assigned To Lead"}
                </h2>
                <p className="text-sm text-gray-500">Overview of strategic directives dispatched.</p>
            </div>

            <div className="overflow-x-auto min-h-[300px]" onClick={() => setOpenMenuId(null)}>
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 w-1/4">Task Name</th>
                            <th className="px-6 py-4 w-1/3">Directives</th>
                            <th className="px-6 py-4">Assigned To</th>
                            <th className="px-6 py-4 text-right">Status / Date</th>
                            <th className="px-6 py-4 w-[50px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tasks.map(task => {
                            const isCompleted = task.status === 'completed';

                            // Determine display date
                            let dateLabel = "N/A";
                            if (isCompleted && task.completedAt) {
                                dateLabel = (task.completedAt as any).toDate ? (task.completedAt as any).toDate().toLocaleDateString() : new Date((task.completedAt as any).seconds * 1000).toLocaleDateString();
                            } else if (task.dueDate) {
                                dateLabel = (task.dueDate as any).toDate ? (task.dueDate as any).toDate().toLocaleDateString() : new Date((task.dueDate as any)).toLocaleDateString();
                            }

                            // Determine status description for Executives
                            let statusText = "Pending";
                            let statusColor = "bg-yellow-100 text-yellow-700 border-yellow-200";

                            if (isCompleted) {
                                statusText = "Completed";
                                statusColor = "bg-green-100 text-green-700 border-green-200";
                            } else if (task.taskType === 'executive') {
                                // Logic 1: Check dynamic array
                                if (task.assignedExecutives && task.assignedExecutives.length > 0) {
                                    const allExecs = task.assignedExecutives;
                                    const completedCount = allExecs.filter(e => e.completed).length;

                                    if (completedCount === allExecs.length) {
                                        statusText = "Completed"; // Should be covered by isCompleted, but safety fallback
                                        statusColor = "bg-green-100 text-green-700 border-green-200";
                                    } else if (completedCount > 0) {
                                        // Generate granular status string
                                        const details = allExecs.map(e => `${e.role?.toUpperCase() || 'EXEC'}: ${e.completed ? '✓' : '✗'}`).join(", ");
                                        statusText = `Partial (${details})`;
                                        statusColor = "bg-blue-50 text-blue-700 border-blue-100";
                                    }
                                }
                                // Logic 2: Legacy Fallback
                                else {
                                    const ccoDone = task.executiveCompletion?.ccoCompleted;
                                    const cooDone = task.executiveCompletion?.cooCompleted;
                                    if (ccoDone || cooDone) {
                                        statusText = `Partial (CCO: ${ccoDone ? '✓' : '✗'}, COO: ${cooDone ? '✓' : '✗'})`;
                                        statusColor = "bg-blue-50 text-blue-700 border-blue-100";
                                    }
                                }
                            }

                            return (
                                <tr key={task.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-gray-800 align-top">
                                        {task.title}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm align-top">
                                        <ExpandableText text={task.description} previewWords={10} modalTitle={task.title} />
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                                                {getAssigneeName(task.assignedTo!).charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700">{getAssigneeName(task.assignedTo!)}</span>
                                                <span className="text-xs text-gray-400">{task.department || usersMap[task.assignedTo!]?.role.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right align-top">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                                                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                {statusText}
                                            </span>
                                            <span className="text-xs font-mono text-gray-400 mt-1">
                                                {isCompleted ? "Completed: " : "Due: "}{dateLabel}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right relative align-top">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === task.id ? null : task.id!);
                                            }}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>

                                        {openMenuId === task.id && (
                                            <div className="absolute right-8 top-12 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                                {!isCompleted && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditTaskData(task);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center gap-2 transition-colors border-b border-gray-50"
                                                    >
                                                        <Pencil className="w-4 h-4" /> Edit Task
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(task.id!); }}
                                                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-medium flex items-center gap-2 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete Task
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <EditTaskModal
                task={editTaskData}
                isOpen={!!editTaskData}
                onClose={() => setEditTaskData(null)}
            />
        </div>
    );
}
