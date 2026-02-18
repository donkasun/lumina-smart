import { create } from 'zustand';

export type DeviceType = 'light' | 'thermostat' | 'lock' | 'ac' | 'camera' | 'solar' | 'vacuum' | 'doorbell' | 'purifier' | 'sprinkler';
export type DeviceCategory = 'comfort' | 'security' | 'entertainment';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  isOn: boolean;
  value: number; // brightness, temperature, or lock position
  unit?: string;
  image?: any; // For camera background
  isFavorite?: boolean;
  color?: string; // For light color
  lastUpdated?: number; // timestamp of last WS update
  category?: DeviceCategory;
  mode?: string; // vacuum: 'auto'|'spot'|'edge'|'room'; purifier: 'auto'|'low'|'medium'|'high'
}

export type Scenario = 'Morning' | 'Away' | 'Work' | 'Movie' | 'Sleep';

interface DeviceState {
  devices: Device[];
  toggleDevice: (id: string) => void;
  updateDeviceValue: (id: string, value: number) => void;
  updateDeviceColor: (id: string, color: string) => void;
  /** Apply a delta value from a WebSocket event, clamped to [min, max] */
  updateDeviceValueFromWS: (id: string, delta: number, min?: number, max?: number) => void;
  setScenario: (scenario: Scenario) => void;
  deleteDevice: (id: string) => void;
  toggleFavorite: (id: string) => void;
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
      color: '#FF7F5C',
      category: 'comfort',
    },
    {
      id: '2',
      name: 'Thermostat',
      type: 'thermostat',
      isOn: true,
      value: 22,
      unit: '°C',
      category: 'comfort',
    },
    {
      id: '3',
      name: 'Front Door',
      type: 'lock',
      isOn: true, // true means locked
      value: 1,
      category: 'security',
    },
    {
      id: '4',
      name: 'Front Yard',
      type: 'camera',
      isOn: true,
      value: 0,
      image: require('../../assets/images/cctv.gif'),
      category: 'security',
    },
    {
      id: '5',
      name: 'Kitchen Light',
      type: 'light',
      isOn: true,
      value: 70,
      unit: '%',
      color: '#4ECDC4',
      category: 'comfort',
    },
    {
      id: '6',
      name: 'Bedroom Lock',
      type: 'lock',
      isOn: false, // false means unlocked
      value: 0,
      category: 'security',
    },
    {
      id: '7',
      name: 'Solar Panels',
      type: 'solar',
      isOn: true,
      value: 1452,
      unit: 'W',
      category: 'comfort',
    },
    {
      id: '8',
      name: 'Back Yard',
      type: 'camera',
      isOn: true,
      value: 0,
      image: require('../../assets/images/backyard.gif'),
      category: 'security',
    },
    {
      id: '9',
      name: 'Pet Cam',
      type: 'camera',
      isOn: true,
      value: 0,
      image: require('../../assets/images/pet-cam.gif'),
      category: 'security',
    },
    {
      id: '10',
      name: 'Front Doorbell',
      type: 'doorbell',
      isOn: true,
      value: 3,
      category: 'security',
    },
    {
      id: '11',
      name: 'Robot Vacuum',
      type: 'vacuum',
      isOn: false,
      value: 87,
      unit: '%',
      category: 'comfort',
      mode: 'auto',
      image: require('../../assets/images/vacuum.png'),
    },
    {
      id: '12',
      name: 'Air Purifier',
      type: 'purifier',
      isOn: true,
      value: 42,
      unit: 'AQI',
      category: 'comfort',
      mode: 'auto',
      image: require('../../assets/images/air_purifier.png'),
    },
    {
      id: '13',
      name: 'Garden Sprinkler',
      type: 'sprinkler',
      isOn: false,
      value: 0,
      category: 'comfort',
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
  updateDeviceColor: (id, color) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, color } : d
      ),
    })),
  updateDeviceValueFromWS: (id, delta, min, max) =>
    set((state) => ({
      devices: state.devices.map((d) => {
        if (d.id !== id) return d;
        const raw = d.value + delta;
        const clamped = min !== undefined && max !== undefined
          ? Math.min(max, Math.max(min, raw))
          : raw;
        const value = parseFloat(clamped.toFixed(1));
        return { ...d, value, lastUpdated: Date.now() };
      }),
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
          update('1',  { isOn: true,  value: 60 });             // Main Light on at 60%
          update('2',  { isOn: true,  value: 22 });             // Thermostat 22°C
          update('3',  { isOn: true  });                        // Front Door locked
          update('4',  { isOn: true  });                        // Front Yard Cam on
          update('5',  { isOn: true,  value: 70 });             // Kitchen Light on at 70%
          update('6',  { isOn: false });                        // Bedroom Lock unlocked
          update('11', { isOn: false });                        // Vacuum docked (quiet morning)
          update('12', { isOn: true,  value: 42, mode: 'auto' }); // Purifier auto mode
          update('13', { isOn: true,  value: 1  });             // Sprinkler zone 1 (Front Lawn)
          break;

        case 'Away':
          update('1',  { isOn: false });                        // Main Light off
          update('2',  { isOn: true,  value: 18 });             // Thermostat eco 18°C
          update('3',  { isOn: true  });                        // Front Door locked
          update('4',  { isOn: true  });                        // Front Yard Cam on
          update('5',  { isOn: false });                        // Kitchen Light off
          update('6',  { isOn: true  });                        // Bedroom Lock locked
          update('11', { isOn: true  });                        // Vacuum cleans while away
          update('12', { isOn: false });                        // Purifier off (nobody home)
          update('13', { isOn: false, value: 0 });              // Sprinkler off
          break;

        case 'Work':
          update('1',  { isOn: true,  value: 80 });             // Main Light bright (80%) for focus
          update('2',  { isOn: true,  value: 21 });             // Thermostat 21°C
          update('3',  { isOn: true  });                        // Front Door locked
          update('4',  { isOn: true  });                        // Front Yard Cam on
          update('5',  { isOn: false });                        // Kitchen Light off
          update('6',  { isOn: true  });                        // Bedroom Lock locked
          update('11', { isOn: false });                        // Vacuum docked (do not disturb)
          update('12', { isOn: true,  value: 35, mode: 'low' }); // Purifier quiet low
          update('13', { isOn: false, value: 0 });              // Sprinkler off
          break;

        case 'Movie':
          update('1',  { isOn: false });                        // Main Light off
          update('2',  { isOn: true,  value: 22 });             // Thermostat 22°C
          update('3',  { isOn: true  });                        // Front Door locked
          update('4',  { isOn: true  });                        // Front Yard Cam on
          update('5',  { isOn: true,  value: 20 });             // Kitchen Light dim at 20%
          update('6',  { isOn: false });                        // Bedroom Lock unlocked (relaxed)
          update('11', { isOn: false });                        // Vacuum docked (quiet)
          update('12', { isOn: true,  value: 25, mode: 'low' }); // Purifier quiet during movie
          update('13', { isOn: false, value: 0 });              // Sprinkler off
          break;

        case 'Sleep':
          update('1',  { isOn: false });                        // Main Light off
          update('2',  { isOn: true,  value: 20 });             // Thermostat sleep temp 20°C
          update('3',  { isOn: true  });                        // Front Door locked
          update('4',  { isOn: true  });                        // Front Yard Cam on
          update('5',  { isOn: false });                        // Kitchen Light off
          update('6',  { isOn: true  });                        // Bedroom Lock locked
          update('11', { isOn: false });                        // Vacuum docked, charging
          update('12', { isOn: true,  value: 20, mode: 'low' }); // Purifier whisper mode
          update('13', { isOn: false, value: 0 });              // Sprinkler off
          break;
      }
      
      return { devices: newDevices };
    }),
  deleteDevice: (id) =>
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
    })),
  toggleFavorite: (id) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
      ),
    })),
}));
