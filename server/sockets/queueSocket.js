const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer, clientOrigin) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientOrigin || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Join department room for live queue displays
    socket.on('join:department', (departmentId) => {
      if (departmentId) {
        socket.join(`department:${departmentId}`);
      }
    });

    socket.on('leave:department', (departmentId) => {
      if (departmentId) {
        socket.leave(`department:${departmentId}`);
      }
    });

    // Join doctor room for doctor's console
    socket.on('join:doctor', (doctorId) => {
      if (doctorId) {
        socket.join(`doctor:${doctorId}`);
      }
    });

    socket.on('leave:doctor', (doctorId) => {
      if (doctorId) {
        socket.leave(`doctor:${doctorId}`);
      }
    });

    // Join user-specific room for personalized alerts and token updates
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('leave:user', (userId) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });

    // Global reception / announcement board
    socket.on('join:reception', () => {
      socket.join('reception:all');
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

const getIO = () => io;

// Broadcasters for queue events
const emitQueueUpdate = (data) => {
  if (!io) return;
  const { departmentId, doctorId, userId, token, queueSummary } = data;

  // Broadcast to department room
  if (departmentId) {
    io.to(`department:${departmentId}`).emit('queue:updated', {
      departmentId,
      token,
      queueSummary,
      timestamp: new Date()
    });
  }

  // Broadcast to doctor room
  if (doctorId) {
    io.to(`doctor:${doctorId}`).emit('doctor:queue:updated', {
      doctorId,
      token,
      queueSummary,
      timestamp: new Date()
    });
  }

  // Broadcast to reception
  io.to('reception:all').emit('reception:queue:updated', {
    departmentId,
    doctorId,
    token,
    timestamp: new Date()
  });

  // Direct alert to patient
  if (userId) {
    io.to(`user:${userId}`).emit('patient:token:updated', {
      token,
      timestamp: new Date()
    });
  }
};

const emitNotification = (userId, notification) => {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit('notification:new', notification);
};

module.exports = {
  initSocket,
  getIO,
  emitQueueUpdate,
  emitNotification
};
