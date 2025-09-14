import { Router } from 'express';
import {
  createRequest,
  findRequestById,
  getAllRequests,
  updateRequest,
  deleteRequest,
} from '../models/procurementRequest.js';

const router = Router();

// Get all requests
router.get('/', async (req, res) => {
  const requests = await getAllRequests();
  res.json(requests);
});

// Get a single request by ID
router.get('/:id', async (req, res) => {
  const request = await findRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  return res.json(request);
});

// Create a new request
router.post('/', async (req, res) => {
  const request = await createRequest(req.body);
  return res.status(201).json(request);
});

// Update a request
router.put('/:id', async (req, res) => {
  const request = await updateRequest(req.params.id, req.body);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  return res.json(request);
});

// Delete a request
router.delete('/:id', async (req, res) => {
  const success = await deleteRequest(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Request not found' });
  }
  return res.status(204).end();
});

export default router;
