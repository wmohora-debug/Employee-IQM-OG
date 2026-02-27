"use client";

import React, { useEffect, useState } from "react";

export function PremiumBackground() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            setMousePos({ x, y });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0B1120]">

            {/* Layer 1 - Base Gradient */}
            <div className="absolute inset-[-50%] bg-[linear-gradient(135deg,#0B1120_0%,#111827_50%,#0B1120_100%)] animate-gradient-shift opacity-90" />

            {/* Layer 2 - Animated Digital Grid */}
            <div
                className="absolute inset-[-20%] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px] animate-grid-drift opacity-80"
                style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
            />

            {/* Layer 3 - Floating Nodes */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_2px_rgba(59,130,246,0.3)] animate-float-node-1 opacity-[0.15]" />
                <div className="absolute top-[60%] left-[10%] w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_2px_rgba(99,102,241,0.3)] animate-float-node-2 opacity-[0.15]" />
                <div className="absolute top-[30%] right-[20%] w-1 h-1 bg-violet-400 rounded-full shadow-[0_0_10px_2px_rgba(139,92,246,0.3)] animate-float-node-3 opacity-[0.15]" />
                <div className="absolute top-[75%] right-[15%] w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_2px_rgba(6,182,212,0.3)] animate-float-node-4 opacity-[0.15]" />

                {/* Connecting subtle line simulation */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
                    <line x1="15%" y1="20%" x2="10%" y2="60%" stroke="#fff" strokeWidth="1" />
                    <line x1="20%" y1="30%" x2="15%" y2="75%" stroke="#fff" strokeWidth="1" />
                </svg>
            </div>

            {/* Layer 4 - Department Pulse Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] md:w-[60vw] md:h-[60vw] max-w-[800px] max-h-[800px] rounded-full filter blur-[100px] md:blur-[140px] pointer-events-none mix-blend-screen opacity-100">
                <div className="absolute inset-0 rounded-full bg-blue-500/15 animate-pulse-dev" />    {/* Development */}
                <div className="absolute inset-0 rounded-full bg-violet-500/15 animate-pulse-ux" />   {/* UX */}
                <div className="absolute inset-0 rounded-full bg-cyan-500/15 animate-pulse-social" /> {/* Social Media */}
            </div>

            {/* Global Keyframes */}
            <style jsx global>{`
                @keyframes gradient-shift {
                    0% { transform: translate(0, 0) scale(1.05); }
                    50% { transform: translate(-3%, 4%) scale(1.08); }
                    100% { transform: translate(0, 0) scale(1.05); }
                }
                .animate-gradient-shift {
                    animation: gradient-shift 40s ease-in-out infinite;
                }

                @keyframes grid-drift {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(60px); }
                }
                .animate-grid-drift {
                    animation: grid-drift 40s linear infinite;
                    transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                @keyframes pulse-dev {
                    0%, 28% { opacity: 1; }
                    33%, 95% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .animate-pulse-dev { animation: pulse-dev 36s ease-in-out infinite; }

                @keyframes pulse-ux {
                    0%, 28% { opacity: 0; }
                    33%, 61% { opacity: 1; }
                    66%, 100% { opacity: 0; }
                }
                .animate-pulse-ux { animation: pulse-ux 36s ease-in-out infinite; }

                @keyframes pulse-social {
                    0%, 61% { opacity: 0; }
                    66%, 95% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .animate-pulse-social { animation: pulse-social 36s ease-in-out infinite; }

                @keyframes float-node-1 {
                    0%, 100% { transform: translate(0, 0); opacity: 0.1; }
                    50% { transform: translate(20px, -30px); opacity: 0.2; }
                }
                .animate-float-node-1 { animation: float-node-1 18s ease-in-out infinite alternate; }

                @keyframes float-node-2 {
                    0%, 100% { transform: translate(0, 0); opacity: 0.1; }
                    50% { transform: translate(-30px, 20px); opacity: 0.2; }
                }
                .animate-float-node-2 { animation: float-node-2 22s ease-in-out infinite alternate; }

                @keyframes float-node-3 {
                    0%, 100% { transform: translate(0, 0); opacity: 0.1; }
                    50% { transform: translate(-20px, -20px); opacity: 0.2; }
                }
                .animate-float-node-3 { animation: float-node-3 19s ease-in-out infinite alternate; }

                @keyframes float-node-4 {
                    0%, 100% { transform: translate(0, 0); opacity: 0.1; }
                    50% { transform: translate(30px, 30px); opacity: 0.2; }
                }
                .animate-float-node-4 { animation: float-node-4 21s ease-in-out infinite alternate; }

                @keyframes shimmer-sweep {
                    0%, 94% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer-sweep { animation: shimmer-sweep 20s infinite; }

                @keyframes sync-border-colors {
                    0%, 28% { box-shadow: 0 0 0 1px #3B82F6, 0 0 10px 1px rgba(59,130,246,0.3); }
                    33%, 61% { box-shadow: 0 0 0 1px #8B5CF6, 0 0 10px 1px rgba(139,92,246,0.3); }
                    66%, 95% { box-shadow: 0 0 0 1px #06B6D4, 0 0 10px 1px rgba(6,182,212,0.3); }
                    100% { box-shadow: 0 0 0 1px #3B82F6, 0 0 10px 1px rgba(59,130,246,0.3); }
                }
                .animate-sync-border-colors { animation: sync-border-colors 36s infinite linear; }

                @keyframes sync-card-glow {
                    0%, 28% { box-shadow: inset 0 0 0 1px rgba(59,130,246,0.2), 0 0 20px 0 rgba(59,130,246,0.08); }
                    33%, 61% { box-shadow: inset 0 0 0 1px rgba(139,92,246,0.2), 0 0 20px 0 rgba(139,92,246,0.08); }
                    66%, 95% { box-shadow: inset 0 0 0 1px rgba(6,182,212,0.2), 0 0 20px 0 rgba(6,182,212,0.08); }
                    100% { box-shadow: inset 0 0 0 1px rgba(59,130,246,0.2), 0 0 20px 0 rgba(59,130,246,0.08); }
                }
                .animate-sync-card-glow { animation: sync-card-glow 36s infinite linear; }
            `}</style>
        </div>
    );
}
