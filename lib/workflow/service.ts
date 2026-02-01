
import { db } from "../firebase";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    runTransaction,
    serverTimestamp,
    Timestamp,
    query,
    where,
    getDocs
} from "firebase/firestore";
import { WorkflowEngine } from "./engine";
import { Task, TaskStatus, ModuleStatus } from "./types";

const COLLECTION_TASKS = "tasks_v2"; // Using a new collection to avoid conflicts with existing data

/**
 * Service to handle Firebase persistence for the Workflow Engine.
 * Wraps the pure logic Engine with database mutations.
 */
export const WorkflowService = {
    /**
     * Create a new Task in DRAFT state
     */
    createTask: async (creatorId: string, title: string, description: string) => {
        const taskRef = doc(collection(db, COLLECTION_TASKS));
        const task: Task = {
            id: taskRef.id,
            creatorId,
            title,
            description,
            modules: [],
            status: TaskStatus.DRAFT,
            createdAt: new Date(), // This will be client-side time usually, but Firestore prefers Timestamps
        };

        // We store date as Timestamp in Firestore, so we might need a converter.
        // For simplicity here, we'll let Firestore handle the Date object or convert manually if needed.
        await setDoc(taskRef, {
            ...task,
            createdAt: serverTimestamp()
        });
        return task;
    },

    /**
     * Add a module to a DRAFT task
     */
    addModule: async (taskId: string, title: string, description: string, dueDate: Date, assigneeIds: string[]) => {
        const taskRef = doc(db, COLLECTION_TASKS, taskId);

        // We need to use a transaction to ensure we don't modify a task that's being published
        await runTransaction(db, async (transaction) => {
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists()) throw new Error("Task not found");

            const task = taskDoc.data() as Task;
            if (task.status !== TaskStatus.DRAFT) {
                throw new Error("Can only add modules to DRAFT tasks");
            }

            const newModule = {
                id: doc(collection(db, "_")).id, // Generate a random ID
                taskId,
                title,
                description,
                assigneeIds,
                status: ModuleStatus.PENDING,
                dueDate: dueDate,
                retryCount: 0
            };

            transaction.update(taskRef, {
                modules: [...task.modules, newModule]
            });
        });
    },

    /**
     * Publish a Task (DRAFT -> ASSIGNED)
     */
    publishTask: async (taskId: string) => {
        await runTransaction(db, async (transaction) => {
            const taskRef = doc(db, COLLECTION_TASKS, taskId);
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists()) throw new Error("Task not found");

            const task = taskDoc.data() as Task;

            // Use the pure logic engine to validate and transform
            const updatedTask = WorkflowEngine.publishTask(task);

            transaction.update(taskRef, { status: updatedTask.status });
        });
    },

    /**
     * Employee starts a module
     */
    startModule: async (taskId: string, moduleId: string, userId: string) => {
        await runTransaction(db, async (transaction) => {
            const taskRef = doc(db, COLLECTION_TASKS, taskId);
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists()) throw new Error("Task not found");

            const task = taskDoc.data() as Task;

            // Run Logic
            const { task: updatedTask } = WorkflowEngine.startModule(task, moduleId, userId);

            transaction.update(taskRef, {
                modules: updatedTask.modules,
                status: updatedTask.status
            });
        });
    },

    /**
     * Employee submits a module
     */
    submitModule: async (taskId: string, moduleId: string, userId: string) => {
        await runTransaction(db, async (transaction) => {
            const taskRef = doc(db, COLLECTION_TASKS, taskId);
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists()) throw new Error("Task not found");

            const task = taskDoc.data() as Task;

            const { task: updatedTask } = WorkflowEngine.submitModule(task, moduleId, userId);

            transaction.update(taskRef, {
                modules: updatedTask.modules,
                status: updatedTask.status
            });
        });
    },

    /**
     * Lead approves a module
     */
    approveModule: async (taskId: string, moduleId: string, leadId: string) => {
        await runTransaction(db, async (transaction) => {
            const taskRef = doc(db, COLLECTION_TASKS, taskId);
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists()) throw new Error("Task not found");

            const task = taskDoc.data() as Task;

            const { task: updatedTask } = WorkflowEngine.approveModule(task, moduleId, leadId);

            transaction.update(taskRef, {
                modules: updatedTask.modules,
                status: updatedTask.status
            });
        });
    },

    /**
     * Lead rejects a module
     */
    rejectModule: async (taskId: string, moduleId: string, reason: string) => {
        await runTransaction(db, async (transaction) => {
            const taskRef = doc(db, COLLECTION_TASKS, taskId);
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists()) throw new Error("Task not found");

            const task = taskDoc.data() as Task;

            const { task: updatedTask } = WorkflowEngine.rejectModule(task, moduleId, reason);

            transaction.update(taskRef, {
                modules: updatedTask.modules,
                status: updatedTask.status
            });
        });
    },

    /**
     * Lead completes a task (REVIEW -> COMPLETED)
     */
    completeTask: async (taskId: string) => {
        await runTransaction(db, async (transaction) => {
            const taskRef = doc(db, COLLECTION_TASKS, taskId);
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists()) throw new Error("Task not found");

            const task = taskDoc.data() as Task;

            const updatedTask = WorkflowEngine.completeTask(task);

            transaction.update(taskRef, {
                status: updatedTask.status,
                completedAt: updatedTask.completedAt
            });
        });
    },

    /**
     * Get Tasks for a user
     */
    getTasksForUser: async (userId: string, role: 'LEAD' | 'EMPLOYEE') => {
        if (role === 'LEAD') {
            const q = query(collection(db, COLLECTION_TASKS));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Task));
        } else {
            // Employees see non-draft tasks. 
            // Querying specific statuses to avoid '!=' index requirements if possible.
            const visibleStatuses = [
                TaskStatus.ASSIGNED,
                TaskStatus.IN_PROGRESS,
                TaskStatus.REVIEW,
                TaskStatus.COMPLETED,
                TaskStatus.ARCHIVED
            ];

            const q = query(collection(db, COLLECTION_TASKS), where("status", "in", visibleStatuses));
            const snapshot = await getDocs(q);
            const allTasks = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Task));

            return allTasks.filter(t => t.modules.some(m => m.assigneeIds.includes(userId)));
        }
    }
};
