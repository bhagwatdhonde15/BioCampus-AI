import { createClient } from '@supabase/supabase-js';
import { PlantRecord } from '../types/plant';

// Live Supabase Project Credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jdrpklxrpwfkqxyzujkt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_o_G1UxN0ohijznaOixBhkQ_fUAde-tc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 1. Google OAuth Sign-In
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

// 2. Email & Password Sign-In
export async function signInWithEmail(email: string, password?: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || 'biocampus123',
  });
  if (error) throw error;
  return data;
}

// 3. Email & Password Sign-Up
export async function signUpWithEmail(email: string, name: string, role: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'biocampus123',
    options: {
      data: {
        full_name: name,
        role: role,
      },
    },
  });
  if (error) throw error;
  return data;
}

// 4. Sign Out
export async function signOutSupabase() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 5. Database Sync: Fetch all plant records from Supabase PostgreSQL
export async function fetchPlantsFromSupabase(): Promise<PlantRecord[]> {
  try {
    const { data, error } = await supabase.from('plants').select('*');
    if (error || !data) return [];
    
    return data.map((row: any): PlantRecord => ({
      id: row.id,
      commonName: row.common_name,
      scientificName: row.scientific_name,
      treeType: row.tree_type,
      confidence: row.confidence,
      healthStatus: row.health_status,
      healthScore: row.health_score,
      diseases: [],
      heightMeters: row.height_meters,
      dbhCm: row.dbh_cm,
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address,
      zone: row.zone,
      notes: row.notes,
      photoBase64: row.photo_base64,
      dateMapped: row.date_mapped,
      campusName: row.campus_name,
      growthLogs: [],
      soilMoisturePercent: row.soil_moisture_percent,
    }));
  } catch {
    return [];
  }
}

// 6. Database Sync: Save single plant record to Supabase
export async function savePlantToSupabase(record: PlantRecord) {
  try {
    const row = {
      id: record.id,
      common_name: record.commonName,
      scientific_name: record.scientificName,
      tree_type: record.treeType || 'Deciduous Shade Tree',
      confidence: record.confidence || 0.95,
      health_status: record.healthStatus || 'Healthy',
      health_score: record.healthScore || 90,
      height_meters: record.heightMeters || 3.0,
      dbh_cm: record.dbhCm || 15.0,
      latitude: record.latitude,
      longitude: record.longitude,
      address: record.address || '',
      zone: record.zone || 'Main Campus',
      notes: record.notes || '',
      photo_base64: record.photoBase64 || '',
      date_mapped: record.dateMapped || new Date().toISOString(),
      campus_name: record.campusName || 'Sanjivani University',
      soil_moisture_percent: record.soilMoisturePercent,
    };

    const { data, error } = await supabase.from('plants').upsert([row]);
    if (error) console.warn('Supabase upsert warning:', error.message);
    return data;
  } catch (err) {
    console.warn('Supabase error:', err);
  }
}

// 7. Bulk Sync All Campus Plants to Supabase
export async function syncAllPlantsToSupabase(records: PlantRecord[]) {
  try {
    const rows = records.map((record) => ({
      id: record.id,
      common_name: record.commonName,
      scientific_name: record.scientificName,
      tree_type: record.treeType || 'Deciduous Shade Tree',
      confidence: record.confidence || 0.95,
      health_status: record.healthStatus || 'Healthy',
      health_score: record.healthScore || 90,
      height_meters: record.heightMeters || 3.0,
      dbh_cm: record.dbhCm || 15.0,
      latitude: record.latitude,
      longitude: record.longitude,
      address: record.address || '',
      zone: record.zone || 'Main Campus',
      notes: record.notes || '',
      photo_base64: record.photoBase64 || '',
      date_mapped: record.dateMapped || new Date().toISOString(),
      campus_name: record.campusName || 'Sanjivani University',
      soil_moisture_percent: record.soilMoisturePercent,
    }));

    const { data, error } = await supabase.from('plants').upsert(rows);
    if (error) console.warn('Supabase bulk sync warning:', error.message);
    return { success: !error, count: rows.length };
  } catch (err) {
    return { success: false, error: err };
  }
}
