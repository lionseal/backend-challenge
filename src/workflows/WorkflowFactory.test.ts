import { describe, it, expect } from '@jest/globals';
import '../models/Workflow'; // to avoid cyclic dependency issues this has to be imported first
import { WorkflowFactory, WorkflowStatus } from './WorkflowFactory';
import post_workflow from '../fixtures/post_workflow.json';
import path from 'path';

const workflowFile = path.join(__dirname, './example_workflow.yml');
const cyclicWorkflowFile = path.join(__dirname, './cyclic_workflow.yml');

describe('WorkflowFactory', () => {
    let factory: WorkflowFactory;

    it('creates workflows and tasks with dependencies', async () => {
        const saveMock = jest.fn(x => x);
        factory = new WorkflowFactory({
            getRepository: jest.fn().mockReturnValue({
                save: saveMock,
            }),
        } as any);
        await factory.createWorkflowFromYAML(
            workflowFile,
            post_workflow.clientId,
            JSON.stringify(post_workflow.geoJson)
        );
        expect(saveMock).toHaveBeenCalledTimes(3);
        expect(saveMock.mock.calls[0][0]).toMatchObject({
            clientId: post_workflow.clientId,
            status: WorkflowStatus.Initial,
        });
        expect(saveMock.mock.calls[1][0]).toMatchObject([
            expect.objectContaining({ taskType: 'analysis', stepNumber: 1 }),
            expect.objectContaining({ taskType: 'notification', stepNumber: 2 }),
            expect.objectContaining({ taskType: 'area', stepNumber: 3 }),
            expect.objectContaining({ taskType: 'report', stepNumber: 4 }),
        ]);
        expect(saveMock.mock.calls[2][0]).toMatchObject({
            taskType: 'notification',
            dependencies: [
                expect.objectContaining({ taskType: 'area' }),
                expect.objectContaining({ taskType: 'analysis' }),
            ],
        });
    });

    it('throws when cycle dependency detected', async () => {
        const saveMock = jest.fn(x => x);
        factory = new WorkflowFactory({
            getRepository: jest.fn().mockReturnValue({
                save: saveMock,
            }),
        } as any);
        await expect(
            factory.createWorkflowFromYAML(
                cyclicWorkflowFile,
                post_workflow.clientId,
                JSON.stringify(post_workflow.geoJson)
            )
        ).rejects.toThrow('The workflow definition contains cyclic dependencies.');
        expect(saveMock).toHaveBeenCalledTimes(0);
    });
});
