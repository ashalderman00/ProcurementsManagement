const express = require('express');

const router = express.Router();

const procurements = [{ id: 1, item: 'Laptop', amount: 1200 }];

router.get('/', (req, res) => {
  res.json(procurements);
});

module.exports = router;
