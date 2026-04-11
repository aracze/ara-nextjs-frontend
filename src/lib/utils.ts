import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function getPayloadURL() {
  return (process.env.PAYLOAD_BASE_API_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}
