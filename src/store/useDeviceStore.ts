import { create } from "zustand";

export type DeviceType =
  | "light"
  | "thermostat"
  | "lock"
  | "ac"
  | "camera"
  | "solar"
  | "vacuum"
  | "doorbell"
  | "purifier"
  | "sprinkler"
  | "tv"
  | "speaker";
export type DeviceCategory = "comfort" | "security" | "entertainment";

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
  brand?: string;
  model?: string;
  batteryLevel?: number; // 0–100, for purifier/vacuum/etc.
}

export type Scenario = "Morning" | "Away" | "Work" | "Movie" | "Sleep";

/** Stable device ids used in URLs and store. Use this map in setScenario for readability. */
const DEVICE_IDS = {
  MAIN_LIGHT: "1",
  THERMOSTAT: "2",
  FRONT_DOOR: "3",
  FRONT_YARD_CAM: "4",
  KITCHEN_LIGHT: "5",
  BEDROOM_LOCK: "6",
  SOLAR: "7",
  BACK_YARD_CAM: "8",
  PET_CAM: "9",
  FRONT_DOORBELL: "10",
  VACUUM: "11",
  PURIFIER: "12",
  SPRINKLER: "13",
  SMART_TV: "14",
  SPEAKERS: "15",
} as const;

interface DeviceState {
  devices: Device[];
  toggleDevice: (id: string) => void;
  setDeviceOn: (id: string, isOn: boolean) => void;
  updateDeviceValue: (id: string, value: number) => void;
  updateDeviceColor: (id: string, color: string) => void;
  updateDeviceMode: (id: string, mode: string) => void;
  /** Apply a delta value from a WebSocket event, clamped to [min, max] */
  updateDeviceValueFromWS: (
    id: string,
    delta: number,
    min?: number,
    max?: number,
  ) => void;
  setScenario: (scenario: Scenario) => void;
  deleteDevice: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [
    {
      id: "1",
      name: "Main Light",
      type: "light",
      isOn: true,
      value: 60,
      unit: "%",
      color: "#FF7F5C",
      category: "comfort",
    },
    {
      id: "2",
      name: "Thermostat",
      type: "thermostat",
      isOn: true,
      value: 22,
      unit: "°C",
      category: "comfort",
    },
    {
      id: "3",
      name: "Front Door",
      type: "lock",
      isOn: true, // true means locked
      value: 1,
      category: "security",
    },
    {
      id: "4",
      name: "Front Yard",
      type: "camera",
      isOn: true,
      value: 0,
      image: require("../../assets/images/cctv.gif"),
      category: "security",
    },
    {
      id: "5",
      name: "Kitchen Light",
      type: "light",
      isOn: true,
      value: 70,
      unit: "%",
      color: "#4ECDC4",
      category: "comfort",
    },
    {
      id: "6",
      name: "Bedroom Lock",
      type: "lock",
      isOn: false, // false means unlocked
      value: 0,
      category: "security",
    },
    {
      id: "7",
      name: "Solar Panels",
      type: "solar",
      isOn: true,
      value: 1452,
      unit: "W",
      category: "comfort",
      image: require("../../assets/icons/solar-panel.svg"),
    },
    {
      id: "8",
      name: "Back Yard",
      type: "camera",
      isOn: true,
      value: 0,
      image: require("../../assets/images/backyard.gif"),
      category: "security",
    },
    {
      id: "9",
      name: "Pet Cam",
      type: "camera",
      isOn: true,
      value: 0,
      image: require("../../assets/images/pet-cam.gif"),
      category: "security",
    },
    {
      id: "10",
      name: "Front Doorbell",
      type: "doorbell",
      isOn: true,
      value: 3,
      category: "security",
      image: require("../../assets/icons/doorbell.svg"),
    },
    {
      id: "11",
      name: "Robot Vacuum",
      type: "vacuum",
      isOn: false,
      value: 87,
      unit: "%",
      category: "comfort",
      mode: "auto",
      image: require("../../assets/icons/vacuum.svg"),
    },
    {
      id: "12",
      name: "Air Purifier",
      type: "purifier",
      isOn: true,
      value: 42,
      unit: "AQI",
      category: "comfort",
      mode: "auto",
      batteryLevel: 85,
      image: require("../../assets/icons/air_purifier.svg"),
    },
    {
      id: "13",
      name: "Garden Sprinkler",
      type: "sprinkler",
      isOn: false,
      value: 0,
      category: "comfort",
      image: require("../../assets/icons/sprinkler.svg"),
    },
    {
      id: "14",
      name: "Smart TV",
      type: "tv",
      isOn: false,
      value: 0,
      category: "entertainment",
    },
    {
      id: "15",
      name: "Speakers",
      type: "speaker",
      isOn: true,
      value: 0,
      category: "entertainment",
    },
  ],
  toggleDevice: (id) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, isOn: !d.isOn } : d,
      ),
    })),
  setDeviceOn: (id, isOn) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, isOn } : d,
      ),
    })),
  updateDeviceValue: (id, value) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, value } : d)),
    })),
  updateDeviceColor: (id, color) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, color } : d)),
    })),
  updateDeviceMode: (id, mode) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === id ? { ...d, mode } : d)),
    })),
  updateDeviceValueFromWS: (id, delta, min, max) =>
    set((state) => ({
      devices: state.devices.map((d) => {
        if (d.id !== id) return d;
        const raw = d.value + delta;
        const clamped =
          min !== undefined && max !== undefined
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
        const index = newDevices.findIndex((d) => d.id === id);
        if (index !== -1) {
          newDevices[index] = { ...newDevices[index], ...updates };
        }
      };

      const D = DEVICE_IDS;
      switch (scenario) {
        case "Morning":
          update(D.MAIN_LIGHT, { isOn: true, value: 60 }); // Main Light on at 60%
          update(D.THERMOSTAT, { isOn: true, value: 22 }); // Thermostat 22°C (heating zone)
          update(D.FRONT_DOOR, { isOn: true }); // Front Door locked
          update(D.FRONT_YARD_CAM, { isOn: true }); // Front Yard Cam on
          update(D.KITCHEN_LIGHT, { isOn: true, value: 70 }); // Kitchen Light on at 70%
          update(D.BEDROOM_LOCK, { isOn: false }); // Bedroom Lock unlocked
          update(D.VACUUM, { isOn: false }); // Vacuum docked (quiet morning)
          update(D.PURIFIER, { isOn: true, value: 42, mode: "auto" }); // Purifier auto
          update(D.SPRINKLER, { isOn: true, value: 1 }); // Sprinkler zone 1 (Front Lawn)
          update(D.SMART_TV, { isOn: false });
          break;

        case "Away":
          update(D.MAIN_LIGHT, { isOn: false }); // Main Light off
          update(D.THERMOSTAT, { isOn: true, value: 18 }); // Thermostat eco 18°C (cooling zone)
          update(D.FRONT_DOOR, { isOn: true }); // Front Door locked
          update(D.FRONT_YARD_CAM, { isOn: true }); // Front Yard Cam on
          update(D.KITCHEN_LIGHT, { isOn: false }); // Kitchen Light off
          update(D.BEDROOM_LOCK, { isOn: true }); // Bedroom Lock locked
          update(D.VACUUM, { isOn: true }); // Vacuum cleans while away
          update(D.PURIFIER, { isOn: false }); // Purifier off (nobody home)
          update(D.SPRINKLER, { isOn: false, value: 0 }); // Sprinkler off
          update(D.SMART_TV, { isOn: false });
          break;

        case "Work":
          update(D.MAIN_LIGHT, { isOn: true, value: 80 }); // Main Light bright for focus
          update(D.THERMOSTAT, { isOn: true, value: 21 }); // Thermostat 21°C (heating zone)
          update(D.FRONT_DOOR, { isOn: true }); // Front Door locked
          update(D.FRONT_YARD_CAM, { isOn: true }); // Front Yard Cam on
          update(D.KITCHEN_LIGHT, { isOn: false }); // Kitchen Light off
          update(D.BEDROOM_LOCK, { isOn: true }); // Bedroom Lock locked
          update(D.VACUUM, { isOn: false }); // Vacuum docked (do not disturb)
          update(D.PURIFIER, { isOn: true, value: 35, mode: "low" }); // Purifier quiet
          update(D.SPRINKLER, { isOn: false, value: 0 }); // Sprinkler off
          update(D.SMART_TV, { isOn: false });
          break;

        case "Movie":
          update(D.MAIN_LIGHT, { isOn: false }); // Main Light off
          update(D.THERMOSTAT, { isOn: true, value: 22 }); // Thermostat 22°C (heating zone)
          update(D.FRONT_DOOR, { isOn: true }); // Front Door locked
          update(D.FRONT_YARD_CAM, { isOn: true }); // Front Yard Cam on
          update(D.KITCHEN_LIGHT, { isOn: true, value: 20 }); // Kitchen Light dim at 20%
          update(D.BEDROOM_LOCK, { isOn: false }); // Bedroom Lock unlocked (relaxed)
          update(D.VACUUM, { isOn: false }); // Vacuum docked (quiet)
          update(D.PURIFIER, { isOn: true, value: 25, mode: "low" }); // Purifier quiet
          update(D.SPRINKLER, { isOn: false, value: 0 }); // Sprinkler off
          update(D.SMART_TV, { isOn: true }); // TV on for Movie mode
          break;

        case "Sleep":
          update(D.MAIN_LIGHT, { isOn: false }); // Main Light off
          update(D.THERMOSTAT, { isOn: true, value: 20 }); // Thermostat sleep 20°C (cooling zone)
          update(D.FRONT_DOOR, { isOn: true }); // Front Door locked
          update(D.FRONT_YARD_CAM, { isOn: false }); // Front Yard Cam off (night)
          update(D.KITCHEN_LIGHT, { isOn: false }); // Kitchen Light off
          update(D.BEDROOM_LOCK, { isOn: true }); // Bedroom Lock locked
          update(D.VACUUM, { isOn: false }); // Vacuum docked, charging
          update(D.PURIFIER, { isOn: true, value: 20, mode: "low" }); // Purifier whisper
          update(D.SPRINKLER, { isOn: false, value: 0 }); // Sprinkler off
          update(D.SMART_TV, { isOn: false });
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
        d.id === id ? { ...d, isFavorite: !d.isFavorite } : d,
      ),
    })),
}));
