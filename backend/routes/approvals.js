import { Router } from 'express';
import {
  createApproval,
  findApprovalById,
  getAllApprovals,
  updateApproval,
  deleteApproval,
} from '../models/approval.js';

const router = Router();

// Get all approvals
router.get('/', async (req, res) => {
  const approvals = await getAllApprovals();
  res.json(approvals);
});

// Get a single approval by ID
router.get('/:id', async (req, res) => {
  const approval = await findApprovalById(req.params.id);
  if (!approval) {
    return res.status(404).json({ error: 'Approval not found' });
  }
  return res.json(approval);
});

// Create a new approval
router.post('/', async (req, res) => {
  const approval = await createApproval(req.body);
  return res.status(201).json(approval);
});

// Update an approval
router.put('/:id', async (req, res) => {
  const approval = await updateApproval(req.params.id, req.body);
  if (!approval) {
    return res.status(404).json({ error: 'Approval not found' });
  }
  return res.json(approval);
});

// Delete an approval
router.delete('/:id', async (req, res) => {
  const success = await deleteApproval(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Approval not found' });
  }
  return res.status(204).end();
});

export default router;
