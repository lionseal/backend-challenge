import { Repository } from 'typeorm';
import { TaskStatus } from '../workers/taskRunner';
import { Workflow } from '../models/Workflow';
import { WorkflowStatus } from '../workflows/WorkflowFactory';
import { BadRequestError, NotFoundError } from '../middlewares/errorHandler';

export class WorkflowService {
    constructor(private workflowRepository: Repository<Workflow>) {}

    async getWorkflowStatus(workflowId: string) {
        const workflow = await this.workflowRepository.findOne({ where: { workflowId }, relations: ['tasks'] });
        if (!workflow) throw new NotFoundError('Workflow');
        return {
            workflowId: workflow.workflowId,
            status: workflow.status,
            completedTasks: workflow.tasks.filter(t => t.status === TaskStatus.Completed).length,
            totalTasks: workflow.tasks.length,
        };
    }

    async getWorkflowResults(workflowId: string) {
        const workflow = await this.workflowRepository.findOne({ where: { workflowId } });
        if (!workflow) throw new NotFoundError('Workflow');
        if (workflow.status !== WorkflowStatus.Completed) {
            throw new BadRequestError('Workflow is not yet completed');
        }
        return {
            workflowId: workflow.workflowId,
            status: workflow.status,
            finalResult: JSON.parse(workflow.finalResult || '{}'),
        };
    }
}
