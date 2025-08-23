import { Task } from '../models/Task';
import { Job } from './Job';
import { Workflow } from '../models/Workflow';
import { TaskStatus } from '../workers/taskRunner';
import { Repository } from 'typeorm';
import { generateReportV2 } from '../utils/report';

interface Report {
    workflowId: string;
    tasks: {
        taskId: string;
        type: string;
        output: string | null;
    }[];
    finalReport: string;
}

export class ReportGenerationJob implements Job {
    constructor(private workflowRepository: Repository<Workflow>) {}

    async run(task: Task): Promise<Report> {
        try {
            console.log(`Generating report for workflow ${task.workflow.workflowId}...`);
            const workflow = await this.workflowRepository.findOne({
                where: { workflowId: task.workflow.workflowId },
                relations: { tasks: { result: true } },
            });
            if (!workflow) {
                throw new Error(`Workflow not found`);
            }
            // Exclude the current task from the check
            const tasks = workflow.tasks.filter(t => t.taskId !== task.taskId);
            const allCompleted = tasks.every(t => [TaskStatus.Completed, TaskStatus.Failed].includes(t.status));
            if (!allCompleted) {
                throw new Error(`Cannot generate report: not all other tasks are completed or failed`);
            }
            const result = {
                workflowId: workflow.workflowId,
                tasks: tasks.map(t => ({
                    taskId: t.taskId,
                    type: t.taskType,
                    output: t.result.data,
                })),
                finalReport: generateReportV2(tasks),
            };
            return result;
        } catch (error) {
            console.error(`Error generating report for task ${task.taskId}:`, error);
            throw error;
        }
    }
}
