"use client";

import { useState, useEffect } from "react";
import { subscribeToAllTasks, subscribeToUsers, Task, User, deleteTask, verifyExecutiveTask, rejectExecutiveTask } from "@/lib/db";
import { useAuth } from "@/app/context/AuthContext";
import { ExpandableText } from "./ExpandableText";
import { Copy, Trash2, Calendar, CheckCircle2, Clock, MoreHorizontal, Pencil, X } from "lucide-react";
import { EditTaskModal } from "./EditTaskModal";
import { motion, AnimatePresence } from "framer-motion";

interface StrategicTasksListProps {
    targetRole?: 'lead' | 'executive';
}

export function StrategicTasksList({ targetRole = 'lead' }: StrategicTasksListProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, User>>({});
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editTaskData, setEditTaskData] = useState<Task | null>(null);

    // Verification State
    const [verificationModal, setVerificationModal] = useState<{ task: Task } | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [processing, setProcessing] = useState(false);

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

    const handleOpenVerification = (task: Task) => {
        setVerificationModal({ task });
        setRejectionReason("");
        setIsRejecting(false);
    };

    const handleVerifyTask = async () => {
        if (!user || !verificationModal) return;
        setProcessing(true);
        try {
            await verifyExecutiveTask(verificationModal.task.id!, user.uid);
            setVerificationModal(null);
        } catch (error) {
            console.error(error);
            alert("Failed to verify task.");
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectTask = async () => {
        if (!user || !verificationModal) return;
        if (!rejectionReason.trim()) {
            alert("Please provide a reason.");
            return;
        }
        setProcessing(true);
        try {
            await rejectExecutiveTask(verificationModal.task.id!, user.uid, rejectionReason);
            setVerificationModal(null);
        } catch (error) {
            console.error(error);
            alert("Failed to reject task.");
        } finally {
            setProcessing(false);
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
                        <AnimatePresence mode="popLayout">
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
                                } else if (task.status === 'under_review') {
                                    statusText = "Under Review";
                                    statusColor = "bg-yellow-100 text-yellow-700 border-yellow-200";
                                } else if (task.status === 'rejected') {
                                    statusText = "Rejected";
                                    statusColor = "bg-red-50 text-red-700 border-red-200";
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
                                    <motion.tr
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="hover:bg-gray-50/50 transition-colors group"
                                    >
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
                                            <div className="flex items-center justify-end gap-2 relative">
                                                {(task.status === 'under_review' || task.status === 'rejected') && (
                                                    <button
                                                        onClick={() => handleOpenVerification(task)}
                                                        className={`${task.status === 'rejected' ? 'bg-red-100 hover:bg-red-200 text-red-800' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'} text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm transition-all flex items-center gap-1`}
                                                    >
                                                        {task.status === 'rejected' ? 'View' : 'Review'}
                                                    </button>
                                                )}

                                                <div className="relative inline-block text-left">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(openMenuId === task.id ? null : task.id!);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                                                    >
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>

                                                    <AnimatePresence>
                                                        {openMenuId === task.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5, height: 0 }}
                                                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                                exit={{ opacity: 0, y: -5, height: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="absolute right-8 top-12 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                                            >
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
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <EditTaskModal
                task={editTaskData}
                isOpen={!!editTaskData}
                onClose={() => setEditTaskData(null)}
            />

            {verificationModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Review Submission</h3>
                                <p className="text-xs text-gray-500">{verificationModal.task.title}</p>
                            </div>
                            <button onClick={() => setVerificationModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                {(verificationModal.task.rejectionReason || verificationModal.task.previousRejectionReason) && (
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm mb-4">
                                        <label className="block text-xs font-bold text-red-700 uppercase tracking-wide mb-2">Previous Rejection Note</label>
                                        <p className="text-sm text-red-900 leading-relaxed whitespace-pre-wrap">
                                            {verificationModal.task.rejectionReason || verificationModal.task.previousRejectionReason}
                                        </p>
                                    </div>
                                )}

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Proof of Work</label>
                                    <div className="p-3 bg-white rounded border border-gray-100 min-h-[100px]">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                            {verificationModal.task.proofOfWork || "No proof provided."}
                                        </p>
                                    </div>
                                    <div className="mt-3 text-xs text-gray-500">
                                        Submitted by {getAssigneeName(verificationModal.task.submittedBy!)} on {verificationModal.task.submittedAt?.seconds ? new Date(verificationModal.task.submittedAt.seconds * 1000).toLocaleString() : 'Recent'}
                                    </div>
                                </div>

                                {verificationModal.task.status === 'under_review' ? (
                                    isRejecting ? (
                                        <div className="mt-4 animate-in fade-in">
                                            <label className="block text-xs font-bold text-red-500 uppercase tracking-wide mb-2">Rejection Reason</label>
                                            <textarea
                                                className="w-full text-sm p-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-red-50/50 text-red-900"
                                                placeholder="Explain why this needs revision..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                autoFocus
                                            />
                                            <div className="flex gap-3 mt-3 justify-end">
                                                <button onClick={() => setIsRejecting(false)} className="text-sm text-gray-500">Cancel</button>
                                                <button onClick={handleRejectTask} disabled={processing} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-red-700">Confirm Rejection</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-3 mt-4">
                                            <button onClick={() => setIsRejecting(true)} className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold border border-transparent hover:border-red-100 transition-all">Reject Task</button>
                                            <button onClick={handleVerifyTask} disabled={processing} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Verify & Complete
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center p-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-500 border border-gray-100 mt-4">
                                        Waiting for executive to review feedback and resubmit.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
