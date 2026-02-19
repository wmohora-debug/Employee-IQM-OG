"use client";
import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { subscribeToUsers, User } from '@/lib/db';

export function ExecutiveList() {
    const [executives, setExecutives] = useState<User[]>([]);

    useEffect(() => {
        // Subscribe to all users to filter executives
        const unsub = subscribeToUsers(undefined, (allUsers) => {
            const execs = allUsers.filter(u => ['admin', 'ceo', 'cco', 'coo'].includes(u.role));
            // Sort by role precedence: CEO, COO, CCO, Admin
            const roleOrder = { 'ceo': 1, 'coo': 2, 'cco': 3, 'admin': 4 };
            execs.sort((a, b) => (roleOrder[a.role as keyof typeof roleOrder] || 99) - (roleOrder[b.role as keyof typeof roleOrder] || 99));
            setExecutives(execs);
        });
        return () => unsub();
    }, []);

    if (executives.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm border border-gray-200">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Executive Team</h2>
                    <p className="text-sm text-gray-500 font-medium">Leadership & Administration</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 w-1/3">Name</th>
                            <th className="px-6 py-4 w-1/3">Email</th>
                            <th className="px-6 py-4 w-1/3 text-right">Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {executives.map(exec => (
                            <tr key={exec.uid} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                            {exec.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm">{exec.name}</span>
                                    </div>

                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                    {exec.email}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border
                                        ${exec.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' :
                                            exec.role === 'ceo' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                exec.role === 'cco' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100' // coo
                                        }
                                    `}>
                                        {exec.role}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
