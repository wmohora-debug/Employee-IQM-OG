"use client";
import { Zap, Plus, ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getEmployees, submitSVMRating, User } from "@/lib/db";
import { useAuth } from "@/app/context/AuthContext";
import { StarRating } from "./StarRating";

const getSkillsByDepartment = (dept: string = "Development") => {
    switch (dept) {
        case "UX":
            return [
                "UX Thinking",
                "Visual Design",
                "Wireframing",
                "Accessibility",
                "Detail Orientation"
            ];
        case "Social Media":
            return [
                "Content Quality",
                "Engagement",
                "Consistency",
                "Trend Awareness",
                "Brand Alignment"
            ];
        case "Development":
        default:
            return [
                "Code Quality",
                "Problem Solving",
                "Tech Knowledge",
                "Task Completion",
                "System Understanding"
            ];
    }
};

function EmployeeRatingRow({ employee, leadId }: { employee: User; leadId: string }) {
    const rawDept = employee.department;
    const dept = (Array.isArray(rawDept) ? rawDept[0] : rawDept) || "Development";
    const skills = getSkillsByDepartment(dept);
    const [ratings, setRatings] = useState<number[]>(new Array(skills.length).fill(0));
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const handleRate = (index: number, value: number) => {
        const newRatings = [...ratings];
        newRatings[index] = value;
        setRatings(newRatings);
        setStatus('idle');
    };

    const canSubmit = ratings.every(r => r > 0);

    const handleSave = async () => {
        if (!canSubmit) return;
        setStatus('saving');
        try {
            await submitSVMRating(leadId, employee.uid, ratings);
            setStatus('saved');
        } catch (error) {
            console.error(error);
            alert("Failed to save rating");
            setStatus('idle');
        }
    };

    return (
        <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-100">
                        {employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800 text-sm">{employee.name}</div>
                        <div className="text-xs text-gray-400">{employee.role}</div>
                    </div>
                </div>
            </td>
            {ratings.map((r, i) => (
                <td key={i} className="px-2 py-4 text-center">
                    <div className="flex justify-center">
                        <StarRating rating={r} onRate={(val) => handleRate(i, val)} size={14} />
                    </div>
                    <div className="text-[9px] text-gray-400 mt-1">{skills[i]}</div>
                </td>
            ))}
            <td className="px-4 py-4 text-right">
                <button
                    onClick={handleSave}
                    disabled={!canSubmit || status !== 'idle'}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ml-auto
                        ${status === 'saved' ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' :
                            status === 'saving' ? 'bg-gray-100 text-gray-400 cursor-wait' :
                                !canSubmit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                    'bg-iqm-primary text-white hover:bg-iqm-sidebar shadow-sm hover:shadow-md active:scale-95'
                        }`}
                >
                    {status === 'saved' ? (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                        </>
                    ) : status === 'saving' ? (
                        'Saving...'
                    ) : (
                        <>
                            <Save className="w-3.5 h-3.5" /> Submit
                        </>
                    )}
                </button>
            </td>
        </tr>
    );
}

export function SkillMatrix({ isEditable = false }: { isEditable?: boolean }) {
    const { user } = useAuth();
    const [mode, setMode] = useState<'view' | 'rate'>('view');
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === 'rate' && user) {
            setLoading(true);
            // Filter employees by user's department
            const rawDept = user.department;
            const dept = (Array.isArray(rawDept) ? rawDept[0] : rawDept) || "Development";
            getEmployees(dept).then(emps => {
                setEmployees(emps);
                setLoading(false);
            });
        }
    }, [mode, user]);

    if (!user) return null;

    // Use department of the lead (user) to determine table headers
    const rawUserDept = user.department;
    const userDept = (Array.isArray(rawUserDept) ? rawUserDept[0] : rawUserDept) || "Development";
    const currentSkills = getSkillsByDepartment(userDept);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-iqm-primary" />
                    Skill Assessment Matrix ({user.department || 'General'})
                </h3>
                {mode === 'view' && isEditable && (
                    <button
                        onClick={() => setMode('rate')}
                        className="flex items-center gap-2 bg-iqm-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-iqm-sidebar transition-colors shadow-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Ratings
                    </button>
                )}
                {mode === 'rate' && (
                    <button
                        onClick={() => setMode('view')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Overview
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-auto bg-white">
                {mode === 'view' ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h4 className="text-gray-900 font-bold text-lg mb-2">Assessment Overview</h4>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Manage and evaluate employee technical proficiencies. {isEditable ? "Click 'Add Ratings' to start a new evaluation cycle." : "View-only mode."}
                        </p>
                    </div>
                ) : (
                    <>
                        {loading ? (
                            <div className="p-12 text-center text-gray-400">Loading employees...</div>
                        ) : (
                            <table className="w-full text-left min-w-[1000px]">
                                <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-wider sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3">Employee</th>
                                        {currentSkills.map(skill => (
                                            <th key={skill} className="px-2 py-3 text-center w-24">{skill}</th>
                                        ))}
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {employees.map(emp => (
                                        <EmployeeRatingRow key={emp.uid} employee={emp} leadId={user.uid} />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
