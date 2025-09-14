import express from 'express';
import requestsRouter from './routes/requests.js';
import approvalsRouter from './routes/approvals.js';
import purchaseOrdersRouter from './routes/purchaseOrders.js';
import { authRouter } from './routes/auth.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World from backend!');
});

app.use('/auth', authRouter);
app.use('/requests', requestsRouter);
app.use('/approvals', approvalsRouter);
app.use('/purchase-orders', purchaseOrdersRouter);

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
