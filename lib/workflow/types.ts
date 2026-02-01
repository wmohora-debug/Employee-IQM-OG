
export enum TaskStatus {
    DRAFT = 'DRAFT',
    ASSIGNED = 'ASSIGNED',
    IN_PROGRESS = 'IN_PROGRESS',
    REVIEW = 'REVIEW',
    COMPLETED = 'COMPLETED',
    ARCHIVED = 'ARCHIVED',
}

export enum ModuleStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface User {
    id: string;
    name: string;
    role: 'LEAD' | 'EMPLOYEE';
}

export interface Module {
    id: string;
    taskId: string;
    title: string;
    description: string;
    assigneeIds: string[];
    status: ModuleStatus;
    dueDate: Date;
    submittedAt?: Date;
    rejectedReason?: string;
    retryCount: number;
}

export interface Task {
    id: string;
    creatorId: string;
    title: string;
    description: string;
    modules: Module[];
    status: TaskStatus;
    createdAt: Date;
    completedAt?: Date;
}
