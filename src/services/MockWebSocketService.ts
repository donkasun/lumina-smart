/**
 * MockWebSocketService
 *
 * Simulates a real-time WebSocket connection for demo purposes.
 * Generates realistic smart-home events: temperature drift, motion alerts,
 * light automation, energy monitoring, and connection state changes.
 */

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export type WSEventType =
  | 'device_update'
  | 'motion_detected'
  | 'temperature_alert'
  | 'connection_status'
  | 'energy_update';

export interface WSEvent {
  type: WSEventType;
  payload: any;
  timestamp: number;
}

type EventHandler = (event: WSEvent) => void;

class MockWebSocketService {
  private listeners = new Set<EventHandler>();
  private status: ConnectionStatus = 'disconnected';
  private intervals: ReturnType<typeof setInterval>[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private started = false;

  /** Start the simulated connection */
  connect() {
    if (this.started) return;
    this.started = true;

    // Simulate initial handshake delay
    setTimeout(() => {
      this.setStatus('connected');
      this.startSimulation();
    }, 1800);
  }

  /** Tear down all timers */
  disconnect() {
    this.started = false;
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.setStatus('disconnected');
  }

  /** Subscribe to events. Returns an unsubscribe function. */
  subscribe(handler: EventHandler) {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private emit(event: WSEvent) {
    this.listeners.forEach((h) => h(event));
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.emit({ type: 'connection_status', payload: { status }, timestamp: Date.now() });
  }

  private startSimulation() {
    // Thermostat temperature drift — every 25s
    const tempDrift = setInterval(() => {
      if (this.status !== 'connected') return;
      const delta = parseFloat(((Math.random() - 0.5) * 1.0).toFixed(1)); // ±0.5°C
      this.emit({
        type: 'device_update',
        payload: { id: '2', valueDelta: delta, min: 16, max: 30 },
        timestamp: Date.now(),
      });
    }, 25000);

    // Smart light auto-adjust — every 35s
    const lightAuto = setInterval(() => {
      if (this.status !== 'connected') return;
      if (Math.random() > 0.45) {
        const lightId = Math.random() > 0.5 ? '1' : '5';
        const delta = parseFloat(((Math.random() - 0.5) * 12).toFixed(0));
        this.emit({
          type: 'device_update',
          payload: { id: lightId, valueDelta: delta, min: 10, max: 100 },
          timestamp: Date.now(),
        });
      }
    }, 35000);

    // Motion detection alert — every 50s (60% trigger chance)
    const motionCheck = setInterval(() => {
      if (this.status !== 'connected') return;
      if (Math.random() > 0.4) {
        this.emit({
          type: 'motion_detected',
          payload: { deviceId: '4', deviceName: 'Driveway Camera' },
          timestamp: Date.now(),
        });
      }
    }, 50000);

    // Energy usage update — every 15s
    const energyUpdate = setInterval(() => {
      if (this.status !== 'connected') return;
      this.emit({
        type: 'energy_update',
        payload: { watts: Math.round(900 + Math.random() * 600) },
        timestamp: Date.now(),
      });
    }, 15000);

    // High-temperature alert — every 70s (15% chance)
    const tempAlert = setInterval(() => {
      if (this.status !== 'connected') return;
      if (Math.random() > 0.85) {
        const temp = parseFloat((28 + Math.random() * 3).toFixed(1));
        this.emit({
          type: 'temperature_alert',
          payload: { temperature: temp, threshold: 28 },
          timestamp: Date.now(),
        });
      }
    }, 70000);

    // Simulate brief connection drops — every 90s (25% chance)
    const connDrop = setInterval(() => {
      if (Math.random() > 0.75) {
        this.setStatus('reconnecting');
        const delay = 3000 + Math.random() * 4000;
        this.reconnectTimer = setTimeout(() => {
          if (this.started) this.setStatus('connected');
        }, delay);
      }
    }, 90000);

    this.intervals = [tempDrift, lightAuto, motionCheck, energyUpdate, tempAlert, connDrop];
  }
}

// Singleton — one connection shared across the app
export const wsService = new MockWebSocketService();
