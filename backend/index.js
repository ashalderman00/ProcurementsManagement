const express = require('express');
const requestsRouter = require('./routes/requests');
const approvalsRouter = require('./routes/approvals');
const ordersRouter = require('./routes/orders');

const app = express();

app.use(express.json());

app.use('/requests', requestsRouter);
app.use('/approvals', approvalsRouter);
app.use('/orders', ordersRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
