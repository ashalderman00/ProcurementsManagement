const express = require('express');
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const approvalRoutes = require('./routes/approvals');
const orderRoutes = require('./routes/orders');
const { authenticate, authorize } = require('./middleware/auth');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Procurement Management backend is running' });
});

app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

app.use(
  '/api/requests',
  authenticate,
  authorize(['Finance', 'Requester', 'Buyer', 'Approver', 'Admin']),
  requestRoutes
);

app.use(
  '/api/approvals',
  authenticate,
  authorize(['Finance', 'Requester', 'Buyer', 'Approver', 'Admin']),
  approvalRoutes
);

app.use(
  '/api/orders',
  authenticate,
  authorize(['Finance', 'Requester', 'Buyer', 'Approver', 'Admin']),
  orderRoutes
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
