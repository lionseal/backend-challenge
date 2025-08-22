import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Workflow } from '../models/Workflow';
import { WorkflowService } from '../services/WorkflowService';
import { WorkflowController } from '../controllers/WorkflowController';

export function workflowRoutes() {
  const router = Router();
  const controller = new WorkflowController(new WorkflowService(AppDataSource.getRepository(Workflow)));
  router.get('/:workflowId/status', controller.getWorkflowStatus);
  return router;
};
