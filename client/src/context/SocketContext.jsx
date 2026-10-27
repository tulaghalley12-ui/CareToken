import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastQueueEvent, setLastQueueEvent] = useState(null);
  const [realtimeNotification, setRealtimeNotification] = useState(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true
    });

    s.on('connect', () => {
      setIsConnected(true);
      // Join user specific room if user is logged in
      if (user?._id) {
        s.emit('join:user', user._id);
      }
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('queue:updated', (data) => {
      setLastQueueEvent(data);
    });

    s.on('doctor:queue:updated', (data) => {
      setLastQueueEvent(data);
    });

    s.on('reception:queue:updated', (data) => {
      setLastQueueEvent(data);
    });

    s.on('patient:token:updated', (data) => {
      setLastQueueEvent(data);
    });

    s.on('notification:new', (notif) => {
      setRealtimeNotification(notif);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?._id]);

  const joinDepartment = (deptId) => {
    if (socket && isConnected && deptId) {
      socket.emit('join:department', deptId);
    }
  };

  const leaveDepartment = (deptId) => {
    if (socket && isConnected && deptId) {
      socket.emit('leave:department', deptId);
    }
  };

  const joinDoctor = (doctorId) => {
    if (socket && isConnected && doctorId) {
      socket.emit('join:doctor', doctorId);
    }
  };

  const leaveDoctor = (doctorId) => {
    if (socket && isConnected && doctorId) {
      socket.emit('leave:doctor', doctorId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        lastQueueEvent,
        realtimeNotification,
        clearNotification: () => setRealtimeNotification(null),
        joinDepartment,
        leaveDepartment,
        joinDoctor,
        leaveDoctor
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return {
      isConnected: false,
      lastQueueEvent: null,
      joinDepartment: () => {},
      leaveDepartment: () => {},
      joinDoctor: () => {},
      leaveDoctor: () => {}
    };
  }
  return context;
};
