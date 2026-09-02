/**
 * API client — fetches from VYOMA backend.
 * Base URL comes from VITE_API_URL env variable (never hardcoded).
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function apiFetch(path, init) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
