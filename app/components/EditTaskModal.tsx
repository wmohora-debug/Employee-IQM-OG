"use client";
import { useState, useEffect } from 'react';
import { X, User as UserIcon, Loader2 } from 'lucide-react';
import { Task, User, updateTask } from '@/lib/db';
import { useAuth } from '@/app/context/AuthContext';
import { Timestamp } from 'firebase/firestore';

interface EditTaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
}

export function EditTaskModal({ task, isOpen, onClose }: EditTaskModalProps) {
    const { user } = useAuth();

    // Core Fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('medium');

    // Modules (For Leads)
    const [modules, setModules] = useState<Task['modules']>([]);

    // Data Loading
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && task) {
            // Pre-fill Data
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'medium');

            // Handle Date
            if (task.dueDate) {
                // Check if Firestore Timestamp or Date
                const d = (task.dueDate as any).toDate ? (task.dueDate as any).toDate() : new Date(task.dueDate as any);
                setDueDate(d.toISOString().split('T')[0]);
            } else {
                setDueDate('');
            }

            // Modules
            setModules(task.modules ? [...task.modules] : []);
        }
    }, [isOpen, task, user]);



    const handleSave = async () => {
        if (!task || !user) return;

        setLoading(true);
        try {
            const updates: Partial<Task> = {};

            // Common Updates
            if (title !== task.title) updates.title = title;
            if (description !== task.description) updates.description = description;
            if (dueDate) {
                const newDate = new Date(dueDate);
                const oldDate = (task.dueDate as any).toDate ? (task.dueDate as any).toDate() : new Date(task.dueDate as any);
                // Check distinct day
                if (newDate.toISOString().split('T')[0] !== oldDate.toISOString().split('T')[0]) {
                    updates.dueDate = newDate;
                }
            }

            // Role Specific
            if (user.role === 'lead') {
                if (priority !== task.priority) updates.priority = priority;

                // Modules
                if (modules && modules.length > 0) {
                    updates.modules = modules.map(m => ({
                        ...m,
                        title: m.title,
                        description: m.description
                    }));
                }
            }



            if (Object.keys(updates).length > 0) {
                await updateTask(task.id!, updates);
            }

            onClose();
        } catch (error) {
            console.error("Failed to update task", error);
            alert("Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    const updateModuleField = (index: number, field: 'title' | 'description', value: string) => {
        if (!modules) return;
        const newModules = [...modules];
        newModules[index] = { ...newModules[index], [field]: value };
        setModules(newModules);
    };

    if (!isOpen || !task) return null;

    const isLead = user?.role === 'lead';
    const isCEO = user?.role === 'ceo';
    const isExecutiveTask = task.taskType === 'executive';

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
                        <p className="text-sm text-gray-500">Update task details and requirements</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* Core Info */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">General Information</label>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all h-24 resize-none"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                />
                            </div>

                            {isLead && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all capitalize"
                                        value={priority}
                                        onChange={e => setPriority(e.target.value as any)}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            )}

                            {/* Reassignment removed for CEO as per requirements */}
                        </div>
                    </div>

                    {isLead && modules && modules.length > 0 && (
                        <>
                            <div className="h-px bg-gray-100 w-full"></div>
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Task Modules</label>

                                {modules.map((m, idx) => (
                                    <div key={idx} className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-400">Module {idx + 1}</span>
                                            <span className="text-xs px-2 py-0.5 bg-gray-200 rounded text-gray-600 font-medium capitalize">{m.status}</span>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Module Title</label>
                                            <input
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-iqm-primary outline-none bg-white"
                                                value={m.title}
                                                onChange={e => updateModuleField(idx, 'title', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Module Description</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-iqm-primary outline-none bg-white h-16 resize-none"
                                                value={m.description || ''}
                                                onChange={e => updateModuleField(idx, 'description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

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
                        onClick={handleSave}
                        disabled={loading}
                        className="px-5 py-2.5 bg-iqm-primary text-white font-medium rounded-xl hover:bg-iqm-sidebar shadow-lg shadow-iqm-primary/25 transition-all text-sm flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>
    );
}
