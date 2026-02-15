import { useEffect } from 'react';
import { wsService } from '../services/MockWebSocketService';
import { useConnectionStore } from '../store/useConnectionStore';
import { useDeviceStore } from '../store/useDeviceStore';

/**
 * Mounts once at the root layout. Connects the MockWebSocketService to:
 *   - useConnectionStore (status, energy, toasts)
 *   - useDeviceStore    (real-time device value updates)
 */
export function useRealTimeUpdates() {
  const setStatus = useConnectionStore((s) => s.setStatus);
  const setEnergyUsage = useConnectionStore((s) => s.setEnergyUsage);
  const setLastSyncTime = useConnectionStore((s) => s.setLastSyncTime);
  const addToast = useConnectionStore((s) => s.addToast);
  const updateDeviceValueFromWS = useDeviceStore((s) => s.updateDeviceValueFromWS);

  useEffect(() => {
    const unsubscribe = wsService.subscribe((event) => {
      switch (event.type) {
        case 'connection_status': {
          const status = event.payload.status;
          setStatus(status);
          if (status === 'connected') {
            setLastSyncTime(event.timestamp);
            addToast({ type: 'success', title: 'Hub Connected', body: 'Live data streaming' });
          } else if (status === 'reconnecting') {
            addToast({ type: 'warning', title: 'Connection Lost', body: 'Attempting to reconnect…' });
          }
          break;
        }

        case 'device_update': {
          const { id, valueDelta, min, max } = event.payload;
          updateDeviceValueFromWS(id, valueDelta, min, max);
          setLastSyncTime(event.timestamp);
          break;
        }

        case 'motion_detected': {
          addToast({
            type: 'alert',
            title: 'Motion Detected',
            body: `${event.payload.deviceName} — ${new Date(event.timestamp).toLocaleTimeString()}`,
          });
          break;
        }

        case 'energy_update': {
          setEnergyUsage(event.payload.watts);
          setLastSyncTime(event.timestamp);
          break;
        }

        case 'temperature_alert': {
          addToast({
            type: 'warning',
            title: 'Temperature Alert',
            body: `${event.payload.temperature}°C — above threshold`,
          });
          break;
        }
      }
    });

    wsService.connect();

    return () => {
      unsubscribe();
      wsService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
