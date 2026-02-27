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
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-1000">
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
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
                        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(236,72,153,0.08),transparent_50%)]"
                    />
                    {!isMobile && (
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-[50%] -right-[50%] w-[200%] h-[200%] opacity-20 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(139,92,246,0.05)_0deg,transparent_60deg,rgba(236,72,153,0.05)_120deg,transparent_180deg)]"
                        />
                    )}
                </>
            )}

            {theme === 'social' && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(6,182,212,0.1),transparent_60%)]"
                    />
                    {!isMobile && (
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0"
                            style={{ backgroundImage: 'radial-gradient(rgba(6,182,212,0.2) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                        />
                    )}
                </>
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

            {(theme === 'cco' || theme === 'ceo' || theme === 'admin') && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(153,27,27,0.05),transparent_60%),radial-gradient(circle_at_80%_80%,_rgba(153,27,27,0.05),transparent_60%)] animate-[pulse_12s_ease-in-out_infinite]"
                />
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

