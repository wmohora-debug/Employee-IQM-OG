"use client";
import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { useEffect, useState } from "react";
import { subscribeToUsers, User } from "@/lib/db";
import { Users, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function EmployeesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (!loading && user?.role !== 'hr') {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const unsub = subscribeToUsers((updatedUsers) => {
            setUsers(updatedUsers);
        });
        return () => unsub();
    }, []);

    const employees = users.filter(u => u.role === 'employee');
    const leads = users.filter(u => u.role === 'lead');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iqm-primary"></div>
            </div>
        );
    }

    if (user?.role !== 'hr') return null;

    return (
        <>
            <Header title="Employees Overview" user={user?.name || "HR Manager"} />

            <main className="p-4 md:ml-64 md:p-8 space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Team Directory</h1>
                    <p className="text-gray-500 mt-1">View and manage all active Leads and Employees.</p>
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-purple-50/50">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Leads</h2>
                            <p className="text-sm text-gray-500">Team managers and supervisors</p>
                        </div>
                        <span className="ml-auto bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-xs">
                            {leads.length} Active
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">No leads found.</td>
                                    </tr>
                                ) : leads.map(lead => (
                                    <tr key={lead.uid} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                                                    {lead.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-gray-800">{lead.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 capitalize">
                                                <Shield className="w-3 h-3" />
                                                {lead.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{lead.email}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]"></div>
                                                <span className="text-sm font-medium text-gray-600">Active</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Employees Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-blue-50/50">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Employees</h2>
                            <p className="text-sm text-gray-500">Standard team members</p>
                        </div>
                        <span className="ml-auto bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                            {employees.length} Active
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">No employees found.</td>
                                    </tr>
                                ) : employees.map(emp => (
                                    <tr key={emp.uid} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-gray-800">{emp.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                                                <UserIcon className="w-3 h-3" />
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]"></div>
                                                <span className="text-sm font-medium text-gray-600">Active</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </>
    );
}
