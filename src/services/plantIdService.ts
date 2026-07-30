/**
 * Plant.id API v3 Service
 * Calls https://plant.id/api/v3/identification with a Base64 image payload.
 * Returns real plant species name, tree type/category, confidence, and health assessment.
 */

import { PlantIdResult } from '../types/plant';

function stripDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  return match ? match[1] : dataUrl;
}

// Map scientific/common names to broad tree types
function inferTreeType(name: string, scientificName: string): string {
  const n = (name + ' ' + scientificName).toLowerCase();
  if (n.includes('ficus') || n.includes('banyan') || n.includes('peepal')) return 'Broadleaf Evergreen Tree';
  if (n.includes('azadirachta') || n.includes('neem')) return 'Medicinal Evergreen Tree';
  if (n.includes('delonix') || n.includes('gulmohar')) return 'Flowering Deciduous Tree';
  if (n.includes('bambusa') || n.includes('bamboo')) return 'Giant Grass / Bamboo Specimen';
  if (n.includes('pinus') || n.includes('pine') || n.includes('cedar')) return 'Conifer Evergreen Tree';
  if (n.includes('palm') || n.includes('phoenix')) return 'Palmae Tree';
  if (n.includes('mangifera') || n.includes('mango')) return 'Fruit-Bearing Hardwood Tree';
  if (n.includes('rose') || n.includes('shrub') || n.includes('hibiscus')) return 'Flowering Shrub';
  return 'Campus Hardwood Tree';
}

export async function identifyPlant(
  base64DataUrl: string,
  lat: number,
  lng: number,
  apiKey: string
): Promise<PlantIdResult> {
  const rawBase64 = stripDataUrl(base64DataUrl);

  const payload = {
    images: [rawBase64],
    latitude: lat,
    longitude: lng,
    similar_images: false,
    health: 'all',
  };

  const response = await fetch('https://plant.id/api/v3/identification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Plant.id API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();

  const suggestions = data?.result?.classification?.suggestions ?? [];
  const topMatch = suggestions[0] ?? null;

  if (!topMatch) {
    throw new Error('No plant identified. Try a clearer image of leaves, flowers, or bark.');
  }

  const commonName: string =
    topMatch.details?.common_names?.[0] ??
    topMatch.name ??
    'Unknown Plant';

  const scientificName: string = topMatch.name ?? 'Unknown';
  const confidence: number = parseFloat((topMatch.probability ?? 0).toFixed(4));
  const treeType = inferTreeType(commonName, scientificName);

  const healthAssessment = data?.result?.disease?.suggestions ?? [];
  const isHealthy: boolean = data?.result?.is_healthy?.binary ?? true;
  const diseases: string[] = healthAssessment
    .filter((d: { probability: number }) => d.probability > 0.1)
    .map((d: { name: string }) => d.name as string)
    .slice(0, 3);

  return {
    commonName,
    scientificName,
    treeType,
    confidence,
    isHealthy,
    diseases,
  };
}
