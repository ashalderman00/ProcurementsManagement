import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World from backend!');
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
