import express from 'express';
import cors from 'cors';
import { schedule } from 'node-cron';
import apiRouter from './api';
import { initDatabase } from './database';
import { generateAndStoreReport } from './scheduler';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Handle API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const startServer = async () => {
  await initDatabase();
  return new Promise<void>((resolve) => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      resolve();
    });
  });
};

// Start if not being imported
startServer().catch(console.error);

// 对齐币安 4h K 线收盘（UTC 00:05/04:05/08:05/12:05/16:05/20:05），收盘后抓取并生成报告
schedule('5 0,4,8,12,16,20 * * *', () => {
  generateAndStoreReport().catch(err => console.error('Report generation failed:', err));
}, { timezone: 'UTC' });