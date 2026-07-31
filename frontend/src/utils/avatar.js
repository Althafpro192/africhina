/**
 * Shared avatar URL helper.
 *
 * Backend stores avatars in MySQL as BLOBs. This helper constructs data URLs
 * directly from avatar_data (base64) and avatar_mime_type to avoid extra API calls.
 *
 * DO NOT prepend `localhost:5000` (or any other hard-coded port) — that breaks
 * production because the backend port is *not* exposed to the host.
 *
 * @param {string|null} url - avatar_url value coming from the API (fallback/legacy).
 * @param {string} [name] - user display name, used for the fallback avatar.
 * @param {number|string} [userId] - user ID, used for database-stored avatars (fallback).
 * @param {string|null} [avatarData] - base64 encoded avatar data from API.
 * @param {string|null} [mimeType] - avatar MIME type (e.g., 'image/jpeg').
 * @returns {string} Absolute or relative URL safe to assign to `<img src>`.
 */
export function getAvatarUrl(url, name, userId, avatarData, mimeType) {
  // If avatar_data is provided, construct data URL directly
  if (avatarData && mimeType) {
    return `data:${mimeType};base64,${avatarData}`
  }

  // Fallback to UI Avatars if no image data in MySQL
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff`
}
