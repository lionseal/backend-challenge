import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { DataSource } from 'typeorm';
import { Workflow } from '../models/Workflow';
import { Task } from '../models/Task';
import { TaskStatus } from '../workers/taskRunner';
import { hasCycle } from '../utils/graph';

export enum WorkflowStatus {
    Initial = 'initial',
    InProgress = 'in_progress',
    Completed = 'completed',
    Failed = 'failed',
}

export interface WorkflowStep {
    taskType: string;
    stepNumber: number;
    dependsOn?: string[];
}

interface WorkflowDefinition {
    name: string;
    steps: WorkflowStep[];
}

export class WorkflowFactory {
    constructor(private dataSource: DataSource) {}

    /**
     * Creates a workflow by reading a YAML file and constructing the Workflow and Task entities.
     * @param filePath - Path to the YAML file.
     * @param clientId - Client identifier for the workflow.
     * @param geoJson - The geoJson data string for tasks (customize as needed).
     * @returns A promise that resolves to the created Workflow.
     */
    async createWorkflowFromYAML(filePath: string, clientId: string, geoJson: string): Promise<Workflow> {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const workflowDef = yaml.load(fileContent) as WorkflowDefinition;
        // Checking for cycles in the workflow steps
        if (hasCycle(workflowDef.steps)) {
            throw new Error('The workflow definition contains cyclic dependencies.');
        }
        const workflowRepository = this.dataSource.getRepository(Workflow);
        const taskRepository = this.dataSource.getRepository(Task);
        const workflow = new Workflow();

        workflow.clientId = clientId;
        workflow.status = WorkflowStatus.Initial;

        const savedWorkflow = await workflowRepository.save(workflow);

        const tasks: Task[] = workflowDef.steps.map(step => {
            const task = new Task();
            task.clientId = clientId;
            task.geoJson = geoJson;
            task.status = TaskStatus.Queued;
            task.taskType = step.taskType;
            task.stepNumber = step.stepNumber;
            task.workflow = savedWorkflow;
            return task;
        });
        // Add a final report task
        const reportTask = new Task();
        reportTask.clientId = clientId;
        reportTask.geoJson = geoJson;
        reportTask.status = TaskStatus.Queued;
        reportTask.taskType = 'report';
        // ensure it's the last step
        reportTask.stepNumber =
            tasks.reduce((max, task) => {
                return task.stepNumber > max ? task.stepNumber : max;
            }, 0) + 1;
        reportTask.workflow = savedWorkflow;
        tasks.push(reportTask);

        const dbTasks = await taskRepository.save(tasks);

        // Setting up dependencies
        const taskMap = new Map<string, Task>();
        for (const task of dbTasks) {
            taskMap.set(task.taskType, task);
        }
        for (const step of workflowDef.steps) {
            if (step.dependsOn?.length) {
                const currentTask = taskMap.get(step.taskType);
                if (!currentTask) continue;
                currentTask.dependencies = step.dependsOn
                    .map(depType => taskMap.get(depType))
                    .filter((t) => t !== undefined);
                await taskRepository.save(currentTask);
            }
        }

        return savedWorkflow;
    }
}
