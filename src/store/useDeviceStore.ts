import { create } from 'zustand';

export type DeviceType = 'light' | 'thermostat' | 'lock' | 'ac' | 'camera';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  isOn: boolean;
  value: number; // brightness, temperature, or lock position
  unit?: string;
  image?: any; // For camera background
}

export type Scenario = 'Morning' | 'Away' | 'Work' | 'Movie' | 'Sleep';

interface DeviceState {
  devices: Device[];
  toggleDevice: (id: string) => void;
  updateDeviceValue: (id: string, value: number) => void;
  setScenario: (scenario: Scenario) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [
    {
      id: '1',
      name: 'Main Light',
      type: 'light',
      isOn: true,
      value: 60,
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
      isOn: true, // true means locked
      value: 1,
    },
    {
      id: '4',
      name: 'Driveway',
      type: 'camera',
      isOn: true,
      value: 0,
      image: require('@/assets/images/cctv.gif'),
    },
    {
      id: '5',
      name: 'Kitchen Light',
      type: 'light',
      isOn: true,
      value: 70,
      unit: '%',
    },
    {
      id: '6',
      name: 'Bedroom Lock',
      type: 'lock',
      isOn: false, // false means unlocked
      value: 0,
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
  setScenario: (scenario) =>
    set((state) => {
      const newDevices = [...state.devices];
      
      const update = (id: string, updates: Partial<Device>) => {
        const index = newDevices.findIndex(d => d.id === id);
        if (index !== -1) {
          newDevices[index] = { ...newDevices[index], ...updates };
        }
      };

      switch (scenario) {
        case 'Morning':
          update('1', { isOn: true, value: 60 });
          update('5', { isOn: true, value: 70 });
          update('3', { isOn: true }); // Locked
          update('6', { isOn: false }); // Unlocked
          update('2', { isOn: true });
          update('4', { isOn: true });
          break;
        case 'Away':
          update('1', { isOn: false });
          update('5', { isOn: false });
          update('3', { isOn: true }); 
          update('6', { isOn: true });
          update('2', { isOn: true });
          update('4', { isOn: true });
          break;
        case 'Work':
          update('1', { isOn: false });
          update('5', { isOn: false });
          update('3', { isOn: true });
          update('2', { isOn: true });
          update('4', { isOn: true });
          break;
        case 'Movie':
          update('1', { isOn: false });
          update('5', { isOn: true, value: 20 });
          update('3', { isOn: true });
          update('2', { isOn: true });
          update('4', { isOn: true });
          break;
        case 'Sleep':
          update('1', { isOn: false });
          update('5', { isOn: false });
          update('3', { isOn: true });
          update('6', { isOn: true });
          update('2', { isOn: true });
          update('4', { isOn: true });
          break;
      }
      
      return { devices: newDevices };
    }),
}));
