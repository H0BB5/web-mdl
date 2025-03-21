import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function base64UrlEncode(buffer: Buffer) {
  return (
    buffer
      .toString('base64')
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replace(/=+$/, '')
  );
}