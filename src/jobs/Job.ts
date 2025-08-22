import {Task} from "../models/Task";

export interface JobInputs {
    [key: string]: any;
}
export interface Job {
    run(task: Task, inputs?: JobInputs ): Promise<any>;
}