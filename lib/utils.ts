import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function getConvexSiteUrl() {
  return process.env.EXPO_PUBLIC_CONVEX_URL?.replace(/\.cloud$/, '.site');
}
