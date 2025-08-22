import { Task } from '../models/Task';

/**
 * Output should look something like this:
 * Task #1 analysis completed, result:
 * {...}
 * Task #2 area calculation completed, result:
 * {...}
 * ...
 */
export function generateReport(tasks: Task[]): string {
    return tasks
        .map(
            t =>
                `Task #${t.stepNumber} ${t.taskType} ${t.status}, result:\n${JSON.stringify(
                    JSON.parse(t.result.data || '{}'),
                    null,
                    2
                )}`
        )
        .join('\n');
}
