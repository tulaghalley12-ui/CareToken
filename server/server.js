require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { initSocket } = require('./sockets/queueSocket');

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to database...');
    await connectDB();

    // 2. Create HTTP Server
    const httpServer = http.createServer(app);

    // 3. Initialize Socket.IO
    initSocket(httpServer, CLIENT_URL);
    console.log('Socket.IO initialized for real-time queue synchronization');

    // 4. Start listening
    httpServer.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Hospital Token Management System API running!`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port:        ${PORT}`);
      console.log(`  Client URL:  ${CLIENT_URL}`);
      console.log(`====================================================`);
    });

    // Handle process termination signals
    const shutdown = () => {
      console.log('Received kill signal, shutting down gracefully...');
      httpServer.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('\n****************************************************');
    console.error('SERVER INITIALIZATION ERROR:');
    console.error(error.message);
    console.error('****************************************************\n');
    process.exit(1);
  }
};

startServer();
