import { Router } from 'express';

const router = Router();

let approvals = [];
let nextId = 1;

// Get all approvals
router.get('/', (req, res) => {
  res.json(approvals);
});

// Get a single approval by ID
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const approval = approvals.find((a) => a.id === id);
  if (!approval) {
    return res.status(404).json({ error: 'Approval not found' });
  }
  return res.json(approval);
});

// Create a new approval
router.post('/', (req, res) => {
  const approval = { id: nextId++, status: 'pending', ...req.body };
  approvals.push(approval);
  return res.status(201).json(approval);
});

// Update an approval
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = approvals.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Approval not found' });
  }
  approvals[index] = { id, ...approvals[index], ...req.body };
  return res.json(approvals[index]);
});

// Delete an approval
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = approvals.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Approval not found' });
  }
  approvals.splice(index, 1);
  return res.status(204).end();
});

export default router;
