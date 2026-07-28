export interface Zone {
  id: string;
  name: string;
  state: string;
  boundaries: number[][][];
  active: boolean;
  zoneType: string;
  centerLat: number | null;
  centerLng: number | null;
  radiusMiles: number | null;
  color: string | null;
}

export interface ServiceType {
  id: string;
  name: string;
  slaHours: number;
  requiresSignature: boolean;
  requiresPhoto: boolean;
  active: boolean;
}
