const express = require('express');
const Orders = require('../models/order');
const { query } = require('../db');

const router = express.Router();
const STATUSES = Orders.ORDER_STATUSES || ['draft', 'issued', 'receiving', 'received', 'cancelled'];

function normalizeDate(input) {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

router.get('/', async (_req, res) => {
  try {
    const orders = await Orders.getAll();
    res.json(orders);
  } catch (err) {
    console.error('orders.list.error', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Orders.findById(Number(req.params.id));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('orders.detail.error', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      po_number,
      total,
      vendor_id,
      vendor_name,
      vendor,
      status,
      request_id,
      expected_date,
      notes,
    } = req.body || {};

    const amount = Number(total);
    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    let vendorId = vendor_id === undefined || vendor_id === null ? null : Number(vendor_id);
    if (vendorId !== null && Number.isNaN(vendorId)) {
      return res.status(400).json({ error: 'Invalid vendor id' });
    }

    let vendorName = vendor_name || vendor || null;
    if (vendorId !== null) {
      const vendorRes = await query('SELECT id, name FROM vendors WHERE id=$1', [vendorId]);
      if (!vendorRes.rowCount) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      vendorName = vendorRes.rows[0].name;
    }

    if (!vendorName) {
      return res.status(400).json({ error: 'Vendor name required' });
    }

    const statusValue = typeof status === 'string' ? status.toLowerCase() : 'draft';
    if (status && !STATUSES.includes(statusValue)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let requestId = request_id === undefined || request_id === null ? null : Number(request_id);
    if (requestId !== null && Number.isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request id' });
    }

    const created = await Orders.create({
      po_number: po_number ? String(po_number).trim() : null,
      vendor_name: String(vendorName).trim(),
      vendor_id: vendorId,
      total: amount,
      status: statusValue || 'draft',
      request_id: requestId,
      expected_date: normalizeDate(expected_date),
      notes:
        notes === undefined || notes === null ? null : String(notes).trim() || null,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('orders.create.error', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

async function updateOrder(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }

    const {
      po_number,
      total,
      vendor_id,
      vendor_name,
      vendor,
      status,
      request_id,
      expected_date,
      notes,
    } = req.body || {};

    const updates = {};

    if (po_number !== undefined) {
      updates.po_number = po_number ? String(po_number).trim() : null;
    }

    if (total !== undefined) {
      const amount = Number(total);
      if (Number.isNaN(amount) || amount < 0) {
        return res.status(400).json({ error: 'Invalid total amount' });
      }
      updates.total = amount;
    }

    if (vendor_id !== undefined) {
      if (vendor_id === null || vendor_id === '') {
        updates.vendor_id = null;
      } else {
        const vendorId = Number(vendor_id);
        if (Number.isNaN(vendorId)) {
          return res.status(400).json({ error: 'Invalid vendor id' });
        }
        const vendorRes = await query('SELECT id, name FROM vendors WHERE id=$1', [vendorId]);
        if (!vendorRes.rowCount) {
          return res.status(404).json({ error: 'Vendor not found' });
        }
        updates.vendor_id = vendorId;
        updates.vendor_name = vendorRes.rows[0].name;
      }
    }

    if (vendor_name !== undefined || vendor !== undefined) {
      const name = vendor_name || vendor;
      if (name && String(name).trim()) {
        updates.vendor_name = String(name).trim();
      } else {
        return res.status(400).json({ error: 'Vendor name required' });
      }
    }

    if (status !== undefined) {
      const statusValue = typeof status === 'string' ? status.toLowerCase() : '';
      if (!STATUSES.includes(statusValue)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updates.status = statusValue;
    }

    if (request_id !== undefined) {
      if (request_id === null || request_id === '') {
        updates.request_id = null;
      } else {
        const requestId = Number(request_id);
        if (Number.isNaN(requestId)) {
          return res.status(400).json({ error: 'Invalid request id' });
        }
        updates.request_id = requestId;
      }
    }

    if (expected_date !== undefined) {
      updates.expected_date = normalizeDate(expected_date);
    }

    if (notes !== undefined) {
      updates.notes = notes === null ? null : String(notes).trim() || null;
    }

    const updated = await Orders.update(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('orders.update.error', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
}

router.put('/:id', updateOrder);
router.patch('/:id', updateOrder);

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }

    const success = await Orders.remove(id);
    if (!success) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(204).end();
  } catch (err) {
    console.error('orders.delete.error', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
