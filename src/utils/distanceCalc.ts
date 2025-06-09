import { getDistance } from "geolib";

export function calculateDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
): number {
  // Calcula a distância em metros
  const distanceInMeters = getDistance(
    { latitude: latitude1, longitude: longitude1 },
    { latitude: latitude2, longitude: longitude2 }
  );

  // Converte a distância para quilômetros
  const distanceInKilometers = distanceInMeters / 1000;

  return distanceInKilometers;
}
