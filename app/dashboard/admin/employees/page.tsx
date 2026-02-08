"use client";
import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { useEffect, useState } from "react";
import { subscribeToUsers, User } from "@/lib/db";
import { Users, Shield, User as UserIcon, Briefcase } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function EmployeesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (!loading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, loading, router]);

    useEffect(() => {
        // Admin needs to see ALL users, so we pass undefined for department filter
        const unsub = subscribeToUsers(undefined, (updatedUsers) => {
            setUsers(updatedUsers);
        });
        return () => unsub();
    }, []);

    const departments = ["Development", "UX", "Social Media"];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iqm-primary"></div>
            </div>
        );
    }

    if (user?.role !== 'admin') return null;

    return (
        <>
            <Header title="Employees Overview" />

            <main className="p-4 md:ml-64 md:p-8 space-y-12 animate-in fade-in duration-500 pb-20">
                {/* Header Section */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Team Directory</h1>
                    <p className="text-gray-500 mt-1">View and manage all active Leads and Employees organized by department.</p>
                </div>

                {departments.map(dept => {
                    const deptUsers = users.filter(u =>
                        dept === "Other"
                            ? (!u.department || !["Development", "UX", "Social Media"].includes(u.department))
                            : u.department === dept
                    );

                    const leads = deptUsers.filter(u => u.role === 'lead');
                    const employees = deptUsers.filter(u => u.role === 'employee');

                    if (deptUsers.length === 0) return null;

                    return (
                        <div key={dept} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm 
                                        ${dept === 'Development' ? 'bg-blue-100 text-blue-600' :
                                            dept === 'UX' ? 'bg-pink-100 text-pink-600' :
                                                dept === 'Social Media' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{dept}</h2>
                                        <p className="text-sm text-gray-500 font-medium">{deptUsers.length} Team Members</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Leads Section */}
                                {leads.length > 0 && (
                                    <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-purple-600" />
                                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Team Leads</h3>
                                        </div>
                                        <table className="w-full text-left">
                                            <tbody>
                                                {leads.map(lead => (
                                                    <tr key={lead.uid} className="hover:bg-white transition-colors border-b border-gray-100 last:border-0">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                                                    {lead.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-800 text-sm">{lead.name}</p>
                                                                    <p className="text-xs text-gray-500">{lead.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-green-700 bg-green-50 border border-green-100">
                                                                Active
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Employees Section */}
                                <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-blue-600" />
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Employees</h3>
                                    </div>
                                    <table className="w-full text-left">
                                        <tbody>
                                            {employees.length === 0 ? (
                                                <tr>
                                                    <td className="px-6 py-8 text-center text-gray-400 text-sm italic">
                                                        No employees assigned to this department yet.
                                                    </td>
                                                </tr>
                                            ) : employees.map(emp => (
                                                <tr key={emp.uid} className="hover:bg-white transition-colors border-b border-gray-100 last:border-0">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                                                {emp.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800 text-sm">{emp.name}</p>
                                                                <p className="text-xs text-gray-500">{emp.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-green-700 bg-green-50 border border-green-100">
                                                            Active
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>
        </>
    );
}
