import { create } from 'zustand';

export type DeviceType = 'light' | 'thermostat' | 'lock' | 'ac';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  isOn: boolean;
  value: number; // brightness, temperature, or lock position
  unit?: string;
}

interface DeviceState {
  devices: Device[];
  toggleDevice: (id: string) => void;
  updateDeviceValue: (id: string, value: number) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [
    {
      id: '1',
      name: 'Main Light',
      type: 'light',
      isOn: true,
      value: 80,
      unit: '%',
    },
    {
      id: '2',
      name: 'Thermostat',
      type: 'thermostat',
      isOn: true,
      value: 22,
      unit: '°C',
    },
    {
      id: '3',
      name: 'Front Door',
      type: 'lock',
      isOn: false, // false means unlocked
      value: 0,
    },
    {
      id: '4',
      name: 'Living Room AC',
      type: 'ac',
      isOn: false,
      value: 24,
      unit: '°C',
    },
    {
      id: '5',
      name: 'Kitchen Light',
      type: 'light',
      isOn: false,
      value: 0,
      unit: '%',
    },
    {
      id: '6',
      name: 'Bedroom Lock',
      type: 'lock',
      isOn: true, // true means locked
      value: 1,
    },
  ],
  toggleDevice: (id) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, isOn: !d.isOn } : d
      ),
    })),
  updateDeviceValue: (id, value) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, value } : d
      ),
    })),
}));
