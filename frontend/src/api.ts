let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;
export function clearToken() {
  accessToken = null;
}
async function renew(): Promise<boolean> {
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-Requested-With': 'arrowstack-web' },
  });
  if (!response.ok) {
    accessToken = null;
    return false;
  }
  const body = await response.json();
  accessToken = body.data.accessToken;
  return true;
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('X-Requested-With', 'arrowstack-web');
  if (options.body) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch('/api/v1' + path, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    refreshInFlight ??= renew().finally(() => {
      refreshInFlight = null;
    });
    if (await refreshInFlight) return api<T>(path, options, false);
  }
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? 'Request failed');
  if (body?.data?.accessToken) accessToken = body.data.accessToken;
  return body?.data as T;
}
