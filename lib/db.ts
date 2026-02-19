import { db, storage } from "./firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    increment,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { ref } from "firebase/storage";

// --- Types ---
export type UserRole = 'lead' | 'employee' | 'admin' | 'ceo' | 'cco' | 'coo';

export interface User {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    points: number;
    password?: string;
    svmScore?: number;
    ratingCount?: number;
    department?: string | string[]; // Can be array for Executives if needed, but per request "No department"
}

export interface TaskModule {
    id: string; // Unique ID for the module (or index-based fallback)
    title: string;
    description?: string;
    assignedTo: string;
    status: 'pending' | 'submitted' | 'verified' | 'rejected';

    // Submission Data
    submissionNote?: string;
    submittedAt?: any;

    // Verification Data
    verifiedBy?: string;
    verifiedAt?: any;
    rejectionReason?: string;
}

export interface Task {
    id?: string;
    title: string;
    description: string;
    assignedTo?: string; // Legacy/Fallback
    assignedBy: string;
    taskType?: 'lead' | 'executive';
    createdByRole?: string;
    createdByUserId?: string;

    // Executive Assignment Fields
    assignedExecutiveId?: string;
    assignedExecutiveRole?: string;
    assignedExecutiveName?: string;

    // New: Dynamic Executive Completion
    assignedExecutives?: {
        id: string;
        role: string;
        name: string;
        completed: boolean;
        completedAt?: any;
    }[];

    status: 'pending' | 'in-progress' | 'submitted' | 'verified' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate: Date | Timestamp;
    assigneeIds?: string[];
    modules?: TaskModule[];
    department?: string;

    // Legacy fields (kept optional for type compatibility)
    executiveCompletion?: {
        ccoCompleted: boolean;
        cooCompleted: boolean;
    };
    submittedBy?: string;
    submittedAt?: any;
    submissionNote?: string;
    verifiedBy?: string;
    verifiedAt?: any;
    rejectionReason?: string;

    statusHistory?: Array<{
        status: string;
        by: string;
        at: any;
        details?: string;
    }>;

    submissionUrl?: string;
    rating?: number;
    feedback?: string;
    createdAt?: any;
    completedAt?: any;
    completedBy?: string;
}

// ... existing code ...

export const completeExecutiveTask = async (taskId: string, userId: string) => {
    const ref = doc(db, "tasks", taskId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Task not found");
    const task = snap.data() as Task;

    let updates: any = {};
    let allCompleted = false;

    // Logic 1: Use new assignedExecutives array if available
    if (task.assignedExecutives && task.assignedExecutives.length > 0) {
        const updatedExecutives = task.assignedExecutives.map(exec => {
            if (exec.id === userId) {
                return { ...exec, completed: true, completedAt: new Date() };
            }
            return exec;
        });

        updates.assignedExecutives = updatedExecutives;
        allCompleted = updatedExecutives.every(e => e.completed);
    }
    // Logic 2: Fallback to old boolean flags (Migration support)
    else if (task.executiveCompletion) {
        // This part is tricky without role passed in, but we can infer or leave generic
        // But since we are moving to array, let's assume we won't hit this for NEW tasks.
        // For existing tasks, we can try to migrate on the fly or fail gracefully.
        // Let's rely on the calling code to pass role if we wanted to support old schema, 
        // but user asked for "Correct Logic" which implies fixing schema.
        // I will focus on the array logic primarily. 
        // If legacy, we can check if userId matches assignedTo logic.

        // Actually, let's just complete it if it's a legacy single-assign task
        if (task.assignedTo === userId) {
            allCompleted = true;
        }
    }
    // Logic 3: Legacy Single Assignment
    else if (task.assignedTo === userId) {
        allCompleted = true;
    }

    if (allCompleted) {
        updates.status = 'completed';
        updates.completedAt = serverTimestamp();
        updates.completedBy = userId; // Last person to complete
    }

    await updateDoc(ref, updates);
};

// ... (Helper Functions stay the same until submitTask) ...

// --- Task Management Functions ---

export const createTask = async (taskData: Task) => {
    // Basic validation
    if (!taskData.title || !taskData.assignedBy) {
        throw new Error("Missing required task fields");
    }

    // Ensure status is pending initially
    const task: Task = {
        ...taskData,
        status: 'pending',
        createdAt: serverTimestamp(),
        // Ensure assigneeIds is populated from modules if not explicitly provided
        assigneeIds: taskData.assigneeIds || (taskData.modules ? Array.from(new Set(taskData.modules.map(m => m.assignedTo).filter(Boolean))) : [taskData.assignedTo!].filter(Boolean)),
        department: taskData.department || 'Development' // Default if missing
    };

    // If using modules, ensure they have IDs
    if (task.modules) {
        task.modules = task.modules.map((m, idx) => ({
            ...m,
            id: m.id || `module_${Date.now()}_${idx}`,
            status: 'pending' // Force pending on creation
        }));
    }

    await addDoc(collection(db, "tasks"), task);
};

export const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, "tasks", taskId));
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const ref = doc(db, "tasks", taskId);

    // Fetch current task to check status
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Task not found");
    const currentTask = snap.data() as Task;

    if (currentTask.status === 'completed' || currentTask.status === 'verified') {
        throw new Error("Completed tasks cannot be edited.");
    }

    // Sanitize updates to remove undefined
    const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await updateDoc(ref, cleanUpdates);
};

