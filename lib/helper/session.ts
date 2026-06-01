const SESSION_KEY = "session";

export interface SessionUser {
  id: string;
  username: string;
  full_name: string;
}

export interface Session {
  token: string;
  user: SessionUser;
}

// Decode JWT payload tanpa verify (client-side only)
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > (payload.exp as number);
}

export const getSession = (): Session | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (isTokenExpired(session.token)) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const setSession = (data: Session): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

export const clearSession = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
};

export const getSessionUser = (): SessionUser | null => {
  return getSession()?.user ?? null;
};

export const getSessionToken = (): string | null => {
  return getSession()?.token ?? null;
};

export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};
