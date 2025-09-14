const express = require('express');
const Approvals = require('../models/approval');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const approvals = await Approvals.getAll();
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const approval = await Approvals.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }
    res.json(approval);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch approval' });
  }
});

router.post('/', async (req, res) => {
  try {
    const approval = await Approvals.create(req.body);
    res.status(201).json(approval);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create approval' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const approval = await Approvals.update(req.params.id, req.body);
    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }
    res.json(approval);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update approval' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const success = await Approvals.remove(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Approval not found' });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete approval' });
  }
});

module.exports = router;
