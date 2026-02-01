
export interface SkillRating {
    skillId: string;
    name: string;
    category: "Technical" | "Soft Skill" | "Domain";
    rating: number; // 1-5
    feedback?: string;
}

export interface EmployeeSVMRating {
    id?: string; // ${employeeId}_${leadId}
    employeeId: string;
    leadId: string;
    leadName?: string; // Denormalized for display
    skills: SkillRating[];
    averageRating: number;
    ratedAt: number; // Timestamp
}

export interface EmployeeStats {
    employeeId: string;
    displayName: string;
    avatarUrl?: string; // Optional
    role: "employee" | "lead"; // Should verify role

    // Stats
    modulesCompleted: number;
    svmRating: number; // 0-5
    timelinessScore: number; // 0-100 percentage

    // Final Score
    leaderboardScore: number;
    rank?: number; // Calculated on fetch
}

export const DEFAULT_SKILLS = [
    { id: "react", name: "React/Next.js", category: "Technical" },
    { id: "node", name: "Node.js/Backend", category: "Technical" },
    { id: "db", name: "Database/Firestore", category: "Technical" },
    { id: "comm", name: "Communication", category: "Soft Skill" },
    { id: "team", name: "Teamwork", category: "Soft Skill" },
] as const;
