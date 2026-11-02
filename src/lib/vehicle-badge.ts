export function getVehicleBadge(vehicle?: string | null): string {
  if (!vehicle) return "AUTO";
  const cleaned = vehicle
    .trim()
    .replace(/^(vinfast|lexus|toyota|mazda|ford|kia|hyundai|mercedes-benz|mercedes|bmw|porsche|audi|honda|mitsubishi|nissan|subaru|land rover|range rover)\s+/i, "")
    .trim();
  return cleaned || vehicle.trim() || "AUTO";
}