export const subscribeToTasks = (userId: string, role: string, department: string, callback: (tasks: Task[]) => void, completedOnly = false) => {
    let q;
    const tasksRef = collection(db, "tasks");

    if (role === 'lead') {
        if (completedOnly) {
            // Lead sees verified tasks from THEIR department
            q = query(tasksRef, where("department", "==", department), where("status", "==", "verified"), orderBy("createdAt", "desc"));
        } else {
            // Lead sees active tasks from THEIR department
            q = query(tasksRef, where("department", "==", department), where("status", "in", ["pending", "in-progress", "submitted"]), orderBy("createdAt", "desc"));
        }
    } else {
        // Employee sees tasks assigned to them (Department check implicit via assignment, but good to filter if we wanted strictness)
        // Keeping it simple: Assignee based.
        if (completedOnly) {
            q = query(tasksRef, where("assigneeIds", "array-contains", userId), where("status", "==", "verified"), orderBy("createdAt", "desc"));
        } else {
            q = query(tasksRef, where("assigneeIds", "array-contains", userId), where("status", "in", ["pending", "in-progress", "submitted"]), orderBy("createdAt", "desc"));
        }
    }

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        callback(tasks);
    }, (error) => {
        console.error("Error subscribing to tasks:", error);
    });
};

export const subscribeToAllTasks = (callback: (tasks: Task[]) => void) => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        callback(tasks);
    }, (error) => {
        console.error("Error subscribing to all tasks:", error);
    });
};

// --- CEO Task Functions ---

export const subscribeToCeoTasks = (leadId: string, callback: (tasks: Task[]) => void) => {
    // Lead sees tasks assigned to them by CEO (createdByRole == 'ceo')
    // and status is NOT completed (for active view)
    const q = query(
        collection(db, "tasks"),
        where("assignedTo", "==", leadId),
        where("assignedBy", "==", "ceo_user_id_placeholder"), // Wait, we store ID. We need a way to know it's CEO.
        // Better constraint: We add a 'createdByRole' field to tasks? 
        // Or we just rely on the UI context. 
        // Requirement says: assignedLeadId == loggedInLeadId, createdByRole == "ceo"
        where("createdByRole", "==", "ceo"),
        where("status", "!=", "completed"),
        orderBy("status"),
        orderBy("createdAt", "desc")
    );

    // Firestore limitation: != and == on different fields requires composite index. 
    // Simplify: Get all for lead, filter in client for now to avoid index creation block.
    const qSimple = query(
        collection(db, "tasks"),
        where("assignedTo", "==", leadId),
        where("createdByRole", "in", ["ceo", "cco", "coo"]),
        orderBy("createdAt", "desc") // We'll sort by date
    );

    return onSnapshot(qSimple, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        // Client-side filter for completion if needed, but "completed" status is what we want to HIDE usually?
        // The requirement says "Remove task from list". So filter out completed.
        const activeTasks = tasks.filter(t => t.status !== 'completed');
        callback(activeTasks);
    }, (error) => {
        console.error("Error subscribing to CEO tasks:", error);
    });
};

