import { Router } from 'express';
import {
  createPurchaseOrder,
  findPurchaseOrderById,
  getAllPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from '../models/purchaseOrder.js';

const router = Router();

// Get all purchase orders
router.get('/', async (req, res) => {
  const orders = await getAllPurchaseOrders();
  res.json(orders);
});

// Get a single purchase order by ID
router.get('/:id', async (req, res) => {
  const order = await findPurchaseOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Purchase order not found' });
  }
  return res.json(order);
});

// Create a new purchase order
router.post('/', async (req, res) => {
  const order = await createPurchaseOrder(req.body);
  return res.status(201).json(order);
});

// Update a purchase order
router.put('/:id', async (req, res) => {
  const order = await updatePurchaseOrder(req.params.id, req.body);
  if (!order) {
    return res.status(404).json({ error: 'Purchase order not found' });
  }
  return res.json(order);
});

// Delete a purchase order
router.delete('/:id', async (req, res) => {
  const success = await deletePurchaseOrder(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Purchase order not found' });
  }
  return res.status(204).end();
});

export default router;
