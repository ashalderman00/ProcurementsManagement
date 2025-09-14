import express from 'express';
import dotenv from 'dotenv';
import { authRouter, ROLES } from './routes/auth.js';
import { authenticateToken, authorizeRoles } from './middleware/auth.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/auth', authRouter);

// Example protected route requiring administrator role
app.get(
  '/admin',
  authenticateToken,
  authorizeRoles(ROLES.ADMINISTRATOR),
  (req, res) => {
    res.json({ message: 'Administrator content' });
  }
);

app.get('/', (req, res) => {
  res.send('Hello World from backend!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