export const completeCeoTask = async (taskId: string, leadId: string) => {
    const ref = doc(db, "tasks", taskId);
    await updateDoc(ref, {
        status: 'completed',
        completedBy: leadId,
        completedAt: serverTimestamp()
    });
};

// Old implementation removed in favor of dynamic version above

export const getEmployees = async (department?: string) => {
    let q;
    if (department) {
        q = query(collection(db, "users"), where("role", "==", "employee"), where("department", "==", department));
    } else {
        q = query(collection(db, "users"), where("role", "==", "employee"));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as User);
};

export const getLeads = async () => {
    const q = query(collection(db, "users"), where("role", "==", "lead"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as User);
};

export const getExecutives = async () => {
    const q = query(collection(db, "users"), where("role", "in", ["cco", "coo"]));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as User);
};

// --- Legacy Task Functions ---

export const submitTask = async (taskId: string, userId: string, note: string) => {
    const ref = doc(db, "tasks", taskId);
    await updateDoc(ref, {
        status: 'submitted',
        submissionNote: note,
        submittedBy: userId,
        submittedAt: serverTimestamp()
    });
};

export const verifyTask = async (taskId: string, verifierId: string) => {
    const ref = doc(db, "tasks", taskId);
    await updateDoc(ref, {
        status: 'verified',
        verifiedBy: verifierId,
        verifiedAt: serverTimestamp(),
        completedAt: serverTimestamp()
    });
};

export const rejectTask = async (taskId: string, leadId: string, reason: string) => {
    const ref = doc(db, "tasks", taskId);
    await updateDoc(ref, {
        status: 'in-progress',
        rejectionReason: reason
    });
};

// --- New Module-Based Verification Workflow Functions ---

export const submitTaskModule = async (taskId: string, moduleId: string, userId: string, submissionNote: string) => {
    const ref = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(ref);
    if (!taskSnap.exists()) throw new Error("Task not found");
    const task = taskSnap.data() as Task;

    const modules = task.modules || [];
    const moduleIndex = modules.findIndex(m => m.id === moduleId);

    if (moduleIndex === -1) throw new Error("Module not found.");

    const module = modules[moduleIndex];
    if (module.assignedTo !== userId) throw new Error("Unauthorized: You are not assigned to this module.");

    if (!submissionNote || submissionNote.trim().length < 20) {
        throw new Error("Proof of work is required (minimum 20 characters).");
    }

    // Update the module
    const updatedModule: TaskModule = {
        ...module,
        status: 'submitted',
        submissionNote: submissionNote.trim(),
        submittedAt: new Date(),
        rejectionReason: '' // Clear rejection
    };

    const updatedModules = [...modules];
    updatedModules[moduleIndex] = updatedModule;

    // Log history
    const historyItem = {
        status: `module_submitted:${module.title}`,
        by: userId,
        at: new Date()
    };

    await updateDoc(ref, {
        modules: updatedModules,
        status: 'in-progress', // Ensure task is active
        statusHistory: [...(task.statusHistory || []), historyItem]
    });

    await addDoc(collection(db, "activity_logs"), {
        userId,
        action: "module_submitted",
        taskId,
        moduleId,
        timestamp: serverTimestamp()
    });
};

