import { asyncHandler } from '../middlewares/errorHandler';
import { handleOk } from '../middlewares/responseHandler';
import { WorkflowService } from '../services/WorkflowService';

export class WorkflowController {
    constructor(private workflowService: WorkflowService) {}

    getWorkflowStatus = asyncHandler(async (req, res) => {
        const { workflowId } = req.params;
        const result = await this.workflowService.getWorkflowStatus(workflowId);
        handleOk(req, res, result);
    });

    });
}
