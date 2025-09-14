const express = require('express');
const Requests = require('../models/request');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const requests = await Requests.getAll();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const request = await Requests.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

router.post('/', async (req, res) => {
  try {
    const request = await Requests.create(req.body);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create request' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const request = await Requests.update(req.params.id, req.body);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update request' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const success = await Requests.remove(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

module.exports = router;
