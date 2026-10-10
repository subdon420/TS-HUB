import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seedData.js';
import User from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import bugRoutes from './routes/bugRoutes.js';
import testRoutes from './routes/testRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: '*', // Allow local frontend and network access
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Socket.io setup for real-time collaboration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join:project', (projectId) => {
    socket.join(projectId);
    console.log(`[Socket] ${socket.id} joined project room: ${projectId}`);
  });

  socket.on('leave:project', (projectId) => {
    socket.leave(projectId);
    console.log(`[Socket] ${socket.id} left project room: ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health & MongoDB Compass information route
app.get('/api/health', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const collections = isConnected ? await mongoose.connection.db.listCollections().toArray() : [];
  res.json({
    status: 'online',
    appName: "Tester's Home API",
    version: '1.0.0',
    database: {
      connected: isConnected,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      compassConnectionString: 'mongodb://127.0.0.1:27017/testers_home',
      collections: collections.map(c => c.name),
    },
    serverTime: new Date().toISOString(),
  });
});

// Root API Welcome route
app.get('/', (req, res) => {
  res.send({
    message: "🚀 Tester's Home Backend API is running smoothly.",
    documentation: "Connect to MongoDB Compass using: mongodb://127.0.0.1:27017/testers_home",
    healthCheck: "/api/health"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Start Server and connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is currently empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Startup] Empty database detected. Seeding initial demo data...');
      await seedDatabase();
    } else {
      console.log(`[Startup] Database already contains ${userCount} users. Ready!`);
    }

    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Tester's Home API Server listening on port ${PORT}`);
      console.log(`📊 MongoDB Database: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/testers_home'}`);
      console.log(`🧭 Connect MongoDB Compass to: mongodb://127.0.0.1:27017`);
      console.log(`🌐 Ready for frontend connections at: http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

