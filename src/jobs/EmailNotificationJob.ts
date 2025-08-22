import { Job, JobInputs } from './Job';
import { Task } from '../models/Task';

interface EmailNotificationInputs extends JobInputs {
    analysis: any;
    area: any;
}
export class EmailNotificationJob implements Job {
    async run(task: Task, inputs: EmailNotificationInputs): Promise<void> {
        console.log(`Sending email notification for task ${task.taskId}...`);
        // Perform notification work
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Analysis Result:', inputs.analysis);
        console.log('Area Result:', inputs.area);
        console.log(`Email analysis ${inputs.analysis} and area ${JSON.stringify(inputs.area)} sent successfully.`);
    }
}