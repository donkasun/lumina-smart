import { create } from 'zustand';
import type { ConnectionStatus } from '../services/MockWebSocketService';

export type ToastType = 'info' | 'success' | 'warning' | 'alert';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  body?: string;
  timestamp: number;
}

interface ConnectionState {
  status: ConnectionStatus;
  energyUsage: number; // watts
  lastSyncTime: number | null;
  toasts: ToastMessage[];

  setStatus: (status: ConnectionStatus) => void;
  setEnergyUsage: (watts: number) => void;
  setLastSyncTime: (time: number) => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
}

let _counter = 0;

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: 'disconnected',
  energyUsage: 0,
  lastSyncTime: null,
  toasts: [],

  setStatus: (status) => set({ status }),
  setEnergyUsage: (watts) => set({ energyUsage: watts }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),

  addToast: (toast) => {
    const id = `toast_${++_counter}`;
    set((s) => ({
      // Keep at most 3 toasts at once
      toasts: [...s.toasts.slice(-2), { ...toast, id, timestamp: Date.now() }],
    }));
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
