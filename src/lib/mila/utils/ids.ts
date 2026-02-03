import { v4 as uuidv4 } from "uuid";

/**
 * Generate a new UUID v4 identifier
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a short readable ID (for display purposes)
 * Format: XXXX-XXXX (8 chars)
 */
export function generateShortId(): string {
  return uuidv4().substring(0, 8).toUpperCase().replace(/(.{4})(.{4})/, "$1-$2");
}

/**
 * Generate a mock donor ID
 * Format: DON-XXXXXXXX
 */
export function generateDonorId(): string {
  return `DON-${uuidv4().substring(0, 8).toUpperCase()}`;
}

/**
 * Validate if a string is a valid UUID
 */
export function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Get current timestamp as ISO string
 */
export function now(): string {
  return new Date().toISOString();
}
