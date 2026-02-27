"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function RoleBackground() {
    const { user } = useAuth();
    const [theme, setTheme] = useState('default');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (!user) return;

        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const d = Array.isArray(user.department) ? user.department[0] : user.department;
        const r = user.role;

        if (d === 'Development') setTheme('dev');
        else if (d === 'UX') setTheme('ux');
        else if (d === 'Social Media') setTheme('social');
        else if (r === 'ceo') setTheme('ceo');
        else if (r === 'coo') setTheme('coo');
        else if (r === 'cco') setTheme('cco');
        else if (r === 'admin') setTheme('admin');
        else setTheme('default');

        return () => window.removeEventListener('resize', checkMobile);
    }, [user]);

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-gray-50 transition-colors duration-1000">
            {theme === 'dev' && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.08),transparent_60%)]"
                    />
                    {!isMobile && (
                        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] bg-[size:40px_40px] animate-[pulse_8s_ease-in-out_infinite]" />
                    )}
                </>
            )}

            {theme === 'ux' && (
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
                        className="absolute inset-0 bg-gradient-to-br from-violet-200/60 via-indigo-200/50 to-fuchsia-200/40"
                    />
                    {!isMobile && (
                        <div className="absolute inset-0 opacity-[0.4] pointer-events-none">
                            <motion.div
                                animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
                                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-[10%] left-[10%] w-[40%] h-[50%] bg-violet-600 rounded-full filter blur-[90px]"
                            />
                            <motion.div
                                animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
                                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-[10%] right-[10%] w-[50%] h-[40%] bg-indigo-600 rounded-full filter blur-[110px]"
                            />
                        </div>
                    )}
                </div>
            )}

            {theme === 'social' && (
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-gradient-to-br from-cyan-100/80 via-teal-100/60 to-sky-100/80"
                    />
                    {!isMobile && (
                        <>
                            <motion.div
                                className="absolute inset-[-10%] bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.3)_1px,transparent_1px)] bg-[size:24px_24px] opacity-100"
                                animate={{ x: [0, -24, 0] }}
                                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[shimmer-sweep_12s_infinite]" />
                        </>
                    )}
                </div>
            )}

            {theme === 'coo' && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(16,185,129,0.08),transparent_60%)]"
                    />
                    {!isMobile && (
                        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(16,185,129,0.5)_1px,transparent_1px)] bg-[size:100%_40px] animate-[slide_20s_linear_infinite]" />
                    )}
                </>
            )}

            {theme === 'cco' && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(153,27,27,0.05),transparent_60%),radial-gradient(circle_at_80%_80%,_rgba(153,27,27,0.05),transparent_60%)] animate-[pulse_12s_ease-in-out_infinite]"
                />
            )}

            {theme === 'admin' && (
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-slate-100"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(-45deg,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:64px_64px]" />
                </div>
            )}

            {theme === 'ceo' && (
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-blue-100/70"
                    />
                    <div className="absolute inset-0 opacity-[1] bg-[linear-gradient(30deg,rgba(51,65,85,0.08)_1px,transparent_1px),linear-gradient(-30deg,rgba(51,65,85,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />

                    {/* Spotlight glow behind KPIs / Header */}
                    <div className="absolute top-[-10%] left-[20%] w-[60%] h-[50%] bg-blue-600/20 filter blur-[100px] rounded-full pointer-events-none" />
                </div>
            )}

            {theme === 'default' && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(107,114,128,0.05),transparent_70%)]"
                />
            )}

            {/* Global Light Sweep overlay (subtle) */}
            <motion.div
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear', delay: 5 }}
                className="absolute top-0 bottom-0 w-[400px] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] opacity-30 mix-blend-overlay"
            />
        </div>
    );
}

