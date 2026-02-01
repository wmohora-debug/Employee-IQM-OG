
"use client";

import React, { useState } from "react";
import { Trophy, Medal, Star, Clock, CheckCircle, TrendingUp, Search } from "lucide-react";
import { EmployeeStats } from "@/lib/svm/types";

// Mock Data
const MOCK_LEADERBOARD: EmployeeStats[] = [
    { employeeId: "1", displayName: "Sarah Smith", role: "employee", modulesCompleted: 45, svmRating: 4.8, timelinessScore: 98, leaderboardScore: 95 },
    { employeeId: "2", displayName: "Mike Johnson", role: "employee", modulesCompleted: 42, svmRating: 4.8, timelinessScore: 97, leaderboardScore: 92 },
    { employeeId: "3", displayName: "Emily Chen", role: "employee", modulesCompleted: 40, svmRating: 4.5, timelinessScore: 96, leaderboardScore: 90 },
    { employeeId: "4", displayName: "David Lee", role: "employee", modulesCompleted: 38, svmRating: 4.4, timelinessScore: 95, leaderboardScore: 88 },
    { employeeId: "5", displayName: "Alex Wong", role: "employee", modulesCompleted: 35, svmRating: 4.2, timelinessScore: 94, leaderboardScore: 85 },
    { employeeId: "6", displayName: "Maria Garcia", role: "employee", modulesCompleted: 34, svmRating: 4.0, timelinessScore: 93, leaderboardScore: 82 },
    { employeeId: "7", displayName: "James Wilson", role: "employee", modulesCompleted: 42, svmRating: 3.8, timelinessScore: 90, leaderboardScore: 81 }, // High output, lower rating
    { employeeId: "8", displayName: "Linda Martinez", role: "employee", modulesCompleted: 20, svmRating: 4.9, timelinessScore: 99, leaderboardScore: 80 }, // High quality, low volume
];

export default function LeaderboardPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = MOCK_LEADERBOARD.filter(emp =>
        emp.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.leaderboardScore - a.leaderboardScore); // Ensure sorted

    return (
        <div className="min-h-screen bg-indigo-950 text-white p-6 md:p-12 font-sans relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                            Employee Leaderboard
                        </h1>
                        <p className="text-indigo-300 mt-2">Top performers based on Skills, Output, and Reliability.</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 backdrop-blur-sm"
                        />
                    </div>
                </header>

                {/* Top 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {filteredData.slice(0, 3).map((emp, index) => (
                        <div
                            key={emp.employeeId}
                            className={`relative p-6 rounded-3xl border backdrop-blur-xl transition-transform hover:scale-105 duration-300
                ${index === 0 ? 'bg-gradient-to-br from-yellow-500/20 to-amber-900/20 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : ''}
                ${index === 1 ? 'bg-gradient-to-br from-gray-400/20 to-slate-800/20 border-gray-400/50' : ''}
                ${index === 2 ? 'bg-gradient-to-br from-orange-700/20 to-red-900/20 border-orange-600/50' : ''}
              `}
                        >
                            <div className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center rounded-full glass-icon shadow-lg">
                                {index === 0 && <Trophy className="w-6 h-6 text-yellow-400" fill="currentColor" />}
                                {index === 1 && <Medal className="w-6 h-6 text-gray-300" />}
                                {index === 2 && <Medal className="w-6 h-6 text-amber-600" />}
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-indigo-500/30 flex items-center justify-center text-2xl font-bold border-2 border-white/10">
                                    {emp.displayName.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm opacity-70 uppercase tracking-wider font-semibold">Rank #{index + 1}</div>
                                    <h3 className="text-xl font-bold">{emp.displayName}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <div className="text-xs text-indigo-300 mb-1">Score</div>
                                    <div className="font-bold text-lg">{emp.leaderboardScore}</div>
                                </div>
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <div className="text-xs text-indigo-300 mb-1">Skill</div>
                                    <div className="font-bold text-lg flex items-center justify-center gap-1">
                                        {emp.svmRating} <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                                    </div>
                                </div>
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <div className="text-xs text-indigo-300 mb-1">On-Time</div>
                                    <div className="font-bold text-lg text-emerald-400">{emp.timelinessScore}%</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* List View */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-indigo-300 text-sm font-semibold uppercase tracking-wider">
                        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                        <div className="col-span-6 md:col-span-4">Employee</div>
                        <div className="col-span-4 md:col-span-2 text-center hidden md:block">Score</div>
                        <div className="col-span-2 text-center hidden md:block">SVM Rating</div>
                        <div className="col-span-2 text-center hidden md:block">On-Time</div>
                        <div className="col-span-4 md:col-span-1 text-right">Trend</div>
                    </div>

                    {filteredData.slice(3).map((emp, index) => (
                        <div
                            key={emp.employeeId}
                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                        >
                            <div className="col-span-2 md:col-span-1 text-center font-bold text-indigo-200">
                                #{index + 4}
                            </div>
                            <div className="col-span-6 md:col-span-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-sm font-bold">
                                    {emp.displayName.charAt(0)}
                                </div>
                                <span className="font-medium group-hover:text-white transition-colors">{emp.displayName}</span>
                            </div>

                            <div className="col-span-4 md:col-span-2 text-center font-bold text-indigo-100 hidden md:block text-2xl md:text-base">
                                {emp.leaderboardScore}
                            </div>

                            <div className="col-span-2 text-center hidden md:block">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium">
                                    <Star className="w-3 h-3 mr-1" fill="currentColor" /> {emp.svmRating}
                                </div>
                            </div>

                            <div className="col-span-2 text-center hidden md:block">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                                    <Clock className="w-3 h-3 mr-1" /> {emp.timelinessScore}%
                                </div>
                            </div>

                            <div className="col-span-4 md:col-span-1 text-right flex justify-end">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
