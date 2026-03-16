import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne les classes CSS Tailwind de manière intelligente
 * en évitant les conflits (ex: 'p-4 p-8' devient 'p-8').
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
