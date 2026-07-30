/**
 * Nominatim Reverse Geocoding Service
 * Converts GPS coordinates to human-readable address string.
 * Uses OpenStreetMap Nominatim API (free, no key required).
 */

export interface NominatimResult {
  display_name: string;
  address: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'BioCampusAI/1.0 (campus plant mapping educational app)',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }

  const data: NominatimResult = await response.json();

  // Build a compact address string from structured data
  const { road, neighbourhood, suburb, city, state, country } = data.address;
  const parts = [road, neighbourhood || suburb, city, state, country].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : data.display_name;
}
