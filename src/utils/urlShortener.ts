
/**
 * Simple URL shortener utility that creates shorter identifiers
 */

// Function to convert a string to a shorter hash
export const shortenId = (id: string): string => {
  // Use first 6 characters as a simple shortening mechanism
  return id.substring(0, 6);
};

// Function to generate a shortened URL for sharing
export const generateShortUrl = (peerId: string): string => {
  const baseUrl = window.location.origin;
  const shortId = shortenId(peerId);
  return `${baseUrl}/r/${shortId}`;
};

// Map to store the relationship between short IDs and full IDs
const idMap = new Map<string, string>();

// Function to store a mapping between short ID and full ID
export const storeIdMapping = (fullId: string): string => {
  const shortId = shortenId(fullId);
  idMap.set(shortId, fullId);
  return shortId;
};

// Function to retrieve full ID from short ID
export const getFullId = (shortId: string): string | undefined => {
  return idMap.get(shortId);
};
