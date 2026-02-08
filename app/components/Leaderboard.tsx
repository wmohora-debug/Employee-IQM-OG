"use client";
import { Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { subscribeToLeaderboard, User } from "@/lib/db";

import { useAuth } from "@/app/context/AuthContext";

export function Leaderboard({ department }: { department?: string }) {
    const { user } = useAuth();
    const [leaders, setLeaders] = useState<User[]>([]);

    useEffect(() => {
        if (!user) return;
        // Prioritize prop, then user department, then undefined (all)
        // If department prop is passed, use it.
        // If not, use user.department (for Lead/Employee).
        // If user is Admin and no prop, department might be undefined -> shows all which is fallback, BUT admin page uses specific multiple tables.

        const targetDept = department || user.department || undefined;

        const unsubscribe = subscribeToLeaderboard(targetDept, (users) => {
            // Sort by SVM Score (descending) - Client side sorting as well just in case
            const sorted = [...users].sort((a, b) => (b.svmScore || 0) - (a.svmScore || 0));
            setLeaders(sorted);
        });
        return () => unsubscribe();
    }, [user, department]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-iqm-primary" />
                {department ? `${department} Leaderboard` : "Performance Leaderboard"}
            </h3>
            <div className="space-y-4">
                {leaders.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm">No data available.</div>
                ) : (
                    leaders.map((leader, index) => (
                        <div key={leader.uid} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                            <div className="flex items-center gap-4">
                                <span className={`font-bold w-6 text-center ${index + 1 <= 3 ? 'text-iqm-primary' : 'text-gray-400'}`}>
                                    #{index + 1}
                                </span>
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 uppercase">
                                    {leader.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800">{leader.name}</div>
                                    <div className="text-xs text-gray-400">{leader.role}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-gray-800 bg-white px-3 py-1 rounded-lg border border-gray-100 text-sm">
                                <Trophy className="w-3 h-3 text-amber-500" />
                                {leader.svmScore || 0}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
