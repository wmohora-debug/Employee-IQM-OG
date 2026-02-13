"use client";
import { MoreHorizontal, Calendar, Disc, CheckCircle, Clock, X, FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { subscribeToTasks, Task, submitTask, submitTaskModule } from "@/lib/db";

import { useAuth } from "@/app/context/AuthContext";

import { ExpandableText } from "./ExpandableText";

export function EmployeeTaskTable({ completedOnly = false, compact = false }: { completedOnly?: boolean; compact?: boolean }) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [submissionModal, setSubmissionModal] = useState<{ taskId: string, taskTitle: string, moduleId?: string, moduleTitle?: string } | null>(null);
    const [submissionNote, setSubmissionNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");



    useEffect(() => {
        if (!user) {
            console.log("[UI] Waiting for user in EmployeeTaskTable");
            return;
        }

        console.log(`[UI] Subscribing to tasks for user: ${user.uid} (${user.name})`);

        const unsubscribe = subscribeToTasks(user.uid, "employee", user.department || "", (updatedTasks) => {
            console.log(`[UI] Table received ${updatedTasks.length} tasks.`);
            setTasks(updatedTasks);
        }, completedOnly);
        return () => unsubscribe();
    }, [user, completedOnly]);

    const handleOpenSubmission = (taskId: string, taskTitle: string, moduleId: string, moduleTitle: string) => {
        setSubmissionModal({ taskId, taskTitle, moduleId, moduleTitle });
        setSubmissionNote("");
        setErrorMsg("");
    };

    const handleSubmitTask = async () => {
        if (!user || !submissionModal) return;

        // Validation
        if (!submissionNote || submissionNote.trim().length < 20) {
            setErrorMsg("Proof of work is required (minimum 20 characters).");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            // Submit specific module
            if (submissionModal.moduleId) {
                await submitTaskModule(submissionModal.taskId, submissionModal.moduleId, user.uid, submissionNote);
            } else {
                // Legacy fallback
                await submitTask(submissionModal.taskId, user.uid, submissionNote);
            }

            setSubmissionModal(null); // Close Modal
        } catch (error: any) {
            console.error("Failed to submit task", error);
            setErrorMsg(error.message || "Failed to submit task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return "bg-green-100 text-green-700 border-green-200";
            case 'submitted': return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case 'rejected': return "bg-red-50 text-red-700 border-red-200";
            case 'in-progress': return "bg-blue-50 text-blue-600 border-blue-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">{completedOnly ? "History" : "My Assignments"}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4 w-1/3">Task / Module</th>
                            <th className="px-6 py-4 w-1/4">Description</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">{completedOnly ? "Completed On" : "Due Date"}</th>
                            {!completedOnly && <th className="px-6 py-4 text-right">Action</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tasks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No tasks assigned yet. {user && <span className="text-xs text-gray-400 block mt-1">(ID: {user.uid})</span>}
                                </td>
                            </tr>
                        ) : (
                            tasks.map((t) => {
                                const myModules = t.modules?.map((m, idx) => ({ ...m, idx })).filter(m => m.assignedTo === user?.uid) || [];
                                const isDetailedTask = myModules.length > 0;

                                // Overall Task Status (for reference, but actions are module based)
                                const isTaskVerified = t.status === 'verified';

                                return (
                                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors align-top">
                                        <td className="px-6 py-4 text-gray-800">
                                            <div className="font-semibold mb-2">{t.title}</div>

                                            {isDetailedTask && (
                                                <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                                                    {myModules.map((m) => (
                                                        <div key={m.id || m.idx} className="bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                                <span className="text-sm font-medium text-gray-700">{m.title}</span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalization ${getStatusColor(m.status)}`}>
                                                                    {m.status === 'submitted' ? 'Reviewing' : m.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 mb-2">
                                                                <ExpandableText text={m.description || "No description provided."} previewWords={10} modalTitle={`${m.title} - Description`} />
                                                            </div>
                                                            {m.rejectionReason && (m.status === 'rejected' || m.status === 'pending') && (
                                                                <div className="text-[10px] text-red-600 bg-red-50 p-2 rounded mb-2">
                                                                    <b>Lead Feedback:</b> {m.rejectionReason}
                                                                </div>
                                                            )}
                                                            {/* Module Action here if mobile, or keep in main action column? 
                                                                Let's put a small action button HERE for clarity if multiple modules exist.
                                                            */}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm max-w-[250px]">
                                            <ExpandableText text={t.description} previewWords={3} modalTitle="Task Description" />
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium capitalize 
                                                ${t.priority === 'high' ? 'text-red-500' :
                                                    t.priority === 'medium' ? 'text-orange-500' :
                                                        'text-blue-500'}`}>
                                                {t.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {(() => {
                                                const getDate = (val: any) => val?.seconds ? new Date(val.seconds * 1000) : val ? new Date(val) : null;
                                                const dateObj = completedOnly ? getDate(t.completedAt) : getDate(t.dueDate);
                                                return (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {dateObj ? (
                                                            <span>{completedOnly ? dateObj.toLocaleDateString() : dateObj.toLocaleDateString()}</span>
                                                        ) : 'No Date'}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        {!completedOnly && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col gap-3 items-end">
                                                    {isDetailedTask ? (
                                                        myModules.map((m) => (
                                                            <div key={m.id || m.idx} className="h-full flex items-center min-h-[50px]">
                                                                {/* We need better alignment. Let's just render buttons. */}
                                                                <button
                                                                    onClick={() => handleOpenSubmission(t.id!, t.title, m.id || `${m.idx}`, m.title)}
                                                                    disabled={m.status === 'submitted' || m.status === 'verified'}
                                                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap
                                                                        ${m.status === 'submitted' ? 'bg-yellow-100 text-yellow-700 cursor-default' :
                                                                            m.status === 'verified' ? 'bg-green-50 text-green-600 cursor-default' :
                                                                                'bg-iqm-primary text-white hover:bg-iqm-sidebar shadow-sm'}`}
                                                                >
                                                                    {m.status === 'submitted' ? 'Under Review' :
                                                                        m.status === 'verified' ? 'Verified' :
                                                                            m.status === 'rejected' ? 'Re-Submit' : 'Submit Module'}
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        // Legacy Single Task Action
                                                        <button
                                                            onClick={() => handleOpenSubmission(t.id!, t.title, "", "")}
                                                            disabled={t.status === 'submitted' || t.status === 'verified'}
                                                            className={`text-xs px-4 py-2 rounded-lg font-medium transition-all ${t.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                                                                t.status === 'verified' ? 'bg-green-50 text-green-600' :
                                                                    'bg-iqm-primary text-white'
                                                                }`}
                                                        >
                                                            {t.status === 'submitted' ? 'In Review' : t.status === 'verified' ? 'Verified' : 'Submit Task'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Submission Modal */}
            {submissionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800">Submit Work</h3>
                            <button onClick={() => setSubmissionModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Task Context</label>
                                <p className="text-sm font-medium text-gray-800">{submissionModal.taskTitle}</p>
                                {submissionModal.moduleTitle && (
                                    <p className="text-xs text-iqm-primary font-semibold mt-1">Module: {submissionModal.moduleTitle}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Proof of Work (Required)</label>
                                <textarea
                                    className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary min-h-[150px]"
                                    placeholder="Describe your work in detail (minimum 20 characters)..."
                                    value={submissionNote}
                                    onChange={(e) => setSubmissionNote(e.target.value)}
                                />
                                <div className="flex justify-between mt-1 text-xs">
                                    <span className={submissionNote.length < 20 ? "text-red-500" : "text-green-500"}>
                                        {submissionNote.length} / 20 characters
                                    </span>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                                    {errorMsg}
                                </div>
                            )}

                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3">
                            <button
                                onClick={() => setSubmissionModal(null)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitTask}
                                disabled={isSubmitting || submissionNote.trim().length < 20}
                                className="px-6 py-2 bg-iqm-primary text-white text-sm font-medium rounded-xl hover:bg-iqm-sidebar shadow-sm shadow-iqm-primary/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? "Submitting..." : "Submit for Verification"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
