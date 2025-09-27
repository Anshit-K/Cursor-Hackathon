import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pinRoutes from './routes/pinRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', pinRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Memory Lane API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🗺️  API endpoints: http://localhost:${PORT}/api/pins`);
});
