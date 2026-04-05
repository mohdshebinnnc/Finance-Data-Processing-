import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { connectDatabase, disconnectDatabase } from './config/database';
import prisma from './config/database';
import { errorHandler, notFoundHandler, generalLimiter } from './middleware';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import transactionRoutes from './routes/transactions';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(generalLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    
    setInterval(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (e) {
        console.error('Database ping failed:', e);
      }
    }, 30000);
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

startServer();

export default app;
