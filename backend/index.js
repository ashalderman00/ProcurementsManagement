const express = require('express');
const app = express();

const authRoutes = require('./routes/auth');
const procurementRoutes = require('./routes/procurements');
const { authenticate, authorize } = require('./middleware/auth');

app.use(express.json());

app.use('/auth', authRoutes);
app.use(
  '/procurements',
  authenticate,
  authorize(['Finance', 'Requester', 'Buyer', 'Approver', 'Admin']),
  procurementRoutes
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
