export type HealthStatus = 'Healthy' | 'Diseased' | 'Unknown';

export interface GrowthLog {
  id: string;
  date: string;
  heightMeters: number;
  dbhCm: number;             // Diameter at Breast Height (cm)
  healthStatus: HealthStatus;
  healthScore: number;       // 0 - 100
  notes: string;
  inspector: string;
}

export interface PlantRecord {
  id: string;
  commonName: string;
  scientificName: string;
  treeType: string;          // e.g. "Broadleaf Hardwood Tree", "Evergreen Medicinal Tree", "Conifer", "Flowering Shrub"
  confidence: number;       // 0–1 from Plant.id API
  healthStatus: HealthStatus;
  healthScore: number;       // 0 - 100
  diseases: string[];
  heightMeters: number;
  dbhCm: number;
  latitude: number;
  longitude: number;
  address: string;          // from Nominatim reverse geocoding
  zone: string;             // user-selected campus zone
  notes: string;
  photoBase64: string;      // full base64 data URL of captured image
  dateMapped: string;       // ISO date string
  campusName: string;
  growthLogs: GrowthLog[];
  careActionNeeded?: string;
  soilMoisturePercent?: number; // Live IoT sensor reading
}

export interface UserAccount {
  name: string;
  email: string;
  phone?: string;
  role: 'Student Contributor' | 'Campus Arborist' | 'Institution Admin';
}

export interface GeolocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  isWatching: boolean;
  error: string | null;
}

export interface PlantIdResult {
  commonName: string;
  scientificName: string;
  treeType: string;
  confidence: number;
  isHealthy: boolean;
  diseases: string[];
}

export interface YoloDetection {
  id: string;
  commonName: string;
  scientificName: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  estHeightMeters: number;
  healthStatus: HealthStatus;
  color: string;
}

export interface IpDeviceNode {
  id: string;
  name: string;
  ip: string;
  port?: string;
  type: 'sensor' | 'camera' | 'irrigation' | 'gateway';
  status: 'ONLINE' | 'OFFLINE' | 'STANDBY';
  latencyMs: number;
  lastPing: string;
  details: string;
}

export type AppTab = 'map' | 'capture' | 'inventory' | 'growth' | 'vision' | 'iot' | 'ipverse' | 'analytics';

export const CAMPUS_ZONES = [
  'North Quadrangle',
  'South Quadrangle',
  'Engineering Block',
  'Science & Pharmacy Block',
  'Central Library Lawn',
  'Administrative Block',
  'Botanical Garden',
  'Hostel Green Belt',
  'Sports Ground Perimeter',
  'Main Entrance Avenue',
] as const;

export type CampusZone = typeof CAMPUS_ZONES[number];
