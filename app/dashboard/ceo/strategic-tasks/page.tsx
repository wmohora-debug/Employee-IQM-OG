"use client";
import { Header } from "@/app/components/Header";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { createTask, subscribeToUsers, User } from "@/lib/db";
import { Loader2, Send } from "lucide-react";
import { StrategicTasksList } from "@/app/components/StrategicTasksList";

export default function StrategicTasksPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Auth Check
    useEffect(() => {
        if (!loading && user?.role !== 'ceo') {
            router.push('/');
        }
    }, [user, loading, router]);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [department, setDepartment] = useState("Development");
    const [selectedLead, setSelectedLead] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [leads, setLeads] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    // Executive Form State
    const [execTitle, setExecTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [execDescription, setExecDescription] = useState("");
    const [selectedExec, setSelectedExec] = useState("");
    const [execDueDate, setExecDueDate] = useState("");

    const [executives, setExecutives] = useState<User[]>([]);

    // Load Executives (CCO, COO)
    useEffect(() => {
        if (!loading && user?.role === 'ceo') {
            const unsub = subscribeToUsers(undefined, (allUsers) => {
                const execs = allUsers.filter(u => ['cco', 'coo'].includes(u.role));
                setExecutives(execs);
            });
            return () => unsub();
        }
    }, [user, loading]);

    // Fetch Leads when department changes
    useEffect(() => {
        if (!loading && user?.role === 'ceo') {
            // Subscribe to ALL users, then filter client side for flexibility
            // Or better, update subscribeToUsers to filter by Department.
            // The existing subscribeToUsers takes (department, callback).
            // So we just use that.
            const unsub = subscribeToUsers(department, (deptUsers) => {
                const deptLeads = deptUsers.filter(u => u.role === 'lead');
                setLeads(deptLeads);

                // Select first lead available if none selected or if selected is no longer in list
                if (deptLeads.length > 0) {
                    // Only maintain selection if it still exists in the new list, else select first
                    // But here we just default to first for simplicity when switching dept
                    // Actually, let's keep it if we can
                    setSelectedLead(prev => deptLeads.find(l => l.uid === prev)?.uid || deptLeads[0].uid);
                } else {
                    setSelectedLead("");
                }
            });
            return () => unsub();
        }
    }, [department, user, loading]);

    const handleExecSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExec || !execTitle || !execDescription || !execDueDate) {
            alert("Please fill all fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createTask({
                title: execTitle,
                description: execDescription,
                assignedTo: selectedExec,
                assignedBy: user!.uid,
                status: 'pending',
                department: "Executive", // No specific department for Strategic Exec tasks
                priority: 'high',
                dueDate: new Date(execDueDate),
                assigneeIds: [selectedExec],
                createdByRole: 'ceo',
                taskType: 'executive', // Mark as executive task
                assignedExecutives: [
                    {
                        id: selectedExec,
                        role: executives.find(u => u.uid === selectedExec)?.role || 'executive',
                        name: executives.find(u => u.uid === selectedExec)?.name || 'Unknown Executive',
                        completed: false
                    }
                ]
            });

            alert("Strategic Task Assigned to Executive Successfully.");
            setExecTitle("");
            setExecDescription("");
            setExecDueDate("");
            setSelectedExec("");
        } catch (error) {
            console.error(error);
            alert("Failed to assign task.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead || !title || !description || !dueDate) {
            alert("Please fill all fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createTask({
                title,
                description,
                assignedTo: selectedLead, // This maps to assigneeIds logic
                assignedBy: user!.uid,
                status: 'pending',
                department,
                priority: 'high',
                dueDate: new Date(dueDate),
                assigneeIds: [selectedLead],
                // CRITICAL: We need to mark this as a CEO task so it shows up in "Approved Tasks" or special list
                // We added 'createdByRole' to Task interface in previous step.
                createdByRole: 'ceo'
            });

            alert("Strategic Task Assigned Successfully.");
            // Reset form but keep dept/lead selection
            setTitle("");
            setDescription("");
            setDueDate("");
        } catch (error) {
            console.error(error);
            alert("Failed to assign task.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || user?.role !== 'ceo') return null;

    return (
        <>
            <Header title="Strategic Tasks" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8 pb-20 animate-in fade-in duration-500">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* --- EXECUTIVE ASSIGNMENT SECTION --- */}
                    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                        <div className="p-6 border-b border-purple-100 bg-purple-50">
                            <h2 className="text-lg font-bold text-purple-900">Assign Strategic Task To Executives</h2>
                            <p className="text-sm text-purple-600">Directives for C-Level Executives (COO, CCO).</p>
                        </div>

                        <form onSubmit={handleExecSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Executive</label>
                                    <select
                                        value={selectedExec}
                                        onChange={(e) => setSelectedExec(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                    >
                                        <option value="">Select Executive...</option>
                                        {executives.map(exec => (
                                            <option key={exec.uid} value={exec.uid}>
                                                {exec.name} ({exec.role.toUpperCase()})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Completion Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                        value={execDueDate}
                                        onChange={(e) => setExecDueDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Q4 Financial Strategy"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 outline-none font-medium"
                                        value={execTitle}
                                        onChange={(e) => setExecTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Directive</label>
                                    <textarea
                                        required
                                        placeholder="Outline key objectives and deliverables..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 outline-none min-h-[150px] resize-y"
                                        value={execDescription}
                                        onChange={(e) => setExecDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !selectedExec}
                                    className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                                    {isSubmitting ? "Assigning..." : "Assign Task"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* --- LEAD ASSIGNMENT SECTION (RENAMED) --- */}
                    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                        <div className="p-6 border-b border-purple-100 bg-purple-50">
                            <h2 className="text-lg font-bold text-purple-900">Assign Strategic Task To Leads</h2>
                            <p className="text-sm text-purple-600">Create high-level directives for Department Leads.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Department</label>
                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iqm-primary/20 outline-none"
                                    >
                                        <option value="Development">Development</option>
                                        <option value="UX">UX</option>
                                        <option value="Social Media">Social Media</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Lead</label>
                                    {leads.length > 0 ? (
                                        <select
                                            value={selectedLead}
                                            onChange={(e) => setSelectedLead(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iqm-primary/20 outline-none"
                                        >
                                            {leads.map(lead => (
                                                <option key={lead.uid} value={lead.uid}>{lead.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm">
                                            No Leads found in this department.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Q3 Roadmap Execution"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iqm-primary/20 outline-none font-medium"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Directive</label>
                                    <textarea
                                        required
                                        placeholder="Describe the strategic objectives and key results..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iqm-primary/20 outline-none min-h-[150px] resize-y"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Completion Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iqm-primary/20 outline-none"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !selectedLead || !title || !description || !dueDate}
                                    className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                                    {isSubmitting ? "Assigning..." : "Assign Task"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

                {/* Lists Section */}
                <div>
                    {/* Assigned To Executives List */}
                    <StrategicTasksList targetRole="executive" />

                    {/* Assigned To Lead List */}
                    <StrategicTasksList targetRole="lead" />
                </div>
            </main>
        </>
    );
}
