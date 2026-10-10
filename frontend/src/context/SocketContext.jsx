import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [liveActivities, setLiveActivities] = useState([]);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const socketInstance = io('/', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to Tester’s Home Socket.io server');
    });

    socketInstance.on('activity:feed', (activity) => {
      setLiveActivities(prev => [activity, ...prev].slice(0, 30));
      if (activity.type === 'STATUS_CHANGED') {
        addToast(activity.message, 'cyber');
      } else if (activity.type === 'BUG_CREATED') {
        addToast(activity.message, 'info');
      } else if (activity.type === 'RUN_COMPLETED') {
        addToast(activity.message, 'success');
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinProject = (projectId) => {
    if (socket && projectId) {
      socket.emit('join:project', projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socket && projectId) {
      socket.emit('leave:project', projectId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, liveActivities, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

