"use client";

import React from "react";

export function PremiumBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
            {/* 1. Underlying Mesh Gradient Layer - High Motion */}
            <div className="absolute inset-0 opacity-60">
                {/* Top Left - Indigo/Purple - Moves Diagonally */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-[50px] animate-blob" />

                {/* Top Right - Blue/Cyan - Opposing Motion */}
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[50px] animate-blob animation-delay-2000" />

                {/* Bottom Left - Pink - Wide Range Motion */}
                <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-purple-400/30 rounded-full mix-blend-multiply filter blur-[50px] animate-blob-wide animation-delay-4000" />
            </div>

            {/* 2. DISTINCT Active Floating Orbs (2 Left, 2 Right) */}

            {/* -- LEFT SIDE -- */}
            {/* Orb 1: Purple - Top Left - Vertical Float */}
            <div className="absolute top-[15%] left-[5%] lg:left-[10%] w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-[20px] opacity-70 animate-float-vertical"></div>

            {/* Orb 2: Indigo - Bottom Left - Orbit Motion */}
            <div className="absolute bottom-[20%] left-[5%] lg:left-[8%] w-24 h-24 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[20px] opacity-70 animate-orbit animation-delay-2000"></div>

            {/* -- RIGHT SIDE -- */}
            {/* Orb 3: Cyan - Top Right - Orbit Motion (Counter) */}
            <div className="absolute top-[15%] right-[5%] lg:right-[10%] w-28 h-28 bg-cyan-300 rounded-full mix-blend-multiply filter blur-[20px] opacity-60 animate-orbit-counter"></div>

            {/* Orb 4: Blue - Bottom Right - Horizontal Float */}
            <div className="absolute bottom-[25%] right-[5%] lg:right-[10%] w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-[20px] opacity-70 animate-float-horizontal"></div>


            {/* 3. Grid for grounding */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            {/* Global Keyframes - VISIBLE MOTION */}
            <style jsx global>{`
                /* Base Blob Motion */
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(50px, -50px) scale(1.1); }
                    66% { transform: translate(-40px, 40px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 15s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
                }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }

                /* Wide Range Blob */
                @keyframes blob-wide {
                    0% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(150px, -100px) scale(1.2); } /* Big movement */
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob-wide {
                    animation: blob-wide 20s infinite alternate ease-in-out;
                }
                
                /* Vertical Float - Distinct */
                @keyframes float-vertical {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-100px); } /* 100px movement */
                    100% { transform: translateY(0px); }
                }
                .animate-float-vertical {
                    animation: float-vertical 8s ease-in-out infinite;
                }

                /* Horizontal Float - Distinct */
                @keyframes float-horizontal {
                    0% { transform: translateX(0px); }
                    50% { transform: translateX(-120px); } /* 120px movement */
                    100% { transform: translateX(0px); }
                }
                .animate-float-horizontal {
                    animation: float-horizontal 10s ease-in-out infinite;
                }

                /* Orbit - Very distinct circular motion */
                @keyframes orbit {
                    0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
                }
                .animate-orbit {
                    animation: orbit 12s linear infinite;
                }

                /* Counter Orbit */
                @keyframes orbit-counter {
                    0% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
                    100% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
                }
                .animate-orbit-counter {
                    animation: orbit-counter 15s linear infinite;
                }
            `}</style>
        </div>
    );
}
