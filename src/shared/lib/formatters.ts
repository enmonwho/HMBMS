export function formatVolume(volume_ml: number): string {
  if (volume_ml == null) return '0 mL';
  if (volume_ml >= 1000) {
    return `${(volume_ml / 1000).toFixed(1)} L`;
  }
  return `${Math.round(volume_ml)} mL`;
}
