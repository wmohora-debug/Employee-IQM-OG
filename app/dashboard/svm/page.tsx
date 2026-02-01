
"use client";

import React, { useState } from "react";
import { User, Star, Save, AlertCircle, Sparkles } from "lucide-react";
import { DEFAULT_SKILLS, SkillRating } from "@/lib/svm/types";

// Mock Employees that can be rated
const EMPLOYEES = [
    { id: "1", name: "Sarah Smith", role: "Frontend Developer" },
    { id: "2", name: "Mike Johnson", role: "Backend Engineer" },
    { id: "3", name: "Emily Chen", role: "UI Designer" },
];

export default function SVMPage() {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState("");
    const [saved, setSaved] = useState(false);

    const selectedEmployee = EMPLOYEES.find(e => e.id === selectedEmployeeId);

    const handleRatingChange = (skillId: string, value: number) => {
        setRatings(prev => ({ ...prev, [skillId]: value }));
    };

    const calculateAverage = () => {
        const values = Object.values(ratings);
        if (values.length === 0) return 0;
        return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    };

    const handleSave = () => {
        // Logic to save to Firestore would go here
        console.log("Saving rating...", { employeeId: selectedEmployeeId, ratings, feedback });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="min-h-screen bg-indigo-950 text-white p-6 md:p-12 font-sans flex flex-col md:flex-row gap-8">

            {/* Left Panel: Employee List */}
            <div className="w-full md:w-1/3 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Skill Validation</h1>
                    <p className="text-indigo-300">Select an employee to update their skill matrix.</p>
                </div>

                <div className="space-y-3">
                    {EMPLOYEES.map(emp => (
                        <div
                            key={emp.id}
                            onClick={() => { setSelectedEmployeeId(emp.id); setRatings({}); setFeedback(""); setSaved(false); }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-4
                ${selectedEmployeeId === emp.id
                                    ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center font-bold">
                                {emp.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold">{emp.name}</div>
                                <div className="text-xs text-indigo-300">{emp.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Rating Form */}
            <div className="w-full md:w-2/3">
                {selectedEmployee ? (
                    <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        {/* Glossy overlay */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    Rate: <span className="text-indigo-300">{selectedEmployee.name}</span>
                                </h2>
                                <p className="text-sm text-indigo-400">Update skill proficiency levels (1-5)</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-3xl font-bold text-yellow-400 flex items-center gap-1">
                                    {calculateAverage()} <Star fill="currentColor" className="w-6 h-6" />
                                </div>
                                <div className="text-xs uppercase tracking-wider text-indigo-300">New Average</div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {DEFAULT_SKILLS.map(skill => (
                                <div key={skill.id} className="relative">
                                    <div className="flex justify-between mb-2">
                                        <label className="font-semibold text-lg">{skill.name}</label>
                                        <span className="font-mono text-indigo-300">{ratings[skill.id] || 0} / 5</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="0.5"
                                        value={ratings[skill.id] || 0}
                                        onChange={(e) => handleRatingChange(skill.id, parseFloat(e.target.value))}
                                        className="w-full h-2 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                                    />
                                    <div className="flex justify-between text-xs text-indigo-500 mt-1 px-1">
                                        <span>Novice</span>
                                        <span>Intermediate</span>
                                        <span>Expert</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <label className="block font-semibold mb-2">Additional Feedback</label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide qualitative feedback about their recent performance..."
                                className="w-full bg-black/20 border border-indigo-500/30 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 min-h-[100px]"
                            />
                        </div>

                        <div className="mt-8 flex justify-end gap-4">
                            {saved && (
                                <span className="flex items-center gap-2 text-emerald-400 animate-fade-in">
                                    <CheckCircle className="w-5 h-5" /> Saved Successfully
                                </span>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saved}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Submit Rating
                            </button>
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-indigo-300 border-2 border-dashed border-indigo-500/20 rounded-3xl p-12">
                        <Sparkles className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-xl">Select an employee from the left to start rating.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    )
}
