/**
 * @fileOverview Serialization utilities for Firestore documents.
 * Converts complex Firestore types (like Timestamp) into plain JS types
 * that can be safely passed from Server Components to Client Components.
 */

export function serializeDoc(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(serializeDoc);
  }

  // Handle Firestore Timestamp object structure
  if (
    data.seconds !== undefined &&
    data.nanoseconds !== undefined
  ) {
    return new Date(data.seconds * 1000).toISOString();
  }

  // Handle objects that have a toDate() method (like Firebase Timestamp)
  if (typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  // Recursively handle nested objects
  const result: any = {};
  for (const key of Object.keys(data)) {
    result[key] = serializeDoc(data[key]);
  }
  return result;
}
