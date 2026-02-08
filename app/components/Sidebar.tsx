"use client";
import { LayoutDashboard, CheckSquare, BarChart2, Award, LogOut, CheckCircle, Users } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IQMLogoFull } from "./Logo";
import { useAuth } from "@/app/context/AuthContext";


export function Sidebar({ role = 'lead' }: { role?: 'lead' | 'employee' | 'admin' | 'ceo' }) {
    const { logout } = useAuth();
    const router = useRouter(); // Use router for cleaner nav if needed, but Links are fine.

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const menuItems = [
        // Admin Role: Only User Management and Leaderboard
        ...(role === 'admin' ? [
            { name: 'Employees', icon: Users, href: `/dashboard/admin/employees` },
            { name: 'Admin User Management', icon: Users, href: `/dashboard/admin/sync` },
            { name: 'Leaderboard', icon: Award, href: `/dashboard/admin/leaderboard` },
        ] : []),

        // CEO Role: Leaderboard (Global), Employees (Grouped)
        ...(role === 'ceo' ? [
            { name: 'Leaderboard', icon: Award, href: `/dashboard/ceo/leaderboard` },
            { name: 'Employees', icon: Users, href: `/dashboard/ceo/employees` },
            { name: 'Tasks Overview', icon: CheckSquare, href: `/dashboard/ceo/tasks` },
        ] : []),

        // Lead Role: Dashboard, Tasks, Completed, Skills, Leaderboard (NO User Management)
        ...(role === 'lead' ? [
            { name: 'Dashboard', icon: LayoutDashboard, href: `/dashboard/lead` },
            { name: 'Task Management', icon: CheckSquare, href: `/dashboard/lead/tasks` },
            { name: 'Completed Tasks', icon: CheckCircle, href: `/dashboard/lead/completed` },
            { name: 'Skill Matrix', icon: BarChart2, href: `/dashboard/lead/skills` },
            { name: 'Leaderboard', icon: Award, href: `/dashboard/lead/leaderboard` },
        ] : []),

        // Employee Role: Dashboard, My Tasks, Completed, Leaderboard
        ...(role === 'employee' ? [
            { name: 'Dashboard', icon: LayoutDashboard, href: `/dashboard/employee` },
            { name: 'My Tasks', icon: CheckSquare, href: `/dashboard/employee/tasks` },
            { name: 'Completed Tasks', icon: CheckCircle, href: `/dashboard/employee/completed` },
            { name: 'Leaderboard', icon: Award, href: `/dashboard/employee/leaderboard` },
        ] : [])
    ];

    return (
        <aside className="w-64 bg-iqm-sidebar text-white hidden md:flex flex-col h-full min-h-screen fixed left-0 top-0 z-10 shadow-xl overflow-hidden">

            <div className="p-6 flex items-center gap-3 border-b border-white/10">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-md group cursor-pointer hover:scale-105 transition-transform">
                    <IQMLogoFull className="w-7 h-7 text-iqm-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">IQM</h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95 font-medium"
                    >
                        <item.icon className="w-5 h-5 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all" />
                        <span className="text-sm tracking-wide">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-1">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/80 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200 active:scale-95 text-left text-sm font-medium group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
