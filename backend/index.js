import express from 'express';
import requestsRouter from './routes/requests.js';
import approvalsRouter from './routes/approvals.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World from backend!');
});

app.use('/api/requests', requestsRouter);
app.use('/api/approvals', approvalsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
