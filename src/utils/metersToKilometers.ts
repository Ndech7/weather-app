export function metersToKilometers(visibilityInMeters: number): string {
  const visibilityInKiometers = visibilityInMeters / 1000;
  return `${visibilityInKiometers.toFixed(0)}km`;
}
