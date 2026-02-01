
import { WorkflowEngine, calculateTaskStatus } from '../lib/workflow/engine';
import { Task, Module, TaskStatus, ModuleStatus } from '../lib/workflow/types';

const mockUserLead = { id: 'lead-1', name: 'Alice', role: 'LEAD' as const };
const mockUserEmp1 = { id: 'emp-1', name: 'Bob', role: 'EMPLOYEE' as const };
const mockUserEmp2 = { id: 'emp-2', name: 'Charlie', role: 'EMPLOYEE' as const };

function createTestTask(): Task {
    return {
        id: 'task-1',
        creatorId: mockUserLead.id,
        title: 'Build Website',
        description: 'Full stack project',
        status: TaskStatus.DRAFT,
        createdAt: new Date(),
        modules: [
            {
                id: 'mod-1',
                taskId: 'task-1',
                title: 'Frontend',
                description: 'React stuff',
                assigneeIds: [mockUserEmp1.id],
                status: ModuleStatus.PENDING,
                dueDate: new Date(),
                retryCount: 0,
            },
            {
                id: 'mod-2',
                taskId: 'task-1',
                title: 'Backend',
                description: 'Node stuff',
                assigneeIds: [mockUserEmp2.id],
                status: ModuleStatus.PENDING,
                dueDate: new Date(),
                retryCount: 0,
            }
        ]
    };
}

async function runValidation() {
    console.log('Starting Workflow Logic Validation...\n');

    try {
        // 1. Happy Path
        console.log('--- Test Case 1: Happy Path ---');
        let task = createTestTask();
        console.log(`[Init] Status: ${task.status}`);

        // Publish
        task = WorkflowEngine.publishTask(task);
        console.log(`[Publish] Status: ${task.status} (Expected: ASSIGNED)`);
        if (task.status !== TaskStatus.ASSIGNED) throw new Error('Failed to publish');

        // Start Module 1
        const res1 = WorkflowEngine.startModule(task, 'mod-1', mockUserEmp1.id);
        task = res1.task;
        console.log(`[Start Mod1] Task Status: ${task.status} (Expected: IN_PROGRESS)`);
        console.log(`[Start Mod1] Mod1 Status: ${task.modules[0].status} (Expected: IN_PROGRESS)`);

        // Submit Module 1
        const res2 = WorkflowEngine.submitModule(task, 'mod-1', mockUserEmp1.id);
        task = res2.task;
        console.log(`[Submit Mod1] Mod1 Status: ${task.modules[0].status} (Expected: SUBMITTED)`);
        console.log(`[Submit Mod1] Task Status: ${task.status} (Expected: IN_PROGRESS)`);
        // Task still IN_PROGRESS because Mod2 is PENDING (which counts as not submitted?)
        // Wait, my logic says: anyInProgressOrSubmitted -> IN_PROGRESS. Correct.

        // Approve Module 1
        const res3 = WorkflowEngine.approveModule(task, 'mod-1', mockUserLead.id);
        task = res3.task;
        console.log(`[Approve Mod1] Mod1 Status: ${task.modules[0].status} (Expected: APPROVED)`);

        // Start & Submit & Approve Module 2
        task = WorkflowEngine.startModule(task, 'mod-2', mockUserEmp2.id).task;
        task = WorkflowEngine.submitModule(task, 'mod-2', mockUserEmp2.id).task;
        console.log(`[Submit Mod2] Task Status: ${task.status} (Expected: REVIEW/IN_PROGRESS)`);
        // Mod1 APPROVED, Mod2 SUBMITTED. 
        // allSubmittedOrApproved = true. So Task should be REVIEW.
        if (task.status !== TaskStatus.REVIEW) console.error(`ERROR: Expected REVIEW, got ${task.status}`);

        task = WorkflowEngine.approveModule(task, 'mod-2', mockUserLead.id).task;
        console.log(`[Approve Mod2] Task Status: ${task.status} (Expected: REVIEW)`);
        // All APPROVED. Task logic says: if allApproved, return REVIEW (wait for explicit completion).

        // Complete Task
        task = WorkflowEngine.completeTask(task);
        console.log(`[Complete Task] Status: ${task.status} (Expected: COMPLETED)`);

        // 2. Rejection Flow
        console.log('\n--- Test Case 2: Rejection Flow ---');
        task = createTestTask();
        task = WorkflowEngine.publishTask(task);

        // Start Mod1
        task = WorkflowEngine.startModule(task, 'mod-1', mockUserEmp1.id).task;
        // Submit Mod1
        task = WorkflowEngine.submitModule(task, 'mod-1', mockUserEmp1.id).task;
        console.log(`[Submit Mod1] Status: ${task.modules[0].status}`);

        // Reject Mod1
        task = WorkflowEngine.rejectModule(task, 'mod-1', 'Code quality issues').task;
        console.log(`[Reject Mod1] Status: ${task.modules[0].status} (Expected: REJECTED)`);
        console.log(`[Reject Mod1] Retry Count: ${task.modules[0].retryCount} (Expected: 1)`);

        // Retry (Start again)
        task = WorkflowEngine.startModule(task, 'mod-1', mockUserEmp1.id).task;
        console.log(`[Retry Mod1] Status: ${task.modules[0].status} (Expected: IN_PROGRESS)`);

        // Submit again
        task = WorkflowEngine.submitModule(task, 'mod-1', mockUserEmp1.id).task;
        console.log(`[Re-Submit Mod1] Status: ${task.modules[0].status} (Expected: SUBMITTED)`);

    } catch (e: any) {
        console.error('VALIDATION FAILED:', e.message);
        process.exit(1);
    }
}

runValidation();
