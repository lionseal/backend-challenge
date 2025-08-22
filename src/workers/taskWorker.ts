import { AppDataSource } from '../data-source';
import { Task } from '../models/Task';
import { WorkflowStatus } from '../workflows/WorkflowFactory';
import { TaskRunner, TaskStatus } from './taskRunner';

export async function taskWorker() {
    const taskRepository = AppDataSource.getRepository(Task);
    const taskRunner = new TaskRunner(taskRepository);

    while (true) {
        const task = await taskRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.workflow', 'workflow')
            .leftJoinAndSelect('task.dependencies', 'dep')
            .leftJoinAndSelect('dep.result', 'depResult')
            .where('task.status = :queued', { queued: TaskStatus.Queued })
            .andWhere('workflow.status NOT IN (:...status)', { status: [WorkflowStatus.Completed, WorkflowStatus.Failed] }) // added to prevent processing tasks from completed/failed workflows
            .andWhere(qb => {
                const sub = qb
                    .subQuery()
                    .select('1')
                    .from(Task, 'd')
                    .innerJoin('task_dependencies', 'td', 'td.dependencyId = d.taskId')
                    .where('td.taskId = task.taskId')
                    .andWhere('d.status NOT IN (:...status)', { status: [TaskStatus.Completed, TaskStatus.Failed] })
                    .getQuery();
                return `NOT EXISTS ${sub}`;
            })
            .orderBy('task.stepNumber', 'ASC')
            .getOne();
        if (task) {
            try {
                await taskRunner.run(task);
            } catch (error) {
                console.error('Task execution failed. Task status has already been updated by TaskRunner.');
                console.error(error);
            }
        }

        // Wait before checking for the next task again
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}
