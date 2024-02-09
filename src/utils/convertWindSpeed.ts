export function convertWindSpeed(windSpeedInMetersPerSecond: number): string {
  const windSpeedInKilometersPerHour = windSpeedInMetersPerSecond * 3.6;
  return `${windSpeedInKilometersPerHour.toFixed()}km/h`;
}
