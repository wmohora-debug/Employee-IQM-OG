
import { Task, Module, TaskStatus, ModuleStatus, User } from './types';

// Valid transitions map
const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.DRAFT]: [TaskStatus.ASSIGNED],
    [TaskStatus.ASSIGNED]: [TaskStatus.IN_PROGRESS, TaskStatus.DRAFT],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW], // Can only go to REVIEW if all modules done
    [TaskStatus.REVIEW]: [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS],
    [TaskStatus.COMPLETED]: [TaskStatus.ARCHIVED],
    [TaskStatus.ARCHIVED]: [],
};

const MODULE_TRANSITIONS: Record<ModuleStatus, ModuleStatus[]> = {
    [ModuleStatus.PENDING]: [ModuleStatus.IN_PROGRESS],
    [ModuleStatus.IN_PROGRESS]: [ModuleStatus.SUBMITTED],
    [ModuleStatus.SUBMITTED]: [ModuleStatus.APPROVED, ModuleStatus.REJECTED],
    [ModuleStatus.REJECTED]: [ModuleStatus.IN_PROGRESS],
    [ModuleStatus.APPROVED]: [], // Final state for a module unless re-opened?
};

/**
 * Checks if a transition is valid
 */
export function canTransitionTask(current: TaskStatus, target: TaskStatus): boolean {
    return TASK_TRANSITIONS[current]?.includes(target) ?? false;
}

export function canTransitionModule(current: ModuleStatus, target: ModuleStatus): boolean {
    return MODULE_TRANSITIONS[current]?.includes(target) ?? false;
}

/**
 * Calculates the derived status of a Task based on its Modules.
 * This is called after any Module status update.
 */
export function calculateTaskStatus(task: Task): TaskStatus {
    if (task.status === TaskStatus.DRAFT) return TaskStatus.DRAFT;
    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.ARCHIVED) return task.status;

    const modules = task.modules;
    if (modules.length === 0) return task.status; // No change if no modules

    const allApproved = modules.every((m) => m.status === ModuleStatus.APPROVED);
    const allSubmittedOrApproved = modules.every(
        (m) => m.status === ModuleStatus.SUBMITTED || m.status === ModuleStatus.APPROVED
    );
    const anyInProgressOrSubmitted = modules.some(
        (m) =>
            m.status === ModuleStatus.IN_PROGRESS ||
            m.status === ModuleStatus.SUBMITTED ||
            m.status === ModuleStatus.REJECTED
    );

    // Auto-transition logic
    if (allApproved && task.status === TaskStatus.REVIEW) {
        // Ready for completion - strictly speaking, Lead must manually Complete, 
        // but we could say it stays in REVIEW until Lead approves the whole TASK.
        // Spec says: "Completion notification to lead", implying Lead action.
        return TaskStatus.REVIEW;
    }

    if (allSubmittedOrApproved) {
        return TaskStatus.REVIEW;
    }

    if (anyInProgressOrSubmitted) {
        return TaskStatus.IN_PROGRESS;
    }

    return TaskStatus.ASSIGNED;
}

/**
 * Core business logic actions
 */