export const verifyTaskModule = async (taskId: string, moduleId: string, leadId: string) => {
    const ref = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(ref);
    if (!taskSnap.exists()) throw new Error("Task not found");
    const task = taskSnap.data() as Task;

    const modules = task.modules || [];
    const moduleIndex = modules.findIndex(m => m.id === moduleId);

    if (moduleIndex === -1) throw new Error("Module not found.");
    const module = modules[moduleIndex];

    if (module.status !== 'submitted') throw new Error("Module is not in submitted state.");

    // Update Module
    const updatedModule: TaskModule = {
        ...module,
        status: 'verified',
        verifiedBy: leadId,
        verifiedAt: new Date()
    };

    const updatedModules = [...modules];
    updatedModules[moduleIndex] = updatedModule;

    // Check OVERALL Task Completion
    // Task is verified ONLY if ALL modules are verified
    const allVerified = updatedModules.every(m => m.status === 'verified');
    const newOverallStatus = allVerified ? 'verified' : 'in-progress';

    const historyItem = {
        status: `module_verified:${module.title}`,
        by: leadId,
        at: new Date()
    };

    const updateData: any = {
        modules: updatedModules,
        status: newOverallStatus,
        statusHistory: [...(task.statusHistory || []), historyItem]
    };

    if (allVerified) {
        updateData.completedAt = serverTimestamp();
        updateData.verifiedBy = leadId; // Overall verification
        updateData.verifiedAt = serverTimestamp();
    }

    await updateDoc(ref, updateData);

    // Award Points to Employee
    if (module.assignedTo) {
        const pointsEarned = 50;
        const userRef = doc(db, "users", module.assignedTo);
        await updateDoc(userRef, { points: increment(pointsEarned) });

        await addDoc(collection(db, "activity_logs"), {
            userId: module.assignedTo,
            action: "module_verified",
            pointsChange: pointsEarned,
            taskId,
            moduleId,
            timestamp: serverTimestamp()
        });
    }
};

export const rejectTaskModule = async (taskId: string, moduleId: string, leadId: string, reason: string) => {
    const ref = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(ref);
    if (!taskSnap.exists()) throw new Error("Task not found");
    const task = taskSnap.data() as Task;

    const modules = task.modules || [];
    const moduleIndex = modules.findIndex(m => m.id === moduleId);

    if (moduleIndex === -1) throw new Error("Module not found.");
    const module = modules[moduleIndex];

    const updatedModule: TaskModule = {
        ...module,
        status: 'rejected', // Or 'pending' if we want to reset completely. 'rejected' allows showing the red badge.
        rejectionReason: reason,
        // We can optionally reset submittedAt/Note if we want them to start fresh, 
        // OR keep it so they can see what they wrote. 
        // Let's keep note but status rejected allows resubmission.
    };

    const updatedModules = [...modules];
    updatedModules[moduleIndex] = updatedModule;

    const historyItem = {
        status: `module_rejected:${module.title}`,
        by: leadId,
        at: new Date(),
        details: reason
    };

    await updateDoc(ref, {
        modules: updatedModules,
        // If a module is rejected, the whole task definitely isn't verified.
        status: 'in-progress',
        statusHistory: [...(task.statusHistory || []), historyItem]
    });

    await addDoc(collection(db, "activity_logs"), {
        userId: module.assignedTo,
        action: "module_rejected",
        taskId,
        moduleId,
        details: reason,
        timestamp: serverTimestamp()
    });
};

// --- Storage ---
// Upload capability removed per new requirements.

// --- Users ---
export const subscribeToUsers = (department: string | undefined, callback: (users: User[]) => void) => {
    let q;
    if (department) {
        q = query(collection(db, "users"), where("department", "==", department));
    } else {
        q = query(collection(db, "users"));
    }

    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => doc.data() as User);
        callback(users);
    }, (error) => {
        console.error("Error subscribing to users:", error);
    });
};

// --- Leaderboard & Stats ---

export const subscribeToLeaderboard = (department: string | undefined, callback: (users: User[]) => void) => {
    let q;
    if (department) {
        q = query(collection(db, "users"), where("role", "==", "employee"), where("department", "==", department));
    } else {
        q = query(collection(db, "users"), where("role", "==", "employee"));
    }

    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => doc.data() as User);
        // Centralized Sort: SVM Score DESC, then Points DESC
        users.sort((a, b) => {
            const scoreDiff = (b.svmScore || 0) - (a.svmScore || 0);
            if (scoreDiff !== 0) return scoreDiff;
            return (b.points || 0) - (a.points || 0);
        });
        callback(users);
    }, (error) => {
        console.error("Error subscribing to leaderboard:", error);
    });
};

