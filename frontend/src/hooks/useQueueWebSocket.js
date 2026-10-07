import { useState, useEffect } from 'react';
import wsService from '../services/websocketService';

/**
 * Hook to listen for live queue updates and alerts.
 * @param {Function} onEventCallback - Optional callback triggered when a queue event arrives.
 * @param {number|string} doctorId - Optional specific doctor ID to filter.
 */
export const useQueueWebSocket = (onEventCallback, doctorId = null) => {
  const [lastEvent, setLastEvent] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    wsService.connect();
    setIsConnected(true);

    const handleMessage = (payload) => {
      setLastEvent(payload);
      if (onEventCallback) {
        onEventCallback(payload);
      }
    };

    const unsubscribeGlobal = wsService.subscribe('/topic/queue', handleMessage);

    let unsubscribeDoctor = null;
    if (doctorId) {
      unsubscribeDoctor = wsService.subscribe(`/topic/queue/doctor/${doctorId}`, handleMessage);
    }

    return () => {
      unsubscribeGlobal();
      if (unsubscribeDoctor) {
        unsubscribeDoctor();
      }
    };
  }, [doctorId, onEventCallback]);

  return { lastEvent, isConnected };
};

export default useQueueWebSocket;
