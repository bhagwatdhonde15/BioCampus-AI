import { useState, useCallback } from 'react';
import { PlantRecord, GrowthLog } from '../types/plant';

const STORAGE_KEY = 'biocampus_plant_records';

function loadFromStorage(): PlantRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlantRecord[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(records: PlantRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    console.error('Failed to persist plant records to localStorage.');
  }
}

export function usePlantStore() {
  const [records, setRecords] = useState<PlantRecord[]>(loadFromStorage);

  const addPlant = useCallback((record: PlantRecord) => {
    setRecords((prev) => {
      const updated = [record, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deletePlant = useCallback((id: string) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addGrowthLog = useCallback((plantId: string, log: GrowthLog) => {
    setRecords((prev) => {
      const updated = prev.map((r) => {
        if (r.id === plantId) {
          const logs = r.growthLogs ? [log, ...r.growthLogs] : [log];
          return {
            ...r,
            heightMeters: log.heightMeters,
            dbhCm: log.dbhCm,
            healthStatus: log.healthStatus,
            healthScore: log.healthScore,
            growthLogs: logs,
          };
        }
        return r;
      });
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updatePlantMoisture = useCallback((plantId: string, percent: number) => {
    setRecords((prev) => {
      const updated = prev.map((r) => {
        if (r.id === plantId) {
          return {
            ...r,
            soilMoisturePercent: percent,
          };
        }
        return r;
      });
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const getUniqueSpecies = useCallback(() => {
    const species = new Set(records.map((r) => r.scientificName));
    return Array.from(species);
  }, [records]);

  const getActiveZones = useCallback(() => {
    const zones = new Set(records.map((r) => r.zone));
    return Array.from(zones);
  }, [records]);

  const getZoneDistribution = useCallback(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      map[r.zone] = (map[r.zone] || 0) + 1;
    });
    const result: { zone: string; count: number }[] = Object.entries(map)
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count);
    return result;
  }, [records]);

  const getSpeciesDistribution = useCallback(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      const key = r.commonName || r.scientificName;
      map[key] = (map[key] || 0) + 1;
    });
    const result: { name: string; count: number }[] = Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return result;
  }, [records]);

  const getHealthDistribution = useCallback(() => {
    const healthy = records.filter((r) => r.healthStatus === 'Healthy').length;
    const diseased = records.filter((r) => r.healthStatus === 'Diseased').length;
    const unknown = records.filter((r) => r.healthStatus === 'Unknown').length;
    const result: { name: string; value: number }[] = [
      { name: 'Healthy', value: healthy },
      { name: 'Diseased', value: diseased },
      { name: 'Unknown', value: unknown },
    ].filter((d) => d.value > 0);
    return result;
  }, [records]);

  return {
    records,
    addPlant,
    deletePlant,
    addGrowthLog,
    updatePlantMoisture,
    getUniqueSpecies,
    getActiveZones,
    getZoneDistribution,
    getSpeciesDistribution,
    getHealthDistribution,
  };
}
