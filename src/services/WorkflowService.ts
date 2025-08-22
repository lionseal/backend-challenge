import { Repository } from 'typeorm';
import { TaskStatus } from '../workers/taskRunner';
import { Workflow } from '../models/Workflow';

export class WorkflowService {
    constructor(private workflowRepository: Repository<Workflow>) {}

    async getWorkflowStatus(workflowId: string) {
        const workflow = await this.workflowRepository.findOne({ where: { workflowId }, relations: ['tasks'] });
        if (!workflow) return null;
        return {
            workflowId: workflow.workflowId,
            status: workflow.status,
            completedTasks: workflow.tasks.filter(t => t.status === TaskStatus.Completed).length,
            totalTasks: workflow.tasks.length,
        };
    }
}
