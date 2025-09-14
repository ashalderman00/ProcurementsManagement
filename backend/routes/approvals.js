import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ROLES } from './auth.js';

const router = Router();

// all approval routes require a valid JWT
router.use(authenticateToken);

let approvals = [];
let nextId = 1;

// Get all approvals (Approver, Procurement Officer, Administrator)
router.get('/', authorizeRoles(ROLES.APPROVER, ROLES.PROCUREMENT_OFFICER, ROLES.ADMINISTRATOR), (req, res) => {
  res.json(approvals);
});

// Get a single approval by ID (Approver, Procurement Officer, Administrator)
router.get('/:id', authorizeRoles(ROLES.APPROVER, ROLES.PROCUREMENT_OFFICER, ROLES.ADMINISTRATOR), (req, res) => {
  const id = Number(req.params.id);
  const approval = approvals.find((a) => a.id === id);
  if (!approval) {
    return res.status(404).json({ error: 'Approval not found' });
  }
  return res.json(approval);
});

// Create a new approval (Approver, Procurement Officer, Administrator)
router.post('/', authorizeRoles(ROLES.APPROVER, ROLES.PROCUREMENT_OFFICER, ROLES.ADMINISTRATOR), (req, res) => {
  const approval = { id: nextId++, status: 'pending', ...req.body };
  approvals.push(approval);
  return res.status(201).json(approval);
});

// Update an approval (Approver, Procurement Officer, Administrator)
router.put('/:id', authorizeRoles(ROLES.APPROVER, ROLES.PROCUREMENT_OFFICER, ROLES.ADMINISTRATOR), (req, res) => {
  const id = Number(req.params.id);
  const index = approvals.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Approval not found' });
  }
  approvals[index] = { id, ...approvals[index], ...req.body };
  return res.json(approvals[index]);
});

// Delete an approval (Administrator only)
router.delete('/:id', authorizeRoles(ROLES.ADMINISTRATOR), (req, res) => {
  const id = Number(req.params.id);
  const index = approvals.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Approval not found' });
  }
  approvals.splice(index, 1);
  return res.status(204).end();
});

export default router;
