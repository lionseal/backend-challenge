import { asyncHandler } from '../middlewares/errorHandler';
import { handleOk } from './responseHandler';
import { WorkflowService } from '../services/WorkflowService';

export class WorkflowController {
    constructor(private workflowService: WorkflowService) {}

    getWorkflowStatus = asyncHandler(async (req, res) => {
        const { workflowId } = req.params;
        const result = await this.workflowService.getWorkflowStatus(workflowId);
        handleOk(req, res, result);
    });

    getWorkflowResults = asyncHandler(async (req, res) => {
        const { workflowId } = req.params;
        const result = await this.workflowService.getWorkflowResults(workflowId);
        handleOk(req, res, result);
    });
}
