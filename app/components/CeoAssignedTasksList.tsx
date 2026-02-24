"use client";
import { CheckCircle, Clock, CheckSquare, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { subscribeToCeoTasks, Task, submitExecutiveProof, completeCeoTask } from "@/lib/db";
import { useAuth } from "@/app/context/AuthContext";
import { ExpandableText } from "./ExpandableText";

export function CeoAssignedTasksList() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Submission Modal State
    const [submissionModal, setSubmissionModal] = useState<{ taskId: string, taskTitle: string } | null>(null);
    const [submissionNote, setSubmissionNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!user || !['lead', 'cco', 'coo'].includes(user.role)) return;

        const unsub = subscribeToCeoTasks(user.uid, (updatedTasks) => {
            // Filter out tasks that the current executive has ALREADY completed
            // even if the task itself is not fully completed (waiting for others).
            const activeTasks = updatedTasks.filter(t => {
                if (t.assignedExecutives) {
                    const myPart = t.assignedExecutives.find(e => e.id === user.uid);
                    if (myPart && myPart.completed) return false;
                }
                // Fallback for legacy
                if (user.role === 'cco' && t.executiveCompletion?.ccoCompleted) return false;
                if (user.role === 'coo' && t.executiveCompletion?.cooCompleted) return false;

                return true;
            });
            setTasks(activeTasks);
            setIsLoading(false);
        });
        return () => unsub();
    }, [user]);

    const handleOpenSubmission = (taskId: string, taskTitle: string, initialProof?: string) => {
        setSubmissionModal({ taskId, taskTitle });
        setSubmissionNote(initialProof || "");
        setErrorMsg("");
    };

    const handleSubmitProof = async () => {
        if (!user || !submissionModal) return;

        if (!submissionNote || submissionNote.trim().length < 20) {
            setErrorMsg("Proof of work is required (minimum 20 characters).");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            await submitExecutiveProof(submissionModal.taskId, user.uid, submissionNote);
            setSubmissionModal(null);
        } catch (error: any) {
            console.error("Failed to submit proof", error);
            setErrorMsg(error.message || "Failed to submit.");
        } finally {
            setIsSubmitting(false);
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
                    <h3 className="text-lg font-bold text-gray-800">Executive Strategic Tasks</h3>
                    <p className="text-xs text-purple-600 font-medium bg-purple-50 inline-block px-2 py-0.5 rounded-full mt-1 border border-purple-100">
                        Top Priority Directives
                    </p>
                </div>
            </div>

            <div className="divide-y divide-purple-50">
                {tasks.map(task => (
                    <div key={task.id} className="p-6 hover:bg-purple-50/10 transition-colors flex flex-col md:flex-row gap-4 md:items-start group">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col">
                                    <h4 className="font-bold text-gray-900 text-base">{task.title}</h4>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 w-fit mt-1">
                                        Assigned by {task.createdByRole?.toUpperCase() || "CEO"}
                                    </span>
                                </div>
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

                        <div className="flex flex-col items-end gap-2 md:self-center">
                            {((user?.role === 'cco' && task.executiveCompletion?.ccoCompleted) ||
                                (user?.role === 'coo' && task.executiveCompletion?.cooCompleted)) ? (
                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-green-50 text-green-600 border border-green-100 shadow-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Completed by You</span>
                                </div>
                            ) : task.status === 'under_review' ? (
                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>Under Review</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-end gap-2">
                                    {task.status === 'rejected' && task.rejectionReason && (
                                        <div className="text-sm bg-red-50 p-4 rounded-xl border border-red-200 w-full md:max-w-md mb-2 shadow-sm text-left">
                                            <div className="font-bold text-red-700 flex items-center justify-between mb-1.5 uppercase tracking-wide text-xs">
                                                <span>Revision Requested</span>
                                                {task.rejectedAt && (
                                                    <span className="text-[10px] text-red-500/80 font-medium normal-case">
                                                        {task.rejectedAt?.seconds ? new Date(task.rejectedAt.seconds * 1000).toLocaleString() : 'Recent'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-red-900 leading-relaxed text-sm whitespace-pre-wrap">{task.rejectionReason}</div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleOpenSubmission(task.id!, task.title, task.proofOfWork)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-200 hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {task.status === 'rejected' ? "Re-submit Task" : "Submit for Review"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
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
                                onClick={handleSubmitProof}
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
