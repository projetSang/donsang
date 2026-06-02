import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // NOSONAR
    .replace(/\s+/g, "-") // NOSONAR
    .replace(/[^\w-]+/g, "") // NOSONAR
    .replace(/-{2,}/g, "-") // NOSONAR
    .replace(/^-+|-+$/g, ""); // NOSONAR
}

