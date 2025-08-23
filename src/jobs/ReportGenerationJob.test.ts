import { describe, beforeEach, it, expect } from '@jest/globals';
import { ReportGenerationJob } from './ReportGenerationJob';
import { Task } from '../models/Task';
import workflow from '../fixtures/workflow.json';
import workflow_incomplete from '../fixtures/workflow_incomplete.json';
import workflow_failed from '../fixtures/workflow_failed.json';

describe('ReportGenerationJob', () => {
    let job: ReportGenerationJob;

    it('returns final report', async () => {
        job = new ReportGenerationJob({
            findOne: jest.fn().mockResolvedValue(workflow),
        } as any);
        const result = await job.run({
            ...workflow.tasks[workflow.tasks.length - 1],
            workflow: { workflowId: workflow.workflowId },
        } as Task);
        expect(result).toMatchObject({
            workflowId: workflow.workflowId,
            tasks: [
                { taskId: workflow.tasks[0].taskId, type: 'analysis', output: '"Brazil"' },
                { taskId: workflow.tasks[1].taskId, type: 'area', output: '{"area":8363324.273315565}' },
                { taskId: workflow.tasks[2].taskId, type: 'notification', output: '{}' },
            ],
            finalReport: JSON.stringify({
                'Task #1 analysis completed': 'Brazil',
                'Task #2 area completed': { area: 8363324.273315565 },
                'Task #3 notification completed': {},
            }),
        });
    });

    it('throws if not all other tasks are completed', async () => {
        job = new ReportGenerationJob({
            findOne: jest.fn().mockResolvedValue(workflow_incomplete),
        } as any);
        await expect(
            job.run({
                ...workflow_incomplete.tasks[workflow_incomplete.tasks.length - 1],
                workflow: { workflowId: workflow_incomplete.workflowId },
            } as Task)
        ).rejects.toThrow('Cannot generate report: not all other tasks are completed or failed');
    });

    it('returns failed tasks', async () => {
        job = new ReportGenerationJob({
            findOne: jest.fn().mockResolvedValue(workflow_failed),
        } as any);
        const result = await job.run({
            ...workflow_failed.tasks[workflow_failed.tasks.length - 1],
            workflow: { workflowId: workflow_failed.workflowId },
        } as Task);
        expect(result).toMatchObject({
            workflowId: workflow_failed.workflowId,
            tasks: [
                { taskId: workflow_failed.tasks[0].taskId, type: 'analysis', output: '"Brazil"' },
                { taskId: workflow_failed.tasks[1].taskId, type: 'area', output: '{"area":8363324.273315565}' },
                {
                    taskId: workflow_failed.tasks[2].taskId,
                    type: 'notification',
                    output: '{"error":"Simulated email failure","stack":"Error: Simulated email failure\\n    at EmailNotificationJob.run (/backend-challenge/src/jobs/EmailNotificationJob.ts:10:15)\\n    at async TaskRunner.run (/backend-challenge/src/workers/taskRunner.ts:32:32)\\n    at async taskWorker (/backend-challenge/src/workers/taskWorker.ts:18:17)"}',
                },
            ],
            finalReport: JSON.stringify({
                'Task #1 analysis completed': 'Brazil',
                'Task #2 area completed': { area: 8363324.273315565 },
                'Task #3 notification failed': {
                    error: 'Simulated email failure',
                    stack: 'Error: Simulated email failure\n    at EmailNotificationJob.run (/backend-challenge/src/jobs/EmailNotificationJob.ts:10:15)\n    at async TaskRunner.run (/backend-challenge/src/workers/taskRunner.ts:32:32)\n    at async taskWorker (/backend-challenge/src/workers/taskWorker.ts:18:17)',
                },
            }),
        });
    });
});
