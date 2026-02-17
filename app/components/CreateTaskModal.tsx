"use client";
import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Calendar, Paperclip, Upload, Loader2, User as UserIcon } from 'lucide-react';
import { createTask, Task, User, getEmployees } from '@/lib/db';
import { useAuth } from '@/app/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ModuleState {
    title: string;
    description: string;
    assignedTo: string;
    attachment?: { name: string; url: string };
    uploading?: boolean;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [priority, setPriority] = useState<Task['priority']>('medium');
    const [dueDate, setDueDate] = useState('');

    // Modules State
    const [modules, setModules] = useState<ModuleState[]>([]);

    // Employees Data
    const [employees, setEmployees] = useState<User[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);

    // Fetch Employees (Filtered by Lead's Department)
    useEffect(() => {
        const fetchEmps = async () => {
            if (!user) return;
            // If user is lead, filter by their department. If admin/other, maybe all (but this modal is for Leads)
            const rawDept = user.department;
            const dept = (Array.isArray(rawDept) ? rawDept[0] : rawDept) || "Development";
            const emps = await getEmployees(dept);
            setEmployees(emps);
            setLoadingEmployees(false);
        };
        fetchEmps();
    }, [user]);

    if (!isOpen) return null;

    const addModule = () => {
        setModules([...modules, { title: '', description: '', assignedTo: employees[0]?.uid || '', uploading: false }]);
    };

    const removeModule = (index: number) => {
        const newModules = [...modules];
        newModules.splice(index, 1);
        setModules(newModules);
    };

    const updateModule = (index: number, field: keyof ModuleState, value: any) => {
        setModules(prev => {
            const newModules = [...prev];
            newModules[index] = { ...newModules[index], [field]: value };
            return newModules;
        });
    };

    const handleSubmit = async () => {
        if (!title || !description || !dueDate) return alert('Please fill in all required task fields');
        if (modules.length === 0) return alert('Please add at least one module');

        const selectedDate = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return alert("Due date cannot be in the past");

        for (const m of modules) {
            if (!m.title || !m.assignedTo) {
                return alert('All modules must have a title and an assignee.');
            }
        }

        const allAssignees = Array.from(new Set(modules.map(m => m.assignedTo).filter(Boolean)));

        setLoading(true);
        try {
            await createTask({
                title,
                description,
                assignedTo: modules[0].assignedTo,
                assigneeIds: allAssignees,
                assignedBy: user?.uid || '',
                department: (Array.isArray(user?.department) ? user.department[0] : user?.department) || 'Development', // Save Department
                status: 'pending',
                priority,
                dueDate: new Date(dueDate),
                modules: modules.map((m, idx) => ({
                    id: `mod_${Date.now()}_${idx}`, // Temporary ID
                    title: m.title,
                    description: m.description,
                    assignedTo: m.assignedTo,
                    status: 'pending', // Required field
                    // removed attachment completely
                    // removed completed: false (not in interface)
                }))
            });

            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setDueDate('');
            setModules([]);
        } catch (error) {
            console.error(error);
            alert('Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Create New Task</h2>
                        <p className="text-sm text-gray-500">Define task scope and assign modules to employees</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* General Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">General Information</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all"
                                placeholder="e.g. Q1 Marketing Campaign"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all h-20 resize-none"
                                placeholder="Project goals and requirements..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <div className="flex gap-2">
                                    {['low', 'medium', 'high'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPriority(p as any)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all border ${priority === p
                                                ? 'bg-iqm-primary text-white border-iqm-primary'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full"></div>

                    {/* Modules Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Modules</h3>
                            <button
                                onClick={addModule}
                                className="text-xs flex items-center gap-1 text-iqm-primary font-bold hover:bg-iqm-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Module
                            </button>
                        </div>

                        <div className="space-y-4">
                            {modules.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-500">No modules added yet.</p>
                                    <p className="text-xs text-gray-400">Add modules to split the work.</p>
                                </div>
                            )}

                            {modules.map((module, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="flex-1 space-y-4">
                                            {/* Module Name */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Module Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Frontend Implementation"
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all font-semibold text-gray-800"
                                                    value={module.title}
                                                    onChange={(e) => updateModule(idx, 'title', e.target.value)}
                                                />
                                            </div>

                                            {/* Module Description */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Module Description</label>
                                                <textarea
                                                    placeholder="Describe the specific work for this module..."
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all text-sm h-24 resize-y"
                                                    value={module.description}
                                                    onChange={(e) => updateModule(idx, 'description', e.target.value)}
                                                />
                                            </div>

                                            {/* Assignee */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Assign To <span className="text-red-500">*</span></label>
                                                <div className="relative max-w-xs">
                                                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <select
                                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:border-iqm-primary outline-none appearance-none"
                                                        value={module.assignedTo}
                                                        onChange={(e) => updateModule(idx, 'assignedTo', e.target.value)}
                                                    >
                                                        <option value="" disabled>Select Employee...</option>
                                                        {employees.map(emp => (
                                                            <option key={emp.uid} value={emp.uid}>{emp.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeModule(idx)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Remove Module"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 bg-iqm-primary text-white font-medium rounded-xl hover:bg-iqm-sidebar shadow-lg shadow-iqm-primary/25 transition-all text-sm flex items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Creating...' : 'Create & Publish'}
                    </button>
                </div>
            </div>
        </div>
    );
}
