export interface ShiftOption {
  label: string;
  startHour: number;
  durationHours: number;
}

export function parseShiftOptions(shiftOptionsJson: string | null): ShiftOption[] {
  if (!shiftOptionsJson) return [];
  return JSON.parse(shiftOptionsJson) as ShiftOption[];
}

export function parsePhotos(photosJson: string): string[] {
  return JSON.parse(photosJson) as string[];
}

/** Espaços que disputam o mesmo dia entre si (Salão de Festa, Área Externa, Cozinha Gourmet). */
export const EXCLUSIVE_VENUE_BUFFER_HOURS = 4;
