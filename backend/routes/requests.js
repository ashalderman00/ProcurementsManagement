import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ROLES } from './auth.js';

const router = Router();

// all request routes require a valid JWT
router.use(authenticateToken);

let requests = [];
let nextId = 1;

// Get all requests
router.get('/', (req, res) => {
  res.json(requests);
});

// Get a single request by ID
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = requests.find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  return res.json(request);
});

// Create a new request (Requester or Administrator)
router.post('/', authorizeRoles(ROLES.REQUESTER, ROLES.ADMINISTRATOR), (req, res) => {
  const request = { id: nextId++, ...req.body };
  requests.push(request);
  return res.status(201).json(request);
});

// Update a request (Requester or Administrator)
router.put('/:id', authorizeRoles(ROLES.REQUESTER, ROLES.ADMINISTRATOR), (req, res) => {
  const id = Number(req.params.id);
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }
  requests[index] = { id, ...req.body };
  return res.json(requests[index]);
});

// Delete a request (Administrator only)
router.delete('/:id', authorizeRoles(ROLES.ADMINISTRATOR), (req, res) => {
  const id = Number(req.params.id);
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }
  requests.splice(index, 1);
  return res.status(204).end();
});

export default router;
