import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, ManyToMany, JoinTable } from 'typeorm';
import { Workflow } from './Workflow';
import { TaskStatus } from '../workers/taskRunner';
import { Result } from './Result';

@Entity({ name: 'tasks' })
export class Task {
    @PrimaryGeneratedColumn('uuid')
    taskId!: string;

    @Column()
    clientId!: string;

    @Column('text')
    geoJson!: string;

    @Column()
    status!: TaskStatus;

    @Column({ nullable: true, type: 'text' })
    progress?: string | null;

    @Column({ nullable: true })
    resultId?: string;

    @Column()
    taskType!: string;

    @Column({ default: 1 })
    stepNumber!: number;

    @ManyToOne(() => Workflow, workflow => workflow.tasks)
    workflow!: Workflow;

    @OneToOne(() => Result, result => result.task)
    result!: Result;

    // Tasks this one depends on
    @ManyToMany(() => Task, task => task.dependents)
    @JoinTable({
        name: 'task_dependencies', // custom join table
        joinColumn: { name: 'taskId', referencedColumnName: 'taskId' },
        inverseJoinColumn: { name: 'dependencyId', referencedColumnName: 'taskId' },
    })
    dependencies!: Task[];

    // Tasks that depend on this one
    @ManyToMany(() => Task, task => task.dependencies)
    dependents!: Task[];
}
