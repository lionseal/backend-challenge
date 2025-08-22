import { asyncHandler } from '../middlewares/errorHandler';
import { handleResponse } from '../middlewares/responseHandler';
import { WorkflowService } from '../services/WorkflowService';

export class WorkflowController {
    private entityName = 'Workflow';

    constructor(private workflowService: WorkflowService) {}

    getWorkflowStatus = asyncHandler(async (req, res) => {
        const { workflowId } = req.params;
        const result = await this.workflowService.getWorkflowStatus(workflowId);
        handleResponse(req, res, result, this.entityName);
    });
}
