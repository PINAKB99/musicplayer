const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function getTracks() {
  const r = await fetch(`${API}/api/tracks`);
  return r.json();
}
export function streamUrl(id) {
  return `${API}/api/stream/${id}`;
}
