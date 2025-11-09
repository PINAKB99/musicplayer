// runtime override (works even if build env is wrong)
const RUNTIME = (typeof window !== 'undefined' && window.__API__) || '';
const BUILD = (import.meta.env && import.meta.env.VITE_API_URL) || '';

const API = (RUNTIME || BUILD || '').replace(/\/+$/, '');

export async function getTracks() {
  console.log('API base =', API || '(empty)');
  const r = await fetch(`${API}/api/tracks`, { cache: 'no-store' });
  return r.json();
}

export function streamUrl(id) {
  return `${API}/api/stream/${id}`;
}
