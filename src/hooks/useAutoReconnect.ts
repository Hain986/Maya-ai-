import { useState, useEffect } from 'react';
import { reconnectService, HealthStatus } from '../services/reconnectService';

export function useAutoReconnect() {
  const [health, setHealth] = useState<HealthStatus>(reconnectService.getHealthStatus());

  useEffect(() => {
    const unsubscribe = reconnectService.subscribe((updated) => {
      setHealth(updated);
    });
    return () => unsubscribe();
  }, []);

  const triggerReconnect = () => {
    return reconnectService.manualReconnect();
  };

  return {
    ...health,
    isOnline: health.status === 'online',
    isReconnecting: health.status === 'reconnecting',
    isOfflineNeural: health.status === 'offline_neural',
    triggerReconnect,
  };
}