export const WorkflowEngine = {
    /**
     * Lead publishes a task
     */
    publishTask: (task: Task): Task => {
        if (task.status !== TaskStatus.DRAFT) throw new Error('Task must be in DRAFT to publish');
        if (task.modules.length === 0) throw new Error('Cannot publish task with no modules');

        return {
            ...task,
            status: TaskStatus.ASSIGNED,
        };
    },

    /**
     * Employee starts a module
     */
    startModule: (task: Task, moduleId: string, userId: string): { task: Task; module: Module } => {
        const moduleIndex = task.modules.findIndex((m) => m.id === moduleId);
        if (moduleIndex === -1) throw new Error('Module not found');
        const module = task.modules[moduleIndex];

        if (!module.assigneeIds.includes(userId)) {
            // In a real app we might allow unassigned entry if checking "pool", 
            // but spec says "assigned to multiple employees".
            // We'll enforce assignment check.
            throw new Error('User is not assigned to this module');
        }

        if (!canTransitionModule(module.status, ModuleStatus.IN_PROGRESS)) {
            throw new Error(`Cannot start module in state ${module.status}`);
        }

        const updatedModule = { ...module, status: ModuleStatus.IN_PROGRESS };
        const updatedModules = [...task.modules];
        updatedModules[moduleIndex] = updatedModule;

        // Derived task update
        const tempTask = { ...task, modules: updatedModules };
        // If task was ASSIGNED, it becomes IN_PROGRESS
        const newTaskStatus = calculateTaskStatus(tempTask);

        return {
            task: { ...tempTask, status: newTaskStatus },
            module: updatedModule,
        };
    },

    /**
     * Employee submits a module
     */
    submitModule: (task: Task, moduleId: string, userId: string): { task: Task; module: Module } => {
        const moduleIndex = task.modules.findIndex((m) => m.id === moduleId);
        if (moduleIndex === -1) throw new Error('Module not found');
        const module = task.modules[moduleIndex];

        if (!canTransitionModule(module.status, ModuleStatus.SUBMITTED)) {
            throw new Error(`Cannot submit module in state ${module.status}`);
        }

        const updatedModule = {
            ...module,
            status: ModuleStatus.SUBMITTED,
            submittedAt: new Date(),
        };
        const updatedModules = [...task.modules];
        updatedModules[moduleIndex] = updatedModule;

        const tempTask = { ...task, modules: updatedModules };
        const newTaskStatus = calculateTaskStatus(tempTask);

        return {
            task: { ...tempTask, status: newTaskStatus },
            module: updatedModule,
        };
    },

    /**
     * Lead approves a module
     */
    approveModule: (task: Task, moduleId: string, leadId: string): { task: Task; module: Module } => {
        const moduleIndex = task.modules.findIndex((m) => m.id === moduleId);
        if (moduleIndex === -1) throw new Error('Module not found');
        const module = task.modules[moduleIndex];

        if (!canTransitionModule(module.status, ModuleStatus.APPROVED)) {
            throw new Error(`Cannot approve module in state ${module.status}`);
        }

        const updatedModule = { ...module, status: ModuleStatus.APPROVED };
        const updatedModules = [...task.modules];
        updatedModules[moduleIndex] = updatedModule;

        const tempTask = { ...task, modules: updatedModules };
        const newTaskStatus = calculateTaskStatus(tempTask);

        return {
            task: { ...tempTask, status: newTaskStatus },
            module: updatedModule,
        };
    },

    /**
     * Lead rejects a module
     */
    rejectModule: (task: Task, moduleId: string, reason: string): { task: Task; module: Module } => {
        const moduleIndex = task.modules.findIndex((m) => m.id === moduleId);
        if (moduleIndex === -1) throw new Error('Module not found');
        const module = task.modules[moduleIndex];

        if (!canTransitionModule(module.status, ModuleStatus.REJECTED)) {
            throw new Error(`Cannot reject module in state ${module.status}`);
        }

        const updatedModule = {
            ...module,
            status: ModuleStatus.REJECTED,
            rejectedReason: reason,
            retryCount: (module.retryCount || 0) + 1,
        };
        const updatedModules = [...task.modules];
        updatedModules[moduleIndex] = updatedModule;

        const tempTask = { ...task, modules: updatedModules };
        const newTaskStatus = calculateTaskStatus(tempTask);

        return {
            task: { ...tempTask, status: newTaskStatus },
            module: updatedModule,
        };
    },


    /**
     * Lead reassigns a module
     */
    reassignModule: (task: Task, moduleId: string, newAssigneeIds: string[]): { task: Task; module: Module } => {
        const moduleIndex = task.modules.findIndex((m) => m.id === moduleId);
        if (moduleIndex === -1) throw new Error('Module not found');
        const module = task.modules[moduleIndex];

        // Reassignment doesn't change status, just assignees
        const updatedModule = { ...module, assigneeIds: newAssigneeIds };
        const updatedModules = [...task.modules];
        updatedModules[moduleIndex] = updatedModule;

        return {
            task: { ...task, modules: updatedModules },
            module: updatedModule,
        };
    },

    /**
     * Lead cancels a task
     */
    cancelTask: (task: Task): Task => {
        if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.ARCHIVED) {
            throw new Error('Cannot cancel a completed or archived task');
        }
        return {
            ...task,
            status: TaskStatus.ARCHIVED, // Using ARCHIVED as cancelled state for now, or we could add CANCELLED
        };
    },

    completeTask: (task: Task): Task => {
        if (task.status !== TaskStatus.REVIEW) {
            // Or allow forced completion? Spec implies notification *to* lead, so they click button.
        }
        const allApproved = task.modules.every((m) => m.status === ModuleStatus.APPROVED);
        if (!allApproved) {
            throw new Error('All modules must be APPROVED before completing task');
        }

        return {
            ...task,
            status: TaskStatus.COMPLETED,
            completedAt: new Date(),
        };
    }
};
