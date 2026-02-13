"use client";
import { MoreHorizontal, Disc, Trash2, X, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { subscribeToTasks, Task, deleteTask, getEmployees, User, verifyTask, rejectTask, verifyTaskModule, rejectTaskModule } from "@/lib/db";
import { useAuth } from "@/app/context/AuthContext";
import { CreateTaskModal } from "./CreateTaskModal";
import { ExpandableText } from "./ExpandableText";

export function LeadTaskTable({ completedOnly = false }: { completedOnly?: boolean }) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [userMap, setUserMap] = useState<Record<string, User>>({});
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [verificationModal, setVerificationModal] = useState<{ task: Task } | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [targetModuleId, setTargetModuleId] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'lead') return; // Guard clause
        const dept = user.department || "Development"; // Fallback

        // Subscribe to tasks as Lead (sees all in department)
        const unsubscribe = subscribeToTasks(user.uid, "lead", dept, (updatedTasks) => {
            // Filter out CEO tasks (Operational tasks only)
            const operationalTasks = updatedTasks.filter(t => t.createdByRole !== 'ceo');
            setTasks(operationalTasks);
        }, completedOnly);
        return () => unsubscribe();
    }, [user, completedOnly]);

    // Fetch employees for name lookup (Filtered by Department)
    useEffect(() => {
        if (!user || user.role !== 'lead') return;
        const fetchUsers = async () => {
            const employees = await getEmployees(user.department);
            const map: Record<string, User> = {};
            employees.forEach(u => map[u.uid] = u);
            setUserMap(map);
        };
        fetchUsers();
    }, [user]);

    const handleOpenVerification = (task: Task) => {
        setVerificationModal({ task });
        setRejectionReason("");
        setIsRejecting(false);
        setTargetModuleId(null);
    };

    const handleVerifyModule = async (moduleId: string) => {
        if (!user || !verificationModal) return;
        if (!confirm("Confirm verification of this module?")) return;

        setProcessing(true);
        try {
            await verifyTaskModule(verificationModal.task.id!, moduleId, user.uid);
            // Close modal or refresh? The subscription will update the task, but we might want to keep the modal open to verify others?
            // If we keep modal open, we need to know the task updated. 
            // The subscription updates 'tasks' state, but 'verificationModal.task' is a local snapshot. 
            // We should ideally close it or re-sync it. Closing is safer to avoid stale state.
            setVerificationModal(null);
        } catch (error) {
            console.error(error);
            alert("Failed to verify module.");
        } finally {
            setProcessing(false);
        }
    };

    // Legacy Verify
    const handleVerifyTask = async () => {
        if (!user || !verificationModal) return;
        if (!confirm("Confirm verification of this task?")) return;
        setProcessing(true);
        try {
            await verifyTask(verificationModal.task.id!, user.uid);
            setVerificationModal(null);
        } catch (e) { console.error(e); alert("Failed"); } finally { setProcessing(false); }
    };

    const handleRejectModule = async () => {
        if (!user || !verificationModal || !targetModuleId) return;
        if (!rejectionReason.trim()) {
            alert("Please provide a reason.");
            return;
        }

        setProcessing(true);
        try {
            await rejectTaskModule(verificationModal.task.id!, targetModuleId, user.uid, rejectionReason);
            setVerificationModal(null);
        } catch (error) {
            console.error(error);
            alert("Failed to reject module.");
        } finally {
            setProcessing(false);
        }
    };

    // Legacy Reject
    const handleRejectTask = async () => {
        if (!user || !verificationModal) return;
        if (!rejectionReason.trim()) { alert("Reason required"); return; }
        setProcessing(true);
        try {
            await rejectTask(verificationModal.task.id!, user.uid, rejectionReason);
            setVerificationModal(null);
        } catch (e) { console.error(e); alert("Failed"); } finally { setProcessing(false); }
    };

    const toggleMenu = (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === taskId ? null : taskId);
    };

    // ... (rest of rendering)

    // Update Action Column Logic and Modal Rendering
    // ...

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'verified': return "bg-green-100 text-green-700 bg-opacity-50 border border-green-200";
            case 'submitted': return "bg-yellow-100 text-yellow-700 bg-opacity-50 border border-yellow-200"; // Distinct highlight
            case 'in-progress': return "bg-blue-50 text-blue-700 border border-blue-100";
            case 'pending': return "bg-gray-50 text-gray-600 border border-gray-200";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            {/* Backdrop for closing menus */}
            {openMenuId && (
                <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setOpenMenuId(null)}
                ></div>
            )}

            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{completedOnly ? "Completed Tasks Audit" : "Task Overview"}</h3>
                    <p className="text-sm text-gray-500">{completedOnly ? "Review completed assignments & history" : "Manage ongoing projects and module assignments"}</p>
                </div>
                {!completedOnly && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-iqm-primary hover:bg-iqm-sidebar text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                        + Create Task
                    </button>
                )}
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-medium">Task Name</th>
                            <th className="px-6 py-4 font-medium">Priority</th>
                            <th className="px-6 py-4 font-medium">Assignee</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tasks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No tasks found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:text-iqm-primary transition-colors">
                                                <Disc className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{task.title}</div>
                                                <div className="text-xs text-gray-400 font-normal mt-0.5">
                                                    <ExpandableText text={task.description} previewWords={4} modalTitle={`Task: ${task.title}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize 
                                            ${task.priority === 'high' ? 'bg-red-50 text-red-600' :
                                                task.priority === 'medium' ? 'bg-orange-50 text-orange-600' :
                                                    'bg-blue-50 text-blue-600'}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2 max-w-[250px]">
                                            {task.modules && task.modules.length > 0 ? (
                                                Array.from(new Set(task.modules.map(m => m.assignedTo).filter(Boolean))).map((uid, i) => {
                                                    const emp = userMap[uid];
                                                    return (
                                                        <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg shadow-sm">
                                                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">
                                                                {emp?.name ? emp.name.charAt(0).toUpperCase() : (uid.charAt(0).toUpperCase() || '?')}
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]" title={emp?.name || uid}>
                                                                {emp?.name || "Unknown"}
                                                            </span>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg shadow-sm">
                                                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">
                                                        {task.assignedTo && userMap[task.assignedTo]?.name ? userMap[task.assignedTo]!.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                                                        {(task.assignedTo && userMap[task.assignedTo]?.name) || task.assignedTo || "Unassigned"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-3 min-w-[180px]">
                                            {/* Overall Status & Progress */}
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                                                    {task.status === 'submitted' ? 'Review Needed' : task.status}
                                                </span>
                                                {task.modules && task.modules.length > 0 && (
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        {Math.round((task.modules.filter(m => m.status === 'verified').length / task.modules.length) * 100)}%
                                                    </span>
                                                )}
                                            </div>

                                            {/* Detailed Module List */}
                                            {task.modules && task.modules.length > 0 && (
                                                <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {task.modules.map((m, idx) => {
                                                        const assignee = userMap[m.assignedTo];
                                                        return (
                                                            <div key={idx} className="flex items-start gap-2 group/module">
                                                                {/* Status Indicator */}
                                                                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${m.status === 'verified' ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]' : m.status === 'submitted' ? 'bg-yellow-400 shadow-[0_0_2px_rgba(250,204,21,0.4)]' : 'bg-gray-200'}`} />

                                                                {/* Module Info */}
                                                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                                                    <span
                                                                        className={`text-[11px] font-medium leading-tight ${m.status === 'verified' ? 'text-gray-400' : 'text-gray-700'}`}
                                                                    >
                                                                        {m.title}
                                                                    </span>
                                                                    <span className="text-[9px] text-gray-400">
                                                                        {assignee?.name || "Unknown"}
                                                                    </span>
                                                                    {m.description && (
                                                                        <div className="text-[10px] text-gray-500">
                                                                            <ExpandableText text={m.description} previewWords={3} modalTitle={`Module: ${m.title}`} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 relative">
                                            {/* Review Action - Only for active tasks needing review */}
                                            {!completedOnly && (task.status === 'submitted' || task.modules?.some(m => m.status === 'submitted')) && (
                                                <button
                                                    onClick={() => handleOpenVerification(task)}
                                                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm transition-all flex items-center gap-1"
                                                >
                                                    Review
                                                    {task.modules?.some(m => m.status === 'submitted') && (
                                                        <span className="bg-white/50 px-1.5 rounded-full text-[10px]">
                                                            {task.modules.filter(m => m.status === 'submitted').length}
                                                        </span>
                                                    )}
                                                </button>
                                            )}

                                            {/* 3-Dot Menu - Always Visible */}
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={(e) => toggleMenu(task.id!, e)}
                                                    className={`text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors active:scale-95 ${openMenuId === task.id ? 'bg-gray-100 text-gray-600 shadow-inner' : ''}`}
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                                {openMenuId === task.id && (
                                                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm("Delete this task?")) {
                                                                        await deleteTask(task.id!);
                                                                        setOpenMenuId(null);
                                                                    }
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

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
                            {verificationModal.task.modules && verificationModal.task.modules.length > 0 ? (
                                <div className="space-y-6">
                                    {verificationModal.task.modules.map((m, idx) => (
                                        <div key={m.id || idx} className={`border rounded-xl p-4 ${m.status === 'submitted' ? 'bg-white border-yellow-200 ring-1 ring-yellow-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-80'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h5 className="font-bold text-gray-800">{m.title}</h5>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide 
                                                            ${m.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                                                                m.status === 'verified' ? 'bg-green-100 text-green-700' :
                                                                    m.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                                                            {m.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">Assigned to: <span className="font-medium text-gray-700">{userMap[m.assignedTo]?.name || "Unknown"}</span></p>
                                                </div>

                                                {m.status === 'submitted' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => { setTargetModuleId(m.id || `${idx}`); setIsRejecting(true); setRejectionReason(""); }}
                                                            className="text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                                                            disabled={processing}
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerifyModule(m.id || `${idx}`)}
                                                            className="text-xs px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium shadow-sm active:scale-95 transition-all flex items-center gap-1"
                                                            disabled={processing}
                                                        >
                                                            <CheckCircle className="w-3 h-3" /> Verify
                                                        </button>
                                                    </div>
                                                )}

                                                {isRejecting && targetModuleId === (m.id || `${idx}`) && (
                                                    <div className="absolute inset-0 bg-white/95 z-10 flex items-center justify-center p-6 rounded-xl animate-in fade-in duration-200">
                                                        <div className="w-full max-w-sm space-y-3">
                                                            <h5 className="font-bold text-red-600 text-center">Rejecting: {m.title}</h5>
                                                            <textarea
                                                                className="w-full text-sm p-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-red-50/50"
                                                                placeholder="Reason for rejection..."
                                                                value={rejectionReason}
                                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2 justify-end">
                                                                <button onClick={() => setIsRejecting(false)} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">Cancel</button>
                                                                <button onClick={handleRejectModule} disabled={processing} className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700">Confirm Rejection</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {m.status === 'submitted' ? (
                                                <div className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-lg mt-2">
                                                    <p className="text-xs font-bold text-yellow-800 mb-1 uppercase tracking-wide">Proof of Work</p>
                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{m.submissionNote}</p>
                                                </div>
                                            ) : m.status === 'verified' ? (
                                                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Verified on {m.verifiedAt?.seconds ? new Date(m.verifiedAt.seconds * 1000).toLocaleDateString() : 'Unknown Date'}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Proof of Work</label>
                                        <div className="p-2 bg-white rounded border border-gray-100">
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                {verificationModal.task.submissionNote || "No proof provided."}
                                            </p>
                                        </div>
                                    </div>

                                    {isRejecting ? (
                                        <div className="mt-4 animate-in fade-in">
                                            <label className="block text-xs font-bold text-red-500 uppercase tracking-wide mb-2">Rejection Reason</label>
                                            <textarea
                                                className="w-full text-sm p-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-red-50/50 text-red-900"
                                                placeholder="Explain why..."
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
                                                <CheckCircle className="w-4 h-4" /> Verify Task
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

