"use client";
import { LayoutDashboard, CheckSquare, BarChart2, Award, LogOut, CheckCircle, Users, Menu, X } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IQMLogoFull } from "./Logo";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import { LogoutModal } from "./LogoutModal";


export function Sidebar({ role = 'lead' }: { role?: 'lead' | 'employee' | 'admin' | 'ceo' | 'cco' | 'coo' }) {
    const { logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = async () => {
        try {
            await logout();
            setIsLogoutModalOpen(false);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

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
            { name: 'Strategic Tasks', icon: BarChart2, href: `/dashboard/ceo/strategic-tasks` },
        ] : []),

        // CCO Role: Identical to CEO
        ...(role === 'cco' ? [
            { name: 'Leaderboard', icon: Award, href: `/dashboard/cco/leaderboard` },
            { name: 'Employees', icon: Users, href: `/dashboard/cco/employees` },
            { name: 'Tasks Overview', icon: CheckSquare, href: `/dashboard/cco/tasks` },
            { name: 'Strategic Tasks', icon: BarChart2, href: `/dashboard/cco/strategic-tasks` },
        ] : []),

        // COO Role: Identical to CEO
        ...(role === 'coo' ? [
            { name: 'Leaderboard', icon: Award, href: `/dashboard/coo/leaderboard` },
            { name: 'Employees', icon: Users, href: `/dashboard/coo/employees` },
            { name: 'Tasks Overview', icon: CheckSquare, href: `/dashboard/coo/tasks` },
            { name: 'Strategic Tasks', icon: BarChart2, href: `/dashboard/coo/strategic-tasks` },
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
        <>
            {/* Mobile Toggle Button - Hidden when sidebar is open */}
            {!isOpen && (
                <button
                    className="md:hidden fixed top-4 left-4 z-50 p-2 bg-iqm-primary text-white rounded-md shadow-lg hover:bg-iqm-primary/90 transition-colors"
                    onClick={toggleSidebar}
                    aria-label="Open Sidebar"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
            />

            <aside className={`
                w-64 bg-iqm-sidebar text-white flex flex-col h-[100dvh] fixed left-0 top-0 z-40 shadow-xl overflow-hidden transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>

                <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-md group cursor-pointer hover:scale-105 transition-transform">
                            <IQMLogoFull className="w-7 h-7 text-iqm-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">IQM</h1>
                    </div>

                    {/* Internal Close Button for Mobile */}
                    <button
                        className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close Sidebar"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)} // Close on navigate (mobile)
                            className="group flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95 font-medium"
                        >
                            <item.icon className="w-5 h-5 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all" />
                            <span className="text-sm tracking-wide">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-1 shrink-0 bg-iqm-sidebar">
                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/80 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200 active:scale-95 text-left text-sm font-medium group"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
