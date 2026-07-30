-- =========================================================================
-- BIOCAMPUS AI - SUPABASE DATABASE SCHEMA (SAFE RE-RUNNABLE SCRIPT)
-- Copy & paste this code into your Supabase Dashboard -> SQL Editor -> Run
-- =========================================================================

-- 1. Create Plants Table
CREATE TABLE IF NOT EXISTS public.plants (
    id TEXT PRIMARY KEY,
    common_name TEXT NOT NULL,
    scientific_name TEXT NOT NULL,
    tree_type TEXT DEFAULT 'Deciduous Shade Tree',
    confidence REAL DEFAULT 0.95,
    health_status TEXT DEFAULT 'Healthy',
    health_score INT DEFAULT 90,
    height_meters REAL DEFAULT 3.0,
    dbh_cm REAL DEFAULT 15.0,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    zone TEXT DEFAULT 'Main Campus',
    notes TEXT,
    photo_base64 TEXT,
    date_mapped TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    campus_name TEXT DEFAULT 'Sanjivani University',
    soil_moisture_percent INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Growth Inspection Logs Table
CREATE TABLE IF NOT EXISTS public.growth_logs (
    id TEXT PRIMARY KEY,
    plant_id TEXT REFERENCES public.plants(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    height_meters REAL NOT NULL,
    dbh_cm REAL NOT NULL,
    health_status TEXT NOT NULL,
    health_score INT NOT NULL,
    notes TEXT,
    inspector TEXT DEFAULT 'Campus Arborist'
);

-- 3. Create IoT Soil Moisture Telemetry Table
CREATE TABLE IF NOT EXISTS public.iot_telemetry (
    id BIGSERIAL PRIMARY KEY,
    esp_ip TEXT DEFAULT '10.58.122.4',
    moisture_percent INT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_telemetry ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to prevent "already exists" errors on re-run
DROP POLICY IF EXISTS "Allow public read access to plants" ON public.plants;
DROP POLICY IF EXISTS "Allow public insert access to plants" ON public.plants;
DROP POLICY IF EXISTS "Allow public update access to plants" ON public.plants;

DROP POLICY IF EXISTS "Allow public read access to growth_logs" ON public.growth_logs;
DROP POLICY IF EXISTS "Allow public insert access to growth_logs" ON public.growth_logs;

DROP POLICY IF EXISTS "Allow public read access to iot_telemetry" ON public.iot_telemetry;
DROP POLICY IF EXISTS "Allow public insert access to iot_telemetry" ON public.iot_telemetry;

-- 6. Create Fresh RLS Access Policies
CREATE POLICY "Allow public read access to plants" ON public.plants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to plants" ON public.plants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to plants" ON public.plants FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to growth_logs" ON public.growth_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to growth_logs" ON public.growth_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to iot_telemetry" ON public.iot_telemetry FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to iot_telemetry" ON public.iot_telemetry FOR INSERT WITH CHECK (true);
