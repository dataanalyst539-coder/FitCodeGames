import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COLORS = {
  maroon: '#800000',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F3F4F6',
};

export const SPREADSHEET_ID = '1fnw6SxEoVuOXSU9c7hLVNSWNYDu606-OyEuNjtejWzE';

export interface Participant {
  name: string;
  level: 'Intermediate' | 'Advanced';
  gender: 'Male' | 'Female';
  ageGroup: string;
  completionTime: string;
  race: string;
  email: string;
  phone: string;
  tabName: string;
  // Optional fields
  arriveTime?: string;
  heatTime?: string;
  walkOutSong?: string;
  coach?: string;
  survey?: string;
  // Computed fields
  seconds: number;
  rankOverall?: number;
  rankDivision?: number;
  rankAgeGroup?: number;
}

export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return Infinity;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parseFloat(timeStr) || Infinity;
}

export function formatSecondsToTime(seconds: number): string {
  if (seconds === Infinity) return '--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
