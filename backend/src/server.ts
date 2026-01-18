import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './config/env';
import prisma from './config/database';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.SOCKET_CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-note', (noteId: string) => {
    socket.join(`note-${noteId}`);
    console.log(`Socket ${socket.id} joined note-${noteId}`);
  });

  socket.on('leave-note', (noteId: string) => {
    socket.leave(`note-${noteId}`);
    console.log(`Socket ${socket.id} left note-${noteId}`);
  });

  socket.on('note-update', (data: { noteId: string; content: string }) => {
    socket.to(`note-${data.noteId}`).emit('note-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
      console.log(`📝 API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

startServer();

export { io };
