import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidMobileNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
  // Relaxed Validation:
  // - Starts with "+" OR "0"
  // - 7 to 15 digits long
  // Covers: PH (0917...), Intl (+639...), Standard Intl (00...), Swiss/EU Local (041...)
  return /^(\+|0)\d{7,15}$/.test(cleanPhone);
}
