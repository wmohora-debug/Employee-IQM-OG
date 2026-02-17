"use client";
import { Header } from "@/app/components/Header";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { createTask, subscribeToUsers, User } from "@/lib/db";
import { Loader2, Send } from "lucide-react";
import { StrategicTasksList } from "@/app/components/StrategicTasksList";

export default function CCOStrategicTasksPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Auth Check
    useEffect(() => {
        if (!loading && user?.role !== 'cco') {
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Leads when department changes
    useEffect(() => {
        if (!loading && user?.role === 'cco') {
            const unsub = subscribeToUsers(department, (deptUsers) => {
                const deptLeads = deptUsers.filter(u => u.role === 'lead');
                setLeads(deptLeads);

                if (deptLeads.length > 0) {
                    setSelectedLead(prev => deptLeads.find(l => l.uid === prev)?.uid || deptLeads[0].uid);
                } else {
                    setSelectedLead("");
                }
            });
            return () => unsub();
        }
    }, [department, user, loading]);

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
                assignedTo: selectedLead,
                assignedBy: user!.uid,
                status: 'pending',
                department,
                priority: 'high',
                dueDate: new Date(dueDate),
                assigneeIds: [selectedLead],
                createdByRole: 'cco', // CCO Role
                createdByUserId: user!.uid
            });

            alert("Strategic Task Assigned Successfully.");
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

    if (loading || user?.role !== 'cco') return null;

    return (
        <>
            <Header title="Strategic Tasks (CCO)" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8 pb-20 animate-in fade-in duration-500">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800">Assign Strategic Task</h2>
                            <p className="text-sm text-gray-500">Create high-level directives for Department Leads.</p>
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
                                    disabled={isSubmitting || leads.length === 0}
                                    className="px-8 py-3 bg-iqm-primary text-white font-bold rounded-xl shadow-lg hover:bg-iqm-sidebar active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                                    {isSubmitting ? "Assigning..." : "Assign Task"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

                {/* Assigned To Lead List - Filtered by current user via internal logic */}
                <StrategicTasksList />
            </main>
        </>
    );
}