// Helper: Subscribe to Stats (Lead)
export const subscribeToLeadStats = (leadId: string, department: string, callback: (stats: any) => void) => {
    // Tasks created by this lead (and presumably for their department)
    const tasksQuery = query(collection(db, "tasks"), where("assignedBy", "==", leadId));

    // We listen to tasks in real-time
    const unsubTasks = onSnapshot(tasksQuery, (taskSnap) => {
        const tasks = taskSnap.docs.map(d => d.data());
        const completed = tasks.filter((t: any) => t.status === 'verified').length;
        // Pending = Active (Pending + In-Progress + Submitted)
        const pending = tasks.filter((t: any) => t.status !== 'verified').length;

        // Fetch users count - Filtered by DEPARTMENT now
        const usersQuery = query(collection(db, "users"), where("department", "==", department));
        getDocs(usersQuery).then((userSnap) => {
            const users = userSnap.docs.map(d => d.data());
            const totalEmployees = users.filter((u: any) => u.role === 'employee').length;
            const totalLeads = users.filter((u: any) => u.role === 'lead').length;

            callback({
                pendingTasks: pending,
                completedTasks: completed,
                totalEmployees,
                totalLeads
            });
        }).catch(err => console.error("Error fetching user stats:", err));
    }, (error) => {
        console.error("Error subscribing to lead stats:", error);
    });
    return unsubTasks;
};

// Helper: Subscribe to Stats (Employee)
export const subscribeToEmployeeStats = (userId: string, callback: (stats: any) => void) => {
    // Also use array-contains for stats to ensure all assigned tasks are counted
    const q = query(collection(db, "tasks"), where("assigneeIds", "array-contains", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(d => d.data());
        const assigned = tasks.length;
        const completed = tasks.filter((t: any) => t.status === 'verified').length;
        const pending = tasks.filter((t: any) => t.status === 'pending' || t.status === 'in-progress' || t.status === 'submitted').length;

        callback({
            assignedTasks: assigned,
            pendingReviews: pending,
            completedTasks: completed
        });
    }, (error) => {
        console.error("Error subscribing to employee stats:", error);
    });

    return unsubscribe;
};

// --- Skill Validation Matrix (SVM) ---

export interface UserSkill {
    id?: string;
    userId: string;
    skillId: string;
    skillName: string;
    proficiency: 1 | 2 | 3 | 4 | 5;
    validated: boolean;
    validatedBy?: string;
}

export const subscribeToSkills = (callback: (skills: UserSkill[]) => void) => {
    const q = query(collection(db, "user_skills"));
    return onSnapshot(q, (snapshot) => {
        const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserSkill));
        callback(skills);
    }, (error) => {
        console.error("Error subscribing to skills:", error);
    });
};

export const addSkillRequest = async (userId: string, skillName: string, proficiency: UserSkill['proficiency']) => {
    await addDoc(collection(db, "user_skills"), {
        userId,
        skillName,
        skillId: "custom_" + Date.now(),
        proficiency,
        validated: false,
        createdAt: serverTimestamp()
    });
};

export const validateSkill = async (skillDocId: string, validatorId: string) => {
    const ref = doc(db, "user_skills", skillDocId);
    await updateDoc(ref, {
        validated: true,
        validatedBy: validatorId,
        validatedAt: serverTimestamp()
    });
};

// --- SVM Ratings ---

export const submitSVMRating = async (leadId: string, employeeId: string, ratings: number[]) => {
    // ratings is array of 6 numbers
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const ratingDocId = `${employeeId}_${leadId}`;

    // Save Rating
    await setDoc(doc(db, "svm_ratings", ratingDocId), {
        leadId,
        employeeId,
        ratings,
        average: avg,
        updatedAt: serverTimestamp()
    });

    // Aggregate
    const q = query(collection(db, "svm_ratings"), where("employeeId", "==", employeeId));
    const snapshot = await getDocs(q);
    const allRatings = snapshot.docs.map(d => d.data().average);
    const finalAvg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

    // Update User
    await updateDoc(doc(db, "users", employeeId), {
        svmScore: parseFloat(finalAvg.toFixed(2)),
        ratingCount: allRatings.length
    });
};

// Activity Log removed per request.
// (Data is still written to 'activity_logs' collection for audit trail)

// --- Admin / Sync ---

export const syncUser = async (uid: string, name: string, role: UserRole) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const existing = snap.data();
        if (existing.role && existing.role !== role) {
            throw new Error(`This user is already assigned as ${existing.role}. Role override is not allowed.`);
        }
    }

    await setDoc(ref, {
        uid,
        name,
        role,
        department: "Development", // Default for synced users, can be updated later
        status: "active",
        syncedAt: serverTimestamp()
    }, { merge: true });
};
