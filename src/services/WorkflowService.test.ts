import '../models/Workflow';
import { WorkflowStatus } from '../workflows/WorkflowFactory';
import { WorkflowService } from './WorkflowService';

describe('WorkflowService', () => {
    let workflowService: WorkflowService;
    let findOneMock: jest.Mock;

    beforeEach(() => {
        findOneMock = jest.fn();
        workflowService = new WorkflowService({
            findOne: findOneMock,
        } as any);
    });

    describe('getWorkflowStatus', () => {
        it('should return workflow status', async () => {
            const workflow = {
                workflowId: 'workflowId',
                status: WorkflowStatus.InProgress,
                tasks: [{ status: 'completed' }, { status: 'queued' }],
            };
            findOneMock.mockResolvedValue(workflow);
            const result = await workflowService.getWorkflowStatus('workflowId');
            expect(result).toEqual({
                workflowId: 'workflowId',
                status: 'in_progress',
                completedTasks: 1,
                totalTasks: 2,
            });
        });

        it('should throw error if workflow not found', async () => {
            findOneMock.mockResolvedValue(null);
            await expect(workflowService.getWorkflowStatus('invalidId')).rejects.toThrow('Workflow not found');
        });
    });

    describe('getWorkflowResults', () => {
        it('should return workflow results', async () => {
            const workflow = {
                workflowId: 'workflowId',
                status: WorkflowStatus.Completed,
                finalResult: 'test final results',
            };
            findOneMock.mockResolvedValue(workflow);
            const result = await workflowService.getWorkflowResults('workflowId');
            expect(result).toEqual({
                workflowId: 'workflowId',
                status: 'completed',
                finalResult: 'test final results',
            });
        });

        it('should throw error if workflow not found', async () => {
            findOneMock.mockResolvedValue(null);
            await expect(workflowService.getWorkflowResults('invalidId')).rejects.toThrow('Workflow not found');
        });

        it('should throw error if workflow not completed', async () => {
            const workflow = {
                workflowId: 'workflowId',
                status: WorkflowStatus.InProgress,
            };
            findOneMock.mockResolvedValue(workflow);
            await expect(workflowService.getWorkflowResults('workflowId')).rejects.toThrow(
                'Workflow is not yet completed'
            );
        });
    });
});
