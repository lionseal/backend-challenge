import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from './Task';

@Entity({ name: 'results' })
export class Result {
    @PrimaryGeneratedColumn('uuid')
    resultId!: string;

    @Column()
    taskId!: string;

    @Column('text')
    data!: string | null; // Could be JSON or any serialized format

    @ManyToOne(() => Task, task => task.result)
    @JoinColumn({ name: 'taskId' })
    task!: Task;
}
