"use client";
import { CheckCircle, Clock, CheckSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { subscribeToCeoTasks, Task, completeCeoTask } from "@/lib/db";
import { useAuth } from "@/app/context/AuthContext";
import { ExpandableText } from "./ExpandableText";

export function CeoAssignedTasksList() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [completingId, setCompletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'lead') return;

        const unsub = subscribeToCeoTasks(user.uid, (updatedTasks) => {
            setTasks(updatedTasks);
            setIsLoading(false);
        });
        return () => unsub();
    }, [user]);

    const handleComplete = async (taskId: string) => {
        if (!confirm("Are you sure you want to mark this strategic task as complete?")) return;

        setCompletingId(taskId);
        try {
            await completeCeoTask(taskId, user!.uid);
            // Task will be removed from list via subscription update
        } catch (error) {
            console.error("Failed to complete task", error);
            alert("Failed to update status.");
            setCompletingId(null);
        }
    };

    if (isLoading && tasks.length === 0) return (
        <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading assigned tasks...</div>
    );

    if (tasks.length === 0) return null; // Don't show section if no tasks

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 border-b border-purple-50 bg-gradient-to-r from-purple-50/50 to-white flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100/50 rounded-xl flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                    <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Assigned by CEO</h3>
                    <p className="text-xs text-purple-600 font-medium bg-purple-50 inline-block px-2 py-0.5 rounded-full mt-1 border border-purple-100">
                        Strategic Priority
                    </p>
                </div>
            </div>

            <div className="divide-y divide-purple-50">
                {tasks.map(task => (
                    <div key={task.id} className="p-6 hover:bg-purple-50/10 transition-colors flex flex-col md:flex-row gap-4 md:items-start group">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                                <h4 className="font-bold text-gray-900 text-base">{task.title}</h4>
                                <span className="md:hidden text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 whitespace-nowrap ml-2">
                                    Due: {task.dueDate ? new Date((task.dueDate as any).seconds * 1000).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>

                            <div className="text-sm text-gray-600 leading-relaxed">
                                <ExpandableText text={task.description} previewWords={20} modalTitle={`Specifics: ${task.title}`} />
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <div className="text-xs text-gray-400 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 group-hover:bg-white group-hover:border-purple-100 transition-colors">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                        Due: {task.dueDate
                                            ? (task.dueDate as any).toDate
                                                ? (task.dueDate as any).toDate().toLocaleDateString()
                                                : new Date(task.dueDate as any).toLocaleDateString()
                                            : 'No Date'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end md:self-center">
                            <button
                                onClick={() => handleComplete(task.id!)}
                                disabled={completingId === task.id}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95
                                    ${completingId === task.id
                                        ? 'bg-gray-100 text-gray-400 cursor-wait'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-200 hover:shadow-lg hover:-translate-y-0.5'}
                                `}
                            >
                                <CheckCircle className="w-4 h-4" />
                                {completingId === task.id ? "Updating..." : "Mark Complete"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
